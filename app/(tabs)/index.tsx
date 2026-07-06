// Powered by OnSpace.AI — StormRaven OS Dashboard
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { useSystem } from '../../hooks/useSystem';
import { GlowText } from '../../components/ui/GlowText';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ModuleCard } from '../../components/feature/ModuleCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const {
    modules,
    systemLoad,
    isLockdown,
    threatLevel,
    uptime,
    activeCount,
    alertCount,
  } = useSystem();

  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const threatColor = threatLevel === 'CRITICAL' ? Colors.coral : threatLevel === 'ELEVATED' ? Colors.statusWarning : Colors.statusOnline;
  const activeModules = modules.filter(m => m.status === 'active').slice(0, 4);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={require('../../assets/images/hero-bg.png')}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.heroDate}>
              {date}
            </GlowText>
            <GlowText
              color={Colors.amethyst}
              size={Typography.sizes.display}
              weight="700"
              style={styles.heroTime}
            >
              {time}
            </GlowText>
            <View style={styles.heroTitle}>
              <GlowText color={Colors.textPrimary} size={Typography.sizes.lg} weight="600">
                STORMRAVEN OS
              </GlowText>
              <GlowText color={Colors.textSecondary} size={Typography.sizes.sm}>
                {'  '}∴ Iteration III
              </GlowText>
            </View>
          </View>
        </View>

        {/* Threat Level Banner */}
        {isLockdown && (
          <View style={styles.lockdownBanner}>
            <MaterialIcons name="lock" size={18} color={Colors.coral} />
            <GlowText color={Colors.coral} size={Typography.sizes.sm} weight="700" style={styles.lockdownText}>
              SYSTEM LOCKDOWN — NETWORK ISOLATED
            </GlowText>
          </View>
        )}

        {/* Status Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.statLabel}>MODULES</GlowText>
            <GlowText color={Colors.statusOnline} size={Typography.sizes.xl} weight="700">{activeCount}</GlowText>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>active</GlowText>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.statLabel}>THREAT</GlowText>
            <GlowText color={threatColor} size={Typography.sizes.md} weight="700">{threatLevel}</GlowText>
            <View style={[styles.threatBar, { backgroundColor: threatColor + '33' }]}>
              <View style={[styles.threatFill, { backgroundColor: threatColor, width: threatLevel === 'CRITICAL' ? '100%' : threatLevel === 'ELEVATED' ? '60%' : '15%' }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.statLabel}>UPTIME</GlowText>
            <GlowText color={Colors.textCyan} size={Typography.sizes.sm} weight="600">{uptime}</GlowText>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>continuous</GlowText>
          </View>
        </View>

        {/* System Load */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} weight="600" style={styles.sectionLabel}>
              SYSTEM LOAD
            </GlowText>
            <GlowText color={Colors.amethyst} size={Typography.sizes.sm} weight="600">
              {Math.round(systemLoad)}%
            </GlowText>
          </View>
          <View style={styles.loadTrack}>
            <View style={[
              styles.loadFill,
              {
                width: `${Math.round(systemLoad)}%` as any,
                backgroundColor: systemLoad > 80 ? Colors.coral : systemLoad > 60 ? Colors.statusWarning : Colors.amethyst,
              }
            ]} />
          </View>
        </View>

        {/* Active Modules */}
        <View style={styles.section}>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} weight="600" style={styles.sectionLabel}>
            ACTIVE SUBSYSTEMS
          </GlowText>
          <View style={styles.moduleGrid}>
            {activeModules.map(mod => (
              <View key={mod.id} style={styles.moduleGridItem}>
                <ModuleCard module={mod} compact />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Status Grid */}
        <View style={styles.section}>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} weight="600" style={styles.sectionLabel}>
            ALL MODULES — YGGDRASIL MATRIX
          </GlowText>
          {modules.map(mod => (
            <View key={mod.id} style={styles.moduleRow}>
              <GlowText color={Colors.textPrimary} size={Typography.sizes.sm} weight="500" style={styles.modName} numberOfLines={1}>
                {mod.name}
              </GlowText>
              <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.modRole} numberOfLines={1}>
                {mod.role}
              </GlowText>
              <StatusBadge status={mod.status} />
            </View>
          ))}
        </View>

        {/* Footer Sig */}
        <View style={styles.footer}>
          <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.footerText}>
            {'∴ StormRaven OS v3.1.0 — Kernel 6.6.21-ymir-hardened'}
          </GlowText>
          <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.footerText}>
            {'Security: KASLR + YAMA ptrace=3 + SecComp ACTIVE'}
          </GlowText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  heroBanner: {
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 7, 10, 0.65)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  heroDate: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTime: {
    letterSpacing: 4,
    lineHeight: 38,
  },
  heroTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  lockdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coralGlow,
    borderColor: Colors.coral,
    borderWidth: 1,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  lockdownText: {
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statCardCenter: {
    borderColor: Colors.amethyst + '44',
  },
  statLabel: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  threatBar: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  threatFill: {
    height: '100%',
    borderRadius: 2,
  },
  section: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  loadTrack: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadFill: {
    height: '100%',
    borderRadius: 3,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moduleGridItem: {
    width: (width - Spacing.base * 2 - Spacing.sm) / 2,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  modName: {
    width: 100,
    letterSpacing: 0.3,
  },
  modRole: {
    flex: 1,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.base,
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  footerText: {
    letterSpacing: 0.3,
  },
});
