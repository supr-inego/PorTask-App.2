import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getAssignments, subscribe, unsubscribe } from "../data/assignments";

export default function StudentProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState(
    "I love SOKOLIT."
  );
  const [isEditing, setIsEditing] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const handler = (list) => setAssignments(list);
    subscribe(handler);
    setAssignments(getAssignments());
    return () => unsubscribe(handler);
  }, []);

  const pendingCount = assignments.filter(
    (a) => !a.reviewed && a.submittedCount === 0
  ).length;

  const doneCount = assignments.filter((a) => a.submittedCount > 0).length;

  const missedCount = assignments.filter(
    (a) => a.reviewed && a.submittedCount === 0
  ).length;

  const pickImage = async () => {
    if (!isEditing) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Do you really want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userRole");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/*  Blue header banner (similar to instructor) */}
        <View style={styles.headerBanner}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri:
                  profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/*  Activity Summary */}
        <Text style={styles.sectionTitle}>My Activity Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{doneCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{missedCount}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/*  Info Cards */}
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Jeremiah Fisher</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>jeremiah.fisher@student.edu</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Student ID</Text>
          <Text style={styles.value}>2023303192</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Program</Text>
          <Text style={styles.value}>
            Bachelor of Science in Information Technology
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Year & Section</Text>
          <Text style={styles.value}>BSIT - 3rd Year</Text>
        </View>

        {/*  Editable Bio */}
        <View style={styles.card}>
          <Text style={styles.label}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              multiline
            />
          ) : (
            <Text style={styles.value}>{bio}</Text>
          )}
        </View>

        {/*  Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerBanner: {
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#FFFFFF",
  },
  editButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  sectionTitle: {
    textAlign: "center",
    fontWeight: "700",
    color: "#0B1220",
    marginBottom: 10,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#333",
  },
  input: {
    fontSize: 15,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  logoutButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
