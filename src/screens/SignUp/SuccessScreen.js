import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import DotPattern from '../../components/common/DotPattern';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

const authBg = require('../../assets/Images/Confirmation Screen.png');

const SuccessScreen = ({ navigation }) => {
  const isProceedingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If we are explicitly proceeding forward, allow the screen to be removed
      if (isProceedingRef.current) {
        return;
      }
      // Prevent backward navigation pop completely
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Block hardware back button completely on success screen
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        subscription.remove();
    }, [])
  );

  const handleEnter = () => {
    isProceedingRef.current = true;
    navigation.replace('ChoosePlan');
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]} edges={[]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ImageBackground source={authBg} style={styles.backgroundImage} resizeMode="cover">
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Dot pattern at the bottom */}
        <DotPattern width={SCREEN_WIDTH} style={styles.bottomDotPattern} />

        {/* Content centred on screen */}
        <View style={styles.content}>
          {/* Green checkmark badge */}
          <View style={styles.badge}>
            <AuthIcon name="check" size={moderateScale(52)} color="#093A24" />
          </View>

          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            You have successfully registered. Please proceed with purchasing your plan.
          </Text>

          {/* Enter Button */}
          <AuthButton
            title="ENTER"
            onPress={handleEnter}
            style={styles.enterBtn}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.72)', // Deep forest green/black tint overlay matching Figma exactly
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingBottom: hp(6),
  },
  badge: {
    width: moderateScale(108),
    height: moderateScale(108),
    borderRadius: moderateScale(54),
    backgroundColor: '#BCFF00', // Figma neon green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
    // Soft glow shadow for the checkmark circle
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: fontSize(20),
    marginBottom: hp(6),
  },
  enterBtn: {
    // Custom width / margins if needed
  },
  bottomDotPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(22),
    zIndex: 1,
  },
});

export default SuccessScreen;
