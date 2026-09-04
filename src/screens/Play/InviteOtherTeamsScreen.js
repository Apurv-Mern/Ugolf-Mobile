import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import AuthButton from "../../components/common/AuthButton";
import AuthIcon from "../../components/common/AuthIcon";
import DotPattern from "../../components/common/DotPattern";
import { COLORS } from "../../theme/colors";
import { FONTS } from "../../theme/fonts";
import {
  wp,
  hp,
  fontSize,
  moderateScale,
  SCREEN_WIDTH,
} from "../../utils/responsive";

const homescreenBg = require("../../assets/Images/homescreen_bg.jpg");
const trophyImg = require("../../assets/Images/ trophy.png");
const tournamentBg = require("../../assets/Images/tournament_bg.jpg");

import { shareTournamentLink } from "../../utils/shareUtils";
import {
  getTournamentInviteCandidatesApi,
  inviteTeamToTournamentApi,
  uninviteTeamFromTournamentApi,
  getTournamentTeamsApi,
} from "../../services/teamService";

const isUuid = (id) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const InviteOtherTeamsScreen = ({ navigation, route }) => {
  const tournamentParam = route?.params?.tournament;
  const selectedTeam = route?.params?.selectedTeam;
  const playMode = route?.params?.playMode;
  const tournamentId = tournamentParam?.id || tournamentParam?._id;

  const [teamsList, setTeamsList] = useState([]);
  const [masterInvitedTeams, setMasterInvitedTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [challengeLocked, setChallengeLocked] = useState(
    !!tournamentParam?.challengeLocked,
  );

  // Load candidate opponent teams from API
  const fetchInviteCandidates = async ({ isRefresh = false } = {}) => {
    if (!tournamentId || !isUuid(String(tournamentId))) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [res, tRes] = await Promise.all([
        getTournamentInviteCandidatesApi(tournamentId, {
          search: searchQuery,
          page: 1,
          limit: 100,
        }).catch(() => null),
        getTournamentTeamsApi(tournamentId).catch(() => null),
      ]);

      const candidates =
        res?.teams ||
        res?.data?.teams ||
        res?.data ||
        (Array.isArray(res) ? res : []);
      const joinedTeams =
        tRes?.teams ||
        tRes?.data?.teams ||
        tRes?.data ||
        (Array.isArray(tRes) ? tRes : []);

      const joinedById = {};
      const currentInvitedOpponents = [];
      (Array.isArray(joinedTeams) ? joinedTeams : []).forEach((t) => {
        const id = String(t.id || t._id || t.teamId || "");
        if (id) {
          joinedById[id] = t;
          const statusLower = String(
            t.status || t.inviteStatus || "",
          ).toLowerCase();
          const isOwn =
            statusLower === "your_team" ||
            !!t.isOwnTeam ||
            id === String(selectedTeam?.id);
          const isInvitedOrJoined =
            statusLower === "accepted" ||
            statusLower === "invited" ||
            statusLower === "joined" ||
            statusLower === "confirmed" ||
            statusLower === "pending";
          if (!isOwn && isInvitedOrJoined) {
            currentInvitedOpponents.push({ id, ...t });
          }
        }
      });
      setMasterInvitedTeams(currentInvitedOpponents);

      if (Array.isArray(candidates)) {
        const formatted = candidates.map((item, idx) => {
          const t = item?.team || item;
          const candidateTeamId = String(
            t.id || t._id || t.teamId || `candidate-team-${idx}`,
          );
          const linked = joinedById[candidateTeamId];
          const statusRaw =
            item?.status ||
            item?.inviteStatus ||
            item?.state ||
            linked?.inviteStatus ||
            linked?.status ||
            t?.status ||
            t?.inviteStatus ||
            "";
          const statusLower = String(statusRaw).toLowerCase();
          const isAccepted =
            statusLower === "accepted" ||
            // Backend invite-candidate status "invited" means accepted.
            statusLower === "invited" ||
            statusLower === "joined" ||
            statusLower === "confirmed";
          const isPending = statusLower === "pending";
          const isUnavailable = statusLower === "unavailable";
          // Rejected or available → host can invite again. Do not treat a
          // leftover rejected link as still invited.
          const isInvited = isPending || isAccepted;

          return {
            id: candidateTeamId,
            name:
              t.name ||
              t.teamName ||
              t.displayName ||
              t.title ||
              "Opponent Team",
            memberCount: t.memberCount || (t.members ? t.members.length : 1),
            status: statusLower,
            isInvited,
            isPending,
            isAccepted,
            isUnavailable,
            isOwnTeam:
              statusLower === "your_team" ||
              !!t.isOwnTeam ||
              candidateTeamId === String(selectedTeam?.id),
          };
        });
        setTeamsList(formatted);
      }

      const locked =
        tRes?.challengeLocked === true ||
        tRes?.data?.challengeLocked === true ||
        !!tournamentParam?.challengeLocked;
      setChallengeLocked(locked);
    } catch (err) {
      console.log("Fetch invite candidates error:", err);
      if (isRefresh) {
        Toast.show({
          type: "error",
          text1: "Refresh Failed",
          text2: "Could not update invite status. Please try again.",
        });
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefreshStatus = () => {
    fetchInviteCandidates({ isRefresh: true });
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

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation, tournamentId]),
  );

  const handleToggleInvite = async (teamItem) => {
    if (!tournamentId || !isUuid(String(tournamentId))) return;
    // Accepted opponents cannot be removed for now (no product flow).
    // if (teamItem.isAccepted) { ... uninvite / Remove ... }
    if (teamItem.isAccepted) return;

    setActionLoadingId(teamItem.id);
    try {
      if (teamItem.isPending) {
        await uninviteTeamFromTournamentApi(tournamentId, teamItem.id);
        Toast.show({
          type: "info",
          text1: "Team Uninvited",
          text2: `${teamItem.name} has been removed from tournament.`,
        });
      } else {
        await inviteTeamToTournamentApi(tournamentId, { teamId: teamItem.id });

        Toast.show({
          type: "success",
          text1: "Invite Sent",
          text2: `Successfully invited ${teamItem.name} to tournament!`,
        });
      }
      await fetchInviteCandidates();
    } catch (err) {
      console.log("Toggle team invite error:", err);
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not update team invitation.";
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: backendMsg,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const allInvitedMap = {};
  (Array.isArray(masterInvitedTeams) ? masterInvitedTeams : []).forEach((t) => {
    const id = String(t.id || t._id || t.teamId || "");
    if (id && id !== String(selectedTeam?.id)) {
      allInvitedMap[id] = true;
    }
  });
  (Array.isArray(teamsList) ? teamsList : []).forEach((t) => {
    if (
      !t.isOwnTeam &&
      String(t.id) !== String(selectedTeam?.id) &&
      t.isInvited
    ) {
      allInvitedMap[String(t.id)] = true;
    }
  });
  const invitedCount = Object.keys(allInvitedMap).length;

  const filteredTeams = teamsList.filter(
    (t) =>
      !t.isOwnTeam &&
      !t.isUnavailable &&
      String(t.id) !== String(selectedTeam?.id) &&
      ((t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.city || "").toLowerCase().includes(searchQuery.toLowerCase())),
  );
  const hasActiveOpponentInvite = invitedCount > 0;

  const handleContinue = () => {
    if (invitedCount === 0) {
      Toast.show({
        type: "error",
        text1: "Opponent Team Required",
        text2:
          "Please invite an opponent team to challenge for this tournament.",
      });
      return;
    }

    // Opponent acceptance is shown and gated on Select game (start readiness).
    navigation.navigate("SelectGame", {
      tournament: tournamentParam,
      selectedTeam,
      playMode,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header Block */}
      <View style={styles.headerBlock}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon
            name="chevron-left"
            size={moderateScale(22)}
            color="#093A24"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Invite other teams</Text>
          <Text style={styles.headerSubtitle}>
            Own selected team:{" "}
            <Text style={{ fontFamily: FONTS.bold, color: "#093A24" }}>
              {selectedTeam?.name || "Selected Team"}
            </Text>
            {/* · Opponent teams: <Text style={{ fontFamily: FONTS.bold, color: '#2EA200' }}>{invitedCount}</Text> */}
          </Text>
          {tournamentParam?.invitesEnabled !== false ? (
            <TouchableOpacity
              style={styles.refreshRow}
              onPress={handleRefreshStatus}
              disabled={refreshing || loading}
              activeOpacity={0.7}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#2EA200" />
              ) : (
                <Text style={styles.refreshText}>Refresh status</Text>
              )}
            </TouchableOpacity>
          ) : null}
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
        {tournamentParam?.shareLinkEnabled === true ||
        (tournamentParam?.shareLinkEnabled !== false &&
          (!!tournamentParam?.joinUrl || !!tournamentParam?.joinToken)) ? (
          <TouchableOpacity
            style={styles.shareBannerCard}
            onPress={() => shareTournamentLink(tournamentParam)}
            activeOpacity={0.85}
          >
            <View style={styles.shareBannerLeft}>
              <View style={styles.shareIconCircle}>
                <AuthIcon
                  name="share"
                  size={moderateScale(18)}
                  color="#093A24"
                />
              </View>
              <View style={styles.shareBannerTextWrap}>
                <Text style={styles.shareBannerTitle}>Share Join Link</Text>
                <Text style={styles.shareBannerSub}>
                  Share link externally so players can join
                </Text>
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
              ⚠️ Direct team invitations were disabled for this tournament by
              the creator. Players can join using the shared join link above.
            </Text>
          </View>
        ) : null}

        {/* Search Bar & Teams list — only shown if invitesEnabled is NOT false */}
        {tournamentParam?.invitesEnabled !== false ? (
          <>
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
                  {searchQuery.trim()
                    ? `No teams found matching "${searchQuery.trim()}".`
                    : "No other teams available to challenge yet. Another captain needs to create a team first."}
                </Text>
              </View>
            )}

            {hasActiveOpponentInvite && !challengeLocked ? (
              <Text style={styles.oneInviteHint}>
                Only one opponent invite at a time. Uninvite first to invite
                another team.
              </Text>
            ) : null}

            {/* Teams list */}
            {filteredTeams.map((item, idx) => {
              const inviteDisabled =
                !item.isInvited && (hasActiveOpponentInvite || challengeLocked);
              const actionLabel = item.isPending
                ? "Uninvite"
                : "Invite to tournament";
              return (
                <View
                  key={item.id || `team-card-${idx}`}
                  style={[
                    styles.teamCardRow,
                    (item.isInvited || item.isAccepted) &&
                      styles.teamCardRowHighlighted,
                  ]}
                >
                  <View style={styles.teamInfoCol}>
                    <View style={styles.teamNameRow}>
                      <Text style={styles.teamNameText}>{item.name}</Text>
                      {item.isPending ? (
                        <View
                          style={[styles.statusTag, styles.statusTagPending]}
                        >
                          <Text style={styles.statusTagPendingText}>
                            Pending
                          </Text>
                        </View>
                      ) : item.isAccepted ? (
                        <View
                          style={[styles.statusTag, styles.statusTagAccepted]}
                        >
                          <Text style={styles.statusTagAcceptedText}>
                            Accepted
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.teamDetailsText}>
                      {item.memberCount} member
                      {item.memberCount !== 1 ? "s" : ""}
                      {!!item.city ? ` · ${item.city}` : ""}
                    </Text>
                  </View>

                  {/* Remove after accept is disabled for now — keep Accepted tag only.
                {item.isAccepted ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.uninviteBtn]}
                    onPress={() => handleToggleInvite(item)}
                    disabled={actionLoadingId === item.id}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, styles.uninviteBtnText]}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
                */}
                  {item.isAccepted ? (
                    <View style={[styles.actionBtn, styles.inviteBtn]}>
                      <Text
                        style={[styles.actionBtnText, styles.inviteBtnText]}
                      >
                        Accepted
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        item.isPending ? styles.uninviteBtn : styles.inviteBtn,
                        inviteDisabled && styles.disabledBtn,
                      ]}
                      onPress={() => handleToggleInvite(item)}
                      disabled={actionLoadingId === item.id || inviteDisabled}
                      activeOpacity={0.8}
                    >
                      {actionLoadingId === item.id ? (
                        <ActivityIndicator
                          size="small"
                          color={item.isPending ? "#E53E3E" : "#093A24"}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.actionBtnText,
                            item.isPending
                              ? styles.uninviteBtnText
                              : styles.inviteBtnText,
                            inviteDisabled && styles.disabledBtnText,
                          ]}
                        >
                          {actionLabel}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        ) : null}

        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* Footer Continue Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton title="CONTINUE" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
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
    justifyContent: "center",
    alignItems: "center",
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
    color: "#093A24",
  },
  headerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: "#2EA200",
    marginTop: hp(0.5),
  },
  refreshRow: {
    marginTop: hp(1),
    alignSelf: "flex-start",
    minHeight: moderateScale(20),
    justifyContent: "center",
  },
  refreshText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: "#2EA200",
    textDecorationLine: "underline",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#093A24",
    borderRadius: moderateScale(18),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  shareBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: wp(2),
  },
  shareIconCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#BCFF00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  shareBannerTextWrap: {
    flex: 1,
  },
  shareBannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: "#FFFFFF",
  },
  shareBannerSub: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(11.5),
    color: "#A0AEC0",
    marginTop: hp(0.2),
  },
  shareBtnPill: {
    backgroundColor: "#BCFF00",
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
  },
  shareBtnPillText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11.5),
    color: "#093A24",
    letterSpacing: 0.5,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
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
    color: "#093A24",
    flex: 1,
    padding: 0,
  },
  teamCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCardRowHighlighted: {
    borderWidth: 2,
    borderColor: "#BCFF00",
  },
  teamInfoCol: {
    flex: 1,
    marginRight: wp(3),
  },
  oneInviteHint: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: "#718096",
    marginBottom: hp(1.5),
  },
  teamNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: wp(2),
  },
  teamNameText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15.5),
    color: "#093A24",
  },
  statusTag: {
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.25),
  },
  statusTagPending: {
    backgroundColor: "#FEF3C7",
  },
  statusTagPendingText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: "#B45309",
  },
  statusTagAccepted: {
    backgroundColor: "#DCFCE7",
  },
  statusTagAcceptedText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: "#166534",
  },
  teamDetailsText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: "#718096",
    marginTop: hp(0.4),
  },
  actionBtn: {
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    justifyContent: "center",
    alignItems: "center",
    minWidth: wp(32),
  },
  inviteBtn: {
    backgroundColor: "#BCFF00",
  },
  uninviteBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#E53E3E",
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
  },
  inviteBtnText: {
    color: "#093A24",
  },
  uninviteBtnText: {
    color: "#E53E3E",
  },
  disabledBtn: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E0",
  },
  disabledBtnText: {
    color: "#718096",
  },
  disabledInvitesWrap: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
    borderRadius: moderateScale(14),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    marginBottom: hp(2),
  },
  disabledInvitesText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: "#C53030",
    textAlign: "center",
  },
  emptyStateWrap: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginVertical: hp(2),
    alignItems: "center",
  },
  emptyStateText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: "#718096",
    textAlign: "center",
    lineHeight: fontSize(20),
  },
  btnFixedBottom: {
    backgroundColor: "#F8FAF9",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default InviteOtherTeamsScreen;
