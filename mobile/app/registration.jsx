import React, { useState } from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "./lib/apiClient";

export default function Registration() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    if (username.length < 6) {
      Alert.alert("Invalid username", "Username must be at least 6 characters.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Invalid password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Registration error", data.message || "Failed to register.");
        setSubmitting(false);
        return;
      }

      // SUCCESS — Show message and send user to login
      Alert.alert(
        "Success",
        "Account created successfully! Please log in.",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );

    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign up</Text>

        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.textInput}
            placeholder="Full Name"
            placeholderTextColor="#9A9A9A"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            placeholderTextColor="#9A9A9A"
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#9A9A9A"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9A9A9A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Already have an Account?</Text>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.signUpLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
    color: "#0B1220",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F5F7FB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  textInput: {
    fontSize: 14,
    color: "#000",
    flex: 1,
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: "#2F80ED",
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  registerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  signUpRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  signUpText: {
    color: "#6B7280",
    fontSize: 13,
  },
  signUpLink: {
    color: "#2F80ED",
    fontSize: 13,
    fontWeight: "700",
  },
});
