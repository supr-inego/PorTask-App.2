// FILE: mobile/app/_layout.jsx

import { Stack } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../lib/apiClient";

export default function RootLayout() {
  // restore auth token on app start
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) setAuthToken(token);
    })();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
