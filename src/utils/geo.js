/** Geo helpers mirroring the admin web HoleMap (frontend/src/components/play/hole-map.tsx). */

const EARTH_RADIUS_M = 6371000;

export const haversineMeters = (a, b) => {
  if (!a || !b) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** Distance label in metres only. */
export const formatMeters = (meters) => {
  if (meters == null) return 'Unavailable';
  const n = Number(meters);
  if (!Number.isFinite(n) || n <= 0) return 'Unavailable';
  return `${Math.round(n)} m`;
};

export const formatDistance = formatMeters;

export const formatShotDistance = formatMeters;

export const NEAR_COURSE_M = 2500;

const isCoord = (p) =>
  p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng));

/** Course has cached map data and a green POI for the current hole. */
export const canComputeToGreen = (mapData) =>
  Boolean(mapData?.hasGps && isCoord(mapData?.green));

const teeFromMap = (mapData) => {
  if (isCoord(mapData?.tee)) return mapData.tee;
  for (const poi of mapData?.currentHolePois || []) {
    const kind = Number(poi?.poi);
    if ((kind === 11 || kind === 12) && isCoord(poi)) return poi;
  }
  return null;
};

/** Tee → green from cached course map only (never device GPS). */
export const mapToGreenMeters = (mapData) => {
  const fromApi = mapData?.toGreenMeters;
  if (fromApi != null) {
    const n = Number(fromApi);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (!canComputeToGreen(mapData)) return null;
  const tee = teeFromMap(mapData);
  if (!isCoord(tee)) return null;
  const meters = haversineMeters(tee, mapData.green);
  if (!Number.isFinite(meters) || meters <= 0) return null;
  return Math.round(meters);
};

export const poiLabel = (poi) => {
  switch (Number(poi)) {
    case 1:
      return 'Green';
    case 2:
      return 'Green bunker';
    case 3:
      return 'Fairway bunker';
    case 4:
      return 'Water';
    case 11:
    case 12:
      return 'Tee';
    default:
      return `POI ${poi}`;
  }
};

export const poiColor = (poi) => {
  switch (Number(poi)) {
    case 1:
      return '#22c55e';
    case 2:
    case 3:
      return '#eab308';
    case 4:
      return '#3b82f6';
    case 11:
    case 12:
      return '#f97316';
    default:
      return '#94a3b8';
  }
};

/** Every hole point the camera should frame: green, tee and all POIs. */
export const holePoints = (mapData) => {
  if (!mapData) return [];
  const points = [];
  if (isCoord(mapData.green)) points.push(mapData.green);
  if (isCoord(mapData.tee)) points.push(mapData.tee);
  (Array.isArray(mapData.currentHolePois) ? mapData.currentHolePois : []).forEach(
    (poi) => {
      if (isCoord(poi)) points.push(poi);
    },
  );
  return points;
};

/** Mapbox camera bounds ({ ne, sw } in [lng, lat]) around the hole. */
export const holeBounds = (mapData) => {
  const points = holePoints(mapData);
  if (points.length === 0) return null;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  points.forEach((p) => {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  });

  return {
    ne: [maxLng, maxLat],
    sw: [minLng, minLat],
  };
};

/** Camera anchor for the hole: green, then tee, then first POI. */
export const holeCenter = (mapData) => {
  const points = holePoints(mapData);
  return points.length > 0 ? points[0] : null;
};
