import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashScreen'>;

export default function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/screens/vehigo_logo.png')}
          style={styles.logoTop}
          resizeMode="contain"
        />
      </View>

      <View style={styles.illustrationWrapper}>
        <Image
          source={require('../../assets/screens/splash_screen.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>
          Dari Pilihan ke Perjalanan, Semua dalam Genggaman
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Onboarding1')}
        >
          <Text style={styles.buttonText}>MULAI SEKARANG</Text>
        </TouchableOpacity>

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
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoTop: {
    width: 140,
    height: 45,
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 320,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyright: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 20,
    opacity: 0.7,
  },
});
