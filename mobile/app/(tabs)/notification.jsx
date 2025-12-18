// FILE: mobile/app/(tabs)/notification.jsx

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getNotifications,
  refreshNotifications,
  subscribeNotifications,
  unsubscribeNotifications,
} from "../../data/notifications";

export default function StudentNotification() {
  const [list, setList] = useState(getNotifications());

  // subscribe to notifications updates
  useEffect(() => {
    const handler = (snap) => setList(snap);

    subscribeNotifications(handler);
    refreshNotifications().catch(() => {});

    return () => unsubscribeNotifications(handler);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {list.length === 0 ? (
          <Text style={styles.empty}>No notifications yet.</Text>
        ) : (
          list.map((n, idx) => (
            <View
              key={String(n._id || n.id || `${n.date || ""}-${idx}`)}
              style={styles.card}
            >
              <Text style={styles.title}>{n.title || "Notification"}</Text>

              {!!n.message && <Text style={styles.message}>{n.message}</Text>}

              {!!n.date && (
                <Text style={styles.date}>{String(n.date).slice(0, 10)}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4FF" },
  scroll: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  title: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  message: { marginTop: 6, color: "#4B5563", fontSize: 13 },
  date: { marginTop: 8, color: "#94A3B8", fontSize: 12 },
});
