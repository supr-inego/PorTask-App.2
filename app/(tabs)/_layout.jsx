import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2F80ED",
        tabBarInactiveTintColor: "gray",
        headerStyle: { backgroundColor: "#2F80ED" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },

        // remove ripple
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={Platform.OS === "android" ? 1 : 0.2}
            style={props.style}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
