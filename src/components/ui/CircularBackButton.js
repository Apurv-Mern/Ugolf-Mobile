import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AuthIcon from '../common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { moderateScale } from '../../utils/responsive';

/** Figma 48px circular back control. */
const CircularBackButton = ({ onPress, style, iconColor = COLORS.textPrimary }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) onPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <AuthIcon name="chevron-left" size={moderateScale(24)} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(999),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default CircularBackButton;
