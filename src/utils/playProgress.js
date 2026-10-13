/**
 * Per-player tournament progress from start-game readiness.
 * A tournament is completed only when this user has finished every game.
 */

export function isChallengePlayMode(...values) {
  return values.some((value) =>
    String(value || '')
      .toUpperCase()
      .includes('CHALLENGE'),
  );
}

export function isChallengeLocked(tournament, readinessOrTeams) {
  if (!tournament) return false;
  if (
    tournament.challengeLocked === true ||
    tournament.isChallengeLocked === true ||
    readinessOrTeams?.challengeLocked === true ||
    readinessOrTeams?.data?.challengeLocked === true
  ) {
    return true;
  }
  if (
    tournament.isInProgress === true ||
    tournament.gameStarted === true ||
    tournament.hasStarted === true ||
    tournament.isStarted === true
  ) {
    return true;
  }

  const modeStr = String(
    tournament.playMode || tournament.mode || readinessOrTeams?.playMode || '',
  ).toUpperCase();
  if (!modeStr.includes('CHALLENGE')) return false;

  if (
    readinessOrTeams?.opponentReady === true ||
    readinessOrTeams?.opponentAccepted === true ||
    readinessOrTeams?.data?.opponentReady === true ||
    readinessOrTeams?.data?.opponentAccepted === true
  ) {
    return true;
  }

  const teams = Array.isArray(readinessOrTeams)
    ? readinessOrTeams
    : readinessOrTeams?.teams || readinessOrTeams?.data?.teams || readinessOrTeams?.data;

  const ownTeamId =
    readinessOrTeams?.ownSelectedTeamId ||
    readinessOrTeams?.data?.ownSelectedTeamId ||
    tournament?.ownSelectedTeamId ||
    tournament?.selectedTeamId;

  if (Array.isArray(teams) && teams.length >= 2) {
    const hasAcceptedOpponent = teams.some((t) => {
      const tId = String(t.id || t._id || t.teamId || '');
      const ownId = ownTeamId ? String(ownTeamId) : null;
      const isCreator = t.isCreator === true || t.isOwnTeam === true || (ownId && tId === ownId);
      if (isCreator) return false;

      const status = String(t.inviteStatus || t.status || t.state || '').toLowerCase().trim();
      if (
        status === 'declined' ||
        status === 'rejected' ||
        status === 'pending' ||
        status === 'cancelled' ||
        status === 'refused'
      ) {
        return false;
      }
      return true;
    });

    if (hasAcceptedOpponent) return true;
  }

  return false;
}

export function unwrapReadiness(res) {
  let cur = res;
  for (let i = 0; i < 4 && cur && typeof cur === 'object'; i += 1) {
    if (
      cur.completedGameNumbers != null ||
      typeof cur.gameStarted === 'boolean' ||
      typeof cur.ready === 'boolean' ||
      cur.activeSession !== undefined ||
      cur.nextGameNumber !== undefined
    ) {
      return cur;
    }
    cur = cur.data || cur.readiness || null;
  }
  return res?.data || res || null;
}

/** True when any team/player already has a score on this tournament. */
export function leaderboardIndicatesStarted(res) {
  const data = res?.data || res;
  const entries = data?.entries;
  if (Array.isArray(entries) && entries.length > 0) return true;
  const teams = data?.challenge?.teams;
  if (!Array.isArray(teams)) return false;
  return teams.some(
    (team) =>
      Number(team.totalScore) > 0 ||
      (Array.isArray(team.players) && team.players.length > 0),
  );
}

/** True when this player finished their assigned Shotgun nine. */
export function isShotgunPlayerRoundComplete(readiness) {
  if (!isShotgunTournamentFormat(null, readiness)) return false;
  const completedGameNumbers = (readiness?.completedGameNumbers || []).map(Number);
  const assigned = Number(readiness?.shotgunAssignmentGameNumber);
  if (assigned > 0 && completedGameNumbers.includes(assigned)) {
    return true;
  }
  return (
    completedGameNumbers.length >= 1 &&
    !readiness?.activeSession?.id &&
    readiness?.nextGameNumber == null
  );
}

export function classifyTournamentPlay(tournament, readiness, extras = {}) {
  const numberOfGames = Math.max(
    1,
    Number(readiness?.numberOfGames ?? tournament?.numberOfGames) || 1,
  );
  const completedGameNumbers = (readiness?.completedGameNumbers || []).map(Number);
  const completedCount = completedGameNumbers.length;
  const nextGameNumber =
    readiness?.nextGameNumber != null ? Number(readiness.nextGameNumber) : null;
  const activeSession = readiness?.activeSession || null;
  const hasActiveSession = Boolean(activeSession?.id || activeSession?.gameNumber);
  const gameStarted = Boolean(
    extras.anyonePlayed ||
      readiness?.gameStarted ||
      readiness?.hasStarted ||
      tournament?.gameStarted ||
      tournament?.hasStarted,
  );

  const shotgun = isShotgunTournamentFormat(tournament, readiness);

  const allGamesDone = shotgun
    ? Boolean(readiness) &&
      isShotgunPlayerRoundComplete(readiness) &&
      !hasActiveSession
    : Boolean(readiness) &&
      completedCount >= numberOfGames &&
      !hasActiveSession &&
      nextGameNumber == null;

  const isInProgress =
    !allGamesDone &&
    (hasActiveSession || completedCount > 0 || gameStarted);

  return {
    numberOfGames,
    completedGameNumbers,
    completedCount,
    nextGameNumber: shotgun && allGamesDone ? null : nextGameNumber,
    activeSession,
    hasActiveSession,
    gameStarted,
    allGamesDone,
    isInProgress,
    isCompleted: allGamesDone,
    isShotgun: shotgun,
    shotgunAssignmentGameNumber:
      readiness?.shotgunAssignmentGameNumber != null
        ? Number(readiness.shotgunAssignmentGameNumber)
        : null,
  };
}

/** Home / in-progress card copy for Shotgun (one nine per player, not sequential games). */
export function liveRoundLabelsForTournament(item, sessionRes) {
  const tournament = item?.tournament || item;
  const shotgun = isShotgunTournamentFormat(tournament, {
    tournamentFormat: item?.tournamentFormat || tournament?.tournamentFormat,
  });

  if (!shotgun) return null;

  if (item?.hasActiveSession && item?.activeSession?.id && sessionRes) {
    const holeStart = Number(sessionRes?.holeStart) || 1;
    const holeEnd = Number(sessionRes?.holeEnd) || 18;
    const totalHoles = Math.max(1, holeEnd - holeStart + 1);
    const session = item.activeSession;
    const holeIndex = Math.min(
      totalHoles,
      Math.max(1, (Number(session.currentHole) || holeStart) - holeStart + 1),
    );
    return {
      holeLabel: `Hole ${holeIndex} / ${totalHoles}`,
      holeIndex,
      totalHoles,
      progress: holeIndex / totalHoles,
      badge: 'GAME STARTED',
      actionLabel: 'CONTINUE',
    };
  }

  const playerDone = isShotgunPlayerRoundComplete({
    tournamentFormat: 'SHOTGUN',
    completedGameNumbers: item?.completedGameNumbers,
    shotgunAssignmentGameNumber: item?.shotgunAssignmentGameNumber,
    nextGameNumber: item?.nextGameNumber,
    activeSession: item?.activeSession,
  });

  if (playerDone) {
    return {
      holeLabel: 'Complete',
      holeIndex: 9,
      totalHoles: 9,
      progress: 1,
      badge: 'COMPLETE',
      actionLabel: 'VIEW LEADERBOARD',
    };
  }

  return {
    holeLabel: 'Your nine',
    holeIndex: 0,
    totalHoles: 9,
    progress: 0,
    badge: item?.gameStarted ? 'GAME STARTED' : 'IN PROGRESS',
    actionLabel: item?.nextGameNumber != null ? 'CONTINUE' : 'VIEW LEADERBOARD',
  };
}

export function latestHistoryMs(historyList, tournamentId) {
  if (!tournamentId || !Array.isArray(historyList)) return 0;
  const id = String(tournamentId);
  return historyList.reduce((max, row) => {
    if (String(row.tournamentId || row.tournament?.id) !== id) return max;
    const ms = new Date(row.completedAt || row.updatedAt || 0).getTime();
    return Number.isFinite(ms) ? Math.max(max, ms) : max;
  }, 0);
}

export function inProgressActivityMs(item, historyList) {
  if (item.hasActiveSession) {
    const sessionMs = new Date(
      item.activeSession?.updatedAt || item.activeSession?.updated_at || 0,
    ).getTime();
    if (Number.isFinite(sessionMs) && sessionMs > 0) return sessionMs + 1e12;
    return Date.now() + 1e12;
  }
  const historyMs = latestHistoryMs(historyList, item.id || item.tournament?.id);
  if (historyMs > 0) return historyMs;
  const t = item.tournament || item;
  const fallback = t.updatedAt || t.updated_at || t.createdAt || t.created_at || item.startDateMs;
  const ms = new Date(fallback || 0).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

/** One card per tournament; games nested with their scores. */
export function groupGameHistoryByTournament(history) {
  const order = [];
  const map = new Map();

  for (const row of history || []) {
    const tournamentId = String(row.tournamentId || row.tournament?.id || row.tournament?._id || '');
    if (!tournamentId) continue;

    let group = map.get(tournamentId);
    if (!group) {
      group = {
        tournamentId,
        title: row.tournamentName || row.golfCourseName || 'Tournament',
        courseName: row.golfCourseName || '',
        playMode: row.playMode || row.tournament?.playMode || '',
        lastCompletedAt: row.completedAt || '',
        totalScore: 0,
        games: [],
        latestGameNumber: Number(row.gameNumber) || 1,
      };
      map.set(tournamentId, group);
      order.push(tournamentId);
    }

    const gameNumber = Number(row.gameNumber) || 1;
    const score = Number(row.score);
    const existing = group.games.find((g) => g.gameNumber === gameNumber);
    if (!existing) {
      group.games.push({
        gameNumber,
        score: Number.isFinite(score) ? score : 0,
        completedAt: row.completedAt || '',
        golfCourseName: row.golfCourseName || '',
      });
      if (Number.isFinite(score)) group.totalScore += score;
    } else if (Number.isFinite(score) && score > existing.score) {
      group.totalScore += score - existing.score;
      existing.score = score;
      existing.completedAt = row.completedAt || existing.completedAt;
    }

    if (
      row.completedAt &&
      (!group.lastCompletedAt || new Date(row.completedAt) >= new Date(group.lastCompletedAt))
    ) {
      group.lastCompletedAt = row.completedAt;
      group.latestGameNumber = gameNumber;
    }

    const rowMode = row.playMode || row.tournament?.playMode || '';
    if (isChallengePlayMode(rowMode)) {
      group.playMode = 'CHALLENGE';
    } else if (!group.playMode) {
      group.playMode = rowMode;
    }
  }

  for (const group of map.values()) {
    group.games.sort((a, b) => a.gameNumber - b.gameNumber);
  }

  return order.map((id) => map.get(id));
}

/** Display label for tournament format on list cards. */
export function resolveTournamentFormatLabel(tournament, readiness) {
  const fmt = String(
    tournament?.tournamentFormat ||
      tournament?.format ||
      readiness?.tournamentFormat ||
      'NORMAL',
  ).toUpperCase();
  return fmt === 'SHOTGUN' ? 'Shotgun' : 'Normal';
}

export function isShotgunTournamentFormat(tournament, readiness) {
  return (
    String(
      tournament?.tournamentFormat ||
        tournament?.format ||
        readiness?.tournamentFormat ||
        'NORMAL',
    ).toUpperCase() === 'SHOTGUN'
  );
}
