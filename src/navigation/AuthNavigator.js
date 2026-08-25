import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Login/LoginScreen';
import SignUpScreen from '../screens/SignUp/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerification/EmailVerificationScreen';
import SuccessScreen from '../screens/SignUp/SuccessScreen';
import ChoosePlanScreen from '../screens/Subscription/ChoosePlanScreen';
import TermsOfServiceScreen from '../screens/Legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
      />
      <Stack.Screen
        name="ChoosePlan"
        component={ChoosePlanScreen}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;