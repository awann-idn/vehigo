import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, MapPin, Sparkles } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Car size={20} color={colors.text.white} />
          </View>
          <Text style={styles.brand}>VEHIGO</Text>
        </View>
      </View>

      <Animated.View style={[styles.illustration, { opacity: fade }]}>
        <View style={styles.illustrationGlow} />
        <View style={styles.carCard}>
          <Car size={96} color={colors.primary} strokeWidth={1.4} />
          <View style={styles.badge}>
            <Sparkles size={14} color={colors.text.white} />
            <Text style={styles.badgeText}>Premium Fleet</Text>
          </View>
        </View>
        <View style={styles.pin}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.pinText}>Palembang</Text>
        </View>
      </Animated.View>

      <View style={styles.bottom}>
        <Text style={styles.title}>Dari Pilihan ke Perjalanan, Semua dalam Genggaman</Text>
        <PrimaryButton label="MULAI SEKARANG" onPress={() => navigation.navigate('Onboarding1')} />
        <Text style={styles.copyright}>© 2026 Vehigo Indonesia. Seluruh Hak Cipta Dilindungi.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...typography.h3,
    letterSpacing: 3,
    color: colors.primary,
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.card,
  },
  carCard: {
    width: 280,
    height: 220,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '700',
  },
  pin: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  pinText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
  bottom: {
    alignItems: 'center',
    gap: spacing.base,
  },
  title: {
    ...typography.body,
    textAlign: 'center',
    color: colors.text.secondary,
    paddingHorizontal: spacing.sm,
  },
  copyright: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
