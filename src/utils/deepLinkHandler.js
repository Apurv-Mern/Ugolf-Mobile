import { Linking } from 'react-native';
import { navigate } from '../navigation/RootNavigator';
import { getTournamentByIdApi, getTournamentsApi } from '../services/homeService';
import { store } from '../redux/store';
import { isShotgunTournamentItem, openShotgunTournament } from './shotgunNavigation';

/**
 * Extracts tournament ID from a URL string or notification data object.
 * Handles:
 * - https://ugolf-frontend.24livehost.com/tournaments/d49cfc7e-e1bb-450f-b7cb-949db2187941
 * - ugolf://tournaments/d49cfc7e-e1bb-450f-b7cb-949db2187941
 * - { tournamentId: "...", deepLink: "..." }
 */
export const extractTournamentIdFromUrl = (urlOrData) => {
  if (!urlOrData) return null;

  if (typeof urlOrData === 'object') {
    if (urlOrData.tournamentId) return String(urlOrData.tournamentId);
    if (urlOrData.joinToken) return String(urlOrData.joinToken);
    if (urlOrData.deepLink) return extractTournamentIdFromUrl(urlOrData.deepLink);
    if (urlOrData.joinUrl) return extractTournamentIdFromUrl(urlOrData.joinUrl);
    return null;
  }

  if (typeof urlOrData === 'string') {
    const match =
      urlOrData.match(/\/tournaments\/([a-zA-Z0-9-]+)/) ||
      urlOrData.match(/[?&]tournamentId=([a-zA-Z0-9-]+)/) ||
      urlOrData.match(/[?&]token=([a-zA-Z0-9-]+)/) ||
      urlOrData.match(/\/join\/([a-zA-Z0-9-]+)/) ||
      urlOrData.match(/[?&]id=([a-zA-Z0-9-]+)/);

    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

function getCurrentUserIdFromStore() {
  const u = store.getState()?.auth?.user;
  return u?.id || u?._id || u?.userId || null;
}

function navigationAdapter(navigationOverride) {
  if (navigationOverride && typeof navigationOverride.navigate === 'function') {
    return navigationOverride;
  }
  return { navigate };
}

/**
 * Processes a deep link URL or notification payload and navigates into tournament setup/play.
 */
export const processDeepLink = async (urlOrData, navigationOverride = null) => {
  const targetIdOrToken = extractTournamentIdFromUrl(urlOrData);
  if (!targetIdOrToken) return false;

  console.log('[DeepLink] Processing deep link for target:', targetIdOrToken);

  const getPlayMode = (raw) => {
    if (typeof raw === 'object' && raw) {
      const pm = raw.playMode || raw.mode;
      if (pm) return String(pm).toLowerCase();
    }
    return 'challenge';
  };

  try {
    let tournament = null;

    // Try fetching by ID directly
    try {
      const res = await getTournamentByIdApi(targetIdOrToken);
      tournament = res?.tournament || res?.data?.tournament || res?.data || res;
    } catch (e) {
      console.log('[DeepLink] Direct ID fetch failed, searching tournaments list by joinToken...');
    }

    const [joinableRes, invitedRes, mineRes] = await Promise.all([
      getTournamentsApi({ page: 1, limit: 50, scope: 'joinable' }).catch(() => null),
      getTournamentsApi({ page: 1, limit: 50, scope: 'invited' }).catch(() => null),
      getTournamentsApi({ page: 1, limit: 50, scope: 'mine' }).catch(() => null),
    ]);
    const invitedList =
      invitedRes?.tournaments || invitedRes?.data?.tournaments || (Array.isArray(invitedRes) ? invitedRes : []);
    const mineList =
      mineRes?.tournaments || mineRes?.data?.tournaments || (Array.isArray(mineRes) ? mineRes : []);

    // If direct ID fetch failed, search candidate tournaments for matching joinToken or ID
    if (!tournament || (!tournament.id && !tournament._id)) {
      const list = [joinableRes, invitedRes, mineRes].flatMap((listRes) =>
        listRes?.tournaments || listRes?.data?.tournaments || (Array.isArray(listRes) ? listRes : []),
      );
      const matched = list.find(
        (t) =>
          String(t.joinToken) === String(targetIdOrToken) ||
          String(t.id || t._id) === String(targetIdOrToken)
      );
      if (matched) tournament = matched;
    }

    const tournamentId = tournament?.id || tournament?._id || targetIdOrToken;
    const playMode =
      getPlayMode(urlOrData) ||
      (tournament?.playMode ? String(tournament.playMode).toLowerCase() : 'challenge');
    const tournamentName =
      tournament?.name ||
      tournament?.title ||
      (typeof urlOrData === 'object' ? urlOrData?.tournamentName : 'Tournament');

    const isInvited = (Array.isArray(invitedList) ? invitedList : []).some(
      (t) => String(t.id || t._id) === String(tournamentId),
    );
    const isMine = (Array.isArray(mineList) ? mineList : []).some(
      (t) => String(t.id || t._id) === String(tournamentId),
    );

    const payloadFormat =
      typeof urlOrData === 'object' ? urlOrData.tournamentFormat || urlOrData.format : null;

    const navParams = {
      tournament: {
        ...(tournament || {}),
        id: tournamentId,
        name: tournamentName,
        title: tournamentName,
        ...(payloadFormat ? { tournamentFormat: payloadFormat } : {}),
      },
      playMode,
      isCreator: isMine && !isInvited,
    };

    const nav = navigationAdapter(navigationOverride);
    const listItem = {
      tournament: navParams.tournament,
      source: isInvited ? 'invited' : isMine ? 'mine' : undefined,
      isMine: isMine && !isInvited,
    };

    if (isShotgunTournamentItem(listItem)) {
      const afterInviteAccept =
        typeof urlOrData === 'object' && urlOrData.afterTournamentInviteAccept === true;
      await openShotgunTournament(nav, listItem, {
        currentUserId: getCurrentUserIdFromStore(),
        playMode,
        forceTeamSelection: afterInviteAccept,
        preselectedTeamId:
          typeof urlOrData === 'object' ? urlOrData.teamId || null : null,
      });
      return true;
    }

    const screen = isInvited || !isMine ? 'SelectGame' : 'ConfigureGames';
    nav.navigate(screen, navParams);
    return true;
  } catch (err) {
    console.log('[DeepLink] Error processing deep link, using fallback navParams:', err);
    const tournamentName =
      typeof urlOrData === 'object' ? urlOrData?.tournamentName || 'Tournament' : 'Tournament';
    const payloadFormat =
      typeof urlOrData === 'object' ? urlOrData.tournamentFormat || urlOrData.format : null;

    const navParams = {
      tournament: {
        id: targetIdOrToken,
        name: tournamentName,
        title: tournamentName,
        ...(payloadFormat ? { tournamentFormat: payloadFormat } : {}),
      },
      playMode: getPlayMode(urlOrData),
      isCreator: false,
    };

    const nav = navigationAdapter(navigationOverride);
    const listItem = {
      tournament: navParams.tournament,
      source: 'invited',
    };

    if (isShotgunTournamentItem(listItem)) {
      const afterInviteAccept =
        typeof urlOrData === 'object' && urlOrData.afterTournamentInviteAccept === true;
      await openShotgunTournament(nav, listItem, {
        currentUserId: getCurrentUserIdFromStore(),
        playMode: navParams.playMode,
        forceTeamSelection: afterInviteAccept,
        preselectedTeamId:
          typeof urlOrData === 'object' ? urlOrData.teamId || null : null,
      });
      return true;
    }

    nav.navigate('SelectGame', navParams);
    return true;
  }
};

/**
 * Sets up global deep link listeners for app launch and runtime URLs
 */
export const setupDeepLinkListener = () => {
  Linking.getInitialURL()
    .then((url) => {
      if (url) {
        console.log('[DeepLink] Cold launch URL detected:', url);
        processDeepLink(url);
      }
    })
    .catch((err) => console.log('[DeepLink] Error getting initial URL:', err));

  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      console.log('[DeepLink] Runtime URL event detected:', url);
      processDeepLink(url);
    }
  });

  return () => {
    subscription.remove();
  };
};
