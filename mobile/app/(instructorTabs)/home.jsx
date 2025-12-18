// FILE: mobile/app/(instructorTabs)/home.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAssignments,
  refreshAssignments,
  subscribe,
  unsubscribe,
} from "../../data/assignments";

export default function InstructorHome() {
  const router = useRouter();

  // assignments + filter state
  const [assignments, setAssignments] = useState(getAssignments());
  const [filter, setFilter] = useState("All");

  // subscribe to assignments updates + refresh on mount
  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);

    refreshAssignments().catch(() => {});

    return () => unsubscribe(handler);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // active (not reviewed) assignments
  const activeAssignments = useMemo(
    () => assignments.filter((a) => !a.reviewed),
    [assignments]
  );

  // dashboard counts
  const counts = useMemo(() => {
    const active = activeAssignments.length;
    const reviewed = assignments.filter((a) => !!a.reviewed).length;
    const submissions = assignments.reduce(
      (sum, a) => sum + (a.submittedCount || 0),
      0
    );

    return { active, reviewed, submissions };
  }, [assignments, activeAssignments]);

  // filtered list based on chip selection
  const filtered = useMemo(() => {
    const list = activeAssignments;

    if (filter === "All") return list;

    if (filter === "Today") {
      return list.filter((a) => a.deadline === todayStr);
    }

    if (filter === "Upcoming") {
      return list.filter((a) => a.deadline && a.deadline > todayStr);
    }

    if (filter === "Overdue") {
      return list.filter((a) => a.deadline && a.deadline < todayStr);
    }

    return list;
  }, [activeAssignments, filter, todayStr]);

  // status pill for cards
  const statusFor = (a) => {
    if (a.deadline && a.deadline < todayStr) {
      return { text: "Overdue", bg: "#FFEDD5", color: "#F97316" };
    }
    if (a.deadline === todayStr) {
      return { text: "Today", bg: "#DBEAFE", color: "#1D4ED8" };
    }
    return { text: "Active", bg: "#DCFCE7", color: "#16A34A" };
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.rowBetween}>
          <Text style={styles.welcome}>Welcome, Instructor!</Text>

          <TouchableOpacity onPress={() => router.push("/instructor-all")}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* filter chips */}
        <View style={styles.filterRow}>
          {["All", "Today", "Upcoming", "Overdue"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{counts.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>{counts.reviewed}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>{counts.submissions}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
        </View>

        {/* list */}
        <ScrollView
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No activities.</Text>
          ) : (
            filtered.map((a) => {
              const s = statusFor(a);

              return (
                <TouchableOpacity
                  key={String(a._id || a.id)}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/activity-details?id=${a._id}`)}
                >
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{a.title}</Text>
                      <Text style={styles.subject}>{a.subject}</Text>
                      <Text style={styles.deadline}>Deadline: {a.deadline}</Text>

                      <Text style={styles.submissions}>
                        Submissions: {(a.submittedCount || 0)}/
                        {a.totalStudents || 0} submitted
                      </Text>
                    </View>

                    <View style={[styles.tag, { backgroundColor: s.bg }]}>
                      <Text style={[styles.tagText, { color: s.color }]}>
                        {s.text}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* add activity button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/instructor-add")}
          activeOpacity={0.9}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4FF" },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  viewAll: { color: "#2563EB", fontWeight: "700" },

  filterRow: { flexDirection: "row", marginTop: 10, gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#2563EB" },
  chipText: { fontWeight: "700", color: "#374151", fontSize: 12 },
  chipTextActive: { color: "#fff" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statNum: { fontSize: 18, fontWeight: "900", color: "#2563EB" },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "700",
  },

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
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardTop: { flexDirection: "row" },

  title: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  subject: { color: "#2563EB", marginTop: 2, fontSize: 13 },
  deadline: { color: "#4B5563", fontSize: 13, marginTop: 4 },
  submissions: {
    color: "#4B5563",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    height: 25,
    justifyContent: "center",
    marginLeft: 10,
  },
  tagText: { fontSize: 12, fontWeight: "800" },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: -2 },
});
