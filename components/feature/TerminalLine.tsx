import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TerminalLine as TLine } from '../../services/terminalService';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { GlowText } from '../ui/GlowText';

interface TerminalLineProps {
  line: TLine;
}

const LINE_COLORS: Record<TLine['type'], string> = {
  input:   Colors.textCyan,
  output:  Colors.textPrimary,
  error:   Colors.coral,
  success: Colors.statusOnline,
  warning: Colors.statusWarning,
  system:  Colors.textAmethyst,
  scan:    Colors.textCyan,
};

export const TerminalLineItem = React.memo(function TerminalLineItem({ line }: TerminalLineProps) {
  const color = LINE_COLORS[line.type];
  return (
    <View style={styles.row}>
      <GlowText color={color} size={Typography.sizes.sm} style={styles.text}>
        {line.text}
      </GlowText>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingVertical: 1,
    paddingHorizontal: Spacing.base,
  },
  text: {
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
