import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthIcon from '../../components/common/AuthIcon';
import AuthButton from '../../components/common/AuthButton';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

const FAQ_LIST = [
  {
    id: '1',
    question: 'How do I create a new tournament?',
    answer:
      'Go to the Play tab on the bottom menu, tap "Create Tournament", fill in your tournament details, and configure your games.',
  },
  {
    id: '2',
    question: 'How do I add or edit players in my team?',
    answer:
      'Navigate to Profile > My Teams, tap the edit icon next to your team, and select/unselect your team players.',
  },
  {
    id: '3',
    question: 'How are scores and handicaps calculated?',
    answer:
      'Scores are updated live per hole according to standard USGA net scoring and course handicap ratings.',
  },
  {
    id: '4',
    question: 'How do I manage my subscription plan?',
    answer:
      'Go to Profile > Subscription to view your current tier (Champion) or change your plan details.',
  },
];

const HelpSupportScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onBackPress = React.useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [onBackPress])
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter both subject and message before sending.',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Message Sent!',
      text2: 'Thank you for reaching out. Our support team will reply shortly.',
    });

    setSubject('');
    setMessage('');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@ugolf.com?subject=UGolf%20Support%20Inquiry').catch(() => {
      Toast.show({
        type: 'info',
        text1: 'Support Email',
        text2: 'Reach us at support@ugolf.com',
      });
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>
      </View>

      {/* Title Container */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Help & Support</Text>
        <Text style={styles.subtitle}>Have questions? We are here to assist you 24/7</Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Contact Method Cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport} activeOpacity={0.85}>
            <View style={styles.contactIconCircle}>
              <AuthIcon name="mail" size={moderateScale(20)} color="#093A24" />
            </View>
            <Text style={styles.contactCardTitle}>Email Support</Text>
            <Text style={styles.contactCardSub}>support@ugolf.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() =>
              Toast.show({
                type: 'info',
                text1: 'Live Chat',
                text2: 'Our support representative will connect shortly.',
              })
            }
            activeOpacity={0.85}
          >
            <View style={styles.contactIconCircle}>
              <AuthIcon name="help-circle" size={moderateScale(20)} color="#093A24" />
            </View>
            <Text style={styles.contactCardTitle}>Live Chat</Text>
            <Text style={styles.contactCardSub}>Available 24/7</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <Text style={styles.sectionHeaderTitle}>Frequently Asked Questions</Text>

        {FAQ_LIST.map((faq) => {
          const isExpanded = expandedFaq === faq.id;
          return (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <AuthIcon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={moderateScale(18)}
                  color="#093A24"
                />
              </TouchableOpacity>
              {isExpanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
            </View>
          );
        })}

        {/* Send Us a Message Section */}
        <Text style={styles.sectionHeaderTitle}>Send Us a Message</Text>
        <View style={styles.messageFormCard}>
          <Text style={styles.formLabel}>Subject</Text>
          <View style={styles.formInputWrapper}>
            <TextInput
              style={styles.formInput}
              placeholder="How can we help?"
              placeholderTextColor="#A0AEC0"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <Text style={styles.formLabel}>Message</Text>
          <View style={[styles.formInputWrapper, styles.multilineWrapper]}>
            <TextInput
              style={[styles.formInput, styles.multilineInput]}
              placeholder="Describe your issue or question..."
              placeholderTextColor="#A0AEC0"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
          </View>

          <AuthButton title="SEND MESSAGE" onPress={handleSendMessage} style={{ marginTop: hp(1) }} />
        </View>

        <View style={{ height: hp(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  headerRow: {
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    paddingBottom: hp(1),
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  titleContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  mainTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: '#093A24',
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#718096',
    marginTop: hp(0.4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },

  // Contact Row
  contactRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2.5),
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(20),
    padding: moderateScale(14),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  contactIconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#EFF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  contactCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
  },
  contactCardSub: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#718096',
    marginTop: hp(0.3),
  },

  // Section Headers
  sectionHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: '#093A24',
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },

  // FAQ Card
  faqCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    marginBottom: hp(1.2),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#093A24',
    flex: 1,
    marginRight: wp(2),
  },
  faqAnswer: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(12.5),
    color: '#4A5568',
    marginTop: hp(1),
    lineHeight: fontSize(18),
  },

  // Form Card
  messageFormCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  formLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13),
    color: '#093A24',
    marginBottom: hp(0.6),
    marginTop: hp(0.5),
  },
  formInputWrapper: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(14),
    backgroundColor: '#F8FAF9',
    paddingHorizontal: wp(3.5),
    height: hp(5.8),
    justifyContent: 'center',
    marginBottom: hp(1.5),
  },
  formInput: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: '#093A24',
    padding: 0,
  },
  multilineWrapper: {
    height: hp(12),
    paddingVertical: hp(1),
    justifyContent: 'flex-start',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(25),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  sendBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default HelpSupportScreen;
