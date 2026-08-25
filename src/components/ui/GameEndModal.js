import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import AuthIcon from '../common/AuthIcon';
import PrimaryPillButton from './PrimaryPillButton';
import SecondaryPillButton from './SecondaryPillButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

/** Game complete modal matching Figma Game End frames. */
const GameEndModal = ({
  visible,
  gameNumber = 1,
  score = 0,
  onCheckScore,
  onLeave,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.close} onPress={onClose} activeOpacity={0.7}>
            <AuthIcon name="chevron-left" size={moderateScale(18)} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Game {gameNumber} complete for this nine.</Text>
          <Text style={styles.score}>Your Final score: {score}</Text>
          <SecondaryPillButton
            title="CHECK YOUR SCORE"
            onPress={onCheckScore}
            style={styles.btn}
          />
          <PrimaryPillButton title="LEAVE" onPress={onLeave} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: wp(6),
  },
  close: {
    alignSelf: 'flex-start',
    marginBottom: hp(1),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  score: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(15),
    color: '#334155',
    marginBottom: hp(2.5),
  },
  btn: {
    marginBottom: hp(1.2),
  },
});

export default GameEndModal;
