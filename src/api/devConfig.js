/**
 * Local backend URL for physical devices vs Android emulator.
 *
 * Physical phone (USB or Wi‑Fi): set DEV_LAN_HOST to your PC’s IPv4 on the same
 * network (Windows: ipconfig → e.g. 192.168.x.x). Use http://DEV_LAN_HOST:5011
 *
 * Android emulator only: set USE_ANDROID_EMULATOR true → http://10.0.2.2:5011
 *
 * USB + adb reverse: run `adb reverse tcp:5011 tcp:5011`, set USE_ADB_REVERSE true
 * and BASE can be http://127.0.0.1:5011
 */
import { Platform } from 'react-native';

/** Your development machine on Wi‑Fi (update if ipconfig changes). */
export const DEV_LAN_HOST = '192.168.10.186';

export const DEV_API_PORT = 5011;

/** true = Android Studio emulator; false = real phone on same Wi‑Fi as PC */
export const USE_ANDROID_EMULATOR = false;

/** true after: adb reverse tcp:5011 tcp:5011 (Android USB debugging) */
export const USE_ADB_REVERSE = false;

export function resolveDevBaseUrl() {
  const port = DEV_API_PORT;
  if (USE_ADB_REVERSE && Platform.OS === 'android') {
    return `http://127.0.0.1:${port}`;
  }
  if (USE_ANDROID_EMULATOR && Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }
  return `http://${DEV_LAN_HOST}:${port}`;
}
