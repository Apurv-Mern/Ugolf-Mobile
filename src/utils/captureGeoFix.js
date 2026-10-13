import Mapbox from '@rnmapbox/maps';
import { ensureLocationPermission } from './locationPermission';

export function coordsFromLocation(location) {
  const latitude =
    location?.coords?.latitude ??
    location?.geometry?.coordinates?.[1] ??
    location?.latitude;
  const longitude =
    location?.coords?.longitude ??
    location?.geometry?.coordinates?.[0] ??
    location?.longitude;
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return null;
  }
  const accuracy = location?.coords?.accuracy ?? location?.accuracy;
  return {
    lat: Number(latitude),
    lng: Number(longitude),
    accuracyMeters: Number.isFinite(Number(accuracy)) ? Number(accuracy) : null,
  };
}

function waitForLocation(timeoutMs = 18000) {
  return new Promise((resolve, reject) => {
    let listener = null;
    const timeout = setTimeout(() => {
      if (listener?.remove) listener.remove();
      reject(new Error('GPS fix timed out. Try again outdoors.'));
    }, timeoutMs);

    try {
      Mapbox.locationManager.start();
    } catch (_) {
      /* already started */
    }

    listener = Mapbox.locationManager.addListener((location) => {
      const fix = coordsFromLocation(location);
      if (!fix) return;
      clearTimeout(timeout);
      if (listener?.remove) listener.remove();
      resolve(fix);
    });
  });
}

/** High-accuracy fix for shot distance Start / Stop. */
export async function captureGeoFix() {
  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error('Location permission is required to measure shot distance.');
  }

  try {
    Mapbox.locationManager.start();
  } catch (_) {
    /* ignore */
  }

  let fix = null;
  try {
    const last = await Mapbox.locationManager.getLastKnownLocation();
    fix = coordsFromLocation(last);
  } catch (_) {
    fix = null;
  }

  if (fix && fix.accuracyMeters != null && fix.accuracyMeters <= 25) {
    return fix;
  }

  const live = await waitForLocation();
  await new Promise((r) => setTimeout(r, 500));

  try {
    const second = await Mapbox.locationManager.getLastKnownLocation();
    const fix2 = coordsFromLocation(second);
    if (fix2) {
      return {
        lat: (live.lat + fix2.lat) / 2,
        lng: (live.lng + fix2.lng) / 2,
        accuracyMeters: Math.max(
          live.accuracyMeters ?? 0,
          fix2.accuracyMeters ?? 0,
        ) || null,
      };
    }
  } catch (_) {
    /* use live only */
  }

  return live;
}

/**
 * Stream GPS updates while measuring (Start → Stop).
 * @returns {() => void} unsubscribe
 */
export function watchGeoPosition(onFix) {
  try {
    Mapbox.locationManager.start();
  } catch (_) {
    /* ignore */
  }

  const listener = Mapbox.locationManager.addListener((location) => {
    const fix = coordsFromLocation(location);
    if (fix) onFix(fix);
  });

  return () => {
    if (listener?.remove) listener.remove();
  };
}
