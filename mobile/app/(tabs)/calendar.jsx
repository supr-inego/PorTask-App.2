import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { getAssignments, subscribe, unsubscribe } from "../data/assignments";
import { useRouter } from "expo-router";

export default function StudentCalendar() {
  const [assignments, setAssignments] = useState(getAssignments());
  const [selectedDate, setSelectedDate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const pending = assignments.filter(
    (a) => !a.reviewed && a.submittedCount === 0
  );
  const finished = assignments.filter((a) => a.submittedCount > 0);
  const missed = assignments.filter(
    (a) => a.reviewed && a.submittedCount === 0
  );

  const markedDates = {};

  const addDot = (date, color, key) => {
    if (!date) return;
    if (!markedDates[date]) markedDates[date] = { dots: [] };
    markedDates[date].dots.push({ key, color });
  };

  pending.forEach((a) =>
    addDot(a.deadline, "#2563EB", `p-${a.id}`)
  );
  finished.forEach((a) =>
    addDot(a.deadline, "#22C55E", `f-${a.id}`)
  );
  missed.forEach((a) =>
    addDot(a.deadline, "#F97316", `m-${a.id}`)
  );

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: "#2F80ED",
    };
  }

  const assignmentsForSelectedDate = selectedDate
    ? assignments.filter((a) => a.deadline === selectedDate)
    : [];

  const getStatusLabel = (a) => {
    if (a.submittedCount > 0) return "Done";
    if (a.reviewed && a.submittedCount === 0) return "Missed";
    if (a.deadline === todayStr) return "Today";
    if (a.deadline > todayStr) return "Upcoming";
    return "Pending";
  };

  const getStatusColor = (a) => {
    if (a.submittedCount > 0) return "#22C55E";
    if (a.reviewed && a.submittedCount === 0) return "#F97316";
    if (a.deadline === todayStr) return "#1D4ED8";
    if (a.deadline > todayStr) return "#16A34A";
    return "#6B7280";
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
            <Text style={styles.legendText}>Done</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
        </View>

        {/* Calendar */}
        <Calendar
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            calendarBackground: "#FFFFFF",
            todayTextColor: "#2F80ED",
            arrowColor: "#2F80ED",
            monthTextColor: "#111827",
            textSectionTitleColor: "#6B7280",
          }}
          style={styles.calendar}
        />

        {/* List */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {!selectedDate ? (
            <Text style={styles.empty}>
              Select a date to view activities.
            </Text>
          ) : assignmentsForSelectedDate.length === 0 ? (
            <Text style={styles.empty}>
              No activities scheduled on {selectedDate}.
            </Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Activities on {selectedDate}
              </Text>
              {assignmentsForSelectedDate.map((a) => {
                const statusLabel = getStatusLabel(a);
                const statusColor = getStatusColor(a);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/activity-details",
                        params: { id: String(a.id) },
                      })
                    }
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{a.title}</Text>
                        <Text style={styles.cardSubject}>{a.subject}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: `${statusColor}1A` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: statusColor },
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                    {a.description ? (
                      <Text style={styles.cardDescription}>
                        {a.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </>
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
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#4B5563",
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubject: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
