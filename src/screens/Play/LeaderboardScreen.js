// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ImageBackground,
//   Image,
//   StatusBar,
//   BackHandler,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';

// import AuthButton from '../../components/common/AuthButton';
// import AuthIcon from '../../components/common/AuthIcon';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
// import { getTournamentLeaderboardApi } from '../../services/playerService';

// const teamBg = require('../../assets/Images/team_bg.jpg');
// const trophyImg = require('../../assets/Images/ trophy.png');
// const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
// const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

// const LEADERBOARD_IMAGES = [tournamentBg, trophyImg, homescreenBg, teamBg];
// const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const LeaderboardScreen = ({ navigation, route }) => {
//   const tournament = route?.params?.tournament;
//   const tournamentId = tournament?.id || tournament?._id;
//   const playMode = route?.params?.playMode || tournament?.playMode || 'practice';
//   const gameNumber = route?.params?.gameNumber || 1;

//   const [entries, setEntries] = useState([]);
//   const [meta, setMeta] = useState({
//     tournamentName: tournament?.name || tournament?.title || 'Tournament',
//     playMode,
//   });
//   const [loading, setLoading] = useState(true);

//   const onBackPress = React.useCallback(() => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//     return true;
//   }, [navigation]);

//   const loadLeaderboard = useCallback(async () => {
//     if (!tournamentId || !isUuid(String(tournamentId))) {
//       setLoading(false);
//       setEntries([]);
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await getTournamentLeaderboardApi(tournamentId);
//       setMeta({
//         tournamentName: res?.tournamentName || tournament?.name || tournament?.title || 'Tournament',
//         playMode: res?.playMode || playMode,
//       });
//       const list = res?.entries || res?.data?.entries || [];
//       setEntries(
//         (Array.isArray(list) ? list : []).map((e, idx) => ({
//           rank: e.rank || idx + 1,
//           name: e.playerName || e.name || 'Player',
//           roundScore: e.score ?? 0,
//           personalBest: e.currentHole != null ? `H${e.currentHole}` : e.status || '—',
//           isYou: false,
//           image: LEADERBOARD_IMAGES[idx % LEADERBOARD_IMAGES.length],
//         })),
//       );
//     } catch (err) {
//       console.log('Leaderboard load error:', err);
//       setEntries([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [tournamentId, playMode, tournament]);

//   useFocusEffect(
//     React.useCallback(() => {
//       loadLeaderboard();
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [onBackPress, loadLeaderboard])
//   );

//   const handleBackToHome = () => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   };

//   const modeLabel = String(meta.playMode || playMode).toLowerCase().includes('challenge')
//     ? 'Challenge'
//     : 'Practice';

//   return (
//     <SafeAreaView style={styles.container} edges={['bottom']}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <ImageBackground source={trophyImg} style={styles.header} resizeMode="cover">
//           <View style={styles.headerOverlay} />
//           <Text style={styles.bannerTitle}>Leaderboard</Text>
//           <Text style={styles.bannerSubtitle}>
//             Game {gameNumber} · {modeLabel} · {meta.tournamentName}
//           </Text>
//         </ImageBackground>

//         <View style={styles.contentContainer}>
//           {loading ? (
//             <ActivityIndicator color="#093A24" style={{ marginTop: hp(4) }} />
//           ) : (
//             <>
//               <View style={styles.tableHeaderRow}>
//                 <Text style={[styles.colHeader, { flex: 2 }]}>Player</Text>
//                 <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Score</Text>
//                 <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>Status</Text>
//               </View>

//               {entries.length === 0 ? (
//                 <Text style={{ fontFamily: FONTS.regular, color: '#718096', textAlign: 'center', marginTop: hp(2) }}>
//                   No leaderboard entries yet.
//                 </Text>
//               ) : (
//                 entries.map((item) => (
//                   <View
//                     key={`${item.rank}-${item.name}`}
//                     style={[styles.playerCard, item.isYou && styles.playerCardYou]}
//                   >
//                     <Text style={styles.rankNum}>{item.rank}</Text>
//                     <Image source={item.image} style={styles.playerAvatar} />
//                     <Text style={styles.playerName} numberOfLines={1}>
//                       {item.name}
//                     </Text>
//                     <Text style={styles.roundScoreText}>{item.roundScore}</Text>
//                     <Text style={styles.pbScoreText}>{item.personalBest}</Text>
//                   </View>
//                 ))
//               )}

//               <View style={styles.infoBox}>
//                 <AuthIcon name="help-circle" size={moderateScale(16)} color="#093A24" style={{ marginTop: 2 }} />
//                 <Text style={styles.infoBoxText}>
//                   Rankings update as players complete holes in this tournament.
//                 </Text>
//               </View>
//             </>
//           )}

//           <AuthButton title="BACK TO HOME" onPress={handleBackToHome} style={{ marginTop: hp(2) }} />
//           <View style={{ height: hp(4) }} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
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

//   // Banner Header
//   header: {
//     backgroundColor: '#093A24',
//     paddingTop: Platform.OS === 'ios' ? hp(7) : hp(5),
//     paddingHorizontal: wp(5),
//     paddingBottom: hp(5),
//     position: 'relative',
//   },
//   headerOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(9, 58, 36, 0.40)',
//   },
//   bannerTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: COLORS.white,
//   },
//   bannerSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: 'rgba(255, 255, 255, 0.85)',
//     marginTop: hp(0.3),
//   },

//   // Content
//   contentContainer: {
//     paddingHorizontal: wp(5),
//     paddingTop: hp(2.5),
//   },

//   // Table Headers
//   tableHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: hp(1.5),
//     paddingHorizontal: wp(2),
//   },
//   colHeader: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(11.5),
//     color: '#093A24',
//   },

//   // Practice Player Card
//   playerCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.6),
//     marginBottom: hp(1.5),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.03,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   playerCardYou: {
//     borderColor: '#BCFF00',
//     borderWidth: 2,
//   },
//   rankNum: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24',
//     width: wp(6),
//   },
//   playerAvatar: {
//     width: moderateScale(42),
//     height: moderateScale(42),
//     borderRadius: moderateScale(21),
//     marginRight: wp(3),
//   },
//   playerName: {
//     flex: 1,
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13.5),
//     color: '#093A24',
//   },
//   roundScoreText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: '#093A24',
//     width: wp(14),
//     textAlign: 'center',
//   },
//   pbScoreText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: '#093A24',
//     width: wp(14),
//     textAlign: 'right',
//   },

//   // Challenge Matchup Card
//   matchupCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.6),
//     marginBottom: hp(1.5),
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.03,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   matchupLabel: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//     width: wp(16),
//   },
//   team1Score: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24',
//   },
//   vsCircle: {
//     width: moderateScale(26),
//     height: moderateScale(26),
//     borderRadius: moderateScale(13),
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   vsText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10),
//     color: '#093A24',
//   },
//   team2Score: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24',
//   },
//   duelText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12.5),
//     color: '#093A24',
//     textAlign: 'right',
//     width: wp(24),
//   },

//   // Team Total Dark Green Card
//   teamTotalCard: {
//     backgroundColor: '#093A24',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(2),
//     marginVertical: hp(2),
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#BCFF00',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   teamCol: {},
//   teamTotalName: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(11.5),
//     color: '#BCFF00',
//   },
//   teamTotalScore: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(26),
//     color: COLORS.white,
//     marginTop: hp(0.2),
//   },
//   teamCenterCol: {
//     alignItems: 'center',
//   },
//   teamTotalLabel: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(9),
//     color: COLORS.white,
//     letterSpacing: 0.5,
//   },
//   winnerBadge: {
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: '#BCFF00',
//     borderRadius: moderateScale(12),
//     paddingHorizontal: wp(2.5),
//     paddingVertical: hp(0.3),
//   },
//   winnerBadgeText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(9.5),
//     color: '#BCFF00',
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     borderRadius: moderateScale(20),
//     padding: moderateScale(14),
//     gap: wp(2.5),
//     marginBottom: hp(2),
//   },
//   infoBoxText: {
//     flex: 1,
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(11.5),
//     color: '#093A24',
//     lineHeight: fontSize(16),
//   },
// });

// export default LeaderboardScreen;





import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getTournamentLeaderboardApi } from '../../services/playerService';

const trophyImg = require('../../assets/Images/ trophy.png');
const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const LeaderboardScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;
  const tournament = route?.params?.tournament;
  const tournamentId = tournament?.id || tournament?._id;
  const playMode = route?.params?.playMode || tournament?.playMode || 'practice';

  const [selectedGame, setSelectedGame] = useState(Number(route?.params?.gameNumber) || 1);
  const [numberOfGames, setNumberOfGames] = useState(
    Math.max(1, Number(tournament?.numberOfGames) || 1),
  );
  const [entries, setEntries] = useState([]);
  const [challengeTeams, setChallengeTeams] = useState([]);
  const [meta, setMeta] = useState({
    tournamentName: tournament?.name || tournament?.title || 'Tournament',
    playMode,
  });
  const [loading, setLoading] = useState(true);

  const onBackPress = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
    return true;
  }, [navigation]);

  const loadLeaderboard = useCallback(async () => {
    if (!tournamentId || !isUuid(String(tournamentId))) {
      setLoading(false);
      setEntries([]);
      return;
    }
    try {
      setLoading(true);
      const res = await getTournamentLeaderboardApi(tournamentId, {
        gameNumber: selectedGame,
        view: 'game',
      });
      const data = res?.data || res;
      const gamesCount = Number(data?.numberOfGames) || Number(tournament?.numberOfGames) || 1;
      setNumberOfGames(Math.max(1, gamesCount));
      setMeta({
        tournamentName: data?.tournamentName || tournament?.name || tournament?.title || 'Tournament',
        playMode: data?.playMode || playMode,
      });
      const list = data?.entries || res?.entries || [];
      const practicePb =
        data?.practice?.personalBest ??
        data?.practice?.lastTournamentBest ??
        null;
      setEntries(
        (Array.isArray(list) ? list : []).map((e, idx) => {
          const playerId = e.playerUserId || e.userId || e.id;
          const isYou = Boolean(
            currentUserId && playerId && String(playerId) === String(currentUserId),
          );
          const entryPb = e.personalBest ?? e.lastTournamentBest ?? e.lastScore;
          const pb = entryPb ?? (isYou ? practicePb : null);
          return {
            rank: e.rank || idx + 1,
            name: e.playerName || e.name || 'Player',
            roundScore: e.score ?? 0,
            personalBest: pb != null && pb !== '' ? String(pb) : '—',
            isYou,
            avatarUrl: e.avatarUrl || e.avatar || e.image || null,
          };
        }),
      );
      const teams = data?.challenge?.teams || res?.challenge?.teams || [];
      setChallengeTeams(Array.isArray(teams) ? teams : []);
    } catch (err) {
      console.log('Leaderboard load error:', err);
      setEntries([]);
      setChallengeTeams([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, playMode, tournament, selectedGame, currentUserId]);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress, loadLeaderboard])
  );

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const isChallenge = String(meta.playMode || playMode).toLowerCase().includes('challenge');
  const modeLabel = isChallenge ? 'Challenge' : 'Practice';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Header with Trophy Image */}
        <ImageBackground source={trophyImg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>Leaderboard</Text>
          <View style={styles.subtitleBadge}>
            <Text
              style={styles.bannerSubtitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Game {selectedGame} · {modeLabel} · {meta.tournamentName}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.contentContainer}>
          {numberOfGames > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gameTabs}
            >
              {Array.from({ length: numberOfGames }, (_, i) => i + 1).map((n) => {
                const active = selectedGame === n;
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.gameTab, active && styles.gameTabActive]}
                    onPress={() => setSelectedGame(n)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.gameTabText, active && styles.gameTabTextActive]}>
                      Game {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          {loading ? (
            <ActivityIndicator color="#093A24" style={{ marginTop: hp(4) }} />
          ) : (
            <>
              {isChallenge ? (
                <>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.colHeader, { flex: 2 }]}>Team / Player</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Score</Text>
                  </View>
                  {challengeTeams.length === 0 ? (
                    <Text style={styles.emptyText}>No leaderboard entries yet.</Text>
                  ) : (
                    challengeTeams.map((team) => (
                      <View key={team.teamId || team.teamName} style={styles.teamBoardCard}>
                        <View style={styles.teamBoardHeader}>
                          <View style={styles.teamInfoCol}>
                            <Text style={styles.teamBoardRank}>#{team.rank}</Text>
                            <Text style={styles.teamBoardName} numberOfLines={1}>
                              {team.teamName || 'Team'}
                            </Text>
                          </View>
                          <Text style={styles.teamBoardTotal}>{team.totalScore ?? 0}</Text>
                        </View>
                        {(team.players || []).map((player, idx) => {
                          const playerId = player.playerUserId || player.userId || player.id;
                          return (
                            <View
                              key={`${playerId || player.playerName || idx}`}
                              style={styles.teamPlayerRow}
                            >
                              <View style={styles.playerInfoColChallenge}>
                                <Text style={styles.teamPlayerName} numberOfLines={1}>
                                  {player.playerName || player.name || 'Player'}
                                </Text>
                              </View>
                              <Text style={styles.teamPlayerScore}>{player.score ?? 0}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))
                  )}
                </>
              ) : (
                <>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.colHeader, { flex: 2 }]}>Player (Ability Rank)</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>This Round</Text>
                    <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'center' }]}>Personal Best (Last)</Text>
                  </View>

                  {entries.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No leaderboard entries yet.
                    </Text>
                  ) : (
                    entries.map((item) => (
                      <View
                        key={`${item.rank}-${item.name}`}
                        style={[styles.playerCard, item.isYou && styles.playerCardYou]}
                      >
                        <View style={styles.playerInfoCol}>
                          <Text style={styles.rankNum}>{item.rank}</Text>

                          {item.avatarUrl ? (
                            <Image source={{ uri: item.avatarUrl }} style={styles.playerAvatar} />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <AuthIcon name="user" size={moderateScale(18)} color="#093A24" />
                            </View>
                          )}

                          <Text style={styles.playerName} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>

                        <Text style={styles.roundScoreText}>{item.roundScore}</Text>
                        <Text style={styles.pbScoreText}>{item.personalBest}</Text>
                      </View>
                    ))
                  )}

                  <View style={styles.infoBox}>
                    <AuthIcon name="info" size={moderateScale(16)} color="#093A24" style={{ marginTop: 2 }} />
                    <Text style={styles.infoBoxText}>
                      The "Personal Best" column shows your last score for this course and segment. If it's your first time, the comparison will be empty.
                    </Text>
                  </View>
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={handleBackToHome}
            activeOpacity={0.85}
          >
            <Text style={styles.backHomeBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
          <View style={{ height: hp(4) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
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

  // Banner Header
  header: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.40)',
  },
  backButtonCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 10,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9, 58, 36, 0.75)',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    marginTop: hp(1),
    maxWidth: wp(90),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.5)',
  },
  bannerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: '#BCFF00',
    letterSpacing: 0.3,
  },

  // Content
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
  },
  gameTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(2),
    paddingRight: wp(2),
  },
  gameTab: {
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    backgroundColor: '#EDF2F7',
  },
  gameTabActive: {
    backgroundColor: '#0E3B2E',
  },
  gameTabText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: '#093A24',
  },
  gameTabTextActive: {
    color: '#BCFF00',
  },

  // Table Headers
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    paddingHorizontal: wp(2),
  },
  colHeader: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#093A24',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#718096',
    textAlign: 'center',
    marginTop: hp(2),
    marginBottom: hp(2),
  },

  // Player Card
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  playerCardYou: {
    borderColor: '#BCFF00',
    borderWidth: 2,
  },
  teamBoardCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    marginBottom: hp(1.5),
  },
  teamBoardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  teamInfoCol: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamBoardRank: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    marginRight: wp(2.5),
  },
  teamBoardName: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  teamBoardTotal: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    textAlign: 'center',
  },
  teamPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.7),
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  playerInfoColChallenge: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamPlayerName: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#4A5568',
  },
  teamPlayerScore: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    textAlign: 'center',
  },
  playerInfoCol: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: wp(1),
  },
  rankNum: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
    width: wp(6),
  },
  playerAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    marginRight: wp(2.5),
  },
  avatarPlaceholder: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  playerName: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
  },
  roundScoreText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    textAlign: 'center',
  },
  pbScoreText: {
    flex: 1.2,
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(20),
    padding: moderateScale(14),
    gap: wp(2.5),
    marginTop: hp(1),
    marginBottom: hp(2.5),
  },
  infoBoxText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: '#4A5568',
    lineHeight: fontSize(16),
  },

  // Back to Home Button
  backHomeBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(28),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backHomeBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    letterSpacing: 0.5,
  },
});

export default LeaderboardScreen;
