// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import AuthIcon from '../../components/common/AuthIcon';
// import AuthInput from '../../components/common/AuthInput';
// import WaveDivider from '../../components/common/WaveDivider';
// import DotPattern from '../../components/common/DotPattern';
// import { CircularBackButton, PrimaryPillButton } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import Toast from 'react-native-toast-message';
// import { useDispatch } from 'react-redux';
// import { loginApi } from '../../services/authService';
// import { setLoginData } from '../../redux/slices/authSlice';
// import { setStorageData, getStorageData, removeStorageData } from '../../storage/storage';

// const authBg = require('../../assets/Images/login.png');

// const LoginScreen = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     const loadRememberedEmail = async () => {
//       const savedEmail = await getStorageData('REMEMBERED_EMAIL');
//       if (savedEmail) {
//         setEmail(savedEmail);
//         setRememberMe(true);
//       }
//     };
//     loadRememberedEmail();
//     setStorageData('HAS_ONBOARDED', true);
//   }, []);

//   useEffect(() => {
//     const unsubscribeFocus = navigation.addListener('focus', async () => {
//       setErrors({});
//       const savedEmail = await getStorageData('REMEMBERED_EMAIL');
//       if (savedEmail) {
//         setEmail(savedEmail);
//         setRememberMe(true);
//       } else {
//         setEmail('');
//         setRememberMe(false);
//       }
//       setPassword('');
//     });
//     const unsubscribeBlur = navigation.addListener('blur', () => {
//       setErrors({});
//       setPassword('');
//       if (!rememberMe) {
//         setEmail('');
//       }
//     });
//     return () => {
//       unsubscribeFocus();
//       unsubscribeBlur();
//     };
//   }, [navigation, rememberMe]);

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

//     if (!password) {
//       newErrors.password = 'Password is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await loginApi({
//         email: email.trim(),
//         password: password,
//       });

//       const isEmailVerified =
//         response?.user?.emailVerified ??
//         response?.data?.user?.emailVerified ??
//         response?.emailVerified;

//       const token = response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token;
//       if (token) {
//         await setStorageData('token', token);
//       }
//       const refreshToken = response?.data?.refreshToken || response?.refreshToken;
//       if (refreshToken) {
//         await setStorageData('refreshToken', refreshToken);
//       }

//       if (isEmailVerified === false) {
//         Toast.show({
//           type: 'info',
//           text1: 'Verification Required',
//           text2: 'Please verify your email address to continue.',
//         });
//         setTimeout(() => {
//           navigation.navigate('EmailVerification', { email: email.trim(), sendOTP: true });
//         }, 1500);
//         return;
//       }

//       await setStorageData('USER_DATA', response?.data || response);

//       if (rememberMe) {
//         await setStorageData('REMEMBERED_EMAIL', email.trim());
//       } else {
//         await removeStorageData('REMEMBERED_EMAIL');
//       }
//       await removeStorageData('REMEMBERED_PASSWORD');

//       dispatch(
//         setLoginData({
//           user: response?.data?.user || response?.user || response?.data || response,
//           token: response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token || null,
//         })
//       );

//       Toast.show({
//         type: 'success',
//         text1: 'Login Successful',
//         text2: response?.message || 'Welcome back to UGolf!',
//       });

//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'MainApp' }],
//         });
//       }, 1500);
//     } catch (error) {
//       const errorData = error?.response?.data;
//       const errorMsg = errorData?.error || errorData?.message || error?.message || 'Invalid credentials. Please try again.';

//       if (
//         errorMsg.toLowerCase().includes('verify') ||
//         errorMsg.toLowerCase().includes('verification')
//       ) {
//         Toast.show({
//           type: 'info',
//           text1: 'Verification Required',
//           text2: 'Please verify your email to continue.',
//         });
//         setTimeout(() => {
//           navigation.navigate('EmailVerification', { email: email.trim() });
//         }, 1500);
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Login Failed',
//           text2: errorMsg,
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={[]}>
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
//           bounces={false}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Top Half Background with Golf Course & Header */}
//           <ImageBackground source={authBg} style={styles.headerBackground}>
//             <View style={styles.headerOverlay} />

//             {/* Back Button */}
//             <View style={styles.backButtonWrapper}>
//               <CircularBackButton onPress={() => navigation.goBack()} />
//             </View>

//             <View style={styles.headerContent}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.welcomeText}>WELCOME </Text>
//                 <Text style={styles.backText}>BACK !</Text>
//               </View>
//               <Text style={styles.subtitleText}>
//                 Login to continue your Golf Journey !
//               </Text>
//             </View>
//           </ImageBackground>

//           {/* Wave Divider dividing top image and white bottom area */}
//           <WaveDivider />

//           {/* Form Content Area (White background) */}
//           <View style={styles.formContainer}>
//             <DotPattern />

//             <AuthInput
//               iconName="mail"
//               placeholder="Email address"
//               value={email}
//               onChangeText={(text) => handleInputChange('email', text, setEmail)}
//               keyboardType="email-address"
//               style={errors.email ? styles.inputError : {}}
//             />
//             {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

//             <AuthInput
//               iconName="lock"
//               placeholder="Password"
//               value={password}
//               onChangeText={(text) => handleInputChange('password', text, setPassword)}
//               isPassword={true}
//               style={errors.password ? styles.inputError : {}}
//             />
//             {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

//             {/* Remember Me & Forgot Password */}
//             <View style={styles.optionsRow}>
//               <TouchableOpacity
//                 style={styles.checkboxContainer}
//                 onPress={() => setRememberMe(!rememberMe)}
//                 activeOpacity={0.7}
//               >
//                 <View
//                   style={[
//                     styles.checkbox,
//                     rememberMe && styles.checkboxActive,
//                   ]}
//                 >
//                   {rememberMe && (
//                     <AuthIcon
//                       name="check"
//                       size={moderateScale(12)}
//                       color={COLORS.white}
//                     />
//                   )}
//                 </View>
//                 <Text style={styles.rememberText}>Remember Me</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => navigation.navigate('ForgotPassword')}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.forgotText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <PrimaryPillButton
//               title="LOGIN"
//               onPress={handleLogin}
//               loading={loading}
//             />

//             {/* Bottom Register Link */}
//             <View style={styles.registerRow}>
//               <Text style={styles.newText}>New to UGolf?</Text>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate('SignUp')}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.registerText}>Create Account</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     backgroundColor: COLORS.white,
//   },
//   headerBackground: {
//     width: '100%',
//     height: hp(43),
//     justifyContent: 'flex-start',
//   },
//   headerOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.35)',
//   },
//   backButtonWrapper: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? hp(6) : hp(4),
//     left: wp(6),
//     zIndex: 10,
//   },
//   headerContent: {
//     paddingHorizontal: wp(7),
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     paddingTop: Platform.OS === 'ios' ? hp(12) : hp(10),
//     zIndex: 2,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: hp(0.8),
//   },
//   welcomeText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: '#8CDB00',
//   },
//   backText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(28),
//     color: COLORS.white,
//   },
//   subtitleText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: COLORS.white,
//     textAlign: 'center',
//   },
//   formContainer: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     paddingHorizontal: wp(7),
//     paddingTop: hp(2),
//     paddingBottom: hp(4),
//     position: 'relative',
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: hp(0.5),
//     marginBottom: hp(3),
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   checkbox: {
//     width: moderateScale(16),
//     height: moderateScale(16),
//     borderRadius: moderateScale(4),
//     borderWidth: 1.5,
//     borderColor: '#A0AEC0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: wp(2),
//     backgroundColor: COLORS.white,
//   },
//   checkboxActive: {
//     backgroundColor: '#4CAF50',
//     borderColor: '#4CAF50',
//   },
//   rememberText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(12),
//     color: '#4A5568',
//   },
//   forgotText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(12),
//     color: '#1B4D22',
//   },
//   registerRow: {
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: hp(3.5),
//   },
//   newText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: '#718096',
//     marginBottom: hp(0.5),
//   },
//   registerText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: '#1B4D22',
//     textDecorationLine: 'underline',
//   },
//   inputError: {
//     borderColor: '#E53E3E',
//   },
//   errorText: {
//     color: '#E53E3E',
//     fontSize: fontSize(11),
//     fontFamily: FONTS.medium,
//     marginTop: -hp(1.2),
//     marginBottom: hp(1.2),
//     paddingLeft: wp(1),
//   },
// });

// export default LoginScreen;



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthIcon from '../../components/common/AuthIcon';

import AuthInput from '../../components/common/AuthInput';
import AuthButton from '../../components/common/AuthButton';
import BackButton from '../../components/common/BackButton';
import WaveDivider from '../../components/common/WaveDivider';
import DotPattern from '../../components/common/DotPattern';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const authBg = require('../../assets/Images/Splash Bg (2).png');

import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { loginApi } from '../../services/authService';
import { setLoginData } from '../../redux/slices/authSlice';
import { setStorageData, getStorageData, removeStorageData } from '../../storage/storage';
import { useEffect } from 'react';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await getStorageData('REMEMBERED_EMAIL');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };
    loadRememberedEmail();
    setStorageData('HAS_ONBOARDED', true);
  }, []);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', async () => {
      setErrors({});
      // Reload remembered credentials
      const savedEmail = await getStorageData('REMEMBERED_EMAIL');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      } else {
        setEmail('');
        setRememberMe(false);
      }
      setPassword('');
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setErrors({});
      // Clear password on blur for security
      setPassword('');
      // If rememberMe is false, clear email too
      if (!rememberMe) {
        setEmail('');
      }
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, rememberMe]);

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi({
        email: email.trim(),
        password: password,
      });

      // const isEmailVerified = response?.user?.emailVerified || response?.data?.user?.emailVerified || response?.emailVerified;
      const isEmailVerified =
        response?.user?.emailVerified ??
        response?.data?.user?.emailVerified ??
        response?.emailVerified;

      console.log('Login Response:', response);
      console.log('Email Verified:', isEmailVerified);

      // Save token immediately for Axios Interceptor in verification screen
      const token = response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token;
      if (token) {
        await setStorageData('token', token);
      }

      // Save refresh token
      const refreshToken =
        response?.data?.refreshToken ||
        response?.refreshToken;

      if (refreshToken) {
        await setStorageData('refreshToken', refreshToken);
      }

      if (isEmailVerified === false) {
        navigation.navigate('EmailVerification', { email: email.trim(), sendOTP: true });
        return;
      }

      // Save user details to AsyncStorage
      await setStorageData('USER_DATA', response?.data || response);

      // Handle Remember Me
      if (rememberMe) {
        await setStorageData('REMEMBERED_EMAIL', email.trim());
      } else {
        await removeStorageData('REMEMBERED_EMAIL');
      }
      // Clear any previously saved password for security
      await removeStorageData('REMEMBERED_PASSWORD');

      // Dispatch to Redux
      dispatch(
        setLoginData({
          user: response?.data?.user || response?.user || response?.data || response,
          token: response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token || null,
        })
      );

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: response?.message || 'Welcome back to UGolf!',
      });

      // Login always goes directly to MainApp.
      // Subscription screen is only shown after new registration (not on login).
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1500);
    } catch (error) {
      const errorData = error?.response?.data;
      const errorMsg = errorData?.error || errorData?.message || error?.message || 'Invalid credentials. Please try again.';

      if (
        errorMsg.toLowerCase().includes('verify') ||
        errorMsg.toLowerCase().includes('verification')
      ) {
        navigation.navigate('EmailVerification', { email: email.trim(), sendOTP: true });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Reusable Back Button to navigate to Onboarding */}
      {/* <BackButton iconColor={COLORS.white} style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }} /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Half Background with Golf Course & Header */}
          <ImageBackground source={authBg} style={styles.headerBackground}>
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Text style={styles.welcomeText}>WELCOME </Text>
                <Text style={styles.backText}>BACK !</Text>
              </View>
              <Text style={styles.subtitleText}>
                Login to continue your Golf Journey !
              </Text>
            </View>
          </ImageBackground>

          {/* Wave Divider dividing top image and white bottom area */}
          <WaveDivider />

          {/* Form Content Area (White background) */}
          <View style={styles.formContainer}>
            {/* Halftone dot matrix background */}
            <DotPattern />

            {/* Inputs */}
            <AuthInput
              iconName="mail"
              placeholder="Email address"
              value={email}
              onChangeText={(text) => handleInputChange('email', text, setEmail)}
              keyboardType="email-address"
              style={errors.email ? styles.inputError : {}}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <AuthInput
              iconName="lock"
              placeholder="Password"
              value={password}
              onChangeText={(text) => handleInputChange('password', text, setPassword)}
              isPassword={true}
              style={errors.password ? styles.inputError : {}}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <AuthIcon
                      name="check"
                      size={moderateScale(12)}
                      color={COLORS.white}
                    />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <AuthButton
              title="LOGIN"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* Bottom Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.newText}>New to UGolf?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },
  headerBackground: {
    width: '100%',
    height: hp(43), // Slightly taller to display the golf ball & flag fully
    justifyContent: 'flex-start',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Less opacity so bg image shows a little bit more
  },
  headerContent: {
    paddingHorizontal: wp(7),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(13), // Pushes text down from status bar to sit in the middle of the sky area
    paddingBottom: 0,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  welcomeText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.primary, // Swapped to primary (green)
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.textWhite, // Swapped to white
  },
  subtitleText: {
    fontFamily: FONTS.bold, // Bold white color
    fontSize: fontSize(13),
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(7),
    paddingTop: hp(1),
    paddingBottom: hp(4),
    position: 'relative',
  },
  dotPatternContainer: {
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  dotPattern: {
    flexDirection: 'row',
    gap: wp(2.5),
  },
  decorativeDot: {
    width: moderateScale(4),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: '#4CAF50', // dark green dots divider
    opacity: 0.15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(0.5),
    marginBottom: hp(3.5),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(4),
    borderWidth: 1.5,
    borderColor: '#A0AEC0', // clean grey border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2),
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: '#4CAF50', // solid green active state
    borderColor: '#4CAF50',
  },
  rememberText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(12),
    color: '#4A5568', // dark gray
  },
  forgotText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#1B4D22', // dark forest green matching figma exact color tone
  },
  loginBtn: {
    // Custom button style overrides if any
  },
  registerRow: {
    flexDirection: 'column', // Align vertically like Figma
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(3.5),
  },
  newText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096', // mid gray
    marginBottom: hp(0.5),
  },
  registerText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#1B4D22', // dark forest green matching figma exactly
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: fontSize(11),
    fontFamily: FONTS.medium,
    marginTop: -hp(1.2),
    marginBottom: hp(1.2),
    paddingLeft: wp(1),
  },
});

export default LoginScreen;


