import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import AuthIcon from "../../components/common/AuthIcon";
import AuthButton from "../../components/common/AuthButton";
import { COLORS } from "../../theme/colors";
import { FONTS } from "../../theme/fonts";
import { moderateScale } from "../../utils/responsive";
import { getTournamentTeamsApi } from "../../services/teamService";
import { getTournamentByIdApi } from "../../services/homeService";
import {
  creatorSetupInviteParams,
  goCreatorSetupHoles,
  goCreatorSetupInvite,
  goCreatorSetupSelectTeam,
} from "../../utils/shotgunNavigation";

function memberUserIds(team) {
  const members = team?.players || team?.members || team?.roster || [];
  if (!Array.isArray(members)) return [];
  return members
    .map((m) => m.playerUserId || m.userId || m.id || m._id)
    .filter(Boolean)
    .map((id) => String(id).toLowerCase());
}

function userIsOnTeam(team, currentUserId) {
  if (!currentUserId || !team) return false;
  const uid = String(currentUserId).toLowerCase();
  return memberUserIds(team).includes(uid);
}

/** Team the logged-in player belongs to (not the host’s `isOwnTeam` link). */
function findViewerTeam(teams, currentUserId, isCreator) {
  const list = Array.isArray(teams) ? teams : [];
  const ready = list.filter((t) => {
    const status = String(t.inviteStatus || "").toLowerCase();
    return t.isOwnTeam || status === "accepted";
  });
  const onRoster = ready.find((t) => userIsOnTeam(t, currentUserId));
  if (onRoster) return onRoster;
  if (isCreator) {
    return ready.find((t) => t.isOwnTeam) || null;
  }
  return null;
}

function summarizeTeams(teams) {
  const list = Array.isArray(teams) ? teams : [];
  const own = list.find((t) => t.isOwnTeam);
  const opponents = list.filter((t) => !t.isOwnTeam);
  const accepted = opponents.filter(
    (t) => String(t.inviteStatus || "").toLowerCase() === "accepted",
  );
  const pending = opponents.filter(
    (t) => String(t.inviteStatus || "").toLowerCase() === "pending",
  );
  const rejected = opponents.filter(
    (t) => String(t.inviteStatus || "").toLowerCase() === "rejected",
  );
  const canPickHoles = (own ? 1 : 0) + accepted.length;
  return { own, opponents, accepted, pending, rejected, canPickHoles };
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "accepted") return "Accepted";
  if (s === "pending") return "Pending";
  if (s === "rejected") return "Declined";
  return "Ready";
}

const ShotgunLobbyScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;
  const tournamentParam = route?.params?.tournament;
  const tournamentId =
    route?.params?.tournamentId || tournamentParam?.id || tournamentParam?._id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [ownSelectedTeamId, setOwnSelectedTeamId] = useState(null);
  const [tournament, setTournament] = useState(tournamentParam || null);
  const [isCreator, setIsCreator] = useState(false);
  const [maxTeamSlots, setMaxTeamSlots] = useState(null);
  const [linkedTeamCount, setLinkedTeamCount] = useState(null);

  const load = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const [tRes, teamsRes] = await Promise.all([
        getTournamentByIdApi(tournamentId).catch(() => null),
        getTournamentTeamsApi(tournamentId),
      ]);
      const t = tRes?.tournament ?? tRes?.data?.tournament ?? tRes;
      if (t) setTournament(t);
      const creatorId = t?.creatorUserId || t?.creatorId;
      setIsCreator(
        Boolean(
          creatorId &&
            currentUserId &&
            String(creatorId).toLowerCase() ===
              String(currentUserId).toLowerCase(),
        ),
      );
      const teamList =
        teamsRes?.teams ||
        teamsRes?.data?.teams ||
        teamsRes?.data ||
        (Array.isArray(teamsRes) ? teamsRes : []);
      setTeams(teamList);
      setOwnSelectedTeamId(
        teamsRes?.ownSelectedTeamId ??
          teamsRes?.data?.ownSelectedTeamId ??
          null,
      );
      setMaxTeamSlots(
        teamsRes?.maxTeamSlots ?? teamsRes?.data?.maxTeamSlots ?? null,
      );
      setLinkedTeamCount(
        teamsRes?.linkedTeamCount ?? teamsRes?.data?.linkedTeamCount ?? null,
      );
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Shotgun lobby",
        text2: e?.response?.data?.error || e?.message || "Could not load teams",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournamentId, currentUserId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const summary = summarizeTeams(teams);
  const viewerTeam = findViewerTeam(teams, currentUserId, isCreator);
  const viewerTeamId = viewerTeam?.teamId || viewerTeam?.id;
  const userOnReadyTeam = Boolean(viewerTeam);

  const rosterTeams = teams.filter((t) => {
    const status = String(t.inviteStatus || "").toLowerCase();
    return t.isOwnTeam || status === "accepted" || status === "pending";
  });

  const canContinueToHoles =
    summary.canPickHoles > 0 && (userOnReadyTeam || (isCreator && summary.own));

  const goSelectTeam = () => {
    navigation.navigate("SelectTeam", {
      ...route?.params,
      tournament,
      tournamentId,
      returnTo: "ShotgunLobby",
      playMode: route?.params?.playMode || tournament?.playMode || "challenge",
    });
  };

  const goInvite = () => {
    const ownTeam = summary.own;
    if (!ownTeam) {
      Toast.show({
        type: "info",
        text1: "Select your team first",
        text2: "Choose your team before inviting others.",
      });
      goSelectTeam();
      return;
    }
    const selectedTeam = {
      id: ownTeam.teamId || ownTeam.id,
      name: ownTeam.teamName || ownTeam.name,
    };
    navigation.navigate(
      "InviteOtherTeams",
      creatorSetupInviteParams({
        tournament,
        selectedTeam,
        playMode: route?.params?.playMode || tournament?.playMode || "challenge",
        tournamentId,
      }),
    );
  };

  const goPickHoles = () => {
    if (!canContinueToHoles) {
      Toast.show({
        type: "error",
        text1: "Not ready yet",
        text2:
          isCreator && !summary.own
            ? "Select your team for this tournament first."
            : "Join a team and accept the invite before picking a hole.",
      });
      return;
    }
    const holeParams = {
      ...route?.params,
      tournamentId,
      tournament,
      selectedTeam:
        route?.params?.selectedTeam ||
        (summary.own
          ? {
              id: summary.own.teamId || summary.own.id,
              name: summary.own.teamName || summary.own.name,
            }
          : undefined),
      playMode: route?.params?.playMode || tournament?.playMode || "challenge",
    };
    if (isCreator) {
      goCreatorSetupHoles(navigation, holeParams);
    } else {
      navigation.navigate("ShotgunSetup", holeParams);
    }
  };

  const goBackFromLobby = () => {
    if (isCreator) {
      const ownTeam = summary.own;
      if (ownTeam) {
        goCreatorSetupInvite(navigation, {
          ...route?.params,
          tournament,
          tournamentId,
          selectedTeam: {
            id: ownTeam.teamId || ownTeam.id,
            name: ownTeam.teamName || ownTeam.name,
          },
          playMode: route?.params?.playMode || tournament?.playMode || "challenge",
        });
        return;
      }
      goCreatorSetupSelectTeam(navigation, {
        ...route?.params,
        tournament,
        tournamentId,
        playMode: route?.params?.playMode || tournament?.playMode || "challenge",
      });
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.back} onPress={goBackFromLobby}>
        <AuthIcon
          name="chevron-left"
          size={moderateScale(18)}
          color="#093A24"
        />
      </TouchableOpacity>
      <Text style={styles.title}>Shotgun — teams</Text>
      <Text style={styles.subtitle}>
        Invite teams and wait for accepts. When ready, each team picks a start
        hole (one team per hole).
      </Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
            />
          }
        >
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Invite status</Text>
            <Text style={styles.statsLine}>
              Total Teams :{" "}
              <Text style={styles.statsBold}>
                {linkedTeamCount ?? summary.canPickHoles}
                {maxTeamSlots != null ? ` / ${maxTeamSlots}` : ""}
              </Text>
              {" · "}
              Accepted:{" "}
              <Text style={styles.statsBold}>{summary.accepted.length}</Text>
              {" · "}
              Pending:{" "}
              <Text style={styles.statsBold}>{summary.pending.length}</Text>
            </Text>
            <Text style={styles.hintLine}>
              Hole capacity (9 per nine) counts only teams that picked a start
              hole.
            </Text>
            {!summary.own && isCreator && (
              <Text style={styles.warn}>
                You have not selected your team yet.
              </Text>
            )}
          </View>

          {rosterTeams.length === 0 ? (
            <Text style={styles.empty}>No teams linked yet.</Text>
          ) : (
            rosterTeams.map((t) => {
              const id = t.teamId || t.id;
              const isYourTeam =
                viewerTeamId &&
                String(viewerTeamId).toLowerCase() === String(id).toLowerCase();
              return (
                <View key={String(id)} style={styles.teamRow}>
                  <Text style={styles.teamName}>{t.teamName || t.name}</Text>
                  {isYourTeam ? (
                    <Text style={styles.badgeOwn}>Your team</Text>
                  ) : (
                    <Text style={styles.badge}>
                      {statusLabel(t.inviteStatus)}
                    </Text>
                  )}
                </View>
              );
            })
          )}

          {isCreator && (
            <View style={styles.actions}>
              {!summary.own && (
                <AuthButton title="Select your team" onPress={goSelectTeam} />
              )}
              <AuthButton title="Invite teams" onPress={goInvite} />
            </View>
          )}

          <AuthButton
            title="Continue — pick start holes"
            onPress={goPickHoles}
            disabled={!canContinueToHoles}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: moderateScale(22),
    color: "#093A24",
    marginTop: 16,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: moderateScale(13),
    color: "#555",
    marginTop: 8,
  },
  scroll: { paddingBottom: 40, paddingTop: 16 },
  statsCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f4fff0",
    borderWidth: 1,
    borderColor: "#c5e8b7",
    marginBottom: 16,
  },
  statsTitle: { fontFamily: FONTS.semiBold, color: "#093A24", marginBottom: 6 },
  statsLine: {
    fontFamily: FONTS.regular,
    fontSize: moderateScale(13),
    color: "#333",
  },
  statsBold: { fontFamily: FONTS.bold, color: "#093A24" },
  hintLine: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#666",
    marginTop: 8,
  },
  warn: {
    fontFamily: FONTS.medium,
    color: "#b45309",
    marginTop: 8,
    fontSize: 12,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  teamName: {
    fontFamily: FONTS.medium,
    color: "#093A24",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: "#555",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOwn: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: "#093A24",
    backgroundColor: "#d4f5c4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  empty: { fontFamily: FONTS.regular, color: "#888", marginVertical: 12 },
  actions: { gap: 10, marginVertical: 16 },
});

export default ShotgunLobbyScreen;
