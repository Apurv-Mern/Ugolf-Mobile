import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';
import { getTeamsApi, getTeamByIdApi, getTournamentTeamsApi, selectTournamentTeamApi } from '../../services/teamService';

const teamBg = require('../../assets/Images/team_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
const editIcon = require('../../assets/Images/edit.png');

const SelectTeamScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ownSelectedTeamId, setOwnSelectedTeamId] = useState(null);
  const [challengeLocked, setChallengeLocked] = useState(
    !!route?.params?.tournament?.challengeLocked,
  );

  // Load teams from backend API
  const loadTeams = async () => {
    try {
      setLoading(true);
      const tournamentId = route?.params?.tournament?.id || route?.params?.tournament?._id;

      let tournamentTeams = [];
      if (tournamentId && isUuid(String(tournamentId))) {
        try {
          const tRes = await getTournamentTeamsApi(tournamentId);
          const backendOwnId = tRes?.ownSelectedTeamId || tRes?.data?.ownSelectedTeamId;
          if (backendOwnId) setOwnSelectedTeamId(String(backendOwnId));
          if (tRes?.challengeLocked === true || tRes?.data?.challengeLocked === true) {
            setChallengeLocked(true);
          }
          tournamentTeams = tRes?.teams || tRes?.data?.teams || tRes?.data || [];
        } catch (tErr) {
          console.log('getTournamentTeamsApi note:', tErr);
        }
      }

      let rawTeams = [];
      try {
        const res = await getTeamsApi();
        rawTeams = res?.teams || res?.data?.teams || res?.data || (Array.isArray(res) ? res : []);
      } catch (e) {
        console.log('getTeamsApi error:', e);
      }

      if ((!rawTeams || rawTeams.length === 0) && Array.isArray(tournamentTeams) && tournamentTeams.length > 0) {
        rawTeams = tournamentTeams;
      }

      const formatted = (Array.isArray(rawTeams) ? rawTeams : []).map((t, index) => {
        const teamId = t.id || t._id || t.teamId || `team-${index}`;
        const teamName = t.name || t.teamName || t.title || 'Unknown Team';
        return {
          id: teamId,
          name: teamName,
          location: t.city && t.state ? `${t.city}, ${t.state}` : t.location || t.country || 'Australia',
          image: teamBg,
          creatorUserId: t.creatorUserId || t.creatorId || t.createdBy,
          ...t,
          // Override these explicitly so the spread above doesn't overwrite
          id: teamId,
          name: teamName,
        };
      });

      const ownTeamsOnly = formatted.filter((t) => {
        // 1. If this team is the selected team for this tournament, include it!
        if (ownSelectedTeamId && String(t.id) === String(ownSelectedTeamId)) return true;

        // 2. Check if user is in team players/members array
        const players = t.players || t.members || [];
        const isMember = Array.isArray(players) && players.some((p) => {
          const pId = p.playerUserId || p.userId || p.id || p._id;
          return currentUserId && String(pId).toLowerCase() === String(currentUserId).toLowerCase();
        });
        if (isMember) return true;

        // 3. Check creator / linked user ID
        const creatorId = t.creatorUserId || t.creatorId || t.createdBy || t.linkedByUserId;
        const isCreatorOrLink = creatorId && currentUserId && String(creatorId).toLowerCase() === String(currentUserId).toLowerCase();
        if (isCreatorOrLink) return true;

        // 4. Check if team is explicitly joined by user
        if (t.isJoined === true || t.joined === true || t.isMember === true) return true;

        // 5. Fallback: trust t.isOwnTeam unless explicitly false
        return t.isOwnTeam === true;
      });

      // Merge newly created team if passed via navigation params
      if (route?.params?.newTeam) {
        const newTeam = route.params.newTeam;
        const exists = ownTeamsOnly.some((t) => String(t.id) === String(newTeam.id));
        if (!exists) {
          ownTeamsOnly.unshift({
            ...newTeam,
            image: teamBg,
          });
        }
        setSelectedTeamId(newTeam.id);
      } else if (ownTeamsOnly.length > 0 && !selectedTeamId) {
        setSelectedTeamId(ownTeamsOnly[0].id);
      }

      setTeams(ownTeamsOnly);
    } catch (err) {
      console.log('Load teams error:', err);
      if (route?.params?.newTeam) {
        setTeams([route.params.newTeam]);
        setSelectedTeamId(route.params.newTeam.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [route?.params?.newTeam]);

  useFocusEffect(
    React.useCallback(() => {
      loadTeams();

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, route?.params?.newTeam])
  );

  const filteredTeams = teams.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tournamentParam = route?.params?.tournament;
  const tournamentId = tournamentParam?.id || tournamentParam?._id;
  const rawPlayMode = route?.params?.playMode || tournamentParam?.playMode || '';
  const playMode = String(rawPlayMode).toLowerCase();

  const tournamentCreatorId = tournamentParam?.creatorUserId || tournamentParam?.createdBy;
  const isInvitedMember = Boolean(
    tournamentCreatorId &&
    currentUserId &&
    String(tournamentCreatorId).toLowerCase() !== String(currentUserId).toLowerCase()
  );

  const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleStartGame = async () => {
    let selectedTeam = teams.find((t) => String(t.id) === String(selectedTeamId));
    if (!selectedTeam) {
      Toast.show({
        type: 'error',
        text1: 'Select Team',
        text2: 'Please select a team to proceed.',
      });
      return;
    }

    // Fetch fresh live team details directly from /teams/:id
    try {
      const liveRes = await getTeamByIdApi(selectedTeam.id);
      const fetchedTeam = liveRes?.team || liveRes?.data?.team || liveRes;
      if (fetchedTeam && typeof fetchedTeam === 'object') {
        selectedTeam = { ...selectedTeam, ...fetchedTeam };
      }
    } catch (gErr) {
      console.log('Error fetching live team details:', gErr);
    }

    const isChallengeMode = playMode === 'challenge';
    const requiredTeamSize = tournamentParam?.teamSize || selectedTeam?.teamSize;
    const membersArr = Array.isArray(selectedTeam?.members) ? selectedTeam.members : null;
    const currentMemberCount = membersArr !== null ? membersArr.length : (selectedTeam?.memberCount || selectedTeam?.membersCount || 0);

    if (isChallengeMode && requiredTeamSize && currentMemberCount > 0 && currentMemberCount !== Number(requiredTeamSize)) {
      Toast.show({
        type: 'error',
        text1: 'Team Size Mismatch',
        text2: `Requires ${requiredTeamSize} players (team has ${currentMemberCount}).`,
      });
      return;
    }

    if (tournamentId && isUuid(String(tournamentId)) && isUuid(String(selectedTeam.id))) {
      setSubmitting(true);
      try {
        if (!challengeLocked) {
          const payload = { teamId: selectedTeam.id };
          await selectTournamentTeamApi(tournamentId, payload);
          Toast.show({
            type: 'success',
            text1: 'Team Selected',
            text2: `Selected ${selectedTeam.name} for tournament!`,
          });
        }
      } catch (err) {
        console.log('Select tournament team note:', err);
        const backendMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not select this team.';
        Toast.show({
          type: 'error',
          text1: 'Select Team Failed',
          text2: backendMsg,
        });
        setSubmitting(false);
        return;
      } finally {
        setSubmitting(false);
      }
    }

    const rawPlayMode = route?.params?.playMode || tournamentParam?.playMode || 'practice';
    const normalizedPlayMode = String(rawPlayMode).toLowerCase().trim();
    const isPracticeMode = normalizedPlayMode === 'practice' || normalizedPlayMode === 'practice_round' || normalizedPlayMode.includes('practice');

    if (isPracticeMode) {
      navigation.navigate('SelectGame', {
        tournament: tournamentParam,
        selectedTeam,
        playMode: 'practice',
      });
    } else {
      navigation.navigate('SelectPlayerPosition', {
        tournament: tournamentParam,
        selectedTeam,
        playMode: normalizedPlayMode || 'challenge',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Main ScrollView ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 1. Header with BG Image ── */}
        <ImageBackground source={teamBg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainApp');
              }
            }}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>Select your Team</Text>
        </ImageBackground>

        {/* ── 2. Create Team Card ──
             ORIGINAL (always visible — kept for reference):

        <TouchableOpacity
          style={styles.createHeroCard}
          onPress={() => navigation.navigate('CreateTeam')}
          activeOpacity={0.88}
        >
          <View style={styles.createHeroIconCircle}>
            <AuthIcon name="plus" size={moderateScale(24)} color="#093A24" />
          </View>
          <View style={styles.createHeroTextWrap}>
            <Text style={styles.createHeroLabel}>NEW TEAM</Text>
            <Text style={styles.createHeroTitle}>CREATE TEAM</Text>
          </View>
        </TouchableOpacity>

        ── NEW (conditional): Hide for invited members, show for tournament creators ── */}
        {!isInvitedMember && !challengeLocked && (
          // Only tournament creators can create a new team.
          // Invited members (e.g. Tiya accepted Siya's invite) should only
          // select from the teams already linked to the tournament.
          <TouchableOpacity
            style={styles.createHeroCard}
            onPress={() => navigation.navigate('CreateTeam')}
            activeOpacity={0.88}
          >
            <View style={styles.createHeroIconCircle}>
              <AuthIcon name="plus" size={moderateScale(24)} color="#093A24" />
            </View>

            <View style={styles.createHeroTextWrap}>
              <Text style={styles.createHeroLabel}>NEW TEAM</Text>
              <Text style={styles.createHeroTitle}>CREATE TEAM</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── 3. Team List Section ── */}
        <View style={styles.section}>
          {/* Search Bar */}
          <View style={styles.searchBarWrapper}>
            <AuthIcon
              name="search"
              size={moderateScale(16)}
              color="#718096"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Team"
              placeholderTextColor="#718096"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Team List */}
          {loading ? (
            <ActivityIndicator size="large" color="#093A24" style={{ marginVertical: hp(4) }} />
          ) : filteredTeams.length === 0 ? (
            <View style={{ alignItems: 'center', marginVertical: hp(4) }}>
              <Text style={{ fontFamily: FONTS.medium, fontSize: fontSize(14), color: '#718096' }}>
                No teams found. Tap "CREATE TEAM" to start!
              </Text>
            </View>
          ) : (
            filteredTeams.map((item) => {
              const isSelected = String(selectedTeamId) === String(item.id);
              const creatorId = item.creatorUserId || item.creatorId || item.createdBy;
              const isMyTeam = Boolean(
                currentUserId && creatorId && String(creatorId).toLowerCase() === String(currentUserId).toLowerCase()
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.teamCard, isSelected && styles.teamCardSelected]}
                  onPress={() => {
                    if (challengeLocked) return;
                    setSelectedTeamId(item.id);
                  }}
                  activeOpacity={0.85}
                >
                  <Image source={item.image || teamBg} style={styles.teamThumbnail} />

                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{item.name}</Text>
                    {/* <Text style={styles.teamLocation}>📍 {item.location}</Text> */}
                  </View>

                  {isMyTeam && (
                    <TouchableOpacity
                      style={styles.teamEditBtn}
                      onPress={() =>
                        navigation.navigate('EditPlayers', {
                          team: item,
                          tournament: tournamentParam,
                          challengeLocked,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Image source={editIcon} style={styles.editIconImg} resizeMode="contain" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {/* Bottom Spacing */}
          <View style={{ height: hp(4) }} />
        </View>

        {/* Bottom Padding for fixed button */}
        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* Footer Continue Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton title="CONTINUE" loading={submitting} onPress={handleStartGame} />
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
    paddingBottom: hp(7.5),
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

  // ── 2. Overlapping Create Team Card (Centered, no bubbles) ──
  createHeroCard: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(18),
    paddingHorizontal: wp(4.5),
    height: hp(9.5),
    marginHorizontal: wp(5),
    marginTop: -hp(5),
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
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(30),
    height: hp(6),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4.5),
    marginBottom: hp(2.5),
  },
  searchIcon: {
    marginRight: wp(2.5),
  },
  searchInput: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#093A24',
    flex: 1,
    padding: 0,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    padding: moderateScale(14),
    marginBottom: hp(1.8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCardSelected: {
    borderColor: '#BCFF00',
    borderWidth: 2,
  },
  teamThumbnail: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(27),
    backgroundColor: '#EDF5EF',
  },
  teamInfo: {
    flex: 1,
    marginLeft: wp(4),
  },
  teamName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  teamLocation: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#718096',
    marginTop: hp(0.5),
  },
  teamEditBtn: {
    padding: moderateScale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconImg: {
    width: moderateScale(26),
    height: moderateScale(26),
  },
  bottomDotPattern: {
    height: hp(14),
    marginTop: hp(2),
    opacity: 0.7,
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

export default SelectTeamScreen;
