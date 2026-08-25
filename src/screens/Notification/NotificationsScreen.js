// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
//   StatusBar,
//   BackHandler,
//   Platform,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   GlassCard,
//   PrimaryPillButton,
//   SecondaryPillButton,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import {
//   getNotificationsApi,
//   markAllNotificationsReadApi,
//   markNotificationReadApi,
//   respondToNotificationApi,
// } from '../../services/notificationService';

// const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const NotificationsScreen = ({ navigation }) => {
//   const [respondedIds, setRespondedIds] = useState([]);
//   const [todayList, setTodayList] = useState([]);
//   const [earlierList, setEarlierList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loadingId, setLoadingId] = useState(null);

//   const extractNotificationDetails = (item) => {
//     const data = item.data || item.metadata || item.payload || {};

//     const textMsg =
//       item.subtitle ||
//       item.message ||
//       item.description ||
//       item.body ||
//       item.text ||
//       data.message ||
//       data.description ||
//       data.body ||
//       data.text ||
//       '';

//     if (textMsg) return textMsg;

//     const teamName = data.teamName || data.team?.name || item.teamName || item.team?.name || '';
//     const tournamentName = data.tournamentName || data.tournament?.name || item.tournamentName || item.tournament?.name || '';
//     const senderName = data.senderName || data.inviterName || data.sender?.displayName || item.senderName || item.inviterName || '';

//     if (senderName && teamName && tournamentName) {
//       return `${senderName} invited ${teamName} to '${tournamentName}'`;
//     }
//     if (teamName && tournamentName) {
//       return `Team '${teamName}' invited to compete in '${tournamentName}'`;
//     }
//     if (teamName) {
//       return `Invitation for team '${teamName}'`;
//     }
//     if (tournamentName) {
//       return `Invitation to compete in '${tournamentName}'`;
//     }

//     return 'You have received an invite to compete in the tournament.';
//   };

//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const res = await getNotificationsApi({ page: 1, limit: 20 });
//       const notificationsData = res?.notifications || res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);

//       if (Array.isArray(notificationsData)) {
//         const formatted = notificationsData.map((item) => {
//           const type = (item.type || '').toLowerCase();
//           let icon = 'bell';
//           let iconBg = COLORS.bgPage;
//           let iconColor = COLORS.textPrimary;

//           if (type.includes('trophy') || type.includes('tournament')) {
//             icon = 'trophy';
//             iconBg = COLORS.cta;
//           } else if (type.includes('team') || type.includes('invite')) {
//             icon = 'users';
//             iconBg = COLORS.cta;
//           } else if (type.includes('rank') || type.includes('achievement')) {
//             icon = 'award';
//             iconBg = COLORS.dotPattern;
//           }

//           const calculatedSubtitle = extractNotificationDetails(item);

//           return {
//             id: item.id || item._id || String(Date.now()),
//             title: item.title || item.name || 'Tournament team invite',
//             subtitle: calculatedSubtitle,
//             time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'),
//             icon,
//             iconBg,
//             iconColor,
//             isRead: !!item.isRead || !!item.read || item.readAt !== null,
//             type: item.type,
//             rawItem: item,
//           };
//         });

//         // Unread/Pending invites go to Today; Read/Historical items go to Earlier
//         const activeUnread = formatted.filter((n) => !n.isRead && !respondedIds.includes(String(n.id)));
//         const activeRead = formatted.filter((n) => n.isRead && !respondedIds.includes(String(n.id)));

//         setTodayList(activeUnread);
//         setEarlierList(activeRead);
//       }
//     } catch (err) {
//       console.log('Fetch notifications error:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchNotifications();

//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation, respondedIds])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchNotifications();
//   };

//   const handleMarkAllRead = async () => {
//     try {
//       await markAllNotificationsReadApi();
//     } catch (err) {
//       console.log('Mark all read note error:', err);
//     }
//     setTodayList((prev) => prev.map((item) => ({ ...item, isRead: true })));
//     setEarlierList((prev) => prev.map((item) => ({ ...item, isRead: true })));
//     Toast.show({
//       type: 'success',
//       text1: 'Notifications Updated',
//       text2: 'All notifications marked as read.',
//     });
//   };

//   const handleCardPress = async (item) => {
//     if (!item.isRead && isUuid(String(item.id))) {
//       try {
//         await markNotificationReadApi(item.id);
//         setTodayList((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
//         setEarlierList((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
//       } catch (err) {
//         console.log('Mark read error:', err);
//       }
//     }
//   };

//   const handleAcceptInvite = async (item) => {
//     const raw = item.rawItem || item;
//     const notifId = raw.id || raw._id || item.id;
//     const type = String(raw.type || item.type || '').toUpperCase();

//     if (!notifId || !isUuid(String(notifId))) {
//       Toast.show({
//         type: 'error',
//         text1: 'Action Failed',
//         text2: 'Invalid notification id.',
//       });
//       return;
//     }

//     setLoadingId(item.id);
//     try {
//       const res = await respondToNotificationApi(notifId, { action: 'accept' });
//       try {
//         await markNotificationReadApi(notifId);
//       } catch (mErr) {
//         console.log('Mark read note:', mErr);
//       }

//       const successMsg =
//         type.includes('TOURNAMENT')
//           ? 'Tournament invite accepted. It now appears under Invited.'
//           : `Joined ${res?.invite?.teamName || res?.teamName || 'the team'}.`;

//       Toast.show({
//         type: 'success',
//         text1: 'Invite Accepted',
//         text2: successMsg,
//       });
//       setRespondedIds((prev) => [...prev, String(item.id)]);
//       setTodayList((prev) => prev.filter((i) => i.id !== item.id));
//       setEarlierList((prev) => prev.filter((i) => i.id !== item.id));
//     } catch (err) {
//       console.log('Accept invite error:', err);
//       const errData = err?.response?.data;
//       const errMsg = typeof errData === 'string' ? errData : errData?.error || errData?.message || '';
//       if (String(errMsg).toLowerCase().includes('already accepted') || String(errMsg).toLowerCase().includes('already joined')) {
//         Toast.show({
//           type: 'success',
//           text1: 'Invite Accepted',
//           text2: 'Invite was already accepted.',
//         });
//         setRespondedIds((prev) => [...prev, String(item.id)]);
//         setTodayList((prev) => prev.filter((i) => i.id !== item.id));
//         setEarlierList((prev) => prev.filter((i) => i.id !== item.id));
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Action Failed',
//           text2: errMsg || 'Could not accept invite. Please try again.',
//         });
//       }
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const handleRejectInvite = async (item) => {
//     const raw = item.rawItem || item;
//     const notifId = raw.id || raw._id || item.id;

//     if (!notifId || !isUuid(String(notifId))) {
//       Toast.show({
//         type: 'error',
//         text1: 'Action Failed',
//         text2: 'Invalid notification id.',
//       });
//       return;
//     }

//     setLoadingId(item.id);
//     try {
//       await respondToNotificationApi(notifId, { action: 'reject' });
//       try {
//         await markNotificationReadApi(notifId);
//       } catch (mErr) {
//         console.log('Mark read note:', mErr);
//       }

//       Toast.show({
//         type: 'info',
//         text1: 'Invite Declined',
//         text2: 'Invite declined.',
//       });
//       setRespondedIds((prev) => [...prev, String(item.id)]);
//       setTodayList((prev) => prev.filter((i) => i.id !== item.id));
//       setEarlierList((prev) => prev.filter((i) => i.id !== item.id));
//     } catch (err) {
//       console.log('Reject invite error:', err);
//       const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not decline invite. Please try again.';
//       Toast.show({
//         type: 'error',
//         text1: 'Action Failed',
//         text2: msg,
//       });
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const renderNotificationCard = (item) => {
//     const typeStr = (item.type || '').toUpperCase();
//     const isIncomingInvite =
//       typeStr === 'TEAM_MEMBER_INVITE' ||
//       typeStr === 'TOURNAMENT_TEAM_INVITE';

//     return (
//       <View key={item.id} style={styles.cardWrapper}>
//         <GlassCard
//           onPress={() => handleCardPress(item)}
//           style={[styles.card, !item.isRead && styles.cardUnread]}
//         >
//           <View style={styles.cardRow}>
//             <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
//               <AuthIcon name={item.icon} size={moderateScale(18)} color={item.iconColor} />
//             </View>

//             <View style={styles.textContainer}>
//               <Text style={styles.cardTitle}>{item.title}</Text>
//               {!!item.subtitle && <Text style={styles.cardSubtitle}>{item.subtitle}</Text>}
//             </View>

//             <Text style={styles.timeText}>{item.time}</Text>
//           </View>
//         </GlassCard>

//         {isIncomingInvite && !respondedIds.includes(String(item.id)) && (
//           <View style={styles.actionRow}>
//             <SecondaryPillButton
//               title="Decline"
//               onPress={() => handleRejectInvite(item)}
//               disabled={loadingId === item.id}
//               style={styles.actionButton}
//             />
//             <View style={styles.actionButton}>
//               <PrimaryPillButton
//                 title="Accept"
//                 onPress={() => handleAcceptInvite(item)}
//                 loading={loadingId === item.id}
//                 disabled={loadingId === item.id}
//               />
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <ScreenScaffold>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       {/* Header Row */}
//       <View style={styles.headerRow}>
//         <CircularBackButton onPress={() => navigation.goBack()} />

//         <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
//           <Text style={styles.markAllReadText}>Mark all read</Text>
//         </TouchableOpacity>
//       </View>

//       <ScreenHeader title="Notifications" style={styles.header} />

//       {/* Scrollable Content */}
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={COLORS.textPrimary}
//           />
//         }
//       >
//         {/* Empty State if no notifications */}
//         {!loading && todayList.length === 0 && earlierList.length === 0 && (
//           <GlassCard style={styles.emptyStateWrap}>
//             <Text style={styles.emptyStateText}>
//               No notifications yet. New invites and activity updates will appear here!
//             </Text>
//           </GlassCard>
//         )}

//         {/* Section: Today */}
//         {todayList.length > 0 && (
//           <>
//             <Text style={styles.sectionHeaderTitle}>Today</Text>
//             {todayList.map(renderNotificationCard)}
//           </>
//         )}

//         {/* Section: Earlier */}
//         {earlierList.length > 0 && (
//           <>
//             <Text style={[styles.sectionHeaderTitle, { marginTop: hp(2) }]}>Earlier</Text>
//             {earlierList.map(renderNotificationCard)}
//           </>
//         )}

//         {/* Bottom spacing */}
//         <View style={{ height: hp(4) }} />
//       </ScrollView>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: wp(5),
//     paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
//   },
//   markAllReadText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(13.5),
//     color: COLORS.textLabel,
//   },
//   header: {
//     paddingHorizontal: wp(5),
//     marginBottom: hp(1),
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: wp(5),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(4),
//   },
//   sectionHeaderTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: COLORS.textPrimary,
//     marginBottom: hp(1.2),
//   },

//   // Notification Cards
//   cardWrapper: {
//     marginBottom: hp(1.4),
//   },
//   card: {
//     paddingHorizontal: wp(3.5),
//   },
//   cardUnread: {
//     borderColor: COLORS.cta,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: hp(1.6),
//     gap: wp(3.2),
//   },
//   iconCircle: {
//     width: moderateScale(44),
//     height: moderateScale(44),
//     borderRadius: moderateScale(22),
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.glassBorder,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(15),
//     color: COLORS.textPrimary,
//   },
//   cardSubtitle: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(12),
//     color: COLORS.textMuted,
//     marginTop: hp(0.3),
//     lineHeight: fontSize(18),
//   },
//   timeText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(11.5),
//     color: COLORS.textPlaceholder,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(3),
//     marginTop: hp(1.2),
//     paddingHorizontal: wp(1),
//   },
//   actionButton: {
//     flex: 1,
//   },
//   emptyStateWrap: {
//     padding: moderateScale(20),
//     marginVertical: hp(2),
//     alignItems: 'center',
//   },
//   emptyStateText: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(13.5),
//     color: COLORS.textMuted,
//     textAlign: 'center',
//     lineHeight: fontSize(20),
//   },
// });

// export default NotificationsScreen;


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
//   StatusBar,
//   BackHandler,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import AuthIcon from '../../components/common/AuthIcon';
// import DotPattern from '../../components/common/DotPattern';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import {
//   getNotificationsApi,
//   markAllNotificationsReadApi,
//   markNotificationReadApi,
//   respondToNotificationApi,
// } from '../../services/notificationService';
// import { acceptTeamInviteApi, rejectTeamInviteApi, getTeamInvitesApi, selectTournamentTeamApi, getTeamByIdApi } from '../../services/teamService';

// const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const NotificationsScreen = ({ navigation }) => {
//   const [respondedIds, setRespondedIds] = useState([]);
//   const [todayList, setTodayList] = useState([]);
//   const [earlierList, setEarlierList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loadingId, setLoadingId] = useState(null);

//   const extractNotificationDetails = (item) => {
//     const data = item.data || item.metadata || item.payload || {};

//     const textMsg =
//       item.subtitle ||
//       item.message ||
//       item.description ||
//       item.body ||
//       item.text ||
//       data.message ||
//       data.description ||
//       data.body ||
//       data.text ||
//       '';

//     if (textMsg) return textMsg;

//     const teamName = data.teamName || data.team?.name || item.teamName || item.team?.name || '';
//     const tournamentName = data.tournamentName || data.tournament?.name || item.tournamentName || item.tournament?.name || '';
//     const senderName = data.senderName || data.inviterName || data.sender?.displayName || item.senderName || item.inviterName || '';

//     if (senderName && teamName && tournamentName) {
//       return `${senderName} invited ${teamName} to '${tournamentName}'`;
//     }
//     if (teamName && tournamentName) {
//       return `Team '${teamName}' invited to compete in '${tournamentName}'`;
//     }
//     if (teamName) {
//       return `Invitation for team '${teamName}'`;
//     }
//     if (tournamentName) {
//       return `Invitation to compete in '${tournamentName}'`;
//     }

//     return 'You have received an invite to compete in the tournament.';
//   };

//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const res = await getNotificationsApi({ page: 1, limit: 20 });
//       const notificationsData = res?.notifications || res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);

//       if (Array.isArray(notificationsData)) {
//         const formatted = notificationsData.map((item) => {
//           const type = (item.type || '').toLowerCase();
//           let icon = 'bell';
//           let iconBg = '#BCFF00';
//           let iconColor = '#093A24';

//           if (type.includes('trophy') || type.includes('tournament')) {
//             icon = 'trophy';
//             iconBg = '#BCFF00';
//           } else if (type.includes('team') || type.includes('invite')) {
//             icon = 'users';
//             iconBg = '#BCFF00';
//           } else if (type.includes('rank') || type.includes('achievement')) {
//             icon = 'award';
//             iconBg = '#BCFF00';
//           }

//           const calculatedSubtitle = extractNotificationDetails(item);

//           return {
//             id: item.id || item._id || String(Date.now()),
//             title: item.title || item.name || 'Tournament team invite',
//             subtitle: calculatedSubtitle,
//             time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'),
//             icon,
//             iconBg,
//             iconColor,
//             isRead: !!item.isRead || !!item.read || item.readAt !== null,
//             type: item.type,
//             rawItem: item,
//           };
//         });

//         // Unread/Pending invites go to Today; Read/Historical items go to Earlier
//         const activeUnread = formatted.filter((n) => !n.isRead && !respondedIds.includes(String(n.id)));
//         const activeRead = formatted.filter((n) => n.isRead && !respondedIds.includes(String(n.id)));

//         setTodayList(activeUnread);
//         setEarlierList(activeRead);
//       }
//     } catch (err) {
//       console.log('Fetch notifications error:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchNotifications();

//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };
//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation, respondedIds])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchNotifications();
//   };

//   const handleMarkAllRead = async () => {
//     try {
//       await markAllNotificationsReadApi();
//     } catch (err) {
//       console.log('Mark all read note error:', err);
//     }
//     setTodayList((prev) => prev.map((item) => ({ ...item, isRead: true })));
//     setEarlierList((prev) => prev.map((item) => ({ ...item, isRead: true })));
//     Toast.show({
//       type: 'success',
//       text1: 'Notifications Updated',
//       text2: 'All notifications marked as read.',
//     });
//   };

//   const handleCardPress = async (item) => {
//     if (!item.isRead && isUuid(String(item.id))) {
//       try {
//         await markNotificationReadApi(item.id);
//         setTodayList((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
//         setEarlierList((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
//       } catch (err) {
//         console.log('Mark read error:', err);
//       }
//     }
//   };

//   const handleAcceptInvite = async (item) => {
//     const raw = item.rawItem || item;
//     const notifId = raw.id || raw._id || item.id;
//     const data = raw.data || raw.metadata || {};
//     let inviteId = data.inviteId || raw.inviteId || data.id;
//     const teamId = data.teamId || raw.teamId || data.team?.id;

//     setLoadingId(item.id);
//     try {
//       let inviteSuccess = false;
//       let notifSuccess = false;

//       // If inviteId is not directly on notification, lookup pending invite for team
//       if ((!inviteId || !isUuid(String(inviteId))) && teamId && isUuid(String(teamId))) {
//         try {
//           const invRes = await getTeamInvitesApi(teamId);
//           const invitesList = invRes?.invites || invRes?.data?.invites || invRes?.data || (Array.isArray(invRes) ? invRes : []);
//           const myPendingInvite = (Array.isArray(invitesList) ? invitesList : []).find(
//             (inv) => String(inv.status).toLowerCase() === 'pending' || String(inv.inviteStatus).toLowerCase() === 'pending'
//           );
//           if (myPendingInvite) {
//             inviteId = myPendingInvite.id || myPendingInvite._id;
//           }
//         } catch (invFetchErr) {
//           console.log('Fetch invites for team note:', invFetchErr);
//         }
//       }

//       // 1. Accept team invite on team service (/teams/invites/:inviteId/accept)
//       if (inviteId && isUuid(String(inviteId))) {
//         try {
//           await acceptTeamInviteApi(inviteId);
//           inviteSuccess = true;
//         } catch (aErr) {
//           const errData = aErr?.response?.data;
//           const errMsg = typeof errData === 'string' ? errData : errData?.error || errData?.message || '';
//           console.log('Accept team invite note:', errMsg || aErr);
//           if (errMsg.toLowerCase().includes('already accepted') || errMsg.toLowerCase().includes('already joined')) {
//             inviteSuccess = true;
//           }
//         }
//       }

//       // 2. Respond to notification (/notifications/:id/respond) & Mark as read
//       if (notifId && isUuid(String(notifId))) {
//         try {
//           await markNotificationReadApi(notifId);
//           notifSuccess = true;
//         } catch (mErr) {
//           console.log('Mark read note:', mErr);
//         }

//         if (!inviteSuccess) {
//           try {
//             await respondToNotificationApi(notifId, { action: 'accept' });
//             notifSuccess = true;
//           } catch (rErr) {
//             const errData = rErr?.response?.data;
//             const errMsg = typeof errData === 'string' ? errData : errData?.error || errData?.message || '';
//             console.log('Respond notification note:', errMsg || rErr);
//             if (errMsg.toLowerCase().includes('already accepted')) {
//               notifSuccess = true;
//             }
//           }
//         } else {
//           notifSuccess = true;
//         }
//       }

//       // 3. Register team for tournament
//       let targetTourId = data.tournamentId || raw.tournamentId || data.tournament?.id;
//       const targetTeamId = data.teamId || raw.teamId || data.team?.id || teamId;

//       if (!targetTourId && targetTeamId && isUuid(String(targetTeamId))) {
//         try {
//           const teamDetails = await getTeamByIdApi(targetTeamId);
//           const fullT = teamDetails?.team || teamDetails?.data?.team || teamDetails;
//           targetTourId = fullT?.tournamentId || fullT?.tournament?._id || fullT?.tournament?.id;
//         } catch (tFetchErr) {
//           console.log('Fetch team details for tournament link note:', tFetchErr);
//         }
//       }

//       if (targetTourId && isUuid(String(targetTourId)) && targetTeamId && isUuid(String(targetTeamId))) {
//         try {
//           await selectTournamentTeamApi(targetTourId, { teamId: targetTeamId, isOpponent: true, role: 'OPPONENT' });
//         } catch (sErr) {
//           console.log('Select tournament team on accept note:', sErr);
//         }
//       }

//       if (inviteSuccess || notifSuccess) {
//         Toast.show({
//           type: 'success',
//           text1: 'Invite Accepted',
//           text2: 'You have joined the team!',
//         });
//         setRespondedIds((prev) => [...prev, String(item.id)]);
//         setTodayList((prev) => prev.filter((i) => i.id !== item.id));
//         setEarlierList((prev) => prev.filter((i) => i.id !== item.id));
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Action Failed',
//           text2: 'Could not accept invite on server.',
//         });
//       }
//     } catch (err) {
//       console.log('Accept invite error:', err);
//       const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not accept invite. Please try again.';
//       Toast.show({
//         type: 'error',
//         text1: 'Action Failed',
//         text2: msg,
//       });
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const handleRejectInvite = async (item) => {
//     const raw = item.rawItem || item;
//     const notifId = raw.id || raw._id || item.id;
//     const inviteId = raw.data?.inviteId || raw.metadata?.inviteId || raw.inviteId;

//     setLoadingId(item.id);
//     try {
//       let inviteSuccess = false;
//       let notifSuccess = false;

//       if (inviteId && isUuid(String(inviteId))) {
//         try {
//           await rejectTeamInviteApi(inviteId);
//           inviteSuccess = true;
//         } catch (aErr) {
//           const errData = aErr?.response?.data;
//           const errMsg = typeof errData === 'string' ? errData : errData?.error || errData?.message || '';
//           console.log('Reject team invite note:', errMsg || aErr);
//           if (errMsg.toLowerCase().includes('already rejected') || errMsg.toLowerCase().includes('already accepted')) {
//             inviteSuccess = true;
//           }
//         }
//       }

//       if (notifId && isUuid(String(notifId))) {
//         try {
//           await markNotificationReadApi(notifId);
//           notifSuccess = true;
//         } catch (mErr) {
//           console.log('Mark read note:', mErr);
//         }
//         if (!inviteSuccess) {
//           try {
//             await respondToNotificationApi(notifId, { action: 'reject' });
//             notifSuccess = true;
//           } catch (rErr) {
//             console.log('Respond notification note:', rErr);
//           }
//         }
//       }

//       if (inviteSuccess || notifSuccess) {
//         Toast.show({
//           type: 'info',
//           text1: 'Invite Declined',
//           text2: 'Team invite declined.',
//         });
//         setRespondedIds((prev) => [...prev, String(item.id)]);
//         setTodayList((prev) => prev.filter((i) => i.id !== item.id));
//         setEarlierList((prev) => prev.filter((i) => i.id !== item.id));
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Action Failed',
//           text2: 'Could not decline invite on server.',
//         });
//       }
//     } catch (err) {
//       console.log('Reject invite error:', err);
//       const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not decline invite. Please try again.';
//       Toast.show({
//         type: 'error',
//         text1: 'Action Failed',
//         text2: msg,
//       });
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const renderNotificationCard = (item) => {
//     const typeStr = (item.type || '').toUpperCase();
//     const actionStr = (item.rawItem?.data?.action || '').toLowerCase();
//     const titleStr = (item.title || '').toLowerCase();

//     const isAcceptedOrRejected =
//       typeStr.includes('ACCEPTED') ||
//       typeStr.includes('REJECTED') ||
//       actionStr.includes('accepted') ||
//       actionStr.includes('rejected') ||
//       titleStr.includes('accepted') ||
//       titleStr.includes('rejected');

//     const isIncomingInvite =
//       !isAcceptedOrRejected &&
//       (typeStr.includes('INVITE') || titleStr.includes('invite') || actionStr.includes('invite'));

//     const isHighlightCard = isIncomingInvite || !item.isRead;

//     return (
//       <View key={item.id} style={styles.notificationCardWrapper}>
//         <TouchableOpacity
//           style={[
//             styles.notificationCard,
//             isHighlightCard ? styles.limeBorderCard : styles.greyBorderCard,
//           ]}
//           onPress={() => handleCardPress(item)}
//           activeOpacity={0.85}
//         >
//           <View style={styles.iconCircle}>
//             <AuthIcon name={item.icon} size={moderateScale(20)} color="#093A24" />
//           </View>

//           <View style={styles.textContainer}>
//             <Text style={styles.cardTitle}>{item.title}</Text>
//             {!!item.subtitle && <Text style={styles.cardSubtitle}>{item.subtitle}</Text>}
//           </View>

//           <Text style={styles.timeText}>{item.time}</Text>
//         </TouchableOpacity>

//         {isIncomingInvite && (
//           <View style={styles.actionButtonsRow}>
//             <TouchableOpacity
//               style={styles.declineBtn}
//               onPress={() => handleRejectInvite(item)}
//               disabled={loadingId === item.id}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.declineBtnText}>DECLINE</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.acceptBtn}
//               onPress={() => handleAcceptInvite(item)}
//               disabled={loadingId === item.id}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.acceptBtnText}>ACCEPT</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       {/* Header Row */}
//       <View style={styles.headerRow}>
//         <TouchableOpacity
//           style={styles.backButtonCircle}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.7}
//         >
//           <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
//           <Text style={styles.markAllReadText}>Mark all read</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Main Title */}
//       <Text style={styles.mainTitle}>Notifications</Text>

//       {/* Scrollable Content */}
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor="#093A24"
//           />
//         }
//       >
//         {/* Empty State if no notifications */}
//         {!loading && todayList.length === 0 && earlierList.length === 0 && (
//           <View style={styles.emptyStateWrap}>
//             <Text style={styles.emptyStateText}>
//               No notifications yet. New invites and activity updates will appear here!
//             </Text>
//           </View>
//         )}

//         {/* Section: Today */}
//         {todayList.length > 0 && (
//           <>
//             <Text style={styles.sectionHeaderTitle}>Today</Text>
//             {todayList.map(renderNotificationCard)}
//           </>
//         )}

//         {/* Section: Earlier */}
//         {earlierList.length > 0 && (
//           <>
//             <Text style={[styles.sectionHeaderTitle, { marginTop: hp(2) }]}>Earlier</Text>
//             {earlierList.map(renderNotificationCard)}
//           </>
//         )}

//         {/* Bottom spacing */}
//         <View style={{ height: hp(4) }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAF9',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: wp(5),
//     paddingTop: Platform.OS === 'ios' ? hp(1.5) : hp(2),
//     paddingBottom: hp(1.5),
//   },
//   backButtonCircle: {
//     width: moderateScale(44),
//     height: moderateScale(44),
//     borderRadius: moderateScale(22),
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     elevation: 3,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 5,
//   },
//   markAllReadText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(13.5),
//     color: '#093A24',
//   },
//   mainTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: '#093A24',
//     paddingHorizontal: wp(5),
//     marginBottom: hp(2),
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: wp(5),
//     paddingTop: hp(0.5),
//     paddingBottom: hp(4),
//   },
//   sectionHeaderTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: '#093A24',
//     marginBottom: hp(1.5),
//   },

//   // Notification Cards
//   notificationCardWrapper: {
//     marginBottom: hp(2),
//   },
//   notificationCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4.5),
//     paddingVertical: hp(2),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   limeBorderCard: {
//     borderWidth: 2,
//     borderColor: '#BCFF00', // Lime green border matching Figma mockup
//   },
//   greyBorderCard: {
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//   },
//   iconCircle: {
//     width: moderateScale(44),
//     height: moderateScale(44),
//     borderRadius: moderateScale(22),
//     backgroundColor: '#BCFF00', // Lime green icon circle matching mockup
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: wp(3.5),
//   },
//   textContainer: {
//     flex: 1,
//     marginRight: wp(2),
//   },
//   cardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24',
//   },
//   cardSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: '#5A7367',
//     marginTop: hp(0.4),
//     lineHeight: fontSize(17),
//   },
//   timeText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(11),
//     color: '#8A9A90',
//   },

//   // Action Buttons (DECLINE / ACCEPT) matching Figma mockup
//   actionButtonsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(3.5),
//     marginTop: hp(1.4),
//   },
//   declineBtn: {
//     flex: 1,
//     height: hp(5.5),
//     borderRadius: moderateScale(30),
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#093A24',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   declineBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//     letterSpacing: 0.5,
//   },
//   acceptBtn: {
//     flex: 1,
//     height: hp(5.5),
//     borderRadius: moderateScale(30),
//     backgroundColor: '#BCFF00', // Lime green primary CTA matching mockup
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#BCFF00',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   acceptBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#093A24',
//     letterSpacing: 0.5,
//   },
//   emptyStateWrap: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: moderateScale(20),
//     padding: moderateScale(20),
//     marginVertical: hp(2),
//     alignItems: 'center',
//   },
//   emptyStateText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13.5),
//     color: '#718096',
//     textAlign: 'center',
//     lineHeight: fontSize(20),
//   },
// });

// export default NotificationsScreen;



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthIcon from '../../components/common/AuthIcon';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ScreenScaffold,
  CircularBackButton,
} from '../../components/ui';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import {
  wp,
  hp,
  fontSize,
  moderateScale,
} from '../../utils/responsive';

import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  clearAllNotificationsApi,
  markNotificationReadApi,
  respondToNotificationApi,
} from '../../services/notificationService';
import { processDeepLink } from '../../utils/deepLinkHandler';


// ============================================================
// Helpers
// ============================================================

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );


// ============================================================
// Screen
// ============================================================

const NotificationsScreen = ({ navigation }) => {
  const [respondedIds, setRespondedIds] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [earlierList, setEarlierList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [actionType, setActionType] = useState(null);


  // ==========================================================
  // Notification subtitle
  // ==========================================================

  const extractNotificationDetails = (item) => {
    const data =
      item.data ||
      item.metadata ||
      item.payload ||
      {};


    const textMsg =
      item.subtitle ||
      item.message ||
      item.description ||
      item.body ||
      item.text ||
      data.message ||
      data.description ||
      data.body ||
      data.text ||
      '';


    if (textMsg) {
      return textMsg;
    }


    const teamName =
      data.teamName ||
      data.team?.name ||
      item.teamName ||
      item.team?.name ||
      '';


    const tournamentName =
      data.tournamentName ||
      data.tournament?.name ||
      item.tournamentName ||
      item.tournament?.name ||
      '';


    const senderName =
      data.senderName ||
      data.inviterName ||
      data.sender?.displayName ||
      item.senderName ||
      item.inviterName ||
      '';


    if (senderName && teamName && tournamentName) {
      return `${senderName} invited ${teamName} to '${tournamentName}'`;
    }


    if (teamName && tournamentName) {
      return `Team '${teamName}' invited to compete in '${tournamentName}'`;
    }


    if (teamName) {
      return `Invitation for team '${teamName}'`;
    }


    if (tournamentName) {
      return `Invitation to compete in '${tournamentName}'`;
    }


    return 'You have received an invite to compete in the tournament.';
  };


  // ==========================================================
  // Fetch notifications
  // ==========================================================

  const fetchNotifications = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const res = await getNotificationsApi({
        page: 1,
        limit: 20,
      });


      const notificationsData =
        res?.notifications ||
        res?.data?.notifications ||
        res?.data ||
        (Array.isArray(res) ? res : []);


      if (Array.isArray(notificationsData)) {
        const formatted = notificationsData.map((item) => {
          const type = (item.type || '').toLowerCase();


          let icon = 'bell';
          let iconBg = '#BCFF00';
          let iconColor = '#093A24';


          if (
            type.includes('trophy') ||
            type.includes('tournament')
          ) {
            icon = 'trophy';
            iconBg = '#BCFF00';
          } else if (
            type.includes('team') ||
            type.includes('invite')
          ) {
            icon = 'users';
            iconBg = '#BCFF00';
          } else if (
            type.includes('rank') ||
            type.includes('achievement')
          ) {
            icon = 'award';
            iconBg = '#BCFF00';
          }


          const calculatedSubtitle =
            extractNotificationDetails(item);

          const rawDate =
            item.createdAt ||
            item.created_at ||
            item.timestamp ||
            item.date ||
            item.updatedAt ||
            item.updated_at;

          let displayTime = 'Now';
          let isReceivedToday = true;

          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                const now = new Date();
                isReceivedToday =
                  d.getDate() === now.getDate() &&
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear();

                if (isReceivedToday) {
                  displayTime = d.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                } else {
                  const diffTime = Math.abs(now - d);
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays === 1) {
                    displayTime = `Yesterday, ${d.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`;
                  } else if (diffDays < 7 && diffDays > 1) {
                    displayTime = `${diffDays} days ago`;
                  } else {
                    displayTime = d.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });
                  }
                }
              }
            } catch (_) {}
          }

          return {
            id:
              item.id ||
              item._id ||
              String(Date.now()),

            title:
              item.title ||
              item.name ||
              'Tournament team invite',

            subtitle: calculatedSubtitle,

            time: displayTime,
            isReceivedToday,

            icon,
            iconBg,
            iconColor,

            status: item.status,
            actionable: item.actionable,

            isRead:
              String(item.status || '').toLowerCase() === 'read' ||
              String(item.status || '').toLowerCase() === 'accepted' ||
              String(item.status || '').toLowerCase() === 'rejected' ||
              !!item.isRead ||
              !!item.read ||
              item.readAt !== null,

            type: item.type,

            rawItem: item,
          };
        });

        const activeNotifications = formatted.filter(
          (n) => !respondedIds.includes(String(n.id))
        );

        const activeToday = activeNotifications.filter((n) => n.isReceivedToday);
        const activeEarlier = activeNotifications.filter((n) => !n.isReceivedToday);

        setTodayList(activeToday);
        setEarlierList(activeEarlier);
      }
    } catch (err) {
      console.log(
        'Fetch notifications error:',
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();


      const onBackPress = () => {
        navigation.goBack();
        return true;
      };


      const subscription =
        BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress
        );


      return () => subscription.remove();
    }, [navigation, respondedIds])
  );



  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
  };


  // Commented out handleMarkAllRead for now
  // const handleMarkAllRead = async () => {
  //   try {
  //     await markAllNotificationsReadApi();
  //   } catch (err) {
  //     console.log('Mark all read note error:', err);
  //   }
  //   setTodayList((prev) => prev.map((item) => ({ ...item, isRead: true })));
  //   setEarlierList((prev) => prev.map((item) => ({ ...item, isRead: true })));
  // };

  const handleClearAll = async () => {
    try {
      await clearAllNotificationsApi();
    } catch (err) {
      console.log('Clear all notifications API error:', err);
    }

    setTodayList([]);
    setEarlierList([]);
    Toast.show({
      type: 'success',
      text1: 'Notifications Cleared',
      text2: 'All notifications cleared.',
    });
  };


  // ==========================================================
  // Mark individual notification as read
  // ==========================================================

  const handleCardPress = async (item) => {
    if (
      !item.isRead &&
      isUuid(String(item.id))
    ) {
      try {
        await markNotificationReadApi(item.id);


        setTodayList((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                ...i,
                isRead: true,
              }
              : i
          )
        );


        setEarlierList((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                ...i,
                isRead: true,
              }
              : i
          )
        );
      } catch (err) {
        console.log(
          'Mark read error:',
          err
        );
      }
    }

    const raw = item.rawItem || item;
    const data = raw.data || item.data || {};
    if (data.deepLink || data.tournamentId) {
      processDeepLink(data, navigation);
    }
  };


  const handleAcceptInvite = async (item) => {
    const raw = item.rawItem || item;


    const notifId =
      raw.id ||
      raw._id ||
      item.id;


    const type = String(
      raw.type ||
      item.type ||
      ''
    ).toUpperCase();


    if (
      !notifId ||
      !isUuid(String(notifId))
    ) {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: 'Invalid notification id.',
      });

      return;
    }


    setLoadingId(item.id);
    setActionType('accept');


    try {

      const res =
        await respondToNotificationApi(
          notifId,
          {
            action: 'accept',
          }
        );


      // Mark notification as read
      try {
        await markNotificationReadApi(
          notifId
        );
      } catch (mErr) {
        console.log(
          'Mark read note:',
          mErr
        );
      }


      const successMsg =
        type.includes('TOURNAMENT')
          ? 'Tournament invite accepted. It now appears under Invited.'
          : `Joined ${res?.invite?.teamName ||
          res?.teamName ||
          'the team'
          }.`;


      Toast.show({
        type: 'success',
        text1: 'Invite Accepted',
        text2: successMsg,
      });


      // Remove responded notification
      setRespondedIds((prev) => [
        ...prev,
        String(item.id),
      ]);


      setTodayList((prev) =>
        prev.filter(
          (i) => i.id !== item.id
        )
      );


      setEarlierList((prev) =>
        prev.filter(
          (i) => i.id !== item.id
        )
      );

      // Deep link to tournament directly after accepting invite
      const data = raw.data || item.data || {};
      if (data.deepLink || data.tournamentId) {
        processDeepLink(data, navigation);
      }
    } catch (err) {
      console.log(
        'Accept invite error:',
        err
      );


      const errData =
        err?.response?.data;


      const errMsg =
        typeof errData === 'string'
          ? errData
          : errData?.error ||
          errData?.message ||
          '';


      if (
        String(errMsg)
          .toLowerCase()
          .includes('already accepted') ||
        String(errMsg)
          .toLowerCase()
          .includes('already joined')
      ) {
        Toast.show({
          type: 'success',
          text1: 'Invite Accepted',
          text2: 'Invite was already accepted.',
        });


        setRespondedIds((prev) => [
          ...prev,
          String(item.id),
        ]);


        setTodayList((prev) =>
          prev.filter(
            (i) => i.id !== item.id
          )
        );


        setEarlierList((prev) =>
          prev.filter(
            (i) => i.id !== item.id
          )
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Action Failed',
          text2:
            errMsg ||
            'Could not accept invite. Please try again.',
        });
      }
    } finally {
      setLoadingId(null);
      setActionType(null);
    }
  };


  // ==========================================================
  // Reject invite
  // ==========================================================

  const handleRejectInvite = async (item) => {
    const raw = item.rawItem || item;


    const notifId =
      raw.id ||
      raw._id ||
      item.id;


    if (
      !notifId ||
      !isUuid(String(notifId))
    ) {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: 'Invalid notification id.',
      });

      return;
    }


    setLoadingId(item.id);
    setActionType('reject');


    try {
      await respondToNotificationApi(
        notifId,
        {
          action: 'reject',
        }
      );


      try {
        await markNotificationReadApi(
          notifId
        );
      } catch (mErr) {
        console.log(
          'Mark read note:',
          mErr
        );
      }


      Toast.show({
        type: 'info',
        text1: 'Invite Declined',
        text2: 'Invite declined.',
      });


      setRespondedIds((prev) => [
        ...prev,
        String(item.id),
      ]);


      setTodayList((prev) =>
        prev.filter(
          (i) => i.id !== item.id
        )
      );


      setEarlierList((prev) =>
        prev.filter(
          (i) => i.id !== item.id
        )
      );
    } catch (err) {
      console.log(
        'Reject invite error:',
        err
      );


      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Could not decline invite. Please try again.';


      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: msg,
      });
    } finally {
      setLoadingId(null);
      setActionType(null);
    }
  };



  const renderNotificationCard = (item) => {
    const typeStr = (item.type || '').toUpperCase();
    const statusStr = String(item.status || item.rawItem?.status || '').toLowerCase();
    const isUnreadStatus = statusStr === 'unread' || (!item.status && !item.isRead);
    const isActionable = item.actionable !== false && item.rawItem?.actionable !== false;

    const isIncomingInvite =
      typeStr === 'TEAM_MEMBER_INVITE' ||
      typeStr === 'TOURNAMENT_TEAM_INVITE';

    const showActionButtons =
      isIncomingInvite &&
      isUnreadStatus &&
      isActionable &&
      !respondedIds.includes(String(item.id));

    const isHighlightCard = isUnreadStatus;


    return (
      <View
        key={item.id}
        style={styles.notificationCardWrapper}
      >
        {/* ====================================================
            Notification Card
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.notificationCard,

            isHighlightCard
              ? styles.limeBorderCard
              : styles.greyBorderCard,
          ]}
          onPress={() =>
            handleCardPress(item)
          }
          activeOpacity={0.85}
        >
          {/* Icon */}

          <View style={styles.iconCircle}>
            <AuthIcon
              name={item.icon}
              size={moderateScale(20)}
              color="#093A24"
            />
          </View>


          {/* Text */}

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>
              {item.title}
            </Text>


            {!!item.subtitle && (
              <Text
                style={styles.cardSubtitle}
              >
                {item.subtitle}
              </Text>
            )}
          </View>


          {/* Time & Status */}
          <View style={styles.rightSideContainer}>
            <Text style={styles.timeText}>
              {item.time}
            </Text>
            {(statusStr === 'accepted' || statusStr === 'accept') && (
              <View style={styles.statusBadgeAccepted}>
                <Text style={styles.statusAcceptedText}>Accepted</Text>
              </View>
            )}
            {(statusStr === 'rejected' || statusStr === 'reject' || statusStr === 'declined') && (
              <View style={styles.statusBadgeRejected}>
                <Text style={styles.statusRejectedText}>Rejected</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>


        {showActionButtons && (
            <View
              style={styles.actionButtonsRow}
            >
              {/* DECLINE */}

              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() =>
                  handleRejectInvite(item)
                }
                disabled={
                  loadingId === item.id
                }
                activeOpacity={0.8}
              >
                {loadingId === item.id && actionType === 'reject' ? (
                  <Text
                    style={
                      styles.declineBtnText
                    }
                  >
                    DECLINING...
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.declineBtnText
                    }
                  >
                    DECLINE
                  </Text>
                )}
              </TouchableOpacity>


              {/* ACCEPT */}

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() =>
                  handleAcceptInvite(item)
                }
                disabled={
                  loadingId === item.id
                }
                activeOpacity={0.8}
              >
                {loadingId === item.id && actionType === 'accept' ? (
                  <Text
                    style={
                      styles.acceptBtnText
                    }
                  >
                    ACCEPTING...
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.acceptBtnText
                    }
                  >
                    ACCEPT
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />


      <View style={styles.headerRow}>
        <CircularBackButton
          onPress={() =>
            navigation.goBack()
          }
        />


        <TouchableOpacity
          onPress={handleClearAll}
          activeOpacity={0.7}
        >
          <Text
            style={styles.markAllReadText}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>



      <Text style={styles.mainTitle}>
        Notifications
      </Text>


      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#093A24"
          />
        }
      >


        {!loading &&
          todayList.length === 0 &&
          earlierList.length === 0 && (
            <View
              style={styles.emptyStateWrap}
            >
              <Text
                style={
                  styles.emptyStateText
                }
              >
                No notifications yet. New
                invites and activity updates
                will appear here!
              </Text>
            </View>
          )}

        {todayList.length > 0 && (
          <>
            <Text
              style={
                styles.sectionHeaderTitle
              }
            >
              Today
            </Text>


            {todayList.map(
              renderNotificationCard
            )}
          </>
        )}




        {earlierList.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionHeaderTitle,
                {
                  marginTop: hp(2),
                },
              ]}
            >
              Earlier
            </Text>


            {earlierList.map(
              renderNotificationCard
            )}
          </>
        )}



        <View
          style={{
            height: hp(4),
          }}
        />
      </ScrollView>

    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: wp(5),

    paddingTop:
      Platform.OS === 'ios'
        ? hp(1.5)
        : hp(2),

    paddingBottom: hp(1.5),
  },


  markAllReadText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13.5),

    color: '#093A24',
  },


  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),

    color: '#093A24',

    paddingHorizontal: wp(5),

    marginBottom: hp(2),
  },

  scroll: {
    flex: 1,
  },


  scrollContent: {
    flexGrow: 1,

    paddingHorizontal: wp(5),

    paddingTop: hp(0.5),

    paddingBottom: hp(4),
  },



  sectionHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),

    color: '#093A24',

    marginBottom: hp(1.5),
  },



  notificationCardWrapper: {
    marginBottom: hp(2),
  },


  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: moderateScale(22),

    paddingHorizontal: wp(4.5),

    paddingVertical: hp(2),

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,
  },


  limeBorderCard: {
    borderWidth: 2,
    borderColor: '#BCFF00',
  },



  greyBorderCard: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },




  iconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),

    borderRadius: moderateScale(22),

    backgroundColor: '#BCFF00',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: wp(3.5),
  },



  textContainer: {
    flex: 1,

    marginRight: wp(2),
  },


  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),

    color: '#093A24',
  },


  cardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),

    color: '#5A7367',

    marginTop: hp(0.4),

    lineHeight: fontSize(17),
  },


  timeText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),

    color: '#8A9A90',
  },



  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: wp(3.5),

    marginTop: hp(1.4),
  },



  declineBtn: {
    flex: 1,

    height: hp(5.5),

    borderRadius: moderateScale(30),

    backgroundColor: COLORS.white,

    borderWidth: 1.5,

    borderColor: '#093A24',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 4,

    elevation: 2,
  },


  declineBtnText: {
    fontFamily: FONTS.bold,

    fontSize: fontSize(13),

    color: '#093A24',

    letterSpacing: 0.5,
  },



  acceptBtn: {
    flex: 1,

    height: hp(5.5),

    borderRadius: moderateScale(30),

    backgroundColor: '#BCFF00',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#BCFF00',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.3,

    shadowRadius: 8,

    elevation: 4,
  },


  acceptBtnText: {
    fontFamily: FONTS.bold,

    fontSize: fontSize(13),

    color: '#093A24',

    letterSpacing: 0.5,
  },



  emptyStateWrap: {
    backgroundColor: COLORS.white,

    borderWidth: 1.5,

    borderColor: '#E2E8F0',

    borderRadius: moderateScale(20),

    padding: moderateScale(20),

    marginVertical: hp(2),

    alignItems: 'center',
  },


  emptyStateText: {
    fontFamily: FONTS.medium,

    fontSize: fontSize(13.5),

    color: '#718096',

    textAlign: 'center',

    lineHeight: fontSize(20),
  },

  rightSideContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: wp(2),
  },
  statusBadgeAccepted: {
    backgroundColor: 'rgba(9, 58, 36, 0.1)',
    borderRadius: moderateScale(6),
    paddingHorizontal: wp(1.8),
    paddingVertical: hp(0.3),
    marginTop: hp(0.4),
  },
  statusAcceptedText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: '#093A24',
    textTransform: 'capitalize',
  },
  statusBadgeRejected: {
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    borderRadius: moderateScale(6),
    paddingHorizontal: wp(1.8),
    paddingVertical: hp(0.3),
    marginTop: hp(0.4),
  },
  statusRejectedText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: '#E53E3E',
    textTransform: 'capitalize',
  },
});


export default NotificationsScreen;