// FILE: mobile/app/(instructorTabs)/_layout.jsx
// Instructor bottom tab navigation layout

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";

export default function InstructorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // active/inactive tab colors
        tabBarActiveTintColor: "#2F80ED",
        tabBarInactiveTintColor: "gray",

        // header styling
        headerStyle: { backgroundColor: "#2F80ED" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },

        // custom tab button to remove ripple effect
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={Platform.OS === "android" ? 1 : 0.2}
            style={props.style}
          />
        ),
      }}
    >
      {/* Dashboard / Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Notifications */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Calendar */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile */}
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
