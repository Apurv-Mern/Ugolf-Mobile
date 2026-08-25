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

const TermsOfServiceScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      {/* Header Container */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} iconColor="#093A24" />
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: July 2026</Text>

        <Text style={styles.paragraph}>
          Welcome to UGolf. By accessing or using our application, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By creating an account, subscribing to any plans, or utilizing the UGolf application in any way, you confirm that you accept these Terms of Service and agree to abide by them.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of the App</Text>
          <Text style={styles.sectionText}>
            You agree to use UGolf only for lawful purposes related to tracking your golf stats, rounds, and participating in tournament events. Any unauthorized commercial use or modification of application assets is strictly prohibited.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Subscription & Payments</Text>
          <Text style={styles.sectionText}>
            Access to certain premium tracking and tournament participation features may require an active paid subscription plan. Subscriptions will auto-renew unless cancelled at least 24 hours prior to the end of the billing period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Accounts</Text>
          <Text style={styles.sectionText}>
            You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your user account. UGolf reserves the right to terminate accounts that violate our guidelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modifications</Text>
          <Text style={styles.sectionText}>
            We reserve the right to revise or update these terms at any time. Your continued use of the app after changes are published constitutes your acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions or feedback regarding these terms, please contact our support team at support@ugolf.com.
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

export default TermsOfServiceScreen;
