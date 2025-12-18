// FILE: mobile/app/instructor-all.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAssignments,
  subscribe,
  unsubscribe,
  toggleReviewed,
} from "../data/assignments";

// enables LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// gets timestamp from Mongo ObjectId (fallback sorting)
function getMongoIdTimestampMs(id) {
  try {
    if (!id || typeof id !== "string" || id.length < 8) return 0;

    const seconds = parseInt(id.substring(0, 8), 16);
    if (Number.isNaN(seconds)) return 0;

    return seconds * 1000;
  } catch {
    return 0;
  }
}

export default function InstructorAll() {
  const router = useRouter();

  // assignments list from store
  const [assignments, setAssignments] = useState(getAssignments());

  // which card is expanded
  const [expandedId, setExpandedId] = useState(null);

  // search input
  const [search, setSearch] = useState("");

  // subscribe to assignments updates
  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  // sort assignments newest -> oldest
  const sorted = useMemo(() => {
    const copy = Array.isArray(assignments) ? [...assignments] : [];

    copy.sort((a, b) => {
      const aMs =
        (a?.createdAt ? new Date(a.createdAt).getTime() : 0) ||
        getMongoIdTimestampMs(a?._id) ||
        0;

      const bMs =
        (b?.createdAt ? new Date(b.createdAt).getTime() : 0) ||
        getMongoIdTimestampMs(b?._id) ||
        0;

      return bMs - aMs;
    });

    return copy;
  }, [assignments]);

  // filter assignments by search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((a) => {
      return (
        (a?.title || "").toLowerCase().includes(q) ||
        (a?.subject || "").toLowerCase().includes(q) ||
        (a?.description || "").toLowerCase().includes(q)
      );
    });
  }, [sorted, search]);

  // expands or collapses a card
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // reopens a reviewed activity
  const handleReopen = (a) => {
    Alert.alert("Reopen Activity", "Do you want to reopen this activity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reopen",
        onPress: async () => {
          try {
            await toggleReviewed(a._id);
            setExpandedId(null);
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to reopen activity.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Activities</Text>
      </View>

      <View style={styles.content}>
        {/* back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* search input */}
        <TextInput
          style={styles.searchBox}
          placeholder="Search activities..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No activities match your search.</Text>
          ) : (
            filtered.map((a) => {
              const id = a._id || a.id;
              const expanded = expandedId === id;

              return (
                <TouchableOpacity
                  key={String(id)}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => toggleExpand(id)}
                >
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{a.title}</Text>
                      <Text style={styles.subject}>{a.subject}</Text>
                      <Text style={styles.deadline}>
                        Deadline: {a.deadline}
                      </Text>
                    </View>

                    {/* status tag */}
                    {a.reviewed ? (
                      <View style={styles.reviewedTag}>
                        <Text style={styles.reviewedText}>Reviewed</Text>
                      </View>
                    ) : (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    )}
                  </View>

                  {expanded && (
                    <View style={styles.expanded}>
                      <Text style={styles.label}>Description</Text>
                      <Text style={styles.desc}>{a.description || "-"}</Text>

                      <Text style={styles.label}>Submissions</Text>
                      <Text style={styles.desc}>
                        {(a.submittedCount || 0)}/{a.totalStudents || 0}{" "}
                        submitted
                      </Text>

                      {/* only reviewed activities can be reopened */}
                      {a.reviewed && (
                        <TouchableOpacity
                          style={styles.reopenBtn}
                          onPress={() => handleReopen(a)}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.reopenText}>Reopen Activity</Text>
                        </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#EAF4FF" },

  header: {
    backgroundColor: "#2F80ED",
    height: 95,
    justifyContent: "flex-end",
    paddingBottom: 18,
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  backRow: { marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: "700", color: "#111827" },

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
  cardTop: { flexDirection: "row" },

  title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  subject: { color: "#2563EB", marginTop: 2, fontSize: 13 },
  deadline: { color: "#4B5563", fontSize: 13, marginTop: 4 },

  activeTag: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 25,
    justifyContent: "center",
    marginLeft: 10,
  },
  activeText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },

  reviewedTag: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 25,
    justifyContent: "center",
    marginLeft: 10,
  },
  reviewedText: { fontSize: 12, fontWeight: "700", color: "#374151" },

  expanded: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginTop: 6 },
  desc: { fontSize: 13, color: "#4B5563", marginTop: 2 },

  reopenBtn: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  reopenText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
