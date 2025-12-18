// FILE: mobile/app/instructor-activities.jsx

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { subscribe, unsubscribe } from "../data/assignments";

export default function InstructorActivities() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);

  // listen for assignments updates
  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Activities</Text>

        {/* spacer to keep title centered */}
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
      >
        {assignments.map((a) => (
          <View style={styles.card} key={a.id}>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.subject}>{a.subject}</Text>
            <Text style={styles.deadline}>Deadline: {a.deadline}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
    paddingTop: 50,
  },

  // header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backText: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
  },

  // cards
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 6,
    borderLeftColor: "#2563EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1220",
  },
  subject: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  deadline: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
  },
});
