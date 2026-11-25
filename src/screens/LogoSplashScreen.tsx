import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../features/auth/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'LogoSplash'>;

const MARK = require('../../assets/figma/vehigo_mark.png');

export default function LogoSplashScreen({ navigation }: Props) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.94));
  const { session, profile, isLoading } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (session) {
        if (profile?.role === 'admin') navigation.replace('AdminApp');
        else if (profile?.role === 'mitra') navigation.replace('OwnerApp');
        else if (profile?.role === 'penyewa') navigation.replace('RenterApp');
        else navigation.replace('PilihRole');
      } else {
        navigation.replace('Splash');
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [isLoading, session, profile, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image source={MARK} style={styles.mark} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30364F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 268,
    height: 110,
  },
});
