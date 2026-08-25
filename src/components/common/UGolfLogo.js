import React from 'react';
import { Image } from 'react-native';

/**
 * UGolf Logo - Loaded from Logo.png
 * @param {number} size - size of the logo
 */
const UGolfLogo = ({ size = 260, width, height, style }) => {
  const imageWidth = width || size;
  const imageHeight = height || size * 0.5; // aspect ratio matching Logo.png
  return (
    <Image
      source={require('../../assets/Images/Logo.png')}
      style={[{ width: imageWidth, height: imageHeight }, style]}
      resizeMode="contain"
    />
  );
};

export default UGolfLogo;
