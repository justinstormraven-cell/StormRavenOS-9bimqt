import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { GlowText } from './GlowText';

type StatusType = 'active' | 'idle' | 'scanning' | 'alert' | 'offline';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; label: string }> = {
  active:   { color: Colors.statusOnline,   bg: 'rgba(0, 255, 136, 0.12)',   label: 'ONLINE'   },
  idle:     { color: Colors.textMuted,      bg: 'rgba(68, 68, 90, 0.2)',     label: 'IDLE'     },
  scanning: { color: Colors.statusScanning, bg: 'rgba(0, 229, 255, 0.12)',   label: 'SCANNING' },
  alert:    { color: Colors.coral,          bg: Colors.coralGlow,            label: 'ALERT'    },
  offline:  { color: Colors.textMuted,      bg: 'rgba(68, 68, 90, 0.15)',    label: 'OFFLINE'  },
};

export const StatusBadge = React.memo(function StatusBadge({ status, label, pulse }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color + '44' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <GlowText color={config.color} size={Typography.sizes.xs} weight="600" style={styles.label}>
        {label || config.label}
      </GlowText>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    letterSpacing: 0.8,
  },
});
