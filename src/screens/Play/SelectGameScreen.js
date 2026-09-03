// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   ActivityIndicator,
//   BackHandler,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';

// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   PrimaryPillButton,
// } from '../../components/ui';
// import AuthIcon from '../../components/common/AuthIcon';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
// import { getConfigureGamesApi } from '../../services/homeService';
// import { getStartGameReadinessApi } from '../../services/playService';

// const isUuid = (id) =>
//   typeof id === 'string' &&
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// /** Re-check while blocked so an opponent accepting shows up without leaving the screen. */
// const POLL_MS = 10000;

// const AMBER = '#FDE68A';
// const AMBER_STRONG = '#FCD34D';

// const SelectGameScreen = ({ navigation, route }) => {
//   const tournament = route?.params?.tournament || route?.params?.newTournament;
//   const tournamentId = tournament?.id || tournament?._id;
//   const hasBackend = Boolean(tournamentId && isUuid(String(tournamentId)));

//   const initialGameNumber =
//     Number(
//       route?.params?.gameNumber ??
//         (route?.params?.selectedGameIndex != null
//           ? Number(route.params.selectedGameIndex) + 1
//           : 1),
//     ) || 1;

//   const [games, setGames] = useState([]);
//   const [loadingGames, setLoadingGames] = useState(true);
//   const [gameNumber, setGameNumber] = useState(initialGameNumber);
//   const [expanded, setExpanded] = useState(initialGameNumber);
//   const [readiness, setReadiness] = useState(null);
//   const [checking, setChecking] = useState(false);
//   const [error, setError] = useState(null);

//   const isMounted = useRef(true);
//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };
//       const subscription = BackHandler.addEventListener(
//         'hardwareBackPress',
//         onBackPress,
//       );
//       return () => subscription.remove();
//     }, [navigation]),
//   );

//   // Game list (course + nine per game) comes from the same config the creator saved.
//   useEffect(() => {
//     const loadGames = async () => {
//       const fallbackCount = Number(tournament?.numberOfGames) || 1;
//       if (!hasBackend) {
//         setGames(
//           Array.from({ length: fallbackCount }, (_, i) => ({
//             gameNumber: i + 1,
//             courseName: null,
//             holeStart: null,
//             holeEnd: null,
//             configured: false,
//           })),
//         );
//         setLoadingGames(false);
//         return;
//       }

//       try {
//         const res = await getConfigureGamesApi(tournamentId);
//         const data = res?.data || res;
//         const count = Number(data?.numberOfGames) || fallbackCount;
//         const list = Array.from({ length: count }, (_, i) => {
//           const existing = (data?.games || []).find(
//             (g) => Number(g.gameNumber) === i + 1,
//           );
//           return {
//             gameNumber: i + 1,
//             courseName: existing?.course?.name || existing?.golfCourseName || null,
//             holeStart: existing?.holeStart ?? null,
//             holeEnd: existing?.holeEnd ?? null,
//             configured: Boolean(existing?.configured ?? existing?.course),
//           };
//         });
//         if (isMounted.current) setGames(list);
//       } catch (err) {
//         console.log('Select game — load games error:', err);
//         if (isMounted.current) {
//           setGames(
//             Array.from({ length: fallbackCount }, (_, i) => ({
//               gameNumber: i + 1,
//               courseName: null,
//               holeStart: null,
//               holeEnd: null,
//               configured: false,
//             })),
//           );
//         }
//       } finally {
//         if (isMounted.current) setLoadingGames(false);
//       }
//     };

//     loadGames();
//   }, [tournamentId, hasBackend, tournament?.numberOfGames]);

//   const loadReadiness = useCallback(async () => {
//     if (!hasBackend) {
//       setReadiness(null);
//       return;
//     }

//     setChecking(true);
//     setError(null);
//     try {
//       const res = await getStartGameReadinessApi(tournamentId, { gameNumber });
//       const data = res?.data || res;
//       if (!isMounted.current) return;
//       setReadiness(data);

//       // Follow the server: resume an in-progress game, else jump to the next unplayed one.
//       const resumeGame = data?.activeSession?.gameNumber;
//       if (resumeGame != null && Number(resumeGame) !== gameNumber) {
//         setGameNumber(Number(resumeGame));
//         setExpanded(Number(resumeGame));
//       }
//     } catch (err) {
//       console.log('Select game — readiness error:', err);
//       if (err?.response?.status === 401) return;
//       if (!isMounted.current) return;
//       setReadiness(null);
//       setError(
//         err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           'Could not check readiness. Please try again.',
//       );
//     } finally {
//       if (isMounted.current) setChecking(false);
//     }
//   }, [hasBackend, tournamentId, gameNumber]);

//   useFocusEffect(
//     useCallback(() => {
//       loadReadiness();
//       return undefined;
//     }, [loadReadiness]),
//   );

//   const activeSession = readiness?.activeSession || null;
//   const canStart = Boolean(activeSession) || readiness?.ready === true;

//   // Keep polling only while the player is blocked (usually waiting on the opponent).
//   useFocusEffect(
//     useCallback(() => {
//       if (!hasBackend || canStart) return undefined;
//       const timer = setInterval(loadReadiness, POLL_MS);
//       return () => clearInterval(timer);
//     }, [hasBackend, canStart, loadReadiness]),
//   );

//   const playMode = String(
//     readiness?.playMode || route?.params?.playMode || tournament?.playMode || '',
//   ).toUpperCase();
//   const isChallenge = playMode === 'CHALLENGE';
//   const completed = readiness?.completedGameNumbers || [];
//   const reasons = (readiness?.reasons || []).filter(Boolean);

//   const handleContinue = () => {
//     const startGameNumber = Number(activeSession?.gameNumber ?? gameNumber) || 1;
//     navigation.navigate('GameRules', {
//       ...route?.params,
//       tournament,
//       selectedTeam: route?.params?.selectedTeam,
//       players: route?.params?.players,
//       playMode: route?.params?.playMode || tournament?.playMode || 'practice',
//       gameNumber: startGameNumber,
//       selectedGameIndex: startGameNumber - 1,
//     });
//   };

//   const renderCheckRow = (label, ok, optional = false) => (
//     <View style={styles.checkRow} key={label}>
//       <Text style={styles.checkLabel}>{label}</Text>
//       <Text
//         style={[
//           styles.checkValue,
//           ok
//             ? styles.checkValueYes
//             : optional
//             ? styles.checkValueOptional
//             : styles.checkValueNo,
//         ]}
//       >
//         {ok ? 'Yes' : 'No'}
//       </Text>
//     </View>
//   );

//   const renderReadinessCard = () => {
//     if (!hasBackend) return null;

//     if (checking && !readiness && !error) {
//       return (
//         <View style={styles.readinessCard}>
//           <Text style={styles.readinessLabel}>Start readiness</Text>
//           <View style={styles.readinessLoadingRow}>
//             <ActivityIndicator size="small" color={COLORS.cta} />
//             <Text style={styles.readinessSubtitle}>Checking readiness…</Text>
//           </View>
//         </View>
//       );
//     }

//     if (error) {
//       return (
//         <View style={[styles.readinessCard, styles.readinessCardError]}>
//           <Text style={styles.readinessLabel}>Start readiness</Text>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={loadReadiness} activeOpacity={0.7}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     if (!readiness) return null;

//     return (
//       <View style={styles.readinessCard}>
//         <View style={styles.readinessTopRow}>
//           <View style={styles.readinessTopText}>
//             <Text style={styles.readinessLabel}>Start readiness</Text>
//             {activeSession ? (
//               <Text style={styles.readinessSubtitle}>
//                 Resume Game {activeSession.gameNumber} · Hole{' '}
//                 {activeSession.currentHole}, shot {activeSession.currentShot} ·
//                 Score {activeSession.score}
//               </Text>
//             ) : (
//               <Text style={styles.readinessSubtitle}>
//                 Checking Game {gameNumber}
//                 {isChallenge ? ' · Challenge' : ' · Practice'}
//               </Text>
//             )}
//           </View>

//           <View
//             style={[styles.badge, canStart ? styles.badgeReady : styles.badgeWaiting]}
//           >
//             <Text
//               style={[
//                 styles.badgeText,
//                 canStart ? styles.badgeTextReady : styles.badgeTextWaiting,
//               ]}
//             >
//               {activeSession ? 'Resume' : readiness.ready ? 'Ready' : 'Not ready'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.checkList}>
//           {renderCheckRow('Course configured', Boolean(readiness.courseConfigured))}
//           {renderCheckRow('Team selected', Boolean(readiness.teamReady))}
//           {isChallenge
//             ? renderCheckRow('Opponent accepted', Boolean(readiness.opponentReady))
//             : null}
//           {renderCheckRow('Game rules seeded', Boolean(readiness.rulesReady))}
//           {renderCheckRow('Map GPS (optional)', Boolean(readiness.mapReady), true)}
//         </View>

//         {!canStart && reasons.length > 0 ? (
//           <View style={styles.reasonBlock}>
//             {reasons.map((reason) => (
//               <Text style={styles.reasonText} key={reason}>
//                 • {reason}
//               </Text>
//             ))}
//           </View>
//         ) : null}

//         {completed.length > 0 ? (
//           <Text style={styles.completedText}>
//             Completed: Game {completed.join(', ')}
//             {readiness.nextGameNumber != null
//               ? ` · Next: Game ${readiness.nextGameNumber}`
//               : ' · All nines done'}
//           </Text>
//         ) : null}

//         <TouchableOpacity
//           style={styles.refreshRow}
//           onPress={loadReadiness}
//           disabled={checking}
//           activeOpacity={0.7}
//         >
//           {checking ? (
//             <ActivityIndicator size="small" color={COLORS.cta} />
//           ) : (
//             <Text style={styles.refreshText}>Refresh status</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderGameCard = (game) => {
//     const isOpen = expanded === game.gameNumber;
//     const isSelected = gameNumber === game.gameNumber;
//     const isDone = completed.includes(game.gameNumber);
//     const isActive = Number(activeSession?.gameNumber) === game.gameNumber;

//     return (
//       <View
//         key={game.gameNumber}
//         style={[styles.gameCard, (isSelected || isActive) && styles.gameCardSelected]}
//       >
//         <TouchableOpacity
//           style={styles.gameCardHeader}
//           onPress={() => {
//             setExpanded(isOpen ? null : game.gameNumber);
//             setGameNumber(game.gameNumber);
//           }}
//           activeOpacity={0.8}
//         >
//           <View style={styles.gameTitleRow}>
//             <Text style={styles.gameTitle}>Game Number {game.gameNumber}</Text>
//             {isActive ? (
//               <Text style={styles.tagActive}>IN PROGRESS</Text>
//             ) : isDone ? (
//               <Text style={styles.tagDone}>Done</Text>
//             ) : null}
//           </View>
//           <AuthIcon
//             name={isOpen ? 'chevron-up' : 'chevron-down'}
//             size={moderateScale(18)}
//             color={COLORS.textLabel}
//           />
//         </TouchableOpacity>

//         {isOpen ? (
//           <View style={styles.gameCardBody}>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Golf course</Text>
//               <Text style={styles.detailValue}>
//                 {game.courseName || 'Not configured'}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Which nine</Text>
//               <Text style={styles.detailValue}>
//                 {game.holeStart != null && game.holeEnd != null
//                   ? `Holes ${game.holeStart}–${game.holeEnd}`
//                   : '—'}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>This game</Text>
//               <Text style={styles.detailValue}>
//                 {game.holeStart != null && game.holeEnd != null
//                   ? `${game.holeEnd - game.holeStart + 1} holes`
//                   : '—'}
//               </Text>
//             </View>
//           </View>
//         ) : null}
//       </View>
//     );
//   };

//   return (
//     <ScreenScaffold edges={['top', 'bottom']} showDots>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       <View style={styles.headerBlock}>
//         <CircularBackButton onPress={() => navigation.goBack()} />
//         <ScreenHeader
//           title="Select game"
//           subtitle="Check everyone is ready, then pick the nine you want to play"
//           titleStyle={styles.title}
//         />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {renderReadinessCard()}

//         {loadingGames ? (
//           <ActivityIndicator
//             size="large"
//             color={COLORS.textPrimary}
//             style={{ marginVertical: hp(4) }}
//           />
//         ) : (
//           games.map(renderGameCard)
//         )}
//       </ScrollView>

//       <View style={styles.btnFixedBottom}>
//         <PrimaryPillButton
//           title={activeSession ? 'CONTINUE GAME' : 'CONTINUE'}
//           onPress={handleContinue}
//           loading={checking && !readiness}
//           disabled={hasBackend && !canStart}
//         />
//         {hasBackend && !canStart ? (
//           <Text style={styles.blockedHint}>
//             {isChallenge && readiness?.opponentReady === false
//               ? 'Waiting for the invited opponent team to accept.'
//               : 'Finish the checklist above to start this game.'}
//           </Text>
//         ) : null}
//       </View>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   headerBlock: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(0.5),
//   },
//   title: {
//     fontSize: fontSize(26),
//     lineHeight: fontSize(32),
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(3),
//   },

//   // Start readiness
//   readinessCard: {
//     backgroundColor: COLORS.textPrimary,
//     borderRadius: moderateScale(20),
//     borderWidth: 1,
//     borderColor: 'rgba(188, 255, 0, 0.35)',
//     paddingHorizontal: wp(4.5),
//     paddingVertical: hp(1.8),
//     marginBottom: hp(2),
//   },
//   readinessCardError: {
//     borderColor: 'rgba(255, 68, 68, 0.5)',
//   },
//   readinessTopRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     gap: wp(3),
//   },
//   readinessTopText: {
//     flex: 1,
//   },
//   readinessLabel: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(11),
//     color: 'rgba(255, 255, 255, 0.5)',
//     letterSpacing: 1.1,
//     textTransform: 'uppercase',
//   },
//   readinessSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: 'rgba(255, 255, 255, 0.85)',
//     marginTop: hp(0.5),
//     lineHeight: fontSize(19),
//   },
//   readinessLoadingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(2.5),
//     marginTop: hp(0.8),
//   },
//   badge: {
//     borderRadius: moderateScale(9),
//     paddingHorizontal: wp(2.5),
//     paddingVertical: hp(0.5),
//   },
//   badgeReady: {
//     backgroundColor: COLORS.cta,
//   },
//   badgeWaiting: {
//     backgroundColor: 'rgba(251, 191, 36, 0.2)',
//   },
//   badgeText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10),
//     letterSpacing: 0.6,
//     textTransform: 'uppercase',
//   },
//   badgeTextReady: {
//     color: COLORS.ctaText,
//   },
//   badgeTextWaiting: {
//     color: AMBER,
//   },
//   checkList: {
//     marginTop: hp(1.4),
//     gap: hp(0.7),
//   },
//   checkRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: wp(3),
//   },
//   checkLabel: {
//     flex: 1,
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(12.5),
//     color: 'rgba(255, 255, 255, 0.7)',
//   },
//   checkValue: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12.5),
//   },
//   checkValueYes: {
//     color: COLORS.cta,
//   },
//   checkValueNo: {
//     color: AMBER_STRONG,
//   },
//   checkValueOptional: {
//     color: 'rgba(255, 255, 255, 0.4)',
//     fontFamily: FONTS.medium,
//   },
//   reasonBlock: {
//     marginTop: hp(1.4),
//     paddingTop: hp(1.2),
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.12)',
//     gap: hp(0.4),
//   },
//   reasonText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: AMBER,
//     lineHeight: fontSize(18),
//   },
//   completedText: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(11),
//     color: 'rgba(255, 255, 255, 0.45)',
//     marginTop: hp(1.2),
//   },
//   refreshRow: {
//     marginTop: hp(1.4),
//     alignSelf: 'flex-start',
//   },
//   refreshText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.cta,
//     textDecorationLine: 'underline',
//   },
//   errorText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12.5),
//     color: '#FCA5A5',
//     marginTop: hp(0.8),
//     lineHeight: fontSize(19),
//   },
//   retryText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.cta,
//     textDecorationLine: 'underline',
//     marginTop: hp(1),
//   },

//   // Game cards
//   gameCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(20),
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     marginBottom: hp(1.6),
//     overflow: 'hidden',
//   },
//   gameCardSelected: {
//     borderColor: COLORS.cta,
//     borderWidth: 2,
//   },
//   gameCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.8),
//     gap: wp(3),
//   },
//   gameTitleRow: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(2),
//   },
//   gameTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: COLORS.textPrimary,
//   },
//   tagDone: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(10),
//     color: COLORS.textMuted,
//   },
//   tagActive: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10),
//     color: '#5C8A00',
//     letterSpacing: 0.5,
//   },
//   gameCardBody: {
//     paddingHorizontal: wp(4),
//     paddingTop: hp(1.2),
//     paddingBottom: hp(1.8),
//     borderTopWidth: 1,
//     borderTopColor: '#EDF2F7',
//     gap: hp(0.8),
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: wp(3),
//   },
//   detailLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12.5),
//     color: COLORS.textMuted,
//   },
//   detailValue: {
//     flex: 1,
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12.5),
//     color: COLORS.textPrimary,
//     textAlign: 'right',
//   },

//   btnFixedBottom: {
//     paddingHorizontal: wp(6),
//     paddingBottom: hp(2),
//     paddingTop: hp(1),
//   },
//   blockedHint: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(11.5),
//     color: COLORS.textMuted,
//     textAlign: 'center',
//     marginTop: hp(1),
//   },
// });

// export default SelectGameScreen;


import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  ScreenScaffold,
  CircularBackButton,
  ScreenHeader,
  PrimaryPillButton,
} from '../../components/ui';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import Toast from 'react-native-toast-message';
import { getConfigureGamesApi } from '../../services/homeService';
import { getStartGameReadinessApi } from '../../services/playService';

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/** Re-check while blocked so an opponent accepting shows up without leaving the screen. */
const POLL_MS = 10000;

const AMBER = '#FDE68A';
const AMBER_STRONG = '#FCD34D';

const SelectGameScreen = ({ navigation, route }) => {
  const tournament = route?.params?.tournament || route?.params?.newTournament;
  const tournamentId = tournament?.id || tournament?._id;
  const hasBackend = Boolean(tournamentId && isUuid(String(tournamentId)));

  const initialGameNumber =
    Number(
      route?.params?.gameNumber ??
      (route?.params?.selectedGameIndex != null
        ? Number(route.params.selectedGameIndex) + 1
        : 1),
    ) || 1;

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gameNumber, setGameNumber] = useState(initialGameNumber);
  const [expanded, setExpanded] = useState(initialGameNumber);
  const [readiness, setReadiness] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  const userPickedGame = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  // Game list (course + nine per game) comes from the same config the creator saved.
  useEffect(() => {
    const loadGames = async () => {
      const fallbackCount = Number(tournament?.numberOfGames) || 1;
      if (!hasBackend) {
        setGames(
          Array.from({ length: fallbackCount }, (_, i) => ({
            gameNumber: i + 1,
            courseName: null,
            holeStart: null,
            holeEnd: null,
            configured: false,
          })),
        );
        setLoadingGames(false);
        return;
      }

      try {
        const res = await getConfigureGamesApi(tournamentId);
        const data = res?.data || res;
        const count = Number(data?.numberOfGames) || fallbackCount;
        const list = Array.from({ length: count }, (_, i) => {
          const existing = (data?.games || []).find(
            (g) => Number(g.gameNumber) === i + 1,
          );
          return {
            gameNumber: i + 1,
            courseName: existing?.course?.name || existing?.golfCourseName || null,
            holeStart: existing?.holeStart ?? null,
            holeEnd: existing?.holeEnd ?? null,
            configured: Boolean(existing?.configured ?? existing?.course),
          };
        });
        if (isMounted.current) setGames(list);
      } catch (err) {
        console.log('Select game — load games error:', err);
        if (isMounted.current) {
          setGames(
            Array.from({ length: fallbackCount }, (_, i) => ({
              gameNumber: i + 1,
              courseName: null,
              holeStart: null,
              holeEnd: null,
              configured: false,
            })),
          );
        }
      } finally {
        if (isMounted.current) setLoadingGames(false);
      }
    };

    loadGames();
  }, [tournamentId, hasBackend, tournament?.numberOfGames]);

  const loadReadiness = useCallback(async () => {
    if (!hasBackend) {
      setReadiness(null);
      return;
    }

    setChecking(true);
    setError(null);
    try {
      const res = await getStartGameReadinessApi(tournamentId, { gameNumber });
      const data = res?.data || res;
      if (!isMounted.current) return;
      setReadiness(data);

      // Auto-advance only until the player picks a game from the list.
      if (!userPickedGame.current) {
        const resumeGame = data?.activeSession?.gameNumber;
        const completedList = (data?.completedGameNumbers || []).map(Number);
        if (resumeGame != null && Number(resumeGame) !== gameNumber) {
          setGameNumber(Number(resumeGame));
          setExpanded(Number(resumeGame));
        } else if (completedList.includes(Number(gameNumber)) && data?.nextGameNumber != null) {
          setGameNumber(Number(data.nextGameNumber));
          setExpanded(Number(data.nextGameNumber));
        }
      }
    } catch (err) {
      console.log('Select game — readiness error:', err);
      if (err?.response?.status === 401) return;
      if (!isMounted.current) return;
      setReadiness(null);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Could not check readiness. Please try again.',
      );
    } finally {
      if (isMounted.current) setChecking(false);
    }
  }, [hasBackend, tournamentId, gameNumber]);

  useFocusEffect(
    useCallback(() => {
      loadReadiness();
      return undefined;
    }, [loadReadiness]),
  );

  const activeSession = readiness?.activeSession || null;
  const canStart = Boolean(activeSession) || readiness?.ready === true;

  // Keep polling only while the player is blocked (usually waiting on the opponent).
  useFocusEffect(
    useCallback(() => {
      if (!hasBackend || canStart) return undefined;
      const timer = setInterval(loadReadiness, POLL_MS);
      return () => clearInterval(timer);
    }, [hasBackend, canStart, loadReadiness]),
  );

  const playMode = String(
    readiness?.playMode || route?.params?.playMode || tournament?.playMode || '',
  ).toUpperCase();
  const isChallenge = playMode === 'CHALLENGE';
  const completed = (readiness?.completedGameNumbers || []).map(Number);
  const reasons = (readiness?.reasons || []).filter(Boolean);

  const isCurrentGameCompleted = completed.includes(gameNumber);

  const handleContinue = () => {
    if (isCurrentGameCompleted) {
      Toast.show({
        type: 'info',
        text1: 'Game Completed',
        text2: `Game ${gameNumber} is already completed and cannot be replayed.`,
      });
      return;
    }

    if (isChallenge && readiness?.opponentReady === false && !activeSession) {
      Toast.show({
        type: 'error',
        text1: 'Waiting for Opponent',
        text2:
          reasons.join('. ') ||
          'Waiting for the invited opponent team to accept before Start Game.',
      });
      return;
    }

    if (activeSession && (activeSession.id || activeSession.sessionId)) {
      navigation.navigate('ActiveGame', {
        ...route?.params,
        tournament,
        sessionId: activeSession.id || activeSession.sessionId,
        gameNumber: Number(activeSession.gameNumber) || gameNumber,
        playMode: (route?.params?.playMode || tournament?.playMode || 'practice').toLowerCase() === 'challenge' ? 'challenge' : 'practice',
      });
      return;
    }

    const startGameNumber =
      Number(
        activeSession?.gameNumber ??
          (completed.includes(gameNumber) ? readiness?.nextGameNumber : gameNumber) ??
          readiness?.nextGameNumber ??
          gameNumber,
      ) || 1;
    navigation.navigate('GameRules', {
      ...route?.params,
      tournament,
      selectedTeam: route?.params?.selectedTeam,
      players: route?.params?.players,
      playMode: route?.params?.playMode || tournament?.playMode || 'practice',
      gameNumber: startGameNumber,
      selectedGameIndex: startGameNumber - 1,
    });
  };

  const renderCheckRow = (label, ok, optional = false) => (
    <View style={styles.checkRow} key={label}>
      <Text style={styles.checkLabel}>{label}</Text>
      <Text
        style={[
          styles.checkValue,
          ok
            ? styles.checkValueYes
            : optional
              ? styles.checkValueOptional
              : styles.checkValueNo,
        ]}
      >
        {ok ? 'Yes' : 'No'}
      </Text>
    </View>
  );

  const renderReadinessCard = () => {
    if (!hasBackend) return null;

    if (checking && !readiness && !error) {
      return (
        <View style={styles.readinessCard}>
          <Text style={styles.readinessLabel}>Start readiness</Text>
          <View style={styles.readinessLoadingRow}>
            <ActivityIndicator size="small" color={COLORS.cta} />
            <Text style={styles.readinessSubtitle}>Checking readiness…</Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.readinessCard, styles.readinessCardError]}>
          <Text style={styles.readinessLabel}>Start readiness</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadReadiness} activeOpacity={0.7}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!readiness) return null;

    return (
      <View style={styles.readinessCard}>
        <View style={styles.readinessTopRow}>
          <View style={styles.readinessTopText}>
            <Text style={styles.readinessLabel}>Start readiness</Text>
            {activeSession ? (
              <Text style={styles.readinessSubtitle}>
                Resume Game {activeSession.gameNumber} · Hole{' '}
                {activeSession.currentHole}, shot {activeSession.currentShot} ·
                Score {activeSession.score}
              </Text>
            ) : (
              <Text style={styles.readinessSubtitle}>
                Checking Game {gameNumber}
                {isChallenge ? ' · Challenge' : ' · Practice'}
              </Text>
            )}
          </View>

          <View
            style={[styles.badge, canStart ? styles.badgeReady : styles.badgeWaiting]}
          >
            <Text
              style={[
                styles.badgeText,
                canStart ? styles.badgeTextReady : styles.badgeTextWaiting,
              ]}
            >
              {activeSession ? 'Resume' : readiness.ready ? 'Ready' : 'Not ready'}
            </Text>
          </View>
        </View>

        <View style={styles.checkList}>
          {renderCheckRow('Course configured', Boolean(readiness.courseConfigured))}
          {renderCheckRow('Team selected', Boolean(readiness.teamReady))}
          {isChallenge
            ? renderCheckRow('Opponent accepted', Boolean(readiness.opponentReady))
            : null}
          {/* {renderCheckRow('Game rules seeded', Boolean(readiness.rulesReady))} */}
          {renderCheckRow('Map GPS (optional)', Boolean(readiness.mapReady), true)}
        </View>

        {!canStart && reasons.length > 0 ? (
          <View style={styles.reasonBlock}>
            {reasons.map((reason) => (
              <Text style={styles.reasonText} key={reason}>
                • {reason}
              </Text>
            ))}
          </View>
        ) : null}



        {completed.length > 0 ? (
          <Text style={styles.completedText}>
            Completed: Game {completed.join(', ')}
            {readiness.nextGameNumber != null
              ? ` · Next: Game ${readiness.nextGameNumber}`
              : ' · All nines done'}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.refreshRow}
          onPress={loadReadiness}
          disabled={checking}
          activeOpacity={0.7}
        >
          {checking ? (
            <ActivityIndicator size="small" color={COLORS.cta} />
          ) : (
            <Text style={styles.refreshText}>Refresh status</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderGameCard = (game) => {
    const isOpen = expanded === game.gameNumber;
    const isSelected = gameNumber === game.gameNumber;
    const isDone = completed.includes(game.gameNumber);
    const isActive = Number(activeSession?.gameNumber) === game.gameNumber;

    return (
      <View
        key={game.gameNumber}
        style={[styles.gameCard, (isSelected || isActive) && styles.gameCardSelected]}
      >
        <TouchableOpacity
          style={styles.gameCardHeader}
          onPress={() => {
            userPickedGame.current = true;
            setExpanded(isOpen ? null : game.gameNumber);
            setGameNumber(game.gameNumber);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.gameTitleRow}>
            <Text style={styles.gameTitle}>Game Number {game.gameNumber}</Text>
            {isActive ? (
              <View style={[styles.badge, styles.badgeReady]}>
                <Text style={[styles.badgeText, styles.badgeTextReady]}>IN PROGRESS</Text>
              </View>
            ) : isDone ? (
              <View style={[styles.badge, styles.badgeCompleted]}>
                <Text style={[styles.badgeText, styles.badgeTextCompleted]}>COMPLETED</Text>
              </View>
            ) : null}
          </View>
          <AuthIcon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(18)}
            color={COLORS.textLabel}
          />
        </TouchableOpacity>

        {isOpen ? (
          <View style={styles.gameCardBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Golf course</Text>
              <Text style={styles.detailValue}>
                {game.courseName || 'Not configured'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Which nine</Text>
              <Text style={styles.detailValue}>
                {game.holeStart != null && game.holeEnd != null
                  ? `Holes ${game.holeStart}–${game.holeEnd}`
                  : '—'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>This game</Text>
              <Text style={styles.detailValue}>
                {game.holeStart != null && game.holeEnd != null
                  ? `${game.holeEnd - game.holeStart + 1} holes`
                  : '—'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenScaffold edges={['top', 'bottom']} showDots>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.headerBlock}>
        <CircularBackButton onPress={() => navigation.goBack()} />
        <ScreenHeader
          title="Select Game"
          subtitle="Check everyone is ready, then pick the nine you want to play"
          titleStyle={styles.title}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderReadinessCard()}

        {loadingGames ? (
          <ActivityIndicator
            size="large"
            color={COLORS.textPrimary}
            style={{ marginVertical: hp(4) }}
          />
        ) : (
          games.map(renderGameCard)
        )}
      </ScrollView>

      <View style={styles.btnFixedBottom}>
        <PrimaryPillButton
          title={isCurrentGameCompleted ? 'GAME COMPLETED' : activeSession ? 'CONTINUE GAME' : 'START GAME'}
          onPress={handleContinue}
          loading={checking && !readiness}
          disabled={isCurrentGameCompleted || (hasBackend && !canStart)}
        />
        {isCurrentGameCompleted ? (
          <Text style={styles.blockedHint}>
            Game {gameNumber} is already completed and cannot be replayed. Select another game.
          </Text>
        ) : hasBackend && !canStart ? (
          <Text style={styles.blockedHint}>
            {isChallenge && readiness?.opponentReady === false
              ? 'Waiting for the invited opponent team to accept.'
              : 'Finish the checklist above to start this game.'}
          </Text>
        ) : null}
      </View>
    </ScreenScaffold>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(0.5),
  },
  title: {
    fontSize: fontSize(26),
    lineHeight: fontSize(32),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
  },

  // Start readiness
  readinessCard: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.35)',
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.8),
    marginBottom: hp(2),
  },
  readinessCardError: {
    borderColor: 'rgba(255, 68, 68, 0.5)',
  },
  readinessTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  readinessTopText: {
    flex: 1,
  },
  readinessLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  readinessSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: hp(0.5),
    lineHeight: fontSize(19),
  },
  readinessLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    marginTop: hp(0.8),
  },
  badge: {
    borderRadius: moderateScale(9),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
  },
  badgeReady: {
    backgroundColor: COLORS.cta,
  },
  badgeWaiting: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badgeTextReady: {
    color: COLORS.ctaText,
  },
  badgeTextWaiting: {
    color: AMBER,
  },
  checkList: {
    marginTop: hp(1.4),
    gap: hp(0.7),
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  checkLabel: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: fontSize(12.5),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkValue: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
  },
  checkValueYes: {
    color: COLORS.cta,
  },
  checkValueNo: {
    color: AMBER_STRONG,
  },
  checkValueOptional: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: FONTS.medium,
  },
  reasonBlock: {
    marginTop: hp(1.4),
    paddingTop: hp(1.2),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    gap: hp(0.4),
  },
  reasonText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: AMBER,
    lineHeight: fontSize(18),
  },
  completedText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(11),
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: hp(1.2),
  },
  refreshRow: {
    marginTop: hp(1.4),
    alignSelf: 'flex-start',
  },
  refreshText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: COLORS.cta,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#FCA5A5',
    marginTop: hp(0.8),
    lineHeight: fontSize(19),
  },
  retryText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: COLORS.cta,
    textDecorationLine: 'underline',
    marginTop: hp(1),
  },

  // Game cards
  gameCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: hp(1.6),
    overflow: 'hidden',
  },
  gameCardSelected: {
    borderColor: COLORS.cta,
    borderWidth: 2,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    gap: wp(3),
  },
  gameTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  gameTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: COLORS.textPrimary,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(14, 59, 46, 0.12)',
  },
  badgeTextCompleted: {
    color: '#093A24',
  },
  gameCardBody: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    paddingBottom: hp(1.8),
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    gap: hp(0.8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  detailLabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: COLORS.textMuted,
  },
  detailValue: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: COLORS.textPrimary,
    textAlign: 'right',
  },

  btnFixedBottom: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
    paddingTop: hp(1),
  },
  blockedHint: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: hp(1),
  },
});

export default SelectGameScreen;
