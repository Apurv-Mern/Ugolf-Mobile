import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

import AuthIcon from './AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

/**
 * Reusable auth input component with left icon and optional password toggle.
 *
 * @param {string} iconName - Feather icon name for left icon
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChangeText - Text change handler
 * @param {boolean} isPassword - Whether to enable secure text entry + toggle
 * @param {string} keyboardType - Keyboard type
 * @param {boolean} lightTheme - Use light theme variant (for Reset Password)
 * @param {object} style - Additional container styles
 * @param {string} autoCapitalize - Auto-capitalize setting
 */
const AuthInput = ({
  iconName = 'mail',
  placeholder = '',
  value = '',
  onChangeText = () => {},
  isPassword = false,
  keyboardType = 'default',
  lightTheme = true, // default to true since all mockups are light
  style = {},
  autoCapitalize = 'none',
  ...rest
}) => {
  const [secureText, setSecureText] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    isFocused ? styles.containerFocused : styles.containerNormal,
    style,
  ];

  const iconColor = isFocused
    ? COLORS.primaryDark // Darker green for readability on white bg
    : '#888888';

  const inputTextColor = COLORS.textDarkTitle;
  const placeholderColor = '#999999';

  return (
    <View style={containerStyle}>
      <AuthIcon
        name={iconName}
        size={moderateScale(18)}
        color={iconColor}
        style={styles.leftIcon}
      />
      <TextInput
        style={[
          styles.input,
          { color: inputTextColor },
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setSecureText(!secureText)}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          <AuthIcon
            name={secureText ? 'eye-off' : 'eye'}
            size={moderateScale(18)}
            color={iconColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(4),
    height: hp(6.2),
    marginBottom: hp(1.8),
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    // Soft shadow/elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  containerNormal: {
    borderColor: '#E2E8F0', // light grey border
  },
  containerFocused: {
    borderColor: '#4CAF50', // green focus border matching figma accent
  },
  leftIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    paddingVertical: 0,
    height: '100%',
  },
  eyeButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
});

export default AuthInput;
