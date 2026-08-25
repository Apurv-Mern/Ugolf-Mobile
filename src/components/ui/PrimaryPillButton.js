import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

import AuthIcon from '../common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { hp, fontSize, moderateScale } from '../../utils/responsive';

/** Full-width lime CTA matching Figma pill buttons. */
const PrimaryPillButton = ({
  title = 'CONTINUE',
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  /** Optional AuthIcon name rendered before the label. */
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[styles.wrapper, disabled && styles.disabled, style]}
      activeOpacity={0.9}
      disabled={disabled || loading}
      onPress={onPress}
    >
      <View style={styles.button}>
        <View style={styles.highlight} />
        <View style={styles.bottomShadow} />
        {loading ? (
          <ActivityIndicator color={COLORS.ctaText} />
        ) : (
          <View style={styles.content}>
            {iconName ? (
              <AuthIcon
                name={iconName}
                size={moderateScale(18)}
                color={COLORS.ctaText}
              />
            ) : null}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    shadowColor: COLORS.ctaGlow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  button: {
    height: moderateScale(56),
    borderRadius: moderateScale(50),
    backgroundColor: COLORS.cta,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: 'rgba(88,120,0,0.28)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: COLORS.ctaText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default PrimaryPillButton;
