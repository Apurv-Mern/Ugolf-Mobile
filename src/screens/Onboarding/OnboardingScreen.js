import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import {
  wp,
  hp,
  fontSize,
  moderateScale,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../utils/responsive';
import { setStorageData } from '../../storage/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { PrimaryPillButton } from '../../components/ui';

// Background images
const onboarding1 = require('../../assets/Images/Onboarding Screen.png');
const onboarding2 = require('../../assets/Images/Onboarding Screen 2.png');
const onboarding3 = require('../../assets/Images/Onboarding Screen 3.png');

// Onboarding slide data
const SLIDES = [
  {
    id: '1',
    image: onboarding1,
    titleLine1: 'Live ',
    highlight1: 'GPS',
    emoji1: ' 📍',
    titleLine2: 'on every hole.',
    description:
      'Precise distances to the pin, hazards and layups rendered on a beautiful satellite course view.',
    buttonText: 'CONTINUE',
  },
  {
    id: '2',
    image: onboarding2,
    titleLine1: '',
    highlight1: 'Track',
    emoji1: ' ⏱',
    titleLine2: 'every round.',
    description:
      'Score, stats and shot patterns captured automatically as you play, hole by hole.',
    buttonText: 'CONTINUE',
  },
  {
    id: '3',
    image: onboarding3,
    titleLine1: 'Complete &\n',
    highlight1: 'Climb.',
    emoji1: ' ✨',
    titleLine2: '',
    description:
      'Join tournaments, form teams and rise through weekly, monthly and all-time rankings.',
    buttonText: 'GET STARTED',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSkip = useCallback(async () => {
    await setStorageData(STORAGE_KEYS.HAS_ONBOARDED, true);
    navigation.replace('Auth');
  }, [navigation]);

  const handleNext = useCallback(async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide — "GET STARTED"
      await setStorageData(STORAGE_KEYS.HAS_ONBOARDED, true);
      navigation.replace('Auth');
    }
  }, [currentIndex, navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <ImageBackground
          source={item.image}
          style={styles.slideImage}
          resizeMode="cover"
        >
          {/* Bottom scrim keeping Figma copy legible over the photo hero */}
          <LinearGradient
            colors={[
              'rgba(9, 36, 28, 0)',
              'rgba(9, 36, 28, 0.55)',
              'rgba(9, 36, 28, 0.92)',
            ]}
            locations={[0, 0.45, 1]}
            style={styles.scrim}
            pointerEvents="none"
          />

          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>

          {/* Bottom content area */}
          <View style={styles.bottomContent}>
            {/* Title */}
            <View style={styles.titleContainer}>
              {/* For slides 1 & 2: highlight word on first line, rest on second */}
              {index === 0 && (
                <>
                  <Text style={styles.titleText}>
                    <Text style={styles.titleWhite}>Live </Text>
                    <Text style={styles.titleHighlight}>GPS</Text>
                    <Text style={styles.titleWhite}> 📍</Text>
                  </Text>
                  <Text style={styles.titleWhite}>on every hole.</Text>
                </>
              )}
              {index === 1 && (
                <>
                  <Text style={styles.titleText}>
                    <Text style={styles.titleHighlight}>Track</Text>
                    <Text style={styles.titleWhite}> ⏱</Text>
                  </Text>
                  <Text style={styles.titleWhite}>every round.</Text>
                </>
              )}
              {index === 2 && (
                <>
                  <Text style={styles.titleWhite}>Complete &</Text>
                  <Text style={styles.titleText}>
                    <Text style={styles.titleHighlight}>Climb.</Text>
                    <Text style={styles.titleWhite}> ✨</Text>
                  </Text>
                </>
              )}
            </View>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>

            {/* Dot indicators */}
            <View style={styles.dotsContainer}>
              {SLIDES.map((_, dotIndex) => {
                const isActive = dotIndex === index;
                return (
                  <View
                    key={dotIndex}
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                );
              })}
            </View>

            {/* Button */}
            <PrimaryPillButton
              title={item.buttonText}
              onPress={handleNext}
            />
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  slideImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(7) : hp(5),
    right: wp(5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.9),
    borderRadius: moderateScale(999),
    backgroundColor: 'rgba(14, 59, 46, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 10,
  },
  skipText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(12),
    color: COLORS.textWhite,
    letterSpacing: 1.5,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(7),
    paddingBottom: Platform.OS === 'ios' ? hp(5) : hp(4),
    paddingTop: hp(3),
  },
  titleContainer: {
    marginBottom: hp(1),
  },
  titleText: {
    flexDirection: 'row',
  },
  titleWhite: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(32),
    color: COLORS.textWhite,
    lineHeight: fontSize(40),
  },
  titleHighlight: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(32),
    color: COLORS.primary,
    lineHeight: fontSize(40),
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: COLORS.textLight,
    lineHeight: fontSize(20),
    marginTop: hp(0.5),
    marginBottom: hp(2.5),
    maxWidth: wp(80),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
    gap: wp(1.5),
  },
  dot: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  dotActive: {
    width: moderateScale(24),
    backgroundColor: COLORS.dotActive,
  },
  dotInactive: {
    width: moderateScale(8),
    backgroundColor: COLORS.dotInactive,
  },
});

export default OnboardingScreen;
