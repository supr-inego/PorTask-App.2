// FILE: mobile/app/index.jsx

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL, setAuthToken } from "../lib/apiClient";

const Index = () => {
  const router = useRouter();

  // UI states
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // button loading state
  const [submitting, setSubmitting] = useState(false);

  // checks saved login token + role
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        const savedRole = await AsyncStorage.getItem("userRole");
        const savedEmail = await AsyncStorage.getItem("savedEmail");

        // auto-fill email if remembered
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }

        // auto-login if token and role exist
        if (savedToken && savedRole) {
          setAuthToken(savedToken);

          if (savedRole === "student") {
            router.replace("/(tabs)/home");
          } else if (savedRole === "instructor") {
            router.replace("/(instructorTabs)/home");
          }
        }
      } catch (error) {
        console.error("Error checking saved auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // show loading screen while checking storage
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // handles login request
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // handle invalid login
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || "Login failed";

        Alert.alert("Login error", msg);
        setSubmitting(false);
        return;
      }

      // get token and user data
      const data = await res.json();
      const { token, user } = data;

      setAuthToken(token);

      // save auth info
      await AsyncStorage.multiSet([
        ["authToken", token],
        ["userRole", user.role],
        ["userData", JSON.stringify(user)],
      ]);

      // save or remove remembered email
      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
      } else {
        await AsyncStorage.removeItem("savedEmail");
      }

      // redirect based on role
      if (user.role === "student") {
        router.replace("/(tabs)/home");
      } else if (user.role === "instructor") {
        router.replace("/(instructorTabs)/home");
      } else {
        Alert.alert(
          "Unknown role",
          "Your account has an unknown role. Please contact admin."
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/image43.png")}
        style={styles.logo}
      />

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputRow}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#9A9A9A"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#9A9A9A"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#9A9A9A"
          />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#9A9A9A"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          {/* show/hide password */}
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#9A9A9A"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <MaterialCommunityIcons
              name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
              size={18}
              color="#8e9292ff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don’t have an Account?</Text>
          <TouchableOpacity onPress={() => router.push("/registration")}>
            <Text style={styles.signUpLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginTop: 10,
  },
  textInput: {
    fontSize: 14,
    color: "#000",
    flex: 1,
    marginLeft: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 15,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 10,
    color: "#9A9A9A",
    fontSize: 13,
  },
  signUpRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  signUpText: {
    fontSize: 13,
    color: "#000",
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});
