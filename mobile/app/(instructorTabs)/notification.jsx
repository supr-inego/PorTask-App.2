// FILE: mobile/app/(instructorTabs)/notification.jsx

import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getInstructorNotifications,
  refreshInstructorNotifications,
  subscribeInstructorNotifications,
  unsubscribeInstructorNotifications,
} from "../../data/instructorNotifications";

export default function InstructorNotification() {
  const [notifications, setNotifications] = useState(getInstructorNotifications());

  // subscribe to instructor notifications updates
  useEffect(() => {
    const handler = (list) => setNotifications(list);

    subscribeInstructorNotifications(handler);
    refreshInstructorNotifications().catch(() => {});

    return () => unsubscribeInstructorNotifications(handler);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        notifications.map((n, idx) => (
          <View
            key={String(n._id || n.id || `${n.date || ""}-${idx}`)}
            style={styles.card}
          >
            <Text style={styles.title}>{n.title}</Text>

            <Text style={styles.subtitle}>{n.message}</Text>

            <Text style={styles.date}>
              {n.date ? new Date(n.date).toLocaleString() : ""}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontWeight: "700",
    color: "#0B1220",
  },
  subtitle: {
    color: "#555",
    marginTop: 6,
  },
  date: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
