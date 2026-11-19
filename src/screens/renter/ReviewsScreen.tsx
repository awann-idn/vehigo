import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useReviews } from '../../hooks/useReviews';

type Props = NativeStackScreenProps<RootStackParamList, 'Reviews'>;

export default function ReviewsScreen({ navigation }: Props) {
  const [tab, setTab] = React.useState('Review Produk');
  const { data: reviews = [] } = useReviews();
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <Screen scroll>
      <AppHeader title="Ulasan" onBack={() => navigation.goBack()} />
      <SegmentedTabs options={['Review Produk', 'Review Mitra']} value={tab} onChange={setTab} />

      <View style={styles.summary}>
        <Text style={styles.score}>{average.toFixed(1)}</Text>
        <Text style={styles.scoreMeta}>dari {reviews.length} ulasan</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star key={value} size={14} color={colors.secondary} fill={colors.secondary} />
          ))}
        </View>
      </View>

      {reviews.map((review) => (
        <View key={review.id} style={styles.review}>
          <View style={styles.reviewTop}>
            <Text style={styles.author}>{review.author}</Text>
            <Text style={styles.date}>{review.date}</Text>
          </View>
          <Text style={styles.starsText}>{'★'.repeat(review.rating)}</Text>
          <Text style={styles.body}>{review.body}</Text>
        </View>
      ))}
      {reviews.length === 0 && <Text style={styles.body}>Belum ada ulasan.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    gap: 2,
  },
  score: {
    ...typography.h1,
  },
  scoreMeta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  stars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
  },
  review: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 3,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  author: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  date: {
    ...typography.caption,
    color: colors.text.muted,
  },
  starsText: {
    ...typography.caption,
    color: colors.secondary,
  },
  body: {
    ...typography.bodySm,
    color: colors.text.secondary,
    lineHeight: 19,
  },
});
