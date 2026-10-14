// import { Linking } from 'react-native';
// import { navigate } from '../navigation/RootNavigator';
// import { getTournamentByIdApi, getTournamentsApi } from '../services/homeService';

// /**
//  * Extracts tournament ID from a URL string or notification data object.
//  * Handles:
//  * - https://ugolf-frontend.24livehost.com/tournaments/d49cfc7e-e1bb-450f-b7cb-949db2187941
//  * - ugolf://tournaments/d49cfc7e-e1bb-450f-b7cb-949db2187941
//  * - { tournamentId: "...", deepLink: "..." }
//  */
// export const extractTournamentIdFromUrl = (urlOrData) => {
//   if (!urlOrData) return null;

//   if (typeof urlOrData === 'object') {
//     if (urlOrData.tournamentId) return String(urlOrData.tournamentId);
//     if (urlOrData.joinToken) return String(urlOrData.joinToken);
//     if (urlOrData.deepLink) return extractTournamentIdFromUrl(urlOrData.deepLink);
//     if (urlOrData.joinUrl) return extractTournamentIdFromUrl(urlOrData.joinUrl);
//     return null;
//   }

//   if (typeof urlOrData === 'string') {
//     const match =
//       urlOrData.match(/\/tournaments?\/([a-zA-Z0-9-]+)/) ||
//       urlOrData.match(/[?&]tournamentId=([a-zA-Z0-9-]+)/) ||
//       urlOrData.match(/[?&]token=([a-zA-Z0-9-]+)/) ||
//       urlOrData.match(/\/join\/([a-zA-Z0-9-]+)/) ||
//       urlOrData.match(/[?&]id=([a-zA-Z0-9-]+)/);

//     if (match && match[1]) {
//       return match[1];
//     }
//   }

//   return null;
// };

// /**
//  * Processes a deep link URL or notification payload and navigates directly to ConfigureGames
//  */
// export const processDeepLink = async (urlOrData, navigationOverride = null) => {
//   const targetIdOrToken = extractTournamentIdFromUrl(urlOrData);
//   if (!targetIdOrToken) return false;

//   console.log('[DeepLink] Processing deep link for target:', targetIdOrToken);

//   const getPlayMode = (raw) => {
//     if (typeof raw === 'object' && raw) {
//       const pm = raw.playMode || raw.mode;
//       if (pm) return String(pm).toLowerCase();
//     }
//     return 'challenge';
//   };

//   try {
//     let tournament = null;

//     // Try fetching by ID directly
//     try {
//       const res = await getTournamentByIdApi(targetIdOrToken);
//       tournament = res?.tournament || res?.data?.tournament || res?.data || res;
//     } catch (e) {
//       console.log('[DeepLink] Direct ID fetch failed, searching tournaments list by joinToken...');
//     }

//     const [joinableRes, invitedRes, mineRes] = await Promise.all([
//       getTournamentsApi({ page: 1, limit: 50, scope: 'joinable' }).catch(() => null),
//       getTournamentsApi({ page: 1, limit: 50, scope: 'invited' }).catch(() => null),
//       getTournamentsApi({ page: 1, limit: 50, scope: 'mine' }).catch(() => null),
//     ]);
//     const invitedList =
//       invitedRes?.tournaments || invitedRes?.data?.tournaments || (Array.isArray(invitedRes) ? invitedRes : []);
//     const mineList =
//       mineRes?.tournaments || mineRes?.data?.tournaments || (Array.isArray(mineRes) ? mineRes : []);

//     // If direct ID fetch failed, search candidate tournaments for matching joinToken or ID
//     if (!tournament || (!tournament.id && !tournament._id)) {
//       const list = [joinableRes, invitedRes, mineRes].flatMap((listRes) =>
//         listRes?.tournaments || listRes?.data?.tournaments || (Array.isArray(listRes) ? listRes : []),
//       );
//       const matched = list.find(
//         (t) =>
//           String(t.joinToken) === String(targetIdOrToken) ||
//           String(t.id || t._id) === String(targetIdOrToken)
//       );
//       if (matched) tournament = matched;
//     }

//     const tournamentId = tournament?.id || tournament?._id || targetIdOrToken;
//     const playMode =
//       getPlayMode(urlOrData) ||
//       (tournament?.playMode ? String(tournament.playMode).toLowerCase() : 'challenge');
//     const tournamentName =
//       tournament?.name ||
//       tournament?.title ||
//       (typeof urlOrData === 'object' ? urlOrData?.tournamentName : 'Tournament');

//     const isInvited = (Array.isArray(invitedList) ? invitedList : []).some(
//       (t) => String(t.id || t._id) === String(tournamentId),
//     );
//     const isMine = (Array.isArray(mineList) ? mineList : []).some(
//       (t) => String(t.id || t._id) === String(tournamentId),
//     );

//     const navParams = {
//       tournament: {
//         ...(tournament || {}),
//         id: tournamentId,
//         name: tournamentName,
//         title: tournamentName,
//       },
//       playMode,
//       isCreator: isMine && !isInvited,
//     };

//     const screen = isInvited || !isMine ? 'SelectGame' : 'ConfigureGames';
//     if (navigationOverride && typeof navigationOverride.navigate === 'function') {
//       navigationOverride.navigate(screen, navParams);
//     } else {
//       navigate(screen, navParams);
//     }
//     return true;
//   } catch (err) {
//     console.log('[DeepLink] Error processing deep link, using fallback navParams:', err);
//     const tournamentName =
//       typeof urlOrData === 'object' ? urlOrData?.tournamentName || 'Tournament' : 'Tournament';
//     const navParams = {
//       tournament: {
//         id: targetIdOrToken,
//         name: tournamentName,
//         title: tournamentName,
//       },
//       playMode: getPlayMode(urlOrData),
//       isCreator: false,
//     };

//     if (navigationOverride && typeof navigationOverride.navigate === 'function') {
//       navigationOverride.navigate('SelectGame', navParams);
//     } else {
//       navigate('SelectGame', navParams);
//     }
//     return true;
//   }
// };

// /**
//  * Sets up global deep link listeners for app launch and runtime URLs
//  */
// export const setupDeepLinkListener = () => {
//   Linking.getInitialURL()
//     .then((url) => {
//       if (url) {
//         console.log('[DeepLink] Cold launch URL detected:', url);
//         processDeepLink(url);
//       }
//     })
//     .catch((err) => console.log('[DeepLink] Error getting initial URL:', err));

//   const subscription = Linking.addEventListener('url', ({ url }) => {
//     if (url) {
//       console.log('[DeepLink] Runtime URL event detected:', url);
//       processDeepLink(url);
//     }
//   });

//   return () => {
//     subscription.remove();
//   };
// };

import { Linking } from "react-native";
import { navigate } from "../navigation/RootNavigator";
import {
  getTournamentByIdApi,
  getTournamentsApi,
  prepareShareLinkJoinApi,
} from "../services/homeService";
import { store } from "../redux/store";
import {
  isShotgunTournamentItem,
  openShotgunTournament,
} from "./shotgunNavigation";

/**
 * Safely decode URL query values.
 */
const decodeValue = (value) => {
  if (!value) return null;

  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
};

function getCurrentUserIdFromStore() {
  const u = store.getState()?.auth?.user;
  return u?.id || u?._id || u?.userId || null;
}

function navigationAdapter(navigationOverride) {
  if (navigationOverride && typeof navigationOverride.navigate === "function") {
    return navigationOverride;
  }
  return { navigate };
}

/**
 * Processes a deep link URL or notification payload and navigates into tournament setup/play.
 */
const getQueryParam = (url, name) => {
  if (typeof url !== "string") return null;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = url.match(new RegExp(`[?&]${escapedName}=([^&#] *)`, "i"));

  return match ? decodeValue(match[1]) : null;
};

/**
 * Extract tournament ID, invitation token and optional team details.
 *
 * Supports:
 * https://ugolf-frontend.24livehost.com/join?tournamentId=UUID&token=TOKEN
 * https://ugolf-frontend.24livehost.com/tournaments/UUID
 * ugolf://tournaments/UUID
 * Notification objects containing tournamentId, joinToken or deepLink.
 */
export const extractParamsFromUrl = (urlOrData) => {
  const params = {
    tournamentId: null,
    token: null,
    teamId: null,
    teamName: null,
    playMode: null,
    tournamentName: null,
    linkType: null,
  };

  if (!urlOrData) return params;

  if (typeof urlOrData === "object") {
    params.tournamentId =
      urlOrData.tournamentId ||
      urlOrData.tournament?.id ||
      urlOrData.tournament?._id ||
      urlOrData.id ||
      null;

    params.token = urlOrData.token || urlOrData.joinToken || null;

    params.teamId = urlOrData.teamId || null;
    params.teamName = urlOrData.teamName || null;
    params.playMode = urlOrData.playMode || urlOrData.mode || null;
    params.tournamentName =
      urlOrData.tournamentName ||
      urlOrData.tournament?.name ||
      urlOrData.tournament?.title ||
      null;

    params.linkType =
      urlOrData.linkType ||
      urlOrData.type ||
      null;

    // If a notification wraps the actual URL, parse that URL too.
    const nestedUrl = urlOrData.deepLink || urlOrData.joinUrl || urlOrData.url;

    if (nestedUrl && typeof nestedUrl === "string") {
      const parsedUrl = extractParamsFromUrl(nestedUrl);

      Object.keys(params).forEach((key) => {
        if (!params[key] && parsedUrl[key]) {
          params[key] = parsedUrl[key];
        }
      });
    }

    return params;
  }

  if (typeof urlOrData !== "string") return params;

  // Extract query parameters.
  params.tournamentId =
    getQueryParam(urlOrData, "tournamentId") ||
    getQueryParam(urlOrData, "tournament_id") ||
    getQueryParam(urlOrData, "id");

  params.token =
    getQueryParam(urlOrData, "token") || getQueryParam(urlOrData, "joinToken");

  params.teamId = getQueryParam(urlOrData, "teamId");
  params.teamName = getQueryParam(urlOrData, "teamName");
  params.playMode =
    getQueryParam(urlOrData, "playMode") || getQueryParam(urlOrData, "mode");

  params.tournamentName = getQueryParam(urlOrData, "tournamentName");

  params.linkType =
    getQueryParam(urlOrData, "type") ||
    getQueryParam(urlOrData, "linkType");

  // Legacy path formats: /tournament/UUID or /tournaments/UUID.
  if (!params.tournamentId) {
    const pathMatch = urlOrData.match(/\/tournaments?\/([^/?#]+)/i);

    if (pathMatch?.[1]) {
      params.tournamentId = decodeValue(pathMatch[1]);
    }
  }

  // Legacy format: /join/UUID.
  if (!params.tournamentId) {
    const joinPathMatch = urlOrData.match(/\/join\/([^/?#]+)/i);

    if (joinPathMatch?.[1]) {
      params.tournamentId = decodeValue(joinPathMatch[1]);
    }
  }

  // IMPORTANT:
  // Never assume a token is a tournament ID.
  // Token-only links need a backend token-validation endpoint.

  return params;
};

/**
 * Normalize common API response formats.
 */
const getTournamentList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.tournaments)) {
    return response.tournaments;
  }
  if (Array.isArray(response?.data?.tournaments)) {
    return response.data.tournaments;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getTournamentObject = (response) => {
  if (!response) return null;

  const candidates = [
    response?.tournament,
    response?.data?.tournament,
    response?.data,
    response,
  ];

  return (
    candidates.find(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        (item.id || item._id || item.tournamentId),
    ) || null
  );
};

const getTournamentId = (tournament) =>
  tournament?.id || tournament?._id || tournament?.tournamentId || null;

const getPlayMode = (params, tournament) => {
  return String(
    params?.playMode || tournament?.playMode || tournament?.mode || "challenge",
  ).toLowerCase();
};

/**
 * Process a tournament deep link and navigate to the appropriate screen.
 */
export const processDeepLink = async (urlOrData, navigationOverride = null) => {
  const params = extractParamsFromUrl(urlOrData);

  const {
    tournamentId: incomingTournamentId,
    token,
    teamId,
    teamName,
    linkType,
  } = params;

  const nav = navigationAdapter(navigationOverride);

  const linkTypeNorm = String(linkType || "").toLowerCase();
  const isHostInviteLink =
    linkTypeNorm === "invited" && !token && Boolean(incomingTournamentId);
  const isShareLink = Boolean(token && incomingTournamentId);
  const skipSharePrepare =
    typeof urlOrData === "object" &&
    urlOrData.skipShareLinkPrepare === true;

  if (isHostInviteLink) {
    console.log("[DeepLink] Host team invite link — opening Notifications.");
    nav.navigate("Notifications");
    return true;
  }

  if (isShareLink && !skipSharePrepare) {
    console.log("[DeepLink] Share link — prepare then Notifications.");
    try {
      const prep = await prepareShareLinkJoinApi(
        incomingTournamentId,
        String(token).trim(),
      );
      if (prep?.alreadyOnRoster) {
        console.log("[DeepLink] Already on roster — opening tournament.");
      } else {
        nav.navigate("Notifications");
        return true;
      }
    } catch (error) {
      console.log(
        "[DeepLink] Share link prepare failed:",
        error?.response?.data || error?.message || error,
      );
      nav.navigate("Notifications");
      return true;
    }
  }

  // A token is not an ID. Do not send it to the ID endpoint.
  if (!incomingTournamentId && !token) {
    console.log("[DeepLink] No tournament ID or token found.");
    return false;
  }

  console.log("[DeepLink] Received link parameters:", {
    tournamentId: incomingTournamentId,
    hasToken: Boolean(token),
    teamId,
  });

  let tournament = null;
  let invitedList = [];
  let mineList = [];

  try {
    // 1. Fetch tournament details by its ID when available.
    if (incomingTournamentId) {
      try {
        const response = await getTournamentByIdApi(incomingTournamentId);

        tournament = getTournamentObject(response);
      } catch (error) {
        console.log(
          "[DeepLink] Fetch by tournament ID failed:",
          error?.message || error,
        );
      }
    }

    // 2. Search the user's tournament lists if the direct request
    // did not return usable details.
    if (!tournament && incomingTournamentId) {
      const [joinableResponse, invitedResponse, mineResponse] =
        await Promise.all([
          getTournamentsApi({
            page: 1,
            limit: 50,
            scope: "joinable",
          }).catch(() => null),

          getTournamentsApi({
            page: 1,
            limit: 50,
            scope: "invited",
          }).catch(() => null),

          getTournamentsApi({
            page: 1,
            limit: 50,
            scope: "mine",
          }).catch(() => null),
        ]);

      const allTournaments = [
        ...getTournamentList(joinableResponse),
        ...getTournamentList(invitedResponse),
        ...getTournamentList(mineResponse),
      ];

      tournament =
        allTournaments.find(
          (item) =>
            String(getTournamentId(item)) === String(incomingTournamentId),
        ) || null;

      invitedList = getTournamentList(invitedResponse);
      mineList = getTournamentList(mineResponse);
    }

    // Refresh membership lists if they were not fetched above.
    if (invitedList.length === 0 || mineList.length === 0) {
      const [invitedResponse, mineResponse] = await Promise.all([
        getTournamentsApi({
          page: 1,
          limit: 50,
          scope: "invited",
        }).catch(() => null),

        getTournamentsApi({
          page: 1,
          limit: 50,
          scope: "mine",
        }).catch(() => null),
      ]);

      if (invitedList.length === 0) {
        invitedList = getTournamentList(invitedResponse);
      }

      if (mineList.length === 0) {
        mineList = getTournamentList(mineResponse);
      }
    }

    // A token-only link cannot be resolved safely using an ID endpoint.
    // It requires a backend endpoint that validates the invitation token.
    if (!tournament && !incomingTournamentId && token) {
      throw new Error(
        "This link contains a token but no tournament ID. Backend token validation is required.",
      );
    }

    const resolvedTournamentId =
      getTournamentId(tournament) || incomingTournamentId;

    const tournamentName =
      tournament?.name ||
      tournament?.title ||
      params.tournamentName ||
      "Tournament";

    const playMode = getPlayMode(params, tournament);

    const isInvited = invitedList.some(
      (item) => String(getTournamentId(item)) === String(resolvedTournamentId),
    );

    const payloadFormat =
      typeof urlOrData === "object"
        ? urlOrData.tournamentFormat || urlOrData.format
        : null;

    const isMine = mineList.some(
      (item) => String(getTournamentId(item)) === String(resolvedTournamentId),
    );

    // 3. Pass the values screens need to load the tournament.
    const navParams = {
      tournament: {
        ...(tournament || {}),
        id: resolvedTournamentId,
        name: tournamentName,
        title: tournamentName,
        ...(payloadFormat ? { tournamentFormat: payloadFormat } : {}),
      },
      tournamentId: resolvedTournamentId,
      token,
      joinToken: token,
      teamId,
      teamName,
      invitedTeam: teamId
        ? {
            id: teamId,
            name: teamName || "Team",
          }
        : null,
      playMode,
      isCreator: isMine && !isInvited,
    };

    const nav = navigationAdapter(navigationOverride);
    const listItem = {
      tournament: navParams.tournament,
      source: isInvited ? "invited" : isMine ? "mine" : undefined,
      isMine: isMine && !isInvited,
    };

    if (isShotgunTournamentItem(listItem)) {
      const afterInviteAccept =
        typeof urlOrData === "object" &&
        urlOrData.afterTournamentInviteAccept === true;
      await openShotgunTournament(nav, listItem, {
        currentUserId: getCurrentUserIdFromStore(),
        playMode,
        forceTeamSelection: afterInviteAccept,
        preselectedTeamId:
          typeof urlOrData === "object" ? urlOrData.teamId || null : null,
      });
      return true;
    }

    const screen = isInvited || !isMine ? "SelectGame" : "ConfigureGames";
    nav.navigate(screen, navParams);
    return true;
  } catch (err) {
    console.log(
      "[DeepLink] Error processing deep link, using fallback navParams:",
      err,
    );
    const tournamentName =
      typeof urlOrData === "object"
        ? urlOrData?.tournamentName || "Tournament"
        : "Tournament";
    const payloadFormat =
      typeof urlOrData === "object"
        ? urlOrData.tournamentFormat || urlOrData.format
        : null;

    const navParams = {
      tournament: {
        id: targetIdOrToken,
        name: tournamentName,
        title: tournamentName,
        ...(payloadFormat ? { tournamentFormat: payloadFormat } : {}),
      },
      tournamentId: incomingTournamentId,
      token,
      joinToken: token,
      teamId,
      teamName,
      invitedTeam: teamId
        ? {
            id: teamId,
            name: teamName || "Team",
          }
        : null,
      playMode: getPlayMode(params, null),
      isCreator: false,
    };

    const nav = navigationAdapter(navigationOverride);
    const listItem = {
      tournament: navParams.tournament,
      source: "invited",
    };

    if (isShotgunTournamentItem(listItem)) {
      const afterInviteAccept =
        typeof urlOrData === "object" &&
        urlOrData.afterTournamentInviteAccept === true;
      await openShotgunTournament(nav, listItem, {
        currentUserId: getCurrentUserIdFromStore(),
        playMode: navParams.playMode,
        forceTeamSelection: afterInviteAccept,
        preselectedTeamId:
          typeof urlOrData === "object" ? urlOrData.teamId || null : null,
      });
      return true;
    }

    nav.navigate("SelectGame", navParams);
    return true;
  }
};

/**
 * Register listeners for cold-start and runtime deep links.
 */
export const setupDeepLinkListener = () => {
  let isProcessing = false;

  const handleUrl = async (url) => {
    if (!url || isProcessing) return;

    isProcessing = true;

    try {
      console.log("[DeepLink] Incoming URL:", url);
      await processDeepLink(url);
    } catch (error) {
      console.log("[DeepLink] Listener error:", error?.message || error);
    } finally {
      isProcessing = false;
    }
  };

  Linking.getInitialURL()
    .then((url) => {
      if (url) {
        console.log("[DeepLink] Cold launch URL:", url);
        handleUrl(url);
      }
    })
    .catch((error) => {
      console.log(
        "[DeepLink] Could not get initial URL:",
        error?.message || error,
      );
    });

  const subscription = Linking.addEventListener("url", ({ url }) => {
    handleUrl(url);
  });

  return () => {
    subscription.remove();
  };
};
