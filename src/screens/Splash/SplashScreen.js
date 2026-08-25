// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   StatusBar,
//   Animated,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch } from 'react-redux';

// import UGolfLogo from '../../components/common/UGolfLogo';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
// import { getStorageData, setStorageData } from '../../storage/storage';
// import { STORAGE_KEYS } from '../../constants/storageKeys';
// import { getPlayerProfileApi } from '../../services/playerService';
// import { setLoginData } from '../../redux/slices/authSlice';

// const splashBg = require('../../assets/Images/Splash Bg (2).png');

// const SplashScreen = ({ navigation }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.85)).current;
//   const dispatch = useDispatch();

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 900,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 7,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     const timer = setTimeout(async () => {
//       try {
//         const hasOnboarded = await getStorageData(STORAGE_KEYS.HAS_ONBOARDED);
//         const token = await getStorageData('token');

//         if (token) {
//           try {
//             const profileRes = await getPlayerProfileApi();
//             const player = profileRes?.player || profileRes?.data?.player || profileRes?.user || profileRes;
//             if (player) {
//               await setStorageData('USER_DATA', { user: player, player });
//               dispatch(
//                 setLoginData({
//                   user: player,
//                   token,
//                 }),
//               );
//               navigation.replace('MainApp');
//               return;
//             }
//           } catch (hydrateErr) {
//             console.log('Splash hydrate failed:', hydrateErr?.response?.status || hydrateErr?.message);
//             // If refresh also fails, interceptor may clear storage; fall through to auth
//             const stillHasToken = await getStorageData('token');
//             if (!stillHasToken) {
//               navigation.replace(hasOnboarded ? 'Auth' : 'Onboarding');
//               return;
//             }
//           }
//         }

//         if (hasOnboarded) {
//           navigation.replace('Auth');
//         } else {
//           navigation.replace('Onboarding');
//         }
//       } catch (error) {
//         navigation.replace('Onboarding');
//       }
//     }, 2200);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [fadeAnim, navigation, scaleAnim, dispatch]);

//   return (
//     <SafeAreaView style={styles.container} edges={[]}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="light-content"
//       />
//       <ImageBackground
//         source={splashBg}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       >
//         <LinearGradient
//           colors={[
//             'rgba(14, 59, 46, 0.25)',
//             'rgba(14, 59, 46, 0.45)',
//             'rgba(9, 36, 28, 0.85)',
//           ]}
//           style={StyleSheet.absoluteFill}
//         />

//         <View style={styles.content}>
//           <Animated.View
//             style={[
//               styles.logoContainer,
//               {
//                 opacity: fadeAnim,
//                 transform: [{ scale: scaleAnim }],
//               },
//             ]}
//           >
//             <UGolfLogo width={wp(82)} height={hp(24)} />
//           </Animated.View>

//           <Animated.View style={[styles.taglineWrap, { opacity: fadeAnim }]}>
//             <View style={styles.taglineRule} />
//             <Text style={styles.tagline}>PLAY · TRACK · COMPETE</Text>
//             <View style={styles.taglineRule} />
//           </Animated.View>
//         </View>

//         <Animated.View style={[styles.dotsRow, { opacity: fadeAnim }]}>
//           <View style={[styles.loaderDot, styles.loaderDotActive]} />
//           <View style={styles.loaderDot} />
//           <View style={styles.loaderDot} />
//         </Animated.View>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.black,
//   },
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   taglineWrap: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: hp(1),
//   },
//   taglineRule: {
//     width: wp(8),
//     height: 1,
//     backgroundColor: 'rgba(188, 255, 0, 0.5)',
//   },
//   tagline: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(12),
//     color: COLORS.cta,
//     letterSpacing: 3,
//     marginHorizontal: wp(3),
//   },
//   dotsRow: {
//     position: 'absolute',
//     bottom: hp(7),
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderDot: {
//     width: moderateScale(8),
//     height: moderateScale(8),
//     borderRadius: moderateScale(4),
//     backgroundColor: 'rgba(255, 255, 255, 0.35)',
//     marginHorizontal: moderateScale(4),
//   },
//   loaderDotActive: {
//     width: moderateScale(24),
//     backgroundColor: COLORS.cta,
//   },
// });

// export default SplashScreen;


// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   ImageBackground,
//   StatusBar,
//   Animated,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import UGolfLogo from '../../components/common/UGolfLogo';
// import { COLORS } from '../../theme/colors';
// import { wp, hp } from '../../utils/responsive';
// import { getStorageData } from '../../storage/storage';
// import { STORAGE_KEYS } from '../../constants/storageKeys';

// const splashBg = require('../../assets/Images/Splash Bg (2).png');

// const SplashScreen = ({ navigation }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.85)).current;

//   useEffect(() => {
//     // Logo entrance animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 900,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 7,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Navigate after delay
//     const timer = setTimeout(async () => {
//       try {
//         const hasOnboarded = await getStorageData(STORAGE_KEYS.HAS_ONBOARDED);
//         if (hasOnboarded) {
//           navigation.replace('Auth');
//         } else {
//           navigation.replace('Onboarding');
//         }
//       } catch (error) {
//         navigation.replace('Onboarding');
//       }
//     }, 2200);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [fadeAnim, navigation, scaleAnim]);

//   return (
//     <SafeAreaView style={styles.container} edges={[]}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="light-content"
//       />
//       <ImageBackground
//         source={splashBg}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       >
//         {/* Dark Overlay */}
//         <View style={styles.overlay} />

//         {/* Center Content with Logo only */}
//         <View style={styles.content}>
//           <Animated.View
//             style={[
//               styles.logoContainer,
//               {
//                 opacity: fadeAnim,
//                 transform: [{ scale: scaleAnim }],
//               },
//             ]}
//           >
//             <UGolfLogo width={wp(82)} height={hp(24)} />
//           </Animated.View>
//         </View>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.black,
//   },
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.35)',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default SplashScreen;



import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import UGolfLogo from '../../components/common/UGolfLogo';
import { COLORS } from '../../theme/colors';
import { wp, hp } from '../../utils/responsive';
import {
  getStorageData,
  setStorageData,
} from '../../storage/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { getPlayerProfileApi } from '../../services/playerService';
import { setLoginData } from '../../redux/slices/authSlice';

const splashBg = require('../../assets/Images/Splash Bg (2).png');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const dispatch = useDispatch();

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication after splash delay
    const timer = setTimeout(async () => {
      try {
        // Check whether user has completed onboarding
        const hasOnboarded = await getStorageData(
          STORAGE_KEYS.HAS_ONBOARDED,
        );

        // Get stored authentication token and user data
        const token = await getStorageData('token');
        const userData = await getStorageData('USER_DATA');

        // --------------------------------------------------
        // EXISTING LOGGED-IN USER (Auto-Login on Reopen)
        // --------------------------------------------------
        if (token && userData) {
          const userObj = userData?.user || userData?.player || userData;
          if (userObj) {
            dispatch(
              setLoginData({
                user: userObj,
                token,
              }),
            );

            // User is logged in, navigate straight to MainApp
            navigation.replace('MainApp');

            // Refresh user profile in background
            getPlayerProfileApi()
              .then((profileRes) => {
                const freshPlayer =
                  profileRes?.player ||
                  profileRes?.data?.player ||
                  profileRes?.user ||
                  profileRes;
                if (freshPlayer) {
                  setStorageData('USER_DATA', {
                    user: freshPlayer,
                    player: freshPlayer,
                  });
                }
              })
              .catch((err) => {
                console.log('Background profile refresh note:', err?.message);
              });

            return;
          }
        } else if (token) {
          try {
            // Token exists without local userData, fetch profile
            const profileRes = await getPlayerProfileApi();
            const player =
              profileRes?.player ||
              profileRes?.data?.player ||
              profileRes?.user ||
              profileRes;

            if (player) {
              await setStorageData('USER_DATA', {
                user: player,
                player,
              });

              dispatch(
                setLoginData({
                  user: player,
                  token,
                }),
              );

              navigation.replace('MainApp');
              return;
            }
          } catch (hydrateErr) {
            console.log('Splash hydrate failed:', hydrateErr?.message);
          }
        }

        // --------------------------------------------------
        // NO VALID LOGIN SESSION (Or Explicitly Logged Out)
        // --------------------------------------------------
        if (hasOnboarded) {
          navigation.replace('Auth');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.log('Splash error:', error);

        navigation.replace('Onboarding');
      }
    }, 2200);

    // Cleanup timer when component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [fadeAnim, navigation, scaleAnim, dispatch]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={splashBg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <View style={styles.overlay} />

        {/* Center Logo */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: scaleAnim,
                  },
                ],
              },
            ]}
          >
            <UGolfLogo
              width={wp(82)}
              height={hp(24)}
            />
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Current dark overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;