// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   PrimaryPillButton,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize } from '../../utils/responsive';

// import { getStartGameReadinessApi, startGameApi } from '../../services/playService';

// const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const GameRulesScreen = ({ navigation, route }) => {
//   const [starting, setStarting] = React.useState(false);

//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation])
//   );

//   const handleStart = async () => {
//     const tournamentParam = route?.params?.tournament;
//     const tournamentId = tournamentParam?.id || tournamentParam?._id;
//     const gameNumber =
//       Number(
//         route?.params?.gameNumber ??
//         (route?.params?.selectedGameIndex != null
//           ? Number(route.params.selectedGameIndex) + 1
//           : 1),
//       ) || 1;

//     if (tournamentId && isUuid(String(tournamentId))) {
//       setStarting(true);
//       try {
//         // 1. Fail closed on readiness. Challenge opponents only count once
//         // their tournament invite has inviteStatus === "accepted".
//         try {
//           const readinessRes = await getStartGameReadinessApi(tournamentId, { gameNumber });
//           console.log('====== START GAME READINESS RES ======', JSON.stringify(readinessRes, null, 2));
//           const readiness = readinessRes?.data || readinessRes;
//           const hasActiveSession = Boolean(
//             readiness?.activeSession || readiness?.activeSessionId,
//           );
//           const isReady = readiness?.ready ?? readiness?.isReady;
//           const opponentBlocked =
//             String(readiness?.playMode || route?.params?.playMode || '').toUpperCase() ===
//             'CHALLENGE' &&
//             readiness?.opponentReady === false &&
//             !hasActiveSession;

//           if ((!hasActiveSession && isReady !== true) || opponentBlocked) {
//             const reasons = Array.isArray(readiness?.reasons)
//               ? readiness.reasons.filter(Boolean)
//               : [];
//             const reason =
//               reasons.join('. ') ||
//               readiness?.message ||
//               readiness?.error ||
//               (opponentBlocked
//                 ? 'Waiting for the invited opponent team to accept before Start Game.'
//                 : 'Could not verify that the game setup is ready.');
//             Toast.show({
//               type: 'error',
//               text1: opponentBlocked ? 'Waiting for Opponent' : 'Not Ready',
//               text2: reason,
//             });
//             return;
//           }
//         } catch (rErr) {
//           console.log('Readiness check error:', rErr);
//           const readinessMsg =
//             rErr?.response?.data?.error ||
//             rErr?.response?.data?.message ||
//             'Could not verify game readiness. Please try again.';
//           Toast.show({
//             type: 'error',
//             text1: 'Readiness Check Failed',
//             text2: readinessMsg,
//           });
//           return;
//         }

//         // 2. Start / resume — same as admin mobile-flow mobileStartGame → { play }
//         const startRes = await startGameApi(tournamentId, { gameNumber });
//         console.log('====== START GAME SESSION RES ======', JSON.stringify(startRes, null, 2));
//         const play = startRes?.play || startRes?.session || startRes?.gameSession || startRes?.data || startRes;
//         const sessionId = play?.sessionId || play?.id || play?._id;

//         Toast.show({
//           type: 'success',
//           text1: play?.finished ? 'Round ready' : 'Game Started!',
//           text2: play?.finished ? 'View your score summary.' : 'Good luck on your round!',
//         });

//         navigation.navigate('ActiveGame', {
//           tournament: {
//             ...tournamentParam,
//             name: play?.tournamentName || tournamentParam?.name || tournamentParam?.title,
//             title: play?.tournamentName || tournamentParam?.title || tournamentParam?.name,
//           },
//           selectedTeam: route?.params?.selectedTeam,
//           players: route?.params?.players,
//           playMode: route?.params?.playMode || 'practice',
//           sessionId,
//           gameNumber: play?.gameNumber || gameNumber,
//           // Keep full { play } envelope so ActiveGame matches LivePlayScreen
//           initialSessionData: startRes?.play ? startRes : { play },
//         });
//       } catch (err) {
//         console.log('Start game error:', err);
//         if (err?.response?.status === 401) {
//           return;
//         }
//         const backendMsg = err?.response?.data?.error || err?.response?.data?.message || 'Could not start game session on server.';
//         Toast.show({
//           type: 'error',
//           text1: 'Start Game Failed',
//           text2: backendMsg,
//         });
//       } finally {
//         setStarting(false);
//       }
//     } else {
//       // Fallback if local/mock data without backend UUID
//       navigation.navigate('ActiveGame', {
//         tournament: tournamentParam,
//         selectedTeam: route?.params?.selectedTeam,
//         players: route?.params?.players,
//         playMode: route?.params?.playMode || 'practice',
//       });
//     }
//   };

//   return (
//     <ScreenScaffold edges={['top', 'bottom']} showDots>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       <View style={styles.headerBlock}>
//         <CircularBackButton onPress={() => navigation.goBack()} />
//         <ScreenHeader title="Game Rules" titleStyle={styles.rulesTitle} />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.descriptionText}>
//           Ugolf is a shot-by-shot scoring game. After each shot you answer questions about where the
//           ball landed. Your answers determine the next shot origin and your score for that hole.
//         </Text>

//         <Text style={styles.sectionTitle}>During play</Text>
//         <View style={styles.bulletList}>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               Answer each question honestly for your current shot.
//             </Text>
//           </View>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               If you answer Yes, the shot destination becomes the origin for the next question in the
//               group.
//             </Text>
//           </View>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               If you answer No, the app moves to the next question or question group.
//             </Text>
//           </View>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               Points are awarded based on shot origin, destination, and your answer.
//             </Text>
//           </View>
//         </View>

//         <Text style={styles.sectionTitle}>Game setup</Text>
//         <View style={styles.bulletList}>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               Create or join a tournament, select a club and course, then invite players or teams.
//             </Text>
//           </View>
//           <View style={styles.bulletRow}>
//             <Text style={styles.bulletDot}>•</Text>
//             <Text style={styles.bulletText}>
//               Game questions, instructions, and scoring rules are configured in the admin panel.
//             </Text>
//           </View>
//         </View>

//         <Text style={styles.noteText}>
//           <Text style={styles.noteBold}>Note: </Text>
//           This draft build did not include a dedicated rules page in Ron's file package. Full rules
//           content can be loaded from admin-managed instructions when that integration is added.
//         </Text>

//         <View style={{ height: hp(2) }} />
//       </ScrollView>

//       <View style={styles.btnFixedBottom}>
//         <PrimaryPillButton
//           title="LET'S START"
//           onPress={handleStart}
//           loading={starting}
//         />
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
//   rulesTitle: {
//     fontSize: fontSize(20),
//     lineHeight: fontSize(25),
//     letterSpacing: 0,
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1),
//     paddingBottom: hp(4),
//   },
//   descriptionText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(18),
//     color: COLORS.textLabel,
//     lineHeight: fontSize(25),
//     marginBottom: hp(2),
//   },
//   sectionTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(20),
//     color: COLORS.textPrimary,
//     lineHeight: fontSize(25),
//     marginBottom: hp(1.2),
//     marginTop: hp(0.5),
//   },
//   bulletList: {
//     marginBottom: hp(2),
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: hp(0.8),
//   },
//   bulletDot: {
//     fontSize: fontSize(18),
//     color: COLORS.textLabel,
//     marginRight: wp(2.5),
//     lineHeight: fontSize(25),
//   },
//   bulletText: {
//     flex: 1,
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(18),
//     color: COLORS.textLabel,
//     lineHeight: fontSize(25),
//   },
//   noteText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(18),
//     color: COLORS.textLabel,
//     lineHeight: fontSize(25),
//     marginTop: hp(1),
//   },
//   noteBold: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(20),
//     color: COLORS.textPrimary,
//   },
//   btnFixedBottom: {
//     backgroundColor: COLORS.bgPage,
//     paddingHorizontal: wp(6),
//     paddingBottom: hp(2),
//     paddingTop: hp(1),
//   },
// });

// export default GameRulesScreen;


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

import {
  getStartGameReadinessApi,
  startGameApi,
  getClubRulesApi,
} from '../../services/playService';

// ============================================================
// HELPERS
// ============================================================

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );

// ============================================================
// SCREEN
// ============================================================

const GameRulesScreen = ({ navigation, route }) => {
  const [starting, setStarting] = React.useState(false);
  const [rulesLoading, setRulesLoading] = React.useState(true);
  const [dynamicRules, setDynamicRules] = React.useState(null);

  // ==========================================================
  // FETCH DYNAMIC CLUB RULES FROM API
  // ==========================================================

  React.useEffect(() => {
    let isMounted = true;
    const fetchClubRules = async () => {
      try {
        setRulesLoading(true);
        const res = await getClubRulesApi();
        console.log('====== CLUB RULES RES ======', JSON.stringify(res, null, 2));
        if (isMounted) {
          const rulesData = res?.data || res?.rules || res?.clubRules || res;
          setDynamicRules(rulesData);
        }
      } catch (err) {
        console.log('Fetch club rules error:', err);
      } finally {
        if (isMounted) setRulesLoading(false);
      }
    };
    fetchClubRules();
    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================================
  // HARDWARE BACK HANDLING
  // ==========================================================

  useFocusEffect(
    React.useCallback(() => {
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

  // ==========================================================
  // START GAME
  // ==========================================================

  const handleStart = async () => {
    const tournamentParam = route?.params?.tournament;
    const tournamentId = tournamentParam?.id || tournamentParam?._id;

    const gameNumber =
      Number(
        route?.params?.gameNumber ??
        (route?.params?.selectedGameIndex != null
          ? Number(route.params.selectedGameIndex) + 1
          : 1),
      ) || 1;

    if (tournamentId && isUuid(String(tournamentId))) {
      setStarting(true);

      try {
        try {
          const readinessRes = await getStartGameReadinessApi(
            tournamentId,
            { gameNumber },
          );

          console.log(
            '====== START GAME READINESS RES ======',
            JSON.stringify(readinessRes, null, 2),
          );

          const readiness = readinessRes?.data || readinessRes;
          const hasActiveSession = Boolean(
            readiness?.activeSession || readiness?.activeSessionId,
          );

          const isReady = readiness?.ready ?? readiness?.isReady;

          const opponentBlocked =
            String(
              readiness?.playMode || route?.params?.playMode || '',
            ).toUpperCase() === 'CHALLENGE' &&
            readiness?.opponentReady === false &&
            !hasActiveSession;

          if (
            (!hasActiveSession && isReady !== true) ||
            opponentBlocked
          ) {
            const reasons = Array.isArray(readiness?.reasons)
              ? readiness.reasons.filter(Boolean)
              : [];

            const reason =
              reasons.join('. ') ||
              readiness?.message ||
              readiness?.error ||
              (opponentBlocked
                ? 'Waiting for the invited opponent team to accept before Start Game.'
                : 'Could not verify that the game setup is ready.');

            Toast.show({
              type: 'error',
              text1: opponentBlocked
                ? 'Waiting for Opponent'
                : 'Not Ready',
              text2: reason,
            });

            return;
          }
        } catch (rErr) {
          console.log('Readiness check error:', rErr);

          const readinessMsg =
            rErr?.response?.data?.error ||
            rErr?.response?.data?.message ||
            'Could not verify game readiness. Please try again.';

          Toast.show({
            type: 'error',
            text1: 'Readiness Check Failed',
            text2: readinessMsg,
          });

          return;
        }

        const startRes = await startGameApi(tournamentId, { gameNumber });

        console.log(
          '====== START GAME SESSION RES ======',
          JSON.stringify(startRes, null, 2),
        );

        const play =
          startRes?.play ||
          startRes?.session ||
          startRes?.gameSession ||
          startRes?.data ||
          startRes;

        const sessionId =
          play?.sessionId || play?.id || play?._id;

        Toast.show({
          type: 'success',
          text1: play?.finished ? 'Round ready' : 'Game Started!',
          text2: play?.finished
            ? 'View your score summary.'
            : 'Good luck on your round!',
        });

        navigation.navigate('ActiveGame', {
          tournament: {
            ...tournamentParam,
            name:
              play?.tournamentName ||
              tournamentParam?.name ||
              tournamentParam?.title,
            title:
              play?.tournamentName ||
              tournamentParam?.title ||
              tournamentParam?.name,
          },
          selectedTeam: route?.params?.selectedTeam,
          players: route?.params?.players,
          playMode: route?.params?.playMode || 'practice',
          sessionId,
          gameNumber: play?.gameNumber || gameNumber,
          initialSessionData: startRes?.play ? startRes : { play },
        });
      } catch (err) {
        console.log('Start game error:', err);

        if (err?.response?.status === 401) {
          return;
        }

        const backendMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Could not start game session on server.';

        Toast.show({
          type: 'error',
          text1: 'Start Game Failed',
          text2: backendMsg,
        });
      } finally {
        setStarting(false);
      }
    } else {
      navigation.navigate('ActiveGame', {
        tournament: tournamentParam,
        selectedTeam: route?.params?.selectedTeam,
        players: route?.params?.players,
        playMode: route?.params?.playMode || 'practice',
      });
    }
  };

  // ==========================================================
  // RENDER DYNAMIC RULES CONTENT
  // ==========================================================

  const renderStaticRules = () => (
    <>
      <Text style={styles.descriptionText}>
        Ugolf is a shot-by-shot scoring game. After each shot you answer questions about where the
        ball landed. Your answers determine the next shot origin and your score for that hole.
      </Text>

      <Text style={styles.sectionTitle}>During play</Text>
      <View style={styles.bulletList}>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Answer each question honestly for your current shot.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            If you answer Yes, the shot destination becomes the origin for the next question in the group.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            If you answer No, the app moves to the next question or question group.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Points are awarded based on shot origin, destination, and your answer.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Game setup</Text>
      <View style={styles.bulletList}>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Create or join a tournament, select a club and course, then invite players or teams.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Game questions, instructions, and scoring rules are configured in the admin panel.
          </Text>
        </View>
      </View>
    </>
  );

  const renderDynamicContent = () => {
    if (rulesLoading) {
      return (
        <View style={{ paddingVertical: hp(4), alignItems: 'center' }}>
          <ActivityIndicator color="#093A24" size="large" />
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: fontSize(13),
              color: '#2D4B3E',
              marginTop: hp(1.5),
            }}
          >
            Loading club rules…
          </Text>
        </View>
      );
    }

    if (!dynamicRules) {
      return renderStaticRules();
    }

    const rawRules = Array.isArray(dynamicRules?.rules)
      ? dynamicRules.rules
      : Array.isArray(dynamicRules)
        ? dynamicRules
        : Array.isArray(dynamicRules?.data)
          ? dynamicRules.data
          : [];

    const pageDescription =
      dynamicRules?.description || dynamicRules?.content || dynamicRules?.text || '';

    if (rawRules.length === 0 && !pageDescription) {
      return renderStaticRules();
    }

    // Group rules by category
    const categoriesMap = {};
    const ungroupedRules = [];

    rawRules.forEach((item) => {
      if (typeof item === 'string') {
        ungroupedRules.push(item);
      } else if (item && typeof item === 'object') {
        const cat = item.category || item.section || item.title;
        const ruleText = item.rule || item.description || item.text || item.content;

        if (!ruleText) return;

        if (cat) {
          if (!categoriesMap[cat]) {
            categoriesMap[cat] = [];
          }
          categoriesMap[cat].push(ruleText);
        } else {
          ungroupedRules.push(ruleText);
        }
      }
    });

    const categoryNames = Object.keys(categoriesMap);

    return (
      <>
        {pageDescription ? (
          <Text style={styles.descriptionText}>{pageDescription}</Text>
        ) : null}

        {categoryNames.map((catName) => (
          <View key={`cat-${catName}`} style={{ marginBottom: hp(1.2) }}>
            <Text style={styles.sectionTitle}>{catName}</Text>
            <View style={styles.bulletList}>
              {categoriesMap[catName].map((ruleStr, idx) => (
                <View key={`rule-item-${catName}-${idx}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{ruleStr}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {ungroupedRules.length > 0 ? (
          <View style={styles.bulletList}>
            {ungroupedRules.map((ruleStr, idx) => (
              <View key={`rule-ungrouped-${idx}`} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{ruleStr}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon
            name="chevron-left"
            size={moderateScale(22)}
            color="#093A24"
          />
        </TouchableOpacity>
      </View>

      {/* Rules Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Game Rules</Text>

        {renderDynamicContent()}

        <View style={{ height: hp(3) }} />
      </ScrollView>

      {/* Fixed Start Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton
          title="LET'S START"
          onPress={handleStart}
          loading={starting}
        />
      </View>
    </SafeAreaView>
  );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  headerRow: {
    paddingHorizontal: wp(5),
    paddingTop:
      Platform.OS === 'ios'
        ? hp(5.5)
        : (StatusBar.currentHeight || 24) + hp(0.5),
    paddingBottom: hp(0.5),
  },

  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),

    borderRadius: moderateScale(21),

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    elevation: 3,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },


  // ----------------------------------------------------------
  // Scroll
  // ----------------------------------------------------------

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1),
    paddingBottom: hp(4),
  },


  // ----------------------------------------------------------
  // Main title
  // ----------------------------------------------------------

  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: '#093A24',
    marginBottom: hp(1),
  },


  // ----------------------------------------------------------
  // Description
  // ----------------------------------------------------------

  descriptionText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: '#2D4B3E',
    lineHeight: fontSize(19),
    marginBottom: hp(1.2),
  },


  // ----------------------------------------------------------
  // Section title
  // ----------------------------------------------------------

  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',

    marginBottom: hp(0.6),
    marginTop: hp(0.6),
  },


  // ----------------------------------------------------------
  // Bullet list
  // ----------------------------------------------------------

  bulletList: {
    marginBottom: hp(0.8),
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(0.6),
  },

  bulletDot: {
    fontSize: fontSize(16),
    color: '#2D4B3E',

    marginRight: wp(2.5),

    lineHeight: fontSize(18),
  },

  bulletText: {
    flex: 1,

    fontFamily: FONTS.regular,
    fontSize: fontSize(13),

    color: '#2D4B3E',

    lineHeight: fontSize(18),
  },


  // ----------------------------------------------------------
  // Note
  // ----------------------------------------------------------

  noteText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),

    color: '#2D4B3E',

    lineHeight: fontSize(17),

    marginTop: hp(2),
  },

  noteBold: {
    fontFamily: FONTS.bold,
    color: '#093A24',
  },


  // ----------------------------------------------------------
  // Bottom button
  // ----------------------------------------------------------

  bottomDotPattern: {
    height: hp(12),
    marginTop: hp(2),
    opacity: 0.6,
  },

  btnFixedBottom: {
    backgroundColor: '#F8FAF9',

    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',

    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});


export default GameRulesScreen;