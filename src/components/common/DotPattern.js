import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DotPattern = ({ width, style, color }) => {
  const containerWidth = width || SCREEN_WIDTH;
  const cols = 20;
  const rows = 9;
  const spacing = 22;
  const radius = 5.5;

  const dots = [];

  for (let r = 0; r < rows; r++) {
    // Fade out opacity as we go up
    const rowOpacity = (r + 1) / rows * 0.95;

    for (let c = 0; c < cols; c++) {
      // Fade out opacity towards the left and right edges
      const colDistFromCenter = Math.abs(c - cols / 2) / (cols / 2);
      const colOpacity = 1 - colDistFromCenter;

      const finalOpacity = rowOpacity * colOpacity;

      if (finalOpacity > 0.01) {
        dots.push(
          <Circle
            key={`${r}-${c}`}
            cx={c * spacing + (containerWidth - cols * spacing) / 2 + spacing / 2}
            cy={r * spacing + 10}
            r={radius}
            fill={color || "#E3FBDF"}
            opacity={finalOpacity}
          />
        );
      }
    }
  }

  return (
    <View style={[styles.container, style, width ? { width, left: undefined, right: undefined } : {}]} pointerEvents="none">
      <Svg width={containerWidth} height={rows * spacing + 20}>
        {dots}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default DotPattern;
