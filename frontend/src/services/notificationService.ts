import { getActiveUserId } from "./authService";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: "dataset" | "export" | "ai" | "system";
  timestamp: string;
  read: boolean;
}

function getNotificationStorageKey(): string {
  return `datagen_notifications_${getActiveUserId()}`;
}

const listeners: Array<(items: RealtimeNotification[]) => void> = [];

if (typeof window !== "undefined") {
  window.addEventListener("datagen_auth_changed", () => {
    notifyListeners(getUserNotifications());
  });
}

export const getUserNotifications = (): RealtimeNotification[] => {
  const key = getNotificationStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load user notifications", e);
  }
  const initial: RealtimeNotification[] = [
    {
      id: `notif_${Date.now()}_init`,
      title: "Workspace Active",
      message: "DataGen AI real-time synthetic data engine initialized.",
      type: "system",
      timestamp: new Date().toISOString(),
      read: false,
    },
  ];
  saveNotifications(initial);
  return initial;
};

export const addNotification = (
  title: string,
  message: string,
  type: "dataset" | "export" | "ai" | "system" = "system"
): RealtimeNotification => {
  const current = getUserNotifications();
  const newNotif: RealtimeNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const updated = [newNotif, ...current].slice(0, 30);
  saveNotifications(updated);

  try {
    const userId = getActiveUserId();
    setDoc(doc(db, "user_notifications", `${userId}_${newNotif.id}`), {
      ...newNotif,
      userId,
      syncedAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (e) {}

  notifyListeners(updated);
  return newNotif;
};

export const markAllNotificationsRead = (): void => {
  const current = getUserNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  notifyListeners(updated);
};

export const clearAllNotifications = (): void => {
  saveNotifications([]);
  notifyListeners([]);
};

export const subscribeNotifications = (callback: (items: RealtimeNotification[]) => void): (() => void) => {
  listeners.push(callback);
  callback(getUserNotifications());
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

function notifyListeners(items: RealtimeNotification[]): void {
  listeners.forEach((cb) => {
    try {
      cb(items);
    } catch (e) {}
  });
}

function saveNotifications(items: RealtimeNotification[]): void {
  try {
    localStorage.setItem(getNotificationStorageKey(), JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
}
