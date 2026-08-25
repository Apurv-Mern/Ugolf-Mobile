import { Share, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Shares the tournament join URL externally via OS native share sheet.
 * Uses joinUrl if provided by backend, or constructs joinUrl using joinToken.
 */
export const shareTournamentLink = async (tournament) => {
  if (!tournament) {
    Toast.show({
      type: 'error',
      text1: 'Share Failed',
      text2: 'Tournament details not available.',
    });
    return;
  }

  const appDeepLink =
    tournament.joinDeepLink ||
    (tournament.joinToken
      ? `ugolf://join?token=${tournament.joinToken}`
      : `ugolf://tournaments/${tournament.id || tournament._id}`);

  const joinUrl =
    tournament.joinUrl ||
    (tournament.joinToken
      ? `https://ugolf-frontend.24livehost.com/join?token=${tournament.joinToken}`
      : null) ||
    `https://ugolf-frontend.24livehost.com/tournaments/${tournament.id || tournament._id}`;

  const name = tournament.name || tournament.title || 'Golf Tournament';
  const shareMessage = `Join my tournament "${name}" on UGolf!\n\n📲 Open in UGolf App:\n${appDeepLink}\n\n🌐 Web Link:\n${joinUrl}`;

  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { title: `Join ${name} on UGolf`, message: shareMessage, url: appDeepLink }
        : { title: `Join ${name} on UGolf`, message: shareMessage }
    );

    if (result.action === Share.sharedAction) {
      Toast.show({
        type: 'success',
        text1: 'Link Shared',
        text2: 'Tournament join link shared successfully!',
      });
    }
  } catch (error) {
    console.log('Error sharing tournament link:', error);
    Toast.show({
      type: 'error',
      text1: 'Share Failed',
      text2: error?.message || 'Could not open share menu.',
    });
  }
};
