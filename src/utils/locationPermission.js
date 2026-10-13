import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export async function ensureLocationPermission() {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  const current = await check(permission);
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return true;
  if (current === RESULTS.BLOCKED) return false;
  const result = await request(permission);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
}
