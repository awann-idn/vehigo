import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'LogoSplash'>;

export default function LogoSplashScreen({ navigation }: Props) {
  const [scale] = useState(() => new Animated.Value(0.8));
  const [opacity] = useState(() => new Animated.Value(0));
  const { session, profile, isLoading } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (session) {
        if (profile?.role === 'mitra') {
          navigation.replace('OwnerApp');
        } else if (profile?.role === 'penyewa') {
          navigation.replace('RenterApp');
        } else {
          navigation.replace('PilihRole');
        }
      } else {
        navigation.replace('Splash');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, session, profile, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoMark}>
          <Car size={52} color={colors.text.white} />
        </View>
        <Text style={styles.brand}>VEHIGO</Text>
        <Text style={styles.tagline}>Dari Pilihan ke Perjalanan</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: {
    ...typography.h1,
    color: colors.text.white,
    letterSpacing: 6,
  },
  tagline: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.72)',
  },
});
