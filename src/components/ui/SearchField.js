import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import AuthIcon from '../common/AuthIcon';
import GlassCard from './GlassCard';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, fontSize, moderateScale } from '../../utils/responsive';

const SearchField = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  style,
  ...rest
}) => {
  return (
    <GlassCard style={[styles.card, style]}>
      <View style={styles.row}>
        <AuthIcon name="search" size={moderateScale(20)} color={COLORS.textPrimary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          {...rest}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: wp(4),
    minHeight: moderateScale(54),
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: fontSize(15),
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
});

export default SearchField;
