// import { Share, Platform } from 'react-native';
// import Toast from 'react-native-toast-message';

// /**
//  * Shares the tournament join URL externally via OS native share sheet.
//  * Uses joinUrl if provided by backend, or constructs joinUrl using joinToken.
//  */
// export const shareTournamentLink = async (tournament) => {
//   if (!tournament) {
//     Toast.show({
//       type: 'error',
//       text1: 'Share Failed',
//       text2: 'Tournament details not available.',
//     });
//     return;
//   }

//   const appDeepLink =
//     tournament.joinDeepLink ||
//     (tournament.joinToken
//       ? `ugolf://join?token=${tournament.joinToken}`
//       : `ugolf://tournaments/${tournament.id || tournament._id}`);

//   const joinUrl =
//     tournament.joinUrl ||
//     (tournament.joinToken
//       ? `https://ugolf-frontend.24livehost.com/join?token=${tournament.joinToken}`
//       : null) ||
//     `https://ugolf-frontend.24livehost.com/tournaments/${tournament.id || tournament._id}`;

//   const name = tournament.name || tournament.title || 'Golf Tournament';
//   const shareMessage = `Join my tournament "${name}" on Universal Golf!\n\n📲 Open in Universal Golf App:\n${appDeepLink}\n\n🌐 Web Link:\n${joinUrl}`;

//   try {
//     await Share.share(
//       Platform.OS === 'ios'
//         ? { title: `Join ${name} on Universal Golf`, message: shareMessage, url: appDeepLink }
//         : { title: `Join ${name} on Universal Golf`, message: shareMessage }
//     );
//   } catch (error) {
//     console.log('Error sharing tournament link:', error);
//     Toast.show({
//       type: 'error',
//       text1: 'Share Failed',
//       text2: error?.message || 'Could not open share menu.',
//     });
//   }
// };



import { Share } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Shares a tournament invitation using its HTTPS join URL.
 * Prefers the URL returned by the backend.
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

  const tournamentId = tournament.id || tournament._id;
  const joinToken = tournament.joinToken;

  // Prefer the complete HTTPS URL returned by the backend.
  // If unavailable, construct a fallback URL using the available data.
  let joinUrl = tournament.joinUrl;

  if (!joinUrl && tournamentId && joinToken) {
    joinUrl =
      `https://ugolf-frontend.24livehost.com/join` +
      `?tournamentId=${encodeURIComponent(tournamentId)}` +
      `&token=${encodeURIComponent(joinToken)}`;
  }

  if (!joinUrl && tournamentId) {
    joinUrl =
      `https://ugolf-frontend.24livehost.com/tournaments/` +
      encodeURIComponent(tournamentId);
  }

  if (!joinUrl) {
    Toast.show({
      type: 'error',
      text1: 'Share Failed',
      text2: 'Tournament invitation link is unavailable.',
    });
    return;
  }

  const name = tournament.name || tournament.title || 'Golf Tournament';

  const shareMessage =
    `Join my tournament "${name}" on Universal Golf!\n\n${joinUrl}`;

  try {
    await Share.share({
      title: `Join ${name} on Universal Golf`,
      message: shareMessage,
    });
  } catch (error) {
    console.log('Error sharing tournament link:', error);

    Toast.show({
      type: 'error',
      text1: 'Share Failed',
      text2: error?.message || 'Could not open share menu.',
    });
  }
};
