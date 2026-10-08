import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthIcon from '../../components/common/AuthIcon';
import AuthButton from '../../components/common/AuthButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { moderateScale } from '../../utils/responsive';
import {
  claimShotgunStartHoleApi,
  getShotgunStateApi,
  getTournamentByIdApi,
  startAllShotgunGroupsApi,
} from '../../services/homeService';
import {
  goCreatorSetupInvite,
  isTournamentCreatorUser,
} from '../../utils/shotgunNavigation';

const ShotgunSetupScreen = ({ navigation, route }) => {
  const currentUser = useSelector((s) => s.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;
  const tournamentId =
    route?.params?.tournamentId ||
    route?.params?.tournament?.id ||
    route?.params?.tournament?._id;
  const creatorSetupFlow = route?.params?.creatorSetupFlow === true;
  const tournamentFromRoute = route?.params?.tournament;
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [selectedGame, setSelectedGame] = useState(1);
  const [busy, setBusy] = useState(false);
  const initialGameSet = useRef(false);
  const prevGroupStatusRef = useRef({});

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!tournamentId) return;
    if (!silent) setLoading(true);
    try {
      const [sg, tRes] = await Promise.all([
        getShotgunStateApi(tournamentId),
        getTournamentByIdApi(tournamentId),
      ]);
      const nextState = sg?.state ?? sg;
      setState(nextState);
      const t = tRes?.tournament ?? tRes?.data?.tournament ?? tRes;
      const creatorId = t?.creatorUserId || t?.creatorId;
      setIsCreator(
        Boolean(
          creatorId &&
            currentUserId &&
            String(creatorId).toLowerCase() === String(currentUserId).toLowerCase(),
        ),
      );
      const groups = nextState?.groups ?? [];
      const mine = nextState?.myAssignment;
      if (!initialGameSet.current) {
        if (mine?.gameNumber) {
          setSelectedGame(mine.gameNumber);
        } else if (groups[0]) {
          setSelectedGame(groups[0].gameNumber);
        }
        initialGameSet.current = true;
      }

      const wasAnyDraft = groups.some(
        (g) => prevGroupStatusRef.current[g.gameNumber] === 'DRAFT',
      );
      const nowAllInProgress =
        groups.length > 0 &&
        groups.every((g) => g.status === 'IN_PROGRESS');
      if (
        wasAnyDraft &&
        nowAllInProgress &&
        creatorId &&
        currentUserId &&
        String(creatorId).toLowerCase() !== String(currentUserId).toLowerCase()
      ) {
        Toast.show({
          type: 'info',
          text1: 'Shotgun started',
          text2:
            'The host started all configured games. Tap Continue to start game when ready.',
        });
      }
      for (const g of groups) {
        prevGroupStatusRef.current[g.gameNumber] = g.status;
      }
    } catch (e) {
      if (!silent) {
        Toast.show({
          type: 'error',
          text1: 'Shotgun',
          text2: e?.response?.data?.error || e?.message || 'Failed to load',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tournamentId, currentUserId]);

  useFocusEffect(
    useCallback(() => {
      void load({ silent: false });
      const timer = setInterval(() => {
        void load({ silent: true });
      }, 5000);
      return () => clearInterval(timer);
    }, [load]),
  );

  const group = state?.groups?.find((g) => g.gameNumber === selectedGame);
  const myAssignment =
    state?.myAssignment ??
    (() => {
      const g = (state?.groups ?? []).find((gr) => gr.myStartHole != null);
      return g
        ? { gameNumber: g.gameNumber, startHole: g.myStartHole }
        : null;
    })();
  const holesInBlock = (g) => {
    const list = [];
    for (let h = g.holeStart; h <= g.holeEnd; h += 1) list.push(h);
    return list;
  };

  const assignmentForHole = (hole) =>
    group?.assignments?.find((a) => a.startHole === hole);

  const claimHole = async (startHole) => {
    if (!group || !tournamentId) return;
    setBusy(true);
    try {
      await claimShotgunStartHoleApi(tournamentId, group.gameNumber, {
        startHole,
      });
      Toast.show({
        type: 'success',
        text1: 'Start hole saved',
        text2: `Your team starts on hole ${startHole}`,
      });
      await load();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Could not claim hole',
        text2: e?.response?.data?.error || e?.message || 'Try another hole',
      });
    } finally {
      setBusy(false);
    }
  };

  const myPlayGameNumber =
    myAssignment?.gameNumber ??
    (state?.groups ?? []).find((g) => g.myStartHole != null)?.gameNumber ??
    selectedGame;
  const myPlayGroup = (state?.groups ?? []).find(
    (g) => g.gameNumber === myPlayGameNumber,
  );
  const shotgunLiveForMyTeam =
    myPlayGroup?.status === 'IN_PROGRESS' && myAssignment?.startHole != null;
  const anyGroupDraft = (state?.groups ?? []).some((g) => g.status === 'DRAFT');
  const hasConfiguredGames = (state?.groups ?? []).length > 0;
  const firstGameNumber = (state?.groups ?? []).reduce(
    (min, g) => (g.gameNumber < min ? g.gameNumber : min),
    Number.POSITIVE_INFINITY,
  );
  const onFirstGameTab =
    Number.isFinite(firstGameNumber) && selectedGame === firstGameNumber;

  const goToSelectGame = () => {
    const tournament = route?.params?.tournament;
    const selectedTeam =
      route?.params?.selectedTeam ||
      (state?.myTeamId
        ? { id: state.myTeamId, name: state.myTeamName || 'Your team' }
        : undefined);
    const playGn = myPlayGameNumber || selectedGame || 1;
    navigation.navigate('SelectGame', {
      ...route?.params,
      tournament,
      tournamentId,
      selectedTeam,
      gameNumber: playGn,
      selectedGameIndex: playGn - 1,
      playMode:
        route?.params?.playMode ||
        tournament?.playMode ||
        'challenge',
    });
  };

  const onStart = async () => {
    if (!tournamentId || !hasConfiguredGames) return;
    setBusy(true);
    try {
      await startAllShotgunGroupsApi(tournamentId);
      Toast.show({
        type: 'success',
        text1: 'Shotgun started',
        text2: 'All configured games are now live.',
      });
      await load({ silent: true });
      goToSelectGame();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Start failed',
        text2: e?.response?.data?.error || e?.message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => {
          const tournament = tournamentFromRoute;
          const creatorBack =
            creatorSetupFlow ||
            isTournamentCreatorUser(tournament, currentUserId);
          if (creatorBack) {
            goCreatorSetupInvite(navigation, {
              ...route?.params,
              tournament,
              tournamentId,
              selectedTeam: route?.params?.selectedTeam,
              playMode: route?.params?.playMode,
            });
            return;
          }
          if (tournamentId) {
            navigation.replace('ShotgunLobby', {
              ...route?.params,
              tournamentId,
              tournament,
            });
          } else {
            navigation.goBack();
          }
        }}
      >
        <AuthIcon name="chevron-left" size={moderateScale(18)} color="#093A24" />
      </TouchableOpacity>
      <Text style={styles.title}>Shotgun setup</Text>
      <Text style={styles.subtitle}>
        Pick one start hole for your team. Choosing a hole in another game replaces
        your previous pick. Each hole can only be used once per game.
      </Text>
      {state?.myTeamName ? (
        <Text style={styles.teamLine}>Your team: {state.myTeamName}</Text>
      ) : (
        <Text style={styles.warn}>Join a team on this tournament first.</Text>
      )}

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {(state?.groups ?? []).map((g) => (
            <TouchableOpacity
              key={g.gameNumber}
              style={[
                styles.tab,
                selectedGame === g.gameNumber && styles.tabActive,
              ]}
              onPress={() => setSelectedGame(g.gameNumber)}
            >
              <Text style={styles.tabText}>
                Game {g.gameNumber} ({g.holeStart}–{g.holeEnd})
              </Text>
            </TouchableOpacity>
          ))}

          {myAssignment != null &&
          myAssignment.gameNumber !== selectedGame ? (
            <Text style={styles.crossGameHint}>
              Your team currently starts on hole {myAssignment.startHole} (Game{' '}
              {myAssignment.gameNumber}). Tap a hole below to move your team to
              this game.
            </Text>
          ) : null}

          {group && (
            <View style={styles.card}>
              <Text style={styles.status}>Status: {group.status}</Text>
              <Text style={styles.holeCap}>
                Holes assigned: {group.teamsWithHoles ?? group.assignments?.length ?? 0} /{' '}
                {group.maxTeamsPerNine ?? 9}
              </Text>
              <View style={styles.holeGrid}>
                {holesInBlock(group).map((hole) => {
                  const taken = assignmentForHole(hole);
                  const isMine =
                    myAssignment?.gameNumber === group.gameNumber &&
                    myAssignment?.startHole === hole;
                  const canClaim =
                    Boolean(state?.myTeamId) &&
                    !taken &&
                    (group.status === 'DRAFT' ||
                      (group.status === 'IN_PROGRESS' &&
                        group.myStartHole == null));

                  return (
                    <TouchableOpacity
                      key={hole}
                      style={[
                        styles.holeCell,
                        isMine && styles.holeMine,
                        taken && !isMine && styles.holeTaken,
                      ]}
                      disabled={busy || !canClaim}
                      onPress={() => claimHole(hole)}
                    >
                      <Text style={styles.holeNum}>Hole {hole}</Text>
                      <Text style={styles.holeMeta} numberOfLines={2}>
                        {isMine
                          ? 'Your team'
                          : taken
                            ? taken.teamName
                            : canClaim
                              ? 'Tap to claim'
                              : 'Open'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {group.status === 'IN_PROGRESS' && (
                <Text style={styles.lockedHint}>
                  {group.myStartHole
                    ? `Your team starts on hole ${group.myStartHole}. Only holes taken by another team are unavailable.`
                    : 'Shotgun is live — tap an open hole to claim for your team.'}
                </Text>
              )}

            </View>
          )}

          {!isCreator && anyGroupDraft ? (
            <Text style={styles.hostWaitHint}>
              {myAssignment?.startHole
                ? 'The host will start the game. This screen updates automatically when they start shotgun for all configured games.'
                : 'Pick your start hole, then wait for the host. The host will start all configured games at once.'}
            </Text>
          ) : null}

          {shotgunLiveForMyTeam ? (
            <AuthButton
              title="Continue to start game"
              onPress={goToSelectGame}
              disabled={busy}
            />
          ) : null}

          {isCreator && anyGroupDraft && !onFirstGameTab ? (
            <Text style={styles.creatorStartHint}>
              Switch to Game {firstGameNumber} to start shotgun for all
              configured games.
            </Text>
          ) : null}

          {isCreator && anyGroupDraft && onFirstGameTab ? (
            <>
              <Text style={styles.creatorStartHint}>
                Starts every configured game at once. You do not need a hole on
                each game before starting.
              </Text>
              <AuthButton
                title="Start shotgun game"
                onPress={onStart}
                disabled={busy || !hasConfiguredGames}
              />
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingTop: 48, paddingHorizontal: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: moderateScale(22),
    color: '#093A24',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: moderateScale(13),
    color: '#555',
    marginTop: 8,
  },
  teamLine: {
    fontFamily: FONTS.semiBold,
    color: '#093A24',
    marginTop: 8,
  },
  warn: { color: '#b45309', marginTop: 8, fontFamily: FONTS.medium },
  crossGameHint: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff8e6',
    color: '#92400e',
    fontFamily: FONTS.medium,
    fontSize: moderateScale(12),
  },
  hostWaitHint: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    color: '#1e40af',
    fontFamily: FONTS.medium,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  creatorStartHint: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: FONTS.regular,
    fontSize: moderateScale(12),
    color: '#555',
    lineHeight: moderateScale(18),
  },
  scroll: { paddingBottom: 40, paddingTop: 12 },
  tab: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  tabActive: { borderColor: COLORS.primary, backgroundColor: '#f4fff0' },
  tabText: { fontFamily: FONTS.medium, color: '#093A24' },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  status: { fontFamily: FONTS.semiBold, marginBottom: 4, color: '#093A24' },
  holeCap: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  holeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  holeCell: {
    width: '30%',
    minWidth: 96,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  holeMine: { borderColor: COLORS.primary, backgroundColor: '#f4fff0' },
  holeTaken: { backgroundColor: '#f5f5f5', opacity: 0.85 },
  holeNum: { fontFamily: FONTS.semiBold, color: '#093A24' },
  holeMeta: { fontFamily: FONTS.regular, fontSize: 11, color: '#666', marginTop: 4 },
  lockedHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
  },
});

export default ShotgunSetupScreen;
