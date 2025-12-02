import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getAssignments,
  subscribe,
  unsubscribe,
  submitAssignment,
} from "./data/assignments";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export default function ActivityDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const numericId = Number(id);

  const [assignment, setAssignment] = useState(null);
  const [studentFiles, setStudentFiles] = useState([]);

  useEffect(() => {
    const updateFromStore = (list) => {
      const found = list.find((a) => a.id === numericId);
      if (found) setAssignment(found);
    };

    updateFromStore(getAssignments());
    subscribe(updateFromStore);
    return () => unsubscribe(updateFromStore);
  }, [numericId]);

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

  const isSubmitted = assignment.submittedCount > 0;
  const isReviewed = assignment.reviewed;

  const getStatus = () => {
    if (isSubmitted) {
      return { label: "Done", color: "#22C55E", bg: "#DCFCE7" };
    }
    if (isReviewed && !isSubmitted) {
      return { label: "Missed", color: "#F97316", bg: "#FFEDD5" };
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

  const handleMarkAsDone = () => {
    if (isSubmitted) {
      Alert.alert("Already submitted", "You already marked this as done.");
      return;
    }
    submitAssignment(assignment.id);
    Alert.alert("Submitted", "Your work has been marked as done.");
  };

  //  File pickers (disabled if already submitted)
  const handlePickDocument = async () => {
    if (isSubmitted) return;
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

  const handlePickImage = async () => {
    if (isSubmitted) return;
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

  const handleRemoveAttachment = (fileId) => {
    if (isSubmitted) return; // lock removal after submission
    setStudentFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

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
        {/* Main info card */}
        <View style={styles.mainCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.activityTitle}>{assignment.title}</Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: status.bg },
              ]}
            >
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

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Instructions</Text>
          <Text style={styles.descriptionText}>
            {assignment.description || "No description provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Attachments from Instructor</Text>
          {assignment.attachments && assignment.attachments.length > 0 ? (
            assignment.attachments.map((att) => (
              <View key={att.id} style={styles.attachmentRow}>
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

        {/* Student work */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Your work</Text>
          <Text style={styles.mutedText}>
            Attach files or images for this activity. Once submitted, you can no
            longer change attachments.
          </Text>

          {/* List of attachments */}
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
                {!isSubmitted && (
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(f.id)}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}

          {/* Add attachment buttons (disabled after submit) */}
          <View style={styles.attachButtonsRow}>
            <TouchableOpacity
              style={[
                styles.attachButton,
                isSubmitted && styles.attachButtonDisabled,
              ]}
              onPress={handlePickDocument}
              disabled={isSubmitted}
            >
              <Text
                style={[
                  styles.attachButtonText,
                  isSubmitted && styles.attachButtonTextDisabled,
                ]}
              >
                + Add file
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.attachButton,
                isSubmitted && styles.attachButtonDisabled,
              ]}
              onPress={handlePickImage}
              disabled={isSubmitted}
            >
              <Text
                style={[
                  styles.attachButtonText,
                  isSubmitted && styles.attachButtonTextDisabled,
                ]}
              >
                + Add image
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitted && { backgroundColor: "#9CA3AF" },
            ]}
            onPress={handleMarkAsDone}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitted ? "Submitted" : "Mark as Done"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },
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
  backText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginVertical: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
  },
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  attachmentIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#DBEAFE",
    marginRight: 8,
  },
  attachmentName: {
    fontSize: 13,
    color: "#111827",
  },
  mutedText: {
    fontSize: 13,
    color: "#6B7280",
  },
  studentAttachmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  removeText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  attachButtonsRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  attachButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F80ED",
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 6,
  },
  attachButtonDisabled: {
    borderColor: "#9CA3AF",
  },
  attachButtonText: {
    color: "#2F80ED",
    fontWeight: "700",
    fontSize: 13,
  },
  attachButtonTextDisabled: {
    color: "#9CA3AF",
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
