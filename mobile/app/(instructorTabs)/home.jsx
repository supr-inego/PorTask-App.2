import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

import { useRouter } from "expo-router";
import {
  getAssignments,
  subscribe,
  unsubscribe,
} from "../data/assignments";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InstructorHome() {
  const router = useRouter();
  const [assignments, setAssignments] = useState(getAssignments());
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatus = (a) => {
    if (a.reviewed)
      return { text: "Reviewed", bg: "#E5E7EB", color: "#374151" };
    if (a.deadline === todayStr)
      return { text: "Today", bg: "#DBEAFE", color: "#1D4ED8" };
    if (a.deadline > todayStr)
      return { text: "Upcoming", bg: "#DCFCE7", color: "#16A34A" };
    return { text: "Overdue", bg: "#FEF3C7", color: "#B45309" };
  };

  return (
    <View style={styles.container}>
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>Instructor Dashboard</Text>
      </View>

      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {assignments.map((a) => {
          const status = getStatus(a);
          const expanded = expandedId === a.id;

          return (
            <TouchableOpacity
              key={String(a.id)}
              style={styles.card}
              onPress={() => toggleExpand(a.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{a.title}</Text>
                  <Text style={styles.subject}>{a.subject}</Text>
                  <Text style={styles.deadline}>
                    Deadline: {a.deadline}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: status.bg },
                  ]}
                >
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.text}
                  </Text>
                </View>
              </View>

              {/* Expanded Section */}
              {expanded && (
                <View style={styles.expanded}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.desc}>{a.description}</Text>

                  <Text style={styles.label}>Submissions</Text>
                  <Text style={styles.desc}>
                    {a.submittedCount}/{a.totalStudents} submitted
                  </Text>

                  {a.attachments && a.attachments.length > 0 && (
                    <>
                      <Text style={styles.label}>Attachments</Text>
                      {a.attachments.map((att, index) => (
                        <Text
                          key={att.id || `${a.id}-attachment-${index}`}
                          style={styles.desc}
                        >
                          • {att.name}
                        </Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4FF" },
  blueHeader: {
    backgroundColor: "#2F80ED",
    height: 95,
    justifyContent: "flex-end",
    paddingBottom: 18,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  contentWrapper: { paddingHorizontal: 16, paddingTop: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftColor: "#2563EB",
    borderLeftWidth: 4,
  },
  cardHeaderRow: { flexDirection: "row" },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  subject: { fontSize: 13, color: "#2563EB", marginTop: 2 },
  deadline: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    height: 25,
    justifyContent: "center",
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  expanded: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginTop: 8 },
  desc: { fontSize: 13, color: "#4B5563", marginTop: 2 },
});
