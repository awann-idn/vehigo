import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { TextField } from '../../components/TextField';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useOrder } from '../../hooks/useOrders';
import { createReview } from '../../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'Rating'>;

export default function RatingScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { data: order } = useOrder(route.params.id);
  const [step, setStep] = useState(1);
  const [vehicleRating, setVehicleRating] = useState(5);
  const [mitraRating, setMitraRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!user || !order) {
      navigation.replace('RenterApp');
      return;
    }

    setSubmitting(true);
    let succeeded = false;
    try {
      await Promise.all([
        order.vehicleId
          ? createReview({
              orderId: order.id,
              authorId: user.id,
              targetType: 'vehicle',
              targetId: order.vehicleId,
              rating: vehicleRating,
              body: comment.trim() || undefined,
            })
          : Promise.resolve(false),
        order.mitraId
          ? createReview({
              orderId: order.id,
              authorId: user.id,
              targetType: 'mitra',
              targetId: order.mitraId,
              rating: mitraRating,
            })
          : Promise.resolve(false),
      ]);
      succeeded = true;
    } catch (error) {
      Alert.alert('Gagal mengirim ulasan', error instanceof Error ? error.message : 'Coba lagi.');
    } finally {
      setSubmitting(false);
    }
    if (succeeded) navigation.replace('RenterApp');
  };

  return (
    <Screen scroll>
      <AppHeader title={`Langkah ${step} dari 2`} onBack={() => (step === 1 ? navigation.goBack() : setStep(1))} />
      <Stepper current={step} total={2} labelLeft="ULAS KENDARAAN" />

      {step === 1 ? (
        <View style={styles.body}>
          <Text style={styles.heading}>Bagaimana perjalanan Anda?</Text>
          <Text style={styles.subtitle}>Beri penilaian untuk kendaraan yang Anda sewa.</Text>
          <Stars value={vehicleRating} onChange={setVehicleRating} />
          <TextField
            label="Ulasan"
            placeholder="Contoh: Mobil sangat bersih, AC dingin, dan suspensi nyaman..."
            multiline
            value={comment}
            onChangeText={setComment}
            style={styles.multiline}
          />
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.heading}>Ulas Mitra</Text>
          <Text style={styles.subtitle}>
            Bagaimana pengalaman Anda dengan {order?.mitraName || 'mitra ini'}?
          </Text>
          <Card style={styles.mitraCard}>
            <Text style={styles.mitraName}>{order?.mitraName || 'Nama mitra belum tersedia'}</Text>
            <Text style={styles.mitraMeta}>Informasi mitra berasal dari pesanan Anda.</Text>
          </Card>
          <Stars value={mitraRating} onChange={setMitraRating} />
        </View>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={step === 1 ? 'Lanjutkan' : 'Kirim Ulasan'}
          loading={submitting}
          onPress={submit}
        />
        <Pressable style={styles.skip} onPress={() => navigation.replace('RenterApp')}>
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Stars({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
          <Star
            size={36}
            color={colors.secondary}
            fill={star <= value ? colors.secondary : 'transparent'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: spacing.base,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mitraCard: {
    gap: 2,
    backgroundColor: colors.surface,
  },
  mitraName: {
    ...typography.h3,
  },
  mitraMeta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  skip: {
    alignItems: 'center',
  },
  skipText: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
});
