import { useEffect, useState } from "react";
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
import {
  getAssignments,
  subscribe,
  unsubscribe,
  submitAssignment,
} from "../data/assignments";
import { useRouter } from "expo-router";


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


const TOP_FILTERS = ["all", "today", "upcoming", "overdue", "done", "missed"];
const TABS = ["pending", "finished", "missed"];

export default function StudentHome() {
  const router = useRouter();
  const [assignments, setAssignments] = useState(getAssignments());
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  
  const getStatusInfo = (a) => {
    if (a.submittedCount > 0) {
      
      return {
        key: "done",
        label: "Done",
        bg: "#DCFCE7",
        color: "#16A34A",
      };
    }

    if (a.reviewed && a.submittedCount === 0) {
     
      return {
        key: "missed",
        label: "Missed",
        bg: "#FEF3C7",
        color: "#B45309",
      };
    }

    if (a.deadline === todayStr) {
      return {
        key: "today",
        label: "Today",
        bg: "#DBEAFE",
        color: "#1D4ED8",
      };
    }

    if (a.deadline > todayStr) {
      return {
        key: "upcoming",
        label: "Upcoming",
        bg: "#E0F2FE",
        color: "#0369A1",
      };
    }

    return {
      key: "overdue",
      label: "Overdue",
      bg: "#FEE2E2",
      color: "#B91C1C",
    };
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleMarkAsDone = (id) => {
    submitAssignment(id);
  };

  
  const pendingList = assignments.filter(
    (a) => !a.reviewed && a.submittedCount === 0
  );
  const finishedList = assignments.filter((a) => a.submittedCount > 0);
  const missedList = assignments.filter(
    (a) => a.reviewed && a.submittedCount === 0
  );

  let baseList = pendingList;
  if (activeTab === "finished") baseList = finishedList;
  if (activeTab === "missed") baseList = missedList;

  
  const filteredList = baseList.filter((a) => {
    const status = getStatusInfo(a).key;

    if (activeFilter !== "all" && status !== activeFilter) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    pending: pendingList.length,
    finished: finishedList.length,
    missed: missedList.length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.pageTitle}>Hello, Jeremiah!</Text>

        {/*  Search bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />

        {/*  Top filters */}
        <View style={styles.filterRow}>
          {TOP_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f === "all"
                  ? "All"
                  : f === "today"
                  ? "Today"
                  : f === "upcoming"
                  ? "Upcoming"
                  : f === "overdue"
                  ? "Overdue"
                  : f === "done"
                  ? "Done"
                  : "Missed"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*  Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.finished}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Segmented control (Pending / Finished / Missed) */}
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
                setExpandedId(null);
              }}
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

        {/*  List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {filteredList.length === 0 ? (
            <Text style={styles.empty}>
              No activities.
            </Text>
          ) : (
            filteredList.map((a) => {
              const status = getStatusInfo(a);
              const expanded = expandedId === a.id;

              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => toggleExpand(a.id)}
                  activeOpacity={0.85}
                  style={styles.card}
                >
                  {/* top row */}
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{a.title}</Text>
                      <Text style={styles.cardSubject}>{a.subject}</Text>
                      <Text style={styles.cardDeadline}>
                        Deadline: {a.deadline}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: status.bg },
                      ]}
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

                  {/* expanded details */}
                  {expanded && (
                    <View style={styles.details}>
                      <Text style={styles.label}>Description</Text>
                      <Text style={styles.value}>
                        {a.description || "No description provided."}
                      </Text>

                      <Text style={styles.label}>Submission</Text>
                      <Text style={styles.value}>
                        {a.submittedCount > 0
                          ? "You have submitted this activity."
                          : "Not submitted yet."}
                      </Text>

                      {/* Go to full detail page */}
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() =>
                          router.push({
                            pathname: "/activity-details",
                            params: { id: String(a.id) },
                          })
                        }
                      >
                        <Text style={styles.detailsButtonText}>
                          View details
                        </Text>
                      </TouchableOpacity>

                      {/* Mark as done (only if pending) */}
                      {activeTab === "pending" && a.submittedCount === 0 && (
                        <TouchableOpacity
                          onPress={() => handleMarkAsDone(a.id)}
                          style={styles.doneButton}
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

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DDE7F7",
    marginRight: 8,
    marginBottom: 6,
  },
  filterChipActive: {
    backgroundColor: "#2F80ED",
  },
  filterText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F80ED",
  },
  statLabel: {
    fontSize: 12,
    color: "#4B5563",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#DCE8F5",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: "#2F80ED",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  segmentTextSelected: {
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardTopRow: {
    flexDirection: "row",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
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
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  details: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 6,
  },
  value: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  detailsButton: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F80ED",
    paddingVertical: 8,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#2F80ED",
    fontWeight: "700",
    fontSize: 14,
  },
  doneButton: {
    marginTop: 8,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
