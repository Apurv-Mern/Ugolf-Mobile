import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { hp, fontSize } from '../../utils/responsive';

/** Title + optional subtitle used across light Figma screens. */
const ScreenHeader = ({ title, subtitle, style, titleStyle, subtitleStyle }) => {
  return (
    <View style={[styles.wrap, style]}>
      {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
      {subtitle ? (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: hp(1.2),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(30),
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
    lineHeight: fontSize(36),
  },
  subtitle: {
    marginTop: hp(0.5),
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(16),
    color: COLORS.textMuted,
    lineHeight: fontSize(24),
  },
});

export default ScreenHeader;
