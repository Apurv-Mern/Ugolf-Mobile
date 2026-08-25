// import React from 'react';
// import {
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';

// import { COLORS } from '../../theme/colors';
// import { FONTS } from '../../theme/fonts';
// import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

// /**
//  * Reusable green action button used across auth screens.
//  *
//  * @param {string} title - Button label text
//  * @param {function} onPress - Press handler
//  * @param {boolean} loading - Show loading spinner
//  * @param {boolean} disabled - Disable the button
//  * @param {object} style - Additional container styles
//  * @param {object} textStyle - Additional text styles
//  */
// const AuthButton = ({
//   title = 'CONTINUE',
//   onPress = () => {},
//   loading = false,
//   disabled = false,
//   style = {},
//   textStyle = {},
// }) => {
//   return (
//     <TouchableOpacity
//       style={[
//         styles.button,
//         disabled && styles.buttonDisabled,
//         style,
//       ]}
//       onPress={onPress}
//       activeOpacity={0.85}
//       disabled={disabled || loading}
//     >
//       {loading ? (
//         <ActivityIndicator
//           color={COLORS.buttonText}
//           size="small"
//         />
//       ) : (
//         <Text style={[styles.buttonText, textStyle]}>
//           {title}
//         </Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: '#BCFF00', // Figma neon green
//     borderRadius: moderateScale(30), // Fully rounded capsule shape
//     paddingVertical: hp(1.6),
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     // Drop shadow matching Figma: X:0, Y:12, Blur:30, Spread:0, Color: #C7FF2B at 40%
//     shadowColor: '#C7FF2B',
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.4,
//     shadowRadius: 15, // Blur 30 translates roughly to shadowRadius 15 in iOS
//     elevation: 12,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     fontFamily: FONTS.bold,
//     fontSize: fontSize(15),
//     color: '#093A24', // Figma dark green text
//     letterSpacing: 2,
//   },
// });

// export default AuthButton;


import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

import { FONTS } from '../../theme/fonts';
import { hp, fontSize, moderateScale } from '../../utils/responsive';

const AuthButton = ({
  title = 'CONTINUE',
  onPress = () => { },
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
}) => {
  return (
    <TouchableOpacity
      style={[styles.wrapper, disabled && styles.buttonDisabled, style]}
      activeOpacity={0.9}
      disabled={disabled || loading}
      onPress={onPress}
    >
      <View style={styles.button}>
        {/* Fake top highlight */}
        <View style={styles.highlight} />

        {/* Fake bottom inner shadow */}
        <View style={styles.bottomShadow} />

        {loading ? (
          <ActivityIndicator color="#093A24" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',

    shadowColor: '#BCFF00',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  button: {
    height: hp(6.6),
    borderRadius: moderateScale(32),

    backgroundColor: '#BCFF00',

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#9AD400',
  },

  highlight: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 6,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 5,

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    backgroundColor: 'rgba(88,120,0,0.28)',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(20),
    color: '#093A24',
    letterSpacing: 1.5,
  },
});

export default AuthButton;