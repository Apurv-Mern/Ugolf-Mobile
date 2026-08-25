import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WaveDivider = () => {
  // Wave path matching the Figma design: 
  // starts higher on the left, curves down smoothly, then rises towards the right
  // We use viewBox="0 0 375 80" for styling precision
  return (
    <View style={styles.container}>
      <Svg
        width={SCREEN_WIDTH}
        height={85}
        viewBox="0 0 375 85"
        preserveAspectRatio="none"
      >
        {/* Solid white shape */}
        <Path
          d="M-10,35 C90,65 240,-5 390,35 L390,85 L-10,85 Z"
          fill={COLORS.white}
        />
        {/* Glow/highlight curve line */}
        <Path
          d="M-10,35 C90,65 240,-5 390,35"
          fill="none"
          stroke={COLORS.primary}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    backgroundColor: 'transparent',
    marginTop: -80, // Overlap the bottom of the ImageBackground
    zIndex: 10,
  },
});

export default WaveDivider;
