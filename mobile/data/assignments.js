// FILE: mobile/data/assignments.js
// Backend-connected assignments store

import { API_BASE_URL, getAuthToken } from "../lib/apiClient";

// Stores assignments in memory
let assignments = [];

// Stores all subscribed listeners
const listeners = new Set();

// Notifies all listeners when assignments change
function notify() {
  const snapshot = JSON.parse(JSON.stringify(assignments));

  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Assignments listener error:", e);
    }
  }
}

// Fetches assignments from the backend
async function fetchAssignments() {
  try {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.log("Failed to load assignments:", await res.text());
      return;
    }

    assignments = await res.json();
    notify();
  } catch (err) {
    console.error("fetchAssignments error:", err);
  }
}

// Returns a copy of assignments
export function getAssignments() {
  return JSON.parse(JSON.stringify(assignments));
}

// Subscribes a listener to assignment updates
export function subscribe(listener) {
  listeners.add(listener);
  listener(getAssignments());

  if (assignments.length === 0) {
    fetchAssignments();
  }
}

// Unsubscribes a listener
export function unsubscribe(listener) {
  listeners.delete(listener);
}

// Creates a new assignment (instructor)
export async function addAssignment(payload) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create assignment");
    }

    const created = await res.json();
    assignments = [created, ...assignments];
    notify();
    return created;
  } catch (err) {
    console.error("addAssignment error:", err);
    throw err;
  }
}

// Submits an assignment (student)
export async function submitAssignment(id) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/submit`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to submit assignment");
    }

    const updated = await res.json();
    assignments = assignments.map((a) =>
      String(a._id) === String(updated._id) ? updated : a
    );
    notify();
    return updated;
  } catch (err) {
    console.error("submitAssignment error:", err);
    throw err;
  }
}

// Toggles reviewed status (instructor)
export async function toggleReviewed(id) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to toggle reviewed");
    }

    const updated = await res.json();
    assignments = assignments.map((a) =>
      String(a._id) === String(updated._id) ? updated : a
    );
    notify();
    return updated;
  } catch (err) {
    console.error("toggleReviewed error:", err);
    throw err;
  }
}

// Forces a refresh from the backend
export async function refreshAssignments() {
  await fetchAssignments();
}
