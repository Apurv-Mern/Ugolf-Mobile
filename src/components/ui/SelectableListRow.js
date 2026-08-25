import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import AuthIcon from '../common/AuthIcon';
import GlassCard from './GlassCard';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

/**
 * Avatar + title (+ optional subtitle) + trailing check/radio.
 */
const SelectableListRow = ({
  title,
  subtitle,
  image,
  selected = false,
  onPress,
  trailing = 'check',
  badge,
  style,
}) => {
  return (
    <GlassCard selected={selected} onPress={onPress} style={[styles.card, style]}>
      <View style={styles.row}>
        {image ? (
          <Image source={image} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>
              {(title || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.trail, selected && styles.trailSelected]}>
          {selected ? (
            <AuthIcon name="check" size={moderateScale(16)} color={COLORS.textPrimary} />
          ) : trailing === 'radio' ? (
            <View style={styles.radioEmpty} />
          ) : null}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: hp(1.2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(1.4),
    gap: wp(3),
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
  },
  avatarFallback: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: COLORS.textPrimary,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(16),
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: COLORS.textMuted,
  },
  badge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cta,
    borderRadius: moderateScale(8),
    paddingHorizontal: wp(2),
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(11),
    color: COLORS.textPrimary,
  },
  trail: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailSelected: {
    backgroundColor: COLORS.cta,
    borderColor: COLORS.cta,
  },
  radioEmpty: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: 'transparent',
  },
});

export default SelectableListRow;
