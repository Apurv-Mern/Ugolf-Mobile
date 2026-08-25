// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
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
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';
// import { getTournamentsApi, getTournamentByIdApi } from '../../services/homeService';
// import { getTournamentTeamsApi, getTeamsApi, getTeamByIdApi } from '../../services/teamService';

// import AuthButton from '../../components/common/AuthButton';
// import AuthIcon from '../../components/common/AuthIcon';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
// const trophyImg = require('../../assets/Images/ trophy.png');
// const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

// const INITIAL_TOURNAMENTS = [
//   {
//     id: '1',
//     title: 'Summer Masters Cup',
//     date: 'Jul 18',
//     location: 'Augusta Hills',
//     joined: 86,
//     numberOfGames: 3,
//     bgImage: trophyImg,
//   },
//   {
//     id: '2',
//     title: 'Riverside Open',
//     date: 'Jul 25',
//     location: 'Hamilton Island Golf Club',
//     joined: 54,
//     numberOfGames: 2,
//     bgImage: homescreenBg,
//   },
//   {
//     id: '3',
//     title: 'Sunset Championship',
//     date: 'Aug 02',
//     location: 'Cape Wickham Links',
//     joined: 120,
//     numberOfGames: 3,
//     bgImage: tournamentBg,
//   },
// ];

// const SelectTournamentScreen = ({ navigation, route }) => {
//   const currentUser = useSelector((state) => state.auth?.user);
//   const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;

//   const [tournaments, setTournaments] = useState([]);
//   const [selectedTournamentId, setSelectedTournamentId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const playMode = route?.params?.playMode || 'challenge';

//   const loadTournaments = async () => {
//     setLoading(true);
//     try {
//       const [mineRes, invitedRes, joinableRes, teamsRes] = await Promise.allSettled([
//         getTournamentsApi({ page: 1, limit: 50, scope: 'mine' }),
//         getTournamentsApi({ page: 1, limit: 50, scope: 'invited' }),
//         getTournamentsApi({ page: 1, limit: 50, scope: 'joinable' }),
//         getTeamsApi({ scope: 'all', includeJoined: 'true' }),
//       ]);

//       const mineList =
//         mineRes.status === 'fulfilled'
//           ? mineRes.value?.tournaments || mineRes.value?.data?.tournaments || (Array.isArray(mineRes.value) ? mineRes.value : [])
//           : [];
//       const invitedList =
//         invitedRes.status === 'fulfilled'
//           ? invitedRes.value?.tournaments || invitedRes.value?.data?.tournaments || (Array.isArray(invitedRes.value) ? invitedRes.value : [])
//           : [];
//       const joinableList =
//         joinableRes.status === 'fulfilled'
//           ? joinableRes.value?.tournaments || joinableRes.value?.data?.tournaments || (Array.isArray(joinableRes.value) ? joinableRes.value : [])
//           : [];
//       const userTeams =
//         teamsRes.status === 'fulfilled'
//           ? teamsRes.value?.teams || teamsRes.value?.data?.teams || (Array.isArray(teamsRes.value) ? teamsRes.value : [])
//           : [];

//       // Extract all team IDs the user created or joined
//       const teamIds = (Array.isArray(userTeams) ? userTeams : [])
//         .map((t) => t.id || t._id || t.teamId)
//         .filter(Boolean);

//       // Fetch full details for each team to find linked tournament IDs
//       const joinedTeamTournamentIds = new Set();
//       await Promise.all(
//         teamIds.map(async (tId) => {
//           try {
//             const teamRes = await getTeamByIdApi(tId);
//             const fullTeam = teamRes?.team || teamRes?.data?.team || teamRes;
//             const tourId = fullTeam?.tournamentId || fullTeam?.tournament?._id || fullTeam?.tournament?.id;
//             if (tourId) joinedTeamTournamentIds.add(String(tourId));
//           } catch (e) {
//             console.log('Error fetching team by ID for tournament link:', e);
//           }
//         })
//       );

//       // Fetch tournaments directly by ID for these linked tournament IDs
//       const teamLinkedTournaments = await Promise.all(
//         Array.from(joinedTeamTournamentIds).map(async (tId) => {
//           try {
//             const res = await getTournamentByIdApi(tId);
//             return res?.tournament || res?.data?.tournament || res;
//           } catch (e) {
//             return null;
//           }
//         })
//       );
//       const validTeamTournaments = teamLinkedTournaments.filter((t) => t && (t.id || t._id));

//       // Combine all valid candidate tournaments (mine, invited, joinable, team-linked)
//       const combinedMap = new Map();
//       [...mineList, ...invitedList, ...joinableList, ...validTeamTournaments].forEach((item) => {
//         const id = item.id || item._id;
//         if (id && !combinedMap.has(String(id))) {
//           combinedMap.set(String(id), item);
//         }
//       });

//       const tournamentList = Array.from(combinedMap.values());

//       const formatted = tournamentList.map((item, index) => ({
//         ...item,
//         id: item.id || item._id || String(index),
//         creatorUserId: item.creatorUserId || item.creatorId || item.createdBy,
//         title: item.name || item.title || 'Saturday Club Cup',
//         date: item.startDate || 'Aug 01',
//         location: item.clubName || item.location || 'Bondi Golf Club',
//         joined: item.joinedCount || item.joined || 12,
//         numberOfGames: item.numberOfGames || 3,
//         bgImage: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
//       }));

//       if (route?.params?.newTournament) {
//         const newT = route.params.newTournament;
//         if (!formatted.some((t) => String(t.id) === String(newT.id))) {
//           formatted.unshift(newT);
//         }
//       }

//       const currentPlayMode = (route?.params?.playMode || playMode || '').toLowerCase();
//       let modeFiltered = formatted;
//       if (currentPlayMode) {
//         modeFiltered = formatted.filter((t) => {
//           const tMode = (t.playMode || '').toLowerCase();
//           if (currentPlayMode === 'practice' || currentPlayMode.includes('practice')) {
//             return tMode === 'practice' || tMode === 'practice_round' || tMode.includes('practice');
//           }
//           return tMode === 'challenge' || tMode.includes('challenge');
//         });
//       }

//       setTournaments(modeFiltered);
//       if (modeFiltered.length > 0) {
//         setSelectedTournamentId((prev) => (modeFiltered.some((t) => t.id === prev) ? prev : modeFiltered[0].id));
//       } else {
//         setSelectedTournamentId(null);
//       }
//     } catch (error) {
//       console.log('Error loading tournaments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (route?.params?.newTournament) {
//       const newT = route.params.newTournament;
//       setTournaments((prev) => {
//         if (prev.some((t) => String(t.id) === String(newT.id))) return prev;
//         return [newT, ...prev];
//       });
//       setSelectedTournamentId(newT.id);
//     }
//   }, [route?.params?.newTournament]);

//   useFocusEffect(
//     React.useCallback(() => {
//       loadTournaments();

//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation])
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['bottom']}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       {/* ── Main ScrollView (identical to HomeScreen pattern) ── */}
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── 1. Header with BG Image ── */}
//         <ImageBackground source={tournamentBg} style={styles.header} resizeMode="cover">
//           <View style={styles.headerOverlay} />

//           {/* Back Button */}
//           <TouchableOpacity
//             style={styles.backButtonCircle}
//             onPress={() => navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
//           </TouchableOpacity>

//           <Text style={styles.bannerTitle}>Select Tournament</Text>
//         </ImageBackground>

//         {/* ── 2. Overlapping Create Tournament Card (overlaps header via negative marginTop) ── */}
//         <TouchableOpacity
//           style={styles.createHeroCard}
//           onPress={() => navigation.navigate('CreateTournament', { ...route?.params })}
//           activeOpacity={0.88}
//         >
//           <View style={styles.createHeroIconCircle}>
//             <AuthIcon name="plus" size={moderateScale(24)} color="#093A24" />
//           </View>

//           <View style={styles.createHeroTextWrap}>
//             <Text style={styles.createHeroLabel}>NEW TOURNAMENT</Text>
//             <Text style={styles.createHeroTitle}>CREATE TOURNAMENT</Text>
//           </View>
//         </TouchableOpacity>

//         {/* ── 3. Invited Tournaments Section ── */}
//         <View style={styles.section}>
//           {tournaments.length > 0 && (
//             <Text style={styles.sectionTitle}>Invited Tournaments</Text>
//           )}

//           {loading ? (
//             <ActivityIndicator size="large" color="#093A24" style={{ marginTop: hp(4) }} />
//           ) : tournaments.length === 0 ? (
//             <View style={{ alignItems: 'center', marginVertical: hp(6), paddingHorizontal: wp(4) }}>
//               <Text style={{ fontFamily: FONTS.bold, fontSize: fontSize(16), color: '#093A24', textAlign: 'center' }}>
//                 No tournaments created or invited yet
//               </Text>
//               <Text style={{ fontFamily: FONTS.medium, fontSize: fontSize(13), color: '#718096', marginTop: hp(0.8), textAlign: 'center' }}>
//                 Tap "CREATE TOURNAMENT" above to set up your first event!
//               </Text>
//             </View>
//           ) : (
//             tournaments.map((item) => {
//               const isSelected = String(selectedTournamentId) === String(item.id);
//               return (
//                 <TouchableOpacity
//                   key={item.id}
//                   style={styles.tournamentCard}
//                   onPress={() => setSelectedTournamentId(item.id)}
//                   activeOpacity={0.9}
//                 >
//                   <ImageBackground
//                     source={item.bgImage}
//                     style={styles.tournamentCardBg}
//                     imageStyle={{ borderRadius: moderateScale(18) }}
//                     resizeMode="cover"
//                   >
//                     <View style={styles.tournamentCardOverlay} />

//                     <View
//                       style={[
//                         styles.cardSelectCircle,
//                         isSelected && styles.cardSelectCircleSelected,
//                       ]}
//                     >
//                       {isSelected && (
//                         <AuthIcon name="check" size={moderateScale(10)} color="#093A24" />
//                       )}
//                     </View>

//                     <View style={styles.tournamentCardContent}>
//                       <Text style={styles.tournamentCardName}>{item.title}</Text>
//                       <View style={styles.tournamentMetaRow}>
//                         <View style={styles.metaBadge}>
//                           <Text style={styles.metaBadgeText}>📅 {item.date}</Text>
//                         </View>
//                         <View style={styles.metaBadge}>
//                           <Text style={styles.metaBadgeText}>📍 {item.location}</Text>
//                         </View>
//                         <View style={styles.metaBadge}>
//                           <Text style={styles.metaBadgeText}>👥 {item.joined}</Text>
//                         </View>
//                       </View>
//                     </View>
//                   </ImageBackground>
//                 </TouchableOpacity>
//               );
//             })
//           )}
//         </View>

//         {/* Bottom padding for fixed button */}
//         <View style={{ height: hp(2) }} />
//       </ScrollView>

//       {/* ── 4. Fixed Continue Button ── */}
//       <View style={styles.btnFixedBottom}>
//         <AuthButton
//           title="CONTINUE"
//           disabled={!selectedTournamentId}
//           onPress={() => {
//             const selectedT = tournaments.find(t => t.id === selectedTournamentId);
//             if (selectedT) {
//               navigation.navigate('ConfigureGames', {
//                 ...route?.params,
//                 tournament: selectedT,
//               });
//             } else {
//               Toast.show({
//                 type: 'error',
//                 text1: 'Selection Error',
//                 text2: 'Please select a tournament to continue',
//               });
//             }
//           }}
//         />
//       </View>
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
//     backgroundColor: '#F8FAF9',
//   },
//   scrollContent: {
//     flexGrow: 1,
//     backgroundColor: '#F8FAF9',
//   },

//   // ── 1. Header ──
//   header: {
//     backgroundColor: '#093A24',
//     paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
//     paddingBottom: hp(7.5), // Extra bottom padding so card overlaps header cleanly
//     paddingHorizontal: wp(5),
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
//     marginBottom: hp(2.5),
//     elevation: 4,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 5,
//     zIndex: 10,
//   },
//   bannerTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: COLORS.white,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },

//   // ── 2. Overlapping Create Tournament Card (Matching HomeScreen pointsCard pattern) ──
//   createHeroCard: {
//     backgroundColor: '#093A24',
//     borderRadius: moderateScale(18),
//     paddingHorizontal: wp(4.5),
//     height: hp(9.5),
//     marginHorizontal: wp(5),
//     marginTop: -hp(5), // Pulls card UP over the header bottom boundary
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 6,
//     zIndex: 10,
//   },
//   createHeroIconCircle: {
//     width: moderateScale(46),
//     height: moderateScale(46),
//     borderRadius: moderateScale(23),
//     backgroundColor: '#BCFF00',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: wp(3.5),
//     elevation: 4,
//     shadowColor: '#BCFF00',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.4,
//     shadowRadius: 6,
//   },
//   createHeroTextWrap: {
//     justifyContent: 'center',
//   },
//   createHeroLabel: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(9),
//     color: '#BCFF00',
//     letterSpacing: 1.2,
//     marginBottom: hp(0.2),
//   },
//   createHeroTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: COLORS.white,
//     letterSpacing: 0.5,
//   },

//   // ── 3. Section ──
//   section: {
//     paddingHorizontal: wp(5),
//     marginTop: hp(2.5),
//   },
//   sectionTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(17),
//     color: '#093A24',
//     marginBottom: hp(1.8),
//   },

//   // ── Tournament List Cards ──
//   tournamentCard: {
//     height: hp(17),
//     marginBottom: hp(2),
//     borderRadius: moderateScale(18),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   tournamentCardBg: {
//     flex: 1,
//     padding: wp(4),
//     justifyContent: 'flex-end',
//   },
//   tournamentCardOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.42)',
//     borderRadius: moderateScale(18),
//   },
//   cardSelectCircle: {
//     position: 'absolute',
//     top: wp(4),
//     right: wp(4),
//     width: moderateScale(22),
//     height: moderateScale(22),
//     borderRadius: moderateScale(11),
//     borderWidth: 2,
//     borderColor: '#BCFF00',
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 3,
//   },
//   cardSelectCircleSelected: {
//     backgroundColor: '#BCFF00',
//   },
//   tournamentCardContent: {
//     zIndex: 2,
//   },
//   tournamentCardName: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(18),
//     color: COLORS.white,
//     marginBottom: hp(1.2),
//   },
//   tournamentMetaRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: wp(1.8),
//   },
//   metaBadge: {
//     backgroundColor: 'rgba(255,255,255,0.18)',
//     borderRadius: moderateScale(8),
//     paddingHorizontal: wp(2.5),
//     paddingVertical: hp(0.4),
//   },
//   metaBadgeText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(10),
//     color: COLORS.white,
//   },

//   // ── 4. Fixed Bottom Button ──
//   btnFixedBottom: {
//     backgroundColor: '#F8FAF9',
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//     paddingHorizontal: wp(5),
//     paddingBottom: hp(2.5),
//     paddingTop: hp(1.5),
//   },
// });

// export default SelectTournamentScreen;



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import Toast from 'react-native-toast-message';
import { getTournamentsApi, getTournamentByIdApi } from '../../services/homeService';
import { getTournamentTeamsApi, getTeamsApi, getTeamByIdApi } from '../../services/teamService';
import { getStartGameReadinessApi } from '../../services/playService';
import { shareTournamentLink } from '../../utils/shareUtils';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
const editIcon = require('../../assets/Images/edit.png');

const INITIAL_TOURNAMENTS = [
  {
    id: '1',
    title: 'Summer Masters Cup',
    date: 'Jul 18',
    location: 'Augusta Hills',
    joined: 86,
    numberOfGames: 3,
    bgImage: trophyImg,
  },
  {
    id: '2',
    title: 'Riverside Open',
    date: 'Jul 25',
    location: 'Hamilton Island Golf Club',
    joined: 54,
    numberOfGames: 2,
    bgImage: homescreenBg,
  },
  {
    id: '3',
    title: 'Sunset Championship',
    date: 'Aug 02',
    location: 'Cape Wickham Links',
    joined: 120,
    numberOfGames: 3,
    bgImage: tournamentBg,
  },
];

const getTournamentHeadCount = (item) => {
  if (!item) return 0;

  // 1. Direct member/player count numbers
  if (typeof item.memberCount === 'number' && item.memberCount > 0) return item.memberCount;
  if (typeof item.totalMembers === 'number' && item.totalMembers > 0) return item.totalMembers;
  if (typeof item.joinedPlayersCount === 'number' && item.joinedPlayersCount > 0) return item.joinedPlayersCount;
  if (typeof item.playerCount === 'number' && item.playerCount > 0) return item.playerCount;
  if (typeof item.totalPlayers === 'number' && item.totalPlayers > 0) return item.totalPlayers;

  // 2. Sum members across team list if teams array present
  const teamsList = item.teams || item.invitedTeams || item.tournamentTeams || item.teamList;
  if (Array.isArray(teamsList) && teamsList.length > 0) {
    let memberSum = 0;
    teamsList.forEach((t) => {
      const mList = t.members || t.players || t.roster || t.teamMembers;
      if (Array.isArray(mList) && mList.length > 0) {
        memberSum += mList.length;
      } else {
        memberSum += 1;
      }
    });
    if (memberSum > 0) return memberSum;
  }

  // 3. Direct players / members list length
  const playersList = item.players || item.members || item.participants || item.userList;
  if (Array.isArray(playersList) && playersList.length > 0) {
    return playersList.length;
  }

  // 4. Count fields if present
  if (typeof item.joinedCount === 'number' && item.joinedCount > 0) return item.joinedCount;
  if (typeof item.joined === 'number' && item.joined > 0) return item.joined;
  if (typeof item.acceptedCount === 'number' && item.acceptedCount > 0) return item.acceptedCount;

  // 5. Parsable strings or teamCount
  if (item.joinedCount != null && !isNaN(Number(item.joinedCount)) && Number(item.joinedCount) > 0) {
    return Number(item.joinedCount);
  }
  if (item.joined != null && !isNaN(Number(item.joined)) && Number(item.joined) > 0) {
    return Number(item.joined);
  }
  if (item.playerCount != null && !isNaN(Number(item.playerCount)) && Number(item.playerCount) > 0) {
    return Number(item.playerCount);
  }

  const tCount = Number(item.teamCount || item.teamsCount || (Array.isArray(teamsList) ? teamsList.length : 0)) || 0;
  if (tCount > 0) return tCount;

  return 0;
};

import { formatDisplayDate } from '../../utils/dateUtils';

const SelectTournamentScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const playMode = route?.params?.playMode || 'challenge';

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const [mineRes, invitedRes] = await Promise.allSettled([
        getTournamentsApi({ page: 1, limit: 50, scope: 'mine' }),
        getTournamentsApi({ page: 1, limit: 50, scope: 'invited' }),
      ]);

      const mineList =
        mineRes.status === 'fulfilled'
          ? mineRes.value?.tournaments || mineRes.value?.data?.tournaments || (Array.isArray(mineRes.value) ? mineRes.value : [])
          : [];
      const invitedListRaw =
        invitedRes.status === 'fulfilled'
          ? invitedRes.value?.tournaments || invitedRes.value?.data?.tournaments || (Array.isArray(invitedRes.value) ? invitedRes.value : [])
          : [];

      // Filter out pending / unaccepted invitations
      const invitedList = invitedListRaw.filter((t) => {
        const statusStr = String(
          t.inviteStatus || t.userStatus || t.myTeamStatus || t.teamInviteStatus || t.invite?.status || t.status || ''
        ).toUpperCase();
        const isPending =
          t.accepted === false ||
          t.isAccepted === false ||
          t.pending === true ||
          t.isPending === true ||
          statusStr.includes('PENDING') ||
          statusStr.includes('REJECT') ||
          statusStr.includes('DECLINE') ||
          statusStr.includes('UNACCEPTED');

        return !isPending;
      });

      // Combine mine and invited tournaments keeping source / isMine flag
      const combinedMap = new Map();
      mineList.forEach((item) => {
        const id = item.id || item._id;
        if (id && !combinedMap.has(String(id))) {
          combinedMap.set(String(id), { ...item, isMine: true, source: 'mine' });
        }
      });
      invitedList.forEach((item) => {
        const id = item.id || item._id;
        if (id && !combinedMap.has(String(id))) {
          combinedMap.set(String(id), { ...item, isMine: false, source: 'invited' });
        }
      });

      const tournamentList = Array.from(combinedMap.values());

      const formatted = tournamentList.map((item, index) => {
        const count = getTournamentHeadCount(item);
        const creatorId = item.creatorUserId || item.creatorId || item.createdBy;
        const isMine =
          item.isMine === true ||
          item.source === 'mine' ||
          (currentUserId && String(creatorId) === String(currentUserId));

        return {
          ...item,
          id: item.id || item._id || String(index),
          creatorUserId: creatorId,
          isMine,
          title: item.name || item.title || 'Saturday Club Cup',
          date: item.startDate ? formatDisplayDate(item.startDate) : item.date || '01-08-2026',
          location: item.golfCourseName || item.clubName || item.location || '',
          joined: count,
          numberOfGames: item.numberOfGames || 3,
          bgImage: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
        };
      });

      if (route?.params?.newTournament) {
        const newT = route.params.newTournament;
        const newTFormatted = {
          ...newT,
          id: newT.id || newT._id,
          isMine: true,
          source: 'mine',
          creatorUserId: currentUserId || newT.creatorUserId,
          title: newT.name || newT.title || 'Saturday Club Cup',
          date: newT.startDate ? formatDisplayDate(newT.startDate) : newT.date || '01-08-2026',
          location: newT.golfCourseName || newT.clubName || newT.location || '',
          joined: getTournamentHeadCount(newT),
          numberOfGames: newT.numberOfGames || 3,
          bgImage: trophyImg,
        };
        if (!formatted.some((t) => String(t.id) === String(newTFormatted.id))) {
          formatted.unshift(newTFormatted);
        }
      }

      const readinessResults = await Promise.allSettled(
        formatted.map((t) =>
          t.id && typeof t.id === 'string' && t.id.includes('-')
            ? getStartGameReadinessApi(t.id)
            : Promise.resolve(null),
        ),
      );

      const finalFormatted = formatted.map((item, idx) => {
        const res =
          readinessResults[idx]?.status === 'fulfilled'
            ? readinessResults[idx]?.value?.data || readinessResults[idx]?.value
            : null;
        const hasActiveSession = Boolean(res?.activeSession?.id || res?.activeSession?.gameNumber);
        const completedCount = Array.isArray(res?.completedGameNumbers) ? res.completedGameNumbers.length : 0;
        const totalGames = Number(item.numberOfGames) || 1;
        const allGamesDone = completedCount >= totalGames && totalGames > 0;
        const statusUpper = String(item.status || '').toUpperCase();

        const isCompleted = item.isCompleted === true || item.completed === true || allGamesDone || statusUpper === 'COMPLETED';
        const isInProgress =
          !isCompleted &&
          (hasActiveSession ||
            completedCount > 0 ||
            statusUpper === 'IN_PROGRESS' ||
            statusUpper === 'ACTIVE' ||
            item.isStarted === true ||
            item.hasStarted === true);

        return {
          ...item,
          isInProgress,
          isCompleted,
          hasActiveSession,
          activeSession: res?.activeSession,
        };
      });

      // Filter out completed tournaments (they are shown on Home screen completed section)
      const uncompletedOnly = finalFormatted.filter((t) => t.isCompleted !== true);

      const currentPlayMode = (route?.params?.playMode || playMode || '').toLowerCase();
      let modeFiltered = uncompletedOnly;
      if (currentPlayMode) {
        modeFiltered = uncompletedOnly.filter((t) => {
          const tMode = (t.playMode || '').toLowerCase();
          if (currentPlayMode === 'practice' || currentPlayMode.includes('practice')) {
            return tMode === 'practice' || tMode === 'practice_round' || tMode.includes('practice');
          }
          return tMode === 'challenge' || tMode.includes('challenge');
        });
      }

      setTournaments(modeFiltered);
      if (modeFiltered.length > 0) {
        setSelectedTournamentId((prev) => (modeFiltered.some((t) => t.id === prev) ? prev : modeFiltered[0].id));
      } else {
        setSelectedTournamentId(null);
      }
    } catch (error) {
      console.log('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route?.params?.newTournament) {
      const newT = route.params.newTournament;
      const formattedNew = {
        ...newT,
        id: newT.id || newT._id,
        isMine: true,
        source: 'mine',
        creatorUserId: currentUserId || newT.creatorUserId,
        title: newT.name || newT.title || 'Saturday Club Cup',
        date: newT.startDate ? new Date(newT.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : newT.date || 'Aug 01',
        location: newT.golfCourseName || newT.clubName || newT.location || '',
        joined: getTournamentHeadCount(newT),
        numberOfGames: newT.numberOfGames || 3,
        bgImage: trophyImg,
      };
      setTournaments((prev) => {
        if (prev.some((t) => String(t.id) === String(formattedNew.id))) return prev;
        return [formattedNew, ...prev];
      });
      setSelectedTournamentId(formattedNew.id);
    }
  }, [route?.params?.newTournament, currentUserId]);

  useFocusEffect(
    React.useCallback(() => {
      loadTournaments();

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const myTournaments = tournaments.filter(
    (t) =>
      t.isMine === true ||
      t.source === 'mine' ||
      (currentUserId && String(t.creatorUserId) === String(currentUserId))
  );

  const invitedTournaments = tournaments.filter(
    (t) => !myTournaments.some((m) => String(m.id) === String(t.id))
  );

  const renderCard = (item) => {
    const isSelected = String(selectedTournamentId) === String(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.tournamentCard}
        onPress={() => setSelectedTournamentId(item.id)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={item.bgImage}
          style={styles.tournamentCardBg}
          imageStyle={{ borderRadius: moderateScale(18) }}
          resizeMode="cover"
        >
          <View style={styles.tournamentCardOverlay} />

          <View
            style={[
              styles.cardSelectCircle,
              isSelected && styles.cardSelectCircleSelected,
            ]}
          >
            {isSelected && (
              <AuthIcon name="check" size={moderateScale(10)} color="#093A24" />
            )}
          </View>

          {(() => {
            const status = String(item.status || '').toUpperCase();
            const isCompleted = item.isCompleted === true || status === 'COMPLETED' || status === 'CANCELLED';
            const isInProgress =
              item.isInProgress === true ||
              item.hasStarted === true ||
              status === 'IN_PROGRESS' ||
              status === 'ACTIVE';

            if (isInProgress) {
              return (
                <View style={styles.inProgressBadge}>
                  <Text style={styles.inProgressBadgeText}>IN PROGRESS</Text>
                </View>
              );
            }

            const canEdit = item.isMine && !isCompleted && !isInProgress && !item.isStarted;
            const canShare = !isCompleted && !isInProgress && !item.isStarted && (item.shareLinkEnabled === true || (item.shareLinkEnabled !== false && (!!item.joinUrl || !!item.joinToken)));

            if (!canEdit && !canShare) return null;

            return (
              <View style={styles.cardActionsRow}>
                {canShare && (
                  <TouchableOpacity
                    style={styles.cardShareBtn}
                    onPress={() => shareTournamentLink(item)}
                    activeOpacity={0.7}
                  >
                    <AuthIcon name="share" size={moderateScale(14)} color="#093A24" />
                  </TouchableOpacity>
                )}
                {canEdit && (
                  <TouchableOpacity
                    style={styles.cardEditBtn}
                    onPress={() =>
                      navigation.navigate('CreateTournament', {
                        tournament: item,
                        isEditing: true,
                        ...route?.params,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Image source={editIcon} style={styles.editIconImg} resizeMode="contain" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}

          <View style={styles.tournamentCardContent}>
            <Text style={styles.tournamentCardName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{item.title}</Text>
            <View style={styles.tournamentMetaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {item.date}</Text>
              </View>
              {item.location ? (
                <View style={[styles.metaBadge, { flexShrink: 1, maxWidth: wp(50) }]}>
                  <Text style={styles.metaBadgeText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>📍 {item.location}</Text>
                </View>
              ) : null}
              {item.joined && item.joined !== '—' && item.joined !== 0 ? (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>👥 {item.joined}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Main ScrollView (identical to HomeScreen pattern) ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header with BG Image ── */}
        <ImageBackground source={tournamentBg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>Select Tournament</Text>
        </ImageBackground>

        {/* ── 2. Overlapping Create Tournament Card (overlaps header via negative marginTop) ── */}
        <TouchableOpacity
          style={styles.createHeroCard}
          onPress={() => navigation.navigate('CreateTournament', { ...route?.params })}
          activeOpacity={0.88}
        >
          <View style={styles.createHeroIconCircle}>
            <AuthIcon name="plus" size={moderateScale(24)} color="#093A24" />
          </View>

          <View style={styles.createHeroTextWrap}>
            <Text style={styles.createHeroLabel}>NEW TOURNAMENT</Text>
            <Text style={styles.createHeroTitle}>CREATE TOURNAMENT</Text>
          </View>
        </TouchableOpacity>

        {/* ── 3. Tournaments Sections ── */}
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator size="large" color="#093A24" style={{ marginTop: hp(4) }} />
          ) : tournaments.length === 0 ? (
            <View style={{ alignItems: 'center', marginVertical: hp(6), paddingHorizontal: wp(4) }}>
              <Text style={{ fontFamily: FONTS.bold, fontSize: fontSize(16), color: '#093A24', textAlign: 'center' }}>
                No tournaments created or invited yet
              </Text>
              <Text style={{ fontFamily: FONTS.medium, fontSize: fontSize(13), color: '#718096', marginTop: hp(0.8), textAlign: 'center' }}>
                Tap "CREATE TOURNAMENT" above to set up your first event!
              </Text>
            </View>
          ) : (
            <>
              {/* My Tournaments Section */}
              {myTournaments.length > 0 && (
                <View style={{ marginBottom: hp(2.5) }}>
                  <Text style={styles.sectionTitle}>My Tournaments</Text>
                  {myTournaments.map(renderCard)}
                </View>
              )}

              {/* Invited Tournaments Section */}
              {invitedTournaments.length > 0 && (
                <View style={{ marginBottom: hp(1) }}>
                  <Text style={styles.sectionTitle}>Invited Tournaments</Text>
                  {invitedTournaments.map(renderCard)}
                </View>
              )}
            </>
          )}
        </View>

        {/* Bottom padding for fixed button */}
        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* ── 4. Fixed Continue Button ── */}
      <View style={styles.btnFixedBottom}>
        <AuthButton
          title="CONTINUE"
          disabled={!selectedTournamentId}
          onPress={() => {
            const selectedT = tournaments.find(t => t.id === selectedTournamentId);
            if (selectedT) {
              if (selectedT.isInProgress && selectedT.activeSession?.id) {
                navigation.navigate('ActiveGame', {
                  tournament: selectedT,
                  sessionId: selectedT.activeSession.id,
                  gameNumber: Number(selectedT.activeSession.gameNumber) || 1,
                  playMode: (selectedT.playMode || route?.params?.playMode || 'practice').toLowerCase() === 'challenge' ? 'challenge' : 'practice',
                });
              } else {
                navigation.navigate('ConfigureGames', {
                  ...route?.params,
                  tournament: selectedT,
                });
              }
            } else {
              Toast.show({
                type: 'error',
                text1: 'Selection Error',
                text2: 'Please select a tournament to continue',
              });
            }
          }}
        />
      </View>
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
    backgroundColor: '#F8FAF9',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAF9',
  },

  // ── 1. Header ──
  header: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    paddingBottom: hp(7.5), // Extra bottom padding so card overlaps header cleanly
    paddingHorizontal: wp(5),
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
    marginBottom: hp(2.5),
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

  // ── 2. Overlapping Create Tournament Card (Matching HomeScreen pointsCard pattern) ──
  createHeroCard: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(18),
    paddingHorizontal: wp(4.5),
    height: hp(9.5),
    marginHorizontal: wp(5),
    marginTop: -hp(5), // Pulls card UP over the header bottom boundary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  createHeroIconCircle: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
    elevation: 4,
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  createHeroTextWrap: {
    justifyContent: 'center',
  },
  createHeroLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(9),
    color: '#BCFF00',
    letterSpacing: 1.2,
    marginBottom: hp(0.2),
  },
  createHeroTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // ── 3. Section ──
  section: {
    paddingHorizontal: wp(5),
    marginTop: hp(2.5),
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),
    color: '#093A24',
    marginBottom: hp(1.8),
  },

  // ── Tournament List Cards ──
  tournamentCard: {
    minHeight: hp(17),
    marginBottom: hp(2),
    borderRadius: moderateScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  tournamentCardBg: {
    flex: 1,
    padding: wp(4),
    justifyContent: 'flex-end',
  },
  tournamentCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 25, 16, 0.55)',
    borderRadius: moderateScale(18),
  },
  cardSelectCircle: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    borderWidth: 2,
    borderColor: '#BCFF00',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  cardSelectCircleSelected: {
    backgroundColor: '#BCFF00',
  },
  tournamentCardContent: {
    zIndex: 2,
    paddingRight: wp(10),
  },
  tournamentCardName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: COLORS.white,
    marginBottom: hp(0.8),
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },
  tournamentMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(1.8),
    alignItems: 'center',
  },
  metaBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: moderateScale(8),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.3)',
  },
  metaBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },
  cardActionsRow: {
    position: 'absolute',
    top: wp(3.5),
    right: wp(13),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.8),
    zIndex: 10,
  },
  cardShareBtn: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEditBtn: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconImg: {
    width: moderateScale(15),
    height: moderateScale(15),
    tintColor: '#093A24',
  },
  inProgressBadgeInline: {
    backgroundColor: '#093A24',
    borderWidth: 1,
    borderColor: '#BCFF00',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
  },
  inProgressBadge: {
    position: 'absolute',
    top: wp(3.5),
    right: wp(13),
    backgroundColor: '#093A24',
    borderWidth: 1,
    borderColor: '#BCFF00',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    zIndex: 10,
  },
  inProgressBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(9.5),
    color: '#BCFF00',
    letterSpacing: 0.3,
  },

  // ── 4. Fixed Bottom Button ──
  btnFixedBottom: {
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default SelectTournamentScreen;
