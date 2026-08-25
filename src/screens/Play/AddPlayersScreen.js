import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {
  ScreenScaffold,
  CircularBackButton,
  ScreenHeader,
  SearchField,
  SelectableListRow,
  PrimaryPillButton,
} from '../../components/ui';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize } from '../../utils/responsive';

import { getTeamMemberCandidatesApi, sendTeamInviteApi } from '../../services/teamService';

const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const AddPlayersScreen = ({ navigation, route }) => {
  const newTeam = route?.params?.newTeam;
  const teamId = newTeam?.id || newTeam?._id;
  const hasTeam = Boolean(teamId && isUuid(String(teamId)));

  const [players, setPlayers] = useState([]);
  // Keyed by player id so selections survive re-fetches while searching.
  const [selectedById, setSelectedById] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(hasTeam);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Candidates come from the API only — backend excludes players already on a
  // team or with a pending invite, so an empty list is a valid result.
  useEffect(() => {
    if (!hasTeam) {
      setPlayers([]);
      setLoading(false);
      return undefined;
    }

    let isSubscribed = true;
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await getTeamMemberCandidatesApi(teamId, { search: debouncedSearch });
        const candidateData =
          res?.players || res?.data?.players || res?.data || (Array.isArray(res) ? res : []);
        if (!isSubscribed) return;

        const formatted = (Array.isArray(candidateData) ? candidateData : [])
          .map((c) => {
            const id = c.playerUserId || c.id || c._id || c.userId;
            return {
              id: id ? String(id) : null,
              name:
                c.displayName ||
                c.name ||
                c.fullName ||
                `${c.firstName || ''} ${c.lastName || ''}`.trim() ||
                'Player',
              email: c.email || '',
              city: c.city || '',
            };
          })
          .filter((c) => c.id);

        setPlayers(formatted);
      } catch (err) {
        console.log('Fetch member candidates error:', err);
        if (!isSubscribed) return;
        setPlayers([]);
        setLoadError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Could not load players. Pull back and try again.',
        );
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchCandidates();
    return () => {
      isSubscribed = false;
    };
  }, [teamId, hasTeam, debouncedSearch]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('SelectTeam');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SelectTeam');
    }
  };

  const toggleSelectPlayer = (player) => {
    setSelectedById((prev) => {
      const next = { ...prev };
      if (next[player.id]) delete next[player.id];
      else next[player.id] = player;
      return next;
    });
  };

  const selectedPlayerList = Object.values(selectedById);
  const selectedCount = selectedPlayerList.length;

  const handleContinue = async () => {
    const selectedPlayers = selectedPlayerList;

    if (hasTeam && selectedPlayers.length > 0) {
      setSubmitting(true);
      try {
        for (const item of selectedPlayers) {
          if (isUuid(String(item.id))) {
            // Membership must be created only after the invitee accepts.
            await sendTeamInviteApi(teamId, { playerUserId: item.id });
          }
        }

        Toast.show({
          type: 'success',
          text1: 'Invitations Sent',
          text2: 'Players will join once they accept.',
          // text2: `Invited ${selectedCount} player${selectedCount !== 1 ? 's' : ''} to the team.`,
        });
      } catch (err) {
        console.log('Invite team member error:', err);
        const backendMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Could not invite player to the team.';
        Toast.show({
          type: 'error',
          text1: 'Invite Failed',
          text2: backendMsg,
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      Toast.show({
        type: 'success',
        text1: 'Players Selected',
        text2: `Selected ${selectedCount} player${selectedCount !== 1 ? 's' : ''}!`,
      });
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SelectTeam');
    }
  };

  return (
    <ScreenScaffold edges={['top', 'bottom']} showDots={false}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.headerBlock}>
        <CircularBackButton onPress={handleBack} />
        <ScreenHeader
          title="Add Players"
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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.textPrimary}
            style={{ marginTop: hp(4) }}
          />
        ) : loadError ? (
          <Text style={styles.stateText}>{loadError}</Text>
        ) : players.length === 0 ? (
          <Text style={styles.stateText}>
            {debouncedSearch
              ? `No players found for "${debouncedSearch}".`
              : 'No players available to add right now. Players already on a team or with a pending invite are not shown.'}
          </Text>
        ) : (
          players.map((item) => (
            <SelectableListRow
              key={item.id}
              title={item.name}
              subtitle={item.email || item.city || undefined}
              selected={!!selectedById[item.id]}
              onPress={() => toggleSelectPlayer(item)}
            />
          ))
        )}

        <View style={{ height: hp(2) }} />
      </ScrollView>

      <View style={styles.btnFixedBottom}>
        <PrimaryPillButton
          title="CONTINUE"
          loading={submitting}
          onPress={handleContinue}
        />
      </View>
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
  stateText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: hp(4),
    paddingHorizontal: wp(4),
    lineHeight: fontSize(20),
  },
  btnFixedBottom: {
    backgroundColor: COLORS.bgPage,
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
    paddingTop: hp(1),
  },
});

export default AddPlayersScreen;
