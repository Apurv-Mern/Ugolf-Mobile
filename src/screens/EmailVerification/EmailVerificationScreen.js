// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   Animated,
//   AppState,
//   Image,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   CircularBackButton,
//   ScreenHeader,
//   PrimaryPillButton,
//   GlassCard,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import Toast from 'react-native-toast-message';
// import { sendVerificationOtpApi, verifyEmailApi } from '../../services/authService';
// import { getStorageData } from '../../storage/storage';

// const emailVerificationBg = require('../../assets/Images/Email Verification.png');

// const EmailVerificationScreen = ({ navigation, route }) => {
//   const email = route?.params?.email || 'your email';
//   // const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [otp, setOtp] = useState('');
//   const inputRef = useRef(null);
//   const blinkAnim = useRef(new Animated.Value(1)).current;

//   // Blinking cursor animation loop
//   useEffect(() => {
//     const blink = Animated.loop(
//       Animated.sequence([
//         Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
//         Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
//       ])
//     );
//     blink.start();
//     return () => blink.stop();
//   }, [blinkAnim]);
//   const [focusedIndex, setFocusedIndex] = useState(-1);
//   const TIMER_DURATION = 600; // 10 minutes (600 seconds)
//   const timerEndTimeRef = useRef(Date.now() + TIMER_DURATION * 1000);
//   const [timer, setTimer] = useState(TIMER_DURATION);
//   const [loading, setLoading] = useState(false);

//   // const inputRefs = [
//   //   useRef(null),
//   //   useRef(null),
//   //   useRef(null),
//   //   useRef(null),
//   //   useRef(null),
//   //   useRef(null),
//   // ];

//   useEffect(() => {
//     const updateTimer = () => {
//       const remaining = Math.round((timerEndTimeRef.current - Date.now()) / 1000);
//       if (remaining <= 0) {
//         setTimer(0);
//       } else {
//         setTimer(remaining);
//       }
//     };

//     // Calculate initial remaining time immediately
//     updateTimer();

//     const interval = setInterval(updateTimer, 1000);

//     // Sync timer when app comes back to the foreground
//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       if (nextAppState === 'active') {
//         updateTimer();
//       }
//     });

//     return () => {
//       clearInterval(interval);
//       subscription.remove();
//     };
//   }, []);

//   useEffect(() => {
//     const logToken = async () => {
//       const storedToken = await getStorageData('token');
//       console.log('--- EMAIL VERIFICATION MOUNT: stored token =', storedToken);
//     };
//     logToken();

//     // Auto-trigger OTP sending if navigating from Login Screen
//     if (route?.params?.sendOTP) {
//       const autoSendOtp = async () => {
//         try {
//           await sendVerificationOtpApi({ email });
//           Toast.show({
//             type: 'success',
//             text1: 'OTP Sent',
//             text2: 'A verification code has been sent to your email.',
//           });
//         } catch (error) {
//           console.log('Auto-OTP Mount Error:', error);
//           const errorMsg = error?.response?.data?.message || error?.message || 'Failed to send verification OTP.';
//           Toast.show({
//             type: 'error',
//             text1: 'Error',
//             text2: errorMsg,
//           });
//         }
//       };
//       autoSendOtp();
//     }
//   }, [route?.params?.sendOTP]);

//   const formatTimer = (time) => {
//     const mins = Math.floor(time / 60);
//     const secs = time % 60;
//     return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const handleResend = async () => {
//     if (timer === 0) {
//       setLoading(true);
//       try {
//         await sendVerificationOtpApi({ email });
//         timerEndTimeRef.current = Date.now() + 600 * 1000;
//         setTimer(600);
//         // setOtp(['', '', '', '', '', '']);
//         // inputRefs[0].current.focus();
//         setOtp('');
//         inputRef.current?.focus();
//         Toast.show({
//           type: 'success',
//           text1: 'OTP Sent',
//           text2: 'A new 6-digit verification code has been sent to your email.',
//         });
//       } catch (error) {
//         const errorMsg = error?.response?.data?.message || error?.message || 'Failed to resend OTP.';
//         Toast.show({
//           type: 'error',
//           text1: 'Error',
//           text2: errorMsg,
//         });
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleChangeText = (text, index) => {
//     const cleanedText = text.replace(/[^0-9]/g, '');

//     // Support copy-paste of a full 6-digit code
//     if (cleanedText.length > 1) {
//       const newOtp = [...otp];
//       for (let i = 0; i < 6; i++) {
//         if (i >= index && i - index < cleanedText.length) {
//           newOtp[i] = cleanedText[i - index];
//         }
//       }
//       setOtp(newOtp);
//       const nextFocusIndex = Math.min(index + cleanedText.length - 1, 5);
//       inputRefs[nextFocusIndex].current.focus();
//       return;
//     }

//     const newOtp = [...otp];
//     newOtp[index] = cleanedText.slice(-1);
//     setOtp(newOtp);

//     // Auto-focus next input
//     if (cleanedText && index < 5) {
//       inputRefs[index + 1].current.focus();
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       const newOtp = [...otp];
//       newOtp[index - 1] = '';
//       setOtp(newOtp);
//       inputRefs[index - 1].current.focus();
//     }
//   };

//   const handleVerify = async () => {
//     // const enteredOtp = otp.join('');
//     const enteredOtp = otp;
//     if (enteredOtp.length < 6) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Please enter the complete 6-digit verification code.',
//       });
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await verifyEmailApi({
//         email: email,
//         otp: enteredOtp,
//       });

//       Toast.show({
//         type: 'success',
//         text1: 'Email Verified',
//         text2: response?.message || 'Email verified successfully!',
//       });

//       // Navigate to SuccessScreen
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'SuccessScreen' }],
//         });
//       }, 1500);
//     } catch (error) {
//       const errorData = error?.response?.data;
//       const errorMsg = errorData?.error || errorData?.message || error?.message || 'Invalid or expired OTP. Please try again.';
//       Toast.show({
//         type: 'error',
//         text1: 'Verification Failed',
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
//         barStyle="light-content"
//       />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           bounces={false}
//         >
//           {/* Hero Banner with Image */}
//           <View style={styles.heroWrapper}>
//             <Image
//               source={emailVerificationBg}
//               style={styles.heroImage}
//               resizeMode="cover"
//             />
//             <LinearGradient
//               colors={['rgba(14, 59, 46, 0.4)', 'rgba(14, 59, 46, 0.8)']}
//               style={styles.heroOverlay}
//             />

//             <View style={styles.backButtonWrapper}>
//               <CircularBackButton onPress={() => navigation.goBack()} />
//             </View>

//             <View style={styles.waveCutout} />
//           </View>

//           {/* Verification Card */}
//           <View style={styles.formContainer}>
//             <GlassCard style={styles.card}>
//               <View style={styles.badgeWrapper}>
//                 <View style={styles.badge}>
//                   <AuthIcon
//                     name="mail"
//                     size={moderateScale(28)}
//                     color={COLORS.textPrimary}
//                   />
//                 </View>
//               </View>

//               <Text style={styles.cardTitle}>Verify Your Email</Text>
//               <Text style={styles.cardSubtitle}>
//                 We have sent a 6 digit verification code to your Email ID. Enter the code below to verify your email & continue
//               </Text>

//               {/* 6 Digit Verification Input boxes */}
//               <View style={styles.otpRow}>
//                 <TouchableOpacity
//                   activeOpacity={1}
//                   onPress={() => inputRef.current?.focus()}
//                   style={styles.otpBoxes}
//                 >
//                   {[0, 1, 2, 3, 4, 5].map((index) => {
//                     const isActive = index === otp.length && focusedIndex !== -1;
//                     const isFilled = otp.length > index;
//                     return (
//                       <View
//                         key={index}
//                         style={[
//                           styles.otpBox,
//                           isFilled && styles.otpBoxFilled,
//                           isActive && styles.otpBoxActive,
//                         ]}
//                       >
//                         {isFilled ? (
//                           <Text style={styles.otpText}>{otp[index]}</Text>
//                         ) : isActive ? (
//                           <Animated.View
//                             style={[styles.otpCursor, { opacity: blinkAnim }]}
//                           />
//                         ) : null}
//                       </View>
//                     );
//                   })}
//                 </TouchableOpacity>

//                 <TextInput
//                   ref={inputRef}
//                   value={otp}
//                   onChangeText={(text) =>
//                     setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))
//                   }
//                   onFocus={() => setFocusedIndex(0)}
//                   onBlur={() => setFocusedIndex(-1)}
//                   keyboardType="number-pad"
//                   maxLength={6}
//                   caretHidden
//                   textContentType="oneTimeCode"
//                   autoComplete={Platform.OS === 'ios' ? 'one-time-code' : 'sms-otp'}
//                   style={styles.hiddenInput}
//                 />
//               </View>

//               {/* Countdown Timer */}
//               <View style={styles.timerRow}>
//                 <Text style={styles.timerLabel}>
//                   Code Expires in{' '}
//                   <Text style={styles.timerValue}>{formatTimer(timer)}</Text>
//                 </Text>

//                 <View style={styles.resendContainer}>
//                   <Text style={styles.resendLabel}>Didn't receive the code? </Text>
//                   <TouchableOpacity
//                     onPress={handleResend}
//                     disabled={timer > 0}
//                     activeOpacity={0.7}
//                   >
//                     <Text
//                       style={[
//                         styles.resendLink,
//                         timer > 0 && styles.resendLinkDisabled,
//                       ]}
//                     >
//                       Resend OTP
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Security Banner */}
//               <View style={styles.securityBanner}>
//                 <View style={styles.securityBadge}>
//                   <AuthIcon name="check" size={moderateScale(16)} color={COLORS.textPrimary} />
//                 </View>
//                 <View style={styles.securityTextContainer}>
//                   <Text style={styles.securityTitle}>Secure and Private</Text>
//                   <Text style={styles.securitySubtitle}>
//                     Your information is encrypted and kept secure with us.
//                   </Text>
//                 </View>
//               </View>

//               <PrimaryPillButton
//                 title="VERIFY EMAIL"
//                 onPress={handleVerify}
//                 loading={loading}
//                 style={styles.verifyBtn}
//               />
//             </GlassCard>
//           </View>


//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.bgPage,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   heroWrapper: {
//     height: hp(28),
//     width: '100%',
//     position: 'relative',
//     justifyContent: 'flex-end',
//     paddingHorizontal: wp(6),
//     paddingBottom: hp(4),
//   },
//   heroImage: {
//     ...StyleSheet.absoluteFillObject,
//     width: '100%',
//     height: '100%',
//   },
//   heroOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   backButtonWrapper: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? hp(6) : hp(4),
//     left: wp(6),
//     zIndex: 10,
//   },
//   waveCutout: {
//     position: 'absolute',
//     bottom: -1,
//     left: 0,
//     right: 0,
//     height: hp(3),
//     backgroundColor: COLORS.bgPage,
//     borderTopLeftRadius: moderateScale(28),
//     borderTopRightRadius: moderateScale(28),
//   },
//   formContainer: {
//     flex: 1,
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(5),
//   },
//   card: {
//     paddingHorizontal: wp(5),
//     paddingTop: hp(3),
//     paddingBottom: hp(3),
//     borderRadius: moderateScale(24),
//   },
//   badgeWrapper: {
//     alignItems: 'center',
//     marginTop: -hp(5),
//     marginBottom: hp(2),
//   },
//   badge: {
//     width: moderateScale(60),
//     height: moderateScale(60),
//     borderRadius: moderateScale(30),
//     backgroundColor: COLORS.cta,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: COLORS.ctaGlow,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.45,
//     shadowRadius: 14,
//     elevation: 8,
//   },
//   cardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(22),
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: hp(0.8),
//   },
//   cardSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: COLORS.textMuted,
//     textAlign: 'center',
//     lineHeight: fontSize(17),
//     marginBottom: hp(2.5),
//     paddingHorizontal: wp(2),
//   },
//   otpRow: {
//     marginBottom: hp(2),
//   },
//   otpBoxes: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   otpBox: {
//     width: wp(11.5),
//     height: hp(6),
//     borderRadius: moderateScale(12),
//     borderWidth: 1.5,
//     borderColor: 'rgba(14, 59, 46, 0.2)',
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: COLORS.textPrimary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   otpBoxActive: {
//     borderColor: COLORS.cta,
//     borderWidth: 2,
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.cta,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.45,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   otpBoxFilled: {
//     borderColor: COLORS.cta,
//   },
//   otpCursor: {
//     width: 2,
//     height: hp(2.8),
//     backgroundColor: COLORS.textPrimary,
//     borderRadius: 1,
//   },
//   otpText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(22),
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//   },
//   hiddenInput: {
//     position: 'absolute',
//     opacity: 0,
//     width: 1,
//     height: 1,
//   },
//   timerRow: {
//     alignItems: 'center',
//     marginBottom: hp(2.2),
//   },
//   timerLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: COLORS.textPrimary,
//     marginBottom: hp(0.8),
//   },
//   timerValue: {
//     fontFamily: FONTS.bold,
//     color: COLORS.cta,
//   },
//   resendContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   resendLabel: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(13),
//     color: COLORS.textMuted,
//   },
//   resendLink: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: COLORS.textPrimary,
//   },
//   resendLinkDisabled: {
//     color: 'rgba(14, 59, 46, 0.35)',
//   },
//   securityBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(188, 255, 0, 0.12)',
//     borderRadius: moderateScale(16),
//     borderWidth: 1,
//     borderColor: 'rgba(14, 59, 46, 0.1)',
//     paddingVertical: hp(1.2),
//     paddingHorizontal: wp(3.5),
//     marginBottom: hp(2.5),
//   },
//   securityBadge: {
//     width: moderateScale(32),
//     height: moderateScale(32),
//     borderRadius: moderateScale(16),
//     backgroundColor: COLORS.cta,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: wp(3),
//   },
//   securityTextContainer: {
//     flex: 1,
//   },
//   securityTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: COLORS.textPrimary,
//   },
//   securitySubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(10.5),
//     color: COLORS.textMuted,
//     marginTop: hp(0.2),
//   },
//   verifyBtn: {
//     marginTop: hp(0.5),
//   },
// });

// export default EmailVerificationScreen;




import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  AppState,
  Keyboard,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

const verificationBg = require('../../assets/Images/Email Verification.png');

import AuthButton from '../../components/common/AuthButton';
import BackButton from '../../components/common/BackButton';
import AuthIcon from '../../components/common/AuthIcon';
import DotPattern from '../../components/common/DotPattern';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

import { useDispatch } from 'react-redux';
import { setLoginData } from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { sendVerificationOtpApi, verifyEmailApi } from '../../services/authService';
import { getStorageData, setStorageData } from '../../storage/storage';


const EmailVerificationScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const email = route?.params?.email || 'your email';
  // const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Blinking cursor animation loop
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Track keyboard state so page content remains 100% fixed when closed, and scrollable only when keyboard opens
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );

    const handleHide = () => {
      setKeyboardVisible(false);
      // Force blur ONLY on Android to fix focus lock. iOS auto-manages blur and suggestion bar heights.
      if (Platform.OS === 'android') {
        inputRef.current?.blur();
      }
    };

    const hideWillSub = Keyboard.addListener('keyboardWillHide', handleHide);
    const hideDidSub = Keyboard.addListener('keyboardDidHide', handleHide);

    return () => {
      showSub.remove();
      hideWillSub.remove();
      hideDidSub.remove();
    };
  }, []);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const TIMER_DURATION = 600; // 10 minutes (600 seconds)
  const timerEndTimeRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [initialSendingOtp, setInitialSendingOtp] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      if (!timerEndTimeRef.current) return;
      const remaining = Math.round((timerEndTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimer(0);
      } else {
        setTimer(remaining);
      }
    };

    // Calculate initial remaining time immediately
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    // Sync timer when app comes back to the foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateTimer();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const logToken = async () => {
      const storedToken = await getStorageData('token');
      console.log('--- EMAIL VERIFICATION MOUNT: stored token =', storedToken);
    };
    logToken();

    // Auto-trigger OTP sending on screen mount
    if (email) {
      const autoSendOtp = async () => {
        try {
          setInitialSendingOtp(true);
          await sendVerificationOtpApi({ email });

          // Start 10-minute countdown timer ONLY AFTER API succeeds!
          timerEndTimeRef.current = Date.now() + TIMER_DURATION * 1000;
          setTimer(TIMER_DURATION);

          Toast.show({
            type: 'success',
            text1: 'OTP Sent',
            text2: 'A verification code has been sent to your email.',
          });

          // Focus the input to open the keyboard automatically
          setTimeout(() => {
            inputRef.current?.focus();
          }, 350);
        } catch (error) {
          console.log('Auto-OTP Mount Error:', error);
          const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to send verification OTP.';
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMsg,
          });
        } finally {
          setInitialSendingOtp(false);
        }
      };
      autoSendOtp();
    }
  }, [email]);

  const formatTimer = (time) => {
    if (time === null || time === undefined) return '--:--';
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await sendVerificationOtpApi({ email });
      timerEndTimeRef.current = Date.now() + 600 * 1000;
      setTimer(600);
      setOtp('');
      inputRef.current?.focus();
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new 6-digit verification code has been sent to your email.',
      });
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to resend OTP.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeText = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');

    // Support copy-paste of a full 6-digit code
    if (cleanedText.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        if (i >= index && i - index < cleanedText.length) {
          newOtp[i] = cleanedText[i - index];
        }
      }
      setOtp(newOtp);
      const nextFocusIndex = Math.min(index + cleanedText.length - 1, 5);
      inputRefs[nextFocusIndex].current.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanedText.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanedText && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async () => {
    // const enteredOtp = otp.join('');
    const enteredOtp = otp;
    if (enteredOtp.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter the complete 6-digit verification code.',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await verifyEmailApi({
        email: email,
        otp: enteredOtp,
      });

      const userObj = response?.data?.user || response?.user || response?.data || response;
      const token = response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token || null;
      const refreshToken = response?.data?.refreshToken || response?.refreshToken || null;

      if (token) {
        await setStorageData('token', token);
      }
      if (refreshToken) {
        await setStorageData('refreshToken', refreshToken);
      }

      await setStorageData('USER_DATA', response?.data || response);

      if (userObj) {
        dispatch(
          setLoginData({
            user: userObj,
            token: token,
          })
        );
      }

      Toast.show({
        type: 'success',
        text1: 'Email Verified',
        text2: response?.message || 'Email verified successfully!',
      });

      // Navigate to SuccessScreen
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SuccessScreen' }],
        });
      }, 1500);
    } catch (error) {
      const errorData = error?.response?.data;
      const errorMsg = errorData?.error || errorData?.message || error?.message || 'Invalid or expired OTP. Please try again.';

      const isRateLimit = errorMsg.toLowerCase().includes('too many verification code requests') || errorMsg.toLowerCase().includes('verification code requests');
      // Case A: If backend invalidates OTP after max wrong attempts or expiration, reset timer so user can resend
      if (
        !isRateLimit &&
        (errorMsg.toLowerCase().includes('too many invalid attempts') ||
         errorMsg.toLowerCase().includes('invalid attempts') ||
         errorMsg.toLowerCase().includes('no active verification') ||
         errorMsg.toLowerCase().includes('request a new') ||
         errorMsg.toLowerCase().includes('expired') ||
         errorMsg.toLowerCase().includes('invalidated'))
      ) {
        setTimer(0);
        timerEndTimeRef.current = Date.now();
      }

      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMsg,
      });
      // Clear invalid OTP and re-focus input so user can enter a new code
      setOtp('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } finally {
      setLoading(false);
    }
  };

  const CardGradient = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0B3C25" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#588F27" stopOpacity="0.85" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>
    </View>
  );

  const cardWidth = SCREEN_WIDTH - wp(10);

  return (
    <SafeAreaView
      style={styles.container}
      edges={[]}
      onLayout={(e) => {
        if (Platform.OS !== 'android') return;
        const { height } = e.nativeEvent.layout;
        const screenHeight = Dimensions.get('screen').height;
        if (keyboardVisible && height > screenHeight * 0.75) {
          setKeyboardVisible(false);
          inputRef.current?.blur();
        }
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ImageBackground source={verificationBg} style={styles.backgroundImage} resizeMode="cover">
        {/* Add dot pattern as background overlay */}
        <DotPattern width={SCREEN_WIDTH} style={styles.bgDotPattern} />
        {/* Reusable Back Button */}
        <BackButton iconColor="#093A24" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            <View style={styles.cardWrapper}>

              {/* Floating Badge on top of Card */}
              <View style={styles.badgeContainer}>
                <Svg
                  width={moderateScale(56)}
                  height={moderateScale(56)}
                  viewBox="0 0 100 100"
                >
                  <Defs>
                    <LinearGradient id="mailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                      <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#BCFF00" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  {/* Main envelope body with gradient fill and white stroke */}
                  <Rect
                    x="10"
                    y="22"
                    width="80"
                    height="56"
                    rx="10"
                    fill="url(#mailGrad)"
                    stroke="#FFFFFF"
                    strokeWidth="5.5"
                  />
                  {/* Envelope flap line */}
                  <Path
                    d="M10,26 L50,56 L90,26"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.card}>
                {/* Header with Title overlaying the background card image */}
                <View style={styles.gradientHeader}>
                  <Text style={styles.cardTitle}>Verify Your Email</Text>
                </View>

                {/* Card Form Contents */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardSubtitle}>
                    We have sent a 6 digit verification code to your Email ID. Enter the code below to verify your email & continue
                  </Text>

                  {initialSendingOtp && (
                    <View style={styles.sendingOtpLoaderWrap}>
                      <ActivityIndicator size="small" color="#2EA200" />
                      <Text style={styles.sendingOtpText}>Sending verification code...</Text>
                    </View>
                  )}
                  {/* 6 Digit Verification Input boxes */}
                  <View style={[styles.otpRow, { position: 'relative' }]}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => inputRef.current?.focus()}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const isActive = index === otp.length && focusedIndex !== -1;
                        const isFilled = otp.length > index;
                        return (
                          <View
                            key={index}
                            style={[
                              styles.otpBox,
                              isFilled && styles.otpBoxFilled,
                              isActive && styles.otpBoxActive,
                            ]}
                          >
                            {isFilled ? (
                              <Text style={styles.otpText}>{otp[index]}</Text>
                            ) : isActive ? (
                              /* Blinking cursor shown in active empty box */
                              <Animated.View
                                style={[styles.otpCursor, { opacity: blinkAnim }]}
                              />
                            ) : null}
                          </View>
                        );
                      })}
                    </TouchableOpacity>

                    <TextInput
                      ref={inputRef}
                      value={otp}
                      onChangeText={(text) =>
                        setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))
                      }
                      onFocus={() => setFocusedIndex(0)}
                      onBlur={() => setFocusedIndex(-1)}
                      keyboardType="number-pad"
                      maxLength={6}
                      caretHidden
                      textContentType="oneTimeCode"
                      autoComplete={Platform.OS === 'ios' ? 'one-time-code' : 'sms-otp'}
                      style={{
                        position: 'absolute',
                        width: 1,
                        height: 1,
                        opacity: 0,
                      }}
                    />
                  </View>
                  {/* Countdown Timer */}
                  <View style={styles.timerRow}>
                    {timer !== null && (
                      <Text style={styles.timerLabel}>
                        Code Expires in{' '}
                        <Text style={styles.timerValue}>{formatTimer(timer)}</Text>
                      </Text>
                    )}

                    <View style={styles.resendContainer}>
                      <Text style={styles.resendLabel}>Didn't receive the code? </Text>
                      <TouchableOpacity
                        onPress={handleResend}
                        disabled={(timer !== null && timer > 0) || resendLoading || initialSendingOtp}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.resendLink,
                            ((timer !== null && timer > 0) || resendLoading || initialSendingOtp) && styles.resendLinkDisabled,
                          ]}
                        >
                          {resendLoading ? 'Resending...' : 'Resend OTP'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Security Banner */}
                  <View style={styles.securityBanner}>
                    <View style={styles.securityBadge}>
                      <AuthIcon name="check" size={moderateScale(18)} color="#093A24" />
                    </View>
                    <View style={styles.securityTextContainer}>
                      <Text style={styles.securityTitle}>Secure and Private</Text>
                      <Text style={styles.securitySubtitle}>
                        Your information is encrypted and kept secure with us.
                      </Text>
                    </View>
                  </View>

                  {/* Verify Button */}
                  <AuthButton
                    title="VERIFY EMAIL"
                    onPress={handleVerify}
                    loading={loading}
                    style={styles.verifyBtn}
                  />
                </View>
              </View>
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
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2EA200', // Figma green background
  },
  bgDotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(3),
  },
  cardWrapper: {
    position: 'relative',
    marginTop: hp(6),
    width: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: -moderateScale(28), // Shifted lower to align exactly on the border line
    alignSelf: 'center',
    zIndex: 10,
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
    backgroundColor: '#0E3B2E66', // Translucent dark green matching Figma circle color
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)', // 50% white border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0E3B2E', // Figma shadow color
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    width: '100%',
    overflow: 'visible',
  },
  gradientHeader: {
    paddingHorizontal: wp(6),
    paddingTop: hp(11.5), // Lowered slightly more to sit comfortably below the badge
    paddingBottom: hp(3.5),
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(30),
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  cardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(15),
    color: '#1E5A42',
    textAlign: 'center',
    lineHeight: fontSize(18),
    paddingHorizontal: wp(2),
  },

  cardContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2.2), // Reduced spacing to save vertical space
    paddingBottom: hp(2),
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2), // Reduced spacing to save vertical space
    marginBottom: hp(2),
  },
  otpBox: {
    width: wp(12.5),
    height: hp(6.2),
    borderRadius: moderateScale(12),
    borderWidth: 2.5,
    borderColor: 'rgba(201, 248, 74, 0.4)', // lime green border outline
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // glassy input
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: '#093A24', // Deep green text matching mockup
    textAlign: 'center',
    // Shadow
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFocused: {
    borderColor: '#BCFF00', // vibrant neon focused border
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  otpBoxActive: {
    borderColor: '#BCFF00', // Neon lime border on the active (next to type) box
    borderWidth: 2.5,
    backgroundColor: COLORS.white,
    // Subtle glow to indicate active position
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: '#BCFF00',
  },
  otpCursor: {
    width: 2,
    height: hp(2.8),
    backgroundColor: '#093A24', // Deep green cursor line matching design
    borderRadius: 1,
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: hp(2.2), // Reduced vertical spacing
  },
  timerLabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#093A24',
    marginBottom: hp(0.8),
  },
  timerValue: {
    fontFamily: FONTS.bold,
    color: '#2EA200',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#4A5568',
  },
  resendLink: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#2EA200',
  },
  resendLinkDisabled: {
    color: '#A0AEC0',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Glassy white backing
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: 'rgba(9, 58, 36, 0.12)', // Subtle dark green border
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(2.2), // Reduced vertical spacing
  },
  securityBadge: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#BCFF00', // Vibrant neon green circle
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    shadowColor: '#BCFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#093A24', // Deep green title
  },
  securitySubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(10.5),
    color: '#4A5568',
    marginTop: hp(0.2),
  },
  verifyBtn: {
    marginTop: hp(0.5),
  },
  otpText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: '#093A24',
    textAlign: 'center',
  },
  sendingOtpLoaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1.2),
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: moderateScale(20),
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3.5),
    alignSelf: 'center',
    gap: wp(2),
  },
  sendingOtpText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#093A24',
  },
});

export default EmailVerificationScreen;
