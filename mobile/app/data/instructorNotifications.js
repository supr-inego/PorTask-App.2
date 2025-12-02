// app/data/instructorNotifications.js
// Instructor notifications from backend

import { API_BASE_URL, getAuthToken } from "../lib/apiClient";

let instructorNotifications = [];
const listeners = new Set();

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

    const data = await res.json();
    instructorNotifications = data;
    notify();
  } catch (err) {
    console.error("fetchInstructorNotifications error:", err);
  }
}

export function getInstructorNotifications() {
  return JSON.parse(JSON.stringify(instructorNotifications));
}

export function subscribeInstructorNotifications(listener) {
  listeners.add(listener);
  listener(getInstructorNotifications());
  if (instructorNotifications.length === 0) {
    fetchInstructorNotifications();
  }
}

export function unsubscribeInstructorNotifications(listener) {
  listeners.delete(listener);
}
