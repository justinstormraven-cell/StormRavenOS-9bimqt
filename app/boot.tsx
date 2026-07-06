// Powered by OnSpace.AI — StormRaven YMIR Boot Sequence v2
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { GlowText } from '../components/ui/GlowText';
import {
  readLockdownState,
  loadBootOptions,
  saveBootOptions,
  saveBootSession,
  buildBootSession,
  DEFAULT_BOOT_OPTIONS,
  BootOptions,
  BootModuleResult,
} from '../services/bootHistoryService';

const { width } = Dimensions.get('window');

const KERNEL_VERSION = '6.6.21-ymir-hardened';

// ─── Sequence Definitions ─────────────────────────────────────────────────────

interface BootLine {
  text: string;
  color: string;
  delay: number;
  instant?: boolean;
}

function buildNormalSequence(): BootLine[] {
  return [
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[†] INITIATING YMIR PRIMORDIAL KERNEL FORGE SEQUENCE...', color: Colors.amethyst, delay: 100 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 80, instant: true },
    { text: ' PHASE I › PREREQUISITE PROVISIONING', color: Colors.cyan, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: '[*] Updating package manifests...', color: Colors.textSecondary, delay: 200 },
    { text: '[*] Installing build-essential gcc libssl-dev libelf-dev...', color: Colors.textSecondary, delay: 400 },
    { text: '[+] Compilation toolchain ready.', color: Colors.statusOnline, delay: 300 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: ' PHASE II › HARDENED CONFIG MATRIX SYNTHESIS', color: Colors.cyan, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: '[*] Applying KSPP directives (CONFIG_KASLR, CONFIG_SECCOMP)...', color: Colors.textSecondary, delay: 350 },
    { text: '[*] Injecting AES-NI, ChaCha20-Poly1305, SHA-512 (built-in)...', color: Colors.textSecondary, delay: 420 },
    { text: '[*] Enforcing CONFIG_MODULE_SIG_FORCE, CONFIG_STRICT_KERNEL_RWX...', color: Colors.textSecondary, delay: 380 },
    { text: '[+] Kernel config blueprint generated: /etc/stormraven/ymir_kernel.config', color: Colors.statusOnline, delay: 280 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: ' PHASE III › RUNTIME SYSCTL TUNING', color: Colors.cyan, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: '[*] Compiling Heimdall sysctl security policies...', color: Colors.textSecondary, delay: 300 },
    { text: '[*] randomize_va_space=2  yama.ptrace_scope=3  kptr_restrict=2', color: Colors.textMuted, delay: 260 },
    { text: '[*] tcp_syncookies=1  accept_redirects=0  tcp_timestamps=0', color: Colors.textMuted, delay: 240 },
    { text: '[+] Sysctl policies locked: /etc/sysctl.d/99-ymir-hardening.conf', color: Colors.statusOnline, delay: 260 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: ' PHASE IV › COMPILATION ENGINE SETUP', color: Colors.cyan, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: '[*] Sourcing Linux LTS v6.6.21 kernel source...', color: Colors.textSecondary, delay: 360 },
    { text: '[*] Merging Ymir specifications into defconfig template...', color: Colors.textSecondary, delay: 440 },
    { text: '[*] make olddefconfig — reconciling options...', color: Colors.textSecondary, delay: 400 },
    { text: '[+] Kernel .config validated — 16 hardened flags confirmed (=y).', color: Colors.statusOnline, delay: 300 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: ' PHASE V › FINAL CLEANUP & COMPACTING', color: Colors.cyan, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.border, delay: 60, instant: true },
    { text: '[*] Sanitizing residual build artifacts...', color: Colors.textSecondary, delay: 300 },
    { text: '[*] Sealing cryptographic module signatures (Ed25519)...', color: Colors.textSecondary, delay: 380 },
    { text: '[*] Mounting volatile RAM-resident root (Midgard initramfs)...', color: Colors.textSecondary, delay: 340 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[√] YMIR PRIMORDIAL KERNEL FORGE SEQUENCE COMPLETE.', color: Colors.amethyst, delay: 400 },
    { text: '[*] Hardened Kernel Profile  →  /etc/stormraven/ymir_kernel.config', color: Colors.textSecondary, delay: 180 },
    { text: '[*] Sysctl Active Defense Guard  →  Imposed and locked.', color: Colors.textSecondary, delay: 180 },
    { text: '[*] Environment Status  →  SEALED & READY.', color: Colors.statusOnline, delay: 180 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '  Bootstrapping StormRaven OS Iteration III...', color: Colors.amethyst, delay: 500 },
  ];
}

function buildLockdownSequence(): BootLine[] {
  return [
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[!] EMERGENCY ISOLATION MODE DETECTED', color: Colors.coral, delay: 100 },
    { text: '[!] Lockdown state persisted from previous session', color: Colors.coral, delay: 200 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '──────────────────────────────────────────', color: Colors.coralDim, delay: 60, instant: true },
    { text: ' EMERGENCY BOOT › ISOLATION PROTOCOL', color: Colors.coral, delay: 120 },
    { text: '──────────────────────────────────────────', color: Colors.coralDim, delay: 60, instant: true },
    { text: '[*] Engaging Jörmungandr quarantine protocol...', color: Colors.textCoral, delay: 300 },
    { text: '[*] Flushing all network interfaces via IPtables...', color: Colors.textCoral, delay: 380 },
    { text: '[!] Network isolation CONFIRMED — all routes blocked', color: Colors.coral, delay: 280 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[*] Loading Loki vault — AES-256-Fernet envelope SEALED', color: Colors.textCoral, delay: 340 },
    { text: '[*] Ginnungagap sentinel — integrity watch ACTIVE', color: Colors.textCoral, delay: 280 },
    { text: '[*] Demogorgon tarpit — standing by on port 2222', color: Colors.textCoral, delay: 300 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[!] SKIPPING NORMAL MODULE LOAD — ISOLATION MODE', color: Colors.coral, delay: 200 },
    { text: '', color: Colors.textMuted, delay: 0, instant: true },
    { text: '[√] Emergency isolation boot complete.', color: Colors.statusWarning, delay: 400 },
    { text: '[*] Routing to lockdown wall...', color: Colors.textCoral, delay: 300 },
  ];
}

const MODULE_PHASES = [
  { label: 'HEIMDALL',    pct: 10  },
  { label: 'LOKI',        pct: 20  },
  { label: 'GINNUNGAGAP', pct: 30  },
  { label: 'ODIN',        pct: 42  },
  { label: 'LEVIATHAN',   pct: 53  },
  { label: 'SLEIPNIR',    pct: 64  },
  { label: 'DEMOGORGON',  pct: 75  },
  { label: 'THOR',        pct: 82  },
  { label: 'MJOLNIR',     pct: 88  },
  { label: 'FENRIR',      pct: 94  },
  { label: 'JORMUNGANDR', pct: 100 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTimings(lines: BootLine[]): number[] {
  const times: number[] = [];
  let cursor = 600;
  for (const line of lines) {
    times.push(cursor);
    const typingTime = line.instant ? 0 : line.text.length * 18;
    cursor += line.delay + typingTime;
  }
  return times;
}

function lineColor(text: string, isLockdownMode: boolean): string {
  if (isLockdownMode) {
    if (text.startsWith('[!]'))                              return Colors.coral;
    if (text.startsWith('[√]'))                             return Colors.statusWarning;
    if (text.startsWith('[*]'))                             return Colors.textCoral;
    if (text.startsWith(' EMERGENCY'))                      return Colors.coral;
    if (text.startsWith('──'))                              return Colors.coralDim;
    return Colors.coralDim;
  }
  if (text.startsWith('[√]') || text.startsWith('[+]'))    return Colors.statusOnline;
  if (text.startsWith('[!]') || text.startsWith('[ERROR]')) return Colors.coral;
  if (text.startsWith('[†]'))                               return Colors.amethyst;
  if (text.startsWith('[*]'))                               return Colors.textSecondary;
  if (text.startsWith(' PHASE'))                            return Colors.cyan;
  if (text.startsWith('──'))                                return Colors.border;
  if (text.includes('Bootstrapping'))                       return Colors.amethyst;
  return Colors.textMuted;
}

// ─── Boot Options Overlay ─────────────────────────────────────────────────────

interface BootOptionsOverlayProps {
  opts: BootOptions;
  countdown: number;
  onToggle: (key: keyof BootOptions) => void;
  onApply: () => void;
  onSkip: () => void;
}

const FLAG_META: { key: keyof BootOptions; label: string; sysctl: string; desc: string }[] = [
  { key: 'kaslr',           label: 'KASLR',           sysctl: 'kernel.randomize_va_space=2',  desc: 'Randomize kernel memory layout against ROP chains' },
  { key: 'modules_disabled', label: 'LOCK MODULES',   sysctl: 'kernel.modules_disabled=1',    desc: 'Disable further module loading post-boot' },
  { key: 'tcp_syncookies',  label: 'SYN COOKIES',     sysctl: 'net.ipv4.tcp_syncookies=1',    desc: 'SYN flood protection via cryptographic cookies' },
  { key: 'dmesg_restrict',  label: 'DMESG RESTRICT',  sysctl: 'kernel.dmesg_restrict=1',      desc: 'Restrict kernel ring buffer to root only' },
];

const BootOptionsOverlay = React.memo(function BootOptionsOverlay({
  opts, countdown, onToggle, onApply, onSkip,
}: BootOptionsOverlayProps) {
  return (
    <View style={overlayStyles.backdrop}>
      <View style={overlayStyles.panel}>
        {/* Header */}
        <View style={overlayStyles.header}>
          <MaterialIcons name="settings" size={18} color={Colors.amethyst} />
          <GlowText color={Colors.amethyst} size={Typography.sizes.sm} weight="700" style={overlayStyles.title}>
            BOOT OPTIONS
          </GlowText>
          <View style={overlayStyles.countdownBadge}>
            <GlowText color={Colors.statusWarning} size={Typography.sizes.sm} weight="700">
              {countdown}s
            </GlowText>
          </View>
        </View>
        <GlowText color={Colors.textMuted} size={9} style={overlayStyles.hint}>
          Tap flags to toggle. Auto-proceeds in {countdown}s.
        </GlowText>

        {/* ptrace_scope special slider */}
        <View style={overlayStyles.flagRow}>
          <View style={overlayStyles.flagLeft}>
            <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600">PTRACE SCOPE</GlowText>
            <GlowText color={Colors.textMuted} size={9}>yama.ptrace_scope={opts.ptrace_scope}</GlowText>
            <GlowText color={Colors.textMuted} size={8} style={overlayStyles.flagDesc}>
              Inter-process debug attach restriction level
            </GlowText>
          </View>
          <View style={overlayStyles.ptraceButtons}>
            {[0, 1, 2, 3].map(v => (
              <Pressable
                key={v}
                style={[overlayStyles.ptraceBtn, opts.ptrace_scope === v && overlayStyles.ptraceBtnActive]}
                onPress={() => onToggle('ptrace_scope' as keyof BootOptions)}
              >
                <GlowText
                  color={opts.ptrace_scope === v ? Colors.matteBlack : Colors.textMuted}
                  size={9}
                  weight="700"
                >
                  {v}
                </GlowText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Toggle flags */}
        {FLAG_META.map(flag => {
          const val = opts[flag.key];
          const enabled = typeof val === 'boolean' ? val : false;
          return (
            <View key={flag.key} style={overlayStyles.flagRow}>
              <View style={overlayStyles.flagLeft}>
                <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600">{flag.label}</GlowText>
                <GlowText color={Colors.amethyst} size={9}>{flag.sysctl}</GlowText>
                <GlowText color={Colors.textMuted} size={8} style={overlayStyles.flagDesc}>{flag.desc}</GlowText>
              </View>
              <Switch
                value={enabled}
                onValueChange={() => onToggle(flag.key)}
                trackColor={{ false: Colors.border, true: Colors.amethyst + '66' }}
                thumbColor={enabled ? Colors.amethyst : Colors.textMuted}
              />
            </View>
          );
        })}

        {/* Actions */}
        <View style={overlayStyles.actions}>
          <Pressable
            style={({ pressed }) => [overlayStyles.skipBtn, pressed && { opacity: 0.7 }]}
            onPress={onSkip}
          >
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600">SKIP</GlowText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [overlayStyles.applyBtn, pressed && { opacity: 0.85 }]}
            onPress={onApply}
          >
            <MaterialIcons name="play-arrow" size={16} color={Colors.matteBlack} />
            <GlowText color={Colors.matteBlack} size={Typography.sizes.xs} weight="700">APPLY & BOOT</GlowText>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BootScreen() {
  const [ready, setReady] = useState(false);
  const [isLockdownMode, setIsLockdownMode] = useState(false);
  const [bootOpts, setBootOpts] = useState<BootOptions>(DEFAULT_BOOT_OPTIONS);

  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [currentLineIdx, setCurrentLineIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [moduleLabel, setModuleLabel] = useState('YMIR CORE');
  const [done, setDone] = useState(false);

  // Boot Options overlay state
  const [showOptions, setShowOptions] = useState(false);
  const [optionsCountdown, setOptionsCountdown] = useState(3);
  const [optionsApplied, setOptionsApplied] = useState(false);
  const [appliedLines, setAppliedLines] = useState<string[]>([]);

  const fadeOut = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const headerPulse = useRef(new Animated.Value(0.6)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const moduleResultsRef = useRef<BootModuleResult[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Init: read lockdown + boot options ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [lockdown, opts] = await Promise.all([readLockdownState(), loadBootOptions()]);
      setIsLockdownMode(lockdown);
      setBootOpts(opts);
      setReady(true);
    })();
  }, []);

  // Header pulse loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerPulse, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(headerPulse, { toValue: 0.6, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  const animateProgress = useCallback((toValue: number) => {
    Animated.timing(progressAnim, {
      toValue: (toValue / 100) * (width - Spacing.base * 2 - 2),
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // ── Navigate away + save history ────────────────────────────────────────────
  const navigateAway = useCallback(async (toLockdownWall: boolean, opts: BootOptions) => {
    const session = buildBootSession(
      startTimeRef.current,
      toLockdownWall ? 'lockdown' : 'normal',
      moduleResultsRef.current,
      opts,
    );
    await saveBootSession(session);

    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 600,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (toLockdownWall) {
        router.replace('/lockdown-wall');
      } else {
        router.replace('/(tabs)');
      }
    });
  }, []);

  // ── Show Boot Options overlay after Phase V ──────────────────────────────────
  const showBootOptions = useCallback(() => {
    setShowOptions(true);
    Animated.timing(overlayFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    let count = 3;
    setOptionsCountdown(3);
    const interval = setInterval(() => {
      count--;
      setOptionsCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        handleSkipOptions();
      }
    }, 1000);
    timeoutsRef.current.push(interval as any);
  }, []);

  const handleToggleOption = useCallback((key: keyof BootOptions) => {
    setBootOpts(prev => {
      if (key === 'ptrace_scope') {
        const next = ((prev.ptrace_scope as number) + 1) % 4;
        return { ...prev, ptrace_scope: next };
      }
      return { ...prev, [key]: !prev[key] };
    });
  }, []);

  const handleApplyOptions = useCallback(() => {
    setShowOptions(false);
    setOptionsApplied(true);
    Animated.timing(overlayFade, { toValue: 0, duration: 200, useNativeDriver: true }).start();

    // Animate sysctl lines into terminal
    const sysctlLines: string[] = [
      '',
      '  Boot Options Applied:',
      `  sysctl kernel.randomize_va_space=${bootOpts.kaslr ? 2 : 0}`,
      `  sysctl kernel.yama.ptrace_scope=${bootOpts.ptrace_scope}`,
      `  sysctl kernel.modules_disabled=${bootOpts.modules_disabled ? 1 : 0}`,
      `  sysctl net.ipv4.tcp_syncookies=${bootOpts.tcp_syncookies ? 1 : 0}`,
      `  sysctl kernel.dmesg_restrict=${bootOpts.dmesg_restrict ? 1 : 0}`,
      '',
      '[√] All parameters applied. Proceeding to dashboard...',
    ];
    sysctlLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setAppliedLines(prev => [...prev, line]);
        if (i === sysctlLines.length - 1) {
          const t2 = setTimeout(() => navigateAway(false, bootOpts), 800);
          timeoutsRef.current.push(t2);
        }
      }, i * 160);
      timeoutsRef.current.push(t);
    });

    saveBootOptions(bootOpts);
  }, [bootOpts, navigateAway]);

  const handleSkipOptions = useCallback(() => {
    setShowOptions(false);
    Animated.timing(overlayFade, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    const t = setTimeout(() => navigateAway(false, bootOpts), 500);
    timeoutsRef.current.push(t);
  }, [bootOpts, navigateAway]);

  // ── Main boot sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    startTimeRef.current = Date.now();
    const SEQUENCE = isLockdownMode ? buildLockdownSequence() : buildNormalSequence();
    const timings = buildTimings(SEQUENCE);

    // Seed module results
    moduleResultsRef.current = MODULE_PHASES.map(p => ({
      label: p.label,
      loaded: !isLockdownMode,
      durationMs: 0,
    }));

    SEQUENCE.forEach((line, idx) => {
      const t = timings[idx];
      if (line.instant || line.text === '') {
        const to = setTimeout(() => setVisibleLines(prev => [...prev, line.text]), t);
        timeoutsRef.current.push(to);
        return;
      }
      const to = setTimeout(() => {
        setCurrentLineIdx(idx);
        let charIdx = 0;
        const typeChar = () => {
          charIdx++;
          setCurrentTyping(line.text.slice(0, charIdx));
          if (charIdx < line.text.length) {
            const inner = setTimeout(typeChar, 18);
            timeoutsRef.current.push(inner);
          } else {
            setVisibleLines(prev => [...prev, line.text]);
            setCurrentTyping('');
            setCurrentLineIdx(-1);
          }
        };
        typeChar();
      }, t);
      timeoutsRef.current.push(to);
    });

    const totalDuration = timings[timings.length - 1] + 600;

    if (!isLockdownMode) {
      // Progress bar phases
      MODULE_PHASES.forEach((phase, i) => {
        const phaseT = (totalDuration * (i + 1)) / (MODULE_PHASES.length + 2);
        const to = setTimeout(() => {
          setProgress(phase.pct);
          setModuleLabel(phase.label);
          animateProgress(phase.pct);
          moduleResultsRef.current[i] = { ...moduleResultsRef.current[i], loaded: true, durationMs: Date.now() - startTimeRef.current };
        }, phaseT);
        timeoutsRef.current.push(to);
      });

      // After sequence: show boot options for 3 seconds
      const to = setTimeout(() => {
        setProgress(100);
        animateProgress(100);
        setModuleLabel('ALL MODULES LOADED');
        setDone(true);
        showBootOptions();
      }, totalDuration + 200);
      timeoutsRef.current.push(to);
    } else {
      // Lockdown mode — skip modules, go straight to lockdown wall
      const to = setTimeout(() => {
        setDone(true);
        navigateAway(true, bootOpts);
      }, totalDuration + 600);
      timeoutsRef.current.push(to);
    }

    return () => clearAllTimeouts();
  }, [ready, isLockdownMode]);

  if (!ready) return null;

  const headerBg = isLockdownMode ? '#07000a' : Colors.charcoal;
  const headerAccent = isLockdownMode ? Colors.coral : Colors.amethyst;
  const headerBorder = isLockdownMode ? Colors.coralDim + '55' : Colors.border;

  return (
    <Animated.View style={[styles.root, { opacity: fadeOut, backgroundColor: isLockdownMode ? '#07000a' : Colors.matteBlack }]}>
      <StatusBar style="light" backgroundColor={isLockdownMode ? '#07000a' : Colors.matteBlack} />

      {/* Header strip */}
      <View style={[styles.topBar, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <Animated.View style={[styles.topBarGlow, { backgroundColor: headerAccent, opacity: headerPulse }]} />
        {isLockdownMode && (
          <View style={styles.emergencyBadge}>
            <MaterialIcons name="warning" size={10} color={Colors.coral} />
            <GlowText color={Colors.coral} size={8} weight="700" style={styles.emergencyBadgeText}>
              EMERGENCY
            </GlowText>
          </View>
        )}
        <GlowText color={headerAccent} size={Typography.sizes.xs} weight="700" style={styles.topBarLabel}>
          {isLockdownMode ? 'EMERGENCY ISOLATION MODE' : 'STORMRAVEN OS'}
        </GlowText>
        <View style={styles.topBarDot}>
          <Animated.View style={[styles.pulseDot, { opacity: headerPulse, backgroundColor: isLockdownMode ? Colors.coral : Colors.statusOnline }]} />
        </View>
        <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.topBarVersion}>
          {`Kernel: ${KERNEL_VERSION}`}
        </GlowText>
      </View>

      {/* Scrolling terminal output */}
      <Animated.ScrollView
        ref={scrollRef}
        style={[styles.scroll, { backgroundColor: isLockdownMode ? '#07000a' : Colors.obsidian }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {visibleLines.map((text, i) => (
          <BootLineRow key={i} text={text} color={lineColor(text, isLockdownMode)} />
        ))}
        {currentLineIdx >= 0 && currentTyping !== '' && (
          <BootLineRow
            text={currentTyping + '_'}
            color={lineColor(SEQUENCE_PLACEHOLDER, isLockdownMode)}
          />
        )}
        {/* Applied sysctl lines */}
        {appliedLines.map((text, i) => (
          <BootLineRow key={`applied-${i}`} text={text} color={
            text.startsWith('[√]') ? Colors.statusOnline :
            text.startsWith('  sysctl') ? Colors.cyan :
            text.startsWith('  Boot') ? Colors.amethyst :
            Colors.textMuted
          } />
        ))}
      </Animated.ScrollView>

      {/* Module Load Progress (only in normal mode) */}
      {!isLockdownMode && (
        <View style={styles.progressPanel}>
          <View style={styles.progressHeader}>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600" style={styles.progressTitle}>
              MODULE LOAD
            </GlowText>
            <GlowText color={done ? Colors.statusOnline : Colors.textCyan} size={Typography.sizes.xs} weight="700">
              {`${progress}%`}
            </GlowText>
          </View>
          <View style={styles.trackWrap}>
            <View style={styles.track}>
              <Animated.View style={[styles.trackFill, { width: progressAnim, backgroundColor: done ? Colors.statusOnline : Colors.amethyst }]} />
              <Animated.View style={[styles.trackTip, { left: progressAnim, backgroundColor: done ? Colors.statusOnline : Colors.amethyst }]} />
            </View>
          </View>
          <View style={styles.moduleRow}>
            <View style={[styles.moduleDot, { backgroundColor: done ? Colors.statusOnline : Colors.cyan }]} />
            <GlowText color={done ? Colors.statusOnline : Colors.textCyan} size={Typography.sizes.xs} weight="600" style={styles.moduleLabel}>
              {moduleLabel}
            </GlowText>
          </View>
          <View style={styles.moduleDots}>
            {MODULE_PHASES.map(p => (
              <View
                key={p.label}
                style={[
                  styles.modDot,
                  progress >= p.pct
                    ? { backgroundColor: done ? Colors.statusOnline : Colors.amethyst }
                    : { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
                ]}
              />
            ))}
          </View>
          <GlowText color={Colors.textMuted} size={8} style={styles.sig}>
            YMIR PRIMORDIAL KERNEL FORGE — StormRaven OS Iteration III
          </GlowText>
        </View>
      )}

      {/* Boot Options Overlay */}
      {showOptions && (
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: overlayFade }]} pointerEvents="box-none">
          <BootOptionsOverlay
            opts={bootOpts}
            countdown={optionsCountdown}
            onToggle={handleToggleOption}
            onApply={handleApplyOptions}
            onSkip={handleSkipOptions}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Placeholder for typing color resolution (not actual sequence reference)
const SEQUENCE_PLACEHOLDER = '[*]';

// ─── Sub-component ────────────────────────────────────────────────────────────

const BootLineRow = React.memo(function BootLineRow({ text, color }: { text: string; color: string }) {
  if (text === '') return <View style={{ height: 6 }} />;
  return (
    <View style={styles.lineRow}>
      <GlowText color={color} size={Typography.sizes.xs} style={styles.lineText}>{text}</GlowText>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  topBarGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  topBarLabel: { letterSpacing: 1.5 },
  topBarDot: { width: 8, height: 8, justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  topBarVersion: { flex: 1, textAlign: 'right', letterSpacing: 0.5 },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.coral + '22',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.coral + '55',
  },
  emergencyBadgeText: { letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, paddingBottom: 24 },
  lineRow: { paddingVertical: 1 },
  lineText: { lineHeight: 17, letterSpacing: 0.15 },
  progressPanel: {
    backgroundColor: Colors.charcoal,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { letterSpacing: 2 },
  trackWrap: { height: 6, position: 'relative' },
  track: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  trackTip: { position: 'absolute', top: -2, width: 10, height: 10, borderRadius: 5, marginLeft: -5, opacity: 0.9 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  moduleDot: { width: 5, height: 5, borderRadius: 3 },
  moduleLabel: { letterSpacing: 1.5 },
  moduleDots: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  modDot: { width: 8, height: 8, borderRadius: 4 },
  sig: { letterSpacing: 0.8, textAlign: 'center', marginTop: 4 },
});

const overlayStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.92)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: Colors.charcoal,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.amethyst + '55',
    padding: Spacing.base,
    paddingBottom: Spacing.section,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { flex: 1, letterSpacing: 2 },
  countdownBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.statusWarning,
    backgroundColor: Colors.statusWarning + '15',
  },
  hint: { letterSpacing: 0.3, marginTop: -4 },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  flagLeft: { flex: 1, gap: 3 },
  flagDesc: { lineHeight: 13, letterSpacing: 0.2, marginTop: 2 },
  ptraceButtons: { flexDirection: 'row', gap: 5 },
  ptraceBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ptraceBtnActive: {
    backgroundColor: Colors.amethyst,
    borderColor: Colors.amethyst,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.amethyst,
  },
});
