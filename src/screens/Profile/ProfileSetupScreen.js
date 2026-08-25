import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import DotPattern from '../../components/common/DotPattern';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';
import { getPlayerProfileApi, updatePlayerProfileApi } from '../../services/playerService';

const golfHeaderBg = require('../../assets/Images/Confirmation Screen.png');

const EXPERIENCE_LEVELS = ['Beginner', 'Amateur', 'Pro'];

const ProfileSetupScreen = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Login');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation]),
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedExp, setSelectedExp] = useState('Amateur');
  const [avatarUri, setAvatarUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await getPlayerProfileApi();
        const player = res?.player || res?.data?.player || res?.data || res;
        if (player) {
          const name =
            player.displayName ||
            `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
            '';
          setFullName(name);
          setEmail(player.email || '');
          if (player.photoUrl) setAvatarUri(player.photoUrl);
        }
      } catch (err) {
        console.log('Profile setup hydrate error:', err);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const handleContinue = async () => {
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name required',
        text2: 'Please enter your full name.',
      });
      return;
    }

    setSaving(true);
    try {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || fullName.trim();
      const lastName = parts.slice(1).join(' ') || firstName;

      await updatePlayerProfileApi({
        firstName,
        lastName,
        displayName: fullName.trim(),
        ...(avatarUri ? { photoUrl: avatarUri } : {}),
      });

      Toast.show({
        type: 'success',
        text1: 'Profile saved',
        text2: selectedExp ? `Experience: ${selectedExp}` : undefined,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (err) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Could not save profile.';
      Toast.show({ type: 'error', text1: 'Save failed', text2: backendMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Image source={golfHeaderBg} style={styles.headerImage} resizeMode="cover" />
          <View style={styles.headerOverlay} />

          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Set up your profile</Text>
            <Text style={styles.headerSubtitle}>Tell us about your game</Text>
          </View>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {fullName ? fullName.charAt(0).toUpperCase() : '👤'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formCard}>
          {loading ? (
            <ActivityIndicator color="#093A24" style={{ marginVertical: hp(2) }} />
          ) : null}

          <Text style={styles.fieldLabel}>Full name</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="James Carter"
              placeholderTextColor="#A0AEC0"
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
            />
          </View>

          <Text style={styles.fieldLabel}>Email ID</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="James123@gmail.com"
              placeholderTextColor="#A0AEC0"
              value={email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.fieldLabel}>Playing experience</Text>
          <View style={styles.expRow}>
            {EXPERIENCE_LEVELS.map((level) => {
              const isSelected = selectedExp === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.expBtn, isSelected && styles.expBtnSelected]}
                  onPress={() => setSelectedExp(level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.expBtnText, isSelected && styles.expBtnTextSelected]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1, minHeight: hp(4) }} />
      </ScrollView>

      <DotPattern width={SCREEN_WIDTH} style={styles.dotPattern} />

      <View style={styles.btnWrapper}>
        <AuthButton
          title={saving ? 'SAVING…' : 'CONTINUE'}
          onPress={handleContinue}
          disabled={saving || loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(14),
  },
  headerContainer: {
    width: '100%',
    height: hp(28),
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.45)',
  },
  headerTextBlock: {
    position: 'absolute',
    top: hp(6),
    left: wp(6),
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: COLORS.white,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
    color: 'rgba(255,255,255,0.85)',
    marginTop: hp(0.4),
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -moderateScale(40),
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarCircle: {
    width: moderateScale(84),
    height: moderateScale(84),
    borderRadius: moderateScale(42),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  avatarInitial: {
    fontSize: fontSize(28),
  },
  cameraBtn: {
    position: 'absolute',
    right: SCREEN_WIDTH / 2 - moderateScale(52),
    bottom: 0,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: fontSize(12),
  },
  formCard: {
    marginTop: hp(7),
    marginHorizontal: wp(5),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    padding: wp(5),
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13),
    color: '#093A24',
    marginBottom: hp(0.8),
    marginTop: hp(1.2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(3),
    backgroundColor: '#F8FAF9',
  },
  inputIcon: {
    marginRight: wp(2),
    fontSize: fontSize(14),
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
    color: '#093A24',
    paddingVertical: hp(1.4),
  },
  expRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: hp(0.5),
  },
  expBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(10),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  expBtnSelected: {
    backgroundColor: '#093A24',
    borderColor: '#093A24',
  },
  expBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(12),
    color: '#64748B',
  },
  expBtnTextSelected: {
    color: '#BCFF00',
  },
  dotPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  btnWrapper: {
    position: 'absolute',
    left: wp(5),
    right: wp(5),
    bottom: hp(3),
  },
});

export default ProfileSetupScreen;
