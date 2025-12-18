// FILE: mobile/app/(tabs)/home.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { useFocusEffect } from "@react-navigation/native";
import {
  getAssignments,
  refreshAssignments,
  submitAssignment,
  subscribe,
  unsubscribe,
} from "../../data/assignments";

// enables LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = ["pending", "finished", "missed"];

export default function StudentHome() {
  const router = useRouter();

  // assignments + UI states
  const [assignments, setAssignments] = useState(getAssignments());
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  // subscribe to assignments updates
  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  // refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshAssignments();
    }, [])
  );

  const todayStr = new Date().toISOString().split("T")[0];

  // tab lists
  const pendingList = useMemo(
    () => assignments.filter((a) => !a.reviewed && (a.submittedCount || 0) === 0),
    [assignments]
  );

  const finishedList = useMemo(
    () => assignments.filter((a) => (a.submittedCount || 0) > 0),
    [assignments]
  );

  const missedList = useMemo(
    () => assignments.filter((a) => a.reviewed && (a.submittedCount || 0) === 0),
    [assignments]
  );

  let baseList = pendingList;
  if (activeTab === "finished") baseList = finishedList;
  if (activeTab === "missed") baseList = missedList;

  // filters depend on active tab
  const TOP_FILTERS = useMemo(() => {
    if (activeTab === "pending") return ["all", "today", "upcoming", "overdue"];
    if (activeTab === "finished") return ["all", "today", "this_week", "older"];
    return ["all", "this_week", "older"];
  }, [activeTab]);

  // returns start of current week (Mon)
  const getStartOfWeek = (d) => {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);

    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);

    return copy;
  };

  const startOfWeek = getStartOfWeek(new Date());

  // applies top filter based on current tab
  const applyTabFilter = (a) => {
    if (activeFilter === "all") return true;

    if (activeTab === "pending") {
      if (activeFilter === "today") return a.deadline === todayStr;
      if (activeFilter === "upcoming") return a.deadline > todayStr;
      if (activeFilter === "overdue") return a.deadline < todayStr;
      return true;
    }

    const d = new Date(a.updatedAt || a.createdAt || Date.now());

    if (activeFilter === "today") {
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }

    if (activeFilter === "this_week") return d >= startOfWeek;
    if (activeFilter === "older") return d < startOfWeek;

    return true;
  };

  // applies search + filter
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();

    return baseList.filter((a) => {
      if (!applyTabFilter(a)) return false;
      if (!q) return true;

      return (
        (a.title || "").toLowerCase().includes(q) ||
        (a.subject || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q)
      );
    });
  }, [baseList, search, activeFilter, activeTab]);

  // computes status pill info
  const getStatusInfo = (a) => {
    if ((a.submittedCount || 0) > 0) {
      return { label: "Done", bg: "#DCFCE7", color: "#16A34A" };
    }
    if (a.reviewed && (a.submittedCount || 0) === 0) {
      return { label: "Missed", bg: "#FEF3C7", color: "#B45309" };
    }
    if (a.deadline === todayStr) {
      return { label: "Today", bg: "#DBEAFE", color: "#1D4ED8" };
    }
    if (a.deadline > todayStr) {
      return { label: "Upcoming", bg: "#E0F2FE", color: "#0369A1" };
    }
    return { label: "Overdue", bg: "#FEE2E2", color: "#B91C1C" };
  };

  // expands/collapses a card
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // marks an activity as done
  const handleMarkAsDone = async (a) => {
    if (a.reviewed) return;

    try {
      await submitAssignment(a._id);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedId(null);
      setActiveTab("finished");
      setActiveFilter("all");
    } catch (e) {
      console.error(e);
    }
  };

  // label for filter chips
  const chipLabel = (f) => {
    if (f === "all") return "All";
    if (f === "today") return "Today";
    if (f === "upcoming") return "Upcoming";
    if (f === "overdue") return "Overdue";
    if (f === "this_week") return "This Week";
    return "Older";
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.pageTitle}>Hello!</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />

        {/* filter chips */}
        <View style={styles.filterRow}>
          {TOP_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {chipLabel(f)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* tabs */}
        <View style={styles.segmentContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentButton,
                activeTab === tab && styles.segmentSelected,
              ]}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setActiveTab(tab);
                setActiveFilter("all");
                setExpandedId(null);
              }}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === tab && styles.segmentTextSelected,
                ]}
              >
                {tab === "pending"
                  ? "Pending"
                  : tab === "finished"
                  ? "Finished"
                  : "Missed"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* list */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {filteredList.length === 0 ? (
            <Text style={styles.empty}>No activities.</Text>
          ) : (
            filteredList.map((a) => {
              const status = getStatusInfo(a);
              const expanded = expandedId === a._id;

              return (
                <TouchableOpacity
                  key={a._id}
                  onPress={() => toggleExpand(a._id)}
                  activeOpacity={0.88}
                  style={styles.card}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{a.title}</Text>
                      <Text style={styles.cardSubject}>{a.subject}</Text>
                      <Text style={styles.cardDeadline}>
                        Deadline: {a.deadline}
                      </Text>
                    </View>

                    <View
                      style={[styles.statusPill, { backgroundColor: status.bg }]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: status.color },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {expanded && (
                    <View style={styles.details}>
                      <Text style={styles.label}>Description</Text>
                      <Text style={styles.value}>
                        {a.description || "No description provided."}
                      </Text>

                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() =>
                          router.push({
                            pathname: "/activity-details",
                            params: { id: String(a._id) },
                          })
                        }
                        activeOpacity={0.9}
                      >
                        <Text style={styles.detailsButtonText}>View details</Text>
                      </TouchableOpacity>

                      {/* only show mark as done for pending + active */}
                      {activeTab === "pending" &&
                        !a.reviewed &&
                        (a.submittedCount || 0) === 0 && (
                          <TouchableOpacity
                            onPress={() => handleMarkAsDone(a)}
                            style={styles.doneButton}
                            activeOpacity={0.9}
                          >
                            <Text style={styles.doneButtonText}>
                              Mark as Done
                            </Text>
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
  contentWrapper: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },

  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1220",
    marginBottom: 8,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 10,
  },

  filterRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DDE7F7",
    marginRight: 8,
    marginBottom: 6,
  },
  filterChipActive: { backgroundColor: "#2F80ED" },
  filterText: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },

  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#DCE8F5",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 10,
  },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: "center" },
  segmentSelected: { backgroundColor: "#2F80ED" },
  segmentText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  segmentTextSelected: { color: "#FFFFFF" },

  scroll: { flex: 1 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardTopRow: { flexDirection: "row" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSubject: { fontSize: 13, color: "#2563EB", marginTop: 2 },
  cardDeadline: { fontSize: 13, color: "#4B5563", marginTop: 4 },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  statusPillText: { fontSize: 12, fontWeight: "600" },

  details: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: { fontSize: 13, fontWeight: "700", color: "#4B5563", marginTop: 6 },
  value: { fontSize: 13, color: "#374151", marginTop: 2 },

  detailsButton: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F80ED",
    paddingVertical: 8,
    alignItems: "center",
  },
  detailsButtonText: { color: "#2F80ED", fontWeight: "700", fontSize: 14 },

  doneButton: {
    marginTop: 8,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  doneButtonText: { color: "#FFFFFF", fontWeight: "700" },

  empty: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
