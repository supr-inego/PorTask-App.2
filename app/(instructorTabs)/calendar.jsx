// app/(instructorTabs)/calendar.jsx
// 📌 InstructorCalendar.jsx
// 🗓️ This screen allows instructors to view all active assignments on a calendar.

import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { getAssignments, subscribe, unsubscribe } from "../data/assignments";

export default function InstructorCalendar() {
  const [assignments, setAssignments] = useState(getAssignments());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    return () => unsubscribe(handler);
  }, []);

  const activeAssignments = assignments.filter((a) => !a.reviewed);

  const markedDates = {};
  activeAssignments.forEach((a) => {
    if (a.deadline) {
      markedDates[a.deadline] = {
        marked: true,
        dotColor: "#2F80ED",
        selected: a.deadline === selectedDate,
        selectedColor: "#2F80ED",
      };
    }
  });

  const assignmentsForSelectedDate = selectedDate
    ? activeAssignments.filter((a) => a.deadline === selectedDate)
    : [];

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: "#fff",
          selectedDayBackgroundColor: "#2F80ED",
          todayTextColor: "#2F80ED",
          arrowColor: "#2F80ED",
        }}
      />

      <ScrollView
        style={styles.info}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {selectedDate ? (
          assignmentsForSelectedDate.length > 0 ? (
            <>
              <Text style={styles.title}>Activities on {selectedDate}</Text>
              {assignmentsForSelectedDate.map((a) => (
                <View key={a.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemSubject}>{a.subject}</Text>
                  <Text style={styles.itemDesc}>{a.description}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noActivities}>
              No active activities for this date
            </Text>
          )
        ) : (
          <Text style={styles.noActivities}>
            Select a date to view activities
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4FF", padding: 12 },
  info: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
  },
  title: { fontWeight: "700", marginBottom: 8, fontSize: 16 },
  itemCard: {
    backgroundColor: "#F2F6FF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: { fontWeight: "700", color: "#0B1220" },
  itemSubject: { color: "#2F80ED", marginBottom: 4, fontSize: 13 },
  itemDesc: { color: "#444" },
  noActivities: {
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
  },
});
