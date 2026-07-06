import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { SystemModule } from '../../constants/mockData';
import { GlowText } from '../ui/GlowText';
import { StatusBadge } from '../ui/StatusBadge';

interface ModuleCardProps {
  module: SystemModule;
  onPress?: () => void;
  compact?: boolean;
}

export const ModuleCard = React.memo(function ModuleCard({ module, onPress, compact }: ModuleCardProps) {
  const isAlert = module.status === 'alert';
  const isActive = module.status === 'active';
  const borderColor = isAlert ? Colors.coral : isActive ? Colors.amethyst + '55' : Colors.border;
  const loadBarColor = module.load > 80 ? Colors.coral : module.load > 50 ? Colors.statusWarning : Colors.amethyst;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor, opacity: pressed ? 0.85 : 1 },
        isAlert && styles.alertCard,
        compact && styles.compact,
      ]}
    >
      <View style={styles.header}>
        <GlowText
          color={isAlert ? Colors.coral : Colors.textAmethyst}
          size={Typography.sizes.md}
          weight="700"
          style={styles.name}
        >
          {module.name}
        </GlowText>
        <StatusBadge status={module.status} />
      </View>

      {!compact && (
        <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.desc} numberOfLines={2}>
          {module.description}
        </GlowText>
      )}

      <View style={styles.footer}>
        <GlowText color={Colors.textMuted} size={Typography.sizes.xs}>
          {module.port ? `∴ ${module.port}` : module.path ? `∴ ${module.path}` : ''}
        </GlowText>
        {module.status === 'active' && (
          <View style={styles.loadContainer}>
            <View style={[styles.loadBar, { width: `${Math.round(module.load)}%` as any, backgroundColor: loadBarColor }]} />
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  compact: {
    padding: Spacing.sm,
  },
  alertCard: {
    backgroundColor: Colors.coralGlow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    letterSpacing: 0.5,
  },
  desc: {
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadContainer: {
    width: 64,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadBar: {
    height: '100%',
    borderRadius: 2,
  },
});
