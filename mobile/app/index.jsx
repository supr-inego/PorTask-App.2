import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index = () => {
  const router = useRouter();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");

        if (savedRole === "student") {
          router.replace("/(tabs)/home");
        } else if (savedRole === "instructor") {
          router.replace("/(instructorTabs)/home");
        }
      } catch (error) {
        console.error("Error checking saved role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem("userRole", role);
      if (role === "student") {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(instructorTabs)/home");
      }
    } catch (error) {
      console.error("Error saving role:", error);
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
            name="account-outline"
            size={20}
            color="#9A9A9A"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Username, Phone or Email"
            placeholderTextColor="#9A9A9A"
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
          />
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

        <View style={styles.roleContainer}>
          <Text style={styles.roleTitle}>Login as:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "student" && styles.roleSelected,
              ]}
              onPress={() => setRole("student")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "student" && styles.roleTextSelected,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "instructor" && styles.roleSelected,
              ]}
              onPress={() => setRole("instructor")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "instructor" && styles.roleTextSelected,
                ]}
              >
                Instructor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Log In</Text>
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
  roleContainer: {
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  roleSelected: {
    backgroundColor: "#3B82F6",
  },
  roleText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  roleTextSelected: {
    color: "#fff",
    fontWeight: "bold",
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
