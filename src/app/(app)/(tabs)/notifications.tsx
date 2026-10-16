import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useNotifications } from '@/context/notifications';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { notifications, unreadCount, isRead, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle" style={styles.title}>Notifications</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
          </ThemedText>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllAsRead} accessibilityLabel="Mark all notifications as read">
            <ThemedText type="smallBold" themeColor="primary">Mark all read</ThemedText>
          </Pressable>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${theme.primary}18` }]}>
            <SymbolView name={{ ios: 'bell', android: 'notifications_none', web: 'notifications_none' }} tintColor={theme.primary} size={28} />
          </View>
          <ThemedText type="smallBold">No notifications yet</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
            Care reminders will appear here when a plant needs attention.
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => {
            const isUnread = !isRead(notification.id);
            return (
              <Pressable
                key={notification.id}
                onPress={() => {
                  markAsRead(notification.id);
                  if (notification.plantId) router.push({ pathname: '/plant/[id]', params: { id: notification.plantId } });
                }}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.notification, isUnread && styles.unread]}>
                  <View style={[styles.notificationIcon, { backgroundColor: `${theme.statusAttention}22` }]}>
                    <SymbolView name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} tintColor={theme.statusAttention} size={20} />
                  </View>
                  <View style={styles.notificationBody}>
                    <View style={styles.notificationTitle}>
                      <ThemedText type="smallBold">{notification.title}</ThemedText>
                      {isUnread ? <View style={[styles.dot, { backgroundColor: theme.primary }]} /> : null}
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">{notification.message}</ThemedText>
                  </View>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.four },
  headerText: { flex: 1 },
  title: { fontSize: 28, lineHeight: 36 },
  list: { gap: Spacing.two },
  notification: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, padding: Spacing.three, borderRadius: Spacing.three },
  unread: { borderWidth: 1, borderColor: '#2F6F3E55' },
  notificationIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notificationBody: { flex: 1, gap: Spacing.one },
  notificationTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { padding: Spacing.five, borderRadius: Spacing.three, alignItems: 'center', gap: Spacing.two },
  emptyIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center' },
});
