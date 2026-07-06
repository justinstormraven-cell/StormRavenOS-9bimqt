// StormRaven OS Design System — Iteration III

export const Colors = {
  // Base Palette
  obsidian: '#07070a',
  charcoal: '#0c0c14',
  matteBlack: '#050508',
  surface: '#10101c',
  surfaceElevated: '#14142a',
  border: '#1e1e32',
  borderGlow: '#2a1a4a',

  // Accent Palette
  amethyst: '#af5cff',
  amethystDim: '#7a3db8',
  amethystGlow: 'rgba(175, 92, 255, 0.15)',
  cyan: '#00e5ff',
  cyanDim: '#0098aa',
  cyanGlow: 'rgba(0, 229, 255, 0.12)',
  coral: '#ff3366',
  coralDim: '#b8003d',
  coralGlow: 'rgba(255, 51, 102, 0.15)',

  // Text
  textPrimary: '#e8e8f0',
  textSecondary: '#8888a8',
  textMuted: '#44445a',
  textAmethyst: '#af5cff',
  textCyan: '#00e5ff',
  textCoral: '#ff3366',
  textGold: '#ffd700',
  textGreen: '#00ff88',

  // Status
  statusOnline: '#00ff88',
  statusWarning: '#ffd700',
  statusError: '#ff3366',
  statusIdle: '#44445a',
  statusScanning: '#00e5ff',
};

export const Typography = {
  mono: 'Courier New',
  monoAlt: 'Courier',
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
};

export const Radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};
