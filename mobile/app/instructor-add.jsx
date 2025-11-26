import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { addAssignment, getAssignments } from "./data/assignments";

export default function InstructorAddAssignment() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Assignment");
  const [points, setPoints] = useState("100");

  const [deadline, setDeadline] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [attachments, setAttachments] = useState([]); // {id, type, name, uri}
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);

  const todayISO = new Date().toISOString().split("T")[0];

  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      const file = res.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          type: "image",
          name: file.fileName || "Image",
          uri: file.uri,
        },
      ]);
    }
    setShowAttachmentSheet(false);
  };

  const handlePickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.type === "success") {
      setAttachments((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          type: "file",
          name: res.name,
          uri: res.uri,
        },
      ]);
    }
    setShowAttachmentSheet(false);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAdd = () => {
    if (!title.trim() || !subject.trim() || !description.trim()) {
      Alert.alert("Missing fields", "Please fill in title, subject, and description.");
      return;
    }

    const dl = deadline.toISOString().split("T")[0];

    const all = getAssignments();
    const conflict = all.some((a) => a.deadline === dl && !a.reviewed);
    if (conflict) {
      Alert.alert(
        "Conflict",
        "There is already an active activity with this deadline."
      );
      return;
    }

    const numericPoints = Number(points) || 0;

    addAssignment({
      title,
      subject,
      description,
      deadline: dl,
      category,
      points: numericPoints,
      attachments,
    });

    Alert.alert("Success", "Assignment added!", [
      {
        text: "OK",
        onPress: () => router.replace("/(instructorTabs)/home"),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add New Assignment</Text>

        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="e.g. Project Proposal"
          />

          {/* Subject */}
          <Text style={styles.label}>Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            placeholder="e.g. Software Engineering"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 90 }]}
            placeholder="Describe the assignment..."
            multiline
          />

          {/* Category + Points row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.chipRow}>
                {["Assignment", "Quiz", "Exam", "Lab"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      category === cat && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ width: 90 }}>
              <Text style={styles.label}>Points</Text>
              <TextInput
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
                style={styles.input}
                placeholder="100"
              />
            </View>
          </View>

          {/* Deadline */}
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.input}
          >
            <Text>{deadline.toDateString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              minimumDate={new Date(todayISO)}
              onChange={(_, date) => {
                setShowPicker(false);
                if (date) setDeadline(date);
              }}
            />
          )}

          {/* Attachments */}
          <Text style={styles.label}>Attachments</Text>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentSheet(true)}
          >
            <Text style={styles.attachButtonText}>Add attachment</Text>
          </TouchableOpacity>

          {attachments.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {attachments.map((att) => (
                <View key={att.id} style={styles.attachmentItem}>
                  {att.type === "image" ? (
                    <Image source={{ uri: att.uri }} style={styles.attachmentThumb} />
                  ) : (
                    <View style={styles.fileIcon}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>PDF</Text>
                    </View>
                  )}
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeAttachment(att.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Text style={styles.submitText}>Add Assignment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom-sheet style attachment picker */}
      <Modal
        visible={showAttachmentSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAttachmentSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add attachment</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickImage}
            >
              <Text style={styles.sheetOptionText}>Choose image from gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickFile}
            >
              <Text style={styles.sheetOptionText}>Choose file (PDF, docs, etc.)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetOption, { marginTop: 8 }]}
              onPress={() => setShowAttachmentSheet(false)}
            >
              <Text style={[styles.sheetOptionText, { color: "#EF4444" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },
  container: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
    marginTop: 4,
  },
  chipActive: {
    backgroundColor: "#2563EB",
  },
  chipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  attachButton: {
    marginTop: 4,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  attachButtonText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 8,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentName: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  removeText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 6,
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 22,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  sheetOption: {
    paddingVertical: 10,
  },
  sheetOptionText: {
    fontSize: 15,
    color: "#111827",
  },
});
