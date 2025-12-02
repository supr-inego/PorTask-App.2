import React, { useState } from "react";
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

const InstructorProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState(
    "rara sah RG pa immortal ngani, tatagos kaba sah?."
  );
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    if (!isEditing) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
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
          try {
            await AsyncStorage.removeItem("userRole");
            router.replace("/"); // back to login
          } catch (error) {
            console.log("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.headerBanner}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri: profileImage
                ? profileImage
                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
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

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Mr. Rochell Mark Mananggit</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>rochell.mananggit@university.edu</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Instructor ID</Text>
        <Text style={styles.value}>INS-2025-0001</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Department</Text>
        <Text style={styles.value}>
          College of Information Technology & Computing
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Position</Text>
        <Text style={styles.value}>Instructor</Text>
      </View>

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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default InstructorProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  headerBanner: {
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 25,
    borderRadius: 15,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
