const notifications = [];
const listeners = new Set();

export function getNotifications() {
  return JSON.parse(JSON.stringify(notifications));
}

export function addNotification(notification) {
  notifications.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    ...notification,
  });
  notify();
}

export function subscribeNotifications(listener) {
  listeners.add(listener);
  listener(getNotifications());
}

export function unsubscribeNotifications(listener) {
  listeners.delete(listener);
}

function notify() {
  const snapshot = getNotifications();
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch (e) {
      console.error("Notification listener error:", e);
    }
  }
}
