import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

/**
 * Global React Error Boundary component.
 * Prevents unhandled JavaScript crashes from killing the native app process on iOS & Android.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('--- GLOBAL ERROR BOUNDARY CAUGHT AN EXCEPTION ---');
    console.log('Error:', error);
    console.log('ErrorInfo:', errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#093A24" />
          <View style={styles.card}>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected display issue occurred. Tap below to reload the screen safely.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>RELOAD APP</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#093A24',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(188, 255, 0, 0.3)',
    width: '100%',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(22),
    color: '#BCFF00',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: fontSize(19),
    marginBottom: hp(3.5),
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(30),
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(15),
    color: '#093A24',
    letterSpacing: 1.5,
  },
});

export default ErrorBoundary;
