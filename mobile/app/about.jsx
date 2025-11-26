import { View, Text, StyleSheet } from "react-native";

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About App</Text>
      <Text style={styles.text}>Simple task manager for students & instructors.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  text: { color: "#4B5563" },
});
