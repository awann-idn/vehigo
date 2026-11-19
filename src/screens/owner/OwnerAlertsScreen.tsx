import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, BellRing, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const toneIcon = {
  success: CheckCircle2,
  info: BellRing,
  warning: AlertTriangle,
};

export default function OwnerAlertsScreen() {
  const { user } = useAuth();
  const { data: ownerNotifications = [] } = useNotifications(user?.id);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Notifikasi</Text>
        <Text style={styles.subtitle}>Aktivitas terbaru seputar usaha Anda</Text>
      </View>

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
