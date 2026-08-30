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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getPlayerGameHistoryApi } from '../../services/playerService';
import { getStartGameReadinessApi } from '../../services/playService';
import {
  classifyTournamentPlay,
  groupGameHistoryByTournament,
  isChallengePlayMode,
  unwrapReadiness,
} from '../../utils/playProgress';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

import { formatDisplayDate } from '../../utils/dateUtils';

const HISTORY_IMAGES = [homescreenBg, trophyImg, tournamentBg];

const TournamentHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const onBackPress = React.useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlayerGameHistoryApi();
      const list = res?.history || res?.data?.history || res?.data || (Array.isArray(res) ? res : []);
      const rows = Array.isArray(list) ? list : [];

      const readinessById = new Map();
      const ids = [
        ...new Set(
          rows
            .map((h) => String(h.tournamentId || h.tournament?.id || h.tournament?._id || ''))
            .filter((id) => id && id.includes('-')),
        ),
      ];
      await Promise.all(
        ids.map((id) =>
          getStartGameReadinessApi(id)
            .then((ready) => readinessById.set(id, unwrapReadiness(ready)))
            .catch(() => readinessById.set(id, null)),
        ),
      );

      const completedRows = rows.filter((h) => {
        const hid = String(h.tournamentId || h.tournament?.id || h.tournament?._id || '');
        const play = classifyTournamentPlay(
          { id: hid, numberOfGames: h.numberOfGames || h.tournament?.numberOfGames },
          readinessById.get(hid),
        );
        return play.isCompleted;
      });

      setHistory(
        groupGameHistoryByTournament(completedRows).map((group, idx) => ({
          ...group,
          id: group.tournamentId,
          tournamentName: group.title,
          date: group.lastCompletedAt ? formatDisplayDate(group.lastCompletedAt) : '',
          score: null,
          parDiff: group.games.length === 1 ? '1 game' : `${group.games.length} games`,
          isChallenge: isChallengePlayMode(
            group.playMode,
            readinessById.get(group.tournamentId)?.playMode,
          ),
          image: HISTORY_IMAGES[idx % HISTORY_IMAGES.length],
        })),
      );
    } catch (err) {
      console.log('Tournament history error:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress, loadHistory])
  );

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
        <Text style={styles.mainTitle}>Tournament History</Text>
        <Text style={styles.subtitle}>
          {history.length} {history.length === 1 ? 'tournament' : 'tournaments'}
        </Text>
      </View>

      {/* Scrollable List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color="#093A24" style={{ marginTop: hp(4) }} />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No completed rounds yet.</Text>
        ) : (
          history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              activeOpacity={0.85}
              onPress={() => {
                if (!item.tournamentId) return;
                navigation.navigate('Leaderboard', {
                  tournament: {
                    id: item.tournamentId,
                    name: item.tournamentName || item.title,
                    title: item.tournamentName || item.title,
                    playMode: item.playMode,
                    numberOfGames: item.games?.length || 1,
                  },
                  playMode: String(item.playMode || '').toLowerCase().includes('challenge')
                    ? 'challenge'
                    : 'practice',
                  gameNumber: item.latestGameNumber || item.games?.[0]?.gameNumber || 1,
                });
              }}
            >
              <Image source={item.image} style={styles.courseAvatar} />

              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.tournamentName} numberOfLines={1}>
                    {item.tournamentName}
                  </Text>
                  <View
                    style={[
                      styles.modeBadge,
                      item.isChallenge
                        ? styles.modeBadgeChallenge
                        : styles.modeBadgePractice,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeBadgeText,
                        item.isChallenge
                          ? styles.modeBadgeTextChallenge
                          : styles.modeBadgeTextPractice,
                      ]}
                    >
                      {item.isChallenge ? 'Challenge' : 'Practice'}
                    </Text>
                  </View>
                </View>
                {item.courseName ? (
                  <Text style={styles.courseName} numberOfLines={1}>
                    {item.courseName}
                  </Text>
                ) : null}
                <View style={styles.dateRow}>
                  <AuthIcon name="clock" size={moderateScale(12)} color="#718096" style={{ marginRight: wp(1) }} />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.parDiffText}>{item.parDiff}</Text>
              </View>
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
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
    padding: wp(3),
    marginBottom: hp(1.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  courseAvatar: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(12),
    marginRight: wp(3),
  },
  infoContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  tournamentName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    flexShrink: 1,
  },
  modeBadge: {
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.25),
    borderWidth: 1.5,
    flexShrink: 0,
  },
  modeBadgePractice: {
    backgroundColor: '#093A24',
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeBadgeChallenge: {
    backgroundColor: '#093A24',
    borderColor: '#BCFF00',
  },
  modeBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(9),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modeBadgeTextPractice: {
    color: '#FFFFFF',
  },
  modeBadgeTextChallenge: {
    color: '#BCFF00',
  },
  courseName: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#4A5568',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#718096',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
  },
  parDiffText: {
    fontFamily: FONTS.regular,
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

export default TournamentHistoryScreen;
