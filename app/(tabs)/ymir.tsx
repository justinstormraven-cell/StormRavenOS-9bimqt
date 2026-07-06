// Powered by OnSpace.AI — StormRaven YMIR Kernel Spec
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { GlowText } from '../../components/ui/GlowText';
import {
  YMIR_VERSION,
  YMIR_TARGET_ARCH,
  YMIR_COMPAT,
  YMIR_ARCH_PRINCIPLES,
  YMIR_KSPP_CONFIG,
  YMIR_SYSCTL,
  YMIR_NET_CAPABILITIES,
  KernelConfigEntry,
  SysctlEntry,
  ArchPrinciple,
  NetworkCapability,
} from '../../constants/mockData';
import {
  loadBootHistory,
  clearBootHistory,
  formatDuration,
  BootSession,
} from '../../services/bootHistoryService';

type SectionKey = 'arch' | 'kspp' | 'network' | 'sysctl' | 'history';

const CATEGORY_COLORS: Record<string, string> = {
  memory:    Colors.amethyst,
  network:   Colors.cyan,
  execution: Colors.statusWarning,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionToggle = React.memo(function SectionToggle({
  label, icon, expanded, onToggle, accent,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  expanded: boolean;
  onToggle: () => void;
  accent: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.sectionToggle,
        { borderColor: expanded ? accent + '66' : Colors.border },
        expanded && { backgroundColor: accent + '0d' },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onToggle}
    >
      <View style={[styles.sectionIconWrap, { backgroundColor: accent + '1a' }]}>
        <MaterialIcons name={icon} size={16} color={accent} />
      </View>
      <GlowText color={expanded ? accent : Colors.textSecondary} size={Typography.sizes.sm} weight="600" style={styles.sectionToggleLabel}>
        {label}
      </GlowText>
      <MaterialIcons name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={expanded ? accent : Colors.textMuted} />
    </Pressable>
  );
});

const PrincipleCard = React.memo(function PrincipleCard({ principle }: { principle: ArchPrinciple }) {
  return (
    <View style={styles.principleCard}>
      <View style={styles.principleHeader}>
        <View style={styles.principleTagWrap}>
          <GlowText color={Colors.matteBlack} size={Typography.sizes.xs} weight="700">{principle.tag}</GlowText>
        </View>
        <GlowText color={Colors.amethyst} size={Typography.sizes.sm} weight="600" style={styles.principleTitle}>{principle.title}</GlowText>
      </View>
      {principle.body.map((line, i) => (
        <View key={i} style={styles.principleBodyRow}>
          <GlowText color={Colors.amethyst} size={Typography.sizes.xs} style={styles.bulletChar}>{'▸'}</GlowText>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.principleBodyText}>{line}</GlowText>
        </View>
      ))}
    </View>
  );
});

const KsppRow = React.memo(function KsppRow({ entry, index }: { entry: KernelConfigEntry; index: number }) {
  return (
    <View style={[styles.ksppRow, index % 2 === 0 && styles.ksppRowAlt]}>
      <View style={styles.ksppLeft}>
        <GlowText color={Colors.textCyan} size={9} weight="600" numberOfLines={1}>{entry.option}</GlowText>
        <GlowText color={Colors.textMuted} size={9} style={styles.ksppMitigation} numberOfLines={2}>{entry.mitigation}</GlowText>
      </View>
      <View style={styles.ksppValueWrap}>
        <GlowText color={Colors.statusOnline} size={Typography.sizes.xs} weight="700">{entry.value}</GlowText>
      </View>
    </View>
  );
});

const SysctlRow = React.memo(function SysctlRow({ entry }: { entry: SysctlEntry }) {
  const catColor = CATEGORY_COLORS[entry.category] || Colors.textSecondary;
  return (
    <View style={styles.sysctlRow}>
      <View style={styles.sysctlTop}>
        <GlowText color={Colors.textCyan} size={9} weight="600" style={styles.sysctlKey} numberOfLines={1}>{entry.key}</GlowText>
        <View style={[styles.sysctlCatBadge, { borderColor: catColor + '55', backgroundColor: catColor + '15' }]}>
          <GlowText color={catColor} size={8} weight="600">{entry.category.toUpperCase()}</GlowText>
        </View>
        <View style={styles.sysctlValueWrap}>
          <GlowText color={Colors.statusOnline} size={Typography.sizes.xs} weight="700">{entry.value}</GlowText>
        </View>
      </View>
      <GlowText color={Colors.textMuted} size={9} style={styles.sysctlDesc}>{entry.description}</GlowText>
    </View>
  );
});

const NetCapRow = React.memo(function NetCapRow({ cap }: { cap: NetworkCapability }) {
  return (
    <View style={styles.netCapCard}>
      <View style={styles.netCapHeader}>
        <View style={styles.netCapDot} />
        <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600">{cap.name}</GlowText>
      </View>
      <GlowText color={Colors.amethyst} size={9} style={styles.netCapIndent}>{cap.config}</GlowText>
      <GlowText color={Colors.textMuted} size={9} style={[styles.netCapIndent, { lineHeight: 14 }]}>{cap.description}</GlowText>
    </View>
  );
});

// ─── Replay Modal ─────────────────────────────────────────────────────────────

const ReplayModal = React.memo(function ReplayModal({
  session,
  lines,
  running,
  onClose,
}: {
  session: BootSession | null;
  lines: string[];
  running: boolean;
  onClose: () => void;
}) {
  if (!session) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={replayStyles.overlay} onPress={() => !running && onClose()}>
        <Pressable style={replayStyles.panel} onPress={() => {}}>
          <View style={replayStyles.header}>
            <MaterialIcons name="replay" size={16} color={Colors.cyan} />
            <GlowText color={Colors.cyan} size={Typography.sizes.sm} weight="700" style={replayStyles.title}>
              BOOT REPLAY
            </GlowText>
            {!running && (
              <Pressable onPress={onClose} style={replayStyles.closeBtn}>
                <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600">CLOSE</GlowText>
              </Pressable>
            )}
          </View>
          <ScrollView style={replayStyles.scroll} contentContainerStyle={replayStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {lines.map((line, i) => (
              <GlowText
                key={i}
                color={
                  line.startsWith('[†]') ? Colors.amethyst :
                  line.startsWith('[+]') || line.startsWith('[√]') ? Colors.statusOnline :
                  line.startsWith('[!]') ? Colors.coral :
                  line.startsWith('[*]') ? Colors.textSecondary :
                  line.startsWith('──') ? Colors.border :
                  Colors.textMuted
                }
                size={9}
                style={replayStyles.logLine}
              >
                {line}
              </GlowText>
            ))}
            {running && <GlowText color={Colors.amethyst} size={9} style={replayStyles.logLine}>{'_'}</GlowText>}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function YmirScreen() {
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    arch: true,
    kspp: false,
    network: false,
    sysctl: false,
    history: false,
  });
  const [bootHistory, setBootHistory] = useState<BootSession[]>([]);
  const [replaySession, setReplaySession] = useState<BootSession | null>(null);
  const [replayLines, setReplayLines] = useState<string[]>([]);
  const [replayRunning, setReplayRunning] = useState(false);

  useEffect(() => {
    loadBootHistory().then(setBootHistory);
  }, []);

  const toggle = useCallback((key: SectionKey) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearBootHistory();
    setBootHistory([]);
  }, []);

  const startReplay = useCallback((session: BootSession) => {
    setReplaySession(session);
    setReplayLines([]);
    setReplayRunning(true);

    const lines: string[] = [
      '',
      `[†] REPLAYING BOOT SESSION: ${session.timestamp}`,
      `[*] Mode: ${session.mode.toUpperCase()}   Duration: ${formatDuration(session.durationMs)}`,
      `[*] Kernel: ${session.kernelVersion}   Status: ${session.status.toUpperCase()}`,
      '',
      '── MODULE LOAD RESULTS ──────────────────────',
      ...session.moduleResults.map(m =>
        `  ${m.loaded ? '[+]' : '[!]'} ${m.label.padEnd(14)} ${m.loaded ? `loaded in ${formatDuration(m.durationMs)}` : 'SKIPPED'}`
      ),
      '',
      '── APPLIED BOOT OPTIONS ─────────────────────',
      `  kaslr:            ${session.bootOptions.kaslr ? 'ENABLED' : 'DISABLED'}`,
      `  ptrace_scope:     ${session.bootOptions.ptrace_scope}`,
      `  modules_disabled: ${session.bootOptions.modules_disabled ? 'YES' : 'NO'}`,
      `  tcp_syncookies:   ${session.bootOptions.tcp_syncookies ? 'ENABLED' : 'DISABLED'}`,
      `  dmesg_restrict:   ${session.bootOptions.dmesg_restrict ? 'ENABLED' : 'DISABLED'}`,
      '',
      `[${session.status === 'success' ? '√' : '!'}] Session replay complete.`,
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setReplayLines(prev => [...prev, line]);
        if (i === lines.length - 1) setReplayRunning(false);
      }, i * 90);
      timeouts.push(t);
    });
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="memory" size={14} color={Colors.amethyst} />
              <GlowText color={Colors.amethyst} size={9} weight="700" style={styles.heroBadgeText}>PRIMORDIAL KERNEL</GlowText>
            </View>
            <View style={styles.heroStatusDot} />
          </View>
          <GlowText color={Colors.textPrimary} size={Typography.sizes.xxl} weight="700" style={styles.heroTitle}>YMIR</GlowText>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.heroSubtitle}>Forge Sequence — Hardened LTS Kernel</GlowText>
          <View style={styles.specStrip}>
            {[
              { label: 'VERSION', value: YMIR_VERSION },
              { label: 'ARCH',    value: YMIR_TARGET_ARCH },
              { label: 'BASE',    value: 'LTS 6.6.x' },
              { label: 'STATE',   value: 'SEALED', green: true },
            ].map((item, idx, arr) => (
              <React.Fragment key={item.label}>
                <View style={styles.specItem}>
                  <GlowText color={Colors.textMuted} size={8} weight="600">{item.label}</GlowText>
                  <GlowText color={item.green ? Colors.statusOnline : Colors.cyan} size={9} weight="600" numberOfLines={1}>{item.value}</GlowText>
                </View>
                {idx < arr.length - 1 && <View style={styles.specDivider} />}
              </React.Fragment>
            ))}
          </View>
          <View style={styles.compatRow}>
            <MaterialIcons name="check-circle" size={10} color={Colors.statusOnline} />
            <GlowText color={Colors.textMuted} size={9}>{YMIR_COMPAT}</GlowText>
          </View>
        </View>

        {/* ── Arch Principles ── */}
        <View style={styles.section}>
          <SectionToggle label="ARCHITECTURAL DESIGN PRINCIPLES" icon="architecture" expanded={expanded.arch} onToggle={() => toggle('arch')} accent={Colors.amethyst} />
          {expanded.arch && (
            <View style={styles.sectionBody}>
              {YMIR_ARCH_PRINCIPLES.map(p => <PrincipleCard key={p.id} principle={p} />)}
            </View>
          )}
        </View>

        {/* ── KSPP Matrix ── */}
        <View style={styles.section}>
          <SectionToggle label={`KSPP CONFIG MATRIX  (${YMIR_KSPP_CONFIG.length} entries)`} icon="shield" expanded={expanded.kspp} onToggle={() => toggle('kspp')} accent={Colors.cyan} />
          {expanded.kspp && (
            <View style={styles.sectionBody}>
              <View style={styles.ksppTableHeader}>
                <GlowText color={Colors.textMuted} size={8} weight="600" style={styles.ksppHeaderLeft}>CONFIG OPTION</GlowText>
                <GlowText color={Colors.textMuted} size={8} weight="600" style={styles.ksppHeaderRight}>VAL</GlowText>
              </View>
              {YMIR_KSPP_CONFIG.map((entry, i) => <KsppRow key={entry.option} entry={entry} index={i} />)}
              <View style={styles.ksppFooter}>
                <MaterialIcons name="verified-user" size={11} color={Colors.statusOnline} />
                <GlowText color={Colors.textMuted} size={9} style={styles.flex1}>All flags compiled as built-in (=y) — no loadable module exposure.</GlowText>
              </View>
            </View>
          )}
        </View>

        {/* ── Network Pipeline ── */}
        <View style={styles.section}>
          <SectionToggle label="NETWORK & ANONYMITY PIPELINE" icon="router" expanded={expanded.network} onToggle={() => toggle('network')} accent={Colors.statusWarning} />
          {expanded.network && (
            <View style={styles.sectionBody}>
              {YMIR_NET_CAPABILITIES.map(cap => <NetCapRow key={cap.name} cap={cap} />)}
            </View>
          )}
        </View>

        {/* ── Boot History ── */}
        <View style={styles.section}>
          <SectionToggle label={`BOOT HISTORY  (${bootHistory.length} sessions)`} icon="history" expanded={expanded.history} onToggle={() => toggle('history')} accent={Colors.cyan} />
          {expanded.history && (
            <View style={styles.sectionBody}>
              {bootHistory.length === 0 ? (
                <View style={styles.historyEmpty}>
                  <MaterialIcons name="history" size={28} color={Colors.textMuted} />
                  <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.historyEmptyText}>
                    No boot sessions recorded yet. Boot history populates after each app launch.
                  </GlowText>
                </View>
              ) : (
                bootHistory.map(session => (
                  <View key={session.id} style={[styles.historyCard, session.mode === 'lockdown' && styles.historyCardLockdown]}>
                    <View style={styles.historyCardTop}>
                      <View style={[styles.historyModeTag, { borderColor: session.mode === 'lockdown' ? Colors.coral + '55' : Colors.statusOnline + '44' }]}>
                        <GlowText color={session.mode === 'lockdown' ? Colors.coral : Colors.statusOnline} size={8} weight="700">
                          {session.mode.toUpperCase()}
                        </GlowText>
                      </View>
                      <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.flex1}>{session.timestamp}</GlowText>
                      <Pressable
                        style={({ pressed }) => [styles.replayBtn, pressed && { opacity: 0.75 }]}
                        onPress={() => startReplay(session)}
                      >
                        <MaterialIcons name="replay" size={12} color={Colors.cyan} />
                        <GlowText color={Colors.cyan} size={8} weight="600">REPLAY</GlowText>
                      </Pressable>
                    </View>
                    <View style={styles.historyMeta}>
                      <GlowText color={Colors.textMuted} size={9} style={styles.flex1}>
                        {`${session.modulesLoaded}/${session.totalModules} mod  ·  ${formatDuration(session.durationMs)}  ·  ${session.kernelVersion}`}
                      </GlowText>
                      <View style={[styles.historyStatusBadge, { borderColor: session.status === 'success' ? Colors.statusOnline + '55' : Colors.coral + '55' }]}>
                        <GlowText color={session.status === 'success' ? Colors.statusOnline : Colors.coral} size={8} weight="700">
                          {session.status.toUpperCase()}
                        </GlowText>
                      </View>
                    </View>
                  </View>
                ))
              )}
              {bootHistory.length > 0 && (
                <Pressable style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]} onPress={handleClearHistory}>
                  <MaterialIcons name="delete-outline" size={13} color={Colors.coralDim} />
                  <GlowText color={Colors.coralDim} size={Typography.sizes.xs} weight="600">CLEAR ALL BOOT HISTORY</GlowText>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ── Sysctl ── */}
        <View style={styles.section}>
          <SectionToggle label={`SYSCTL RUNTIME PARAMETERS  (${YMIR_SYSCTL.length} rules)`} icon="tune" expanded={expanded.sysctl} onToggle={() => toggle('sysctl')} accent={Colors.coral} />
          {expanded.sysctl && (
            <View style={styles.sectionBody}>
              <View style={styles.sysctlLegend}>
                {(['memory', 'network', 'execution'] as const).map(cat => (
                  <View key={cat} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                    <GlowText color={Colors.textMuted} size={8}>{cat.toUpperCase()}</GlowText>
                  </View>
                ))}
              </View>
              {YMIR_SYSCTL.map(entry => <SysctlRow key={entry.key} entry={entry} />)}
              <View style={styles.sysctlApplyNote}>
                <MaterialIcons name="info-outline" size={11} color={Colors.textMuted} />
                <GlowText color={Colors.textMuted} size={9} style={styles.flex1}>
                  Applied via sysctl -p at boot. Locked in /etc/sysctl.d/99-ymir-hardening.conf
                </GlowText>
              </View>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerLine}>
            <MaterialIcons name="lock" size={11} color={Colors.amethyst} />
            <GlowText color={Colors.textMuted} size={9}>Ymir Kernel Profile: /etc/stormraven/ymir_kernel.config</GlowText>
          </View>
          <View style={styles.footerLine}>
            <MaterialIcons name="verified-user" size={11} color={Colors.statusOnline} />
            <GlowText color={Colors.textMuted} size={9}>Environment Status: Sealed & Ready</GlowText>
          </View>
          <GlowText color={Colors.border} size={8} style={styles.footerSig}>
            YMIR PRIMORDIAL KERNEL FORGE SEQUENCE — COMPLETE
          </GlowText>
        </View>

      </ScrollView>

      {/* ── Replay Modal ── */}
      <ReplayModal
        session={replaySession}
        lines={replayLines}
        running={replayRunning}
        onClose={() => setReplaySession(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.obsidian },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  flex1: { flex: 1 },

  // Hero
  hero: { padding: Spacing.base, paddingTop: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: Colors.amethyst, opacity: 0.06 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.amethystGlow, borderWidth: 1, borderColor: Colors.amethyst + '44', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  heroBadgeText: { letterSpacing: 1.2 },
  heroStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusOnline },
  heroTitle: { letterSpacing: 8, marginBottom: 2 },
  heroSubtitle: { letterSpacing: 1, marginBottom: Spacing.md },
  specStrip: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  specItem: { flex: 1, alignItems: 'center', gap: 3 },
  specDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  compatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  // Sections
  section: { marginHorizontal: Spacing.base, marginTop: Spacing.md },
  sectionToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  sectionIconWrap: { width: 28, height: 28, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  sectionToggleLabel: { flex: 1, letterSpacing: 0.8 },
  sectionBody: { marginTop: Spacing.sm, gap: Spacing.sm },

  // Principles
  principleCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.amethyst + '22', borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  principleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  principleTagWrap: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.amethyst, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  principleTitle: { flex: 1, letterSpacing: 0.3, lineHeight: 18 },
  principleBodyRow: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: 28 },
  bulletChar: { marginTop: 1, flexShrink: 0 },
  principleBodyText: { flex: 1, lineHeight: 15, letterSpacing: 0.2 },

  // KSPP
  ksppTableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 2 },
  ksppHeaderLeft: { letterSpacing: 1 },
  ksppHeaderRight: { letterSpacing: 1, width: 30, textAlign: 'center' },
  ksppRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.sm, gap: Spacing.sm },
  ksppRowAlt: { backgroundColor: Colors.surface },
  ksppLeft: { flex: 1, gap: 2 },
  ksppMitigation: { letterSpacing: 0.2, lineHeight: 13 },
  ksppValueWrap: { width: 30, alignItems: 'center' },
  ksppFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm },

  // Network
  netCapCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.statusWarning + '22', borderRadius: Radius.md, padding: Spacing.md, gap: 5 },
  netCapHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  netCapDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusWarning },
  netCapIndent: { paddingLeft: 14, letterSpacing: 0.3 },

  // Sysctl
  sysctlLegend: { flexDirection: 'row', gap: Spacing.base, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  sysctlRow: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, gap: 4 },
  sysctlTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sysctlKey: { flex: 1, letterSpacing: 0.2 },
  sysctlCatBadge: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  sysctlValueWrap: { minWidth: 40, alignItems: 'flex-end' },
  sysctlDesc: { lineHeight: 14, letterSpacing: 0.2 },
  sysctlApplyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.xs },

  // Boot History
  historyEmpty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  historyEmptyText: { textAlign: 'center', letterSpacing: 0.3, lineHeight: 18, maxWidth: 260 },
  historyCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cyan + '22', borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  historyCardLockdown: { borderColor: Colors.coral + '33', backgroundColor: Colors.coral + '08' },
  historyCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  historyModeTag: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  historyStatusBadge: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  replayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.cyanGlow, borderWidth: 1, borderColor: Colors.cyanDim + '55', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.coralDim + '55', borderRadius: Radius.md, backgroundColor: Colors.coral + '08' },

  // Footer
  footer: { marginHorizontal: Spacing.base, marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: 6 },
  footerLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerSig: { letterSpacing: 1.5, marginTop: Spacing.sm, textAlign: 'center' },
});

const replayStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5, 5, 8, 0.92)', justifyContent: 'flex-end' },
  panel: { backgroundColor: Colors.charcoal, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderTopWidth: 1, borderColor: Colors.cyan + '55', padding: Spacing.base, paddingBottom: 40, maxHeight: '75%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.sm },
  title: { flex: 1, letterSpacing: 2 },
  closeBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.sm, paddingBottom: 16 },
  logLine: { lineHeight: 16, letterSpacing: 0.2, paddingVertical: 1 },
});
