// app/data/assignments.js
// Manages assignment data + pub/sub notifications.

import { addInstructorNotification } from "./instructorNotifications";
import { addNotification } from "./notifications";

const assignments = [
  {
    id: 1,
    title: "Software Engineering - Project Proposal",
    subject: "Software Engineering",
    deadline: "2025-10-20",
    description: "Create a project proposal for a mobile-based system.",
    submittedCount: 0,
    totalStudents: 1,
    reviewed: false,
    category: "Assignment",
    points: 100,
    attachments: [], // { id, type, name, uri }
  },
  {
    id: 2,
    title: "English - Essay Writing",
    subject: "English",
    deadline: "2025-10-21",
    description: "Write a 2-page reflection about IoT security challenges.",
    submittedCount: 0,
    totalStudents: 1,
    reviewed: false,
    category: "Essay",
    points: 50,
    attachments: [],
  },
  {
    id: 3,
    title: "Science - Lab Report",
    subject: "Science",
    deadline: "2025-10-27",
    description: "Experiment report on photosynthesis observation.",
    submittedCount: 0,
    totalStudents: 1,
    reviewed: false,
    category: "Lab",
    points: 75,
    attachments: [],
  },
];

const listeners = new Set();

export function getAssignments() {
  return JSON.parse(JSON.stringify(assignments));
}

function notify() {
  const snapshot = getAssignments();
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Listener error:", e);
    }
  }
}

//  Add new assignment (supports category, points, attachments[])
export function addAssignment(payload) {
  const newId =
    assignments.length > 0 ? Math.max(...assignments.map((a) => a.id)) + 1 : 1;

  const newAssignment = {
    id: newId,
    reviewed: false,
    submittedCount: 0,
    totalStudents: 1,
    category: payload.category || "Assignment",
    points: payload.points ?? 100,
    attachments: payload.attachments || [],
    ...payload,
  };

  assignments.push(newAssignment);

  addNotification({
    type: "new",
    title: `New activity posted: ${newAssignment.title}`,
    message: `Deadline: ${newAssignment.deadline}`,
  });

  notify();
}

export function toggleReviewed(id) {
  const a = assignments.find((x) => x.id === id);
  if (a) {
    const wasReviewed = a.reviewed;
    a.reviewed = !a.reviewed;

    if (a.reviewed) {
      addNotification({
        type: "closed",
        title: `Activity closed: ${a.title}`,
        message: `Deadline was: ${a.deadline}`,
      });

      addInstructorNotification({
        type: "closed",
        title: `You closed an activity`,
        message: `${a.title} has been marked as reviewed.`,
      });
    } else if (wasReviewed) {
      addNotification({
        type: "reopened",
        title: `Activity reopened: ${a.title}`,
        message: `Deadline: ${a.deadline}`,
      });

      addInstructorNotification({
        type: "reopened",
        title: `You reopened an activity`,
        message: `${a.title} has been reopened for submissions.`,
      });
    }

    notify();
  }
}

export function submitAssignment(id) {
  const a = assignments.find((x) => x.id === id);
  if (a) {
    if (a.submittedCount < a.totalStudents) {
      a.submittedCount += 1;

      addInstructorNotification({
        type: "submission",
        title: `Student submitted an activity`,
        message: `A student submitted: ${a.title}`,
      });
    }
    notify();
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(getAssignments());
}

export function unsubscribe(listener) {
  listeners.delete(listener);
}
