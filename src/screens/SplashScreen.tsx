import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MARK = require('../../assets/figma/vehigo_mark.png');

export default function SplashScreen({ navigation }: Props) {
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <Animated.View style={{ opacity: fade, alignItems: 'center', gap: 40 }}>
          <Image source={MARK} style={styles.mark} resizeMode="contain" />
          <Text style={styles.tagline}>
            Dari Pilihan ke Perjalanan, Semua dalam Genggaman
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => navigation.replace('Onboarding1')}
        >
          <Text style={styles.ctaText}>MULAI SEKARANG</Text>
        </Pressable>
        <Text style={styles.copyright}>
          © 2026 Vehigo Indonesia. Seluruh Hak Cipta Dilindungi.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.base,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 300,
    height: 122,
  },
  tagline: {
    ...typography.body,
    fontFamily: 'Manrope_400Regular',
    color: '#46464D',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 310,
  },
  bottom: {
    gap: spacing.base,
    paddingBottom: spacing.sm,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  copyright: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
