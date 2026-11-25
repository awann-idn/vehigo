import { TextStyle } from 'react-native';
import { colors } from './colors';

const base: TextStyle = {
  color: colors.text.primary,
  fontFamily: 'Manrope_400Regular',
};

export const typography = {
  h1: { ...base, fontFamily: 'Manrope_800ExtraBold', fontSize: 28, lineHeight: 36 },
  h2: { ...base, fontFamily: 'Manrope_800ExtraBold', fontSize: 24, lineHeight: 32, letterSpacing: -0.6 },
  h3: { ...base, fontFamily: 'Manrope_700Bold', fontSize: 18, lineHeight: 24 },
  body: { ...base, fontSize: 15, lineHeight: 22 },
  bodySm: { ...base, fontSize: 13, lineHeight: 19 },
  label: {
    ...base,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  caption: { ...base, fontSize: 11, lineHeight: 15 },
  button: {
    ...base,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.4,
  },
};
