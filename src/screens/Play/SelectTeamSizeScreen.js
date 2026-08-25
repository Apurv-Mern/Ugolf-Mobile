import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AuthIcon from '../../components/common/AuthIcon';
import {
  ScreenScaffold,
  HeroBanner,
  GlassCard,
  PrimaryPillButton,
} from '../../components/ui';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');

const TEAM_SIZE_OPTIONS = [
  { id: 1, players: '1 Player', desc: 'Individual Round' },
  { id: 2, players: '2 Player', desc: 'Head to Head' },
  { id: 3, players: '3 Player', desc: 'Three Ball' },
  { id: 4, players: '4 Player', desc: 'Team Round' },
  { id: 5, players: '5 Player', desc: 'Tournament Play' },
];

const SelectTeamSizeScreen = ({ navigation, route }) => {
  const [selectedTeamSize, setSelectedTeamSize] = useState(1);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  return (
    <ScreenScaffold edges={['bottom']} showDots={false}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <HeroBanner source={homescreenBg} onBack={() => navigation.goBack()}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Select team size</Text>
          <Text style={styles.heroSubtitle}>
            Select the total number of players participating in this round.
          </Text>
        </View>
      </HeroBanner>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TEAM_SIZE_OPTIONS.map((item) => {
          const isSelected = selectedTeamSize === item.id;
          return (
            <GlassCard
              key={item.id}
              selected={isSelected}
              onPress={() => setSelectedTeamSize(item.id)}
              style={styles.sizeCard}
            >
              <View style={styles.sizeRow}>
                <View style={[styles.numberCircle, isSelected && styles.numberCircleSelected]}>
                  <Text style={styles.numberText}>{item.id}</Text>
                </View>

                <View style={styles.sizeTextCol}>
                  <Text style={styles.sizeTitle}>{item.players}</Text>
                  <Text style={styles.sizeDesc}>{item.desc}</Text>
                </View>

                <View style={[styles.selector, isSelected && styles.selectorSelected]}>
                  {isSelected ? (
                    <AuthIcon
                      name="check"
                      size={moderateScale(14)}
                      color={COLORS.textPrimary}
                    />
                  ) : null}
                </View>
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryPillButton
          title="CONTINUE"
          onPress={() =>
            navigation.navigate('SelectTournament', {
              ...route?.params,
              teamSize: selectedTeamSize,
            })
          }
        />
      </View>
    </ScreenScaffold>
  );
};

const styles = StyleSheet.create({
  heroTextWrap: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(3),
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13),
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: hp(0.8),
    lineHeight: fontSize(19),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  sizeCard: {
    marginBottom: hp(1.5),
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    gap: wp(3.5),
  },
  numberCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#E9F2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberCircleSelected: {
    backgroundColor: COLORS.cta,
  },
  numberText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: COLORS.textPrimary,
  },
  sizeTextCol: {
    flex: 1,
  },
  sizeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(16),
    color: COLORS.textPrimary,
  },
  sizeDesc: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12.5),
    color: COLORS.textMuted,
    marginTop: hp(0.2),
  },
  selector: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorSelected: {
    borderColor: COLORS.cta,
    backgroundColor: COLORS.cta,
  },
  footer: {
    backgroundColor: COLORS.bgPage,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingTop: hp(1.5),
    paddingBottom: hp(2.5),
  },
});

export default SelectTeamSizeScreen;
