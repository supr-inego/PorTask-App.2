import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getNotifications,
  subscribeNotifications,
  unsubscribeNotifications,
} from "../data/notifications";

function StudentNotification() {
  const [notifications, setNotifications] = useState(getNotifications());

  useEffect(() => {
    const handler = (list) => setNotifications(list);
    subscribeNotifications(handler);
    return () => unsubscribeNotifications(handler);
  }, []);

  const now = new Date();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getStartOfWeek = (d) => {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1); 
    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const startOfWeek = getStartOfWeek(now);

  const parsed = notifications.map((n) => {
    const dateObj = new Date(n.date);
    return { ...n, _dateObj: dateObj };
  });

  const todayList = parsed.filter((n) => isSameDay(n._dateObj, now));
  const thisWeekList = parsed.filter(
    (n) =>
      !isSameDay(n._dateObj, now) &&
      n._dateObj >= startOfWeek &&
      n._dateObj <= now
  );
  const earlierList = parsed.filter((n) => n._dateObj < startOfWeek);

  const renderSection = (title, list) => {
    if (list.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {list.map((n) => (
          <View key={n.id} style={styles.card}>
            <Text style={styles.title}>{n.title}</Text>
            {n.message ? (
              <Text style={styles.message}>{n.message}</Text>
            ) : null}
            <Text style={styles.dateText}>
              {n._dateObj.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const hasAny =
    todayList.length > 0 ||
    thisWeekList.length > 0 ||
    earlierList.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {!hasAny ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              You’ll see updates here when instructors post or update activities.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {renderSection("Today", todayList)}
            {renderSection("This Week", thisWeekList)}
            {renderSection("Earlier", earlierList)}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Background
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  scroll: {
    flex: 1,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },

  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default StudentNotification;
