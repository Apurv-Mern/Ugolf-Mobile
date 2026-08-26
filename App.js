/**
 * UGolf App
 * Main entry point with Navigation
 */

import React, { useEffect } from 'react';
import './src/api/interceptor';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { navigationRef } from './src/navigation/RootNavigator';
import { setupDeepLinkListener } from './src/utils/deepLinkHandler';
import SplashScreen from './src/screens/Splash/SplashScreen';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import ProfileSetupScreen from './src/screens/Profile/ProfileSetupScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import SelectPlayOptionScreen from './src/screens/Play/SelectPlayOptionScreen';
import SelectTeamSizeScreen from './src/screens/Play/SelectTeamSizeScreen';
import SelectTournamentScreen from './src/screens/Play/SelectTournamentScreen';
import CreateTournamentScreen from './src/screens/Play/CreateTournamentScreen';
import ConfigureGamesScreen from './src/screens/Play/ConfigureGamesScreen';
import SelectTeamScreen from './src/screens/Play/SelectTeamScreen';
import CreateTeamScreen from './src/screens/Play/CreateTeamScreen';
import InviteOtherTeamsScreen from './src/screens/Play/InviteOtherTeamsScreen';
import SelectPlayerPositionScreen from './src/screens/Play/SelectPlayerPositionScreen';
import SelectGameScreen from './src/screens/Play/SelectGameScreen';
import GameRulesScreen from './src/screens/Play/GameRulesScreen';
import EditPlayersScreen from './src/screens/Play/EditPlayersScreen';
import NotificationsScreen from './src/screens/Notification/NotificationsScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import AddPlayersScreen from './src/screens/Play/AddPlayersScreen';
import TournamentHistoryScreen from './src/screens/Profile/TournamentHistoryScreen';
import CompletedTournamentGamesScreen from './src/screens/Profile/CompletedTournamentGamesScreen';
import InProgressGamesScreen from './src/screens/Play/InProgressGamesScreen';
import YourTeamScreen from './src/screens/Profile/YourTeamScreen';
import ChoosePlanScreen from './src/screens/Subscription/ChoosePlanScreen';
import PrivacyPolicyScreen from './src/screens/Legal/PrivacyPolicyScreen';
import ChangePasswordScreen from './src/screens/Profile/ChangePasswordScreen';
import HelpSupportScreen from './src/screens/Profile/HelpSupportScreen';
import ActiveGameScreen from './src/screens/Play/ActiveGameScreen';
import LeaderboardScreen from './src/screens/Play/LeaderboardScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

const linking = {
  prefixes: [
    'https://ugolf-frontend.24livehost.com',
    'http://ugolf-frontend.24livehost.com',
    'ugolf://',
  ],
  config: {
    screens: {
      ConfigureGames: {
        path: 'tournaments/:tournamentId',
      },
    },
  },
};

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      style={{
        borderLeftColor: '#BCFF00',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
      }}
      text1Style={{
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#093A24',
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#4A5568',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      style={{
        borderLeftColor: '#FE5F55',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
      }}
      text1Style={{
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#093A24',
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#4A5568',
      }}
    />
  ),
};

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    const unsubscribe = setupDeepLinkListener();
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
            {/* ProfileSetup is accessible from within AuthNavigator (ChoosePlan → ProfileSetup) */}
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{ animation: 'slide_from_right' }}
            />
            {/* MainApp is the Home screen — accessible from Login and ProfileSetup */}
            <Stack.Screen
              name="MainApp"
              component={HomeScreen}
              options={{ animation: 'slide_from_right' }}
            />
            {/* Play/Tournament stack screens */}
            <Stack.Screen
              name="SelectPlayOption"
              component={SelectPlayOptionScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SelectTeamSize"
              component={SelectTeamSizeScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SelectTournament"
              component={SelectTournamentScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CreateTournament"
              component={CreateTournamentScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ConfigureGames"
              component={ConfigureGamesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SelectTeam"
              component={SelectTeamScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CreateTeam"
              component={CreateTeamScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="InviteOtherTeams"
              component={InviteOtherTeamsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="InvitePlayers"
              component={InviteOtherTeamsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SelectPlayerPosition"
              component={SelectPlayerPositionScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SelectGame"
              component={SelectGameScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="GameRules"
              component={GameRulesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="EditPlayers"
              component={EditPlayersScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AddPlayers"
              component={AddPlayersScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="TournamentHistory"
              component={TournamentHistoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CompletedTournamentGames"
              component={CompletedTournamentGamesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="InProgressGames"
              component={InProgressGamesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="YourTeam"
              component={YourTeamScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ChoosePlan"
              component={ChoosePlanScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ActiveGame"
              component={ActiveGameScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;