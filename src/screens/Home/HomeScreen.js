// import React, { useState, useEffect, useCallback } from 'react';

// import { useSelector } from 'react-redux';

// import { getStorageData } from '../../storage/storage';

// import { useFocusEffect } from '@react-navigation/native';



// import {

//   View,

//   Text,

//   StyleSheet,

//   TouchableOpacity,

//   ScrollView,

//   StatusBar,

//   Image,

//   Platform,

// } from 'react-native';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import LinearGradient from 'react-native-linear-gradient';



// import { COLORS } from '../../theme/colors';

// import { FONTS } from '../../theme/fonts';

// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';



// const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

// const trophyImg = require('../../assets/Images/ trophy.png');



// import AuthIcon from '../../components/common/AuthIcon';

// import DotPattern from '../../components/common/DotPattern';

// import {

//   ScreenScaffold,

//   GlassCard,

//   HeroBanner,

//   PrimaryPillButton,

// } from '../../components/ui';

// import ProfileScreen from '../Profile/ProfileScreen';

// import { getTournamentsApi } from '../../services/homeService';

// import { getPlayerGameHistoryApi, getPlayerProfileApi } from '../../services/playerService';

// import { getUnreadNotificationsCountApi } from '../../services/notificationService';

// import {

//   getStartGameReadinessApi,

//   getGameSessionApi,

// } from '../../services/playService';



// // ─── Bottom Tab Icons ────────────────────────────────────────────────────────

// const TAB_ITEMS = [

//   { iconName: 'home', label: 'Home' },

//   { iconName: 'golf-play', label: 'Play', isCenter: true },

//   { iconName: 'user', label: 'Profile' },

// ];



// const HomeScreen = ({ navigation }) => {

//   const [activeTab, setActiveTab] = useState(0);

//   const [hideTabBar, setHideTabBar] = useState(false);

//   const insets = useSafeAreaInsets();



//   const reduxUser = useSelector((state) => state.auth.user);

//   const [userInfo, setUserInfo] = useState(reduxUser);

//   const [tournaments, setTournaments] = useState([]);

//   const [unreadCount, setUnreadCount] = useState(0);

//   const [totalPoints, setTotalPoints] = useState(0);

//   const [lastBest, setLastBest] = useState(0);

//   const [liveRound, setLiveRound] = useState(null);



//   useEffect(() => {

//     if (reduxUser) {

//       setUserInfo(reduxUser);

//     } else {

//       getStorageData('USER_DATA').then((data) => {

//         if (data) {

//           const userObj = data?.user || data?.data?.user || data?.data || data;

//           setUserInfo(userObj);

//         }

//       });

//     }

//   }, [reduxUser]);



//   const normalizeTournament = (t, idx, source) => {

//     const rawMode = String(t.playMode || t.mode || '').toUpperCase();

//     const playMode = rawMode.includes('CHALLENGE')

//       ? 'CHALLENGE'

//       : rawMode.includes('PRACTICE')

//         ? 'PRACTICE'

//         : null;



//     return {

//       id: String(t.id || t._id || `${source}-${idx}`),

//       title: t.name || t.title || 'Tournament',

//       startDateMs: t.startDate ? new Date(t.startDate).getTime() : Number.MAX_SAFE_INTEGER,

//       date: t.startDate

//         ? new Date(t.startDate).toLocaleDateString(undefined, {

//           month: 'short',

//           day: 'numeric',

//         })

//         : t.date || '',

//       location: t.clubName || t.location || t.city || '',

//       joined: t.teamCount || t.joined || t.playerCount || '—',

//       source,

//       playMode,

//       // Keep fields needed when opening ConfigureGames / SelectGame from Home.

//       tournament: {

//         ...t,

//         id: t.id || t._id,

//         name: t.name || t.title,

//         title: t.title || t.name,

//         playMode: playMode || t.playMode,

//         creatorUserId: t.creatorUserId || t.creatorId || t.createdBy,

//       },

//     };

//   };



//   const extractTournamentList = (res) => {

//     const raw =

//       res?.tournaments || res?.data?.tournaments || res?.data || (Array.isArray(res) ? res : []);

//     return Array.isArray(raw) ? raw : [];

//   };



//   /**

//    * Find the round the player left in progress so Home can offer "Continue round".

//    * Readiness is per tournament, so only the soonest few are probed.

//    */

//   const loadLiveRound = useCallback(async (list) => {

//     const candidates = list

//       .filter((item) => item.tournament?.id)

//       .slice(0, 4);



//     if (candidates.length === 0) {

//       setLiveRound(null);

//       return;

//     }



//     const results = await Promise.all(

//       candidates.map((item) =>

//         getStartGameReadinessApi(item.tournament.id)

//           .then((res) => res?.data || res)

//           .catch(() => null),

//       ),

//     );



//     const idx = results.findIndex((r) => r?.activeSession?.id);

//     if (idx === -1) {

//       setLiveRound(null);

//       return;

//     }



//     const item = candidates[idx];

//     const session = results[idx].activeSession;

//     const sessionRes = await getGameSessionApi(item.tournament.id, session.id)

//       .then((res) => res?.play || res?.data?.play || res?.data || res)

//       .catch(() => null);



//     const holeStart = Number(sessionRes?.holeStart) || 1;

//     const holeEnd = Number(sessionRes?.holeEnd) || 18;

//     const totalHoles = Math.max(1, holeEnd - holeStart + 1);

//     const holeIndex = Math.min(

//       totalHoles,

//       Math.max(1, (Number(session.currentHole) || holeStart) - holeStart + 1),

//     );

//     const courseName = sessionRes?.golfCourseName || item.location || item.title;

//     const nineLabel =

//       totalHoles === 9 ? (holeStart <= 9 ? 'Front 9' : 'Back 9') : `${totalHoles} holes`;



//     setLiveRound({

//       tournament: item.tournament,

//       playMode: item.playMode,

//       sessionId: session.id,

//       gameNumber: Number(session.gameNumber) || 1,

//       title: courseName ? `${courseName} — ${nineLabel}` : nineLabel,

//       holeIndex,

//       totalHoles,

//       progress: holeIndex / totalHoles,

//     });

//   }, []);



//   const loadHomeData = useCallback(async () => {

//     try {

//       const [mineRes, invitedRes, historyRes, unreadRes, profileRes] = await Promise.all([

//         getTournamentsApi({ scope: 'mine', limit: 20 }).catch(() => null),

//         getTournamentsApi({ scope: 'invited', limit: 20 }).catch(() => null),

//         getPlayerGameHistoryApi().catch(() => null),

//         getUnreadNotificationsCountApi().catch(() => null),

//         getPlayerProfileApi().catch(() => null),

//       ]);



//       const player =

//         profileRes?.player || profileRes?.data?.player || profileRes?.data || profileRes;

//       if (player?.totalPoints != null) {

//         setTotalPoints(Number(player.totalPoints) || 0);

//       }



//       // Mine first so creator tournaments win on id collision (no Invited tag on own events).

//       const byId = new Map();

//       extractTournamentList(mineRes).forEach((t, idx) => {

//         const item = normalizeTournament(t, idx, 'mine');

//         byId.set(item.id, item);

//       });

//       extractTournamentList(invitedRes).forEach((t, idx) => {

//         const item = normalizeTournament(t, idx, 'invited');

//         if (!byId.has(item.id)) byId.set(item.id, item);

//       });



//       const merged = Array.from(byId.values()).sort(

//         (a, b) => a.startDateMs - b.startDateMs,

//       );

//       setTournaments(merged.slice(0, 5));

//       loadLiveRound(merged).catch(() => setLiveRound(null));



//       const history =

//         historyRes?.history || historyRes?.data?.history || historyRes?.data || (Array.isArray(historyRes) ? historyRes : []);

//       const historyList = Array.isArray(history) ? history : [];

//       const best = historyList.reduce((max, h) => {

//         const s = Number(h.score);

//         return Number.isFinite(s) ? Math.max(max, s) : max;

//       }, 0);

//       setLastBest(best);



//       const count =

//         unreadRes?.unreadCount ??

//         unreadRes?.count ??

//         unreadRes?.data?.unreadCount ??

//         unreadRes?.data?.count ??

//         0;

//       setUnreadCount(Number(count) || 0);

//     } catch (err) {

//       console.log('Home load error:', err);

//     }

//   }, [loadLiveRound]);



//   useFocusEffect(

//     React.useCallback(() => {

//       loadHomeData();

//     }, [loadHomeData]),

//   );



//   const openTournament = (item) => {

//     const playMode =

//       item.playMode === 'CHALLENGE'

//         ? 'challenge'

//         : item.playMode === 'PRACTICE'

//           ? 'practice'

//           : item.tournament?.playMode || 'practice';



//     if (item.source === 'invited') {

//       // Invitee: read-only game list, then continue into readiness / start.

//       navigation.navigate('ConfigureGames', {

//         tournament: item.tournament,

//         playMode,

//         isCreator: false,

//       });

//       return;

//     }



//     // Creator: edit course / hole configuration for this tournament.

//     navigation.navigate('ConfigureGames', {

//       tournament: item.tournament,

//       playMode,

//       isCreator: true,

//     });

//   };



//   const continueLiveRound = () => {

//     if (!liveRound) return;

//     navigation.navigate('ActiveGame', {

//       tournament: liveRound.tournament,

//       sessionId: liveRound.sessionId,

//       gameNumber: liveRound.gameNumber,

//       playMode: liveRound.playMode === 'CHALLENGE' ? 'challenge' : 'practice',

//     });

//   };



//   const rawUser = userInfo?.user || userInfo?.data?.user || userInfo;

//   const getFullName = (u) => {

//     if (!u) return 'User';

//     if (u.firstName || u.lastName) {

//       const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();

//       if (full) return full;

//     }

//     const n = u.displayName || u.name || u.fullName;

//     if (n) {

//       if (u.lastName && !n.toLowerCase().includes(u.lastName.toLowerCase())) {

//         return `${n} ${u.lastName}`.trim();

//       }

//       return n;

//     }

//     if (u.username) return u.username;

//     if (u.email) return u.email.split('@')[0];

//     return 'User';

//   };

//   const loggedInName = getFullName(rawUser);



//   const getGreeting = () => {

//     const hour = new Date().getHours();

//     if (hour < 12) return 'Good morning';

//     if (hour < 17) return 'Good afternoon';

//     return 'Good evening';

//   };



//   // SCREEN 0: Home scroll contents

//   const renderHomeView = () => {

//     return (

//       <ScrollView

//         style={styles.scroll}

//         contentContainerStyle={styles.scrollContent}

//         showsVerticalScrollIndicator={false}

//       >

//         {/* ── Hero header: avatar + greeting + bell ── */}

//         <HeroBanner

//           source={homescreenBg}

//           height={hp(26)}

//           showBack={false}

//           gradientColors={[COLORS.heroGradientTop, 'rgba(0,50,36,0)']}

//           gradientLocations={[0.163, 1]}

//           style={styles.hero}

//         >

//           <View style={styles.topRow}>

//             <TouchableOpacity style={styles.userRow} onPress={() => setActiveTab(2)} activeOpacity={0.8}>

//               <View style={styles.avatarSmallWrapper}>

//                 <Image source={trophyImg} style={styles.avatarSmallImage} />

//               </View>

//               <View style={styles.greetingBlock}>

//                 <Text style={styles.greetingText}>{getGreeting()}</Text>

//                 <Text style={styles.userName}>{loggedInName}</Text>

//               </View>

//             </TouchableOpacity>



//             <TouchableOpacity

//               style={styles.bellBtnCircle}

//               onPress={() => navigation.navigate('Notifications')}

//               activeOpacity={0.8}

//             >

//               <AuthIcon name="bell" size={moderateScale(22)} color={COLORS.textPrimary} />

//               {unreadCount > 0 ? <View style={styles.bellUnreadDot} /> : null}

//             </TouchableOpacity>

//           </View>

//         </HeroBanner>



//         {/* ── Total Points card — overlapping the hero ── */}

//         <GlassCard style={styles.pointsCard}>

//           <View style={styles.pointsInner}>

//             <View style={styles.pointsSplitRow}>

//               <LinearGradient

//                 colors={[COLORS.statBadgeStart, COLORS.statBadgeEnd]}

//                 style={styles.pointsBadge}

//               >

//                 <AuthIcon name="zap" size={moderateScale(18)} color={COLORS.textPrimary} />

//               </LinearGradient>

//               <LinearGradient

//                 colors={[COLORS.statBadgeStart, COLORS.statBadgeEnd]}

//                 style={styles.pointsBadge}

//               >

//                 <AuthIcon name="star" size={moderateScale(18)} color={COLORS.textPrimary} />

//               </LinearGradient>

//             </View>



//             <View style={[styles.pointsSplitRow, styles.pointsValueRow]}>

//               <Text style={styles.pointsValue}>{Number(totalPoints).toLocaleString()}</Text>

//               <Text style={styles.pointsValue}>{Number(lastBest).toLocaleString()}</Text>

//             </View>



//             <View style={styles.pointsSplitRow}>

//               <Text style={styles.pointsLabel}>Total Points</Text>

//               <Text style={styles.pointsLabel}>Last Best</Text>

//             </View>

//           </View>

//         </GlassCard>



//         {/* ── Live round (resume) or Start Round CTA ── */}

//         <View style={styles.section}>

//           <GlassCard style={styles.playCard}>

//             {liveRound ? (

//               <>

//                 <View style={styles.playCardTopRow}>

//                   <View style={styles.liveBadge}>

//                     <View style={styles.liveDot} />

//                     <Text style={styles.liveText}>LIVE ROUND</Text>

//                   </View>

//                   <Text style={styles.holeCounter}>

//                     Hole {liveRound.holeIndex} / {liveRound.totalHoles}

//                   </Text>

//                 </View>



//                 <Text style={styles.courseTitle} numberOfLines={1}>

//                   {liveRound.title}

//                 </Text>



//                 <View style={styles.progressTrack}>

//                   <LinearGradient

//                     colors={[COLORS.progressStart, COLORS.progressEnd]}

//                     start={{ x: 0, y: 0 }}

//                     end={{ x: 1, y: 0 }}

//                     style={[

//                       styles.progressFill,

//                       { width: `${Math.round(liveRound.progress * 100)}%` },

//                     ]}

//                   />

//                 </View>



//                 <PrimaryPillButton

//                   title="CONTINUE ROUND"

//                   iconName="play"

//                   onPress={continueLiveRound}

//                 />

//               </>

//             ) : (

//               <>

//                 <View style={styles.liveBadge}>

//                   <View style={styles.liveDot} />

//                   <Text style={styles.liveText}>PLAY</Text>

//                 </View>



//                 <Text style={styles.courseTitle}>Practice or Challenge</Text>

//                 <Text style={styles.playSubtitle}>

//                   Create or join a tournament, then start scoring shot-by-shot.

//                 </Text>



//                 <PrimaryPillButton

//                   title="START ROUND"

//                   iconName="play"

//                   onPress={() => navigation.navigate('SelectPlayOption')}

//                 />

//               </>

//             )}

//           </GlassCard>

//         </View>



//         {/* ── Upcoming Tournaments ── */}

//         <View style={styles.section}>

//           <View style={styles.sectionHeader}>

//             <Text style={styles.sectionTitle}>Upcoming Tournament</Text>

//             <TouchableOpacity

//               onPress={() =>

//                 navigation.navigate('SelectTournament', { playMode: 'practice' })

//               }

//             >

//               <Text style={styles.seeAll}>See all</Text>

//             </TouchableOpacity>

//           </View>



//           {tournaments.length === 0 ? (

//             <Text style={styles.emptyText}>No upcoming tournaments yet.</Text>

//           ) : (

//             tournaments.map((item) => (

//               <GlassCard

//                 key={item.id}

//                 style={styles.tournamentCard}

//                 onPress={() => openTournament(item)}

//               >

//                 <Image

//                   source={trophyImg}

//                   style={styles.tournamentBgImage}

//                   resizeMode="cover"

//                 />

//                 <LinearGradient

//                   colors={[COLORS.cardOverlayTop, COLORS.cardOverlayBottom]}

//                   style={styles.tournamentOverlay}

//                   pointerEvents="none"

//                 />

//                 <View style={styles.tournamentInfo}>

//                   <Text style={styles.tournamentTitle} numberOfLines={1}>

//                     {item.title}

//                   </Text>

//                   <View style={styles.tournamentMeta}>

//                     <View style={styles.tournamentMetaItem}>

//                       <AuthIcon

//                         name="calendar"

//                         size={moderateScale(14)}

//                         color={COLORS.ctaGlow}

//                       />

//                       <Text style={styles.tournamentMetaText}>{item.date}</Text>

//                     </View>

//                     <View style={styles.tournamentMetaItem}>

//                       <AuthIcon

//                         name="map-pin"

//                         size={moderateScale(14)}

//                         color={COLORS.ctaGlow}

//                       />

//                       <Text style={styles.tournamentMetaText} numberOfLines={1}>

//                         {item.location}

//                       </Text>

//                     </View>

//                     {item.source === 'invited' ? null : (

//                       <View style={styles.tournamentMetaItem}>

//                         <AuthIcon

//                           name="users"

//                           size={moderateScale(14)}

//                           color={COLORS.ctaGlow}

//                         />

//                         <Text style={styles.tournamentMetaText}>

//                           {item.joined} joined

//                         </Text>

//                       </View>

//                     )}

//                   </View>

//                 </View>



//                 <View style={styles.tournamentBadges}>

//                   {item.playMode ? (

//                     <View

//                       style={[

//                         styles.modeBadge,

//                         item.playMode === 'CHALLENGE'

//                           ? styles.modeBadgeChallenge

//                           : styles.modeBadgePractice,

//                       ]}

//                     >

//                       <Text

//                         style={[

//                           styles.modeBadgeText,

//                           item.playMode === 'CHALLENGE'

//                             ? styles.modeBadgeTextChallenge

//                             : styles.modeBadgeTextPractice,

//                         ]}

//                       >

//                         {item.playMode === 'CHALLENGE' ? 'Challenge' : 'Practice'}

//                       </Text>

//                     </View>

//                   ) : null}

//                   {item.source === 'invited' ? (

//                     <View style={styles.invitedBadge}>

//                       <Text style={styles.invitedBadgeText}>Invited</Text>

//                     </View>

//                   ) : null}

//                 </View>

//               </GlassCard>

//             ))

//           )}

//         </View>



//         {/* Bottom space so cards scroll completely above floating bottom tab bar */}

//         <View style={{ height: hp(18) }} />

//       </ScrollView>

//     );

//   };



//   // SCREEN 2: Play Tab View

//   const renderPlayView = () => {

//     return (

//       <View style={styles.tabContentContainer}>

//         <HeroBanner source={homescreenBg} height={hp(24)} showBack={false} overlayOpacity={0.45}>

//           <Text style={styles.bannerTitle}>Play Golf</Text>

//         </HeroBanner>



//         <View style={styles.placeholderBody}>

//           <DotPattern color={COLORS.dotPattern} />

//           <View style={styles.placeholderIconWrapper}>

//             <AuthIcon name="golf-play" size={moderateScale(70)} />

//           </View>

//           <Text style={styles.placeholderTitle}>Start a New Round</Text>

//           <Text style={styles.placeholderText}>

//             Ready to hit the course? Track your scores, analyze yardages, and play with friends in real-time.

//           </Text>



//           <PrimaryPillButton

//             title="START ROUND"

//             style={styles.placeholderBtn}

//             onPress={() => navigation.navigate('SelectPlayOption')}

//           />

//         </View>

//       </View>

//     );

//   };



//   // SCREEN 3: Rank Tab View

//   const renderRankView = () => {

//     return (

//       <View style={styles.tabContentContainer}>

//         <HeroBanner source={homescreenBg} height={hp(24)} showBack={false} overlayOpacity={0.45}>

//           <Text style={styles.bannerTitle}>Leaderboard</Text>

//         </HeroBanner>



//         <View style={styles.placeholderBody}>

//           <DotPattern color={COLORS.dotPattern} />

//           <View style={styles.placeholderIconWrapper}>

//             <AuthIcon name="trophy" size={moderateScale(56)} color={COLORS.cta} />

//           </View>

//           <Text style={styles.placeholderTitle}>Global Rankings</Text>

//           <Text style={styles.placeholderText}>

//             See where you stand against players worldwide. Join tournaments to climb up the Leaderboard!

//           </Text>



//           <PrimaryPillButton title="VIEW LEADERBOARD" style={styles.placeholderBtn} />

//         </View>

//       </View>

//     );

//   };



//   // SCREEN 4: Profile Tab View

//   const renderProfileView = () => {

//     return <ProfileScreen navigation={navigation} />;

//   };



//   const renderActiveTabContent = () => {

//     switch (activeTab) {

//       case 0:

//         return renderHomeView();

//       case 2:

//         return renderProfileView();

//       default:

//         // Center Play tab navigates away; never render missing TournamentScreen

//         return renderHomeView();

//     }

//   };



//   // Dynamic absolute bottom offset mapping Android system bars / iOS Safe Areas

//   const tabBottomOffset = insets.bottom > 0 ? insets.bottom + hp(0.8) : hp(2.8);



//   return (

//     <ScreenScaffold edges={[]} showDots={false}>

//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />



//       {/* Main Tab View Router Container */}

//       <View style={{ flex: 1 }}>

//         {renderActiveTabContent()}

//       </View>



//       {/* ── Bottom Tab Bar ── */}

//       {!hideTabBar && (

//         <View style={[styles.tabBar, { bottom: tabBottomOffset }]}>

//           {TAB_ITEMS.map((tab, index) => {

//             const isActive = activeTab === index;

//             if (tab.isCenter) {

//               return (

//                 <TouchableOpacity

//                   key={index}

//                   style={styles.tabCenterBtn}

//                   onPress={() => navigation.navigate('SelectPlayOption')}

//                   activeOpacity={0.85}

//                 >

//                   <AuthIcon

//                     name={tab.iconName}

//                     size={moderateScale(46)}

//                   />

//                 </TouchableOpacity>

//               );

//             }

//             return (

//               <TouchableOpacity

//                 key={index}

//                 style={styles.tabItem}

//                 onPress={() => setActiveTab(index)}

//                 activeOpacity={0.7}

//               >

//                 <View style={isActive ? styles.activeIconCircle : styles.inactiveIconCircle}>

//                   <AuthIcon

//                     name={tab.iconName}

//                     size={moderateScale(28)}

//                     color={isActive ? COLORS.cta : COLORS.white}

//                   />

//                 </View>

//               </TouchableOpacity>

//             );

//           })}

//         </View>

//       )}

//     </ScreenScaffold>

//   );

// };



// const styles = StyleSheet.create({

//   scroll: {

//     flex: 1,

//   },

//   scrollContent: {

//     flexGrow: 1,

//     paddingBottom: hp(18),

//   },



//   // ── Hero header ─────────────────────────────────────

//   hero: {

//     justifyContent: 'flex-start',

//     paddingTop: Platform.OS === 'ios' ? hp(7) : hp(5.5),

//     paddingHorizontal: wp(5),

//   },

//   topRow: {

//     flexDirection: 'row',

//     justifyContent: 'space-between',

//     alignItems: 'center',

//   },

//   userRow: {

//     flex: 1,

//     flexDirection: 'row',

//     alignItems: 'center',

//     gap: wp(3),

//   },

//   avatarSmallWrapper: {

//     width: moderateScale(52),

//     height: moderateScale(52),

//     borderRadius: moderateScale(26),

//     borderWidth: 2,

//     borderColor: COLORS.avatarRing,

//     backgroundColor: COLORS.white,

//     overflow: 'hidden',

//     shadowColor: COLORS.black,

//     shadowOffset: { width: 0, height: 4 },

//     shadowOpacity: 0.3,

//     shadowRadius: 8,

//     elevation: 5,

//   },

//   avatarSmallImage: {

//     width: '100%',

//     height: '100%',

//     borderRadius: moderateScale(26),

//   },

//   greetingBlock: {

//     flex: 1,

//     gap: hp(0.2),

//   },

//   greetingText: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(14),

//     color: COLORS.white,

//   },

//   userName: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(20),

//     color: COLORS.white,

//   },

//   bellBtnCircle: {

//     width: moderateScale(48),

//     height: moderateScale(48),

//     borderRadius: moderateScale(24),

//     backgroundColor: COLORS.white,

//     borderWidth: 1,

//     borderColor: COLORS.glassBorder,

//     justifyContent: 'center',

//     alignItems: 'center',

//     shadowColor: COLORS.black,

//     shadowOffset: { width: 0, height: 4 },

//     shadowOpacity: 0.25,

//     shadowRadius: 5,

//     elevation: 6,

//   },

//   bellUnreadDot: {

//     position: 'absolute',

//     top: 2,

//     right: 2,

//     width: moderateScale(10),

//     height: moderateScale(10),

//     borderRadius: moderateScale(5),

//     backgroundColor: COLORS.cta,

//     borderWidth: 1.5,

//     borderColor: COLORS.white,

//   },



//   // ── Total Points card (overlapping hero) ────────────

//   pointsCard: {

//     marginHorizontal: wp(5),

//     marginTop: -hp(6),

//     borderRadius: moderateScale(30),

//     zIndex: 10,

//   },

//   pointsInner: {

//     padding: moderateScale(16),

//   },

//   pointsSplitRow: {

//     flexDirection: 'row',

//     alignItems: 'center',

//     justifyContent: 'space-between',

//   },

//   pointsValueRow: {

//     marginTop: hp(1.4),

//   },

//   pointsBadge: {

//     width: moderateScale(36),

//     height: moderateScale(36),

//     borderRadius: moderateScale(18),

//     justifyContent: 'center',

//     alignItems: 'center',

//     shadowColor: COLORS.statBadgeEnd,

//     shadowOffset: { width: 0, height: 4 },

//     shadowOpacity: 0.35,

//     shadowRadius: 6,

//     elevation: 3,

//   },

//   pointsValue: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(28),

//     lineHeight: fontSize(38),

//     color: COLORS.textPrimary,

//     letterSpacing: -0.5,

//   },

//   pointsLabel: {

//     fontFamily: FONTS.semiBold,

//     fontSize: fontSize(12),

//     color: COLORS.statLabel,

//   },



//   // ── Sections ────────────────────────────────────────

//   section: {

//     paddingHorizontal: wp(5),

//     marginTop: hp(2.5),

//   },

//   sectionHeader: {

//     flexDirection: 'row',

//     justifyContent: 'space-between',

//     alignItems: 'center',

//     marginBottom: hp(1.5),

//   },

//   sectionTitle: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(18),

//     color: COLORS.textPrimary,

//     letterSpacing: -0.4,

//   },

//   seeAll: {

//     fontFamily: FONTS.semiBold,

//     fontSize: fontSize(14),

//     color: COLORS.textLabel,

//   },

//   emptyText: {

//     fontFamily: FONTS.regular,

//     fontSize: fontSize(13),

//     color: COLORS.textMuted,

//   },



//   // ── Play / Live round card ───────────────────────────

//   playCard: {

//     padding: moderateScale(20),

//     borderRadius: moderateScale(30),

//   },

//   playCardTopRow: {

//     flexDirection: 'row',

//     alignItems: 'center',

//     justifyContent: 'space-between',

//   },

//   liveBadge: {

//     flexDirection: 'row',

//     alignItems: 'center',

//     alignSelf: 'flex-start',

//     backgroundColor: COLORS.textPrimary,

//     borderRadius: moderateScale(999),

//     paddingHorizontal: moderateScale(12),

//     paddingVertical: moderateScale(5),

//     gap: wp(1.5),

//   },

//   liveDot: {

//     width: moderateScale(7),

//     height: moderateScale(7),

//     borderRadius: moderateScale(4),

//     backgroundColor: COLORS.cta,

//   },

//   liveText: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(12),

//     color: COLORS.cta,

//     letterSpacing: 0.3,

//   },

//   holeCounter: {

//     fontFamily: FONTS.regular,

//     fontSize: fontSize(13),

//     color: COLORS.textLabel,

//   },

//   courseTitle: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(18),

//     color: COLORS.textPrimary,

//     letterSpacing: -0.4,

//     marginTop: hp(1.4),

//   },

//   progressTrack: {

//     height: moderateScale(8),

//     borderRadius: moderateScale(999),

//     backgroundColor: COLORS.progressTrack,

//     overflow: 'hidden',

//     marginTop: hp(1.4),

//     marginBottom: hp(1.9),

//   },

//   progressFill: {

//     height: '100%',

//     borderRadius: moderateScale(999),

//   },

//   playSubtitle: {

//     fontFamily: FONTS.regular,

//     fontSize: fontSize(13),

//     color: COLORS.textMuted,

//     lineHeight: fontSize(19),

//     marginTop: hp(0.5),

//     marginBottom: hp(2),

//   },



//   // ── Tournament Card ──────────────────────────────────

//   tournamentCard: {

//     height: hp(21),

//     borderRadius: moderateScale(30),

//     borderWidth: 0,

//     marginBottom: hp(1.6),

//     shadowColor: COLORS.textPrimary,

//     shadowOffset: { width: 0, height: 5 },

//     shadowOpacity: 0.8,

//     shadowRadius: 8,

//     elevation: 6,

//   },

//   tournamentBgImage: {

//     ...StyleSheet.absoluteFillObject,

//     width: '100%',

//     height: '100%',

//   },

//   tournamentOverlay: {

//     ...StyleSheet.absoluteFillObject,

//   },

//   tournamentInfo: {

//     position: 'absolute',

//     bottom: moderateScale(16),

//     left: moderateScale(16),

//     right: moderateScale(16),

//   },

//   tournamentTitle: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(22),

//     color: COLORS.white,

//     letterSpacing: -0.44,

//   },

//   tournamentBadges: {

//     position: 'absolute',

//     top: moderateScale(14),

//     right: moderateScale(14),

//     flexDirection: 'row',

//     alignItems: 'center',

//     gap: wp(1.5),

//   },

//   modeBadge: {

//     borderRadius: moderateScale(8),

//     paddingHorizontal: wp(2.2),

//     paddingVertical: hp(0.35),

//     borderWidth: 1,

//   },

//   modeBadgePractice: {

//     backgroundColor: 'rgba(255, 255, 255, 0.18)',

//     borderColor: 'rgba(255, 255, 255, 0.55)',

//   },

//   modeBadgeChallenge: {

//     backgroundColor: 'rgba(188, 255, 0, 0.2)',

//     borderColor: COLORS.cta,

//   },

//   modeBadgeText: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(10),

//     letterSpacing: 0.3,

//     textTransform: 'uppercase',

//   },

//   modeBadgeTextPractice: {

//     color: COLORS.white,

//   },

//   modeBadgeTextChallenge: {

//     color: COLORS.cta,

//   },

//   invitedBadge: {

//     backgroundColor: COLORS.cta,

//     borderRadius: moderateScale(8),

//     paddingHorizontal: wp(2.2),

//     paddingVertical: hp(0.35),

//   },

//   invitedBadgeText: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(10),

//     color: COLORS.ctaText,

//     letterSpacing: 0.3,

//     textTransform: 'uppercase',

//   },

//   tournamentMeta: {

//     flexDirection: 'row',

//     flexWrap: 'wrap',

//     alignItems: 'center',

//     gap: moderateScale(16),

//     marginTop: hp(1),

//   },

//   tournamentMetaItem: {

//     flexDirection: 'row',

//     alignItems: 'center',

//     gap: moderateScale(4),

//     flexShrink: 1,

//   },

//   tournamentMetaText: {

//     fontFamily: FONTS.medium,

//     fontSize: fontSize(12),

//     color: 'rgba(255,255,255,0.9)',

//   },



//   // ── Bottom Tab Bar ───────────────────────────────────

//   tabBar: {

//     position: 'absolute',

//     bottom: hp(2),

//     left: wp(5),

//     right: wp(5),

//     height: moderateScale(74),

//     backgroundColor: COLORS.navSurface,

//     borderRadius: moderateScale(40),

//     borderWidth: 1,

//     borderColor: COLORS.white,

//     flexDirection: 'row',

//     alignItems: 'center',

//     justifyContent: 'space-around',

//     paddingHorizontal: moderateScale(12),

//     shadowColor: '#071A12',

//     shadowOffset: { width: 0, height: 20 },

//     shadowOpacity: 0.4,

//     shadowRadius: 25,

//     elevation: 10,

//   },

//   tabItem: {

//     flex: 1,

//     alignItems: 'center',

//     justifyContent: 'center',

//   },

//   activeIconCircle: {

//     width: moderateScale(56),

//     height: moderateScale(56),

//     borderRadius: moderateScale(28),

//     backgroundColor: 'rgba(188, 255, 0, 0.3)',

//     justifyContent: 'center',

//     alignItems: 'center',

//   },

//   inactiveIconCircle: {

//     width: moderateScale(56),

//     height: moderateScale(56),

//     justifyContent: 'center',

//     alignItems: 'center',

//   },

//   tabCenterBtn: {

//     width: moderateScale(72),

//     height: moderateScale(72),

//     borderRadius: moderateScale(36),

//     backgroundColor: COLORS.cta,

//     borderWidth: 1,

//     borderColor: COLORS.navSurface,

//     justifyContent: 'center',

//     alignItems: 'center',

//     marginTop: -hp(3.8),

//     shadowColor: COLORS.ctaGlow,

//     shadowOffset: { width: 0, height: 8 },

//     shadowOpacity: 0.45,

//     shadowRadius: 12,

//     elevation: 12,

//   },



//   // ── Tab View Placeholder Styles ──

//   tabContentContainer: {

//     flex: 1,

//   },

//   bannerTitle: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(28),

//     color: COLORS.white,

//     paddingHorizontal: wp(5),

//     paddingBottom: hp(3),

//   },

//   placeholderBody: {

//     flex: 1,

//     alignItems: 'center',

//     justifyContent: 'center',

//     paddingHorizontal: wp(8),

//   },

//   placeholderIconWrapper: {

//     width: moderateScale(110),

//     height: moderateScale(110),

//     borderRadius: moderateScale(55),

//     backgroundColor: COLORS.white,

//     borderWidth: 2,

//     borderColor: COLORS.glassBorder,

//     justifyContent: 'center',

//     alignItems: 'center',

//     marginBottom: hp(3.5),

//     shadowColor: COLORS.textPrimary,

//     shadowOffset: { width: 0, height: 4 },

//     shadowOpacity: 0.15,

//     shadowRadius: 8,

//     elevation: 5,

//   },

//   placeholderTitle: {

//     fontFamily: FONTS.bold,

//     fontSize: fontSize(22),

//     color: COLORS.textPrimary,

//     marginBottom: hp(1.2),

//     textAlign: 'center',

//   },

//   placeholderText: {

//     fontFamily: FONTS.regular,

//     fontSize: fontSize(13),

//     color: COLORS.textMuted,

//     textAlign: 'center',

//     lineHeight: fontSize(20),

//     marginBottom: hp(4),

//   },

//   placeholderBtn: {

//     width: wp(70),

//   },

// });



// export default HomeScreen;



// =============================================================================
// ACTIVE HOMESCREEN COMPONENT
// Logics & Functionality from Uncommented Code (Block 1)
// UI & Styling from Commented Code (Block 2)
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getStorageData } from '../../storage/storage';
import { formatDisplayDate } from '../../utils/dateUtils';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const editIcon = require('../../assets/Images/edit.png');

import AuthIcon from '../../components/common/AuthIcon';
import DotPattern from '../../components/common/DotPattern';
import ProfileScreen from '../Profile/ProfileScreen';
import { getTournamentsApi } from '../../services/homeService';
import { getTournamentTeamsApi } from '../../services/teamService';
import { getPlayerGameHistoryApi, getPlayerProfileApi, getTournamentLeaderboardApi } from '../../services/playerService';
import { getUnreadNotificationsCountApi } from '../../services/notificationService';
import {
  getStartGameReadinessApi,
  getGameSessionApi,
} from '../../services/playService';
import { shareTournamentLink } from '../../utils/shareUtils';
import {
  classifyTournamentPlay,
  groupGameHistoryByTournament,
  inProgressActivityMs,
  isChallengePlayMode,
  isChallengeLocked,
  leaderboardIndicatesStarted,
  unwrapReadiness,
} from '../../utils/playProgress';

// ─── Bottom Tab Icons ────────────────────────────────────────────────────────
const TAB_ITEMS = [
  { iconName: 'home', label: 'Home' },
  { iconName: 'golf-play', label: 'Play', isCenter: true },
  { iconName: 'user', label: 'Profile' },
];

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [hideTabBar, setHideTabBar] = useState(false);
  const insets = useSafeAreaInsets();

  const reduxUser = useSelector((state) => state.auth.user);
  const [userInfo, setUserInfo] = useState(reduxUser);
  const [tournaments, setTournaments] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [lastBest, setLastBest] = useState(0);
  const [liveRound, setLiveRound] = useState(null);

  useEffect(() => {
    if (reduxUser) {
      setUserInfo(reduxUser);
    } else {
      getStorageData('USER_DATA').then((data) => {
        if (data) {
          const userObj = data?.user || data?.data?.user || data?.data || data;
          setUserInfo(userObj);
        }
      });
    }
  }, [reduxUser]);

  const getTournamentHeadCount = (item) => {
    if (!item) return 0;
    if (typeof item.memberCount === 'number' && item.memberCount > 0) return item.memberCount;
    if (typeof item.totalMembers === 'number' && item.totalMembers > 0) return item.totalMembers;
    if (typeof item.joinedPlayersCount === 'number' && item.joinedPlayersCount > 0) return item.joinedPlayersCount;
    if (typeof item.playerCount === 'number' && item.playerCount > 0) return item.playerCount;
    if (typeof item.totalPlayers === 'number' && item.totalPlayers > 0) return item.totalPlayers;

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

    const playersList = item.players || item.members || item.participants || item.userList;
    if (Array.isArray(playersList) && playersList.length > 0) {
      return playersList.length;
    }

    if (typeof item.joinedCount === 'number' && item.joinedCount > 0) return item.joinedCount;
    if (typeof item.joined === 'number' && item.joined > 0) return item.joined;
    if (typeof item.acceptedCount === 'number' && item.acceptedCount > 0) return item.acceptedCount;

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

  const normalizeTournament = (t, idx, source) => {
    const rawMode = String(t.playMode || t.mode || '').toUpperCase();
    const playMode = rawMode.includes('CHALLENGE')
      ? 'CHALLENGE'
      : rawMode.includes('PRACTICE')
        ? 'PRACTICE'
        : null;

    const headCount = getTournamentHeadCount(t);
    const joinedVal = headCount > 0 ? headCount : (t.joined || t.teamCount || t.playerCount || '—');

    return {
      id: String(t.id || t._id || `${source}-${idx}`),
      title: t.name || t.title || 'Tournament',
      startDateMs: t.startDate ? new Date(t.startDate).getTime() : Number.MAX_SAFE_INTEGER,
      date: t.startDate
        ? formatDisplayDate(t.startDate)
        : (t.date ? formatDisplayDate(t.date) : 'TBD'),
      location: t.golfCourseName || t.clubName || t.location || t.city || '',
      joined: joinedVal,
      source,
      playMode,
      tournament: {
        ...t,
        id: t.id || t._id,
        name: t.name || t.title,
        title: t.title || t.name,
        playMode: playMode || t.playMode,
        creatorUserId: t.creatorUserId || t.creatorId || t.createdBy,
      },
    };
  };

  const extractTournamentList = (res) => {
    const raw =
      res?.tournaments || res?.data?.tournaments || res?.data || (Array.isArray(res) ? res : []);
    return Array.isArray(raw) ? raw : [];
  };

  const buildLiveRoundCard = useCallback(async (item) => {
    const tournamentName =
      item.tournament?.name || item.tournament?.title || item.title || '';
    const playMode = item.playMode;
    const nextGameNumber = item.nextGameNumber;
    const numberOfGames = item.numberOfGames || 1;
    const completedCount = item.completedCount || 0;

    if (item.hasActiveSession && item.activeSession?.id) {
      const session = item.activeSession;
      const sessionRes = await getGameSessionApi(item.tournament.id, session.id)
        .then((res) => res?.play || res?.data?.play || res?.data || res)
        .catch(() => null);

      const holeStart = Number(sessionRes?.holeStart) || 1;
      const holeEnd = Number(sessionRes?.holeEnd) || 18;
      const totalHoles = Math.max(1, holeEnd - holeStart + 1);
      const holeIndex = Math.min(
        totalHoles,
        Math.max(1, (Number(session.currentHole) || holeStart) - holeStart + 1),
      );
      const courseName = sessionRes?.golfCourseName || item.location || item.title;
      const nineLabel =
        totalHoles === 9 ? (holeStart <= 9 ? 'Front 9' : 'Back 9') : `${totalHoles} holes`;

      return {
        tournament: item.tournament,
        tournamentName,
        playMode,
        sessionId: session.id,
        gameNumber: Number(session.gameNumber) || nextGameNumber || 1,
        nextGameNumber,
        numberOfGames,
        hasActiveSession: true,
        title: courseName ? `${courseName} — ${nineLabel}` : nineLabel,
        holeLabel: `Hole ${holeIndex} / ${totalHoles}`,
        holeIndex,
        totalHoles,
        progress: holeIndex / totalHoles,
        badge: 'LIVE ROUND',
        actionLabel: `CONTINUE GAME ${Number(session.gameNumber) || nextGameNumber || 1}`,
      };
    }

    return {
      tournament: item.tournament,
      tournamentName,
      playMode,
      sessionId: null,
      gameNumber: nextGameNumber || 1,
      nextGameNumber,
      numberOfGames,
      hasActiveSession: false,
      title:
        nextGameNumber != null
          ? `Start Game ${nextGameNumber} of ${numberOfGames}`
          : item.location || item.title,
      holeLabel: `Game ${completedCount} / ${numberOfGames} done`,
      holeIndex: completedCount,
      totalHoles: numberOfGames,
      progress: numberOfGames > 0 ? completedCount / numberOfGames : 0,
      badge: item.gameStarted && !item.hasActiveSession ? 'GAME STARTED' : 'IN PROGRESS',
      actionLabel:
        nextGameNumber != null ? `START GAME ${nextGameNumber}` : 'CONTINUE',
    };
  }, []);

  const loadHomeData = useCallback(async () => {
    try {
      const [mineRes, invitedRes, playedRes, historyRes, unreadRes, profileRes] = await Promise.all([
        getTournamentsApi({ scope: 'mine', limit: 20 }).catch(() => null),
        getTournamentsApi({ scope: 'invited', limit: 20 }).catch(() => null),
        getTournamentsApi({ scope: 'played', limit: 20 }).catch(() => null),
        getPlayerGameHistoryApi().catch(() => null),
        getUnreadNotificationsCountApi().catch(() => null),
        getPlayerProfileApi().catch(() => null),
      ]);

      const player =
        profileRes?.player || profileRes?.data?.player || profileRes?.data || profileRes;
      if (player?.totalPoints != null) {
        setTotalPoints(Number(player.totalPoints) || 0);
      }

      const byId = new Map();
      extractTournamentList(mineRes).forEach((t, idx) => {
        const item = normalizeTournament(t, idx, 'mine');
        byId.set(item.id, item);
      });
      extractTournamentList(invitedRes).forEach((t, idx) => {
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

        if (isPending) return;

        const item = normalizeTournament(t, idx, 'invited');
        if (!byId.has(item.id)) byId.set(item.id, item);
      });
      extractTournamentList(playedRes).forEach((t, idx) => {
        const item = normalizeTournament(t, idx, 'played');
        if (!byId.has(item.id)) byId.set(item.id, item);
      });

      const history =
        historyRes?.history || historyRes?.data?.history || historyRes?.data || (Array.isArray(historyRes) ? historyRes : []);
      const historyList = Array.isArray(history) ? history : [];

      const merged = Array.from(byId.values()).sort(
        (a, b) => a.startDateMs - b.startDateMs,
      );

      const readinessById = new Map();
      const idsToCheck = new Set();
      merged.forEach((item) => {
        if (item.id && String(item.id).includes('-')) idsToCheck.add(String(item.id));
      });
      historyList.forEach((h) => {
        const hid = h.tournamentId || h.tournament?.id || h.tournament?._id;
        if (hid && String(hid).includes('-')) idsToCheck.add(String(hid));
      });

      const teamsById = new Map();

      await Promise.all([
        ...Array.from(idsToCheck).map((id) =>
          getStartGameReadinessApi(id)
            .then((res) => readinessById.set(id, unwrapReadiness(res)))
            .catch(() => readinessById.set(id, null)),
        ),
        ...Array.from(idsToCheck).map((id) =>
          getTournamentTeamsApi(id)
            .then((res) => teamsById.set(id, res))
            .catch(() => teamsById.set(id, null)),
        ),
      ]);

      const formattedHomeTournaments = merged.map((item) => {
        const readinessObj = readinessById.get(String(item.id));
        const teamsObj = teamsById.get(String(item.id));
        const play = classifyTournamentPlay(item.tournament, readinessObj);
        const isLocked =
          item.tournament?.challengeLocked === true ||
          item.challengeLocked === true ||
          isChallengeLocked(item.tournament || item, readinessObj) ||
          isChallengeLocked(item.tournament || item, teamsObj);
        return {
          ...item,
          challengeLocked: isLocked,
          shareLinkEnabled: item.tournament?.shareLinkEnabled,
          joinUrl: item.tournament?.joinUrl,
          joinToken: item.tournament?.joinToken,
          joinDeepLink: item.tournament?.joinDeepLink,
          isInProgress: play.isInProgress,
          isCompleted: play.isCompleted,
          hasActiveSession: play.hasActiveSession,
          activeSession: play.activeSession,
          nextGameNumber: play.nextGameNumber,
          numberOfGames: play.numberOfGames,
          completedCount: play.completedCount,
          completedGameNumbers: play.completedGameNumbers,
          gameStarted: play.gameStarted,
        };
      });

      // If Team B already played but this user has no session, readiness may
      // omit gameStarted on an older API. Leaderboard still shows their scores.
      await Promise.all(
        formattedHomeTournaments
          .filter((item) => !item.isInProgress && !item.isCompleted)
          .map(async (item) => {
            if (!item.id || !String(item.id).includes('-')) return;
            try {
              const board = await getTournamentLeaderboardApi(item.id, {
                gameNumber: 1,
                view: 'game',
              });
              if (!leaderboardIndicatesStarted(board)) return;
              const play = classifyTournamentPlay(
                item.tournament,
                readinessById.get(String(item.id)),
                { anyonePlayed: true },
              );
              item.isInProgress = play.isInProgress;
              item.gameStarted = true;
              item.nextGameNumber = play.nextGameNumber || item.nextGameNumber || 1;
              item.numberOfGames = play.numberOfGames;
            } catch (err) {
              console.log('Home started-game probe note:', err);
            }
          }),
      );

      const inProgressItems = formattedHomeTournaments
        .filter((item) => item.isInProgress)
        .sort((a, b) => inProgressActivityMs(b, historyList) - inProgressActivityMs(a, historyList));

      setTournaments(formattedHomeTournaments);

      if (inProgressItems.length === 0) {
        setLiveRound(null);
      } else {
        buildLiveRoundCard(inProgressItems[0])
          .then(setLiveRound)
          .catch(() => setLiveRound(null));
      }

      const completedOnly = historyList.filter((h) => {
        const hid = String(h.tournamentId || h.tournament?.id || h.tournament?._id || '');
        const matched = byId.get(hid);
        const play = classifyTournamentPlay(
          matched?.tournament || { id: hid, numberOfGames: h.numberOfGames },
          readinessById.get(hid),
        );
        return play.isCompleted;
      });
      setCompletedHistory(groupGameHistoryByTournament(completedOnly));
      setGameHistory(historyList);
      const best = historyList.reduce((max, h) => {
        if (isChallengePlayMode(h.playMode, h.tournament?.playMode)) return max;
        const s = Number(h.score);
        return Number.isFinite(s) ? Math.max(max, s) : max;
      }, 0);
      setLastBest(best);

      const count =
        unreadRes?.unreadCount ??
        unreadRes?.count ??
        unreadRes?.data?.unreadCount ??
        unreadRes?.data?.count ??
        0;
      setUnreadCount(Number(count) || 0);
    } catch (err) {
      console.log('Home load error:', err);
    }
  }, [buildLiveRoundCard]);

  useFocusEffect(
    React.useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const openTournament = (item) => {
    const playMode =
      item.playMode === 'CHALLENGE'
        ? 'challenge'
        : item.playMode === 'PRACTICE'
          ? 'practice'
          : item.tournament?.playMode || 'practice';

    if (item.isInProgress && item.activeSession?.id) {
      navigation.navigate('ActiveGame', {
        tournament: item.tournament,
        sessionId: item.activeSession.id,
        gameNumber: Number(item.activeSession.gameNumber) || item.nextGameNumber || 1,
        playMode,
      });
      return;
    }

    if (item.isInProgress) {
      navigation.navigate('SelectGame', {
        tournament: item.tournament,
        playMode,
        gameNumber: item.nextGameNumber || 1,
        selectedGameIndex: Math.max(0, (item.nextGameNumber || 1) - 1),
      });
      return;
    }

    if (item.isCompleted || item.source === 'played') {
      navigation.navigate('Leaderboard', {
        tournament: item.tournament,
        playMode,
        gameNumber: Number(item.activeSession?.gameNumber) || item.nextGameNumber || 1,
      });
      return;
    }

    if (
      item.source === 'invited' ||
      item.challengeLocked === true ||
      item.tournament?.challengeLocked === true ||
      isChallengeLocked(item.tournament || item)
    ) {
      navigation.navigate('SelectGame', {
        tournament: item.tournament,
        playMode,
        gameNumber: item.nextGameNumber || 1,
        selectedGameIndex: Math.max(0, (item.nextGameNumber || 1) - 1),
      });
      return;
    }

    navigation.navigate('ConfigureGames', {
      tournament: item.tournament,
      playMode,
      isCreator: true,
    });
  };

  const continueLiveRound = () => {
    if (!liveRound) return;
    const playMode = liveRound.playMode === 'CHALLENGE' ? 'challenge' : 'practice';
    if (liveRound.sessionId) {
      navigation.navigate('ActiveGame', {
        tournament: liveRound.tournament,
        sessionId: liveRound.sessionId,
        gameNumber: liveRound.gameNumber,
        playMode,
      });
      return;
    }
    navigation.navigate('SelectGame', {
      tournament: liveRound.tournament,
      playMode,
      gameNumber: liveRound.nextGameNumber || liveRound.gameNumber || 1,
      selectedGameIndex: Math.max(0, (liveRound.nextGameNumber || liveRound.gameNumber || 1) - 1),
    });
  };

  const rawUser = userInfo?.user || userInfo?.data?.user || userInfo;
  const currentUserId = rawUser?.id || rawUser?._id || rawUser?.userId;
  const getFullName = (u) => {
    if (!u) return 'User';
    if (u.firstName || u.lastName) {
      const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      if (full) return full;
    }
    const n = u.displayName || u.name || u.fullName;
    if (n) {
      if (u.lastName && !n.toLowerCase().includes(u.lastName.toLowerCase())) {
        return `${n} ${u.lastName}`.trim();
      }
      return n;
    }
    if (u.username) return u.username;
    if (u.email) return u.email.split('@')[0];
    return 'User';
  };
  const loggedInName = getFullName(rawUser);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // SCREEN 0: Home scroll contents
  const renderHomeView = () => {
    const upcomingTournaments = tournaments
      .filter((item) => !item.isInProgress && !item.isCompleted)
      .slice(0, 5);

    return (
      <ScrollView
        style={activeStyles.scroll}
        contentContainerStyle={activeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header with BG Image ── */}
        <ImageBackground source={homescreenBg} style={activeStyles.header} resizeMode="cover">
          <View style={activeStyles.headerOverlay} />

          {/* Top Row: Avatar + Greeting + Bell */}
          <View style={activeStyles.topRow}>
            <TouchableOpacity style={activeStyles.userRow} onPress={() => setActiveTab(2)} activeOpacity={0.8}>
              <View style={activeStyles.avatarSmallWrapper}>
                <Image source={trophyImg} style={activeStyles.avatarSmallImage} />
              </View>
              <View style={activeStyles.greetingBlock}>
                <Text style={activeStyles.greetingText}>{getGreeting()}</Text>
                <Text style={activeStyles.userName}>{loggedInName}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={activeStyles.bellBtnCircle}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <AuthIcon name="bell" size={moderateScale(20)} color="#093A24" />
              {unreadCount > 0 ? <View style={activeStyles.bellUnreadDot} /> : null}
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* ── Figma Points Card — overlapping the header ── */}
        <View style={activeStyles.pointsCard}>
          {/* Left Block: Total Points */}
          <View style={activeStyles.pointsColumn}>
            <View style={activeStyles.pointsBadge}>
              <AuthIcon name="zap" size={moderateScale(18)} color="#093A24" />
            </View>
            <Text style={activeStyles.pointsValue}>{Number(totalPoints).toLocaleString()}</Text>
            <Text style={activeStyles.pointsLabel}>Total Points</Text>
          </View>

          {/* Right Block: Last Best */}
          <View style={[activeStyles.pointsColumn, { alignItems: 'flex-end' }]}>
            <View style={activeStyles.pointsBadge}>
              <AuthIcon name="star" size={moderateScale(18)} color="#093A24" />
            </View>
            <Text style={activeStyles.pointsValue}>{Number(lastBest).toLocaleString()}</Text>
            <Text style={activeStyles.pointsLabel}>Last Best</Text>
          </View>
        </View>

        {/* ── Live Round / Create Tournament Card ── */}
        {(liveRound || upcomingTournaments.length === 0) ? (
          <View style={activeStyles.section}>
            {liveRound ? (
              <View style={activeStyles.sectionHeader}>
                <Text style={activeStyles.sectionTitle}>In Progress Games</Text>
                <TouchableOpacity onPress={() => navigation.navigate('InProgressGames')}>
                  <Text style={activeStyles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={activeStyles.liveCard}>
              {liveRound ? (
                <>
                  <View style={activeStyles.liveTopRow}>
                    <View style={activeStyles.liveBadge}>
                      <View style={activeStyles.liveDot} />
                      <Text style={activeStyles.liveText}>{liveRound.badge || 'LIVE ROUND'}</Text>
                    </View>
                    <Text style={activeStyles.holeText}>
                      {liveRound.holeLabel || `Hole ${liveRound.holeIndex} / ${liveRound.totalHoles}`}
                    </Text>
                  </View>

                  {liveRound.tournamentName ? (
                    <Text style={activeStyles.liveTournamentName} numberOfLines={1}>
                      {liveRound.tournamentName}
                    </Text>
                  ) : null}

                  <Text
                    style={[
                      activeStyles.courseTitle,
                      liveRound.tournamentName ? activeStyles.courseSubtitle : null,
                    ]}
                    numberOfLines={1}
                  >
                    {liveRound.title}
                  </Text>

                  <View style={activeStyles.progressBarBg}>
                    <View
                      style={[
                        activeStyles.progressBarFill,
                        { width: `${Math.round(liveRound.progress * 100)}%` },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={activeStyles.continueRoundBtn}
                    onPress={continueLiveRound}
                    activeOpacity={0.85}
                  >
                    <Text style={activeStyles.continueRoundIcon}>▶</Text>
                    <Text style={activeStyles.continueRoundText}>
                      {liveRound.actionLabel || `CONTINUE GAME ${liveRound.gameNumber || 1}`}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={activeStyles.liveTopRow}>
                    <View style={activeStyles.liveBadge}>
                      <View style={activeStyles.liveDot} />
                      <Text style={activeStyles.liveText}>PLAY</Text>
                    </View>
                  </View>

                  <Text style={activeStyles.courseTitle}>Practice or Challenge</Text>
                  <Text style={activeStyles.playSubtitle}>
                    Create or join a tournament, then start scoring shot-by-shot.
                  </Text>

                  <TouchableOpacity
                    style={activeStyles.continueRoundBtn}
                    onPress={() => navigation.navigate('SelectPlayOption')}
                    activeOpacity={0.85}
                  >
                    <Text style={activeStyles.continueRoundIcon}>+</Text>
                    <Text style={activeStyles.continueRoundText}>CREATE TOURNAMENT</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : null}

        {/* ── Upcoming Tournaments Section (not started games only) ── */}
        <View style={activeStyles.section}>
          <View style={activeStyles.sectionHeader}>
            <Text style={activeStyles.sectionTitle}>Upcoming Tournaments</Text>
            {upcomingTournaments.length > 0 ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SelectTournament', { showAllModes: true })
                }
              >
                <Text style={activeStyles.seeAll}>See all</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {upcomingTournaments.length === 0 ? (
            <Text style={activeStyles.emptyText}>No upcoming tournaments yet.</Text>
          ) : (
            upcomingTournaments.map((item) => (
              <TouchableOpacity key={item.id} style={activeStyles.tournamentCard} onPress={() => openTournament(item)} activeOpacity={0.9}>
                {/* Trophy background image */}
                <Image
                  source={trophyImg}
                  style={activeStyles.tournamentBgImage}
                  resizeMode="cover"
                />
                {/* Dark overlay */}
                <View style={activeStyles.tournamentOverlay} />

                {/* Top-right mode/invited badges & Share Button */}
                <View style={activeStyles.tournamentBadges}>
                  {(item.source === 'mine' ||
                    (currentUserId &&
                      String(
                        item.tournament?.creatorUserId ||
                        item.tournament?.creatorId ||
                        item.tournament?.createdBy,
                      ) === String(currentUserId))) &&
                    (item.shareLinkEnabled === true ||
                      (item.shareLinkEnabled !== false &&
                        (!!item.joinUrl || !!item.joinToken))) ? (
                    <TouchableOpacity
                      style={activeStyles.cardShareBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        shareTournamentLink(item.tournament || item);
                      }}
                      activeOpacity={0.7}
                    >
                      <AuthIcon name="share" size={moderateScale(13)} color="#093A24" />
                    </TouchableOpacity>
                  ) : null}
                  {!item.gameStarted &&
                    !item.challengeLocked &&
                    !item.tournament?.challengeLocked &&
                    (item.source === 'mine' ||
                      (currentUserId &&
                        String(
                          item.tournament?.creatorUserId ||
                          item.tournament?.creatorId ||
                          item.tournament?.createdBy,
                        ) === String(currentUserId))) ? (
                    <TouchableOpacity
                      style={activeStyles.cardEditBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('CreateTournament', {
                          tournament: item.tournament || item,
                          isEditing: true,
                          playMode:
                            item.playMode === 'CHALLENGE' ||
                              String(item.tournament?.playMode || '').toUpperCase().includes('CHALLENGE')
                              ? 'challenge'
                              : 'practice',
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Image source={editIcon} style={activeStyles.editIconImg} resizeMode="contain" />
                    </TouchableOpacity>
                  ) : null}
                  {item.playMode ? (
                    <View
                      style={[
                        activeStyles.modeBadge,
                        item.playMode === 'CHALLENGE'
                          ? activeStyles.modeBadgeChallenge
                          : activeStyles.modeBadgePractice,
                      ]}
                    >
                      <Text
                        style={[
                          activeStyles.modeBadgeText,
                          item.playMode === 'CHALLENGE'
                            ? activeStyles.modeBadgeTextChallenge
                            : activeStyles.modeBadgeTextPractice,
                        ]}
                      >
                        {item.playMode === 'CHALLENGE' ? 'Challenge' : 'Practice'}
                      </Text>
                    </View>
                  ) : null}
                  {item.source === 'invited' ? (
                    <View style={activeStyles.invitedBadge}>
                      <Text style={activeStyles.invitedBadgeText}>Invited</Text>
                    </View>
                  ) : null}
                </View>

                {/* Overlay info */}
                <View style={activeStyles.tournamentInfo}>
                  <Text style={activeStyles.tournamentTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{item.title}</Text>
                  <View style={activeStyles.tournamentMeta}>
                    <View style={activeStyles.metaChip}>
                      <Text style={activeStyles.tournamentMetaText}>📅 {item.date}</Text>
                    </View>
                    {item.location ? (
                      <View style={[activeStyles.metaChip, { flexShrink: 1, maxWidth: wp(50) }]}>
                        <Text style={activeStyles.tournamentMetaText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>📍 {item.location}</Text>
                      </View>
                    ) : null}
                    {item.joined && item.joined !== '—' && item.joined !== 0 ? (
                      <View style={activeStyles.metaChip}>
                        <Text style={activeStyles.tournamentMetaText}>👥 {item.joined}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Recent Activity / Game History Section ── */}
        <View style={activeStyles.section}>
          <View style={activeStyles.sectionHeader}>
            <Text style={activeStyles.sectionTitle}>Completed Tournaments</Text>
            {completedHistory.length > 0 ? (
              <TouchableOpacity onPress={() => navigation.navigate('TournamentHistory')}>
                <Text style={activeStyles.seeAll}>History</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {completedHistory.length === 0 ? (
            <Text style={activeStyles.emptyText}>No tournament history yet.</Text>
          ) : (
            completedHistory.slice(0, 5).map((item, idx) => {
              const matched = tournaments.find(
                (t) => String(t.id) === String(item.tournamentId),
              );
              const isChallenge = isChallengePlayMode(
                item.playMode,
                matched?.playMode,
                matched?.tournament?.playMode,
              );
              const modeLabel = isChallenge ? 'Challenge' : 'Practice';
              const gameCount = item.games?.length || 0;
              const courseText = item.courseName ? ` · ${item.courseName}` : '';
              const gamesLabel = gameCount === 1 ? '1 game' : `${gameCount} games`;
              const subtitle = `Score ${item.totalScore ?? '—'} · ${gamesLabel} · ${modeLabel}${courseText}`;
              const dateStr = item.lastCompletedAt ? formatDisplayDate(item.lastCompletedAt) : '';

              return (
                <TouchableOpacity
                  key={item.tournamentId || String(idx)}
                  style={activeStyles.activityCard}
                  onPress={() => {
                    if (!item.tournamentId) {
                      navigation.navigate('TournamentHistory');
                      return;
                    }
                    navigation.navigate('Leaderboard', {
                      tournament: {
                        id: item.tournamentId,
                        name: item.title,
                        title: item.title,
                        playMode: item.playMode,
                        numberOfGames: item.games?.length || 1,
                      },
                      playMode: String(item.playMode || '').toLowerCase().includes('challenge')
                        ? 'challenge'
                        : 'practice',
                      gameNumber: item.latestGameNumber || item.games?.[0]?.gameNumber || 1,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={activeStyles.activityImageContainer}>
                    <Image
                      source={idx % 2 === 0 ? homescreenBg : trophyImg}
                      style={activeStyles.activityImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={activeStyles.activityInfo}>
                    <Text style={activeStyles.activityTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={activeStyles.activitySubtitle} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </View>
                  {dateStr ? <Text style={activeStyles.activityTime}>{dateStr}</Text> : null}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom space so content scrolls completely clear of floating tab bar */}
        <View style={{ height: hp(18) }} />
      </ScrollView>
    );
  };

  // SCREEN 2: Play Tab View
  const renderPlayView = () => {
    return (
      <View style={activeStyles.tabContentContainer}>
        <ImageBackground source={homescreenBg} style={activeStyles.bannerHeader} resizeMode="cover">
          <View style={activeStyles.bannerOverlay} />
          <Text style={activeStyles.bannerTitle}>Play Golf</Text>
        </ImageBackground>

        <View style={activeStyles.placeholderBody}>
          <DotPattern color="#BCFF00" />
          <View style={activeStyles.placeholderIconWrapper}>
            <AuthIcon name="golf-play" size={moderateScale(70)} />
          </View>
          <Text style={activeStyles.placeholderTitle}>Start a New Round</Text>
          <Text style={activeStyles.placeholderText}>
            Ready to hit the course? Track your scores, analyze yardages, and play with friends in real-time.
          </Text>

          <TouchableOpacity
            style={activeStyles.btnPlaceholder}
            onPress={() => navigation.navigate('SelectPlayOption')}
            activeOpacity={0.85}
          >
            <Text style={activeStyles.btnPlaceholderText}>START ROUND</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // SCREEN 3: Profile Tab View
  const renderProfileView = () => {
    return <ProfileScreen navigation={navigation} />;
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderHomeView();
      case 2:
        return renderProfileView();
      default:
        return renderHomeView();
    }
  };

  const tabBottomOffset = insets.bottom > 0 ? insets.bottom + hp(0.8) : hp(2.8);

  return (
    <View style={activeStyles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Main Tab View Router Container */}
      <View style={{ flex: 1 }}>
        {renderActiveTabContent()}
      </View>

      {/* ── Bottom Tab Bar ── */}
      {!hideTabBar && (
        <View style={[activeStyles.tabBar, { bottom: tabBottomOffset }]}>
          {TAB_ITEMS.map((tab, index) => {
            const isActive = activeTab === index;
            if (tab.isCenter) {
              return (
                <TouchableOpacity
                  key={index}
                  style={activeStyles.tabCenterBtn}
                  onPress={() => navigation.navigate('SelectPlayOption')}
                  activeOpacity={0.85}
                >
                  <AuthIcon
                    name={tab.iconName}
                    size={moderateScale(46)}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={index}
                style={activeStyles.tabItem}
                onPress={() => setActiveTab(index)}
                activeOpacity={0.7}
              >
                <View style={isActive ? activeStyles.activeIconCircle : activeStyles.inactiveIconCircle}>
                  <AuthIcon
                    name={tab.iconName}
                    size={moderateScale(28)}
                    color={isActive ? '#BCFF00' : '#FFFFFF'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const activeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F0F4F0',
  },

  // ── Header ──
  header: {
    width: '100%',
    backgroundColor: '#0A4A2A',
    paddingTop: Platform.OS === 'ios' ? hp(7.5) : hp(5.5),
    paddingBottom: hp(10),
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.3)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  avatarSmallWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    borderColor: '#BCFF00',
    backgroundColor: '#EDF5EF',
    overflow: 'hidden',
  },
  avatarSmallImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24),
  },
  greetingBlock: { gap: hp(0.2) },
  greetingText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: 'rgba(255, 255, 255, 0.85)',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: COLORS.white,
  },
  bellBtnCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  bellUnreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#BCFF00',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  // ── Figma Points Card (overlapping header) ──
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    marginHorizontal: wp(5),
    marginTop: -hp(6.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    marginBottom: hp(1),
  },
  pointsColumn: {
    justifyContent: 'center',
  },
  pointsBadge: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: '#FFD300',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.8),
    shadowColor: '#FFD300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  pointsValue: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: '#093A24',
    marginBottom: hp(0.2),
  },
  pointsLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#007C4A',
  },

  // ── Sections ──
  section: {
    paddingHorizontal: wp(5),
    marginTop: hp(2.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),
    color: '#093A24',
  },
  seeAll: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13),
    color: '#2EA200',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#718096',
  },

  // ── Live Round Card ──
  liveCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  liveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E3B2E',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    gap: wp(1.5),
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BCFF00',
  },
  liveText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#BCFF00',
    letterSpacing: 0.5,
  },
  holeText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
  },
  liveTournamentName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    marginBottom: hp(0.3),
  },
  courseTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    marginBottom: hp(1.5),
  },
  courseSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginBottom: hp(1.5),
  },
  playSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#718096',
    lineHeight: fontSize(18),
    marginBottom: hp(2),
  },
  progressBarBg: {
    height: hp(0.8),
    backgroundColor: '#E2E8F0',
    borderRadius: moderateScale(4),
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2EA200',
    borderRadius: moderateScale(4),
  },
  continueRoundBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(30),
    paddingVertical: hp(1.6),
    gap: wp(2),
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  continueRoundIcon: {
    fontSize: fontSize(14),
    color: '#093A24',
    fontWeight: 'bold',
  },
  continueRoundText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
    letterSpacing: 1,
  },

  // ── Tournament Card ──
  tournamentCard: {
    width: '100%',
    height: hp(20),
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    marginBottom: hp(2),
    backgroundColor: '#1A3D28',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  tournamentBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  tournamentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 22, 12, 0.45)',
  },
  tournamentInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: moderateScale(14),
    paddingRight: wp(12),
    backgroundColor: 'transparent',
  },
  tournamentTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: COLORS.white,
    marginBottom: hp(0.6),
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tournamentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(1.8),
    alignItems: 'center',
  },
  metaChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: moderateScale(8),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.3)',
  },
  tournamentMetaText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tournamentBadges: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
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
  modeBadge: {
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderWidth: 1.5,
  },
  modeBadgePractice: {
    backgroundColor: 'rgba(9, 58, 36, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeBadgeChallenge: {
    backgroundColor: 'rgba(9, 58, 36, 0.85)',
    borderColor: '#BCFF00',
  },
  modeBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10.5),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  modeBadgeTextPractice: {
    color: '#FFFFFF',
  },
  modeBadgeTextChallenge: {
    color: '#BCFF00',
  },
  invitedBadge: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  invitedBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10.5),
    color: '#093A24',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inProgressBadge: {
    backgroundColor: '#093A24',
    borderWidth: 1,
    borderColor: '#BCFF00',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  inProgressBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10.5),
    color: '#BCFF00',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A0AEC0',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  completedBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10.5),
    color: '#2D3748',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginVertical: hp(1.5),
  },
  emptyStateText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(3.5),
    paddingHorizontal: wp(5),
    backgroundColor: '#093A24',
    borderRadius: moderateScale(22),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: hp(1.5),
    width: '100%',
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(30),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.4),
    marginTop: hp(2),
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.6,
  },

  // ── Activity Card ──
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activityImageContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: '#F0F4F0',
    marginRight: wp(3.5),
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    marginBottom: hp(0.2),
  },
  activitySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#718096',
  },
  activityTime: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#A0AEC0',
    marginLeft: wp(2),
  },

  // ── Bottom Tab Bar ──
  tabBar: {
    position: 'absolute',
    bottom: hp(2),
    left: wp(5),
    right: wp(5),
    height: hp(8),
    backgroundColor: '#004B1D',
    borderRadius: moderateScale(45),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(46, 162, 0, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabCenterBtn: {
    width: moderateScale(66),
    height: moderateScale(66),
    borderRadius: moderateScale(33),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -hp(3.8),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // ── Tab View Placeholder Styles ──
  tabContentContainer: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },
  bannerHeader: {
    height: hp(24),
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.45)',
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.white,
    marginTop: hp(2),
  },
  placeholderBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    backgroundColor: '#F0F4F0',
  },
  placeholderIconWrapper: {
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
    backgroundColor: '#0A2E1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3.5),
    elevation: 5,
    shadowColor: '#0A2E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  placeholderTitle: {
    fontSize: fontSize(22),
    fontFamily: FONTS.bold,
    color: '#093A24',
    marginBottom: hp(1.8),
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: fontSize(13),
    fontFamily: FONTS.medium,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: fontSize(18),
    marginBottom: hp(5),
  },
  btnPlaceholder: {
    height: hp(6),
    width: wp(60),
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnPlaceholderText: {
    fontSize: fontSize(12),
    fontFamily: FONTS.bold,
    color: '#093A24',
  },
});

export default HomeScreen;




