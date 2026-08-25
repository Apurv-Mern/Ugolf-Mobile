// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   ImageBackground,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

// import AuthInput from '../../components/common/AuthInput';
// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenHeader,
//   CircularBackButton,
//   PrimaryPillButton,
//   GlassCard,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import Toast from 'react-native-toast-message';
// import { forgotPasswordApi } from '../../services/authService';

// const resetPasswordBg = require('../../assets/Images/reset_password_bg.png');

// const ForgotPasswordScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     const unsubscribeFocus = navigation.addListener('focus', () => {
//       setEmail('');
//       setErrors({});
//     });
//     const unsubscribeBlur = navigation.addListener('blur', () => {
//       setEmail('');
//       setErrors({});
//     });
//     return () => {
//       unsubscribeFocus();
//       unsubscribeBlur();
//     };
//   }, [navigation]);

//   const handleInputChange = (field, value, setter) => {
//     setter(value);
//     if (errors[field]) {
//       setErrors(prev => {
//         const updated = { ...prev };
//         delete updated[field];
//         return updated;
//       });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email) {
//       newErrors.email = 'Email address is required';
//     } else if (!emailRegex.test(email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleResetLink = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await forgotPasswordApi({
//         email: email.trim(),
//       });

//       Toast.show({
//         type: 'success',
//         text1: 'Reset Link Sent',
//         text2: response?.message || 'Please check your email to reset your password.',
//       });

//       setTimeout(() => {
//         navigation.goBack();
//       }, 2000);
//     } catch (error) {
//       const errorMsg = error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
//       Toast.show({
//         type: 'error',
//         text1: 'Request Failed',
//         text2: errorMsg,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />
//       <ImageBackground
//         source={resetPasswordBg}
//         style={styles.bgImage}
//         resizeMode="cover"
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.keyboardView}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.backWrapper}>
//               <CircularBackButton onPress={() => navigation.goBack()} />
//             </View>

//             <View style={styles.centerContainer}>
//               <GlassCard style={styles.card}>
//                 <Text style={styles.cardTitle}>Reset Password</Text>
//                 <Text style={styles.cardSubtitle}>
//                   Enter the email linked to your account and we'll send you a reset link.
//                 </Text>

//                 <AuthInput
//                   iconName="mail"
//                   placeholder="Email address"
//                   value={email}
//                   onChangeText={(text) => handleInputChange('email', text, setEmail)}
//                   keyboardType="email-address"
//                   style={[styles.field, errors.email ? styles.inputError : {}]}
//                 />
//                 {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

//                 <PrimaryPillButton
//                   title="SEND RESET LINK"
//                   onPress={handleResetLink}
//                   loading={loading}
//                 />
//               </GlassCard>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.bgPage,
//   },
//   bgImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: wp(6),
//     paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
//     paddingBottom: hp(5),
//     justifyContent: 'space-between',
//   },
//   backWrapper: {
//     alignSelf: 'flex-start',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingVertical: hp(4),
//   },
//   card: {
//     paddingHorizontal: wp(6),
//     paddingVertical: hp(3.5),
//     borderRadius: moderateScale(24),
//     backgroundColor: 'rgba(255, 255, 255, 0.92)',
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 8,
//   },
//   cardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(22),
//     color: COLORS.textPrimary,
//     marginBottom: hp(1),
//   },
//   cardSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12.5),
//     color: COLORS.textMuted,
//     lineHeight: fontSize(18),
//     marginBottom: hp(3),
//   },
//   field: {
//     borderRadius: moderateScale(16),
//     height: hp(6.6),
//     marginBottom: hp(2.5),
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.textPrimary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   inputError: {
//     borderColor: COLORS.error,
//   },
//   errorText: {
//     color: COLORS.error,
//     fontSize: fontSize(11),
//     fontFamily: FONTS.medium,
//     marginTop: -hp(2),
//     marginBottom: hp(2),
//     paddingLeft: wp(1),
//   },
// });

// export default ForgotPasswordScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthInput from '../../components/common/AuthInput';
import AuthButton from '../../components/common/AuthButton';
import BackButton from '../../components/common/BackButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const resetPasswordBg = require('../../assets/Images/Forgot Password Bg.png');

import Toast from 'react-native-toast-message';
import { forgotPasswordApi } from '../../services/authService';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setEmail('');
      setErrors({});
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setEmail('');
      setErrors({});
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetLink = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPasswordApi({
        email: email.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Reset Link Sent',
        text2: response?.message || 'Please check your email to reset your password.',
      });

      // Redirect user back to Login screen
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ImageBackground
        source={resetPasswordBg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Reusable Back Button rendered over the background */}
        <BackButton iconColor="#093A24" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Centered glassmorphic container overlay matching Figma padlock screen */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSubtitle}>
                Enter the email linked to your account and we'll send you a reset link.
              </Text>

              {/* Light themed email input */}
              <AuthInput
                iconName="mail"
                placeholder="Email address"
                value={email}
                onChangeText={(text) => handleInputChange('email', text, setEmail)}
                keyboardType="email-address"
                style={[styles.inputSpacing, errors.email ? styles.inputError : {}]}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Send Reset Link Button */}
              <AuthButton
                title="SEND RESET LINK"
                onPress={handleResetLink}
                loading={loading}
                style={styles.resetBtn}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Glassmorphic translucent backdrop matching Figma on both platforms
    borderRadius: moderateScale(24),
    borderWidth: 2,
    borderColor: '#0E3B2E80', // Figma dark green border with opacity matching mockup
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(4),
    // Soft high-end shadows matching Figma depth
    shadowColor: '#051A10', // Deep green-black shadow
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: Platform.OS === 'ios' ? 15 : 0, // Set to 0 on Android to avoid shadow bleeding through the glassmorphic container
    width: '100%',
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: '#093A24', // Deep green forest title text matching Figma
    marginBottom: hp(1.5),
  },
  cardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#3B584E', // Figma muted dark-green/grey text
    lineHeight: fontSize(18),
    marginBottom: hp(3.5),
  },
  inputSpacing: {
    marginBottom: hp(3),
    backgroundColor: COLORS.white, // Ensure pure white input container inside glass card
  },
  resetBtn: {
    marginTop: hp(0.5),
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: fontSize(11),
    fontFamily: FONTS.medium,
    marginTop: -hp(2.2),
    marginBottom: hp(2.2),
    paddingLeft: wp(1),
  },
});

export default ForgotPasswordScreen;
