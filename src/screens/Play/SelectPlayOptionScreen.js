// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';

// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenScaffold,
//   HeroBanner,
//   GlassCard,
//   PrimaryPillButton,
// } from '../../components/ui';

// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

// const PLAY_OPTIONS = [
//   {
//     id: 'practice',
//     icon: 'flag',
//     title: 'Practice Round',
//     desc: 'Just your Team and the course. Track your own round.',
//   },
//   {
//     id: 'challenge',
//     icon: 'users',
//     title: 'Challenge a Team',
//     desc: 'Create a team, invite other teams and compete together.',
//   },
// ];

// const SelectPlayOptionScreen = ({ navigation }) => {
//   const [selectedOption, setSelectedOption] = useState('practice'); // 'practice' or 'challenge'

//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };

//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation])
//   );

//   const handleContinue = () => {
//     if (selectedOption === 'practice') {
//       navigation.navigate('SelectTournament', { playMode: 'practice' });
//     } else {
//       navigation.navigate('SelectTeamSize', { playMode: 'challenge' });
//     }
//   };

//   return (
//     <ScreenScaffold edges={['bottom']} showDots={false}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       <HeroBanner source={tournamentBg} onBack={() => navigation.goBack()}>
//         <View style={styles.heroTextWrap}>
//           <Text style={styles.heroTitle}>How do you want to play?</Text>
//           <Text style={styles.heroSubtitle}>Choose your game mode</Text>
//         </View>
//       </HeroBanner>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {PLAY_OPTIONS.map((option) => {
//           const isSelected = selectedOption === option.id;
//           return (
//             <GlassCard
//               key={option.id}
//               selected={isSelected}
//               onPress={() => setSelectedOption(option.id)}
//               style={styles.optionCard}
//             >
//               <View style={styles.optionRow}>
//                 <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
//                   <AuthIcon
//                     name={option.icon}
//                     size={moderateScale(20)}
//                     color={COLORS.textPrimary}
//                   />
//                 </View>

//                 <View style={styles.optionTextCol}>
//                   <Text style={styles.optionTitle}>{option.title}</Text>
//                   <Text style={styles.optionDesc}>{option.desc}</Text>
//                 </View>

//                 <View style={[styles.selector, isSelected && styles.selectorSelected]}>
//                   {isSelected ? (
//                     <AuthIcon
//                       name="check"
//                       size={moderateScale(14)}
//                       color={COLORS.textPrimary}
//                     />
//                   ) : null}
//                 </View>
//               </View>
//             </GlassCard>
//           );
//         })}
//       </ScrollView>

//       <View style={styles.footer}>
//         <PrimaryPillButton title="CONTINUE" onPress={handleContinue} />
//       </View>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   heroTextWrap: {
//     paddingHorizontal: wp(6),
//     paddingBottom: hp(3),
//   },
//   heroTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: COLORS.white,
//     letterSpacing: -0.5,
//   },
//   heroSubtitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(14),
//     color: 'rgba(255, 255, 255, 0.9)',
//     marginTop: hp(0.8),
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(3),
//     paddingBottom: hp(2),
//   },
//   optionCard: {
//     marginBottom: hp(1.8),
//   },
//   optionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(2),
//     gap: wp(3.5),
//   },
//   iconCircle: {
//     width: moderateScale(46),
//     height: moderateScale(46),
//     borderRadius: moderateScale(23),
//     backgroundColor: '#E9F2EC',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconCircleActive: {
//     backgroundColor: COLORS.cta,
//   },
//   optionTextCol: {
//     flex: 1,
//   },
//   optionTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: COLORS.textPrimary,
//   },
//   optionDesc: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(12.5),
//     color: COLORS.textMuted,
//     marginTop: hp(0.4),
//     lineHeight: fontSize(17),
//   },
//   selector: {
//     width: moderateScale(26),
//     height: moderateScale(26),
//     borderRadius: moderateScale(13),
//     borderWidth: 1.5,
//     borderColor: '#CBD5E1',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectorSelected: {
//     borderColor: COLORS.cta,
//     backgroundColor: COLORS.cta,
//   },
//   footer: {
//     backgroundColor: COLORS.bgPage,
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1),
//     paddingBottom: hp(2),
//   },
// });

// export default SelectPlayOptionScreen;


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AuthIcon from '../../components/common/AuthIcon';
import AuthButton from '../../components/common/AuthButton';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import {
  wp,
  hp,
  fontSize,
  moderateScale,
} from '../../utils/responsive';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

const SelectPlayOptionScreen = ({ navigation }) => {
  // ============================================================
  // FUNCTIONALITY FROM CURRENT / UNCOMMENTED CODE
  // ============================================================

  const [selectedOption, setSelectedOption] = useState('practice');

  // Android hardware back handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // Continue navigation logic
  const handleContinue = () => {
    if (selectedOption === 'practice') {
      navigation.navigate('SelectTournament', {
        playMode: 'practice',
      });
    } else {
      navigation.navigate('SelectTournament', {
        playMode: 'challenge',
      });
    }
  };

  // ============================================================
  // UI FROM COMMENTED VERSION
  // ============================================================

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ========================================================
          HEADER BANNER
      ======================================================== */}
      <ImageBackground
        source={tournamentBg}
        style={styles.bannerHeader}
        resizeMode="cover"
      >
        <View style={styles.bannerOverlay} />

        {/* Back Button */}
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

        {/* Header Text */}
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>
            How do you want to play?
          </Text>

          <View style={styles.subtitleBadge}>
            <Text style={styles.bannerSubtitle}>
              Choose your game mode
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* ========================================================
          OPTIONS AREA
      ======================================================== */}
      <View style={styles.whiteCardContainer}>
        <ScrollView
          contentContainerStyle={styles.whiteCardScroll}
          showsVerticalScrollIndicator={false}
          style={styles.optionsScroll}
        >
          {/* ====================================================
              PRACTICE ROUND
          ==================================================== */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'practice' &&
              styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption('practice')}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={tournamentBg}
              style={styles.cardBgImage}
              imageStyle={styles.cardBgImageStyle}
              resizeMode="cover"
            >
              <View style={styles.cardOverlay} />

              <View style={styles.cardContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    selectedOption === 'practice'
                      ? styles.iconCircleActive
                      : styles.iconCircleInactive,
                  ]}
                >
                  <AuthIcon
                    name="flag"
                    size={moderateScale(18)}
                    color={
                      selectedOption === 'practice'
                        ? '#093A24'
                        : '#FFFFFF'
                    }
                  />
                </View>

                {/* Text */}
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>
                    Practice Round
                  </Text>

                  <View style={styles.cardDescWrapper}>
                    <Text style={styles.cardDesc}>
                      Just your Team and the course. Track your own round.
                    </Text>
                  </View>
                </View>

                {/* Selector */}
                <View
                  style={[
                    styles.selectorCircle,
                    selectedOption === 'practice' &&
                    styles.selectorCircleSelected,
                  ]}
                >
                  {selectedOption === 'practice' && (
                    <AuthIcon
                      name="check"
                      size={moderateScale(11)}
                      color="#093A24"
                    />
                  )}
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* ====================================================
              CHALLENGE A TEAM
          ==================================================== */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'challenge' &&
              styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption('challenge')}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={homescreenBg}
              style={styles.cardBgImage}
              imageStyle={styles.cardBgImageStyle}
              resizeMode="cover"
            >
              <View style={styles.cardOverlay} />

              <View style={styles.cardContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    selectedOption === 'challenge'
                      ? styles.iconCircleActive
                      : styles.iconCircleInactive,
                  ]}
                >
                  <AuthIcon
                    name="users"
                    size={moderateScale(18)}
                    color={
                      selectedOption === 'challenge'
                        ? '#093A24'
                        : '#FFFFFF'
                    }
                  />
                </View>

                {/* Text */}
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>
                    Challenge a Team
                  </Text>

                  <View style={styles.cardDescWrapper}>
                    <Text style={styles.cardDesc}>
                      Create a team, invite other teams and compete together.
                    </Text>
                  </View>
                </View>

                {/* Selector */}
                <View
                  style={[
                    styles.selectorCircle,
                    selectedOption === 'challenge' &&
                    styles.selectorCircleSelected,
                  ]}
                >
                  {selectedOption === 'challenge' && (
                    <AuthIcon
                      name="check"
                      size={moderateScale(11)}
                      color="#093A24"
                    />
                  )}
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ========================================================
          FIXED CONTINUE BUTTON
      ======================================================== */}
      <View style={styles.btnFixedBottom}>
        <AuthButton
          title="CONTINUE"
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ============================================================
  // MAIN CONTAINER
  // ============================================================

  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  // ============================================================
  // HEADER
  // ============================================================

  bannerHeader: {
    width: '100%',
    height: hp(28),
    justifyContent: 'flex-end',
    position: 'relative',
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.45)',
  },

  backButtonCircle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(6.5) : hp(5),
    left: wp(5),

    width: moderateScale(38),
    height: moderateScale(38),

    borderRadius: moderateScale(19),

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 100,

    elevation: 4,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  bannerTextContainer: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(3),
  },

  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.white,

    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
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

  // ============================================================
  // OPTIONS CONTAINER
  // ============================================================

  whiteCardContainer: {
    flex: 1,

    marginTop: -moderateScale(12),

    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),

    backgroundColor: '#F8FAF9',

    paddingHorizontal: wp(5),

    zIndex: 2,
  },

  optionsScroll: {
    flex: 1,
  },

  whiteCardScroll: {
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },

  // ============================================================
  // OPTION CARD
  // ============================================================

  optionCard: {
    height: hp(15),

    marginBottom: hp(2),

    borderRadius: moderateScale(22),

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 4,

    borderWidth: 2.5,
    borderColor: 'transparent',
  },

  optionCardSelected: {
    borderColor: '#BCFF00',
  },

  // ============================================================
  // CARD BACKGROUND
  // ============================================================

  cardBgImage: {
    flex: 1,

    borderRadius: moderateScale(22),

    overflow: 'hidden',
  },

  cardBgImageStyle: {
    borderRadius: moderateScale(22),
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(9, 58, 36, 0.45)',

    borderRadius: moderateScale(22),
  },

  // ============================================================
  // CARD CONTENT
  // ============================================================

  cardContent: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: wp(4.5),

    zIndex: 2,
  },

  // ============================================================
  // ICON
  // ============================================================

  iconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),

    borderRadius: moderateScale(21),

    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircleActive: {
    backgroundColor: '#BCFF00',
  },

  iconCircleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // ============================================================
  // CARD TEXT
  // ============================================================

  cardTextContainer: {
    flex: 1,
    marginLeft: wp(3),
    marginRight: wp(2),
  },

  cardDescWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 25, 16, 0.85)',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    marginTop: hp(0.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(17),

    color: '#FFFFFF',

    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },

  cardDesc: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12.5),

    color: '#FFFFFF',

    lineHeight: fontSize(16.5),

    textShadowColor: 'rgba(0, 0, 0, 0.98)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 6,
  },

  // ============================================================
  // SELECTOR
  // ============================================================

  selectorCircle: {
    width: moderateScale(22),
    height: moderateScale(22),

    borderRadius: moderateScale(11),

    borderWidth: 2,

    borderColor: COLORS.white,

    backgroundColor: 'transparent',

    justifyContent: 'center',
    alignItems: 'center',
  },

  selectorCircleSelected: {
    borderColor: '#BCFF00',
    backgroundColor: '#BCFF00',
  },

  // ============================================================
  // BOTTOM BUTTON
  // ============================================================

  btnFixedBottom: {
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingTop: hp(1.5),
    paddingBottom: hp(2.5),
  },
});

export default SelectPlayOptionScreen;