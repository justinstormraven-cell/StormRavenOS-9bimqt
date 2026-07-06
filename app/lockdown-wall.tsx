// Powered by OnSpace.AI — StormRaven Lockdown Wall
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { GlowText } from '../components/ui/GlowText';
import { persistLockdown } from '../services/bootHistoryService';

const EMERGENCY_LINES = [
  '[CRITICAL] Jörmungandr — network quarantine ENGAGED',
  '[CRITICAL] IPtables flush completed — all interfaces BLOCKED',
  '[CRITICAL] Odin SIEM relay suspended',
  '[WARNING]  Sleipnir VPN endpoints DISCONNECTED',
  '[WARNING]  Demogorgon tarpit standing by on port 2222',
  '[INFO]     Ginnungagap integrity monitor — watching',
  '[INFO]     Loki shadow vault SEALED (AES-256-Fernet)',
  '[INFO]     System isolation active — awaiting Luci authentication',
];

export default function LockdownWallScreen() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glitchAnim = useRef(new Animated.Value(1)).current;
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  // Pulse the border/glow
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    // Scanning line
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.linear })
    ).start();

    // Glitch flicker
    const glitchInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(glitchAnim, { toValue: 0.4, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 0.7, duration: 30, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    }, 3500);

    // Reveal emergency log lines
    EMERGENCY_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
      }, 400 + i * 280);
    });

    return () => clearInterval(glitchInterval);
  }, []);

  const handleLift = async () => {
    await persistLockdown(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor="#0a0003" />

      {/* Scan line */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.scanLine,
          {
            transform: [{
              translateY: scanAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 800],
              }),
            }],
            opacity: pulseAnim,
          },
        ]}
      />

      {/* Background glow blobs */}
      <Animated.View style={[styles.glowBlob, styles.glowBlobTL, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.glowBlob, styles.glowBlobBR, { opacity: pulseAnim }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: glitchAnim }]}>
          <View style={styles.headerIconWrap}>
            <Animated.View style={[styles.iconGlow, { opacity: pulseAnim }]} />
            <MaterialIcons name="lock" size={48} color={Colors.coral} />
          </View>
          <GlowText color={Colors.coral} size={Typography.sizes.xxl} weight="700" style={styles.title}>
            LOCKDOWN
          </GlowText>
          <GlowText color={Colors.textCoral} size={Typography.sizes.sm} weight="600" style={styles.subtitle}>
            EMERGENCY ISOLATION MODE
          </GlowText>
        </Animated.View>

        {/* Alert Badge */}
        <View style={styles.alertBadge}>
          <Animated.View style={[styles.alertBadgeDot, { opacity: pulseAnim }]} />
          <GlowText color={Colors.coralDim} size={Typography.sizes.xs} weight="600" style={styles.alertBadgeText}>
            JÖRMUNGANDR QUARANTINE PROTOCOL — ACTIVE
          </GlowText>
        </View>

        {/* Status Grid */}
        <View style={styles.statusGrid}>
          {[
            { label: 'NETWORK',   value: 'ISOLATED',    ok: false },
            { label: 'INTERFACES', value: 'BLOCKED',    ok: false },
            { label: 'VPN',       value: 'DISCONNECTED', ok: false },
            { label: 'VAULT',     value: 'SEALED',       ok: true  },
            { label: 'SENTINEL',  value: 'WATCHING',     ok: true  },
            { label: 'IPTABLES',  value: 'FLUSHED',      ok: false },
          ].map(item => (
            <View key={item.label} style={styles.statusCell}>
              <GlowText color={Colors.textMuted} size={8} weight="600" style={styles.statusCellLabel}>
                {item.label}
              </GlowText>
              <GlowText
                color={item.ok ? Colors.statusWarning : Colors.coral}
                size={9}
                weight="700"
                style={styles.statusCellValue}
              >
                {item.value}
              </GlowText>
            </View>
          ))}
        </View>

        {/* Emergency Log */}
        <View style={styles.logPanel}>
          <View style={styles.logHeader}>
            <View style={styles.logDot} />
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600" style={styles.logTitle}>
              EMERGENCY LOG
            </GlowText>
          </View>
          {visibleLines.map((line, i) => {
            const isCritical = line.startsWith('[CRITICAL]');
            const isWarning = line.startsWith('[WARNING]');
            const color = isCritical ? Colors.coral : isWarning ? Colors.statusWarning : Colors.textMuted;
            return (
              <GlowText key={i} color={color} size={9} style={styles.logLine}>
                {line}
              </GlowText>
            );
          })}
          {visibleLines.length < EMERGENCY_LINES.length && (
            <GlowText color={Colors.coralDim} size={9} style={styles.logLine}>
              {'_'}
            </GlowText>
          )}
        </View>

        {/* Warning Note */}
        <View style={styles.warnNote}>
          <MaterialIcons name="info-outline" size={13} color={Colors.coralDim} />
          <GlowText color={Colors.coralDim} size={9} style={styles.warnText}>
            All network interfaces have been flushed via IPtables. System state is volatile. No data will persist beyond current session unless explicitly authenticated via Luci hardware keys.
          </GlowText>
        </View>

        {/* Lift Lockdown CTA */}
        <Pressable
          style={({ pressed }) => [styles.liftBtn, pressed && styles.liftBtnPressed]}
          onPress={handleLift}
        >
          <MaterialIcons name="lock-open" size={18} color={Colors.coral} />
          <GlowText color={Colors.coral} size={Typography.sizes.sm} weight="700" style={styles.liftBtnText}>
            LIFT ISOLATION & RESTORE NETWORK
          </GlowText>
        </Pressable>

        <GlowText color={Colors.border} size={8} style={styles.sig}>
          STORMRAVEN OS — JÖRMUNGANDR QUARANTINE PROTOCOL v3.1
        </GlowText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07000a',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.coral,
    opacity: 0.3,
    zIndex: 10,
    pointerEvents: 'none',
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.coral,
  },
  glowBlobTL: {
    top: -120,
    left: -100,
    opacity: 0.04,
  },
  glowBlobBR: {
    bottom: -100,
    right: -80,
    opacity: 0.04,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  headerIconWrap: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.coral + '55',
    backgroundColor: Colors.coral + '10',
    marginBottom: Spacing.sm,
  },
  iconGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.coral,
    opacity: 0.15,
  },
  title: {
    letterSpacing: 10,
  },
  subtitle: {
    letterSpacing: 3,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coral + '55',
    backgroundColor: Colors.coral + '10',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
  },
  alertBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },
  alertBadgeText: {
    letterSpacing: 1.2,
    flex: 1,
  },
  statusGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusCell: {
    width: '31%',
    backgroundColor: Colors.coral + '10',
    borderWidth: 1,
    borderColor: Colors.coral + '30',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 3,
  },
  statusCellLabel: {
    letterSpacing: 1,
  },
  statusCellValue: {
    letterSpacing: 0.5,
  },
  logPanel: {
    width: '100%',
    backgroundColor: '#0a0003',
    borderWidth: 1,
    borderColor: Colors.coral + '30',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 5,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.coral + '22',
    marginBottom: 4,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.coral,
  },
  logTitle: {
    letterSpacing: 2,
  },
  logLine: {
    lineHeight: 15,
    letterSpacing: 0.3,
  },
  warnNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  warnText: {
    flex: 1,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  liftBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.coral,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.coral + '15',
    marginTop: Spacing.sm,
  },
  liftBtnPressed: {
    backgroundColor: Colors.coral + '30',
  },
  liftBtnText: {
    letterSpacing: 1.5,
  },
  sig: {
    letterSpacing: 1.2,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
