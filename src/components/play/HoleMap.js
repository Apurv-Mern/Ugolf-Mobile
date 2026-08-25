// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { Platform, StyleSheet, Text, View } from 'react-native';
// import Mapbox from '@rnmapbox/maps';
// import {
//   check,
//   request,
//   PERMISSIONS,
//   RESULTS,
// } from 'react-native-permissions';

// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { hp, wp, fontSize, moderateScale } from '../../utils/responsive';
// import { MAPBOX_STYLE_URL } from '../../config/mapbox';

// const EARTH_RADIUS_M = 6371000;
// const NEAR_COURSE_M = 2500;

// const haversineMeters = (a, b) => {
//   const toRad = (degrees) => (degrees * Math.PI) / 180;
//   const dLat = toRad(b.lat - a.lat);
//   const dLng = toRad(b.lng - a.lng);
//   const lat1 = toRad(a.lat);
//   const lat2 = toRad(b.lat);
//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
//   return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
// };

// const formatDistance = (meters) => {
//   const yards = meters * 1.09361;
//   if (yards < 30) return `${Math.round(yards)} yd`;
//   return `${Math.round(yards)} yd (${Math.round(meters)} m)`;
// };

// const poiLabel = (poi) => {
//   switch (Number(poi)) {
//     case 1:
//       return 'Green';
//     case 2:
//       return 'Green bunker';
//     case 3:
//       return 'Fairway bunker';
//     case 4:
//       return 'Water';
//     case 11:
//     case 12:
//       return 'Tee';
//     default:
//       return `POI ${poi}`;
//   }
// };

// const poiColor = (poi) => {
//   switch (Number(poi)) {
//     case 1:
//       return '#22C55E';
//     case 2:
//     case 3:
//       return '#EAB308';
//     case 4:
//       return '#3B82F6';
//     case 11:
//     case 12:
//       return '#F97316';
//     default:
//       return '#94A3B8';
//   }
// };

// const validPoint = (point) =>
//   point &&
//   Number.isFinite(Number(point.lat)) &&
//   Number.isFinite(Number(point.lng));

// const requestLocationPermission = async () => {
//   const permission =
//     Platform.OS === 'ios'
//       ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
//       : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
//   const current = await check(permission);
//   if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return true;
//   if (current === RESULTS.BLOCKED) return false;
//   const result = await request(permission);
//   return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
// };

// /**
//  * Native equivalent of admin mobile_flow HoleMap.
//  * The play API remains the source of truth for hole POIs; device location is
//  * only used for the player puck, distance and display-only proximity hints.
//  */
// const HoleMap = ({ mapData, holeNumber, compact = false }) => {
//   const cameraRef = useRef(null);
//   const [mapReady, setMapReady] = useState(false);
//   const [locationGranted, setLocationGranted] = useState(false);
//   const [geoError, setGeoError] = useState(null);
//   const [player, setPlayer] = useState(null);

//   const points = useMemo(() => {
//     const list = [];
//     if (validPoint(mapData?.green)) list.push(mapData.green);
//     if (validPoint(mapData?.tee)) list.push(mapData.tee);
//     for (const poi of mapData?.currentHolePois || []) {
//       if (validPoint(poi)) list.push(poi);
//     }
//     return list;
//   }, [mapData]);

//   const center = mapData?.green || mapData?.tee || points[0] || null;

//   const frameHole = useCallback(() => {
//     if (!cameraRef.current || points.length === 0) return;
//     if (points.length === 1) {
//       cameraRef.current.setCamera({
//         centerCoordinate: [Number(points[0].lng), Number(points[0].lat)],
//         zoomLevel: 16,
//         animationDuration: 0,
//       });
//       return;
//     }

//     const lngs = points.map((point) => Number(point.lng));
//     const lats = points.map((point) => Number(point.lat));
//     cameraRef.current.fitBounds(
//       [Math.max(...lngs), Math.max(...lats)],
//       [Math.min(...lngs), Math.min(...lats)],
//       moderateScale(60),
//       0,
//     );
//   }, [points]);

//   useEffect(() => {
//     requestLocationPermission()
//       .then((granted) => {
//         setLocationGranted(granted);
//         if (!granted) {
//           setGeoError('Location permission denied');
//         }
//       })
//       .catch(() => setGeoError('Location unavailable'));
//   }, []);

//   useEffect(() => {
//     if (mapReady) frameHole();
//   }, [frameHole, holeNumber, mapReady]);

//   const handleLocationUpdate = useCallback((location) => {
//     const latitude =
//       location?.coords?.latitude ??
//       location?.geometry?.coordinates?.[1];
//     const longitude =
//       location?.coords?.longitude ??
//       location?.geometry?.coordinates?.[0];
//     if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
//       return;
//     }
//     setPlayer({ lat: Number(latitude), lng: Number(longitude) });
//     setGeoError(null);
//   }, []);

//   const distanceToGreen =
//     player && validPoint(mapData?.green)
//       ? haversineMeters(player, mapData.green)
//       : null;
//   const holeAnchor = mapData?.green || mapData?.tee || null;
//   const playerNearCourse =
//     player &&
//     validPoint(holeAnchor) &&
//     haversineMeters(player, holeAnchor) <= NEAR_COURSE_M;

//   const proximityHint = useMemo(() => {
//     if (!player) return null;
//     let nearest = null;
//     for (const poi of mapData?.currentHolePois || []) {
//       if (!validPoint(poi)) continue;
//       const meters = haversineMeters(player, poi);
//       if (!nearest || meters < nearest.meters) {
//         nearest = { label: poiLabel(poi.poi), meters };
//       }
//     }
//     if (nearest && nearest.meters < 25) {
//       return `Near ${nearest.label.toLowerCase()} (~${Math.round(
//         nearest.meters,
//       )} m) — hint only`;
//     }
//     if (distanceToGreen != null && distanceToGreen < 40) {
//       return 'Near the green — hint only';
//     }
//     return null;
//   }, [distanceToGreen, mapData, player]);

//   const playerLine = useMemo(
//     () => ({
//       type: 'Feature',
//       properties: {},
//       geometry: {
//         type: 'LineString',
//         coordinates:
//           playerNearCourse && player && validPoint(mapData?.green)
//             ? [
//               [player.lng, player.lat],
//               [Number(mapData.green.lng), Number(mapData.green.lat)],
//             ]
//             : [],
//       },
//     }),
//     [mapData, player, playerNearCourse],
//   );

//   if (!mapData?.hasGps) {
//     return (
//       <View style={styles.notice}>
//         <Text style={styles.noticeText}>
//           Map unavailable for this course (no GPS coordinates cached). Scoring
//           still works without the map.
//         </Text>
//       </View>
//     );
//   }

//   if (!center || points.length === 0) {
//     return (
//       <View style={styles.notice}>
//         <Text style={styles.noticeText}>
//           No map points for hole {holeNumber}. Scoring still works.
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerRow}>
//         <Text style={styles.title}>Hole {holeNumber} map</Text>
//         <Text style={styles.distance}>
//           {distanceToGreen != null
//             ? `To green: ${formatDistance(distanceToGreen)}`
//             : geoError
//               ? 'Waiting for location…'
//               : 'Allow location for distance'}
//         </Text>
//       </View>

//       {proximityHint ? (
//         <View style={styles.hint}>
//           <Text style={styles.hintText}>{proximityHint}</Text>
//         </View>
//       ) : null}

//       {geoError ? (
//         <Text style={styles.geoError}>
//           Location: {geoError}. Tee and green markers still show.
//         </Text>
//       ) : null}

//       <View style={[styles.mapClip, compact && styles.mapClipCompact]}>
//         <Mapbox.MapView
//           style={styles.map}
//           styleURL={MAPBOX_STYLE_URL}
//           logoEnabled={false}
//           compassEnabled={false}
//           scaleBarEnabled={false}
//           attributionEnabled
//           onDidFinishLoadingMap={() => setMapReady(true)}
//           onUserLocationUpdate={handleLocationUpdate}
//         >
//           <Mapbox.Camera
//             ref={cameraRef}
//             defaultSettings={{
//               centerCoordinate: [Number(center.lng), Number(center.lat)],
//               zoomLevel: 16,
//             }}
//             maxZoomLevel={17}
//           />

//           {(mapData.currentHolePois || [])
//             .filter(validPoint)
//             .map((poi, index) => (
//               <Mapbox.PointAnnotation
//                 key={`${holeNumber}-${poi.poi}-${index}`}
//                 id={`hole-${holeNumber}-poi-${index}`}
//                 coordinate={[Number(poi.lng), Number(poi.lat)]}
//                 title={poiLabel(poi.poi)}
//               >
//                 <View
//                   style={[
//                     styles.poiMarker,
//                     { backgroundColor: poiColor(poi.poi) },
//                   ]}
//                 />
//               </Mapbox.PointAnnotation>
//             ))}

//           {validPoint(mapData.green) ? (
//             <Mapbox.PointAnnotation
//               id={`hole-${holeNumber}-green`}
//               coordinate={[
//                 Number(mapData.green.lng),
//                 Number(mapData.green.lat),
//               ]}
//               anchor={{ x: 0.5, y: 1 }}
//             >
//               <Text style={styles.greenMarker}>⛳</Text>
//             </Mapbox.PointAnnotation>
//           ) : null}

//           {validPoint(mapData.tee) ? (
//             <Mapbox.PointAnnotation
//               id={`hole-${holeNumber}-tee`}
//               coordinate={[Number(mapData.tee.lng), Number(mapData.tee.lat)]}
//             >
//               <View style={styles.teeMarker}>
//                 <Text style={styles.teeMarkerText}>T</Text>
//               </View>
//             </Mapbox.PointAnnotation>
//           ) : null}

//           <Mapbox.ShapeSource id="player-to-green" shape={playerLine}>
//             <Mapbox.LineLayer
//               id="player-to-green-line"
//               style={{
//                 lineColor: '#38BDF8',
//                 lineWidth: 3,
//                 lineOpacity: 0.9,
//               }}
//             />
//           </Mapbox.ShapeSource>

//           {locationGranted ? (
//             <>
//               {/* Starts the native location manager; the MapView callback
//                   alone never fires on Android. */}
//               <Mapbox.UserLocation
//                 visible={false}
//                 minDisplacement={2}
//                 onUpdate={handleLocationUpdate}
//               />
//               <Mapbox.LocationPuck
//                 visible
//                 pulsing={{ isEnabled: true, color: '#2563EB' }}
//               />
//             </>
//           ) : null}
//         </Mapbox.MapView>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     gap: hp(1),
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: wp(3),
//   },
//   title: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(13),
//     color: COLORS.textPrimary,
//   },
//   distance: {
//     flexShrink: 1,
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(11),
//     color: COLORS.textMuted,
//     textAlign: 'right',
//   },
//   mapClip: {
//     height: hp(32),
//     overflow: 'hidden',
//     borderRadius: moderateScale(14),
//     borderWidth: 1,
//     borderColor: 'rgba(14, 59, 46, 0.14)',
//   },
//   mapClipCompact: {
//     height: hp(24),
//   },
//   map: {
//     flex: 1,
//   },
//   poiMarker: {
//     width: moderateScale(12),
//     height: moderateScale(12),
//     borderRadius: moderateScale(6),
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   greenMarker: {
//     fontSize: fontSize(20),
//     lineHeight: fontSize(24),
//   },
//   teeMarker: {
//     width: moderateScale(24),
//     height: moderateScale(24),
//     borderRadius: moderateScale(6),
//     backgroundColor: '#F97316',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   teeMarkerText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(11),
//     color: COLORS.white,
//   },
//   hint: {
//     borderRadius: moderateScale(8),
//     borderWidth: 1,
//     borderColor: 'rgba(14, 59, 46, 0.12)',
//     backgroundColor: 'rgba(14, 59, 46, 0.05)',
//     paddingHorizontal: wp(3),
//     paddingVertical: hp(0.8),
//   },
//   hintText: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(10.5),
//     color: COLORS.textMuted,
//   },
//   geoError: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(10.5),
//     color: '#92400E',
//   },
//   notice: {
//     borderRadius: moderateScale(12),
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//     backgroundColor: '#FEF9E7',
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.4),
//   },
//   noticeText: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(11.5),
//     color: '#92400E',
//     lineHeight: fontSize(17),
//   },
// });

// export default HoleMap;





import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { hp, wp, fontSize, moderateScale } from '../../utils/responsive';
import { MAPBOX_STYLE_URL } from '../../config/mapbox';

const EARTH_RADIUS_M = 6371000;
const NEAR_COURSE_M = 2500;

const haversineMeters = (a, b) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

const formatDistance = (meters) => {
  const yards = meters * 1.09361;
  if (yards < 30) return `${Math.round(yards)} yd`;
  return `${Math.round(yards)} yd (${Math.round(meters)} m)`;
};

const poiLabel = (poi) => {
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

const poiColor = (poi) => {
  switch (Number(poi)) {
    case 1:
      return '#22C55E';
    case 2:
    case 3:
      return '#EAB308';
    case 4:
      return '#3B82F6';
    case 11:
    case 12:
      return '#F97316';
    default:
      return '#94A3B8';
  }
};

const validPoint = (point) =>
  point &&
  Number.isFinite(Number(point.lat)) &&
  Number.isFinite(Number(point.lng));

const requestLocationPermission = async () => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  const current = await check(permission);
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return true;
  if (current === RESULTS.BLOCKED) return false;
  const result = await request(permission);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
};

/**
 * Native equivalent of admin mobile_flow HoleMap.
 * The play API remains the source of truth for hole POIs; device location is
 * only used for the player puck, distance and display-only proximity hints.
 */
const HoleMap = ({ mapData, holeNumber, compact = false }) => {
  const cameraRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [player, setPlayer] = useState(null);

  const points = useMemo(() => {
    const list = [];
    if (validPoint(mapData?.green)) list.push(mapData.green);
    if (validPoint(mapData?.tee)) list.push(mapData.tee);
    for (const poi of mapData?.currentHolePois || []) {
      if (validPoint(poi)) list.push(poi);
    }
    return list;
  }, [mapData]);

  const center = mapData?.green || mapData?.tee || points[0] || null;

  const frameHole = useCallback(() => {
    if (!cameraRef.current || points.length === 0) return;
    if (points.length === 1) {
      cameraRef.current.setCamera({
        centerCoordinate: [Number(points[0].lng), Number(points[0].lat)],
        zoomLevel: 16,
        animationDuration: 0,
      });
      return;
    }

    const lngs = points.map((point) => Number(point.lng));
    const lats = points.map((point) => Number(point.lat));
    cameraRef.current.fitBounds(
      [Math.max(...lngs), Math.max(...lats)],
      [Math.min(...lngs), Math.min(...lats)],
      moderateScale(60),
      0,
    );
  }, [points]);

  useEffect(() => {
    requestLocationPermission()
      .then((granted) => {
        setLocationGranted(granted);
        if (granted) {
          try {
            Mapbox.locationManager.start();
          } catch (e) {
            console.log('Location manager start error:', e);
          }
        } else {
          setGeoError('Location permission denied');
        }
        // Force map re-frame when permission modal dismisses
        setTimeout(() => {
          frameHole();
        }, 200);
        setTimeout(() => {
          frameHole();
        }, 600);
      })
      .catch(() => setGeoError('Location unavailable'));

    return () => {
      try {
        Mapbox.locationManager.stop();
      } catch (e) { }
    };
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      frameHole();
    }, 100);
    const timer2 = setTimeout(() => {
      frameHole();
    }, 500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [frameHole, holeNumber, mapReady, locationGranted]);

  const handleMapLayout = useCallback(() => {
    if (cameraRef.current && points.length > 0) {
      setTimeout(() => {
        frameHole();
      }, 100);
    }
  }, [frameHole, points]);

  const handleLocationUpdate = useCallback((location) => {
    const latitude =
      location?.coords?.latitude ??
      location?.geometry?.coordinates?.[1] ??
      location?.latitude;
    const longitude =
      location?.coords?.longitude ??
      location?.geometry?.coordinates?.[0] ??
      location?.longitude;
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return;
    }
    setPlayer({ lat: Number(latitude), lng: Number(longitude) });
    setGeoError(null);
  }, []);

  const distanceToGreen =
    player && validPoint(mapData?.green)
      ? haversineMeters(player, mapData.green)
      : null;

  const teeToGreenDistance =
    validPoint(mapData?.tee) && validPoint(mapData?.green)
      ? haversineMeters(mapData.tee, mapData.green)
      : null;

  const displayDistance = distanceToGreen ?? teeToGreenDistance;

  const holeAnchor = mapData?.green || mapData?.tee || null;
  const playerNearCourse =
    player &&
    validPoint(holeAnchor) &&
    haversineMeters(player, holeAnchor) <= NEAR_COURSE_M;

  const proximityHint = useMemo(() => {
    if (!player) return null;
    let nearest = null;
    for (const poi of mapData?.currentHolePois || []) {
      if (!validPoint(poi)) continue;
      const meters = haversineMeters(player, poi);
      if (!nearest || meters < nearest.meters) {
        nearest = { label: poiLabel(poi.poi), meters };
      }
    }
    if (nearest && nearest.meters < 25) {
      return `Near ${nearest.label.toLowerCase()} (~${Math.round(
        nearest.meters,
      )} m) — hint only`;
    }
    if (distanceToGreen != null && distanceToGreen < 40) {
      return 'Near the green — hint only';
    }
    return null;
  }, [distanceToGreen, mapData, player]);

  const playerLine = useMemo(
    () => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates:
          playerNearCourse && player && validPoint(mapData?.green)
            ? [
              [player.lng, player.lat],
              [Number(mapData.green.lng), Number(mapData.green.lat)],
            ]
            : [],
      },
    }),
    [mapData, player, playerNearCourse],
  );

  if (!mapData?.hasGps) {
    return (
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Map unavailable for this course (no GPS coordinates cached). Scoring
          still works without the map.
        </Text>
      </View>
    );
  }

  if (!center || points.length === 0) {
    return (
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          No map points for hole {holeNumber}. Scoring still works.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>HOLE {holeNumber} MAP</Text>
        <Text style={styles.distance} numberOfLines={1}>
          {displayDistance != null
            ? `To green: ${formatDistance(displayDistance)}`
            : 'Distance unavailable'}
        </Text>
      </View>

      {proximityHint ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>{proximityHint}</Text>
        </View>
      ) : null}

      {geoError ? (
        <Text style={styles.geoError}>
          Location: {geoError}. Tee and green markers still show.
        </Text>
      ) : null}

      <View style={[styles.mapClip, compact && styles.mapClipCompact]}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={MAPBOX_STYLE_URL}
          logoEnabled={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          attributionEnabled
          onLayout={handleMapLayout}
          onDidFinishLoadingMap={() => setMapReady(true)}
          onUserLocationUpdate={handleLocationUpdate}
        >
          <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [Number(center.lng), Number(center.lat)],
              zoomLevel: 16,
            }}
            maxZoomLevel={17}
          />

          {(mapData.currentHolePois || [])
            .filter(validPoint)
            .map((poi, index) => (
              <Mapbox.PointAnnotation
                key={`${holeNumber}-${poi.poi}-${index}`}
                id={`hole-${holeNumber}-poi-${index}`}
                coordinate={[Number(poi.lng), Number(poi.lat)]}
                title={poiLabel(poi.poi)}
              >
                <View
                  style={[
                    styles.poiMarker,
                    { backgroundColor: poiColor(poi.poi) },
                  ]}
                />
              </Mapbox.PointAnnotation>
            ))}

          {validPoint(mapData.green) ? (
            <Mapbox.PointAnnotation
              id={`hole-${holeNumber}-green`}
              coordinate={[
                Number(mapData.green.lng),
                Number(mapData.green.lat),
              ]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Text style={styles.greenMarker}>⛳</Text>
            </Mapbox.PointAnnotation>
          ) : null}

          {validPoint(mapData.tee) ? (
            <Mapbox.PointAnnotation
              id={`hole-${holeNumber}-tee`}
              coordinate={[Number(mapData.tee.lng), Number(mapData.tee.lat)]}
            >
              <View style={styles.teeMarker}>
                <Text style={styles.teeMarkerText}>T</Text>
              </View>
            </Mapbox.PointAnnotation>
          ) : null}

          <Mapbox.ShapeSource id="player-to-green" shape={playerLine}>
            <Mapbox.LineLayer
              id="player-to-green-line"
              style={{
                lineColor: '#38BDF8',
                lineWidth: 3,
                lineOpacity: 0.9,
              }}
            />
          </Mapbox.ShapeSource>

          {locationGranted ? (
            <>
              {/* Starts the native location manager and streams real-time updates */}
              <Mapbox.UserLocation
                visible={true}
                minDisplacement={1}
                onUpdate={handleLocationUpdate}
              />
              <Mapbox.LocationPuck
                visible
                pulsing={{ isEnabled: true, color: '#2563EB' }}
              />
            </>
          ) : null}
        </Mapbox.MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: hp(1),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  distance: {
    flexShrink: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#718096',
    textAlign: 'right',
  },
  mapClip: {
    height: hp(32),
    overflow: 'hidden',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(14, 59, 46, 0.14)',
  },
  mapClipCompact: {
    height: hp(24),
  },
  map: {
    flex: 1,
  },
  poiMarker: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  greenMarker: {
    fontSize: fontSize(20),
    lineHeight: fontSize(24),
  },
  teeMarker: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(6),
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teeMarkerText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: COLORS.white,
  },
  hint: {
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(14, 59, 46, 0.12)',
    backgroundColor: 'rgba(14, 59, 46, 0.05)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
  },
  hintText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(10.5),
    color: COLORS.textMuted,
  },
  geoError: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(10.5),
    color: '#92400E',
  },
  notice: {
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
  },
  noticeText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(11.5),
    color: '#92400E',
    lineHeight: fontSize(17),
  },
});

export default HoleMap;

