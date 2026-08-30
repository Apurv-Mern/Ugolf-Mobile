// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { useFocusEffect } from '@react-navigation/native';

// import AuthIcon from '../../components/common/AuthIcon';
// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   PrimaryPillButton,
//   GlassCard,
// } from '../../components/ui';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
// import { getPlayerSubscriptionApi } from '../../services/playerService';

// const FEATURES = [
//   'Unlimited tournament and team play',
//   'GPS course tracking and live scoring',
//   'Achievements, rewards and leaderboards',
// ];

// const ChoosePlanScreen = ({ navigation }) => {
//   const [subscription, setSubscription] = React.useState(null);

//   React.useEffect(() => {
//     getPlayerSubscriptionApi()
//       .then((res) => {
//         setSubscription(res?.subscription || res?.data?.subscription || res);
//       })
//       .catch((err) => console.log('Subscription load note:', err));
//   }, []);

//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         // Redirect hardware back button to Login screen on subscription screen
//         navigation.navigate('Login');
//         return true;
//       };

//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

//       return () =>
//         subscription.remove();
//     }, [navigation])
//   );

//   const handleSubscribe = () => {
//     // Navigate directly to MainApp after subscription
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   };

//   const handleBack = () => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     } else {
//       navigation.navigate('Login');
//     }
//   };

//   return (
//     <ScreenScaffold edges={['top', 'bottom']}>
//       <StatusBar
//         translucent={false}
//         backgroundColor={COLORS.bgPage}
//         barStyle="dark-content"
//       />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <CircularBackButton onPress={handleBack} />

//         <ScreenHeader
//           title="Choose your plan"
//           subtitle="Unlock the full UGolf experience"
//           style={styles.header}
//         />
//         {subscription ? (
//           <Text style={styles.currentPlan}>
//             Current: {subscription.plan || 'none'} ({subscription.status || 'inactive'})
//           </Text>
//         ) : null}

//         {/* No Active Subscription */}
//         <GlassCard style={styles.inactiveCard}>
//           <View style={styles.inactiveCardHeader}>
//             <Text style={styles.inactiveCardTitle}>No Active Subscription</Text>
//             <AuthIcon name="lock" size={moderateScale(22)} color={COLORS.textPrimary} />
//           </View>
//           <View style={styles.featureRow}>
//             <AuthIcon name="check" size={moderateScale(14)} color={COLORS.textPrimary} />
//             <Text style={styles.inactiveCardText}>
//               Subscribe to unlock gameplay, tournaments & leaderboards
//             </Text>
//           </View>
//         </GlassCard>

//         {/* Annual plan */}
//         <GlassCard style={styles.activeCardOuter}>
//           <LinearGradient
//             colors={['#007D59', COLORS.textPrimary]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 0, y: 1 }}
//             style={styles.activeCard}
//           >
//             <View style={styles.activeCardTop}>
//               <Text style={styles.activeCardTitle}>Annual</Text>
//               <View style={styles.bestValueBadge}>
//                 <Text style={styles.bestValueText}>BEST VALUE</Text>
//               </View>
//             </View>
//             <View style={styles.priceRow}>
//               <Text style={styles.priceText}>AU$30.00</Text>
//               <Text style={styles.pricePeriod}>/year</Text>
//             </View>
//           </LinearGradient>
//         </GlassCard>

//         <View style={styles.checklist}>
//           {FEATURES.map((feature) => (
//             <View key={feature} style={styles.checkItem}>
//               <AuthIcon name="check" size={moderateScale(16)} color={COLORS.textLabel} />
//               <Text style={styles.checkText}>{feature}</Text>
//             </View>
//           ))}
//         </View>

//         <PrimaryPillButton
//           title="SUBSCRIBE NOW"
//           onPress={handleSubscribe}
//           style={styles.subscribeBtn}
//         />

//         <Text style={styles.footerTagline}>
//           Payment charges via your App Store or Google Play account. Cancel anytime in account setting.
//         </Text>
//       </ScrollView>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: wp(6),
//     paddingTop: hp(2.5),
//     paddingBottom: hp(8),
//   },
//   header: {
//     marginTop: hp(2),
//     marginBottom: hp(1),
//   },
//   currentPlan: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(12),
//     color: COLORS.textMuted,
//     marginBottom: hp(1.5),
//   },
//   inactiveCard: {
//     backgroundColor: '#F9DCA4',
//     borderRadius: moderateScale(28),
//     borderWidth: 0,
//     paddingHorizontal: wp(5.5),
//     paddingVertical: hp(2.2),
//     marginTop: hp(2),
//     marginBottom: hp(2),
//     shadowColor: '#FFBC2B',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   inactiveCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp(1),
//   },
//   inactiveCardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(18),
//     color: COLORS.textPrimary,
//     flex: 1,
//     paddingRight: wp(3),
//   },
//   featureRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: wp(2),
//     paddingRight: wp(4),
//   },
//   inactiveCardText: {
//     flex: 1,
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(13),
//     color: COLORS.black,
//     lineHeight: fontSize(16),
//   },
//   activeCardOuter: {
//     borderRadius: moderateScale(28),
//     borderWidth: 1,
//     borderColor: COLORS.textPrimary,
//     marginBottom: hp(3),
//     padding: 0,
//     backgroundColor: COLORS.transparent,
//   },
//   activeCard: {
//     borderRadius: moderateScale(27),
//     paddingHorizontal: wp(5.5),
//     paddingVertical: hp(2.4),
//   },
//   activeCardTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp(1.2),
//   },
//   activeCardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(20),
//     color: COLORS.white,
//   },
//   bestValueBadge: {
//     backgroundColor: COLORS.ctaGlow,
//     borderRadius: moderateScale(999),
//     paddingHorizontal: wp(2.5),
//     paddingVertical: hp(0.55),
//   },
//   bestValueText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10),
//     color: COLORS.textPrimary,
//     letterSpacing: 0.5,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   priceText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(30),
//     color: COLORS.ctaGlow,
//   },
//   pricePeriod: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(16),
//     color: COLORS.white,
//     marginLeft: wp(1),
//   },
//   checklist: {
//     marginBottom: hp(3.5),
//     gap: hp(1.2),
//   },
//   checkItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(2),
//   },
//   checkText: {
//     flex: 1,
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(15),
//     color: COLORS.textLabel,
//     lineHeight: fontSize(20),
//   },
//   subscribeBtn: {
//     marginBottom: hp(2),
//   },
//   footerTagline: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(14),
//     color: COLORS.textLabel,
//     textAlign: 'center',
//     lineHeight: fontSize(22),
//     paddingHorizontal: wp(2),
//   },
// });

// export default ChoosePlanScreen;



// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';

// import AuthButton from '../../components/common/AuthButton';
// import AuthIcon from '../../components/common/AuthIcon';
// import DotPattern from '../../components/common/DotPattern';
// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

// const ChoosePlanScreen = ({ navigation }) => {
//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         // Redirect hardware back button to Login screen on subscription screen
//         navigation.navigate('Login');
//         return true;
//       };

//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

//       return () =>
//         subscription.remove();
//     }, [navigation])
//   );

//   const handleSubscribe = () => {
//     // Navigate directly to MainApp after subscription
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   };

//   const handleBack = () => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     } else {
//       navigation.navigate('Login');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
//       <StatusBar
//         translucent={false}
//         backgroundColor="#F8FAF9"
//         barStyle="dark-content"
//       />

//       {/* Background Dot pattern at bottom — rendered first so it sits behind all content */}
//       <DotPattern width={SCREEN_WIDTH} style={styles.bottomDotPattern} />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backBtn}
//           onPress={handleBack}
//           activeOpacity={0.7}
//         >
//           <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
//         </TouchableOpacity>

//         {/* Title Block */}
//         <View style={styles.headerBlock}>
//           <Text style={styles.title}>Choose your plan</Text>
//           <Text style={styles.subtitle}>Unlock the full UGolf experience</Text>
//         </View>

//         {/* Card 1: No Active Subscription (Orange Card) */}
//         <View style={styles.inactiveCard}>
//           <View style={styles.inactiveCardHeader}>
//             <Text style={styles.inactiveCardTitle}>No Active Subscription</Text>
//             <AuthIcon name="lock" size={20} color="#093A24" />
//           </View>
//           <View style={styles.featureRow}>
//             <Text style={styles.checkmark}>✓</Text>
//             <Text style={styles.inactiveCardText}>
//               Subscribe to unlock gameplay, tournaments & leaderboards
//             </Text>
//           </View>
//         </View>

//         {/* Card 2: Annual (Green Card) */}
//         <View style={styles.activeCard}>
//           <View style={styles.activeCardTop}>
//             <Text style={styles.activeCardTitle}>Annual</Text>
//             <View style={styles.bestValueBadge}>
//               <Text style={styles.bestValueText}>BEST VALUE</Text>
//             </View>
//           </View>
//           <View style={styles.priceRow}>
//             <Text style={styles.priceText}>AU$30.00</Text>
//             <Text style={styles.pricePeriod}>/year</Text>
//           </View>
//         </View>

//         {/* Feature Checklist */}
//         <View style={styles.checklist}>
//           <View style={styles.checkItem}>
//             <Text style={styles.checkIcon}>✓</Text>
//             <Text style={styles.checkText}>Unlimited tournament and team play</Text>
//           </View>

//           <View style={styles.checkItem}>
//             <Text style={styles.checkIcon}>✓</Text>
//             <Text style={styles.checkText}>GPS course tracking and live scoring</Text>
//           </View>

//           <View style={styles.checkItem}>
//             <Text style={styles.checkIcon}>✓</Text>
//             <Text style={styles.checkText}>Achievements, rewards and leaderboards</Text>
//           </View>
//         </View>

//         {/* Subscribe Button */}
//         <AuthButton
//           title="SUBSCRIBE NOW"
//           onPress={handleSubscribe}
//           style={styles.subscribeBtn}
//         />

//         {/* Payment Footer Tagline */}
//         <Text style={styles.footerTagline}>
//           Payment charges via your App Store or Google Play account. Cancel anytime in account setting.
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAF9', // Clean off-white background matching mockup
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: wp(6),
//     paddingTop: hp(3),
//     paddingBottom: hp(12), // space for dot pattern and button spacing
//     zIndex: 1, // Ensure scroll content renders above the dot pattern
//   },
//   backBtn: {
//     width: moderateScale(40),
//     height: moderateScale(40),
//     borderRadius: moderateScale(20),
//     backgroundColor: 'rgba(9, 58, 36, 0.08)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: hp(2.5),
//   },
//   headerBlock: {
//     marginBottom: hp(4),
//   },
//   title: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(32),
//     color: '#093A24', // Figma deep forest green
//     marginBottom: hp(1),
//   },
//   subtitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(15),
//     color: '#3B584E',
//   },

//   // Orange Card
//   inactiveCard: {
//     backgroundColor: '#FFE5A3', // Light orange/yellow backing
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(5),
//     paddingVertical: hp(2.2),
//     marginBottom: hp(2.5),
//     borderWidth: 1,
//     borderColor: '#FFD36C',
//     // Shadow
//     shadowColor: '#FFAE00',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   inactiveCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp(1),
//   },
//   inactiveCardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(18),
//     color: '#093A24',
//   },
//   featureRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     paddingRight: wp(6),
//   },
//   checkmark: {
//     fontSize: fontSize(13),
//     color: '#093A24',
//     marginRight: wp(2),
//     marginTop: hp(0.2),
//     fontWeight: 'bold',
//   },
//   inactiveCardText: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: '#093A24',
//     lineHeight: fontSize(16),
//   },

//   // Green Card
//   activeCard: {
//     backgroundColor: '#0A5C36', // Rich deep green matching mockup
//     borderRadius: moderateScale(22),
//     paddingHorizontal: wp(5),
//     paddingVertical: hp(2.6),
//     marginBottom: hp(4),
//     borderWidth: 1.5,
//     borderColor: '#07482A',
//     // Shadow
//     shadowColor: '#0A5C36',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.2,
//     shadowRadius: 15,
//     elevation: 5,
//   },
//   activeCardTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp(1.5),
//   },
//   activeCardTitle: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(20),
//     color: COLORS.white,
//   },
//   bestValueBadge: {
//     backgroundColor: '#BCFF00', // Lime neon badge background
//     borderRadius: moderateScale(10),
//     paddingHorizontal: wp(3),
//     paddingVertical: hp(0.6),
//   },
//   bestValueText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(10),
//     color: '#093A24',
//     letterSpacing: 0.5,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   priceText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(34),
//     color: '#BCFF00', // Lime green price text
//   },
//   pricePeriod: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(14),
//     color: 'rgba(255, 255, 255, 0.75)',
//     marginLeft: wp(1.5),
//   },

//   // Checklist
//   checklist: {
//     marginBottom: hp(4),
//     paddingHorizontal: wp(1),
//   },
//   checkItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: hp(2),
//   },
//   checkIcon: {
//     fontSize: fontSize(14),
//     color: '#2EA200', // vibrant check green
//     marginRight: wp(3),
//     fontWeight: 'bold',
//   },
//   checkText: {
//     fontFamily: FONTS.semiBold,
//     fontSize: fontSize(14.5),
//     color: '#3B584E', // forest grey feature text
//   },

//   subscribeBtn: {
//     marginBottom: hp(2.5),
//   },
//   footerTagline: {
//     fontFamily: FONTS.medium,
//     fontSize: fontSize(12),
//     color: '#1E5A42',
//     textAlign: 'center',
//     lineHeight: fontSize(18),
//     paddingHorizontal: wp(4),
//   },
//   bottomDotPattern: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: hp(20),
//     zIndex: 0, // Rendered behind all content
//   },
// });

// export default ChoosePlanScreen;


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import DotPattern from '../../components/common/DotPattern';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import {
  wp,
  hp,
  fontSize,
  moderateScale,
  SCREEN_WIDTH,
} from '../../utils/responsive';

import { getPlayerSubscriptionApi } from '../../services/playerService';

const FEATURES = [
  'Unlimited tournament and team play',
  'GPS course tracking and live scoring',
  'Achievements, rewards and leaderboards',
];

const ChoosePlanScreen = ({ navigation }) => {
  const [subscription, setSubscription] = React.useState(null);

  // Fetch current player subscription
  React.useEffect(() => {
    getPlayerSubscriptionApi()
      .then((res) => {
        setSubscription(
          res?.subscription ||
          res?.data?.subscription ||
          res
        );
      })
      .catch((err) => {
        console.log('Subscription load note:', err);
      });
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  // Handle Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const backHandlerSubscription =
        BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress
        );

      return () => backHandlerSubscription.remove();
    }, [navigation])
  );

  const handleSubscribe = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <StatusBar
        translucent={false}
        backgroundColor="#F8FAF9"
        barStyle="dark-content"
      />

      {/* Background Dot Pattern */}
      <DotPattern
        width={SCREEN_WIDTH}
        style={styles.bottomDotPattern}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <AuthIcon
            name="chevron-left"
            size={moderateScale(22)}
            color="#093A24"
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>
            Choose your plan
          </Text>

          <Text style={styles.subtitle}>
            Unlock the full UGolf experience
          </Text>
        </View>

        {/* Current Subscription */}
        {subscription ? (
          <Text style={styles.currentPlan}>
            Current: {subscription.plan || 'none'} (
            {subscription.status || 'inactive'})
          </Text>
        ) : null}

        {/* No Active Subscription Card */}
        <View style={styles.inactiveCard}>
          <View style={styles.inactiveCardHeader}>
            <Text style={styles.inactiveCardTitle}>
              No Active Subscription
            </Text>

            <AuthIcon
              name="lock"
              size={20}
              color="#093A24"
            />
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.checkmark}>
              ✓
            </Text>

            <Text style={styles.inactiveCardText}>
              Subscribe to unlock gameplay, tournaments &
              leaderboards
            </Text>
          </View>
        </View>

        {/* Annual Plan Card */}
        <View style={styles.activeCard}>
          <View style={styles.activeCardTop}>
            <Text style={styles.activeCardTitle}>
              Annual
            </Text>

            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>
                BEST VALUE
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              AU$30.00
            </Text>

            <Text style={styles.pricePeriod}>
              /year
            </Text>
          </View>
        </View>

        {/* Feature Checklist */}
        <View style={styles.checklist}>
          {FEATURES.map((feature) => (
            <View
              key={feature}
              style={styles.checkItem}
            >
              <Text style={styles.checkIcon}>
                ✓
              </Text>

              <Text style={styles.checkText}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        <AuthButton
          title="SUBSCRIBE NOW"
          onPress={handleSubscribe}
          style={styles.subscribeBtn}
        />

        {/* Payment Footer */}
        <Text style={styles.footerTagline}>
          Payment charges via your App Store or Google Play
          account. Cancel anytime in account setting.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(12),
    zIndex: 1,
  },

  // Current subscription
  currentPlan: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(12),
    color: COLORS.textMuted,
    marginTop: -hp(2),
    marginBottom: hp(2),
  },

  // Back Button
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(9, 58, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },

  // Header
  headerBlock: {
    marginBottom: hp(4),
  },

  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(32),
    color: '#093A24',
    marginBottom: hp(1),
  },

  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(15),
    color: '#3B584E',
  },

  // Orange Card
  inactiveCard: {
    backgroundColor: '#FFE5A3',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.2),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: '#FFD36C',

    shadowColor: '#FFAE00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },

  inactiveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },

  inactiveCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: wp(6),
  },

  checkmark: {
    fontSize: fontSize(13),
    color: '#093A24',
    marginRight: wp(2),
    marginTop: hp(0.2),
    fontWeight: 'bold',
  },

  inactiveCardText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#093A24',
    lineHeight: fontSize(16),
    flex: 1,
  },

  // Green Card
  activeCard: {
    backgroundColor: '#0A5C36',
    borderRadius: moderateScale(22),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.6),
    marginBottom: hp(4),
    borderWidth: 1.5,
    borderColor: '#07482A',

    shadowColor: '#0A5C36',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },

  activeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },

  activeCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(20),
    color: COLORS.white,
  },

  bestValueBadge: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
  },

  bestValueText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(10),
    color: '#093A24',
    letterSpacing: 0.5,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  priceText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(34),
    color: '#BCFF00',
  },

  pricePeriod: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: 'rgba(255, 255, 255, 0.75)',
    marginLeft: wp(1.5),
  },

  // Checklist
  checklist: {
    marginBottom: hp(4),
    paddingHorizontal: wp(1),
  },

  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },

  checkIcon: {
    fontSize: fontSize(14),
    color: '#2EA200',
    marginRight: wp(3),
    fontWeight: 'bold',
  },

  checkText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(14.5),
    color: '#3B584E',
  },

  // Subscribe Button
  subscribeBtn: {
    marginBottom: hp(2.5),
  },

  // Footer
  footerTagline: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#1E5A42',
    textAlign: 'center',
    lineHeight: fontSize(18),
    paddingHorizontal: wp(4),
  },

  // Bottom Dot Pattern
  bottomDotPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(20),
    zIndex: 0,
  },
});

export default ChoosePlanScreen;