import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { formatDisplayDate } from '../../utils/dateUtils';
import { getTournamentsApi } from '../../services/homeService';
import {
  getStartGameReadinessApi,
  getGameSessionApi,
} from '../../services/playService';
import {
  classifyTournamentPlay,
  inProgressActivityMs,
  unwrapReadiness,
} from '../../utils/playProgress';
import { getPlayerGameHistoryApi } from '../../services/playerService';

const trophyImg = require('../../assets/Images/ trophy.png');
const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

const InProgressGamesScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const loadInProgressGames = useCallback(async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true);
      else setLoading(true);

      const [mineRes, invitedRes, playedRes, historyRes] = await Promise.all([
        getTournamentsApi({ scope: 'mine', limit: 20 }).catch(() => null),
        getTournamentsApi({ scope: 'invited', limit: 20 }).catch(() => null),
        getTournamentsApi({ scope: 'played', limit: 20 }).catch(() => null),
        getPlayerGameHistoryApi().catch(() => null),
      ]);

      const extractList = (res) => {
        const raw = res?.tournaments || res?.data?.tournaments || res?.data || (Array.isArray(res) ? res : []);
        return Array.isArray(raw) ? raw : [];
      };

      const byId = new Map();
      extractList(mineRes).forEach((t, idx) => {
        const id = String(t.id || t._id || `mine-${idx}`);
        byId.set(id, { ...t, id, source: 'mine' });
      });
      extractList(invitedRes).forEach((t, idx) => {
        const statusStr = String(
          t.inviteStatus || t.userStatus || t.myTeamStatus || t.teamInviteStatus || t.invite?.status || t.status || ''
        ).toUpperCase();
        const isPending =
          t.accepted === false ||
          t.isAccepted === false ||
          t.pending === true ||
          t.isPending === true ||
          statusStr.includes('PENDING') ||
          statusStr.includes('REJECT') ||
          statusStr.includes('DECLINE') ||
          statusStr.includes('UNACCEPTED');

        if (isPending) return;
        const id = String(t.id || t._id || `invited-${idx}`);
        if (!byId.has(id)) byId.set(id, { ...t, id, source: 'invited' });
      });
      extractList(playedRes).forEach((t, idx) => {
        const id = String(t.id || t._id || `played-${idx}`);
        if (!byId.has(id)) byId.set(id, { ...t, id, source: 'played' });
      });

      const historyList =
        historyRes?.history ||
        historyRes?.data?.history ||
        historyRes?.data ||
        (Array.isArray(historyRes) ? historyRes : []);
      const history = Array.isArray(historyList) ? historyList : [];

      const candidates = Array.from(byId.values());

      if (candidates.length === 0) {
        setGames([]);
        return;
      }

      const readinessResults = await Promise.all(
        candidates.map((t) =>
          getStartGameReadinessApi(t.id)
            .then((res) => unwrapReadiness(res))
            .catch(() => null),
        ),
      );

      const activeGamesList = [];

      for (let i = 0; i < candidates.length; i++) {
        const t = candidates[i];
        const readiness = readinessResults[i];
        const play = classifyTournamentPlay(t, readiness);
        if (!play.isInProgress) continue;

        const rawMode = String(t.playMode || t.mode || '').toUpperCase();
        const playMode = rawMode.includes('CHALLENGE') ? 'challenge' : 'practice';
        const activityMs = inProgressActivityMs(
          { id: t.id, tournament: t, hasActiveSession: play.hasActiveSession, activeSession: play.activeSession },
          history,
        );

        if (play.hasActiveSession && play.activeSession?.id) {
          const session = play.activeSession;
          const sessionRes = await getGameSessionApi(t.id, session.id)
            .then((res) => res?.play || res?.data?.play || res?.data || res)
            .catch(() => null);

          const holeStart = Number(sessionRes?.holeStart) || 1;
          const holeEnd = Number(sessionRes?.holeEnd) || 18;
          const totalHoles = Math.max(1, holeEnd - holeStart + 1);
          const holeIndex = Math.min(
            totalHoles,
            Math.max(1, (Number(session.currentHole) || holeStart) - holeStart + 1),
          );
          const courseName = sessionRes?.golfCourseName || t.clubName || t.location || t.city || t.name || t.title;
          const nineLabel =
            totalHoles === 9 ? (holeStart <= 9 ? 'Front 9' : 'Back 9') : `${totalHoles} holes`;

          activeGamesList.push({
            id: `${t.id}-${session.id}`,
            tournament: t,
            tournamentName: t.name || t.title || 'Tournament',
            courseTitle: courseName ? `${courseName} — ${nineLabel}` : nineLabel,
            sessionId: session.id,
            gameNumber: Number(session.gameNumber) || play.nextGameNumber || 1,
            nextGameNumber: play.nextGameNumber,
            playMode,
            hasActiveSession: true,
            holeLabel: `Hole ${holeIndex} / ${totalHoles}`,
            holeIndex,
            totalHoles,
            progress: holeIndex / totalHoles,
            badge: 'LIVE ROUND',
            actionLabel: `CONTINUE GAME ${Number(session.gameNumber) || play.nextGameNumber || 1}`,
            date: t.startDate ? formatDisplayDate(t.startDate) : '',
            activityMs,
          });
          continue;
        }

        activeGamesList.push({
          id: `${t.id}-next-${play.nextGameNumber || play.completedCount}`,
          tournament: t,
          tournamentName: t.name || t.title || 'Tournament',
          courseTitle:
            play.nextGameNumber != null
              ? `Start Game ${play.nextGameNumber} of ${play.numberOfGames}`
              : t.clubName || t.location || t.city || '',
          sessionId: null,
          gameNumber: play.nextGameNumber || 1,
          nextGameNumber: play.nextGameNumber,
          playMode,
          hasActiveSession: false,
          holeLabel: `Game ${play.completedCount} / ${play.numberOfGames} done`,
          holeIndex: play.completedCount,
          totalHoles: play.numberOfGames,
          progress: play.numberOfGames > 0 ? play.completedCount / play.numberOfGames : 0,
          badge: 'IN PROGRESS',
          actionLabel:
            play.nextGameNumber != null ? `START GAME ${play.nextGameNumber}` : 'CONTINUE',
          date: t.startDate ? formatDisplayDate(t.startDate) : '',
          activityMs,
        });
      }

      activeGamesList.sort((a, b) => (b.activityMs || 0) - (a.activityMs || 0));

      setGames(activeGamesList);
    } catch (err) {
      console.log('Error loading in progress games:', err);
      setGames([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInProgressGames();
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress, loadInProgressGames])
  );

  const handleContinueGame = (game) => {
    if (game.sessionId) {
      navigation.navigate('ActiveGame', {
        tournament: game.tournament,
        sessionId: game.sessionId,
        gameNumber: game.gameNumber,
        playMode: game.playMode,
      });
      return;
    }
    navigation.navigate('SelectGame', {
      tournament: game.tournament,
      playMode: game.playMode,
      gameNumber: game.nextGameNumber || game.gameNumber || 1,
      selectedGameIndex: Math.max(0, (game.nextGameNumber || game.gameNumber || 1) - 1),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>
      </View>

      {/* Title Container */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>In-Progress Games</Text>
        <Text style={styles.subtitle}>
          {games.length} {games.length === 1 ? 'active game' : 'active games'}
        </Text>
      </View>

      {/* Scrollable List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadInProgressGames(true)}
            colors={['#093A24']}
            tintColor="#093A24"
          />
        }
      >
        {loading ? (
          <ActivityIndicator color="#093A24" style={{ marginTop: hp(4) }} />
        ) : games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No games in progress</Text>
            <Text style={styles.emptySubtitle}>
              When you start playing a tournament, your active rounds will appear here.
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => navigation.navigate('SelectPlayOption')}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>START A ROUND</Text>
            </TouchableOpacity>
          </View>
        ) : (
          games.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.liveTopRow}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{game.badge || 'LIVE ROUND'}</Text>
                </View>
                <View style={styles.rightHeaderBlock}>
                  <View
                    style={[
                      styles.modeBadge,
                      game.playMode === 'challenge'
                        ? styles.modeBadgeChallenge
                        : styles.modeBadgePractice,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeBadgeText,
                        game.playMode === 'challenge'
                          ? styles.modeBadgeTextChallenge
                          : styles.modeBadgeTextPractice,
                      ]}
                    >
                      {game.playMode === 'challenge' ? 'Challenge' : 'Practice'}
                    </Text>
                  </View>
                  <Text style={styles.holeText}>
                    {game.holeLabel || `Hole ${game.holeIndex} / ${game.totalHoles}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.tournamentName} numberOfLines={1}>
                {game.tournamentName}
              </Text>
              <Text style={styles.courseSubtitle} numberOfLines={1}>
                {game.courseTitle}
              </Text>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(game.progress * 100)}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={styles.continueRoundBtn}
                onPress={() => handleContinueGame(game)}
                activeOpacity={0.85}
              >
                <Text style={styles.continueRoundIcon}>▶</Text>
                <Text style={styles.continueRoundText}>
                  {game.actionLabel || `CONTINUE GAME ${game.gameNumber || 1}`}
                </Text>
              </TouchableOpacity>
            </View>
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
  headerRow: {
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    paddingBottom: hp(1),
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  titleContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: '#093A24',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#718096',
    marginTop: hp(0.4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(6),
    paddingHorizontal: wp(6),
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
    marginBottom: hp(0.8),
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#718096',
    textAlign: 'center',
    lineHeight: fontSize(18),
    marginBottom: hp(3),
  },
  startBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(24),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.4),
  },
  startBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.5,
  },
  gameCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  liveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E3B2E',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    gap: wp(1.5),
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BCFF00',
  },
  liveText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#BCFF00',
    letterSpacing: 0.5,
  },
  rightHeaderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  modeBadge: {
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
  },
  modeBadgePractice: {
    backgroundColor: 'rgba(14, 59, 46, 0.1)',
  },
  modeBadgeChallenge: {
    backgroundColor: 'rgba(188, 255, 0, 0.2)',
  },
  modeBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
  },
  modeBadgeTextPractice: {
    color: '#093A24',
  },
  modeBadgeTextChallenge: {
    color: '#093A24',
  },
  holeText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
  },
  tournamentName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    marginBottom: hp(0.3),
  },
  courseSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginBottom: hp(1.5),
  },
  progressBarBg: {
    height: hp(0.8),
    backgroundColor: '#E2E8F0',
    borderRadius: moderateScale(4),
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2EA200',
    borderRadius: moderateScale(4),
  },
  continueRoundBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(30),
    paddingVertical: hp(1.6),
    gap: wp(2),
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  continueRoundIcon: {
    fontSize: fontSize(12),
    color: '#093A24',
  },
  continueRoundText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    letterSpacing: 0.5,
  },
});

export default InProgressGamesScreen;
