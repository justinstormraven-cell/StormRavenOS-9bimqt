// Powered by OnSpace.AI — StormRaven Modules
import React, { useState } from 'react';
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
import { useSystem } from '../../hooks/useSystem';
import { SystemModule } from '../../constants/mockData';
import { GlowText } from '../../components/ui/GlowText';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ModuleCard } from '../../components/feature/ModuleCard';

type FilterType = 'all' | 'active' | 'idle' | 'alert';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',    label: 'ALL' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'idle',   label: 'IDLE' },
  { key: 'alert',  label: 'ALERT' },
];

export default function ModulesScreen() {
  const { modules, systemLoad, activeCount, alertCount, isLockdown, engageLockdown, liftLockdown } = useSystem();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<SystemModule | null>(null);

  const filtered = filter === 'all' ? modules : modules.filter(m => m.status === filter);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <GlowText color={Colors.amethyst} size={Typography.sizes.lg} weight="700" style={styles.title}>
            SYSTEM MODULES
          </GlowText>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.subtitle}>
            {`Yggdrasil Matrix — ${activeCount}/${modules.length} modules active`}
          </GlowText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.lockBtn,
            isLockdown ? styles.lockBtnActive : styles.lockBtnDefault,
            pressed && { opacity: 0.8 },
          ]}
          onPress={isLockdown ? liftLockdown : engageLockdown}
        >
          <MaterialIcons
            name={isLockdown ? 'lock' : 'lock-open'}
            size={16}
            color={isLockdown ? Colors.coral : Colors.textSecondary}
          />
          <GlowText
            color={isLockdown ? Colors.coral : Colors.textSecondary}
            size={Typography.sizes.xs}
            weight="600"
          >
            {isLockdown ? 'LOCKED' : 'LOCK'}
          </GlowText>
        </Pressable>
      </View>

      {/* Alert Banner */}
      {alertCount > 0 && (
        <View style={styles.alertBanner}>
          <MaterialIcons name="warning" size={14} color={Colors.coral} />
          <GlowText color={Colors.coral} size={Typography.sizes.xs} weight="600" style={styles.alertText}>
            {`${alertCount} module(s) in ALERT state — system integrity compromised`}
          </GlowText>
        </View>
      )}

      {/* Load Bar */}
      <View style={styles.loadSection}>
        <View style={styles.loadHeader}>
          <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600" style={styles.loadLabel}>
            AGGREGATE SYSTEM LOAD
          </GlowText>
          <GlowText color={Colors.amethyst} size={Typography.sizes.xs} weight="600">
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

      {/* Filter Bar */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(f => {
            const isSelected = filter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
              >
                <GlowText
                  color={isSelected ? Colors.matteBlack : Colors.textSecondary}
                  size={Typography.sizes.xs}
                  weight="600"
                  style={styles.filterLabel}
                >
                  {f.label}
                  {f.key === 'active' ? ` (${activeCount})` : ''}
                  {f.key === 'alert' ? ` (${alertCount})` : ''}
                </GlowText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Module List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(mod => (
          <ModuleCard
            key={mod.id}
            module={mod}
            onPress={() => setSelected(mod)}
          />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="memory" size={40} color={Colors.textMuted} />
            <GlowText color={Colors.textMuted} size={Typography.sizes.sm} style={styles.emptyText}>
              No modules match this filter.
            </GlowText>
          </View>
        )}
      </ScrollView>

      {/* Module Detail Modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <GlowText color={Colors.amethyst} size={Typography.sizes.xl} weight="700">
                    {selected.name}
                  </GlowText>
                  <StatusBadge status={selected.status} />
                </View>
                <GlowText color={Colors.textAmethyst} size={Typography.sizes.xs} weight="600" style={styles.modalRole}>
                  {selected.role.toUpperCase()}
                </GlowText>
                <View style={styles.modalDivider} />
                <GlowText color={Colors.textSecondary} size={Typography.sizes.sm} style={styles.modalDesc}>
                  {selected.description}
                </GlowText>
                <View style={styles.modalRows}>
                  {selected.port && (
                    <View style={styles.modalRow}>
                      <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>PORT / CHANNEL</GlowText>
                      <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600">{selected.port}</GlowText>
                    </View>
                  )}
                  {selected.path && (
                    <View style={styles.modalRow}>
                      <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>SYSTEM PATH</GlowText>
                      <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600">{selected.path}</GlowText>
                    </View>
                  )}
                  <View style={styles.modalRow}>
                    <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>UPTIME</GlowText>
                    <GlowText color={Colors.statusOnline} size={Typography.sizes.xs} weight="600">{selected.uptime}</GlowText>
                  </View>
                  <View style={styles.modalRow}>
                    <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>CPU LOAD</GlowText>
                    <GlowText
                      color={selected.load > 80 ? Colors.coral : selected.load > 50 ? Colors.statusWarning : Colors.amethyst}
                      size={Typography.sizes.xs}
                      weight="600"
                    >
                      {selected.status === 'active' ? `${Math.round(selected.load)}%` : '—'}
                    </GlowText>
                  </View>
                </View>
                <Pressable style={styles.modalClose} onPress={() => setSelected(null)}>
                  <GlowText color={Colors.textSecondary} size={Typography.sizes.sm} weight="600">
                    DISMISS
                  </GlowText>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    letterSpacing: 2,
  },
  subtitle: {
    letterSpacing: 0.5,
    marginTop: 2,
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  lockBtnDefault: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  lockBtnActive: {
    borderColor: Colors.coral + '88',
    backgroundColor: Colors.coralGlow,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coralGlow,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.coral + '44',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alertText: {
    letterSpacing: 0.3,
    flex: 1,
  },
  loadSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadLabel: {
    letterSpacing: 1,
  },
  loadTrack: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadFill: {
    height: '100%',
    borderRadius: 2,
  },
  filterRow: {
    height: 44,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.charcoal,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    height: '100%',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.amethyst,
    borderColor: Colors.amethyst,
  },
  filterLabel: {
    letterSpacing: 0.8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.md,
  },
  emptyText: {
    letterSpacing: 0.5,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.88)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.charcoal,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.amethyst + '44',
    padding: Spacing.xl,
    paddingBottom: Spacing.section,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRole: {
    letterSpacing: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  modalDesc: {
    lineHeight: 20,
  },
  modalRows: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
});
