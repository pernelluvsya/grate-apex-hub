import { Platform } from 'react-native';

import type { AppNotification } from '@/data/notifications';

export type DeviceNotificationResult = {
  granted: boolean;
  message?: string;
};

function isSupported() {
  return Platform.OS === 'web'
    && typeof window !== 'undefined'
    && 'Notification' in window;
}

/** Ask from a learner-initiated action, then confirm that alerts are ready. */
export async function enableDeviceNotifications(): Promise<DeviceNotificationResult> {
  if (!isSupported()) {
    return { granted: false, message: 'Device notifications are available in the installed web app on supported browsers.' };
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') {
    return { granted: false, message: 'Notifications are off. You can allow them later in your browser or device settings.' };
  }

  await showDeviceNotification({
    id: 'grateapex-notifications-enabled',
    title: 'Notifications are on',
    body: 'GrAteApex Hub will alert you about the updates you choose.',
    href: '/settings',
  });
  return { granted: true };
}

/** Show a system notification when the learner has moved away from the app. */
export async function showDeviceNotification(item: Pick<AppNotification, 'id' | 'title' | 'body' | 'href'>) {
  if (!isSupported() || Notification.permission !== 'granted') return;

  const options: NotificationOptions = {
    body: item.body,
    icon: '/icons/grateapex-192.png',
    badge: '/icons/grateapex-192.png',
    tag: item.id,
    data: { href: item.href ?? '/' },
  };

  try {
    const registration = 'serviceWorker' in navigator
      ? await navigator.serviceWorker.ready
      : null;
    if (registration) {
      await registration.showNotification(item.title, options);
    } else {
      new Notification(item.title, options);
    }
  } catch {
    // A system notification is supplementary. The in-app notification
    // remains available even if a browser blocks the device-level alert.
  }
}
