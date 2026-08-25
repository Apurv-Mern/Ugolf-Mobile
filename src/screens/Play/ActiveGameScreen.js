// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   BackHandler,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import AuthIcon from '../../components/common/AuthIcon';
// import HoleMap from '../../components/play/HoleMap';
// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   PrimaryPillButton,
//   SecondaryPillButton,
//   GlassCard,
//   GameEndModal,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import {
//   getGameSessionApi,
//   answerYesSessionApi,
//   answerNoSessionApi,
//   confirmInstructionSessionApi,
//   backSessionStepApi,
// } from '../../services/playService';

// const isUuid = (id) =>
//   typeof id === 'string' &&
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const emptyMap = {
//   hasGps: false,
//   green: null,
//   tee: null,
//   currentHolePois: [],
// };

// /** Align with admin mobile-flow LivePlayScreen / PlayState */
// const ActiveGameScreen = ({ navigation, route }) => {
//   const tournament = route?.params?.tournament;
//   const selectedTeam = route?.params?.selectedTeam;
//   const players = route?.params?.players;
//   const playModeParam = route?.params?.playMode || 'practice';
//   const initialSessionData = route?.params?.initialSessionData;
//   const tournamentId = tournament?.id || tournament?._id;

//   const [activeSessionId, setActiveSessionId] = useState(
//     route?.params?.sessionId ||
//     initialSessionData?.play?.sessionId ||
//     initialSessionData?.sessionId ||
//     initialSessionData?.id ||
//     '',
//   );

//   const [playScreen, setPlayScreen] = useState('QUESTIONS'); // QUESTIONS | INSTRUCTION | FINISHED
//   const [holeNumber, setHoleNumber] = useState(1);
//   const [parValue, setParValue] = useState(4);
//   const [shotNumber, setShotNumber] = useState(1);
//   const [score, setScore] = useState(0);
//   const [originLocation, setOriginLocation] = useState('TEE');
//   const [promptText, setPromptText] = useState('After playing your shot…');
//   const [questionText, setQuestionText] = useState('');
//   const [activeQuestionId, setActiveQuestionId] = useState('');
//   const [hasQuestion, setHasQuestion] = useState(false);
//   const [instructionText, setInstructionText] = useState('');
//   const [mapData, setMapData] = useState(emptyMap);
//   const [playMeta, setPlayMeta] = useState({
//     tournamentName: tournament?.title || tournament?.name || 'Tournament',
//     golfCourseName: '',
//     playMode: String(playModeParam).toUpperCase(),
//     gameNumber: route?.params?.gameNumber || 1,
//     holeStart: null,
//     holeEnd: null,
//   });

//   const [showGameEndModal, setShowGameEndModal] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   const canCallSessionApi =
//     tournamentId &&
//     activeSessionId &&
//     isUuid(String(tournamentId)) &&
//     isUuid(String(activeSessionId));

//   const exitToHome = useCallback(() => {
//     setShowGameEndModal(false);
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   }, [navigation]);

//   const confirmLeaveGame = useCallback(() => {
//     Alert.alert(
//       'Leave game?',
//       'Are you sure you want to leave this round? You can resume later from Select game.',
//       [
//         { text: 'Stay', style: 'cancel' },
//         { text: 'Leave', style: 'destructive', onPress: exitToHome },
//       ],
//     );
//   }, [exitToHome]);

//   const onBackPress = useCallback(() => {
//     confirmLeaveGame();
//     return true;
//   }, [confirmLeaveGame]);

//   useFocusEffect(
//     useCallback(() => {
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [onBackPress]),
//   );

//   const parseSessionState = useCallback(
//     (data) => {
//       if (!data) return;
//       const playData = data.play || data.session || data.gameSession || data;

//       const sId = playData.sessionId || data.sessionId || activeSessionId;
//       if (sId) setActiveSessionId(String(sId));

//       const screen = playData.screen || (playData.finished ? 'FINISHED' : 'QUESTIONS');
//       setPlayScreen(screen);

//       const hole = playData.currentHole ?? playData.holeNumber ?? playData.hole;
//       if (hole != null) setHoleNumber(hole);

//       const par = playData.currentPar ?? playData.parValue ?? playData.par;
//       if (par != null) setParValue(par);

//       const shot = playData.currentShot ?? playData.shotNumber ?? playData.shot;
//       if (shot != null) setShotNumber(shot);

//       const sc = playData.score ?? playData.totalScore;
//       if (sc != null) setScore(sc);

//       if (playData.currentOrigin) setOriginLocation(playData.currentOrigin);
//       if (playData.prompt) setPromptText(playData.prompt);
//       if (playData.instructionText != null) setInstructionText(playData.instructionText);

//       setPlayMeta((prev) => ({
//         tournamentName:
//           playData.tournamentName || tournament?.title || tournament?.name || prev.tournamentName,
//         golfCourseName: playData.golfCourseName || prev.golfCourseName,
//         playMode: playData.playMode || prev.playMode,
//         gameNumber: playData.gameNumber ?? prev.gameNumber,
//         holeStart: playData.holeStart ?? prev.holeStart,
//         holeEnd: playData.holeEnd ?? prev.holeEnd,
//       }));

//       if (playData.map && typeof playData.map === 'object') {
//         setMapData({
//           hasGps: !!playData.map.hasGps,
//           green: playData.map.green ?? null,
//           tee: playData.map.tee ?? null,
//           currentHolePois: Array.isArray(playData.map.currentHolePois)
//             ? playData.map.currentHolePois
//             : [],
//         });
//       }

//       const qList = playData.questions || [];
//       if (Array.isArray(qList) && qList.length > 0) {
//         const activeQ = qList[0];
//         setHasQuestion(true);
//         setQuestionText(activeQ.text || activeQ.question || '');
//         setActiveQuestionId(String(activeQ.id || activeQ._id || ''));
//       } else if (playData.questionText || playData.question) {
//         setHasQuestion(true);
//         setQuestionText(playData.questionText || playData.question);
//         setActiveQuestionId(playData.questionId ? String(playData.questionId) : '');
//       } else {
//         setHasQuestion(false);
//         setQuestionText('');
//         setActiveQuestionId('');
//       }

//       if (screen === 'FINISHED' || playData.finished || playData.isFinished || playData.status === 'FINISHED') {
//         setShowGameEndModal(true);
//       }
//     },
//     [activeSessionId, tournament],
//   );

//   const runPlayAction = async (fn) => {
//     if (!canCallSessionApi) {
//       Toast.show({
//         type: 'error',
//         text1: 'Session unavailable',
//         text2: 'Start the game again from Game Rules.',
//       });
//       return;
//     }
//     try {
//       setActionLoading(true);
//       const res = await fn();
//       parseSessionState(res);
//     } catch (err) {
//       if (err?.response?.status === 401) return;
//       const backendMsg =
//         err?.response?.data?.error || err?.response?.data?.message || 'Could not update play state.';
//       Toast.show({ type: 'error', text1: 'Action Failed', text2: backendMsg });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const loadSessionState = async () => {
//     try {
//       setActionLoading(true);
//       const res = await getGameSessionApi(tournamentId, activeSessionId);
//       parseSessionState(res);
//     } catch (err) {
//       console.log('Fetch game session error:', err);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (initialSessionData) {
//       parseSessionState(initialSessionData);
//     } else if (canCallSessionApi) {
//       loadSessionState();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tournamentId, activeSessionId]);

//   const handleSelectYes = () => {
//     if (!activeQuestionId) {
//       Toast.show({
//         type: 'error',
//         text1: 'No question',
//         text2: 'There is no active question to answer Yes.',
//       });
//       return;
//     }
//     runPlayAction(() =>
//       answerYesSessionApi(tournamentId, activeSessionId, { questionId: activeQuestionId }),
//     );
//   };

//   const handleSelectNo = () => {
//     // Admin mobile-flow: answer-no body is empty `{}`
//     runPlayAction(() => answerNoSessionApi(tournamentId, activeSessionId, {}));
//   };

//   const handleConfirmInstruction = () => {
//     runPlayAction(() => confirmInstructionSessionApi(tournamentId, activeSessionId));
//   };

//   const handleBackStep = () => {
//     runPlayAction(() => backSessionStepApi(tournamentId, activeSessionId));
//   };

//   const handleLeave = () => {
//     confirmLeaveGame();
//   };

//   const handleCheckScore = () => {
//     setShowGameEndModal(false);
//     navigation.navigate('Leaderboard', {
//       tournament,
//       selectedTeam,
//       players,
//       playMode: playModeParam,
//       gameNumber: playMeta.gameNumber || route?.params?.gameNumber || 1,
//       sessionId: activeSessionId,
//     });
//   };

//   const handleExitToHome = () => {
//     exitToHome();
//   };

//   const holesLabel =
//     playMeta.holeStart != null && playMeta.holeEnd != null
//       ? `Holes ${playMeta.holeStart}-${playMeta.holeEnd}`
//       : '';
//   const subtitle = [
//     `Game ${playMeta.gameNumber || 1}`,
//     playMeta.playMode === 'PRACTICE' ? 'Practice' : 'Challenge',
//     playMeta.golfCourseName,
//     holesLabel,
//   ]
//     .filter(Boolean)
//     .join(' · ');

//   const statPills = [
//     { icon: 'award', label: 'HOLE', value: holeNumber },
//     { icon: 'book', label: 'PAR', value: parValue },
//     { icon: 'trending-up', label: 'SHOT', value: shotNumber },
//     { icon: 'shield', label: 'LOCATION', value: originLocation },
//   ];

//   return (
//     <ScreenScaffold edges={['top', 'bottom']} showDots>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       <View style={styles.headerBlock}>
//         <CircularBackButton onPress={confirmLeaveGame} />
//         <ScreenHeader
//           title={playMeta.tournamentName}
//           subtitle={subtitle}
//           titleStyle={styles.headerTitle}
//           subtitleStyle={styles.headerSubtitle}
//         />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <GlassCard style={styles.statusCard}>
//           <View style={styles.statusInner}>
//             <View style={styles.pillsRow}>
//               {statPills.map((pill) => (
//                 <View key={pill.label} style={styles.pillItem}>
//                   <AuthIcon
//                     name={pill.icon}
//                     size={moderateScale(12)}
//                     color={COLORS.textPrimary}
//                   />
//                   <View style={styles.pillTextCol}>
//                     <Text style={styles.pillLabel}>{pill.label}</Text>
//                     <Text style={styles.pillVal} numberOfLines={1}>
//                       {pill.value}
//                     </Text>
//                   </View>
//                 </View>
//               ))}
//             </View>

//             <Text style={styles.scoreNumber}>{score}</Text>
//             <Text style={styles.scoreLabel}>Your Score</Text>
//           </View>
//         </GlassCard>

//         <View style={styles.mapSection}>
//           <HoleMap
//             key={`active-hole-map-${holeNumber}-${activeSessionId}`}
//             mapData={mapData}
//             holeNumber={holeNumber}
//             compact
//           />
//         </View>

//         {actionLoading ? (
//           <View style={styles.loadingRow}>
//             <ActivityIndicator color={COLORS.textPrimary} />
//             <Text style={styles.loadingText}>Updating play state…</Text>
//           </View>
//         ) : null}

//         {/* QUESTIONS — same contract as admin mobile-flow LivePlayScreen */}
//         {playScreen === 'QUESTIONS' && hasQuestion ? (
//           <>
//             <Text style={styles.sectionLabel}>{promptText || 'Question'}</Text>
//             <GlassCard style={styles.panel}>
//               <View style={styles.panelInner}>
//                 <Text style={styles.questionText}>{questionText}</Text>
//                 <View style={styles.yesNoRow}>
//                   <PrimaryPillButton
//                     title="YES"
//                     onPress={handleSelectYes}
//                     disabled={actionLoading}
//                     style={styles.halfBtn}
//                   />
//                   <SecondaryPillButton
//                     title="NO"
//                     onPress={handleSelectNo}
//                     disabled={actionLoading}
//                     style={styles.darkBtn}
//                     textStyle={styles.darkBtnText}
//                   />
//                 </View>
//               </View>
//             </GlassCard>
//           </>
//         ) : null}

//         {playScreen === 'QUESTIONS' && !hasQuestion ? (
//           <GlassCard style={styles.panel}>
//             <View style={styles.panelInner}>
//               <Text style={styles.panelTitle}>No question here</Text>
//               <Text style={styles.questionText}>
//                 {promptText ||
//                   'No questions for this location/par. Try the next set or go back one step.'}
//               </Text>
//               <PrimaryPillButton
//                 title="TRY NEXT QUESTIONS"
//                 onPress={handleSelectNo}
//                 disabled={actionLoading}
//                 textStyle={styles.compactBtnText}
//               />
//             </View>
//           </GlassCard>
//         ) : null}

//         {/* INSTRUCTION */}
//         {playScreen === 'INSTRUCTION' ? (
//           <GlassCard style={styles.panel}>
//             <View style={styles.panelInner}>
//               <Text style={styles.panelTitle}>Instruction</Text>
//               <Text style={styles.questionText}>{instructionText || 'Continue'}</Text>
//               <PrimaryPillButton
//                 title="GOT IT — CONTINUE"
//                 onPress={handleConfirmInstruction}
//                 disabled={actionLoading}
//                 textStyle={styles.compactBtnText}
//               />
//             </View>
//           </GlassCard>
//         ) : null}

//         {/* FINISHED */}
//         {playScreen === 'FINISHED' ? (
//           <GlassCard style={styles.panel}>
//             <View style={styles.panelInner}>
//               <Text style={styles.panelTitle}>Round complete</Text>
//               <Text style={styles.questionText}>Score {score}</Text>
//               <PrimaryPillButton
//                 title="VIEW SUMMARY"
//                 onPress={handleCheckScore}
//                 textStyle={styles.compactBtnText}
//               />
//             </View>
//           </GlassCard>
//         ) : null}

//         <View style={styles.bottomActionsRow}>
//           <SecondaryPillButton
//             title="BACK ONE STEP"
//             onPress={handleBackStep}
//             disabled={actionLoading || playScreen === 'FINISHED'}
//             style={styles.halfBtn}
//             textStyle={styles.compactBtnText}
//           />
//           <SecondaryPillButton
//             title="LEAVE"
//             onPress={handleLeave}
//             style={[styles.halfBtn, styles.darkBtn]}
//             textStyle={[styles.darkBtnText, styles.compactBtnText]}
//           />
//         </View>

//         <View style={{ height: hp(4) }} />
//       </ScrollView>

//       <GameEndModal
//         visible={showGameEndModal}
//         gameNumber={playMeta.gameNumber || 1}
//         score={score}
//         onCheckScore={handleCheckScore}
//         onLeave={handleExitToHome}
//         onClose={() => setShowGameEndModal(false)}
//       />
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   headerBlock: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(0.5),
//   },
//   headerTitle: {
//     fontSize: fontSize(24),
//     lineHeight: fontSize(30),
//     letterSpacing: 0,
//   },
//   headerSubtitle: {
//     fontSize: fontSize(13),
//     lineHeight: fontSize(18),
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingTop: hp(1.5),
//     paddingBottom: hp(4),
//   },
//   statusCard: {
//     marginHorizontal: wp(6),
//     backgroundColor: COLORS.textPrimary,
//     borderColor: COLORS.cta,
//     borderRadius: moderateScale(22),
//   },
//   statusInner: {
//     paddingHorizontal: wp(3.5),
//     paddingVertical: hp(1.8),
//   },
//   pillsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: wp(1.5),
//     marginBottom: hp(1.2),
//   },
//   pillItem: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(12),
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(0.8),
//     gap: wp(1),
//   },
//   pillTextCol: {
//     flex: 1,
//   },
//   pillLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(8),
//     color: COLORS.textPlaceholder,
//   },
//   pillVal: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.textPrimary,
//   },
//   scoreNumber: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(42),
//     color: COLORS.cta,
//     textAlign: 'center',
//     marginTop: hp(0.5),
//   },
//   scoreLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: 'rgba(255,255,255,0.75)',
//     textAlign: 'center',
//   },
//   mapSection: {
//     marginTop: hp(2.5),
//     paddingHorizontal: wp(6),
//   },
//   loadingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(2),
//     paddingHorizontal: wp(6),
//     marginTop: hp(1.5),
//   },
//   loadingText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: COLORS.textMuted,
//   },
//   sectionLabel: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.textLabel,
//     letterSpacing: 0.4,
//     marginTop: hp(2.2),
//     marginHorizontal: wp(6),
//     marginBottom: hp(0.8),
//     textTransform: 'uppercase',
//   },
//   panel: {
//     marginHorizontal: wp(6),
//     marginTop: hp(1),
//   },
//   panelInner: {
//     padding: wp(4.5),
//   },
//   panelTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.textLabel,
//     letterSpacing: 0.4,
//     textTransform: 'uppercase',
//     marginBottom: hp(0.8),
//   },
//   questionText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(16),
//     color: COLORS.textPrimary,
//     marginBottom: hp(2),
//     lineHeight: fontSize(22),
//   },
//   yesNoRow: {
//     flexDirection: 'row',
//     gap: wp(3),
//   },
//   halfBtn: {
//     flex: 1,
//   },
//   darkBtn: {
//     backgroundColor: COLORS.textPrimary,
//     borderColor: COLORS.textPrimary,
//   },
//   darkBtnText: {
//     color: COLORS.white,
//   },
//   compactBtnText: {
//     fontSize: fontSize(13),
//     letterSpacing: 0.4,
//   },
//   bottomActionsRow: {
//     flexDirection: 'row',
//     gap: wp(3),
//     marginTop: hp(2.5),
//     paddingHorizontal: wp(6),
//   },
// });

// export default ActiveGameScreen;





// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ImageBackground,
//   StatusBar,
//   BackHandler,
//   Platform,
//   ActivityIndicator,
//   Alert,
//   Modal,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import AuthIcon from '../../components/common/AuthIcon';
// import HoleMap from '../../components/play/HoleMap';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import {
//   getGameSessionApi,
//   answerYesSessionApi,
//   answerNoSessionApi,
//   confirmInstructionSessionApi,
//   backSessionStepApi,
// } from '../../services/playService';

// const trophyImg = require('../../assets/Images/ trophy.png');

// const isUuid = (id) =>
//   typeof id === 'string' &&
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const emptyMap = {
//   hasGps: false,
//   green: null,
//   tee: null,
//   currentHolePois: [],
// };

// const ActiveGameScreen = ({ navigation, route }) => {
//   const tournament = route?.params?.tournament;
//   const selectedTeam = route?.params?.selectedTeam;
//   const players = route?.params?.players;
//   const playModeParam = route?.params?.playMode || 'practice';
//   const initialSessionData = route?.params?.initialSessionData;
//   const tournamentId = tournament?.id || tournament?._id;

//   const [activeSessionId, setActiveSessionId] = useState(
//     route?.params?.sessionId ||
//     initialSessionData?.play?.sessionId ||
//     initialSessionData?.sessionId ||
//     initialSessionData?.id ||
//     '',
//   );

//   const [playScreen, setPlayScreen] = useState('QUESTIONS'); // QUESTIONS | INSTRUCTION | FINISHED
//   const [holeNumber, setHoleNumber] = useState(1);
//   const [parValue, setParValue] = useState(4);
//   const [shotNumber, setShotNumber] = useState(1);
//   const [score, setScore] = useState(0);
//   const [originLocation, setOriginLocation] = useState('TEE');
//   const [promptText, setPromptText] = useState('After playing your shot…');
//   const [questionText, setQuestionText] = useState('');
//   const [activeQuestionId, setActiveQuestionId] = useState('');
//   const [hasQuestion, setHasQuestion] = useState(false);
//   const [instructionText, setInstructionText] = useState('');
//   const [mapData, setMapData] = useState(emptyMap);
//   const [playMeta, setPlayMeta] = useState({
//     tournamentName: tournament?.title || tournament?.name || 'Tournament',
//     golfCourseName: '',
//     playMode: String(playModeParam).toUpperCase(),
//     gameNumber: route?.params?.gameNumber || 1,
//     holeStart: null,
//     holeEnd: null,
//   });

//   const [showGameEndModal, setShowGameEndModal] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   const canCallSessionApi =
//     tournamentId &&
//     activeSessionId &&
//     isUuid(String(tournamentId)) &&
//     isUuid(String(activeSessionId));

//   const exitToHome = useCallback(() => {
//     setShowGameEndModal(false);
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   }, [navigation]);

//   const confirmLeaveGame = useCallback(() => {
//     Alert.alert(
//       'Leave game?',
//       'Are you sure you want to leave this round? You can resume later from Select game.',
//       [
//         { text: 'Stay', style: 'cancel' },
//         { text: 'Leave', style: 'destructive', onPress: exitToHome },
//       ],
//     );
//   }, [exitToHome]);

//   const onBackPress = useCallback(() => {
//     confirmLeaveGame();
//     return true;
//   }, [confirmLeaveGame]);

//   useFocusEffect(
//     useCallback(() => {
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [onBackPress]),
//   );

//   const parseSessionState = useCallback(
//     (data) => {
//       if (!data) return;
//       const playData = data.play || data.session || data.gameSession || data;

//       const sId = playData.sessionId || data.sessionId || activeSessionId;
//       if (sId) setActiveSessionId(String(sId));

//       const screen = playData.screen || (playData.finished ? 'FINISHED' : 'QUESTIONS');
//       setPlayScreen(screen);

//       const hole = playData.currentHole ?? playData.holeNumber ?? playData.hole;
//       if (hole != null) setHoleNumber(hole);

//       const par = playData.currentPar ?? playData.parValue ?? playData.par;
//       if (par != null) setParValue(par);

//       const shot = playData.currentShot ?? playData.shotNumber ?? playData.shot;
//       if (shot != null) setShotNumber(shot);

//       const sc = playData.score ?? playData.totalScore;
//       if (sc != null) setScore(sc);

//       if (playData.currentOrigin) setOriginLocation(playData.currentOrigin);
//       if (playData.prompt) setPromptText(playData.prompt);
//       if (playData.instructionText != null) setInstructionText(playData.instructionText);

//       setPlayMeta((prev) => ({
//         tournamentName:
//           playData.tournamentName || tournament?.title || tournament?.name || prev.tournamentName,
//         golfCourseName: playData.golfCourseName || prev.golfCourseName,
//         playMode: playData.playMode || prev.playMode,
//         gameNumber: playData.gameNumber ?? prev.gameNumber,
//         holeStart: playData.holeStart ?? prev.holeStart,
//         holeEnd: playData.holeEnd ?? prev.holeEnd,
//       }));

//       if (playData.map && typeof playData.map === 'object') {
//         setMapData({
//           hasGps: !!playData.map.hasGps,
//           green: playData.map.green ?? null,
//           tee: playData.map.tee ?? null,
//           currentHolePois: Array.isArray(playData.map.currentHolePois)
//             ? playData.map.currentHolePois
//             : [],
//         });
//       }

//       const qList = playData.questions || [];
//       if (Array.isArray(qList) && qList.length > 0) {
//         const activeQ = qList[0];
//         setHasQuestion(true);
//         setQuestionText(activeQ.text || activeQ.question || '');
//         setActiveQuestionId(String(activeQ.id || activeQ._id || ''));
//       } else if (playData.questionText || playData.question) {
//         setHasQuestion(true);
//         setQuestionText(playData.questionText || playData.question);
//         setActiveQuestionId(playData.questionId ? String(playData.questionId) : '');
//       } else {
//         setHasQuestion(false);
//         setQuestionText('');
//         setActiveQuestionId('');
//       }

//       if (screen === 'FINISHED' || playData.finished || playData.isFinished || playData.status === 'FINISHED') {
//         setShowGameEndModal(true);
//       }
//     },
//     [activeSessionId, tournament],
//   );

//   const runPlayAction = async (fn) => {
//     if (!canCallSessionApi) {
//       Toast.show({
//         type: 'error',
//         text1: 'Session unavailable',
//         text2: 'Start the game again from Game Rules.',
//       });
//       return;
//     }
//     try {
//       setActionLoading(true);
//       const res = await fn();
//       parseSessionState(res);
//     } catch (err) {
//       if (err?.response?.status === 401) return;
//       const backendMsg =
//         err?.response?.data?.error || err?.response?.data?.message || 'Could not update play state.';
//       Toast.show({ type: 'error', text1: 'Action Failed', text2: backendMsg });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const loadSessionState = async () => {
//     try {
//       setActionLoading(true);
//       const res = await getGameSessionApi(tournamentId, activeSessionId);
//       parseSessionState(res);
//     } catch (err) {
//       console.log('Fetch game session error:', err);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (initialSessionData) {
//       parseSessionState(initialSessionData);
//     } else if (canCallSessionApi) {
//       loadSessionState();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tournamentId, activeSessionId]);

//   const handleSelectYes = () => {
//     if (!activeQuestionId) {
//       Toast.show({
//         type: 'error',
//         text1: 'No question',
//         text2: 'There is no active question to answer Yes.',
//       });
//       return;
//     }
//     runPlayAction(() =>
//       answerYesSessionApi(tournamentId, activeSessionId, { questionId: activeQuestionId }),
//     );
//   };

//   const handleSelectNo = () => {
//     runPlayAction(() => answerNoSessionApi(tournamentId, activeSessionId, {}));
//   };

//   const handleConfirmInstruction = () => {
//     runPlayAction(() => confirmInstructionSessionApi(tournamentId, activeSessionId));
//   };

//   const handleBackStep = () => {
//     runPlayAction(() => backSessionStepApi(tournamentId, activeSessionId));
//   };

//   const handleLeave = () => {
//     confirmLeaveGame();
//   };

//   const handleCheckScore = () => {
//     setShowGameEndModal(false);
//     navigation.navigate('Leaderboard', {
//       tournament,
//       selectedTeam,
//       players,
//       playMode: playModeParam,
//       gameNumber: playMeta.gameNumber || route?.params?.gameNumber || 1,
//       sessionId: activeSessionId,
//     });
//   };

//   const handleExitToHome = () => {
//     exitToHome();
//   };

//   const holesLabel =
//     playMeta.holeStart != null && playMeta.holeEnd != null
//       ? `Holes ${playMeta.holeStart}-${playMeta.holeEnd}`
//       : '';
//   const subtitle = [
//     `Game ${playMeta.gameNumber || 1}`,
//     playMeta.playMode === 'PRACTICE' ? 'Practice' : 'Challenge',
//     playMeta.golfCourseName,
//     holesLabel,
//   ]
//     .filter(Boolean)
//     .join(' · ');

//   const formatLocation = (loc) => {
//     if (!loc) return 'TEE';
//     const clean = String(loc).replace('_', ' ');
//     if (clean.length > 11) return clean.slice(0, 10) + '…';
//     return clean;
//   };

//   const statPills = [
//     { icon: 'award', label: 'HOLE', value: holeNumber },
//     { icon: 'book', label: 'PAR', value: parValue },
//     { icon: 'trending-up', label: 'SHOT', value: shotNumber },
//     { icon: 'shield', label: 'LOCATION', value: formatLocation(originLocation) },
//   ];

//   return (
//     <View style={styles.container}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       {/* ── Scroll Content ── */}
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── 1. Trophy Banner Header ── */}
//         <ImageBackground source={trophyImg} style={styles.header} resizeMode="cover">
//           <View style={styles.headerOverlay} />

//           <TouchableOpacity
//             style={styles.backButtonCircle}
//             onPress={confirmLeaveGame}
//             activeOpacity={0.7}
//           >
//             <AuthIcon name="chevron-left" size={moderateScale(20)} color="#093A24" />
//           </TouchableOpacity>

//           <Text style={styles.tournamentTitle} numberOfLines={2}>
//             {playMeta.tournamentName || 'Tournament'}
//           </Text>

//           <Text style={styles.tournamentSub} numberOfLines={2}>
//             {subtitle || `Game 1 · ${String(playModeParam).toLowerCase() === 'practice' ? 'Practice' : 'Challenge'}`}
//           </Text>
//         </ImageBackground>

//         {/* ── 2. Status Card (floating over header image) ── */}
//         <View style={styles.statusCard}>
//           <View style={styles.pillsRow}>
//             {statPills.map((pill) => (
//               <View key={pill.label} style={styles.pillItem}>
//                 <AuthIcon name={pill.icon} size={moderateScale(12)} color="#093A24" />
//                 <View style={styles.pillTextCol}>
//                   <Text style={styles.pillLabel}>{pill.label}</Text>
//                   <Text style={styles.pillVal} numberOfLines={1}>
//                     {pill.value}
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </View>

//           <Text style={styles.scoreNumber}>{score}</Text>
//           <Text style={styles.scoreLabel}>Your Score</Text>
//         </View>

//         {/* Map Section */}
//         <View style={styles.mapSection}>
//           {!mapData.hasGps ? (
//             <Text style={styles.mapWarningText}>
//               Location: User denied Geolocation. Markers still show tee/green.
//             </Text>
//           ) : null}
//           <HoleMap
//             key={`active-hole-map-${holeNumber}-${activeSessionId}`}
//             mapData={mapData}
//             holeNumber={holeNumber}
//             compact
//           />
//         </View>

//         {/* Loading Indicator */}
//         {actionLoading ? (
//           <View style={styles.loadingRow}>
//             <ActivityIndicator color="#093A24" size="small" />
//             <Text style={styles.loadingText}>Updating play state…</Text>
//           </View>
//         ) : null}

//         {/* QUESTIONS SCREEN with Question */}
//         {playScreen === 'QUESTIONS' && hasQuestion ? (
//           <>
//             <Text style={styles.questionSectionHeader}>
//               {promptText || 'After playing your shot…'}
//             </Text>
//             <View style={styles.questionCard}>
//               <Text style={styles.questionText}>{questionText}</Text>
//               <View style={styles.yesNoRow}>
//                 <TouchableOpacity
//                   style={styles.yesBtn}
//                   onPress={handleSelectYes}
//                   disabled={actionLoading}
//                   activeOpacity={0.85}
//                 >
//                   <Text style={styles.yesBtnText}>YES</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.noBtn}
//                   onPress={handleSelectNo}
//                   disabled={actionLoading}
//                   activeOpacity={0.85}
//                 >
//                   <Text style={styles.noBtnText}>NO</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </>
//         ) : null}

//         {/* QUESTIONS SCREEN without Question */}
//         {playScreen === 'QUESTIONS' && !hasQuestion ? (
//           <>
//             <Text style={styles.questionSectionHeader}>{promptText || 'Question'}</Text>
//             <View style={styles.questionCard}>
//               <Text style={styles.questionText}>No question here</Text>
//               <Text style={styles.noQuestionDescription}>
//                 {promptText ||
//                   'No questions for this location/par. Try the next set or go back one step.'}
//               </Text>
//               <TouchableOpacity
//                 style={styles.nextShotBtn}
//                 onPress={handleSelectNo}
//                 disabled={actionLoading}
//                 activeOpacity={0.88}
//               >
//                 <Text style={styles.nextShotBtnText}>TRY NEXT QUESTIONS</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         ) : null}

//         {/* INSTRUCTION SCREEN */}
//         {playScreen === 'INSTRUCTION' ? (
//           <>
//             <Text style={styles.questionSectionHeader}>INSTRUCTION</Text>
//             <View style={styles.questionCard}>
//               <Text style={styles.questionText}>{instructionText || 'Continue'}</Text>
//               <TouchableOpacity
//                 style={styles.nextShotBtn}
//                 onPress={handleConfirmInstruction}
//                 disabled={actionLoading}
//                 activeOpacity={0.88}
//               >
//                 <Text style={styles.nextShotBtnText}>GOT IT — CONTINUE</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         ) : null}

//         {/* FINISHED SCREEN */}
//         {playScreen === 'FINISHED' ? (
//           <>
//             <Text style={styles.questionSectionHeader}>ROUND COMPLETE</Text>
//             <View style={styles.questionCard}>
//               <Text style={styles.questionText}>
//                 Game {playMeta.gameNumber || 1} complete for this nine.
//               </Text>
//               <Text style={styles.finalScoreText}>Your Final score: {score}</Text>
//               <TouchableOpacity
//                 style={styles.nextShotBtn}
//                 onPress={handleCheckScore}
//                 activeOpacity={0.88}
//               >
//                 <Text style={styles.nextShotBtnText}>CHECK YOUR SCORE</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         ) : null}

//         {/* Bottom Actions Row: BACK ONE STEP + LEAVE */}
//         <View style={styles.bottomActionsRow}>
//           <TouchableOpacity
//             style={styles.backStepBtn}
//             onPress={handleBackStep}
//             disabled={actionLoading || playScreen === 'FINISHED'}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.backStepBtnText}>BACK ONE STEP</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.leaveBtn}
//             onPress={handleLeave}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.leaveBtnText}>LEAVE</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={{ height: hp(4) }} />
//       </ScrollView>

//       {/* Game End Modal */}
//       <Modal
//         visible={showGameEndModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowGameEndModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity
//               style={styles.modalCloseCross}
//               onPress={() => setShowGameEndModal(false)}
//               activeOpacity={0.7}
//             >
//               <AuthIcon name="x" size={moderateScale(18)} color="#093A24" />
//             </TouchableOpacity>

//             <Text style={styles.modalTitle}>
//               Game {playMeta.gameNumber || 1} complete for this nine.
//             </Text>

//             <Text style={styles.modalScoreText}>Your Final score: {score}</Text>

//             <View style={styles.modalBtnRow}>
//               <TouchableOpacity
//                 style={styles.modalOutlineBtn}
//                 onPress={handleCheckScore}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.modalOutlineBtnText}>CHECK YOUR SCORE</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalSolidBtn}
//                 onPress={handleExitToHome}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.modalSolidBtnText}>LEAVE</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAF9',
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: hp(4),
//   },

//   // ── Header ──
//   header: {
//     backgroundColor: '#093A24',
//     paddingTop: Platform.OS === 'ios' ? hp(6.5) : hp(4.5),
//     paddingHorizontal: wp(5),
//     paddingBottom: hp(7),
//     position: 'relative',
//   },
//   headerOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(9, 58, 36, 0.40)',
//   },
//   backButtonCircle: {
//     width: moderateScale(38),
//     height: moderateScale(38),
//     borderRadius: moderateScale(19),
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: hp(1.5),
//     elevation: 4,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 5,
//     zIndex: 10,
//   },
//   tournamentTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(26),
//     color: COLORS.white,
//     lineHeight: fontSize(32),
//   },
//   tournamentSub: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12.5),
//     color: 'rgba(255, 255, 255, 0.85)',
//     marginTop: hp(0.3),
//   },

//   // ── Status Card (floating over header image) ──
//   statusCard: {
//     backgroundColor: '#093A24',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.8),
//     marginTop: -hp(5),
//     marginHorizontal: wp(5),
//     borderWidth: 1.5,
//     borderColor: '#BCFF00',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     elevation: 4,
//     zIndex: 10,
//   },
//   pillsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: wp(1.5),
//     marginBottom: hp(1.2),
//   },
//   pillItem: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(12),
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(0.6),
//     gap: wp(1),
//   },
//   pillTextCol: {
//     flex: 1,
//   },
//   pillLabel: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(8),
//     color: '#093A24',
//   },
//   pillVal: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//   },
//   scoreNumber: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(34),
//     color: COLORS.white,
//     lineHeight: fontSize(38),
//   },
//   scoreLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: 'rgba(255, 255, 255, 0.75)',
//   },

//   // ── Map Section ──
//   mapSection: {
//     paddingHorizontal: wp(5),
//     marginTop: hp(2.5),
//   },
//   mapSectionTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: '#093A24',
//   },
//   mapWarningText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(11),
//     color: '#E53E3E',
//     marginTop: hp(0.3),
//     marginBottom: hp(0.5),
//   },
//   mapCard: {
//     borderRadius: moderateScale(20),
//     overflow: 'hidden',
//     minHeight: hp(22),
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     marginTop: hp(1),
//   },

//   // ── Loading ──
//   loadingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(2),
//     paddingHorizontal: wp(5),
//     marginTop: hp(1.5),
//   },
//   loadingText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: '#718096',
//   },

//   // ── Question Card ──
//   questionSectionHeader: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: '#718096',
//     paddingHorizontal: wp(5),
//     marginTop: hp(2),
//     marginBottom: hp(0.8),
//   },
//   questionCard: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(5),
//     paddingVertical: hp(2),
//     marginHorizontal: wp(5),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.03,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   questionText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13.5),
//     color: '#093A24',
//     marginBottom: hp(1.5),
//     lineHeight: fontSize(20),
//   },
//   noQuestionDescription: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12.5),
//     color: '#718096',
//     marginBottom: hp(1.5),
//     lineHeight: fontSize(18),
//   },
//   yesNoRow: {
//     flexDirection: 'row',
//     gap: wp(3),
//   },
//   yesBtn: {
//     backgroundColor: '#BCFF00',
//     borderRadius: moderateScale(20),
//     paddingHorizontal: wp(6),
//     paddingVertical: hp(1.2),
//     justifyContent: 'center',
//     alignItems: 'center',
//     minWidth: wp(25),
//   },
//   yesBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//   },
//   noBtn: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     borderRadius: moderateScale(20),
//     paddingHorizontal: wp(6),
//     paddingVertical: hp(1.2),
//     justifyContent: 'center',
//     alignItems: 'center',
//     minWidth: wp(25),
//   },
//   noBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//   },
//   nextShotBtn: {
//     backgroundColor: '#BCFF00',
//     borderRadius: moderateScale(24),
//     minHeight: hp(5.8),
//     paddingHorizontal: wp(4),
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//   },
//   nextShotBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13.5),
//     color: '#093A24',
//     letterSpacing: 0.5,
//     textAlign: 'center',
//   },
//   finalScoreText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(14.5),
//     color: '#2EA200',
//     marginTop: hp(0.5),
//     marginBottom: hp(2),
//   },

//   // ── Bottom Actions ──
//   bottomActionsRow: {
//     flexDirection: 'row',
//     gap: wp(3),
//     paddingHorizontal: wp(5),
//     marginTop: hp(2.5),
//   },
//   backStepBtn: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     borderRadius: moderateScale(28),
//     height: hp(6),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backStepBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//     letterSpacing: 0.5,
//   },
//   leaveBtn: {
//     flex: 1,
//     backgroundColor: '#BCFF00',
//     borderRadius: moderateScale(28),
//     height: hp(6),
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//   },
//   leaveBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//     letterSpacing: 0.5,
//   },

//   // ── Modal ──
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: wp(6),
//   },
//   modalContent: {
//     width: '100%',
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(24),
//     padding: wp(6),
//     position: 'relative',
//   },
//   modalCloseCross: {
//     position: 'absolute',
//     top: moderateScale(16),
//     right: moderateScale(16),
//     zIndex: 10,
//   },
//   modalTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(18),
//     color: '#093A24',
//     marginTop: hp(1),
//     marginBottom: hp(0.5),
//   },
//   modalScoreText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(14.5),
//     color: '#2EA200',
//     marginBottom: hp(2.5),
//   },
//   modalBtnRow: {
//     flexDirection: 'row',
//     gap: wp(3),
//   },
//   modalOutlineBtn: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     borderRadius: moderateScale(24),
//     height: hp(5.5),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOutlineBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: '#093A24',
//   },
//   modalSolidBtn: {
//     flex: 1,
//     backgroundColor: '#BCFF00',
//     borderRadius: moderateScale(24),
//     height: hp(5.5),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalSolidBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: '#093A24',
//   },
// });

// export default ActiveGameScreen;





import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthIcon from '../../components/common/AuthIcon';
import HoleMap from '../../components/play/HoleMap';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

import {
  getGameSessionApi,
  answerYesSessionApi,
  answerNoSessionApi,
  confirmInstructionSessionApi,
  backSessionStepApi,
} from '../../services/playService';

const trophyImg = require('../../assets/Images/ trophy.png');

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const emptyMap = {
  hasGps: false,
  green: null,
  tee: null,
  currentHolePois: [],
};

const ActiveGameScreen = ({ navigation, route }) => {
  const tournament = route?.params?.tournament;
  const selectedTeam = route?.params?.selectedTeam;
  const players = route?.params?.players;
  const playModeParam = route?.params?.playMode || 'practice';
  const initialSessionData = route?.params?.initialSessionData;
  const tournamentId = tournament?.id || tournament?._id;

  const [activeSessionId, setActiveSessionId] = useState(
    route?.params?.sessionId ||
    initialSessionData?.play?.sessionId ||
    initialSessionData?.sessionId ||
    initialSessionData?.id ||
    '',
  );

  const [playScreen, setPlayScreen] = useState('QUESTIONS'); // QUESTIONS | INSTRUCTION | FINISHED
  const [holeNumber, setHoleNumber] = useState(1);
  const [parValue, setParValue] = useState(4);
  const [shotNumber, setShotNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [originLocation, setOriginLocation] = useState('TEE');
  const [promptText, setPromptText] = useState('After playing your shot…');
  const [questionText, setQuestionText] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [hasQuestion, setHasQuestion] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [answerMode, setAnswerMode] = useState('');
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [instructionText, setInstructionText] = useState('');
  const [mapData, setMapData] = useState(emptyMap);
  const [playMeta, setPlayMeta] = useState({
    tournamentName: tournament?.title || tournament?.name || 'Tournament',
    golfCourseName: '',
    playMode: String(playModeParam).toUpperCase(),
    gameNumber: route?.params?.gameNumber || 1,
    holeStart: null,
    holeEnd: null,
  });

  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canCallSessionApi =
    tournamentId &&
    activeSessionId &&
    isUuid(String(tournamentId)) &&
    isUuid(String(activeSessionId));

  const exitToHome = useCallback(() => {
    setShowGameEndModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  }, [navigation]);

  const confirmLeaveGame = useCallback(() => {
    Alert.alert(
      'Leave game?',
      'Are you sure you want to leave this round? You can resume later from Select game.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: exitToHome },
      ],
    );
  }, [exitToHome]);

  const onBackPress = useCallback(() => {
    confirmLeaveGame();
    return true;
  }, [confirmLeaveGame]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress]),
  );

  const parseSessionState = useCallback(
    (data) => {
      if (!data) return;
      const playData = data.play || data.session || data.gameSession || data;

      const sId = playData.sessionId || data.sessionId || activeSessionId;
      if (sId) setActiveSessionId(String(sId));

      const screen = playData.screen || (playData.finished ? 'FINISHED' : 'QUESTIONS');
      setPlayScreen(screen);

      const hole = playData.currentHole ?? playData.holeNumber ?? playData.hole;
      if (hole != null) setHoleNumber(hole);

      const par = playData.currentPar ?? playData.parValue ?? playData.par;
      if (par != null) setParValue(par);

      const shot = playData.currentShot ?? playData.shotNumber ?? playData.shot;
      if (shot != null) setShotNumber(shot);

      const sc = playData.score ?? playData.totalScore;
      if (sc != null) setScore(sc);

      if (playData.currentOrigin) setOriginLocation(playData.currentOrigin);
      if (playData.prompt) setPromptText(playData.prompt);
      if (playData.instructionText != null) setInstructionText(playData.instructionText);

      setPlayMeta((prev) => ({
        tournamentName:
          playData.tournamentName || tournament?.title || tournament?.name || prev.tournamentName,
        golfCourseName: playData.golfCourseName || prev.golfCourseName,
        playMode: playData.playMode || prev.playMode,
        gameNumber: playData.gameNumber ?? prev.gameNumber,
        holeStart: playData.holeStart ?? prev.holeStart,
        holeEnd: playData.holeEnd ?? prev.holeEnd,
      }));

      if (playData.map && typeof playData.map === 'object') {
        setMapData({
          hasGps: !!playData.map.hasGps,
          green: playData.map.green ?? null,
          tee: playData.map.tee ?? null,
          currentHolePois: Array.isArray(playData.map.currentHolePois)
            ? playData.map.currentHolePois
            : [],
        });
      }

      const qList = playData.questions || [];
      const modeVal = String(playData.answerMode || playData.mode || '').toUpperCase();
      setAnswerMode(modeVal);
      setQuestionList(Array.isArray(qList) ? qList : []);

      let activeQ = null;

      if (Array.isArray(qList) && qList.length > 0) {
        activeQ = qList[0];
      } else if (playData.currentQuestion) {
        activeQ = playData.currentQuestion;
      } else if (playData.questionText || playData.question) {
        activeQ = {
          id: playData.questionId || playData.id || '',
          text: playData.questionText || playData.question,
          type: playData.questionType || playData.type || 'SINGLE',
          allowMultiple: playData.allowMultiple || playData.isMultiple || false,
          required: playData.required ?? playData.isRequired ?? true,
          options: playData.options || playData.answers || playData.choices || [],
        };
      }

      if (activeQ) {
        const qId = String(activeQ.id || activeQ._id || activeQ.questionId || '');
        const qText = activeQ.text || activeQ.question || '';
        const rawOpts = Array.isArray(activeQ.options) && activeQ.options.length > 0
          ? activeQ.options
          : (Array.isArray(activeQ.answers) && activeQ.answers.length > 0
              ? activeQ.answers
              : (Array.isArray(activeQ.choices) && activeQ.choices.length > 0
                  ? activeQ.choices
                  : [
                      { id: 'YES', text: 'YES', label: 'YES' },
                      { id: 'NO', text: 'NO', label: 'NO' },
                    ]));

        const isMulti =
          activeQ.allowMultiple === true ||
          activeQ.isMultiple === true ||
          activeQ.multiselect === true ||
          String(activeQ.type || activeQ.questionType || activeQ.selectionType || '').toUpperCase().includes('MULTI') ||
          String(activeQ.type || activeQ.questionType || '').toUpperCase().includes('CHECKBOX');

        const isReq = activeQ.required !== false && activeQ.isRequired !== false;

        const formattedQ = {
          id: qId,
          text: qText,
          isMultiSelect: isMulti,
          isRequired: isReq,
          options: rawOpts.map((opt, idx) => {
            if (typeof opt === 'string') {
              return { id: opt, text: opt, label: opt };
            }
            return {
              id: String(opt.id || opt._id || opt.value || opt.key || `opt-${idx}`),
              text: opt.text || opt.label || opt.title || opt.name || opt.value || `Option ${idx + 1}`,
              value: opt.value || opt.id || opt.text,
            };
          }),
        };

        setHasQuestion(true);
        setQuestionText(qText);
        setActiveQuestionId(qId);
        setActiveQuestion(formattedQ);

        const existingAnswers = activeQ.selectedAnswers || activeQ.userAnswer || activeQ.selectedOptionIds || [];
        if (Array.isArray(existingAnswers) && existingAnswers.length > 0) {
          setSelectedOptionIds(existingAnswers.map(String));
        } else if (typeof existingAnswers === 'string' && existingAnswers) {
          setSelectedOptionIds([existingAnswers]);
        } else {
          setSelectedOptionIds([]);
        }
      } else {
        setHasQuestion(false);
        setQuestionText('');
        setActiveQuestionId('');
        setActiveQuestion(null);
        setSelectedOptionIds([]);
      }

      if (screen === 'FINISHED' || playData.finished || playData.isFinished || playData.status === 'FINISHED') {
        setShowGameEndModal(true);
      }
    },
    [activeSessionId, tournament],
  );

  const runPlayAction = async (fn) => {
    if (!canCallSessionApi) {
      Toast.show({
        type: 'error',
        text1: 'Session unavailable',
        text2: 'Start the game again from Game Rules.',
      });
      return;
    }
    try {
      setActionLoading(true);
      const res = await fn();
      parseSessionState(res);
    } catch (err) {
      if (err?.response?.status === 401) return;
      const backendMsg =
        err?.response?.data?.error || err?.response?.data?.message || 'Could not update play state.';
      Toast.show({ type: 'error', text1: 'Action Failed', text2: backendMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const loadSessionState = async () => {
    try {
      setActionLoading(true);
      const res = await getGameSessionApi(tournamentId, activeSessionId);
      parseSessionState(res);
    } catch (err) {
      console.log('Fetch game session error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (initialSessionData) {
      parseSessionState(initialSessionData);
    } else if (canCallSessionApi) {
      loadSessionState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, activeSessionId]);

  const handleToggleOption = (optionId) => {
    if (!activeQuestion) return;

    const optIdStr = String(optionId);
    if (activeQuestion.isMultiSelect) {
      // Multi-select: toggle selection / deselection
      if (selectedOptionIds.includes(optIdStr)) {
        setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optIdStr));
      } else {
        setSelectedOptionIds([...selectedOptionIds, optIdStr]);
      }
    } else {
      // Single-select: toggle or select 1 answer
      if (selectedOptionIds.includes(optIdStr)) {
        setSelectedOptionIds([]);
      } else {
        setSelectedOptionIds([optIdStr]);
      }
    }
  };

  const handleSubmitAnswer = (overrideOptionId = null) => {
    if (!activeQuestionId) {
      Toast.show({
        type: 'error',
        text1: 'No question',
        text2: 'There is no active question to answer.',
      });
      return;
    }

    let finalSelection = [...selectedOptionIds];
    if (overrideOptionId) {
      const optStr = String(overrideOptionId);
      if (activeQuestion?.isMultiSelect) {
        if (!finalSelection.includes(optStr)) {
          finalSelection.push(optStr);
        }
      } else {
        finalSelection = [optStr];
      }
    }

    // Required check validation:
    if (activeQuestion?.isRequired && finalSelection.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Answer Required',
        text2: 'Please select an answer to continue.',
      });
      return;
    }

    const payload = {
      questionId: activeQuestionId,
      selectedOptionIds: finalSelection,
      selectedOptions: finalSelection,
      answers: finalSelection,
      answer: finalSelection.join(','),
    };

    const firstOptUpper = String(finalSelection[0] || '').toUpperCase();
    if (firstOptUpper === 'YES' || firstOptUpper.includes('YES')) {
      runPlayAction(() => answerYesSessionApi(tournamentId, activeSessionId, payload));
    } else if (firstOptUpper === 'NO' || firstOptUpper.includes('NO')) {
      runPlayAction(() => answerNoSessionApi(tournamentId, activeSessionId, payload));
    } else {
      runPlayAction(() => answerYesSessionApi(tournamentId, activeSessionId, payload));
    }
  };

  const handleSelectYes = () => {
    handleSubmitAnswer('YES');
  };

  const handleSelectNo = () => {
    handleSubmitAnswer('NO');
  };

  const handleConfirmInstruction = () => {
    runPlayAction(() => confirmInstructionSessionApi(tournamentId, activeSessionId));
  };

  const handleBackStep = () => {
    runPlayAction(() => backSessionStepApi(tournamentId, activeSessionId));
  };

  const handleLeave = () => {
    confirmLeaveGame();
  };

  const handleCheckScore = () => {
    setShowGameEndModal(false);
    navigation.navigate('Leaderboard', {
      tournament,
      selectedTeam,
      players,
      playMode: playModeParam,
      gameNumber: playMeta.gameNumber || route?.params?.gameNumber || 1,
      sessionId: activeSessionId,
    });
  };

  const handleExitToHome = () => {
    exitToHome();
  };

  const holesLabel =
    playMeta.holeStart != null && playMeta.holeEnd != null
      ? `Holes ${playMeta.holeStart}-${playMeta.holeEnd}`
      : '';
  const subtitle = [
    `Game ${playMeta.gameNumber || 1}`,
    playMeta.playMode === 'PRACTICE' ? 'Practice' : 'Challenge',
    playMeta.golfCourseName,
    holesLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  const formatLocation = (loc) => {
    if (!loc) return 'TEE';
    const clean = String(loc).replace('_', ' ');
    if (clean.length > 11) return clean.slice(0, 10) + '…';
    return clean;
  };

  const statPills = [
    { icon: 'award', label: 'HOLE', value: holeNumber },
    { icon: 'book', label: 'PAR', value: parValue },
    { icon: 'trending-up', label: 'SHOT', value: shotNumber },
    { icon: 'shield', label: 'LOCATION', value: formatLocation(originLocation) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Scroll Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Trophy Banner Header ── */}
        <ImageBackground source={trophyImg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={confirmLeaveGame}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(20)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.tournamentTitle} numberOfLines={2}>
            {playMeta.tournamentName || 'Tournament'}
          </Text>

          <View style={styles.subPillBadge}>
            <Text style={styles.tournamentSub} numberOfLines={1} ellipsizeMode="tail">
              {subtitle || `Game 1 · ${String(playModeParam).toLowerCase() === 'practice' ? 'Practice' : 'Challenge'}`}
            </Text>
          </View>
        </ImageBackground>

        {/* ── 2. Status Card (floating over header image) ── */}
        <View style={styles.statusCard}>
          <View style={styles.pillsRow}>
            {statPills.map((pill) => (
              <View key={pill.label} style={styles.pillItem}>
                <AuthIcon name={pill.icon} size={moderateScale(12)} color="#093A24" />
                <View style={styles.pillTextCol}>
                  <Text style={styles.pillLabel}>{pill.label}</Text>
                  <Text style={styles.pillVal} numberOfLines={1}>
                    {pill.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>Your Score</Text>
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <HoleMap
            key={`active-hole-map-${holeNumber}-${activeSessionId}`}
            mapData={mapData}
            holeNumber={holeNumber}
            compact
          />
        </View>

        {/* Loading Indicator */}
        {actionLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#093A24" size="small" />
            <Text style={styles.loadingText}>Updating play state…</Text>
          </View>
        ) : null}

        {/* QUESTIONS SCREEN with Question */}
        {playScreen === 'QUESTIONS' && (hasQuestion || (questionList && questionList.length > 0)) ? (
          <>
            <Text style={styles.questionSectionHeader}>
              {promptText || 'After playing your shot…'}
            </Text>

            {(answerMode === 'YES_ONLY' || (questionList.length > 1 && !activeQuestion?.isMultiSelect && (!activeQuestion?.options || activeQuestion?.options.length <= 2))) ? (
              /* YES_ONLY Mode / Multiple Question Group List (Matches Screenshot 1 Design) */
              <View style={styles.questionCard}>
                {questionList.map((qItem, idx) => (
                  <View key={qItem.id || `q-${idx}`} style={styles.yesOnlyGroupWrap}>
                    <Text style={styles.yesOnlyQuestionText}>{qItem.text || qItem.question}</Text>
                    <TouchableOpacity
                      style={styles.yesOnlyFullBtn}
                      onPress={() => runPlayAction(() => answerYesSessionApi(tournamentId, activeSessionId, { questionId: qItem.id }))}
                      disabled={actionLoading}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.yesOnlyFullBtnText}>YES</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* None of these — play another shot button */}
                <TouchableOpacity
                  style={styles.noneOfTheseBtn}
                  onPress={() => runPlayAction(() => answerNoSessionApi(tournamentId, activeSessionId, {}))}
                  disabled={actionLoading}
                  activeOpacity={0.88}
                >
                  <Text style={styles.noneOfTheseBtnText}>None of these — play another shot</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Single Question or Multi-Select Checkbox list */
              <View style={styles.questionCard}>
                <View style={styles.questionHeaderWrap}>
                  <Text style={styles.questionText}>
                    {questionText}
                    {activeQuestion?.isRequired ? <Text style={styles.requiredStar}> *</Text> : null}
                  </Text>
                  {activeQuestion?.isMultiSelect ? (
                    <Text style={styles.multiInstructionText}>
                      (Select all answers that apply)
                    </Text>
                  ) : null}
                </View>

                {/* Options List for Custom / Multi-Select questions */}
                {activeQuestion?.options && activeQuestion.options.length > 2 ? (
                  <View style={styles.optionsListContainer}>
                    {activeQuestion.options.map((opt) => {
                      const isSelected = selectedOptionIds.includes(opt.id);
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                          ]}
                          onPress={() => handleToggleOption(opt.id)}
                          disabled={actionLoading}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              activeQuestion.isMultiSelect
                                ? styles.checkboxSquare
                                : styles.radioCircle,
                              isSelected && styles.optionControlSelected,
                            ]}
                          >
                            {isSelected ? (
                              <AuthIcon
                                name="check"
                                size={moderateScale(12)}
                                color={activeQuestion.isMultiSelect ? '#093A24' : '#BCFF00'}
                              />
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {opt.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      style={styles.submitAnswerBtn}
                      onPress={() => handleSubmitAnswer()}
                      disabled={actionLoading}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.submitAnswerBtnText}>SUBMIT ANSWER</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Default Yes/No 2-option rendering with selection support */
                  <View style={styles.yesNoContainer}>
                    <View style={styles.yesNoRow}>
                      {activeQuestion?.options?.map((opt) => {
                        const isSelected = selectedOptionIds.includes(opt.id);
                        const isYes = String(opt.id).toUpperCase() === 'YES' || String(opt.text).toUpperCase() === 'YES';
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[
                              isYes ? styles.yesBtn : styles.noBtn,
                              isSelected && (isYes ? styles.yesBtnSelected : styles.noBtnSelected),
                            ]}
                            onPress={() => {
                              if (activeQuestion?.isMultiSelect) {
                                handleToggleOption(opt.id);
                              } else {
                                handleToggleOption(opt.id);
                                handleSubmitAnswer(opt.id);
                              }
                            }}
                            disabled={actionLoading}
                            activeOpacity={0.85}
                          >
                            <Text
                              style={[
                                isYes ? styles.yesBtnText : styles.noBtnText,
                                isSelected && (isYes ? styles.yesBtnTextSelected : styles.noBtnTextSelected),
                              ]}
                            >
                              {opt.text}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {activeQuestion?.isMultiSelect ? (
                      <TouchableOpacity
                        style={styles.submitAnswerBtn}
                        onPress={() => handleSubmitAnswer()}
                        disabled={actionLoading}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.submitAnswerBtnText}>SUBMIT ANSWER</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            )}
          </>
        ) : null}

        {/* QUESTIONS SCREEN without Question */}
        {playScreen === 'QUESTIONS' && !hasQuestion ? (
          <>
            <Text style={styles.questionSectionHeader}>{promptText || 'Question'}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>No question here</Text>
              <Text style={styles.noQuestionDescription}>
                {promptText ||
                  'No questions for this location/par. Try the next set or go back one step.'}
              </Text>
              <TouchableOpacity
                style={styles.nextShotBtn}
                onPress={handleSelectNo}
                disabled={actionLoading}
                activeOpacity={0.88}
              >
                <Text style={styles.nextShotBtnText}>TRY NEXT QUESTIONS</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* INSTRUCTION SCREEN */}
        {playScreen === 'INSTRUCTION' ? (
          <>
            <Text style={styles.questionSectionHeader}>INSTRUCTION</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{instructionText || 'Continue'}</Text>
              <TouchableOpacity
                style={styles.nextShotBtn}
                onPress={handleConfirmInstruction}
                disabled={actionLoading}
                activeOpacity={0.88}
              >
                <Text style={styles.nextShotBtnText}>GOT IT — CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* FINISHED SCREEN */}
        {playScreen === 'FINISHED' ? (
          <>
            <Text style={styles.questionSectionHeader}>ROUND COMPLETE</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                Game {playMeta.gameNumber || 1} complete for this nine.
              </Text>
              <Text style={styles.finalScoreText}>Your Final score: {score}</Text>
              <TouchableOpacity
                style={styles.nextShotBtn}
                onPress={handleCheckScore}
                activeOpacity={0.88}
              >
                <Text style={styles.nextShotBtnText}>CHECK YOUR SCORE</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* Bottom Actions Row: BACK ONE STEP + LEAVE */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity
            style={styles.backStepBtn}
            onPress={handleBackStep}
            disabled={actionLoading || playScreen === 'FINISHED'}
            activeOpacity={0.85}
          >
            <Text style={styles.backStepBtnText}>BACK ONE STEP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={handleLeave}
            activeOpacity={0.85}
          >
            <Text style={styles.leaveBtnText}>LEAVE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(4) }} />
      </ScrollView>

      {/* Game End Modal */}
      <Modal
        visible={showGameEndModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGameEndModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseCross}
              onPress={() => setShowGameEndModal(false)}
              activeOpacity={0.7}
            >
              <AuthIcon name="x" size={moderateScale(18)} color="#093A24" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Game {playMeta.gameNumber || 1} complete for this nine.
            </Text>

            <Text style={styles.modalScoreText}>Your Final score: {score}</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalOutlineBtn}
                onPress={handleCheckScore}
                activeOpacity={0.85}
              >
                <Text style={styles.modalOutlineBtnText}>CHECK YOUR SCORE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSolidBtn}
                onPress={handleExitToHome}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSolidBtnText}>LEAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ── Header ──
  header: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(6.5) : hp(4.5),
    paddingHorizontal: wp(5),
    paddingBottom: hp(7),
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 25, 16, 0.55)',
  },
  backButtonCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 10,
  },
  tournamentTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: COLORS.white,
    lineHeight: fontSize(30),
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subPillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 25, 16, 0.70)',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    marginTop: hp(0.8),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.35)',
  },
  tournamentSub: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Status Card (floating over header image) ──
  statusCard: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginTop: -hp(5),
    marginHorizontal: wp(5),
    borderWidth: 1.5,
    borderColor: '#BCFF00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(1.5),
    marginBottom: hp(1.2),
  },
  pillItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    gap: wp(1),
  },
  pillTextCol: {
    flex: 1,
  },
  pillLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(8),
    color: '#093A24',
  },
  pillVal: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
  },
  scoreNumber: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(34),
    color: COLORS.white,
    lineHeight: fontSize(38),
  },
  scoreLabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: 'rgba(255, 255, 255, 0.75)',
  },

  // ── Map Section ──
  mapSection: {
    paddingHorizontal: wp(5),
    marginTop: hp(2.5),
  },
  mapSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
  },
  mapWarningText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#E53E3E',
    marginTop: hp(0.3),
    marginBottom: hp(0.5),
  },
  mapCard: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    minHeight: hp(22),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: hp(1),
  },

  // ── Loading ──
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingHorizontal: wp(5),
    marginTop: hp(1.5),
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
  },

  // ── Question Card ──
  questionSectionHeader: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
    paddingHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(0.8),
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    marginHorizontal: wp(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  questionText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: '#093A24',
    marginBottom: hp(0.5),
    lineHeight: fontSize(20),
  },
  questionHeaderWrap: {
    marginBottom: hp(1.2),
  },
  requiredStar: {
    color: '#E53E3E',
    fontFamily: FONTS.bold,
  },
  multiInstructionText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11.5),
    color: '#2EA200',
    marginTop: hp(0.2),
    marginBottom: hp(0.5),
  },
  optionsListContainer: {
    marginTop: hp(0.8),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    marginBottom: hp(1.2),
  },
  optionRowSelected: {
    borderColor: '#093A24',
    backgroundColor: '#F0FFF4',
  },
  checkboxSquare: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(5),
    borderWidth: 2,
    borderColor: '#718096',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    backgroundColor: COLORS.white,
  },
  radioCircle: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: '#718096',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    backgroundColor: COLORS.white,
  },
  optionControlSelected: {
    borderColor: '#093A24',
    backgroundColor: '#BCFF00',
  },
  optionText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: '#093A24',
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: FONTS.bold,
    color: '#093A24',
  },
  submitAnswerBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(20),
    minHeight: hp(5.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
    elevation: 3,
  },
  submitAnswerBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.5,
  },
  yesNoContainer: {
    gap: hp(1.2),
  },
  yesBtnSelected: {
    borderWidth: 2,
    borderColor: '#093A24',
  },
  yesBtnTextSelected: {
    fontFamily: FONTS.bold,
  },
  noBtnSelected: {
    backgroundColor: '#093A24',
  },
  noBtnTextSelected: {
    color: '#BCFF00',
  },
  noQuestionDescription: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#718096',
    marginBottom: hp(1.5),
    lineHeight: fontSize(18),
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: wp(3),
  },
  yesBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp(25),
  },
  yesBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
  },
  noBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#093A24',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp(25),
  },
  noBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
  },
  nextShotBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(24),
    minHeight: hp(5.8),
    paddingHorizontal: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  nextShotBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  finalScoreText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#2EA200',
    marginTop: hp(0.5),
    marginBottom: hp(2),
  },

  // ── Bottom Actions ──
  bottomActionsRow: {
    flexDirection: 'row',
    gap: wp(3),
    paddingHorizontal: wp(5),
    marginTop: hp(2.5),
  },
  backStepBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#093A24',
    borderRadius: moderateScale(28),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backStepBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.5,
  },
  leaveBtn: {
    flex: 1,
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(28),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  leaveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.5,
  },

  // YES_ONLY Multi-Question Group Styles (Figma Match)
  yesOnlyGroupWrap: {
    marginBottom: hp(2.2),
  },
  yesOnlyQuestionText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15.5),
    color: '#093A24',
    marginBottom: hp(1),
    lineHeight: fontSize(21),
  },
  yesOnlyFullBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(22),
    height: hp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  yesOnlyFullBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#093A24',
    letterSpacing: 0.5,
  },
  noneOfTheseBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4A5568',
    borderRadius: moderateScale(22),
    height: hp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  noneOfTheseBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: wp(6),
    position: 'relative',
  },
  modalCloseCross: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
    zIndex: 10,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  modalScoreText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#2EA200',
    marginBottom: hp(2.5),
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: wp(3),
  },
  modalOutlineBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#093A24',
    borderRadius: moderateScale(24),
    height: hp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOutlineBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#093A24',
  },
  modalSolidBtn: {
    flex: 1,
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(24),
    height: hp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSolidBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#093A24',
  },
});

export default ActiveGameScreen;
