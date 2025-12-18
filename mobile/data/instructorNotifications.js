// FILE: mobile/app/data/instructorNotifications.js
// Backend-connected instructor notifications store

import { API_BASE_URL, getAuthToken } from "../lib/apiClient";

// Stores instructor notifications in memory
let instructorNotifications = [];

// Stores all subscribed listeners
const listeners = new Set();

// Notifies all listeners when data changes
function notify() {
  const snapshot = JSON.parse(JSON.stringify(instructorNotifications));

  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Instructor notification listener error:", e);
    }
  }
}

// Fetches instructor notifications from the backend
async function fetchInstructorNotifications() {
  try {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/instructor-notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.log("Failed to load instructor notifications:", await res.text());
      return;
    }

    instructorNotifications = await res.json();
    notify();
  } catch (err) {
    console.error("fetchInstructorNotifications error:", err);
  }
}

// Returns a copy of instructor notifications
export function getInstructorNotifications() {
  return JSON.parse(JSON.stringify(instructorNotifications));
}

// Subscribes a listener to instructor notification updates
export function subscribeInstructorNotifications(listener) {
  listeners.add(listener);
  listener(getInstructorNotifications());

  if (instructorNotifications.length === 0) {
    fetchInstructorNotifications();
  }
}

// Unsubscribes a listener
export function unsubscribeInstructorNotifications(listener) {
  listeners.delete(listener);
}

// Forces a refresh from the backend
export async function refreshInstructorNotifications() {
  await fetchInstructorNotifications();
}
