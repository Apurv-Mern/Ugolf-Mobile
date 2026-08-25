import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { fontSize, moderateScale } from '../../utils/responsive';

/** Outline / cancel pill button. */
const SecondaryPillButton = ({
  title = 'CANCEL',
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textPrimary} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: moderateScale(56),
    borderRadius: moderateScale(50),
    borderWidth: 1.5,
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SecondaryPillButton;
