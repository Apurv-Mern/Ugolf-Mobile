import React from 'react';
import { View, StyleSheet } from 'react-native';

import PrimaryPillButton from './PrimaryPillButton';
import SecondaryPillButton from './SecondaryPillButton';
import { wp, hp } from '../../utils/responsive';

/** Cancel + Save / dual CTA footer. */
const BottomDualActions = ({
  leftTitle = 'CANCEL',
  rightTitle = 'SAVE',
  onLeftPress,
  onRightPress,
  leftLoading,
  rightLoading,
  style,
}) => {
  return (
    <View style={[styles.row, style]}>
      <SecondaryPillButton
        title={leftTitle}
        onPress={onLeftPress}
        loading={leftLoading}
        style={styles.half}
      />
      <PrimaryPillButton
        title={rightTitle}
        onPress={onRightPress}
        loading={rightLoading}
        style={styles.half}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: wp(4),
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
  },
  half: {
    flex: 1,
  },
});

export default BottomDualActions;
