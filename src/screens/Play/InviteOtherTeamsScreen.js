import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import DotPattern from '../../components/common/DotPattern';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

import { shareTournamentLink } from '../../utils/shareUtils';
import {
  getTournamentInviteCandidatesApi,
  inviteTeamToTournamentApi,
  uninviteTeamFromTournamentApi,
  getTournamentTeamsApi,
} from '../../services/teamService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const InviteOtherTeamsScreen = ({ navigation, route }) => {
  const tournamentParam = route?.params?.tournament;
  const selectedTeam = route?.params?.selectedTeam;
  const playMode = route?.params?.playMode;
  const tournamentId = tournamentParam?.id || tournamentParam?._id;

  const [teamsList, setTeamsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Load candidate opponent teams from API
  const fetchInviteCandidates = async () => {
    if (!tournamentId || !isUuid(String(tournamentId))) return;

    try {
      setLoading(true);
      const [res, tRes] = await Promise.all([
        getTournamentInviteCandidatesApi(tournamentId, { search: searchQuery, page: 1, limit: 100 }).catch(() => null),
        getTournamentTeamsApi(tournamentId).catch(() => null),
      ]);

      const candidates = res?.teams || res?.data?.teams || res?.data || (Array.isArray(res) ? res : []);
      const joinedTeams = tRes?.teams || tRes?.data?.teams || tRes?.data || (Array.isArray(tRes) ? tRes : []);

      const joinedById = {};
      (Array.isArray(joinedTeams) ? joinedTeams : []).forEach((t) => {
        const id = String(t.id || t._id || t.teamId);
        joinedById[id] = t;
      });

      if (Array.isArray(candidates)) {
        const formatted = candidates.map((item, idx) => {
          const t = item?.team || item;
          const candidateTeamId = String(t.id || t._id || t.teamId || `candidate-team-${idx}`);
          const linked = joinedById[candidateTeamId];
          const statusRaw =
            item?.status ||
            item?.inviteStatus ||
            item?.state ||
            linked?.inviteStatus ||
            linked?.status ||
            t?.status ||
            t?.inviteStatus ||
            '';
          const statusLower = String(statusRaw).toLowerCase();
          const isAccepted =
            statusLower === 'accepted' ||
            // Backend invite-candidate status "invited" means accepted.
            statusLower === 'invited' ||
            statusLower === 'joined' ||
            statusLower === 'confirmed' ||
            !!item.isAccepted ||
            !!t.isAccepted;
          const isInvited =
            !!linked ||
            isAccepted ||
            statusLower === 'invited' ||
            statusLower === 'pending' ||
            !!item.isInvited ||
            !!t.isInvited;

          return {
            id: candidateTeamId,
            name: t.name || t.teamName || t.displayName || t.title || 'Opponent Team',
            memberCount: t.memberCount || (t.members ? t.members.length : 1),
            // city: t.city || t.location || '',
            status: statusLower,
            isInvited: isInvited,
            isAccepted: isAccepted,
            isOwnTeam: statusLower === 'your_team' || !!t.isOwnTeam || candidateTeamId === String(selectedTeam?.id),
          };
        });
        setTeamsList(formatted);
      }
    } catch (err) {
      console.log('Fetch invite candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInviteCandidates();
  }, [tournamentId, searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      fetchInviteCandidates();

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, tournamentId])
  );

  const handleToggleInvite = async (teamItem) => {
    if (!tournamentId || !isUuid(String(tournamentId))) return;

    setActionLoadingId(teamItem.id);
    try {
      if (teamItem.isInvited) {
        await uninviteTeamFromTournamentApi(tournamentId, teamItem.id);
        Toast.show({
          type: 'info',
          text1: 'Team Uninvited',
          text2: `${teamItem.name} has been removed from tournament.`,
        });
      } else {
        // Invite team — backend auto-dispatches notifications
        await inviteTeamToTournamentApi(tournamentId, { teamId: teamItem.id });

        Toast.show({
          type: 'success',
          text1: 'Invite Sent',
          text2: `Successfully invited ${teamItem.name} to tournament!`,
        });
      }
      // Server state is authoritative: pending does not mean accepted.
      await fetchInviteCandidates();
    } catch (err) {
      console.log('Toggle team invite error:', err);
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message || 'Could not update team invitation.';
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: backendMsg,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const invitedOpponents = teamsList.filter(
    (t) => !t.isOwnTeam && String(t.id) !== String(selectedTeam?.id) && t.isInvited
  );
  const invitedCount = invitedOpponents.length;

  const filteredTeams = teamsList.filter(
    (t) =>
      !t.isOwnTeam &&
      String(t.id) !== String(selectedTeam?.id) &&
      ((t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.city || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleContinue = () => {
    if (invitedCount === 0) {
      Toast.show({
        type: 'error',
        text1: 'Opponent Team Required',
        text2: 'Please invite an opponent team to challenge for this tournament.',
      });
      return;
    }

    // Opponent acceptance is shown and gated on Select game (start readiness).
    navigation.navigate('SelectGame', {
      tournament: tournamentParam,
      selectedTeam,
      playMode,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header Block */}
      <View style={styles.headerBlock}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Invite other teams</Text>
          <Text style={styles.headerSubtitle}>
            Own selected team: <Text style={{ fontFamily: FONTS.bold, color: '#093A24' }}>{selectedTeam?.name || 'Selected Team'}</Text> · Opponent teams: <Text style={{ fontFamily: FONTS.bold, color: '#2EA200' }}>{invitedCount}</Text>
          </Text>
        </View>
      </View>

      {/* Scrollable Team List */}
      <ScrollView
        style={styles.whiteCardContainer}
        contentContainerStyle={styles.whiteCardScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Share Join Link Card */}
        {(tournamentParam?.shareLinkEnabled === true || (tournamentParam?.shareLinkEnabled !== false && (!!tournamentParam?.joinUrl || !!tournamentParam?.joinToken))) ? (
          <TouchableOpacity
            style={styles.shareBannerCard}
            onPress={() => shareTournamentLink(tournamentParam)}
            activeOpacity={0.85}
          >
            <View style={styles.shareBannerLeft}>
              <View style={styles.shareIconCircle}>
                <AuthIcon name="share" size={moderateScale(18)} color="#093A24" />
              </View>
              <View style={styles.shareBannerTextWrap}>
                <Text style={styles.shareBannerTitle}>Share Join Link</Text>
                <Text style={styles.shareBannerSub}>Share link externally so players can join</Text>
              </View>
            </View>
            <View style={styles.shareBtnPill}>
              <Text style={styles.shareBtnPillText}>SHARE</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Disabled Invites Banner */}
        {tournamentParam?.invitesEnabled === false ? (
          <View style={styles.disabledInvitesWrap}>
            <Text style={styles.disabledInvitesText}>
              ⚠️ Direct team invitations were disabled for this tournament by the creator. Players can join using the shared join link above.
            </Text>
          </View>
        ) : null}

        {/* Search Bar & Teams list — only shown if invitesEnabled is NOT false */}
        {tournamentParam?.invitesEnabled !== false ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchBarWrapper}>
              <AuthIcon name="search" size={moderateScale(16)} color="#718096" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams by name or city..."
                placeholderTextColor="#718096"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Empty state if no teams available */}
            {!loading && filteredTeams.length === 0 && (
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyStateText}>
                  No other teams available to challenge yet. Another captain needs to create a team first.
                </Text>
              </View>
            )}

            {/* Teams list */}
            {filteredTeams.map((item, idx) => (
              <View
                key={item.id || `team-card-${idx}`}
                style={[
                  styles.teamCardRow,
                  (item.isInvited || item.isAccepted) && styles.teamCardRowHighlighted,
                ]}
              >
                <View style={styles.teamInfoCol}>
                  <Text style={styles.teamNameText}>{item.name}</Text>
                  <Text style={styles.teamDetailsText}>
                    {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
                    {!!item.city ? ` · ${item.city}` : ''}
                  </Text>
                </View>

                {/* Action Button: Invite to tournament OR Uninvite */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    item.isInvited ? styles.uninviteBtn : styles.inviteBtn,
                  ]}
                  onPress={() => handleToggleInvite(item)}
                  disabled={actionLoadingId === item.id}
                  activeOpacity={0.8}
                >
                  {actionLoadingId === item.id ? (
                    <ActivityIndicator size="small" color={item.isInvited ? '#E53E3E' : '#093A24'} />
                  ) : (
                    <Text
                      style={[
                        styles.actionBtnText,
                        item.isInvited ? styles.uninviteBtnText : styles.inviteBtnText,
                      ]}
                    >
                      {item.isInvited ? (item.isAccepted ? 'Accepted' : 'Uninvite') : 'Invite to tournament'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : null}

        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* Footer Continue Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton
          title="CONTINUE"
          onPress={handleContinue}
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
  headerBlock: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
  },
  backButtonCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginBottom: hp(2.5),
  },
  headerTextContainer: {
    marginTop: hp(1),
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(30),
    color: '#093A24',
  },
  headerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#2EA200',
    marginTop: hp(0.5),
  },
  whiteCardContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  whiteCardScroll: {
    paddingTop: hp(1.5),
    paddingBottom: hp(14),
  },
  shareBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#093A24',
    borderRadius: moderateScale(18),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  shareBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(2),
  },
  shareIconCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  shareBannerTextWrap: {
    flex: 1,
  },
  shareBannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#FFFFFF',
  },
  shareBannerSub: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(11.5),
    color: '#A0AEC0',
    marginTop: hp(0.2),
  },
  shareBtnPill: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
  },
  shareBtnPillText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11.5),
    color: '#093A24',
    letterSpacing: 0.5,
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
  teamCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCardRowHighlighted: {
    borderWidth: 2,
    borderColor: '#BCFF00',
  },
  teamInfoCol: {
    flex: 1,
    marginRight: wp(3),
  },
  teamNameText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15.5),
    color: '#093A24',
  },
  teamDetailsText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#718096',
    marginTop: hp(0.4),
  },
  actionBtn: {
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp(32),
  },
  inviteBtn: {
    backgroundColor: '#BCFF00',
  },
  uninviteBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E53E3E',
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
  },
  inviteBtnText: {
    color: '#093A24',
  },
  uninviteBtnText: {
    color: '#E53E3E',
  },
  disabledBtn: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E0',
  },
  disabledBtnText: {
    color: '#718096',
  },
  disabledInvitesWrap: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: moderateScale(14),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    marginBottom: hp(2),
  },
  disabledInvitesText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#C53030',
    textAlign: 'center',
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
  btnFixedBottom: {
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default InviteOtherTeamsScreen;
