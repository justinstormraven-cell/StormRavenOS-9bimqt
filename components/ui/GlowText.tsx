import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface GlowTextProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: TextStyle['fontWeight'];
  style?: TextStyle;
  mono?: boolean;
  numberOfLines?: number;
}

export const GlowText = React.memo(function GlowText({
  children,
  color = Colors.textPrimary,
  size = Typography.sizes.base,
  weight = '400',
  style,
  mono = true,
  numberOfLines,
}: GlowTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          color,
          fontSize: size,
          fontWeight: weight,
          fontFamily: mono ? Typography.mono : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
});

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
