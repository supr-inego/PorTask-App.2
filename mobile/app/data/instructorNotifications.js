const instructorNotifications = [];
const listeners = new Set();

export function getInstructorNotifications() {
  return JSON.parse(JSON.stringify(instructorNotifications));
}

export function addInstructorNotification(notification) {
  instructorNotifications.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    ...notification,
  });
  notify();
}

export function subscribeInstructorNotifications(listener) {
  listeners.add(listener);
  listener(getInstructorNotifications());
}

export function unsubscribeInstructorNotifications(listener) {
  listeners.delete(listener);
}

function notify() {
  const snapshot = getInstructorNotifications();
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Instructor notification listener error:", e);
    }
  }
}
