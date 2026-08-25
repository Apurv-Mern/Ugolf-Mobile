import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS } from '../../theme/colors';
import { moderateScale } from '../../utils/responsive';

/** Glass / frosted white card used for list rows and panels. */
const GlassCard = ({ children, style, onPress, selected = false }) => {
  const content = (
    <View style={[styles.card, selected && styles.selected, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  selected: {
    borderColor: COLORS.cta,
    backgroundColor: '#F4FFE0',
  },
});

export default GlassCard;
