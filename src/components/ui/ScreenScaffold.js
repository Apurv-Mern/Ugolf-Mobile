import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DotPattern from '../common/DotPattern';
import { COLORS } from '../../theme/colors';
import { SCREEN_WIDTH } from '../../utils/responsive';

/**
 * Light-theme page shell matching Figma screens (#F7F8F5 + optional dot footer).
 */
const ScreenScaffold = ({
  children,
  style,
  contentStyle,
  edges = ['bottom'],
  showDots = true,
  dotsColor = COLORS.dotPattern,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      <View style={[styles.content, contentStyle]}>{children}</View>
      {showDots ? (
        <DotPattern width={SCREEN_WIDTH} color={dotsColor} style={styles.dots} />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  dots: {
    zIndex: 0,
  },
});

export default ScreenScaffold;
