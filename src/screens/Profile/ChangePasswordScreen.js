import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthIcon from '../../components/common/AuthIcon';
import AuthButton from '../../components/common/AuthButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});

  const onBackPress = React.useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress])
  );

  const handleUpdatePassword = () => {
    let newErrors = {};
    if (!currentPassword) newErrors.current = 'Current password is required';
    if (!newPassword) newErrors.newPass = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPass = 'Must be at least 6 characters';

    if (!confirmPassword) newErrors.confirmPass = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPass = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    Toast.show({
      type: 'success',
      text1: 'Password Updated',
      text2: 'Your password has been changed successfully!',
    });

    setTimeout(() => {
      navigation.goBack();
    }, 1200);
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

      {/* Title Container */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Change Password</Text>
        <Text style={styles.subtitle}>Update your password to keep your account secure</Text>
      </View>

      {/* Form Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current Password Input */}
        <Text style={styles.label}>Current Password</Text>
        <View style={[styles.inputWrapper, errors.current && styles.inputError]}>
          <AuthIcon name="lock" size={moderateScale(18)} color="#718096" style={styles.inputLeftIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={(txt) => {
              setCurrentPassword(txt);
              if (errors.current) setErrors((prev) => ({ ...prev, current: null }));
            }}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIconBtn}>
            <AuthIcon name={showCurrent ? 'eye' : 'eye-off'} size={moderateScale(18)} color="#718096" />
          </TouchableOpacity>
        </View>
        {errors.current ? <Text style={styles.errorText}>{errors.current}</Text> : null}

        {/* New Password Input */}
        <Text style={styles.label}>New Password</Text>
        <View style={[styles.inputWrapper, errors.newPass && styles.inputError]}>
          <AuthIcon name="lock" size={moderateScale(18)} color="#718096" style={styles.inputLeftIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={(txt) => {
              setNewPassword(txt);
              if (errors.newPass) setErrors((prev) => ({ ...prev, newPass: null }));
            }}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIconBtn}>
            <AuthIcon name={showNew ? 'eye' : 'eye-off'} size={moderateScale(18)} color="#718096" />
          </TouchableOpacity>
        </View>
        {errors.newPass ? <Text style={styles.errorText}>{errors.newPass}</Text> : null}

        {/* Confirm New Password Input */}
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={[styles.inputWrapper, errors.confirmPass && styles.inputError]}>
          <AuthIcon name="lock" size={moderateScale(18)} color="#718096" style={styles.inputLeftIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (errors.confirmPass) setErrors((prev) => ({ ...prev, confirmPass: null }));
            }}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIconBtn}>
            <AuthIcon name={showConfirm ? 'eye' : 'eye-off'} size={moderateScale(18)} color="#718096" />
          </TouchableOpacity>
        </View>
        {errors.confirmPass ? <Text style={styles.errorText}>{errors.confirmPass}</Text> : null}

        <View style={{ height: hp(4) }} />
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <AuthButton title="UPDATE PASSWORD" onPress={handleUpdatePassword} />
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
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
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
  titleContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
  },
  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: '#093A24',
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginTop: hp(0.4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
    marginBottom: hp(0.8),
    marginTop: hp(1.5),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(4),
    height: hp(6.2),
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  inputLeftIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#093A24',
    padding: 0,
  },
  eyeIconBtn: {
    padding: moderateScale(4),
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: '#E53E3E',
    marginTop: hp(0.5),
  },
  bottomBar: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(28),
    height: hp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#093A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default ChangePasswordScreen;
