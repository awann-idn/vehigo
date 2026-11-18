import { TextStyle } from 'react-native';
import { colors } from './colors';

const base: TextStyle = {
  color: colors.text.primary,
  fontFamily: 'System',
};

export const typography = {
  h1: { ...base, fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  h2: { ...base, fontSize: 22, fontWeight: '800' as const, lineHeight: 28 },
  h3: { ...base, fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { ...base, fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { ...base, fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  label: {
    ...base,
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  caption: { ...base, fontSize: 11, fontWeight: '400' as const, lineHeight: 15 },
  button: {
    ...base,
    fontSize: 14,
    fontWeight: '800' as const,
    lineHeight: 18,
    letterSpacing: 0.8,
  },
};
