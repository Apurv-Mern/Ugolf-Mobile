import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { hp, wp, fontSize, moderateScale } from '../../utils/responsive';

/** Label + rounded glass input / textarea. */
const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  style,
  inputStyle,
  ...rest
}) => {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, multiline && styles.multilineWrap]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: hp(1.8),
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13),
    color: COLORS.textLabel,
    marginLeft: wp(1),
    marginBottom: hp(0.7),
  },
  inputWrap: {
    minHeight: moderateScale(54),
    borderRadius: moderateScale(18),
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: wp(4.5),
    justifyContent: 'center',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  multilineWrap: {
    minHeight: moderateScale(147),
    paddingVertical: hp(1.4),
    alignItems: 'flex-start',
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(15),
    color: COLORS.textPrimary,
    paddingVertical: 0,
    width: '100%',
  },
  multilineInput: {
    minHeight: moderateScale(110),
  },
});

export default FormField;
