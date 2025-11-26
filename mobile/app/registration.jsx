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
} from "react-native";

export default function Registration() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    Alert.alert("Registration Successful", "You can now log in.", [
      { text: "OK", onPress: () => router.replace("/") },
    ]);
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
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.textInput}
            placeholder="Username or Phone"
            placeholderTextColor="#9A9A9A"
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#9A9A9A" />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#9A9A9A"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9A9A9A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
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
