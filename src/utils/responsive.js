import { Dimensions, PixelRatio, Platform } from 'react-native';

// Base design dimensions (iPhone 14 / standard design)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Width percentage — converts a design percentage to actual device width.
 * @param {number} widthPercent - percentage of screen width (0-100)
 * @returns {number} calculated width in dp
 */
export const wp = (widthPercent) => {
  return PixelRatio.roundToNearestPixel(
    (SCREEN_WIDTH * widthPercent) / 100,
  );
};

/**
 * Height percentage — converts a design percentage to actual device height.
 * @param {number} heightPercent - percentage of screen height (0-100)
 * @returns {number} calculated height in dp
 */
export const hp = (heightPercent) => {
  return PixelRatio.roundToNearestPixel(
    (SCREEN_HEIGHT * heightPercent) / 100,
  );
};

/**
 * Responsive font size — scales font size based on screen width ratio.
 * @param {number} size - base font size (designed at 375px width)
 * @returns {number} scaled font size
 */
export const fontSize = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Responsive scaling based on design width.
 * @param {number} size - size in the base design (375px)
 * @returns {number} scaled size
 */
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Responsive vertical scaling based on design height.
 * @param {number} size - size in the base design (812px)
 * @returns {number} scaled size
 */
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scaling — less aggressive than linear scaling.
 * @param {number} size - base size
 * @param {number} factor - scaling factor (0-1, default 0.5)
 * @returns {number} moderately scaled size
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Export screen dimensions for convenience
export { SCREEN_WIDTH, SCREEN_HEIGHT };
