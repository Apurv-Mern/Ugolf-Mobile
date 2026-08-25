// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   Image,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { Country, State, City } from 'country-state-city';

// import AuthInput from '../../components/common/AuthInput';
// import AuthDropdownPicker from '../../components/common/AuthDropdownPicker';
// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenHeader,
//   CircularBackButton,
//   PrimaryPillButton,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// import Toast from 'react-native-toast-message';
// import { registerApi } from '../../services/authService';
// import { useDispatch } from 'react-redux';
// import { setLoginData } from '../../redux/slices/authSlice';
// import { setStorageData } from '../../storage/storage';

// const authBg = require('../../assets/Images/auth_bg.png');

// const SignUpScreen = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   // Country, State, City dropdown selection state
//   const [country, setCountry] = useState('');
//   const [countryCode, setCountryCode] = useState('');
//   const [state, setState] = useState('');
//   const [stateCode, setStateCode] = useState('');
//   const [city, setCity] = useState('');

//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     const unsubscribeFocus = navigation.addListener('focus', () => {
//       setErrors({});
//       setFirstName('');
//       setLastName('');
//       setDisplayName('');
//       setEmail('');
//       setPassword('');
//       setConfirmPassword('');
//       setCountry('');
//       setCountryCode('');
//       setState('');
//       setStateCode('');
//       setCity('');
//       setAgreeTerms(false);
//     });
//     const unsubscribeBlur = navigation.addListener('blur', () => {
//       setErrors({});
//       setFirstName('');
//       setLastName('');
//       setDisplayName('');
//       setEmail('');
//       setPassword('');
//       setConfirmPassword('');
//       setCountry('');
//       setCountryCode('');
//       setState('');
//       setStateCode('');
//       setCity('');
//       setAgreeTerms(false);
//     });
//     return () => {
//       unsubscribeFocus();
//       unsubscribeBlur();
//     };
//   }, [navigation]);

//   useEffect(() => {
//     setStorageData('HAS_ONBOARDED', true);
//   }, []);

//   // Country options list from country-state-city
//   const countryOptions = useMemo(() => {
//     return Country.getAllCountries().map(c => ({
//       label: `${c.flag}  ${c.name}`,
//       name: c.name,
//       value: c.isoCode,
//     }));
//   }, []);

//   // State options list for selected country
//   const stateOptions = useMemo(() => {
//     if (!countryCode) return [];
//     return State.getStatesOfCountry(countryCode).map(s => ({
//       label: s.name,
//       name: s.name,
//       value: s.isoCode,
//     }));
//   }, [countryCode]);

//   // City options list for selected state & country
//   const cityOptions = useMemo(() => {
//     if (!countryCode || !stateCode) return [];
//     return City.getCitiesOfState(countryCode, stateCode).map(ci => ({
//       label: ci.name,
//       name: ci.name,
//       value: ci.name,
//     }));
//   }, [countryCode, stateCode]);

//   const handleSelectCountry = (item) => {
//     setCountry(item.name);
//     setCountryCode(item.value);
//     setState('');
//     setStateCode('');
//     setCity('');
//     if (errors.country) {
//       setErrors(prev => ({ ...prev, country: null, state: null, city: null }));
//     }
//   };

//   const handleSelectState = (item) => {
//     setState(item.name);
//     setStateCode(item.value);
//     setCity('');
//     if (errors.state) {
//       setErrors(prev => ({ ...prev, state: null, city: null }));
//     }
//   };

//   const handleSelectCity = (item) => {
//     setCity(item.name || item.label);
//     if (errors.city) {
//       setErrors(prev => ({ ...prev, city: null }));
//     }
//   };

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

//     // First name validation
//     if (!firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }

//     // Last name validation
//     if (!lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }

//     // Display name validation
//     if (!displayName.trim()) {
//       newErrors.displayName = 'Display name is required';
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email) {
//       newErrors.email = 'Email address is required';
//     } else if (!emailRegex.test(email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     // Password validation
//     if (!password) {
//       newErrors.password = 'Password is required';
//     } else if (password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     } else {
//       const hasUppercase = /[A-Z]/.test(password);
//       const hasLowercase = /[a-z]/.test(password);
//       const hasNumber = /[0-9]/.test(password);
//       const hasSpecial = /[^A-Za-z0-9]/.test(password);
//       if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
//         newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
//       }
//     }

//     // Confirm password validation
//     if (!confirmPassword) {
//       newErrors.confirmPassword = 'Confirm password is required';
//     } else if (password !== confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     // Country validation
//     if (!country.trim()) {
//       newErrors.country = 'Country is required';
//     }

//     // State validation
//     if (!state.trim()) {
//       newErrors.state = 'State is required';
//     }

//     // City validation
//     if (!city.trim()) {
//       newErrors.city = 'City is required';
//     }

//     // Terms agreement validation
//     if (!agreeTerms) {
//       newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSignUp = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await registerApi({
//         firstName: firstName.trim(),
//         lastName: lastName.trim(),
//         displayName: displayName.trim(),
//         email: email.trim(),
//         password: password,
//         country: country.trim(),
//         state: state.trim(),
//         city: city.trim(),
//       });

//       const isEmailVerified =
//         response?.user?.emailVerified ??
//         response?.data?.user?.emailVerified ??
//         response?.emailVerified;

//       Toast.show({
//         type: 'success',
//         text1: 'Registration Successful',
//         text2: response?.message || 'Welcome to UGolf!',
//       });

//       if (response?.accessToken) {
//         await setStorageData('token', response.accessToken);
//       }

//       if (response?.refreshToken) {
//         await setStorageData('refreshToken', response.refreshToken);
//       }

//       if (isEmailVerified === true) {
//         await setStorageData('USER_DATA', response?.data || response);

//         dispatch(
//           setLoginData({
//             user: response?.data?.user || response?.user || response,
//             token:
//               response?.data?.accessToken ||
//               response?.accessToken ||
//               response?.data?.token ||
//               response?.token ||
//               null,
//           }),
//         );

//         setTimeout(() => {
//           navigation.reset({
//             index: 0,
//             routes: [{ name: 'MainApp' }],
//           });
//         }, 1500);
//       } else {
//         setTimeout(() => {
//           navigation.replace('EmailVerification', {
//             email: email.trim(),
//           });
//         }, 1500);
//       }
//     } catch (error) {
//       const errorData = error?.response?.data;
//       const errorMsg = errorData?.error || errorData?.message || error?.message || 'Something went wrong. Please try again.';

//       if (
//         errorMsg.toLowerCase().includes('already exists') ||
//         errorMsg.toLowerCase().includes('registered')
//       ) {
//         setErrors(prev => ({
//           ...prev,
//           email: 'An account with this email already exists',
//         }));
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Registration Failed',
//           text2: errorMsg,
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoToLogin = () => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     } else {
//       navigation.navigate('Login');
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
//           {/* Top Hero Banner with Golf Background Image */}
//           <View style={styles.heroWrapper}>
//             <Image
//               source={authBg}
//               style={styles.heroImage}
//               resizeMode="cover"
//             />
//             <LinearGradient
//               colors={['rgba(14, 59, 46, 0.45)', 'rgba(14, 59, 46, 0.85)']}
//               style={styles.heroOverlay}
//             />

//             {/* Back Button */}
//             <View style={styles.backButtonWrapper}>
//               <CircularBackButton onPress={handleGoToLogin} />
//             </View>

//             {/* Header Text */}
//             <View style={styles.heroTextContainer}>
//               <Text style={styles.heroTitle}>
//                 CREATE <Text style={styles.titleAccent}>ACCOUNT !</Text>
//               </Text>
//               <Text style={styles.heroSubtitle}>
//                 Join the community and start making an impact.
//               </Text>
//             </View>

//             {/* Curved White Wave Cutout */}
//             <View style={styles.waveCutout} />
//           </View>

//           {/* Form Content */}
//           <View style={styles.formContainer}>
//             <AuthInput
//               iconName="user"
//               placeholder="First name"
//               value={firstName}
//               onChangeText={(text) => handleInputChange('firstName', text, setFirstName)}
//               autoCapitalize="words"
//               style={[styles.field, errors.firstName ? styles.inputError : {}]}
//             />
//             {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

//             <AuthInput
//               iconName="user"
//               placeholder="Last name"
//               value={lastName}
//               onChangeText={(text) => handleInputChange('lastName', text, setLastName)}
//               autoCapitalize="words"
//               style={[styles.field, errors.lastName ? styles.inputError : {}]}
//             />
//             {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

//             <AuthInput
//               iconName="user"
//               placeholder="Display name"
//               value={displayName}
//               onChangeText={(text) => handleInputChange('displayName', text, setDisplayName)}
//               autoCapitalize="none"
//               style={[styles.field, errors.displayName ? styles.inputError : {}]}
//             />
//             {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

//             <AuthInput
//               iconName="mail"
//               placeholder="Email address"
//               value={email}
//               onChangeText={(text) => handleInputChange('email', text, setEmail)}
//               keyboardType="email-address"
//               style={[styles.field, errors.email ? styles.inputError : {}]}
//             />
//             {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

//             <AuthInput
//               iconName="lock"
//               placeholder="Password"
//               value={password}
//               onChangeText={(text) => handleInputChange('password', text, setPassword)}
//               isPassword={true}
//               style={[styles.field, errors.password ? styles.inputError : {}]}
//             />
//             {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

//             <AuthInput
//               iconName="lock"
//               placeholder="Confirm password"
//               value={confirmPassword}
//               onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)}
//               isPassword={true}
//               style={[styles.field, errors.confirmPassword ? styles.inputError : {}]}
//             />
//             {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

//             {/* Country Dropdown */}
//             <AuthDropdownPicker
//               iconName="globe"
//               placeholder="Select Country"
//               value={country}
//               options={countryOptions}
//               onSelect={handleSelectCountry}
//               error={!!errors.country}
//               style={styles.field}
//             />
//             {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

//             {/* State Dropdown */}
//             <AuthDropdownPicker
//               iconName="map-pin"
//               placeholder="Select State"
//               value={state}
//               options={stateOptions}
//               onSelect={handleSelectState}
//               disabled={!countryCode}
//               error={!!errors.state}
//               style={styles.field}
//             />
//             {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

//             {/* City Dropdown */}
//             <AuthDropdownPicker
//               iconName="map-pin"
//               placeholder="Select City"
//               value={city}
//               options={cityOptions}
//               onSelect={handleSelectCity}
//               disabled={!countryCode || !stateCode}
//               error={!!errors.city}
//               style={styles.field}
//             />
//             {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

//             {/* Terms and conditions checkbox */}
//             <View style={styles.termsRow}>
//               <TouchableOpacity
//                 style={[
//                   styles.checkbox,
//                   agreeTerms && styles.checkboxActive,
//                   errors.agreeTerms && styles.checkboxError,
//                 ]}
//                 onPress={() => {
//                   const nextVal = !agreeTerms;
//                   setAgreeTerms(nextVal);
//                   if (errors.agreeTerms) {
//                     setErrors(prev => {
//                       const updated = { ...prev };
//                       delete updated.agreeTerms;
//                       return updated;
//                     });
//                   }
//                 }}
//                 activeOpacity={0.7}
//               >
//                 {agreeTerms && (
//                   <AuthIcon
//                     name="check"
//                     size={moderateScale(12)}
//                     color={COLORS.textPrimary}
//                   />
//                 )}
//               </TouchableOpacity>
//               <Text style={styles.termsText}>
//                 I agree to the{' '}
//                 <Text
//                   style={styles.termsHighlight}
//                   onPress={() => navigation.navigate('TermsOfService')}
//                 >
//                   Terms of Service
//                 </Text>{' '}
//                 and{' '}
//                 <Text
//                   style={styles.termsHighlight}
//                   onPress={() => navigation.navigate('PrivacyPolicy')}
//                 >
//                   Privacy Policy
//                 </Text>{' '}
//                 of UGolf.
//               </Text>
//             </View>
//             {errors.agreeTerms && (
//               <Text style={[styles.errorText, { marginTop: -hp(2), marginBottom: hp(2) }]}>
//                 {errors.agreeTerms}
//               </Text>
//             )}

//             {/* Create Account Button */}
//             <PrimaryPillButton
//               title="CREATE ACCOUNT"
//               onPress={handleSignUp}
//               loading={loading}
//             />

//             {/* Bottom Login Link */}
//             <View style={styles.loginRow}>
//               <Text style={styles.alreadyText}>Already a member?</Text>
//               <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7}>
//                 <Text style={styles.loginText}>Login</Text>
//               </TouchableOpacity>
//             </View>
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
//     height: hp(32),
//     width: '100%',
//     position: 'relative',
//     justifyContent: 'center',
//     paddingHorizontal: wp(6),
//     paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
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
//   heroTextContainer: {
//     zIndex: 5,
//     marginTop: hp(4),
//     marginBottom: hp(1),
//   },
//   heroTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(26),
//     color: '#FFFFFF',
//     letterSpacing: -0.5,
//     textShadowColor: 'rgba(0, 0, 0, 0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 4,
//   },
//   titleAccent: {
//     color: COLORS.cta,
//   },
//   heroSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: '#E2E8F0',
//     marginTop: hp(0.5),
//     textShadowColor: 'rgba(0, 0, 0, 0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   waveCutout: {
//     position: 'absolute',
//     bottom: -1,
//     left: 0,
//     right: 0,
//     height: hp(2.5),
//     backgroundColor: COLORS.bgPage,
//     borderTopLeftRadius: moderateScale(26),
//     borderTopRightRadius: moderateScale(26),
//   },
//   formContainer: {
//     flex: 1,
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(5),
//   },
//   field: {
//     borderRadius: moderateScale(16),
//     height: hp(6.6),
//     marginBottom: hp(2),
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.textPrimary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   termsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: hp(1),
//     marginBottom: hp(3),
//     paddingRight: wp(4),
//   },
//   checkbox: {
//     width: moderateScale(18),
//     height: moderateScale(18),
//     borderRadius: moderateScale(6),
//     borderWidth: 1.5,
//     borderColor: 'rgba(14, 59, 46, 0.3)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: wp(2.5),
//     backgroundColor: COLORS.white,
//   },
//   checkboxActive: {
//     backgroundColor: COLORS.cta,
//     borderColor: COLORS.cta,
//   },
//   termsText: {
//     flex: 1,
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(11),
//     color: COLORS.textMuted,
//     lineHeight: fontSize(16),
//   },
//   termsHighlight: {
//     color: COLORS.textPrimary,
//     fontFamily: FONTS.bold,
//     textDecorationLine: 'underline',
//   },
//   loginRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: hp(3.5),
//     gap: wp(1.5),
//   },
//   alreadyText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(13),
//     color: COLORS.textMuted,
//   },
//   loginText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(13),
//     color: COLORS.textPrimary,
//     textDecorationLine: 'underline',
//   },
//   inputError: {
//     borderColor: COLORS.error,
//   },
//   checkboxError: {
//     borderColor: COLORS.error,
//   },
//   errorText: {
//     color: COLORS.error,
//     fontSize: fontSize(11),
//     fontFamily: FONTS.medium,
//     marginTop: -hp(1.4),
//     marginBottom: hp(1.4),
//     paddingLeft: wp(1),
//   },
// });

// export default SignUpScreen;




import React, { useState, useEffect, useMemo } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Country, State, City } from 'country-state-city';

import AuthInput from '../../components/common/AuthInput';
import AuthButton from '../../components/common/AuthButton';
import AuthDropdownPicker from '../../components/common/AuthDropdownPicker';
import WaveDivider from '../../components/common/WaveDivider';
import DotPattern from '../../components/common/DotPattern';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const authBg = require('../../assets/Images/Splash Bg (2).png');

import Toast from 'react-native-toast-message';
import { registerApi } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setLoginData } from '../../redux/slices/authSlice';
import { setStorageData } from '../../storage/storage';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Country, State, City dropdown selection state
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [state, setState] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setErrors({});
      setFirstName('');
      setLastName('');
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCountry('');
      setCountryCode('');
      setState('');
      setStateCode('');
      setCity('');
      setAgreeTerms(false);
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setErrors({});
      setFirstName('');
      setLastName('');
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCountry('');
      setCountryCode('');
      setState('');
      setStateCode('');
      setCity('');
      setAgreeTerms(false);
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    setStorageData('HAS_ONBOARDED', true);
  }, []);

  // Country options list from country-state-city
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(c => ({
      label: `${c.flag}  ${c.name}`,
      name: c.name,
      value: c.isoCode,
    }));
  }, []);

  // State options list for selected country
  const stateOptions = useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map(s => ({
      label: s.name,
      name: s.name,
      value: s.isoCode,
    }));
  }, [countryCode]);

  // City options list for selected state & country
  const cityOptions = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map(ci => ({
      label: ci.name,
      name: ci.name,
      value: ci.name,
    }));
  }, [countryCode, stateCode]);

  const handleSelectCountry = (item) => {
    setCountry(item.name);
    setCountryCode(item.value);
    setState('');
    setStateCode('');
    setCity('');
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: null, state: null, city: null }));
    }
  };

  const handleSelectState = (item) => {
    setState(item.name);
    setStateCode(item.value);
    setCity('');
    if (errors.state) {
      setErrors(prev => ({ ...prev, state: null, city: null }));
    }
  };

  const handleSelectCity = (item) => {
    setCity(item.name || item.label);
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }));
    }
  };

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

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Display name validation
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

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
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Country validation
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }

    // State validation
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }

    // City validation
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    // Terms agreement validation
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password: password,
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
      });

      const isEmailVerified =
        response?.user?.emailVerified ??
        response?.data?.user?.emailVerified ??
        response?.emailVerified;

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: response?.message || 'Welcome to UGolf!',
      });

      if (response?.accessToken) {
        await setStorageData('token', response.accessToken);
      }

      if (response?.refreshToken) {
        await setStorageData('refreshToken', response.refreshToken);
      }

      if (isEmailVerified === true) {
        await setStorageData('USER_DATA', response?.data || response);

        dispatch(
          setLoginData({
            user: response?.data?.user || response?.user || response,
            token:
              response?.data?.accessToken ||
              response?.accessToken ||
              response?.data?.token ||
              response?.token ||
              null,
          }),
        );

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        }, 1500);
      } else {
        navigation.replace('EmailVerification', {
          email: email.trim(),
          sendOTP: true,
        });
      }
    } catch (error) {
      const errorData = error?.response?.data;
      const errorMsg = errorData?.error || errorData?.message || error?.message || 'Something went wrong. Please try again.';

      if (
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('registered')
      ) {
        setErrors(prev => ({
          ...prev,
          email: 'An account with this email already exists',
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
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
                <Text style={styles.welcomeText}>CREATE </Text>
                <Text style={styles.backText}>ACCOUNT !</Text>
              </View>
              <Text style={styles.subtitleText}>
                Join the community and start making an impact.
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
              iconName="user"
              placeholder="First name"
              value={firstName}
              onChangeText={(text) => handleInputChange('firstName', text, setFirstName)}
              autoCapitalize="words"
              style={errors.firstName ? styles.inputError : {}}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <AuthInput
              iconName="user"
              placeholder="Last name"
              value={lastName}
              onChangeText={(text) => handleInputChange('lastName', text, setLastName)}
              autoCapitalize="words"
              style={errors.lastName ? styles.inputError : {}}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <AuthInput
              iconName="user"
              placeholder="Display name"
              value={displayName}
              onChangeText={(text) => handleInputChange('displayName', text, setDisplayName)}
              autoCapitalize="none"
              style={errors.displayName ? styles.inputError : {}}
            />
            {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

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

            <AuthInput
              iconName="lock"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)}
              isPassword={true}
              style={errors.confirmPassword ? styles.inputError : {}}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {/* Country Dropdown */}
            <AuthDropdownPicker
              iconName="globe"
              placeholder="Select Country"
              value={country}
              options={countryOptions}
              onSelect={handleSelectCountry}
              error={!!errors.country}
            />
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

            {/* State Dropdown (enabled when Country selected) */}
            <AuthDropdownPicker
              iconName="map-pin"
              placeholder="Select State"
              value={state}
              options={stateOptions}
              onSelect={handleSelectState}
              disabled={!countryCode}
              error={!!errors.state}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

            {/* City Dropdown (enabled when State selected) */}
            <AuthDropdownPicker
              iconName="map-pin"
              placeholder="Select City"
              value={city}
              options={cityOptions}
              onSelect={handleSelectCity}
              disabled={!countryCode || !stateCode}
              error={!!errors.city}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            {/* Terms and conditions checkbox */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxActive,
                  errors.agreeTerms && styles.checkboxError,
                ]}
                onPress={() => {
                  const nextVal = !agreeTerms;
                  setAgreeTerms(nextVal);
                  if (errors.agreeTerms) {
                    setErrors(prev => {
                      const updated = { ...prev };
                      delete updated.agreeTerms;
                      return updated;
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                {agreeTerms && (
                  <AuthIcon
                    name="check"
                    size={moderateScale(12)}
                    color={COLORS.white}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsHighlight}
                  onPress={() => navigation.navigate('TermsOfService')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsHighlight}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>{' '}
                of UGolf.
              </Text>
            </View>
            {errors.agreeTerms && (
              <Text style={[styles.errorText, { marginTop: -hp(2), marginBottom: hp(2) }]}>
                {errors.agreeTerms}
              </Text>
            )}

            {/* Create Account Button */}
            <AuthButton
              title="CREATE ACCOUNT"
              onPress={handleSignUp}
              loading={loading}
              style={styles.createBtn}
            />

            {/* Bottom Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.alreadyText}>Already A Member?</Text>
              <TouchableOpacity
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('Login');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.loginText}>Login</Text>
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
    height: hp(43),
    justifyContent: 'flex-start',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerContent: {
    paddingHorizontal: wp(7),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(13),
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
    color: COLORS.primary,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(28),
    color: COLORS.textWhite,
  },
  subtitleText: {
    fontFamily: FONTS.bold,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    marginBottom: hp(3),
    paddingRight: wp(4),
  },
  checkbox: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(4),
    borderWidth: 1.5,
    borderColor: '#A0AEC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2),
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  termsText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(11),
    color: '#4A5568',
    lineHeight: fontSize(15),
  },
  termsHighlight: {
    color: '#1B4D22',
    fontFamily: FONTS.bold,
    textDecorationLine: 'underline',
  },
  createBtn: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  loginRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(3.5),
  },
  alreadyText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginBottom: hp(0.5),
  },
  loginText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#1B4D22',
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  checkboxError: {
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

export default SignUpScreen;
