import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getTeamsApi, deleteTeamApi } from '../../services/teamService';

const teamBg = require('../../assets/Images/team_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
const editIcon = require('../../assets/Images/edit.png');

const TEAM_IMAGES = [teamBg, trophyImg, tournamentBg];
const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const YourTeamScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;

  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTeamsApi(searchQuery ? { search: searchQuery } : undefined);
      const rawTeams = res?.teams || res?.data?.teams || res?.data || (Array.isArray(res) ? res : []);
      const formatted = (Array.isArray(rawTeams) ? rawTeams : []).map((t, index) => {
        const id = t.id || t._id || t.teamId || `team-${index}`;
        // const location =
        //   t.city && t.state
        //     ? `${t.city}, ${t.state}`
        //     : t.location || t.country || t.city || '';
        const creatorUserId = t.creatorUserId || t.creatorId || t.createdBy;
        return {
          ...t,
          id,
          name: t.name || t.teamName || 'Team',
          // location,
          creatorUserId,
          isCreator:
            Boolean(creatorUserId) &&
            Boolean(currentUserId) &&
            String(creatorUserId).toLowerCase() === String(currentUserId).toLowerCase(),
          image: TEAM_IMAGES[index % TEAM_IMAGES.length],
        };
      });
      setTeams(formatted);
    } catch (err) {
      console.log('YourTeamScreen getTeamsApi error:', err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentUserId]);

  const onBackPress = React.useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress, loadTeams])
  );

  const confirmDeleteTeam = (team) => {
    if (!team?.isCreator) {
      Toast.show({
        type: 'info',
        text1: 'Cannot Delete',
        text2: 'Only the team creator can delete this team.',
      });
      return;
    }

    Alert.alert(
      'Delete team?',
      `Delete "${team.name}"? This cannot be undone. The team must not be linked to any tournaments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteTeam(team),
        },
      ],
    );
  };

  const handleDeleteTeam = async (team) => {
    const teamId = team?.id || team?._id;
    if (!teamId || !isUuid(String(teamId))) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: 'Invalid team id.',
      });
      return;
    }

    try {
      setDeletingId(String(teamId));
      await deleteTeamApi(teamId);
      setTeams((prev) => prev.filter((t) => String(t.id) !== String(teamId)));
      Toast.show({
        type: 'success',
        text1: 'Team Deleted',
        text2: `"${team.name}" was deleted.`,
      });
    } catch (err) {
      console.log('Delete team error:', err);
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Could not delete team. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: backendMsg,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeams = teams.filter((t) =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Main ScrollView */}
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          {/* Header Title Block */}
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Your Teams</Text>
            <Text style={styles.headerSubtitle}>{teams.length} Active Teams</Text>
          </View>
        </ImageBackground>

        {/* ── 2. Create Team Straddling Card ── */}
        <TouchableOpacity
          style={styles.createTeamCard}
          onPress={() => navigation.navigate('CreateTeam')}
          activeOpacity={0.85}
        >
          <View style={styles.plusIconCircle}>
            <AuthIcon name="plus" size={moderateScale(18)} color="#093A24" />
          </View>
          <View style={styles.createTeamTextCol}>
            <Text style={styles.createTeamSublabel}>NEW TEAM</Text>
            <Text style={styles.createTeamTitle}>CREATE TEAM</Text>
          </View>
        </TouchableOpacity>

        {/* ── 3. Search Bar ── */}
        <View style={styles.searchBarWrapper}>
          <AuthIcon name="search" size={moderateScale(16)} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Team"
            placeholderTextColor="#718096"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── 4. Team Cards List ── */}
        {loading ? (
          <ActivityIndicator color="#093A24" style={{ marginTop: hp(4) }} />
        ) : filteredTeams.length === 0 ? (
          <Text style={styles.emptyText}>No teams yet. Create one to get started.</Text>
        ) : (
          filteredTeams.map((item) => (
            <TouchableOpacity key={item.id} style={styles.teamCard} activeOpacity={0.85}>
              <Image source={item.image} style={styles.teamAvatar} />

              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.name}</Text>
                {/* <Text style={styles.teamLocation}>📍 {item.location || '—'}</Text> */}
              </View>

              {item.isCreator ? (
                <View style={styles.teamActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditPlayers', { team: item })}
                    activeOpacity={0.7}
                  >
                    <Image source={editIcon} style={styles.editIconImg} resizeMode="contain" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteTeam(item)}
                    disabled={deletingId === String(item.id)}
                    activeOpacity={0.7}
                  >
                    {deletingId === String(item.id) ? (
                      <ActivityIndicator size="small" color="#B91C1C" />
                    ) : (
                      <AuthIcon name="trash" size={moderateScale(16)} color="#B91C1C" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: hp(4) }} />
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

  // Header Banner
  header: {
    backgroundColor: '#0A4A2A',
    paddingTop: Platform.OS === 'ios' ? hp(7.5) : hp(5.5),
    paddingBottom: hp(8),
    paddingHorizontal: wp(5),
    position: 'relative',
    overflow: 'hidden',
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
    elevation: 3,
    marginBottom: hp(2.5),
  },
  headerTitleBlock: {},
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: COLORS.white,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: 'rgba(255,255,255,0.75)',
    marginTop: hp(0.4),
  },

  // Create Team Card
  createTeamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(5),
    marginTop: -hp(4),
    borderRadius: moderateScale(16),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 10,
  },
  plusIconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
  },
  createTeamTextCol: {
    flex: 1,
  },
  createTeamSublabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(10),
    color: '#718096',
    letterSpacing: 1,
  },
  createTeamTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
    marginTop: 2,
  },

  // Search
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    marginBottom: hp(1.5),
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(3.5),
    height: moderateScale(48),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
    color: '#1A202C',
    paddingVertical: 0,
  },

  // Team Card
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
    borderRadius: moderateScale(14),
    padding: wp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  teamAvatar: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(12),
    marginRight: wp(3),
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  teamLocation: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#718096',
    marginTop: 2,
  },
  editBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#F0F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  deleteBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconImg: {
    width: moderateScale(16),
    height: moderateScale(16),
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
    color: '#718096',
    textAlign: 'center',
    marginTop: hp(4),
    marginHorizontal: wp(8),
  },
});

export default YourTeamScreen;
