// app/data/assignments.js
// Uses backend instead of in-memory data.

import { API_BASE_URL, getAuthToken } from "../lib/apiClient";

// local cache + listeners (to keep same subscribe/unsubscribe pattern)
let assignments = [];
const listeners = new Set();

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

async function fetchAssignments() {
  try {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.log("Failed to load assignments:", await res.text());
      return;
    }

    const data = await res.json();
    assignments = data;
    notify();
  } catch (err) {
    console.error("fetchAssignments error:", err);
  }
}

export function getAssignments() {
  // returns current cache (possibly empty on first render)
  return JSON.parse(JSON.stringify(assignments));
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(getAssignments());

  // if nothing yet, trigger fetch
  if (assignments.length === 0) {
    fetchAssignments();
  }
}

export function unsubscribe(listener) {
  listeners.delete(listener);
}

// create assignment (instructor)
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
    assignments.push(created);
    notify();
    return created;
  } catch (err) {
    console.error("addAssignment error:", err);
    throw err;
  }
}

// student submits
export async function submitAssignment(id) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/submit`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to submit assignment");
    }

    const updated = await res.json();
    assignments = assignments.map((a) => (a._id === updated._id || a.id === updated._id ? updated : a));
    notify();
    return updated;
  } catch (err) {
    console.error("submitAssignment error:", err);
    throw err;
  }
}

// instructor toggle reviewed
export async function toggleReviewed(id) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/review`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to toggle reviewed");
    }

    const updated = await res.json();
    assignments = assignments.map((a) => (a._id === updated._id || a.id === updated._id ? updated : a));
    notify();
    return updated;
  } catch (err) {
    console.error("toggleReviewed error:", err);
    throw err;
  }
}

// helper for screens that need fresh data on focus, if you want to call it manually
export async function refreshAssignments() {
  await fetchAssignments();
}
