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
      setHistory(
        (Array.isArray(list) ? list : []).map((h, idx) => ({
          id: h.sessionId || h.id || `h-${idx}`,
          tournamentName: h.tournamentName || h.golfCourseName || 'Completed Round',
          courseName: h.golfCourseName && h.golfCourseName !== h.tournamentName ? h.golfCourseName : '',
          date: h.completedAt ? formatDisplayDate(h.completedAt) : '',
          score: h.score ?? '—',
          parDiff: h.gameNumber != null ? `Game ${h.gameNumber}` : '',
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
        <Text style={styles.subtitle}>{history.length} rounds played</Text>
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
            <TouchableOpacity key={item.id} style={styles.historyCard} activeOpacity={0.85}>
              <Image source={item.image} style={styles.courseAvatar} />

              <View style={styles.infoContainer}>
                <Text style={styles.tournamentName} numberOfLines={1}>
                  {item.tournamentName}
                </Text>
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
                <Text style={styles.scoreText}>{item.score}</Text>
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
  },
  tournamentName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
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
