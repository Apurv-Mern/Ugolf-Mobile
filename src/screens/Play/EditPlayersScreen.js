import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {
  ScreenScaffold,
  CircularBackButton,
  ScreenHeader,
  SearchField,
  SelectableListRow,
  BottomDualActions,
} from '../../components/ui';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize } from '../../utils/responsive';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');

const INITIAL_FRIENDS = [];

import {
  getTeamByIdApi,
  getTeamMemberCandidatesApi,
  sendTeamInviteApi,
  getTeamInvitesApi,
  removeTeamMemberApi,
  selectTournamentTeamApi,
} from '../../services/teamService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const EditPlayersScreen = ({ navigation, route }) => {
  const teamParam = route?.params?.team || route?.params?.selectedTeam;
  const teamId = teamParam?.id || teamParam?._id || teamParam?.teamId;
  const tournamentParam = route?.params?.tournament;
  const tournamentId = tournamentParam?.id || tournamentParam?._id;

  const [creatorUserId, setCreatorUserId] = useState(teamParam?.creatorUserId || null);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load team members and candidates from API
  useEffect(() => {
    if (!teamId || !isUuid(String(teamId))) return;

    let isSubscribed = true;
    const fetchTeamDetailsAndCandidates = async () => {
      try {
        setLoading(true);
        // 1. Get existing team members
        const teamRes = await getTeamByIdApi(teamId);
        const teamObj = teamRes?.team || teamRes?.data?.team || teamRes?.data || teamRes;
        const existingMembers = teamObj?.members || teamObj?.players || [];
        if (teamObj?.creatorUserId || teamObj?.creatorId || teamObj?.createdBy) {
          setCreatorUserId(teamObj?.creatorUserId || teamObj?.creatorId || teamObj?.createdBy);
        }

        // 2. Get candidate members to add (fetch all candidates up to limit 100)
        const candidateRes = await getTeamMemberCandidatesApi(teamId, { search: searchQuery, page: 1, limit: 100 });
        const candidates = candidateRes?.players || candidateRes?.data?.players || candidateRes?.data || (Array.isArray(candidateRes) ? candidateRes : []);

        // 3. Get pending team invites
        let pendingInvites = [];
        try {
          const invitesRes = await getTeamInvitesApi(teamId);
          pendingInvites = invitesRes?.invites || invitesRes?.data?.invites || invitesRes?.data || (Array.isArray(invitesRes) ? invitesRes : []);
        } catch (invErr) {
          console.log('Fetch team invites note:', invErr);
        }

        if (isSubscribed) {
          const pendingUserIds = (Array.isArray(pendingInvites) ? pendingInvites : [])
            .filter((inv) => inv.status === 'pending')
            .map((inv) => String(inv.inviteeUserId || inv.userId || inv.id));

          const formattedExisting = (Array.isArray(existingMembers) ? existingMembers : []).map((m) => {
            const mId = String(m.playerUserId || m.id || m._id || m.userId);
            const isPending = pendingUserIds.includes(mId) || m.status === 'pending' || m.inviteStatus === 'pending' || !!m.isPending || !!m.pending;
            return {
              id: mId,
              name: m.displayName || m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Team Member',
              email: m.email,
              image: trophyImg,
              selected: true,
              isExisting: true,
              isPending,
              status: isPending ? 'pending' : 'accepted',
            };
          });

          const formattedCandidates = (Array.isArray(candidates) ? candidates : []).map((c) => {
            const cId = String(c.playerUserId || c.id || c._id || c.userId);
            const isPending = pendingUserIds.includes(cId) || c.status === 'pending' || c.inviteStatus === 'pending' || !!c.isPending || !!c.pending;
            return {
              id: cId,
              name: c.displayName || c.name || c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Candidate Player',
              email: c.email,
              image: homescreenBg,
              selected: false,
              isExisting: false,
              isPending,
              status: isPending ? 'pending' : (c.status || 'available'),
            };
          });

          const isGenericPlayerName = (name) => {
            if (!name) return true;
            const lower = String(name).trim().toLowerCase();
            return lower === 'player' || lower === 'invited player' || lower === 'candidate player';
          };

          // Also add any pending invites that might not be in candidates array
          (Array.isArray(pendingInvites) ? pendingInvites : []).forEach((inv) => {
            if (inv.status === 'pending' && inv.inviteeUserId) {
              const invId = String(inv.inviteeUserId);
              const displayName = inv.inviteeName || inv.inviteeDisplayName || inv.inviteeEmail || inv.name;
              // If the invitee user account was deleted from backend DB or generic 'Player', skip this orphan pending invite
              if (!displayName || isGenericPlayerName(displayName)) return;

              if (!formattedCandidates.some((c) => String(c.id) === invId) && !formattedExisting.some((m) => String(m.id) === invId)) {
                formattedCandidates.push({
                  id: inv.inviteeUserId,
                  name: displayName,
                  email: inv.inviteeEmail || '',
                  image: homescreenBg,
                  selected: false,
                  isExisting: false,
                  isPending: true,
                  status: 'pending',
                });
              }
            }
          });

          // Merge existing members first, followed by valid candidates
          const allList = [...formattedExisting];
          formattedCandidates.forEach((c) => {
            if (c.id && !isGenericPlayerName(c.name) && !allList.some((m) => String(m.id) === String(c.id))) {
              allList.push(c);
            }
          });

          setFriends(allList);
        }
      } catch (err) {
        console.log('Edit players load error:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchTeamDetailsAndCandidates();
    return () => {
      isSubscribed = false;
    };
  }, [teamId, searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const toggleSelect = (id) => {
    const target = friends.find((f) => String(f.id) === String(id));
    if (target && target.selected && creatorUserId && String(id) === String(creatorUserId)) {
      Toast.show({
        type: 'info',
        text1: 'Team Captain',
        text2: 'Cannot remove the team creator from the roster.',
      });
      return;
    }

    setFriends((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedCount = friends.filter((f) => f.selected).length;

  const filteredFriends = friends.filter((f) =>
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingPlayers = filteredFriends.filter((f) => f.isExisting);
  const invitePlayers = filteredFriends.filter((f) => !f.isExisting);

  const challengeLocked =
    !!tournamentParam?.challengeLocked || !!route?.params?.challengeLocked;

  const handleSave = async () => {
    if (challengeLocked) {
      navigation.goBack();
      return;
    }
    if (teamId && isUuid(String(teamId))) {
      setSaving(true);
      try {
        const newSelected = friends.filter((f) => f.selected && !f.isExisting && !f.isPending);
        const unselectedExisting = friends.filter((f) => !f.selected && f.isExisting);

        // Invited players become members only after accepting the notification.
        for (const item of newSelected) {
          if (isUuid(String(item.id))) {
            await sendTeamInviteApi(teamId, { playerUserId: item.id });
            setFriends((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, isPending: true, status: 'pending' }
                  : f,
              ),
            );
          }
        }

        for (const item of unselectedExisting) {
          if (isUuid(String(item.id))) {
            await removeTeamMemberApi(teamId, item.id);
          }
        }

        // Refresh the tournament roster snapshot after actual membership changes.
        if (
          unselectedExisting.length > 0 &&
          tournamentId &&
          isUuid(String(tournamentId)) &&
          isUuid(String(teamId))
        ) {
          await selectTournamentTeamApi(tournamentId, { teamId });
        }

        Toast.show({
          type: 'success',
          text1: 'Players Saved',
          text2:
            newSelected.length > 0
              ? 'Invitations sent. Players will join once they accept.'
              : 'Team squad updated successfully!',
        });
        navigation.goBack();
      } catch (err) {
        console.log('Save team players error:', err);
        const backendMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Could not update team squad.';
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: backendMsg,
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Players Saved',
      text2: `${selectedCount} players selected for your team.`,
    });
    navigation.goBack();
  };

  const renderPlayerRow = (item, idx, keyPrefix) => {
    const isPending = item.isPending || item.status === 'pending';
    return (
      <SelectableListRow
        key={item.id || item.playerUserId || `${keyPrefix}-${idx}`}
        title={item.name}
        subtitle={item.email || undefined}
        image={item.image}
        selected={!!item.selected && !isPending}
        badge={isPending ? 'PENDING' : undefined}
        onPress={() => {
          if (challengeLocked || isPending) return;
          toggleSelect(item.id);
        }}
      />
    );
  };

  return (
    <ScreenScaffold edges={['top', 'bottom']} showDots={false}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.headerBlock}>
        <CircularBackButton onPress={() => navigation.goBack()} />
        <ScreenHeader
          title="Edit players"
          subtitle={`${selectedCount} selected`}
          subtitleStyle={styles.selectedSubtitle}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Friends"
          style={styles.search}
        />

        {existingPlayers.length > 0 && (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeaderText}>ON THIS TEAM</Text>
          </View>
        )}
        {existingPlayers.map((item, idx) => renderPlayerRow(item, idx, 'existing'))}

        {invitePlayers.length > 0 && (
          <View style={[styles.sectionHeaderWrap, existingPlayers.length > 0 && styles.sectionSpacer]}>
            <Text style={styles.sectionHeaderText}>INVITE PLAYERS</Text>
          </View>
        )}
        {invitePlayers.map((item, idx) => renderPlayerRow(item, idx, 'candidate'))}

        <View style={{ height: hp(2) }} />
      </ScrollView>

      <BottomDualActions
        leftTitle="CANCEL"
        rightTitle={challengeLocked ? 'DONE' : saving ? 'SAVING…' : 'SAVE'}
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleSave}
        rightLoading={saving}
        style={styles.bottomActions}
      />
    </ScreenScaffold>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(0.5),
  },
  selectedSubtitle: {
    color: '#007C4A',
    fontFamily: FONTS.regular,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(2),
  },
  search: {
    marginBottom: hp(1.5),
  },
  sectionHeaderWrap: {
    marginTop: hp(0.5),
    marginBottom: hp(1.2),
  },
  sectionSpacer: {
    marginTop: hp(2),
  },
  sectionHeaderText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bottomActions: {
    paddingTop: hp(1),
    backgroundColor: COLORS.bgPage,
  },
});

export default EditPlayersScreen;
