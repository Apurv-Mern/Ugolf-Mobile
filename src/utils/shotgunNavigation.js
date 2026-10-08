import { resolveTournamentFormatLabel } from './playProgress';
import { getTournamentTeamsApi } from '../services/teamService';

export function isShotgunTournamentItem(item) {
  const t = item?.tournament || item;
  return resolveTournamentFormatLabel(t) === 'Shotgun';
}

export function isTournamentCreatorUser(tournament, currentUserId) {
  if (!tournament || !currentUserId) return false;
  const creatorId =
    tournament.creatorUserId || tournament.creatorId || tournament.createdBy;
  if (!creatorId) return false;
  return (
    String(creatorId).toLowerCase() === String(currentUserId).toLowerCase()
  );
}

export function creatorSetupInviteParams(base) {
  return {
    ...base,
    shotgunFlow: true,
    creatorSetupFlow: true,
  };
}

/** Replace (not push) so hardware back does not loop Setup ↔ Lobby. */
export function goCreatorSetupInvite(navigation, params) {
  navigation.replace('InviteOtherTeams', creatorSetupInviteParams(params));
}

export function goCreatorSetupSelectTeam(navigation, params) {
  navigation.replace('SelectTeam', {
    ...params,
    isCreator: true,
    creatorSetupFlow: true,
  });
}

export function goCreatorSetupConfigureGames(navigation, params) {
  navigation.replace('ConfigureGames', {
    ...params,
    isCreator: true,
    tournament: params.tournament,
    tournamentId: params.tournamentId,
  });
}

export function goCreatorSetupHoles(navigation, params) {
  navigation.replace('ShotgunSetup', creatorSetupInviteParams(params));
}

export function isTournamentCreatorItem(item, currentUserId) {
  const t = item?.tournament || item;
  const creatorId =
    t?.creatorUserId || t?.creatorId || t?.createdBy || item?.creatorUserId;
  if (
    item?.source === 'mine' ||
    item?.isMine === true
  ) {
    return true;
  }
  if (!currentUserId || !creatorId) return false;
  return (
    String(creatorId).toLowerCase() === String(currentUserId).toLowerCase()
  );
}

/** User is on a team that may pick a shotgun hole (own or accepted invite). */
export function userOnReadyTournamentTeam(teams, currentUserId) {
  if (!currentUserId) return false;
  const uid = String(currentUserId).toLowerCase();
  const list = Array.isArray(teams) ? teams : [];

  return list.some((t) => {
    const status = String(t.inviteStatus || '').toLowerCase();
    const ready = t.isOwnTeam || status === 'accepted';
    if (!ready) return false;
    const members = t.players || t.members || t.roster || [];
    if (!Array.isArray(members) || members.length === 0) {
      return Boolean(t.isOwnTeam);
    }
    return members.some((m) => {
      const mid = m.playerUserId || m.userId || m.id || m._id;
      return mid && String(mid).toLowerCase() === uid;
    });
  });
}

/**
 * Creator setup: Configure games → team → invite teams → hole pick (lobby optional hub).
 * Participant: Team selection (if needed) → shotgun lobby / holes.
 */
export async function openShotgunTournament(navigation, item, options = {}) {
  const {
    currentUserId,
    playMode = 'challenge',
    forceTeamSelection = false,
    preselectedTeamId = null,
  } = options;
  const tournament = item?.tournament || item;
  const tournamentId = tournament?.id || tournament?._id || item?.id;
  const baseParams = {
    tournament,
    tournamentId,
    playMode,
  };

  if (isTournamentCreatorItem(item, currentUserId)) {
    navigation.navigate('ConfigureGames', {
      ...baseParams,
      isCreator: true,
      tournament: {
        ...tournament,
        tournamentFormat:
          tournament?.tournamentFormat ||
          item?.tournamentFormat ||
          'SHOTGUN',
      },
    });
    return;
  }

  if (forceTeamSelection) {
    navigation.navigate('SelectTeam', {
      ...baseParams,
      returnTo: 'ShotgunLobby',
      ...(preselectedTeamId ? { preselectedTeamId: String(preselectedTeamId) } : {}),
    });
    return;
  }

  let needsTeamSelection = true;
  if (tournamentId) {
    try {
      const res = await getTournamentTeamsApi(tournamentId);
      const teamList =
        res?.teams ||
        res?.data?.teams ||
        res?.data ||
        (Array.isArray(res) ? res : []);
      needsTeamSelection = !userOnReadyTournamentTeam(teamList, currentUserId);
    } catch {
      needsTeamSelection = true;
    }
  }

  if (needsTeamSelection) {
    navigation.navigate('SelectTeam', {
      ...baseParams,
      returnTo: 'ShotgunLobby',
    });
    return;
  }

  navigation.navigate('ShotgunLobby', baseParams);
}
