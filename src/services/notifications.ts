import { audioEngine } from './audioEngine';

export interface InAppNotification {
  id: string;
  channel: 'session_start' | 'session_end' | 'planner_reminder' | 'streak_warning' | 'coach_advice';
  title: string;
  body: string;
  actionPrimaryText?: string;
  actionSecondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  timestamp: string;
}

type NotificationListener = (notification: InAppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();

  public subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  public notify(notif: Omit<InAppNotification, 'id' | 'timestamp'>) {
    const fullNotif: InAppNotification = {
      ...notif,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    // Play chime according to channel
    if (notif.channel === 'session_end') {
      audioEngine.playBell('complete');
    } else if (notif.channel === 'session_start') {
      audioEngine.playBell('start');
    } else {
      audioEngine.playBell('reset');
    }

    // Try native notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/public/icon.svg',
          badge: '/public/icon.svg',
        });
      } catch (_) {}
    }

    // Broadcast to in-app heads-up display
    this.listeners.forEach(fn => fn(fullNotif));
  }
}

export const notificationService = new NotificationService();
