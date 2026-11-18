import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, BellRing, CheckCircle2, MessageCircle } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ownerNotifications } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerApp'>;

const toneIcon = {
  success: CheckCircle2,
  info: BellRing,
  warning: AlertTriangle,
};

export default function OwnerAlertsScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Notifikasi</Text>
        <Text style={styles.subtitle}>Aktivitas terbaru seputar usaha Anda</Text>
      </View>

      <Pressable style={styles.chatLink} onPress={() => navigation.navigate('ChatDetail', { id: 'c1' })}>
        <MessageCircle size={18} color={colors.primary} />
        <Text style={styles.chatText}>Buka Chat Penyewa</Text>
      </Pressable>

      <View style={styles.list}>
        {ownerNotifications.map((item) => {
          const Icon = toneIcon[item.tone];
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconBadge}>
                <Icon
                  size={18}
                  color={
                    item.tone === 'success'
                      ? colors.success
                      : item.tone === 'warning'
                        ? colors.warning
                        : colors.primary
                  }
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.time}>{item.time}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    gap: 2,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.muted,
  },
  chatLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: 14,
    backgroundColor: colors.secondaryButton,
  },
  chatText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.base,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  time: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  cardTitle: {
    ...typography.bodySm,
    fontWeight: '700',
  },
  cardBody: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});
