import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { getPlayerProfileApi, updatePlayerProfileApi } from '../../services/playerService';
import { setStorageData, getStorageData } from '../../storage/storage';
import { useDispatch } from 'react-redux';
import { setLoginData } from '../../redux/slices/authSlice';

const trophyImg = require('../../assets/Images/ trophy.png');

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getPlayerProfileApi();
      const player = res?.player || res?.data?.player || res;
      if (player) {
        setFirstName(player.firstName || '');
        setLastName(player.lastName || '');
        setEmail(player.email || '');
        setCity(player.city || '');
        setStateRegion(player.state || '');
        setCountry(player.country || '');
      }
    } catch (err) {
      console.log('Load profile error:', err);
      const stored = await getStorageData('USER_DATA');
      const user = stored?.user || stored?.player || stored;
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setCity(user.city || '');
        setStateRegion(user.state || '');
        setCountry(user.country || '');
      }
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, loadProfile])
  );

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim() || undefined,
        city: city.trim() || undefined,
        state: stateRegion.trim() || undefined,
        country: country.trim() || undefined,
      };
      const res = await updatePlayerProfileApi(payload);
      const player = res?.player || res?.data?.player || { ...payload, email };
      await setStorageData('USER_DATA', { user: player, player });
      const token = await getStorageData('token');
      dispatch(setLoginData({ user: player, token }));
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile changes have been saved.',
      });
      navigation.goBack();
    } catch (err) {
      console.log('Update profile error:', err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not update profile.';
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.mainTitle}>Edit Profile</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section with Camera Badge */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={trophyImg} style={styles.avatarImage} />
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <AuthIcon name="camera" size={moderateScale(14)} color="#093A24" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputCard}>
          <AuthIcon name="user" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            placeholderTextColor="#718096"
          />
        </View>

        <View style={styles.inputCard}>
          <AuthIcon name="user" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            placeholderTextColor="#718096"
          />
        </View>

        <View style={styles.inputCard}>
          <AuthIcon name="mail" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            placeholderTextColor="#718096"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputCard}>
          <AuthIcon name="map-pin" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#718096"
          />
        </View>

        <View style={styles.inputCard}>
          <AuthIcon name="map-pin" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={stateRegion}
            onChangeText={setStateRegion}
            placeholder="State / Region"
            placeholderTextColor="#718096"
          />
        </View>

        <View style={styles.inputCard}>
          <AuthIcon name="map-pin" size={moderateScale(18)} color="#718096" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={country}
            onChangeText={setCountry}
            placeholder="Country"
            placeholderTextColor="#718096"
          />
        </View>

        {/* Bottom padding for fixed button */}
        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* Fixed Save Changes Button */}
      <View style={styles.btnFixedBottom}>
        <AuthButton title="SAVE CHANGES" onPress={handleSaveChanges} disabled={saving} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  headerRow: {
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(6) : (StatusBar.currentHeight || 24) + hp(1),
    paddingBottom: hp(1),
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: '#093A24',
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(4),
  },

  // Avatar Section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  avatarWrapper: {
    position: 'relative',
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    borderColor: '#BCFF00',
    backgroundColor: '#EDF5EF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(50),
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: '#BCFF00',
    borderWidth: 1.8,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  // Input Field Cards
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(20),
    height: hp(6.2),
    paddingHorizontal: wp(4.5),
    marginBottom: hp(1.8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: wp(3.5),
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: fontSize(14.5),
    color: '#093A24',
    padding: 0,
  },

  btnFixedBottom: {
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    paddingTop: hp(1.5),
  },
});

export default EditProfileScreen;
