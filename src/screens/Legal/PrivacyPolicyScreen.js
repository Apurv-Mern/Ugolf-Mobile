import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackButton from '../../components/common/BackButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />
      
      {/* Header Container */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} iconColor="#093A24" />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: July 2026</Text>

        <Text style={styles.paragraph}>
          At UGolf, we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share your information when you use our application.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect information you provide directly to us when creating an account, setting up your golfer profile, entering scorecards, or registering for tournaments. This includes your name, email address, profile photo, and golf experience level.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Information</Text>
          <Text style={styles.sectionText}>
            We use the collected information to personalize your profile, track your handicap, display leaderboard standings, keep record of tournament points, and send you email confirmations or support responses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Location Sharing</Text>
          <Text style={styles.sectionText}>
            UGolf may request access to your device location in order to display nearest courses, measure distances on holes, and support tracking functions. You can control location sharing inside your device system settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.sectionText}>
            We utilize industry-standard technical security practices to safeguard user data. However, please remember that no transmission over the internet or mobile network is ever fully secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contact Support</Text>
          <Text style={styles.sectionText}>
            If you have questions about this policy, or want to request account or data removal, please reach out to us at privacy@ugolf.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F0', // Match theme light green backdrop
  },
  header: {
    height: hp(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F0F4F0',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: wp(5),
    top: hp(1.5), // Center align the button vertically inside the custom header height
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24', // Theme Forest Green
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  lastUpdated: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12),
    color: '#718096',
    marginBottom: hp(2),
  },
  paragraph: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(13),
    color: '#3B584E',
    lineHeight: fontSize(18),
    marginBottom: hp(3),
  },
  section: {
    marginBottom: hp(3),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Soft shadow
    shadowColor: '#051A10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: '#093A24',
    marginBottom: hp(1),
  },
  sectionText: {
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    color: '#4A5568',
    lineHeight: fontSize(18),
  },
});

export default PrivacyPolicyScreen;
