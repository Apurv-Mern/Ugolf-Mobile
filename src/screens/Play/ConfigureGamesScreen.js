import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
  Platform,
  BackHandler,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getConfigureGamesApi, saveConfigureGamesApi, getCoursesByClubApi, getTournamentByIdApi } from '../../services/homeService';
import { getTournamentTeamsApi } from '../../services/teamService';
import { isChallengeLocked } from '../../utils/playProgress';

const tournamentBg = require('../../assets/Images/tournament_bg.jpg');
const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Empty game slot
const emptyGame = () => ({ courseId: null, courseName: null, holeRange: null });

const ConfigureGamesScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;

  const tournament = route?.params?.newTournament || route?.params?.tournament;
  const selectedTeam = route?.params?.selectedTeam;
  const tournamentId = tournament?.id || tournament?._id;

  // Full API response state
  const [configData, setConfigData] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);

  // Games selections
  const [games, setGames] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Selected game for invited player
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [challengeLocked, setChallengeLocked] = useState(
    !!tournament?.challengeLocked,
  );
  const [gameStarted, setGameStarted] = useState(!!tournament?.gameStarted);

  // Dropdown modal state
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    options: [],
    onSelect: null,
  });

  const creatorId =
    tournament?.creatorUserId ||
    tournament?.creatorId ||
    tournament?.createdBy ||
    configData?.creatorUserId ||
    configData?.creatorId;

  const isCreator = Boolean(
    route?.params?.isCreator ??
    (creatorId && currentUserId && String(creatorId).toLowerCase() === String(currentUserId).toLowerCase())
  );

  const statusUpper = String(tournament?.status || configData?.status || '').toUpperCase();
  const isStarted =
    challengeLocked === true ||
    tournament?.challengeLocked === true ||
    configData?.challengeLocked === true ||
    gameStarted === true ||
    tournament?.gameStarted === true ||
    configData?.gameStarted === true ||
    tournament?.isStarted === true ||
    tournament?.hasStarted === true ||
    tournament?.isInProgress === true ||
    configData?.isStarted === true ||
    configData?.hasStarted === true ||
    configData?.isInProgress === true ||
    statusUpper === 'IN_PROGRESS' ||
    statusUpper === 'ACTIVE' ||
    statusUpper === 'COMPLETED' ||
    statusUpper === 'CANCELLED';

  console.log('========================');
  console.log('Current User ID:', currentUserId);
  console.log('Tournament Title:', tournament?.title || tournament?.name);
  console.log('Tournament Creator ID:', creatorId);
  console.log('Is Creator:', isCreator);
  console.log('Is Tournament Gameplay Started:', isStarted);
  console.log('========================');

  // Mount guard
  const isMounted = React.useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load config from API
  useEffect(() => {
    if (tournamentId) {
      loadConfig();
    } else {
      const numGames = tournament?.numberOfGames || 1;
      setGames(Array.from({ length: numGames }, emptyGame));
      setLoadingConfig(false);
    }
  }, [tournamentId]);


  //     const data = res?.data || res;
  //     setConfigData(data);

  //     const numGames = data?.numberOfGames || tournament?.numberOfGames || 1;

  //     const initialGames = Array.from({ length: numGames }, (_, i) => {
  //       const existing = data?.games?.find((g) => g.gameNumber === i + 1);
  //       if (existing?.configured && existing?.course) {
  //         return {
  //           courseId: existing.course.id,
  //           courseName: existing.course.name,
  //           holeRange: {
  //             holeStart: existing.holeStart,
  //             holeEnd: existing.holeEnd,
  //             label: `${existing.holeStart}–${existing.holeEnd}`,
  //           },
  //         };
  //       }
  //       return emptyGame();
  //     });

  //     setGames(initialGames);
  //   } catch (err) {
  //     console.log('Load configure games error:', err);
  //     const numGames = tournament?.numberOfGames || 1;
  //     setGames(Array.from({ length: numGames }, emptyGame));
  //   } finally {
  //     if (isMounted.current) setLoadingConfig(false);
  //   }
  // };
  const loadConfig = async () => {
    if (!isMounted.current) return;

    setLoadingConfig(true);

    try {
      const res = await getConfigureGamesApi(tournamentId);

      const data = res?.data || res;
      let availableCourses = data?.availableCourses || [];
      const clubId = data?.clubId || tournament?.clubId || tournament?.golfClubId;

      if (clubId) {
        try {
          const coursesRes = await getCoursesByClubApi(clubId);
          const rawCourses = coursesRes?.courses || coursesRes?.data?.courses || (Array.isArray(coursesRes) ? coursesRes : []);
          if (rawCourses.length > 0) {
            availableCourses = rawCourses.map((c) => ({
              id: c.id || c._id,
              name: c.name || c.courseName || 'Golf Course',
              numberOfHoles: c.numberOfHoles || 18,
              holeRanges: c.holeRanges || [
                { holeStart: 1, holeEnd: 9, label: '1–9' },
                { holeStart: 10, holeEnd: 18, label: '10–18' },
              ],
            }));
          }
        } catch (cErr) {
          console.log('Error loading courses by club ID:', cErr);
        }
      }

      const fullData = { ...data, availableCourses };
      setConfigData(fullData);

      if (tournamentId && isUuid(String(tournamentId))) {
        try {
          const tRes = await getTournamentTeamsApi(tournamentId);
          if (tRes?.challengeLocked === true || tRes?.data?.challengeLocked === true || isChallengeLocked(tournament, tRes)) {
            setChallengeLocked(true);
          }
        } catch (lockErr) {
          console.log('Challenge lock check note:', lockErr);
        }
        try {
          const tDetail = await getTournamentByIdApi(tournamentId);
          const fullT = tDetail?.tournament || tDetail?.data?.tournament || tDetail?.data || tDetail;
          if (fullT?.challengeLocked === true) setChallengeLocked(true);
          if (fullT?.gameStarted === true) setGameStarted(true);
        } catch (startedErr) {
          console.log('Tournament started check note:', startedErr);
        }
      }

      const numGames =
        fullData?.numberOfGames ||
        tournament?.numberOfGames ||
        1;

      let clubResetWarning = false;

      const initialGames = Array.from(
        { length: numGames },
        (_, i) => {
          const existing = fullData?.games?.find(
            (g) => g.gameNumber === i + 1
          );

          if (existing?.configured && existing?.course) {
            // Verify if existing.course belongs to availableCourses for the currently selected Golf Club
            const courseMatch = availableCourses.find(
              (c) =>
                String(c.id) === String(existing.course.id) ||
                (c.name && existing.course.name && String(c.name).toLowerCase() === String(existing.course.name).toLowerCase())
            );

            if (courseMatch) {
              return {
                courseId: courseMatch.id,
                courseName: courseMatch.name,
                holeRange: {
                  holeStart: existing.holeStart,
                  holeEnd: existing.holeEnd,
                  label: `${existing.holeStart}–${existing.holeEnd}`,
                },
              };
            } else {
              clubResetWarning = true;
            }
          }

          return emptyGame();
        }
      );

      setGames(initialGames);

      if (clubResetWarning) {
        Toast.show({
          type: 'info',
          text1: 'Golf Club Updated',
          text2: 'Golf club was changed. Please configure courses for the new golf club.',
          text2NumberOfLines: 0,
        });
      }
    } catch (err) {
      console.log(err);

      const numGames =
        tournament?.numberOfGames || 1;

      setGames(
        Array.from(
          { length: numGames },
          emptyGame
        )
      );
    } finally {
      if (isMounted.current) {
        setLoadingConfig(false);
      }
    }
  };
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

  // Update a single game slot
  const updateGame = (gameIndex, patch) => {
    setGames((prev) => {
      const copy = [...prev];
      copy[gameIndex] = { ...copy[gameIndex], ...patch };
      return copy;
    });
  };

  // Open course selection dropdown modal
  const openCourseDropdown = (gameIndex) => {
    if (!isCreator) return;
    if (isStarted) {
      Toast.show({
        type: 'info',
        text1: 'Configuration Locked',
        text2: 'Game configuration cannot be changed once tournament gameplay has started.',
      });
      return;
    }
    const courses = configData?.availableCourses || [];
    if (!courses.length) {
      Toast.show({
        type: 'info',
        text1: 'No Courses Available',
        text2: 'Could not load courses list from server.',
      });
      return;
    }
    setModal({
      visible: true,
      title: 'Select Course',
      options: courses.map((c) => ({
        label: c.name,
        value: c,
      })),
      onSelect: (opt) => {
        updateGame(gameIndex, {
          courseId: opt.value.id,
          courseName: opt.value.name,
          holeRange: null, // Reset hole range when course changes
        });
      },
    });
  };

  // Open hole range selection dropdown modal
  const openHoleDropdown = (gameIndex) => {
    if (!isCreator) return;
    if (isStarted) {
      Toast.show({
        type: 'info',
        text1: 'Configuration Locked',
        text2: 'Game configuration cannot be changed once tournament gameplay has started.',
      });
      return;
    }
    const currentGame = games[gameIndex];
    if (!currentGame?.courseId) {
      Toast.show({
        type: 'info',
        text1: 'Select Course First',
        text2: 'Please select a course before choosing hole range.',
      });
      return;
    }
    const courseObj = configData?.availableCourses?.find((c) => c.id === currentGame.courseId);
    const ranges = courseObj?.holeRanges || [];
    if (!ranges.length) {
      Toast.show({
        type: 'info',
        text1: 'No Hole Ranges',
        text2: 'No hole ranges defined for this course.',
      });
      return;
    }
    setModal({
      visible: true,
      title: 'Select Holes',
      options: ranges.map((r) => ({
        label: r.label || `${r.holeStart}–${r.holeEnd}`,
        value: r,
      })),
      onSelect: (opt) => {
        updateGame(gameIndex, { holeRange: opt.value });
      },
    });
  };

  const closeModal = () => setModal((m) => ({ ...m, visible: false, onSelect: null }));

  // Save / Continue
  const handleContinue = async () => {
    if (!isCreator || isStarted) {
      // Invitee or Locked/Started mode: skip re-saving configuration, proceed directly
      if (!isCreator) {
        const gameNumber = (selectedGameIndex != null ? Number(selectedGameIndex) : 0) + 1;
        if (tournamentId && isUuid(String(tournamentId))) {
          setSaving(true);
          try {
            const tRes = await getTournamentTeamsApi(tournamentId);
            const tTeams = tRes?.teams || tRes?.data?.teams || tRes?.data || (Array.isArray(tRes) ? tRes : []);
            const onRoster = (Array.isArray(tTeams) ? tTeams : []).some((t) => {
              const members = t.members || t.roster || t.players || [];
              if (!Array.isArray(members) || !currentUserId) return false;
              return members.some((m) => {
                const mid = m.playerUserId || m.userId || m.id || m._id;
                return String(mid).toLowerCase() === String(currentUserId).toLowerCase();
              });
            });

            if (!onRoster) {
              Toast.show({
                type: 'error',
                text1: 'Not On Roster',
                text2: 'You are not listed on a team for this tournament yet.',
              });
              return;
            }

            navigation.navigate('SelectGame', {
              ...route?.params,
              tournament,
              selectedTeam,
              selectedGameIndex,
              gameNumber,
              playMode: route?.params?.playMode || tournament?.playMode || 'challenge',
            });
          } catch (err) {
            console.log('Invitee roster check error:', err);
            Toast.show({
              type: 'error',
              text1: 'Roster Check Failed',
              text2: err?.response?.data?.error || err?.response?.data?.message || 'Could not verify tournament roster.',
            });
          } finally {
            setSaving(false);
          }
          return;
        }
      }

      if (challengeLocked || isStarted) {
        navigation.navigate('SelectGame', {
          ...route?.params,
          tournament,
          selectedTeam,
          selectedGameIndex,
          gameNumber: (selectedGameIndex != null ? Number(selectedGameIndex) : 0) + 1,
          playMode: route?.params?.playMode || tournament?.playMode || 'challenge',
        });
        return;
      }

      navigation.navigate('SelectTeam', {
        ...route?.params,
        tournament,
        selectedTeam,
        selectedGameIndex,
        gameNumber: (selectedGameIndex != null ? Number(selectedGameIndex) : 0) + 1,
      });
      return;
    }

    // Creator mode - validate and save
    const incomplete = games.findIndex((g) => !g.courseId || !g.holeRange);
    if (incomplete !== -1) {
      Toast.show({
        type: 'error',
        text1: 'Configuration Incomplete',
        text2: `Please select a golf course and hole range for Game ${incomplete + 1}.`,
      });
      setExpandedIndex(incomplete);
      return;
    }

    // Check for duplicate / overlapping hole configurations on the same course
    const duplicatesMap = {};
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      if (g.courseId && g.holeRange) {
        const key = `${g.courseId}_${g.holeRange.holeStart}_${g.holeRange.holeEnd}`;
        if (duplicatesMap[key] != null) {
          const prevIdx = duplicatesMap[key];
          const duplicateMsg = `Games ${prevIdx + 1} and ${i + 1} both use holes ${g.holeRange.label} on the same course. Please select non-overlapping hole ranges or different courses.`;
          Toast.show({
            type: 'error',
            text1: 'Save Failed',
            text2: duplicateMsg,
            text2NumberOfLines: 0,
          });
          setExpandedIndex(i);
          return;
        }
        duplicatesMap[key] = i;
      }
    }

    if (!tournamentId) {
      Toast.show({
        type: 'error',
        text1: 'Tournament Error',
        text2: 'Tournament ID is missing.',
        text2NumberOfLines: 0,
      });
      return;
    }

    setSaving(true);
    try {
      const selections = games.map((g, i) => ({
        gameNumber: i + 1,
        golfCourseId: g.courseId,
        holeStart: g.holeRange.holeStart,
        holeEnd: g.holeRange.holeEnd,
      }));

      await saveConfigureGamesApi(tournamentId, selections);

      Toast.show({
        type: 'success',
        text1: 'Games Configured!',
        text2: 'Tournament games saved successfully.',
        text2NumberOfLines: 0,
      });

      navigation.navigate('SelectTeam', { ...route?.params, tournament, selectedTeam });
    } catch (error) {
      console.log('Save configure games error:', error);
      const errData = error?.response?.data || error?.data || {};
      const errMsg =
        errData?.error ||
        errData?.message ||
        (typeof errData === 'string' ? errData : null) ||
        error?.message ||
        'Could not save games configuration';

      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: errMsg,
        text2NumberOfLines: 0,
      });
    } finally {
      setSaving(false);
    }
  };

  // Render game section card
  const renderGameSection = (index) => {
    const game = games[index] || emptyGame();
    const isExpanded = expandedIndex === index;
    const isConfigured = !!(game.courseId && game.holeRange);

    return (
      <View key={index} style={[styles.gameCard, isExpanded && styles.gameCardExpanded]}>
        {/* Card Header */}
        <TouchableOpacity
          style={styles.gameCardHeader}
          onPress={() => {
            setExpandedIndex(isExpanded ? -1 : index);
            if (!isCreator) setSelectedGameIndex(index);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.flagCircle,
                isConfigured && styles.flagCircleConfigured,
              ]}
            >
              <AuthIcon name="flag" size={moderateScale(16)} color="#093A24" />
            </View>
            <View>
              <Text style={styles.gameCardTitle}>Game Number {index + 1}</Text>
              {isConfigured && !isExpanded && (
                <Text style={styles.gameCardSubtitle}>
                  {game.courseName} · Holes {game.holeRange.label}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <AuthIcon
              name="chevron-left"
              size={moderateScale(16)}
              color="#4A5568"
              style={{ transform: [{ rotate: isExpanded ? '90deg' : '-90deg' }] }}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded View */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {isCreator && !isStarted ? (
              /* Creator Mode before start: Interactive Selectors */
              <>
                <Text style={styles.fieldLabel}>Select Course :</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => openCourseDropdown(index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownValueText,
                      !game.courseName && styles.dropdownPlaceholder,
                    ]}
                  >
                    {game.courseName || 'Choose a course…'}
                  </Text>
                  <AuthIcon name="chevron-left" size={moderateScale(12)} color="#093A24" style={{ transform: [{ rotate: '-90deg' }] }} />
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Number of holes for this game :</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => openHoleDropdown(index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownValueText,
                      !game.holeRange && styles.dropdownPlaceholder,
                    ]}
                  >
                    {game.holeRange ? game.holeRange.label : 'Choose hole range…'}
                  </Text>
                  <AuthIcon name="chevron-left" size={moderateScale(12)} color="#093A24" style={{ transform: [{ rotate: '-90deg' }] }} />
                </TouchableOpacity>
              </>
            ) : (
              /* Non-Creator OR Locked/Started View Mode */
              <>
                <Text style={styles.fieldLabel}>Select Course :</Text>
                <Text style={styles.readOnlyValue}>
                  {game.courseName || 'Pebble Creek — Championship'}
                </Text>

                <Text style={[styles.fieldLabel, { marginTop: hp(1.5) }]}>
                  Number of holes for this game :
                </Text>
                <Text style={styles.readOnlyValue}>
                  {game.holeRange ? game.holeRange.label : '1-9'}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Main ScrollView */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header Banner ── */}
        <ImageBackground source={tournamentBg} style={styles.header} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>
            {isCreator ? 'Configure Games' : 'Select Game'}
          </Text>
          <View style={styles.subtitleBadge}>
            <Text style={styles.bannerSubtitle}>
              {isCreator
                ? 'Configure courses and hole ranges for this tournament'
                : 'Select which game you wanna play'}
            </Text>
          </View>
        </ImageBackground>

        {/* ── 2. Content ── */}
        <View style={styles.whiteContainer}>

          {loadingConfig ? (
            <ActivityIndicator size="large" color="#093A24" style={{ marginVertical: hp(6) }} />
          ) : (
            games.map((_, index) => renderGameSection(index))
          )}

          <View style={{ height: hp(2) }} />
        </View>
      </ScrollView>

      {/* Dropdown Options Modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <FlatList
              data={modal.options}
              keyExtractor={(item, idx) => item.label + idx}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOptionRow}
                  onPress={() => {
                    if (modal.onSelect) modal.onSelect(item);
                    closeModal();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fixed Bottom Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton
          title="CONTINUE"
          loading={saving}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // 1. Header Banner
  header: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(7) : hp(5),
    paddingBottom: hp(5),
    paddingHorizontal: wp(5),
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.40)',
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 10,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: COLORS.white,
    lineHeight: fontSize(34),
  },
  subtitleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9, 58, 36, 0.75)',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.4)',
  },
  bannerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: '#BCFF00',
    letterSpacing: 0.3,
  },

  // 2. White Section
  whiteContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    borderTopLeftRadius: moderateScale(22),
    borderTopRightRadius: moderateScale(22),
    marginTop: -hp(2.5),
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
  },

  // Game Cards
  gameCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    marginBottom: hp(1.8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  gameCardExpanded: {
    borderColor: '#BCFF00',
    borderWidth: 2,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  flagCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagCircleConfigured: {
    backgroundColor: '#BCFF00',
  },
  gameCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },
  gameCardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
    marginTop: hp(0.3),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },

  // Expanded View
  expandedContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  fieldLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),
    color: '#093A24',
    marginBottom: hp(0.6),
    marginTop: hp(1.2),
  },
  readOnlyValue: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#093A24',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(3.5),
    height: hp(5.2),
    marginBottom: hp(1),
  },
  dropdownValueText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontFamily: FONTS.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalCard: {
    width: '100%',
    maxHeight: hp(60),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(22),
    padding: moderateScale(20),
    elevation: 5,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),
    color: '#093A24',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  modalOptionRow: {
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalOptionText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    textAlign: 'center',
  },

  // Fixed Bottom Button
  btnFixedBottom: {
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default ConfigureGamesScreen;
