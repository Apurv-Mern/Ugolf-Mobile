// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
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
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';

// import Toast from 'react-native-toast-message';

// import AuthButton from '../../components/common/AuthButton';
// import AuthIcon from '../../components/common/AuthIcon';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// const teamBg = require('../../assets/Images/team_bg.jpg');
// const trophyImg = require('../../assets/Images/ trophy.png');
// const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
// const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

// import { getTeamByIdApi } from '../../services/teamService';

// const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// const SelectPlayerPositionScreen = ({ navigation, route }) => {
//   const currentUser = useSelector((state) => state.auth.user);
//   const currentUserId = currentUser?.id || currentUser?._id;

//   const tournament = route?.params?.tournament;
//   const selectedTeam = route?.params?.selectedTeam;
//   const rawPlayMode = route?.params?.playMode || tournament?.playMode || '';
//   const playMode = String(rawPlayMode).toLowerCase();
//   const teamId = selectedTeam?.id || selectedTeam?._id;

//   const [players, setPlayers] = useState([]);
//   const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Load team members from backend API
//   const loadTeamMembers = async () => {
//     if (teamId && isUuid(String(teamId))) {
//       try {
//         setLoading(true);
//         const res = await getTeamByIdApi(teamId);
//         const teamObj = res?.team || res?.data?.team || res?.data || res;
//         const membersList = teamObj?.members || teamObj?.players || [];

//         if (Array.isArray(membersList) && membersList.length > 0) {
//           const formatted = membersList.map((m, index) => ({
//             id: m.playerUserId || m.id || m._id || String(index),
//             name: m.displayName || m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Player ${index + 1}`,
//             isCaptain: index === 0,
//             image: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
//           }));
//           setPlayers(formatted);
//         }
//       } catch (err) {
//         console.log('Load position players error:', err);
//       } finally {
//         setLoading(false);
//       }
//     } else if (selectedTeam?.members && Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0) {
//       const formatted = selectedTeam.members.map((m, index) => ({
//         id: m.playerUserId || m.id || m._id || String(index),
//         name: m.displayName || m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Player ${index + 1}`,
//         isCaptain: index === 0,
//         image: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
//       }));
//       setPlayers(formatted);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       loadTeamMembers();

//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };

//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [teamId, navigation])
//   );

//   const captainUserId = selectedTeam?.creatorUserId || selectedTeam?.creatorId || selectedTeam?.createdBy || (players.length > 0 ? players[0]?.id : null);
//   const isTeamCaptain = Boolean(
//     currentUserId &&
//     captainUserId &&
//     String(captainUserId).toLowerCase() === String(currentUserId).toLowerCase()
//   );

//   const tournamentCreatorId = tournament?.creatorUserId || tournament?.creatorId || tournament?.createdBy;
//   const isTournamentCreator = Boolean(
//     currentUserId &&
//     tournamentCreatorId &&
//     String(tournamentCreatorId).toLowerCase() === String(currentUserId).toLowerCase()
//   );

//   const handleStartGame = () => {
//     const isChallengeMode = playMode === 'challenge';
//     const requiredTeamSize = tournament?.teamSize || selectedTeam?.teamSize;

//     if (isChallengeMode && requiredTeamSize && players.length !== Number(requiredTeamSize)) {
//       Toast.show({
//         type: 'error',
//         text1: 'Invalid Team Size',
//         text2: `Requires ${requiredTeamSize} players (team has ${players.length}).`,
//       });
//       return;
//     }

//     if (playMode === 'challenge' && isTournamentCreator) {
//       navigation.navigate('InviteOtherTeams', {
//         tournament,
//         selectedTeam,
//         players,
//         playMode,
//       });
//     } else {
//       navigation.navigate('SelectGame', {
//         tournament,
//         selectedTeam,
//         players,
//         playMode,
//       });
//     }
//   };

//   const handleChangePositionTarget = (targetPosition) => {
//     if (!selectedPlayerForModal) return;
//     const currentIndex = selectedPlayerForModal.index;
//     const targetIndex = targetPosition - 1;

//     if (currentIndex === targetIndex) {
//       setSelectedPlayerForModal(null);
//       return;
//     }

//     const updated = [...players];
//     const item = updated.splice(currentIndex, 1)[0];
//     updated.splice(targetIndex, 0, item);
//     setPlayers(updated);
//     setSelectedPlayerForModal(null);
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['bottom']}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       {/* Main ScrollView */}
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── 1. Header Banner ── */}
//         <ImageBackground source={teamBg} style={styles.header} resizeMode="cover">
//           <View style={styles.headerOverlay} />

//           {/* Back Button */}
//           <TouchableOpacity
//             style={styles.backButtonCircle}
//             onPress={() => navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
//           </TouchableOpacity>

//           <Text style={styles.bannerTitle}>Select your player's position</Text>
//         </ImageBackground>

//         {/* ── 2. White Content Container ── */}
//         <View style={styles.contentContainer}>
//           {/* Members Header Row */}
//           <View style={styles.membersHeaderRow}>
//             <Text style={styles.membersTitle}>Members</Text>
//             {isTeamCaptain && (
//               <TouchableOpacity
//                 onPress={() =>
//                   navigation.navigate('EditPlayers', {
//                     tournament,
//                     team: selectedTeam,
//                     selectedTeam,
//                     players,
//                   })
//                 }
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.editBtnText}>Edit</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Player Cards List */}
//           {players.map((item, index) => (
//             <TouchableOpacity
//               key={item.id}
//               style={styles.playerCard}
//               onPress={() => isTeamCaptain && setSelectedPlayerForModal({ ...item, index })}
//               activeOpacity={isTeamCaptain ? 0.85 : 1}
//             >
//               {/* Avatar Image */}
//               <Image source={item.image} style={styles.playerAvatar} />

//               {/* Player Info (Name & Captain Badge) */}
//               <View style={styles.playerInfo}>
//                 <Text style={styles.playerName}>{item.name}</Text>
//                 {item.isCaptain && (
//                   <View style={styles.captainBadge}>
//                     <AuthIcon name="crown" size={moderateScale(12)} color="#093A24" style={styles.crownIcon} />
//                     <Text style={styles.captainText}>Captain</Text>
//                   </View>
//                 )}
//               </View>

//               {/* Position Number & Solid Double Arrow Icon */}
//               <View style={styles.positionRightCol}>
//                 <Text style={styles.positionNumber}>{index + 1}</Text>
//                 {isTeamCaptain && (
//                   <View style={styles.iconCircleWrap}>
//                     <AuthIcon name="up-down" size={moderateScale(20)} color="#093A24" />
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>
//           ))}

//           <View style={{ height: hp(4) }} />
//         </View>
//       </ScrollView>

//       {/* Position Selector Modal */}
//       <Modal
//         visible={!!selectedPlayerForModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSelectedPlayerForModal(null)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setSelectedPlayerForModal(null)}
//         >
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Change Position for {selectedPlayerForModal?.name}
//             </Text>
//             <Text style={styles.modalSubtitle}>Tap position number to set:</Text>

//             <View style={styles.modalPosRow}>
//               {players.map((_, i) => {
//                 const posNum = i + 1;
//                 const isCurrent = selectedPlayerForModal?.index === i;
//                 return (
//                   <TouchableOpacity
//                     key={posNum}
//                     style={[styles.posOptionCircle, isCurrent && styles.posOptionCircleActive]}
//                     onPress={() => handleChangePositionTarget(posNum)}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={[styles.posOptionText, isCurrent && styles.posOptionTextActive]}>
//                       {posNum}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>

//             <TouchableOpacity
//               style={styles.modalCloseBtn}
//               onPress={() => setSelectedPlayerForModal(null)}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.modalCloseText}>CANCEL</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Footer Start Game Button */}
//       <View style={styles.btnFixedBottom}>
//         <AuthButton title="START GAME" onPress={handleStartGame} />
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
//   },
//   scrollContent: {
//     paddingBottom: hp(2),
//   },

//   // ── 1. Header Banner ──
//   header: {
//     backgroundColor: '#093A24',
//     paddingTop: Platform.OS === 'ios' ? hp(7.5) : (StatusBar.currentHeight || 24) + hp(1.5),
//     paddingBottom: hp(5),
//     paddingHorizontal: wp(5),
//     position: 'relative',
//   },
//   headerOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(9, 58, 36, 0.40)',
//   },
//   backButtonCircle: {
//     width: moderateScale(42),
//     height: moderateScale(42),
//     borderRadius: moderateScale(21),
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
//     fontSize: fontSize(26),
//     color: COLORS.white,
//     lineHeight: fontSize(34),
//   },

//   // ── 2. Content ──
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: wp(5),
//     paddingTop: hp(2.5),
//   },
//   membersHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: hp(2),
//   },
//   membersTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(17),
//     color: '#093A24',
//   },
//   editBtnText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(14),
//     color: '#093A24',
//   },

//   // Player Cards matching Figma
//   playerCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.8),
//     marginBottom: hp(1.5),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.03,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   playerAvatar: {
//     width: moderateScale(48),
//     height: moderateScale(48),
//     borderRadius: moderateScale(24),
//     marginRight: wp(3.5),
//     backgroundColor: '#EDF5EF',
//   },
//   playerInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   playerName: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24',
//   },
//   captainBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#BCFF00',
//     borderRadius: moderateScale(12),
//     paddingHorizontal: wp(2.5),
//     paddingVertical: hp(0.3),
//     marginTop: hp(0.5),
//     alignSelf: 'flex-start',
//   },
//   crownIcon: {
//     marginRight: wp(1),
//   },
//   captainText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10.5),
//     color: '#093A24',
//   },
//   positionRightCol: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(3),
//     paddingLeft: wp(2),
//   },
//   positionNumber: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(22),
//     color: '#093A24',
//   },
//   iconCircleWrap: {
//     padding: moderateScale(4),
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.45)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: wp(6),
//   },
//   modalContent: {
//     width: '100%',
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(24),
//     padding: moderateScale(20),
//     alignItems: 'center',
//     elevation: 5,
//   },
//   modalTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(17),
//     color: '#093A24',
//     textAlign: 'center',
//     marginBottom: hp(0.5),
//   },
//   modalSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: '#718096',
//     marginBottom: hp(2.5),
//   },
//   modalPosRow: {
//     flexDirection: 'row',
//     gap: wp(4),
//     marginBottom: hp(3),
//   },
//   posOptionCircle: {
//     width: moderateScale(48),
//     height: moderateScale(48),
//     borderRadius: moderateScale(24),
//     borderWidth: 2,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F8FAF9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   posOptionCircleActive: {
//     borderColor: '#093A24',
//     backgroundColor: '#BCFF00',
//   },
//   posOptionText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(18),
//     color: '#718096',
//   },
//   posOptionTextActive: {
//     color: '#093A24',
//   },
//   modalCloseBtn: {
//     paddingVertical: hp(1),
//     paddingHorizontal: wp(6),
//   },
//   modalCloseText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#718096',
//     letterSpacing: 0.5,
//   },

//   // Fixed Bottom Button
//   btnFixedBottom: {
//     backgroundColor: COLORS.white,
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//     paddingHorizontal: wp(5),
//     paddingBottom: hp(2.5),
//     paddingTop: hp(1.5),
//   },
// });

// export default SelectPlayerPositionScreen;



import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const teamBg = require('../../assets/Images/team_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

import { getTeamByIdApi } from '../../services/teamService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const SelectPlayerPositionScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;

  const tournament = route?.params?.tournament;
  const selectedTeam = route?.params?.selectedTeam;
  const rawPlayMode = route?.params?.playMode || tournament?.playMode || '';
  const playMode = String(rawPlayMode).toLowerCase();
  const teamId = selectedTeam?.id || selectedTeam?._id;

  const [players, setPlayers] = useState([]);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load team members from backend API
  const loadTeamMembers = async () => {
    if (teamId && isUuid(String(teamId))) {
      try {
        setLoading(true);
        const res = await getTeamByIdApi(teamId);
        const teamObj = res?.team || res?.data?.team || res?.data || res;
        const membersList = teamObj?.members || teamObj?.players || [];

        if (Array.isArray(membersList) && membersList.length > 0) {
          const formatted = membersList.map((m, index) => ({
            id: m.playerUserId || m.id || m._id || String(index),
            name: m.displayName || m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Player ${index + 1}`,
            isCaptain: index === 0,
            image: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
          }));
          setPlayers(formatted);
        }
      } catch (err) {
        console.log('Load position players error:', err);
      } finally {
        setLoading(false);
      }
    } else if (selectedTeam?.members && Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0) {
      const formatted = selectedTeam.members.map((m, index) => ({
        id: m.playerUserId || m.id || m._id || String(index),
        name: m.displayName || m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Player ${index + 1}`,
        isCaptain: index === 0,
        image: index % 3 === 0 ? trophyImg : index % 3 === 1 ? homescreenBg : tournamentBg,
      }));
      setPlayers(formatted);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTeamMembers();

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [teamId, navigation])
  );

  const captainUserId = selectedTeam?.creatorUserId || selectedTeam?.creatorId || selectedTeam?.createdBy || (players.length > 0 ? players[0]?.id : null);
  const isTeamCaptain = Boolean(
    currentUserId &&
    captainUserId &&
    String(captainUserId).toLowerCase() === String(currentUserId).toLowerCase()
  );

  const tournamentCreatorId = tournament?.creatorUserId || tournament?.creatorId || tournament?.createdBy;
  const isTournamentCreator = Boolean(
    currentUserId &&
    tournamentCreatorId &&
    String(tournamentCreatorId).toLowerCase() === String(currentUserId).toLowerCase()
  );

  const handleStartGame = () => {
    const isChallengeMode = playMode === 'challenge';
    const requiredTeamSize = tournament?.teamSize || selectedTeam?.teamSize;

    if (isChallengeMode && requiredTeamSize && players.length !== Number(requiredTeamSize)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Team Size',
        text2: `Requires ${requiredTeamSize} players (team has ${players.length}).`,
      });
      return;
    }

    if (playMode === 'challenge' && isTournamentCreator) {
      navigation.navigate('InviteOtherTeams', {
        tournament,
        selectedTeam,
        players,
        playMode,
      });
    } else {
      navigation.navigate('SelectGame', {
        tournament,
        selectedTeam,
        players,
        playMode,
      });
    }
  };

  const handleChangePositionTarget = (targetPosition) => {
    if (!selectedPlayerForModal) return;
    const currentIndex = selectedPlayerForModal.index;
    const targetIndex = targetPosition - 1;

    if (currentIndex === targetIndex) {
      setSelectedPlayerForModal(null);
      return;
    }

    const updated = [...players];
    const item = updated.splice(currentIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    setPlayers(updated);
    setSelectedPlayerForModal(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Main ScrollView */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header Banner ── */}
        <ImageBackground source={teamBg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>Select your player's position</Text>
        </ImageBackground>

        {/* ── 2. White Content Container ── */}
        <View style={styles.contentContainer}>
          {/* Members Header Row */}
          <View style={styles.membersHeaderRow}>
            <Text style={styles.membersTitle}>Members</Text>
            {isTeamCaptain && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditPlayers', {
                    tournament,
                    team: selectedTeam,
                    selectedTeam,
                    players,
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Player Cards List */}
          {players.map((item, index) => (
            <View key={item.id} style={styles.playerCard}>
              {/* Avatar Image */}
              <Image source={item.image} style={styles.playerAvatar} />

              {/* Player Info (Name) */}
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
              </View>

              {/* Position Number */}
              <View style={styles.positionRightCol}>
                <Text style={styles.positionNumber}>{index + 1}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: hp(4) }} />
        </View>
      </ScrollView>

      {/* Footer Start Game Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton title="START GAME" onPress={handleStartGame} />
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
  },
  scrollContent: {
    paddingBottom: hp(2),
  },

  // ── 1. Header Banner ──
  header: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(7.5) : (StatusBar.currentHeight || 24) + hp(1.5),
    paddingBottom: hp(5),
    paddingHorizontal: wp(5),
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.40)',
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
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
    fontSize: fontSize(26),
    color: COLORS.white,
    lineHeight: fontSize(34),
  },

  // ── 2. Content ──
  contentContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
  },
  membersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  membersTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),
    color: '#093A24',
  },
  editBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
  },

  // Player Cards matching Figma
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  playerAvatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    marginRight: wp(3.5),
    backgroundColor: '#EDF5EF',
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  captainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
    marginTop: hp(0.5),
    alignSelf: 'flex-start',
  },
  crownIcon: {
    marginRight: wp(1),
  },
  captainText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10.5),
    color: '#093A24',
  },
  positionRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingLeft: wp(2),
  },
  positionNumber: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(22),
    color: '#093A24',
  },
  iconCircleWrap: {
    padding: moderateScale(4),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),
    color: '#093A24',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  modalSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginBottom: hp(2.5),
  },
  modalPosRow: {
    flexDirection: 'row',
    gap: wp(4),
    marginBottom: hp(3),
  },
  posOptionCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posOptionCircleActive: {
    borderColor: '#093A24',
    backgroundColor: '#BCFF00',
  },
  posOptionText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#718096',
  },
  posOptionTextActive: {
    color: '#093A24',
  },
  modalCloseBtn: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(6),
  },
  modalCloseText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#718096',
    letterSpacing: 0.5,
  },

  // Fixed Bottom Button
  btnFixedBottom: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default SelectPlayerPositionScreen;
