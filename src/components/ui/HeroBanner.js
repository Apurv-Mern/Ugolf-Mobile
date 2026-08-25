import React from 'react';
import { View, ImageBackground, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import CircularBackButton from './CircularBackButton';
import { COLORS } from '../../theme/colors';
import { hp, wp, moderateScale } from '../../utils/responsive';

/** 250px-style image hero with optional back button overlay. */
const HeroBanner = ({
  source,
  height = hp(28),
  onBack,
  showBack = true,
  children,
  style,
  overlayOpacity = 0.35,
  /** Top-to-bottom gradient scrim; replaces the flat overlay when provided. */
  gradientColors,
  gradientLocations,
}) => {
  return (
    <ImageBackground source={source} style={[styles.hero, { height }, style]} resizeMode="cover">
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          locations={gradientLocations}
          style={styles.overlay}
          pointerEvents="none"
        />
      ) : (
        <View style={[styles.overlay, { backgroundColor: `rgba(14,59,46,${overlayOpacity})` }]} />
      )}
      {showBack ? (
        <CircularBackButton
          onPress={onBack}
          style={styles.back}
          iconColor={COLORS.textPrimary}
        />
      ) : null}
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  back: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    left: wp(6),
    zIndex: 2,
  },
});

export default HeroBanner;
