// FILE: mobile/app/activity-details.jsx

import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAssignments,
  subscribe,
  submitAssignment,
  toggleReviewed,
  unsubscribe,
} from "../data/assignments";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export default function ActivityDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // selected assignment
  const [assignment, setAssignment] = useState(null);

  // student attachments (local only)
  const [studentFiles, setStudentFiles] = useState([]);

  // user role (student/instructor)
  const [role, setRole] = useState("student");

  // load role from storage
  useEffect(() => {
    (async () => {
      const savedRole = await AsyncStorage.getItem("userRole");
      if (savedRole) setRole(savedRole);
    })();
  }, []);

  // subscribe to assignment updates
  useEffect(() => {
    const updateFromStore = (list) => {
      const found = list.find((a) => String(a._id) === String(id));
      if (found) setAssignment(found);
    };

    updateFromStore(getAssignments());
    subscribe(updateFromStore);

    return () => unsubscribe(updateFromStore);
  }, [id]);

  // fallback screen if not found
  if (!assignment) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Activity Details</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.bodyWrapper}>
          <Text style={styles.empty}>Activity not found.</Text>
        </View>
      </View>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const isSubmitted = (assignment.submittedCount || 0) > 0;
  const isReviewed = !!assignment.reviewed;
  const isInstructor = role === "instructor";

  // computes activity status label
  const getStatus = () => {
    // instructor view
    if (isInstructor) {
      if (isReviewed) {
        return { label: "Closed", color: "#6B7280", bg: "#E5E7EB" };
      }

      if (assignment.deadline && assignment.deadline < todayStr) {
        return { label: "Overdue", color: "#F97316", bg: "#FFEDD5" };
      }

      if (assignment.deadline === todayStr) {
        return { label: "Due Today", color: "#1D4ED8", bg: "#DBEAFE" };
      }

      return { label: "Active", color: "#16A34A", bg: "#DCFCE7" };
    }

    // student view
    if (isSubmitted) return { label: "Done", color: "#22C55E", bg: "#DCFCE7" };
    if (isReviewed && !isSubmitted) {
      return { label: "Closed", color: "#6B7280", bg: "#E5E7EB" };
    }
    if (assignment.deadline === todayStr) {
      return { label: "Due Today", color: "#1D4ED8", bg: "#DBEAFE" };
    }
    if (assignment.deadline > todayStr) {
      return { label: "Upcoming", color: "#16A34A", bg: "#DCFCE7" };
    }
    return { label: "Pending", color: "#6B7280", bg: "#E5E7EB" };
  };

  const status = getStatus();

  // primary action: student submit / instructor close-reopen
  const handlePrimaryAction = async () => {
    // instructor action
    if (isInstructor) {
      try {
        await toggleReviewed(assignment._id);
        Alert.alert(
          "Success",
          isReviewed ? "Activity reopened." : "Activity closed."
        );
      } catch (e) {
        Alert.alert("Error", e.message || "Failed to update activity.");
      }
      return;
    }

    // student action
    if (isSubmitted) {
      Alert.alert("Already submitted", "You already marked this as done.");
      return;
    }

    if (isReviewed) {
      Alert.alert(
        "Closed",
        "This activity is closed. Wait for instructor to reopen it."
      );
      return;
    }

    try {
      await submitAssignment(assignment._id);
      Alert.alert("Submitted", "Your work has been marked as done.");
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to submit.");
    }
  };

  // pick student document attachment
  const handlePickDocument = async () => {
    if (isInstructor) return;
    if (isSubmitted || isReviewed) return;

    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.canceled) return;

    const file = res.assets[0];

    setStudentFiles((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: file.name || "Document",
        uri: file.uri,
        kind: "file",
      },
    ]);
  };

  // pick student image attachment
  const handlePickImage = async () => {
    if (isInstructor) return;
    if (isSubmitted || isReviewed) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (res.canceled) return;

    const img = res.assets[0];

    setStudentFiles((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "Image attachment",
        uri: img.uri,
        kind: "image",
      },
    ]);
  };

  // removes student attachment
  const handleRemoveAttachment = (fileId) => {
    if (isInstructor) return;
    if (isSubmitted || isReviewed) return;

    setStudentFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // button label/disabled
  const primaryDisabled = !isInstructor && (isSubmitted || isReviewed);

  const primaryLabel = isInstructor
    ? isReviewed
      ? "Reopen Activity"
      : "Close Activity"
    : isSubmitted
    ? "Submitted"
    : isReviewed
    ? "Closed"
    : "Mark as Done";

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Activity Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.bodyWrapper}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.mainCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.activityTitle}>{assignment.title}</Text>

            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <Text style={styles.subjectText}>{assignment.subject}</Text>

          <Text style={styles.deadlineText}>
            Deadline:{" "}
            <Text style={{ fontWeight: "700" }}>{assignment.deadline}</Text>
          </Text>

          {isInstructor && (
            <Text style={styles.deadlineText}>
              Submissions:{" "}
              <Text style={{ fontWeight: "700" }}>
                {(assignment.submittedCount || 0)}/
                {assignment.totalStudents || 0}
              </Text>
            </Text>
          )}

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Instructions</Text>
          <Text style={styles.descriptionText}>
            {assignment.description || "No description provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Attachments from Instructor</Text>

          {assignment.attachments && assignment.attachments.length > 0 ? (
            assignment.attachments.map((att, index) => (
              <View key={`${att.name}-${index}`} style={styles.attachmentRow}>
                <View style={styles.attachmentIcon} />
                <Text style={styles.attachmentName}>{att.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>
              No files attached by the instructor.
            </Text>
          )}
        </View>

        {/* instructor panel */}
        {isInstructor ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Instructor Actions</Text>
            <Text style={styles.mutedText}>
              Close the activity to prevent new student submissions. Reopen to
              allow submissions again.
            </Text>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { marginTop: 14 },
                isReviewed ? { backgroundColor: "#16A34A" } : null,
              ]}
              onPress={handlePrimaryAction}
            >
              <Text style={styles.submitButtonText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // student panel
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Your work</Text>
            <Text style={styles.mutedText}>
              Attach files or images for this activity. Once submitted or
              closed, you can no longer change attachments.
            </Text>

            {studentFiles.length === 0 ? (
              <Text style={[styles.mutedText, { marginTop: 8 }]}>
                No attachments yet.
              </Text>
            ) : (
              studentFiles.map((f) => (
                <View key={f.id} style={styles.studentAttachmentRow}>
                  <Text style={styles.attachmentName}>
                    {f.kind === "image" ? "🖼️ " : "📄 "}
                    {f.name}
                  </Text>

                  {!isSubmitted && !isReviewed && (
                    <TouchableOpacity
                      onPress={() => handleRemoveAttachment(f.id)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            <View style={styles.attachButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.attachButton,
                  (isSubmitted || isReviewed) && styles.attachButtonDisabled,
                ]}
                onPress={handlePickDocument}
                disabled={isSubmitted || isReviewed}
              >
                <Text
                  style={[
                    styles.attachButtonText,
                    (isSubmitted || isReviewed) &&
                      styles.attachButtonTextDisabled,
                  ]}
                >
                  + Add file
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.attachButton,
                  (isSubmitted || isReviewed) && styles.attachButtonDisabled,
                ]}
                onPress={handlePickImage}
                disabled={isSubmitted || isReviewed}
              >
                <Text
                  style={[
                    styles.attachButtonText,
                    (isSubmitted || isReviewed) &&
                      styles.attachButtonTextDisabled,
                  ]}
                >
                  + Add image
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                primaryDisabled && { backgroundColor: "#9CA3AF" },
              ]}
              onPress={handlePrimaryAction}
              disabled={primaryDisabled}
            >
              <Text style={styles.submitButtonText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4FF" },

  headerBar: {
    backgroundColor: "#2F80ED",
    height: 95,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  backText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },

  bodyWrapper: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  empty: {
    marginTop: 30,
    textAlign: "center",
    color: "#6B7280",
    fontStyle: "italic",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  activityTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  subjectText: { fontSize: 14, color: "#2563EB", marginTop: 4 },
  deadlineText: { fontSize: 13, color: "#4B5563", marginTop: 6 },
  separator: { borderTopWidth: 1, borderTopColor: "#E5E7EB", marginVertical: 10 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  descriptionText: { fontSize: 14, color: "#4B5563" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  attachmentRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  attachmentIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#DBEAFE",
    marginRight: 8,
  },
  attachmentName: { fontSize: 13, color: "#111827" },

  mutedText: { fontSize: 13, color: "#6B7280" },
  studentAttachmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  removeText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },

  attachButtonsRow: { flexDirection: "row", marginTop: 10 },
  attachButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F80ED",
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 6,
  },
  attachButtonDisabled: { borderColor: "#9CA3AF" },
  attachButtonText: { color: "#2F80ED", fontWeight: "700", fontSize: 13 },
  attachButtonTextDisabled: { color: "#9CA3AF" },

  submitButton: {
    marginTop: 12,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
