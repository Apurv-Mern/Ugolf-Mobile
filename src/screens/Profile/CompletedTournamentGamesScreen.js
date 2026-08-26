import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { formatDisplayDate } from '../../utils/dateUtils';
import { getTournamentLeaderboardApi } from '../../services/playerService';

const CompletedTournamentGamesScreen = ({ navigation, route }) => {
  const group = route?.params?.group || {};
  const games = Array.isArray(group.games) ? group.games : [];
  const gameKey = games.map((g) => g.gameNumber).join(',');
  const title = group.title || 'Tournament';
  const isChallenge = String(group.playMode || 'practice').toLowerCase().includes('challenge');
  const playMode = isChallenge ? 'challenge' : 'practice';
  const modeLabel = isChallenge ? 'Challenge' : 'Practice';

  const [practiceByGame, setPracticeByGame] = useState({});
  const [loadingPb, setLoadingPb] = useState(playMode === 'practice' && games.length > 0);

  const onBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress]),
  );

  useEffect(() => {
    if (playMode !== 'practice' || !group.tournamentId || games.length === 0) {
      setLoadingPb(false);
      return;
    }

    let cancelled = false;
    setLoadingPb(true);

    Promise.all(
      games.map((game) =>
        getTournamentLeaderboardApi(group.tournamentId, {
          gameNumber: game.gameNumber,
          view: 'game',
        })
          .then((res) => {
            const data = res?.data || res;
            return {
              gameNumber: game.gameNumber,
              personalBest: data?.practice?.personalBest ?? null,
              lastTournamentBest: data?.practice?.lastTournamentBest ?? null,
            };
          })
          .catch(() => ({
            gameNumber: game.gameNumber,
            personalBest: null,
            lastTournamentBest: null,
          })),
      ),
    )
      .then((rows) => {
        if (cancelled) return;
        const next = {};
        rows.forEach((row) => {
          next[row.gameNumber] = row;
        });
        setPracticeByGame(next);
      })
      .finally(() => {
        if (!cancelled) setLoadingPb(false);
      });

    return () => {
      cancelled = true;
    };
  }, [group.tournamentId, playMode, gameKey]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>{modeLabel} Round</Text>
        </View>
        <Text style={styles.mainTitle}>{title}</Text>
        <Text style={styles.subtitle}>
          {games.length} {games.length === 1 ? 'game' : 'games'}
          {group.courseName ? ` · ${group.courseName}` : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <Text style={styles.emptyText}>No completed games yet.</Text>
        ) : (
          games.map((game) => {
            const dateStr = game.completedAt ? formatDisplayDate(game.completedAt) : '';
            const stats = practiceByGame[game.gameNumber];
            const personalBest = stats?.personalBest;
            return (
              <TouchableOpacity
                key={`game-${game.gameNumber}`}
                style={styles.gameCard}
                activeOpacity={0.85}
                onPress={() => {
                  if (!group.tournamentId) return;
                  navigation.navigate('Leaderboard', {
                    tournament: {
                      id: group.tournamentId,
                      name: title,
                      title,
                      playMode: group.playMode,
                      numberOfGames: games.length,
                    },
                    playMode,
                    gameNumber: game.gameNumber,
                  });
                }}
              >
                <View style={styles.gameTopRow}>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>Game Number {game.gameNumber}</Text>
                    <Text style={styles.gameMode}>{modeLabel} Round</Text>
                    {game.golfCourseName ? (
                      <Text style={styles.gameCourse} numberOfLines={1}>
                        {game.golfCourseName}
                      </Text>
                    ) : null}
                    {dateStr ? <Text style={styles.gameDate}>{dateStr}</Text> : null}
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{game.score ?? '—'}</Text>
                    <Text style={styles.statLabel}>This Round</Text>
                  </View>
                  {playMode === 'practice' ? (
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {loadingPb && personalBest == null
                          ? '…'
                          : personalBest != null
                            ? personalBest
                            : '—'}
                      </Text>
                      <Text style={styles.statLabel}>Personal Best</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        {loadingPb && games.length > 0 ? (
          <ActivityIndicator color="#093A24" style={{ marginTop: hp(1) }} />
        ) : null}
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
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0E3B2E',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(2.8),
    paddingVertical: hp(0.4),
    marginBottom: hp(0.8),
  },
  modeBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: '#BCFF00',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  gameCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
  },
  gameMode: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#2EA200',
    marginTop: hp(0.25),
  },
  gameCourse: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#4A5568',
    marginTop: hp(0.3),
  },
  gameDate: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#718096',
    marginTop: hp(0.3),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(1.4),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    borderRadius: moderateScale(12),
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(3),
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(20),
    color: '#093A24',
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#718096',
    marginTop: 2,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
    color: '#718096',
    textAlign: 'center',
    marginTop: hp(4),
  },
});

export default CompletedTournamentGamesScreen;
