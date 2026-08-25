import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CircularBackButton from '../ui/CircularBackButton';
import { COLORS } from '../../theme/colors';
import { wp, hp } from '../../utils/responsive';

/**
 * Reusable BackButton matching the Figma design.
 * Defaults to navigation.goBack() if no onPress is provided.
 * Uses safe area insets to prevent status bar clipping on iOS & Android.
 */
const BackButton = ({ onPress, style = {}, iconColor }) => {
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top + 10 : Platform.OS === 'ios' ? hp(6) : hp(4);

  return (
    <CircularBackButton
      onPress={onPress}
      style={[
        {
          position: 'absolute',
          top: topInset,
          left: wp(5),
          zIndex: 100,
        },
        style,
      ]}
      iconColor={iconColor || COLORS.textPrimary}
    />
  );
};

export default BackButton;
