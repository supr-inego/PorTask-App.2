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
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAssignments,
  subscribe,
  unsubscribe,
} from "./data/assignments";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InstructorAllActivities() {
  const router = useRouter();
  const [assignments, setAssignments] = useState(getAssignments());
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");

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
    if (a.reviewed) return { text: "Reviewed", bg: "#E5E7EB", color: "#374151" };
    if (a.deadline === todayStr) return { text: "Today", bg: "#DBEAFE", color: "#1D4ED8" };
    if (a.deadline > todayStr) return { text: "Upcoming", bg: "#DCFCE7", color: "#16A34A" };
    return { text: "Overdue", bg: "#FEF3C7", color: "#B45309" };
  };

  const filteredAssignments = assignments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* 🔵 Header like Dashboard */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>All Activities</Text>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.contentWrapper}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backRow}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Search */}
        <TextInput
          style={styles.searchBox}
          placeholder="Search activities (title, subject, description)..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {filteredAssignments.length === 0 ? (
            <Text style={styles.empty}>No activities match your search.</Text>
          ) : (
            filteredAssignments.map((a) => {
              const status = getStatus(a);
              const expanded = expandedId === a.id;

              return (
                <TouchableOpacity
                  key={a.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => toggleExpand(a.id)}
                >
                  <View style={styles.cardTop}>
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
                      <Text
                        style={[
                          styles.statusText,
                          { color: status.color },
                        ]}
                      >
                        {status.text}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded */}
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
                          {a.attachments.map((att) => (
                            <Text key={att.id} style={styles.desc}>
                              • {att.name}
                            </Text>
                          ))}
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },

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
    color: "#FFFFFF",
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  backRow: {
    marginBottom: 6,
  },
  backText: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "600",
  },

  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardTop: {
    flexDirection: "row",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subject: {
    color: "#2563EB",
    marginTop: 2,
    fontSize: 13,
  },
  deadline: {
    color: "#4B5563",
    fontSize: 13,
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 10,
    height: 25,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  expanded: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    color: "#4B5563",
  },
  desc: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
