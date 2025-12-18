// mobile/data/notifications.js
// ✅ Backend-connected notifications store

import { API_BASE_URL, getAuthToken } from "../lib/apiClient";

let notifications = [];
const listeners = new Set();

function notify() {
  const snapshot = JSON.parse(JSON.stringify(notifications));
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Notification listener error:", e);
    }
  }
}

async function fetchNotifications() {
  try {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.log("Failed to load notifications:", await res.text());
      return;
    }

    notifications = await res.json();
    notify();
  } catch (err) {
    console.error("fetchNotifications error:", err);
  }
}

export function getNotifications() {
  return JSON.parse(JSON.stringify(notifications));
}

export function subscribeNotifications(listener) {
  listeners.add(listener);
  listener(getNotifications());
  if (notifications.length === 0) fetchNotifications();
}

export function unsubscribeNotifications(listener) {
  listeners.delete(listener);
}

export async function refreshNotifications() {
  await fetchNotifications();
}
