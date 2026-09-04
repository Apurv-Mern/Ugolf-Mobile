// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Switch,
//   StatusBar,
// } from 'react-native';
// import Toast from 'react-native-toast-message';

// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/slices/authSlice';
// import { logoutApi } from '../../services/authService';
// import { clearStorage, getStorageData } from '../../storage/storage';
// import { getPlayerSubscriptionApi } from '../../services/playerService';
// import { getTeamsApi } from '../../services/teamService';

// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenScaffold,
//   HeroBanner,
//   GlassCard,
//   SecondaryPillButton,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
// const trophyImg = require('../../assets/Images/ trophy.png');
// const editIcon = require('../../assets/Images/edit.png');

// const ProfileScreen = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [subscriptionLabel, setSubscriptionLabel] = useState('Loading…');
//   const [teamsCount, setTeamsCount] = useState(null);

//   const reduxUser = useSelector((state) => state.auth.user);
//   const [userInfo, setUserInfo] = useState(reduxUser);

//   useEffect(() => {
//     if (reduxUser) {
//       setUserInfo(reduxUser);
//     } else {
//       getStorageData('USER_DATA').then((data) => {
//         if (data) {
//           const userObj = data?.user || data?.data?.user || data?.data || data;
//           setUserInfo(userObj);
//         }
//       });
//     }
//   }, [reduxUser]);

//   useEffect(() => {
//     getPlayerSubscriptionApi()
//       .then((res) => {
//         const sub = res?.subscription || res?.data?.subscription || res;
//         const plan = sub?.plan || 'none';
//         const status = sub?.status || 'inactive';
//         setSubscriptionLabel(`${plan} · ${status}`);
//       })
//       .catch(() => setSubscriptionLabel('Subscription unavailable'));

//     getTeamsApi()
//       .then((res) => {
//         const teams = res?.teams || res?.data?.teams || res?.data || (Array.isArray(res) ? res : []);
//         setTeamsCount(Array.isArray(teams) ? teams.length : 0);
//       })
//       .catch(() => setTeamsCount(null));
//   }, []);

//   const rawUser = userInfo?.user || userInfo?.data?.user || userInfo;
//   const getFullName = (u) => {
//     if (!u) return 'User';
//     if (u.firstName || u.lastName) {
//       const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
//       if (full) return full;
//     }
//     const n = u.displayName || u.name || u.fullName;
//     if (n) {
//       if (u.lastName && !n.toLowerCase().includes(u.lastName.toLowerCase())) {
//         return `${n} ${u.lastName}`.trim();
//       }
//       return n;
//     }
//     if (u.username) return u.username;
//     if (u.email) return u.email.split('@')[0];
//     return 'User';
//   };
//   const loggedInName = getFullName(rawUser);

//   const handleSignOut = async () => {
//     try {
//       await logoutApi();
//     } catch (error) {
//       console.log('Logout API Error:', error);
//     } finally {
//       await clearStorage();
//       dispatch(logout());
//       Toast.show({
//         type: 'info',
//         text1: 'Signed Out',
//         text2: 'You have been signed out successfully.',
//       });
//       if (navigation?.reset) {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'Auth' }],
//         });
//       } else if (navigation?.navigate) {
//         navigation.navigate('Auth');
//       }
//     }
//   };

//   const renderMenuRow = ({ icon, title, subtitle, onPress, trailing }) => {
//     const body = (
//       <View style={styles.menuRow}>
//         <View style={styles.iconCircle}>
//           <AuthIcon name={icon} size={moderateScale(18)} color={COLORS.textPrimary} />
//         </View>
//         <View style={styles.menuTextWrap}>
//           <Text style={styles.menuTitle}>{title}</Text>
//           {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
//         </View>
//         {trailing}
//       </View>
//     );

//     if (onPress) {
//       return (
//         <GlassCard onPress={onPress} style={styles.menuCard}>
//           {body}
//         </GlassCard>
//       );
//     }

//     return <GlassCard style={styles.menuCard}>{body}</GlassCard>;
//   };

//   return (
//     <ScreenScaffold edges={[]} showDots={false}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.headerContainer}>
//           <HeroBanner
//             source={homescreenBg}
//             height={hp(22)}
//             showBack={false}
//             overlayOpacity={0.55}
//           />

//           <TouchableOpacity
//             style={styles.avatarWrapper}
//             onPress={() => navigation?.navigate && navigation.navigate('EditProfile')}
//             activeOpacity={0.85}
//           >
//             <Image source={trophyImg} style={styles.avatarImage} />
//             <View style={styles.avatarEditBadge}>
//               <Image
//                 source={editIcon}
//                 style={{ width: moderateScale(16), height: moderateScale(16) }}
//                 resizeMode="contain"
//               />
//             </View>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.userName}>{loggedInName}</Text>

//         <View style={styles.menuSection}>
//           {renderMenuRow({
//             icon: 'bell',
//             title: 'Notifications',
//             trailing: (
//               <Switch
//                 value={notificationsEnabled}
//                 onValueChange={setNotificationsEnabled}
//                 trackColor={{ false: '#E2E8F0', true: COLORS.ctaGlow }}
//                 thumbColor={COLORS.white}
//                 ios_backgroundColor="#E2E8F0"
//               />
//             ),
//           })}

//           {renderMenuRow({
//             icon: 'crown',
//             title: 'Subscription',
//             subtitle: subscriptionLabel,
//             onPress: () => navigation?.navigate && navigation.navigate('ChoosePlan'),
//             trailing: (
//               <AuthIcon name="chevron-right" size={moderateScale(18)} color={COLORS.textMuted} />
//             ),
//           })}

//           {renderMenuRow({
//             icon: 'book',
//             title: 'Game Rules',
//             onPress: () => navigation?.navigate && navigation.navigate('GameRules'),
//             trailing: (
//               <AuthIcon name="chevron-right" size={moderateScale(18)} color={COLORS.textMuted} />
//             ),
//           })}

//           {renderMenuRow({
//             icon: 'clock',
//             title: 'Tournament History',
//             subtitle: 'Past rounds & scorecards',
//             onPress: () => navigation?.navigate && navigation.navigate('TournamentHistory'),
//             trailing: (
//               <AuthIcon name="chevron-right" size={moderateScale(18)} color={COLORS.textMuted} />
//             ),
//           })}

//           {renderMenuRow({
//             icon: 'users',
//             title: 'My Teams',
//             subtitle: teamsCount == null ? 'My teams' : `${teamsCount} active teams`,
//             onPress: () => navigation?.navigate && navigation.navigate('YourTeam'),
//             trailing: (
//               <AuthIcon name="chevron-right" size={moderateScale(18)} color={COLORS.textMuted} />
//             ),
//           })}
//         </View>

//         <Text style={styles.accountHeaderTitle}>Account</Text>
//         <GlassCard style={styles.accountGroupCard}>
//           <TouchableOpacity
//             style={styles.accountRow}
//             onPress={() => navigation?.navigate && navigation.navigate('ChangePassword')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.iconCircle}>
//               <AuthIcon name="lock" size={moderateScale(18)} color={COLORS.textPrimary} />
//             </View>
//             <Text style={styles.accountRowTitle}>Change Password</Text>
//           </TouchableOpacity>

//           <View style={styles.rowDivider} />

//           <TouchableOpacity
//             style={styles.accountRow}
//             onPress={() => navigation?.navigate && navigation.navigate('PrivacyPolicy')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.iconCircle}>
//               <AuthIcon name="shield" size={moderateScale(18)} color={COLORS.textPrimary} />
//             </View>
//             <Text style={styles.accountRowTitle}>Privacy Policy</Text>
//           </TouchableOpacity>

//           <View style={styles.rowDivider} />

//           <TouchableOpacity
//             style={styles.accountRow}
//             onPress={() => navigation?.navigate && navigation.navigate('HelpSupport')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.iconCircle}>
//               <AuthIcon name="help-circle" size={moderateScale(18)} color={COLORS.textPrimary} />
//             </View>
//             <Text style={styles.accountRowTitle}>Help & Support</Text>
//           </TouchableOpacity>
//         </GlassCard>

//         <SecondaryPillButton
//           title="SIGN OUT"
//           onPress={handleSignOut}
//           style={styles.signOutBtn}
//           textStyle={styles.signOutText}
//         />

//         <Text style={styles.versionText}>UGolf v2.4.0</Text>

//         <View style={{ height: hp(18) }} />
//       </ScrollView>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: hp(4),
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: hp(5.5),
//   },
//   avatarWrapper: {
//     position: 'absolute',
//     bottom: -hp(5),
//     width: moderateScale(104),
//     height: moderateScale(104),
//     borderRadius: moderateScale(52),
//     borderWidth: 4,
//     borderColor: COLORS.white,
//     backgroundColor: COLORS.dotPattern,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: moderateScale(52),
//   },
//   avatarEditBadge: {
//     position: 'absolute',
//     bottom: 2,
//     right: 2,
//     width: moderateScale(29),
//     height: moderateScale(29),
//     borderRadius: moderateScale(15),
//     backgroundColor: '#EEFFE9',
//     borderWidth: 1,
//     borderColor: COLORS.textPrimary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   userName: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(26),
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     letterSpacing: -0.5,
//     marginBottom: hp(2.5),
//   },
//   menuSection: {
//     paddingHorizontal: wp(6),
//     gap: hp(1.5),
//   },
//   menuCard: {
//     borderRadius: moderateScale(22),
//     borderColor: 'rgba(255,255,255,0.7)',
//     backgroundColor: 'rgba(255,255,255,0.72)',
//     shadowColor: COLORS.textPrimary,
//     shadowOffset: { width: 0, height: 20 },
//     shadowOpacity: 0.12,
//     shadowRadius: 25,
//     elevation: 4,
//   },
//   menuRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.8),
//     gap: wp(4),
//   },
//   iconCircle: {
//     width: moderateScale(46),
//     height: moderateScale(46),
//     borderRadius: moderateScale(23),
//     backgroundColor: 'rgba(14,59,46,0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   menuTextWrap: {
//     flex: 1,
//   },
//   menuTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: COLORS.textPrimary,
//   },
//   menuSubtitle: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: COLORS.textLabel,
//     opacity: 0.75,
//     marginTop: hp(0.2),
//   },
//   accountHeaderTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(16),
//     color: COLORS.textPrimary,
//     paddingHorizontal: wp(6),
//     marginTop: hp(2),
//     marginBottom: hp(1),
//   },
//   accountGroupCard: {
//     marginHorizontal: wp(6),
//     marginBottom: hp(3),
//     borderRadius: moderateScale(24),
//     borderWidth: 0,
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.textPrimary,
//     shadowOffset: { width: 0, height: 20 },
//     shadowOpacity: 0.12,
//     shadowRadius: 25,
//     elevation: 4,
//   },
//   accountRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.5),
//     gap: wp(4),
//   },
//   accountRowTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(16),
//     color: COLORS.textPrimary,
//   },
//   rowDivider: {
//     height: 1,
//     backgroundColor: 'rgba(14,59,46,0.1)',
//   },
//   signOutBtn: {
//     flex: 0,
//     width: undefined,
//     marginHorizontal: wp(6),
//     borderColor: '#FF0004',
//     backgroundColor: 'rgba(212,24,61,0.1)',
//     marginBottom: hp(1.5),
//   },
//   signOutText: {
//     color: '#FF0004',
//     fontSize: fontSize(18),
//   },
//   versionText: {
//     fontFamily: FONTS.regular,
//     fontSize: fontSize(12),
//     color: 'rgba(14,59,46,0.35)',
//     textAlign: 'center',
//   },
// });

// export default ProfileScreen;



import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../../redux/slices/authSlice';
import { logoutApi } from '../../services/authService';

import {
  getPlayerSubscriptionApi,
} from '../../services/playerService';

import {
  getTeamsApi,
} from '../../services/teamService';

import {
  clearStorage,
  getStorageData,
} from '../../storage/storage';

import AuthIcon from '../../components/common/AuthIcon';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';

import {
  wp,
  hp,
  fontSize,
  moderateScale,
} from '../../utils/responsive';


// ============================================================
// ASSETS
// ============================================================

const homescreenBg = require('../../assets/Images/homescreen_bg.jpg');
const trophyImg = require('../../assets/Images/ trophy.png');
const editIcon = require('../../assets/Images/edit.png');


// ============================================================
// PROFILE SCREEN
// ============================================================

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // API-driven subscription
  const [subscriptionLabel, setSubscriptionLabel] = useState('Loading…');

  // API-driven team count
  const [teamsCount, setTeamsCount] = useState(null);


  // ==========================================================
  // USER DATA
  // ==========================================================

  const reduxUser = useSelector((state) => state.auth.user);

  const [userInfo, setUserInfo] = useState(reduxUser);


  // ==========================================================
  // LOAD USER DATA
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        // If Redux already has user information,
        // use that first.
        if (reduxUser) {
          if (isMounted) {
            setUserInfo(reduxUser);
          }

          return;
        }

        // Otherwise get user information from storage.
        const data = await getStorageData('USER_DATA');

        if (!isMounted) {
          return;
        }

        if (data) {
          const userObj =
            data?.user ||
            data?.data?.user ||
            data?.data ||
            data;

          setUserInfo(userObj);
        }
      } catch (error) {
        console.log('Profile user data error:', error);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [reduxUser]);


  // ==========================================================
  // LOAD SUBSCRIPTION + TEAMS
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      // ------------------------------------------------------
      // SUBSCRIPTION
      // ------------------------------------------------------

      try {
        const res = await getPlayerSubscriptionApi();

        console.log(
          'PROFILE SUBSCRIPTION RESPONSE:',
          JSON.stringify(res, null, 2),
        );

        if (!isMounted) {
          return;
        }

        const sub =
          res?.subscription ||
          res?.data?.subscription ||
          res?.data ||
          res;

        const plan = sub?.plan || 'none';
        const status = sub?.status || 'inactive';

        setSubscriptionLabel(`${plan} · ${status}`);
      } catch (error) {
        console.log(
          'Get subscription error:',
          error?.response?.data || error?.message || error,
        );

        if (isMounted) {
          setSubscriptionLabel('Subscription unavailable');
        }
      }


      // ------------------------------------------------------
      // MY TEAMS
      // ------------------------------------------------------

      try {
        const res = await getTeamsApi();

        console.log(
          'PROFILE TEAMS RESPONSE:',
          JSON.stringify(res, null, 2),
        );

        if (!isMounted) {
          return;
        }

        const teams =
          res?.teams ||
          res?.data?.teams ||
          res?.data ||
          (Array.isArray(res) ? res : []);

        if (Array.isArray(teams)) {
          setTeamsCount(teams.length);
        } else {
          setTeamsCount(0);
        }
      } catch (error) {
        console.log(
          'Get teams error:',
          error?.response?.data || error?.message || error,
        );

        if (isMounted) {
          setTeamsCount(null);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);


  // ==========================================================
  // GET RAW USER
  // ==========================================================

  const rawUser =
    userInfo?.user ||
    userInfo?.data?.user ||
    userInfo;


  // ==========================================================
  // GET FULL NAME
  // ==========================================================

  const getFullName = (u) => {
    if (!u) {
      return 'User';
    }

    // firstName + lastName
    if (u.firstName || u.lastName) {
      const full =
        `${u.firstName || ''} ${u.lastName || ''}`.trim();

      if (full) {
        return full;
      }
    }

    // displayName / name / fullName
    const n =
      u.displayName ||
      u.name ||
      u.fullName;

    if (n) {
      if (
        u.lastName &&
        !n
          .toLowerCase()
          .includes(u.lastName.toLowerCase())
      ) {
        return `${n} ${u.lastName}`.trim();
      }

      return n;
    }

    // username
    if (u.username) {
      return u.username;
    }

    // email
    if (u.email) {
      return u.email.split('@')[0];
    }

    return 'User';
  };


  const loggedInName = getFullName(rawUser);


  // ============================================================
  // SIGN OUT
  // ============================================================

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutApi();
            } catch (error) {
              console.log(
                'Logout API Error:',
                error?.response?.data || error?.message || error,
              );
            } finally {
              try {
                await clearStorage();
              } catch (storageError) {
                console.log(
                  'Clear storage error:',
                  storageError,
                );
              }

              dispatch(logout());

              Toast.show({
                type: 'info',
                text1: 'Signed Out',
                text2: 'You have been signed out successfully.',
              });

              // Reset navigation to Auth
              if (navigation?.reset) {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Auth',
                    },
                  ],
                });
              } else if (navigation?.navigate) {
                navigation.navigate('Auth');
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />


      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* =====================================================
            HEADER BANNER
        ====================================================== */}

        <View style={styles.headerContainer}>

          <ImageBackground
            source={homescreenBg}
            style={styles.bannerHeader}
            resizeMode="cover"
          >
            <View style={styles.bannerOverlay} />
          </ImageBackground>


          {/* ===================================================
              OVERLAPPING AVATAR
          ==================================================== */}

          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('EditProfile')
            }
            activeOpacity={0.85}
          >

            <Image
              source={trophyImg}
              style={styles.avatarImage}
            />

            <View style={styles.avatarEditBadge}>

              <Image
                source={editIcon}
                style={{
                  width: moderateScale(16),
                  height: moderateScale(16),
                }}
                resizeMode="contain"
              />

            </View>

          </TouchableOpacity>

        </View>


        {/* =====================================================
            USER NAME & DISPLAY NAME
        ====================================================== */}

        <View style={styles.userNameContainer}>
          <Text style={styles.userName}>
            {loggedInName}
          </Text>

          {Boolean(rawUser?.displayName) ? (
            <View style={styles.displayNameBadge}>
              <Text style={styles.userDisplayName}>
                @{rawUser.displayName}
              </Text>
            </View>
          ) : null}
        </View>


        {/* =====================================================
            MENU CARDS
        ====================================================== */}

        <View style={styles.menuSection}>

          {/* ===================================================
              NOTIFICATIONS
          ==================================================== */}

          <View style={styles.menuCard}>

            <View style={styles.iconCircle}>

              <AuthIcon
                name="bell"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                Notifications
              </Text>

            </View>


            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: '#E2E8F0',
                true: '#BCFF00',
              }}
              thumbColor={COLORS.white}
              ios_backgroundColor="#E2E8F0"
            />

          </View>


          {/* ===================================================
              SUBSCRIPTION
              API-DRIVEN
          ==================================================== */}

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('ChoosePlan')
            }
            activeOpacity={0.85}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="crown"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                Subscription
              </Text>


              <Text
                style={styles.menuSubtitle}
                numberOfLines={1}
              >
                {subscriptionLabel}
              </Text>

            </View>


            <AuthIcon
              name="chevron-right"
              size={moderateScale(18)}
              color="#A0AEC0"
            />

          </TouchableOpacity>


          {/* ===================================================
              GAME RULES
          ==================================================== */}

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('GameRules')
            }
            activeOpacity={0.85}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="book"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                Game Rules
              </Text>

            </View>


            <AuthIcon
              name="chevron-right"
              size={moderateScale(18)}
              color="#A0AEC0"
            />

          </TouchableOpacity>


          {/* ===================================================
              TOURNAMENT HISTORY
          ==================================================== */}

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('TournamentHistory')
            }
            activeOpacity={0.85}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="clock"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                Tournament History
              </Text>


              <Text style={styles.menuSubtitle}>
                Past rounds & scorecards
              </Text>

            </View>


            <AuthIcon
              name="chevron-right"
              size={moderateScale(18)}
              color="#A0AEC0"
            />

          </TouchableOpacity>


          {/* ===================================================
              MY TEAMS
              API-DRIVEN
          ==================================================== */}

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('YourTeam')
            }
            activeOpacity={0.85}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="users"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                My Teams
              </Text>


              <Text style={styles.menuSubtitle}>
                {teamsCount == null
                  ? 'My teams'
                  : `${teamsCount} active ${teamsCount === 1
                    ? 'team'
                    : 'teams'
                  }`}
              </Text>

            </View>


            <AuthIcon
              name="chevron-right"
              size={moderateScale(18)}
              color="#A0AEC0"
            />

          </TouchableOpacity>

        </View>


        {/* =====================================================
            ACCOUNT
        ====================================================== */}

        <Text style={styles.accountHeaderTitle}>
          Account
        </Text>


        <View style={styles.accountGroupCard}>

          {/* ===================================================
              CHANGE PASSWORD (Hidden for now)
          ==================================================== */}

          {/* <TouchableOpacity
            style={styles.accountRow}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('ChangePassword')
            }
            activeOpacity={0.7}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="lock"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <Text style={styles.accountRowTitle}>
              Change Password
            </Text>

          </TouchableOpacity>


          <View style={styles.rowDivider} /> */}


          {/* ===================================================
              PRIVACY POLICY
          ==================================================== */}

          <TouchableOpacity
            style={styles.accountRow}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('PrivacyPolicy')
            }
            activeOpacity={0.7}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="shield"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <Text style={styles.accountRowTitle}>
              Privacy Policy
            </Text>

          </TouchableOpacity>


          <View style={styles.rowDivider} />


          {/* ===================================================
              HELP & SUPPORT
          ==================================================== */}

          <TouchableOpacity
            style={styles.accountRow}
            onPress={() =>
              navigation?.navigate &&
              navigation.navigate('HelpSupport')
            }
            activeOpacity={0.7}
          >

            <View style={styles.iconCircle}>

              <AuthIcon
                name="help-circle"
                size={moderateScale(18)}
                color="#093A24"
              />

            </View>


            <Text style={styles.accountRowTitle}>
              Help & Support
            </Text>

          </TouchableOpacity>

        </View>


        {/* =====================================================
            SIGN OUT
        ====================================================== */}

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >

          <AuthIcon
            name="log-out"
            size={moderateScale(18)}
            color="#FF4D4D"
            style={{
              marginRight: wp(2),
            }}
          />


          <Text style={styles.signOutText}>
            SIGN OUT
          </Text>

        </TouchableOpacity>


        {/* =====================================================
            APP VERSION
        ====================================================== */}

        {/* <Text style={styles.versionText}>
          UGolf v2.4.0
        </Text> */}


        {/* =====================================================
            BOTTOM SPACING
        ====================================================== */}

        <View
          style={{
            height: hp(18),
          }}
        />

      </ScrollView>

    </SafeAreaView>
  );
};


// ============================================================
// STYLES
// These are kept from your OLD COMMENTED UI.
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: hp(4),
  },


  // ==========================================================
  // HEADER & AVATAR
  // ==========================================================

  headerContainer: {
    alignItems: 'center',
    marginBottom: hp(5.5),
  },

  bannerHeader: {
    width: '100%',
    height: hp(22),
    position: 'relative',
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.40)',
  },

  avatarWrapper: {
    position: 'absolute',
    bottom: -hp(5),
    width: moderateScale(94),
    height: moderateScale(94),
    borderRadius: moderateScale(47),
    borderWidth: 3.5,
    borderColor: COLORS.white,
    backgroundColor: '#EDF5EF',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 4,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(47),
  },

  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,

    width: moderateScale(32),
    height: moderateScale(32),

    borderRadius: moderateScale(16),

    backgroundColor: '#EFF7F2',

    borderWidth: 1.5,
    borderColor: '#093A24',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 4,
  },


  userNameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },

  userName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(24),
    color: '#093A24',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },

  displayNameBadge: {
    backgroundColor: 'rgba(9, 58, 36, 0.08)',
    borderColor: '#093A24',
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.3),
    marginTop: hp(0.2),
  },

  userDisplayName: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    textAlign: 'center',
  },


  // ==========================================================
  // MENU SECTION
  // ==========================================================

  menuSection: {
    paddingHorizontal: wp(5),
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderWidth: 1.5,
    borderColor: '#E2E8F0',

    borderRadius: moderateScale(20),

    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.8),

    marginBottom: hp(1.5),

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,

    elevation: 2,
  },

  iconCircle: {
    width: moderateScale(40),
    height: moderateScale(40),

    borderRadius: moderateScale(20),

    backgroundColor: '#F0F5F2',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: wp(3.5),
  },

  menuTextWrap: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },

  menuSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
    marginTop: hp(0.3),
  },


  // ==========================================================
  // ACCOUNT SECTION
  // ==========================================================

  accountHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',

    paddingHorizontal: wp(5),

    marginTop: hp(1.5),
    marginBottom: hp(1.2),
  },

  accountGroupCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1.5,
    borderColor: '#E2E8F0',

    borderRadius: moderateScale(20),

    marginHorizontal: wp(5),
    marginBottom: hp(3),

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,

    elevation: 2,

    overflow: 'hidden',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.6),
  },

  accountRowTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
  },

  rowDivider: {
    height: 1,

    backgroundColor: '#E2E8F0',

    marginLeft: wp(16),
  },


  // ==========================================================
  // SIGN OUT
  // ==========================================================

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginHorizontal: wp(5),

    height: hp(6.2),

    borderRadius: moderateScale(30),

    backgroundColor: '#FEE2E2',

    borderWidth: 1.5,
    borderColor: '#FF4D4D',

    marginBottom: hp(1.5),
  },

  signOutText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),

    color: '#FF4D4D',

    letterSpacing: 0.5,
  },


  // ==========================================================
  // VERSION
  // ==========================================================

  versionText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#A0AEC0',

    textAlign: 'center',
  },

});


export default ProfileScreen;