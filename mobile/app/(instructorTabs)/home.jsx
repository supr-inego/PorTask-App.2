import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getAssignments,
  subscribe,
  unsubscribe,
  toggleReviewed,
} from "../data/assignments";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InstructorHome() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState("all"); 
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

  // 📊 counts for header stats
  const activeCount = assignments.filter((a) => !a.reviewed).length;
  const reviewedCount = assignments.filter((a) => a.reviewed).length;
  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.submittedCount || 0),
    0
  );

  //  base lists
  const activeAssignments = assignments.filter((a) => !a.reviewed);
  const reviewedAssignments = assignments.filter((a) => a.reviewed);

  //  filter logic: all/today/upcoming = only ACTIVE, reviewed = only REVIEWED
  let filtered = [];
  if (filter === "all") {
    filtered = activeAssignments;
  } else if (filter === "today") {
    filtered = activeAssignments.filter((a) => a.deadline === todayStr);
  } else if (filter === "upcoming") {
    filtered = activeAssignments.filter((a) => a.deadline > todayStr);
  } else if (filter === "reviewed") {
    filtered = reviewedAssignments;
  }

  const getStatus = (a) => {
    if (a.reviewed) {
      return {
        text: "Reviewed",
        bg: "#E5E7EB",
        color: "#4B5563",
      };
    }
    if (a.deadline === todayStr) {
      return {
        text: "Today",
        bg: "#DBEAFE",
        color: "#1D4ED8",
      };
    }
    if (a.deadline > todayStr) {
      return {
        text: "Upcoming",
        bg: "#DCFCE7",
        color: "#16A34A",
      };
    }
    return {
      text: "Overdue",
      bg: "#FEF3C7",
      color: "#B45309",
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header: title + View All */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Hello, Rochell! </Text>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/instructor-all")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {["all", "today", "upcoming", "reviewed"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterSelected,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextSelected,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.countRow}>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>{activeCount}</Text>
            <Text style={styles.countLabel}>Active</Text>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>{reviewedCount}</Text>
            <Text style={styles.countLabel}>Reviewed</Text>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countNumber}>{totalSubmissions}</Text>
            <Text style={styles.countLabel}>Submissions</Text>
          </View>
        </View>

        {/* Activity list */}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>
            No activities.
          </Text>
        ) : (
          filtered.map((a) => {
            const status = getStatus(a);
            const isExpanded = expandedId === a.id;

            return (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => toggleExpand(a.id)}
              >
                {/* Top row (always visible) */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{a.title}</Text>
                    <Text style={styles.cardSubject}>{a.subject}</Text>
                    <Text style={styles.cardDeadline}>
                      Deadline: {a.deadline}
                    </Text>
                    <Text style={styles.cardSubmissions}>
                      {a.submittedCount || 0}/{a.totalStudents || 1} submitted
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: status.bg },
                    ]}
                  >
                    <Text style={{ color: status.color, fontWeight: "600" }}>
                      {status.text}
                    </Text>
                  </View>
                </View>

                {/* Expanded content */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {a.description ? (
                      <>
                        <Text style={styles.label}>Description</Text>
                        <Text style={styles.cardDescription}>
                          {a.description}
                        </Text>
                      </>
                    ) : null}

                    {(a.category || a.points != null) && (
                      <>
                        <Text style={styles.label}>Details</Text>
                        <Text style={styles.cardDescription}>
                          {a.category ? `${a.category}` : ""}{" "}
                          {a.points != null ? `• ${a.points} pts` : ""}
                        </Text>
                      </>
                    )}

                    {a.attachments && a.attachments.length > 0 && (
                      <>
                        <Text style={styles.label}>Attachments</Text>
                        {a.attachments.map((att) => (
                          <Text key={att.id} style={styles.cardDescription}>
                            • {att.name}
                          </Text>
                        ))}
                      </>
                    )}

                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => toggleReviewed(a.id)}
                      >
                        <Text style={styles.reviewButtonText}>
                          {a.reviewed ? "Reopen" : "Mark as Reviewed"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add button */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.85}
          onPress={() => router.push("/instructor-add")}
        >
          <MaterialCommunityIcons name="plus" size={36} color="#1E40AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF3FF" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  viewAllButton: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  filterSelected: {
    backgroundColor: "#1D4ED8",
  },
  filterText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  filterTextSelected: {
    color: "#fff",
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  countBox: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  countNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },
  countLabel: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#2563EB",
  },
  cardTopRow: {
    flexDirection: "row",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardSubject: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 2,
  },
  cardDeadline: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
  cardSubmissions: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  expandedSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  cardFooterRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  empty: {
    marginTop: 24,
    textAlign: "center",
    color: "#6B7280",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },

  fabWrapper: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  fabButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#93C5FD",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
