/**
 * Per-player tournament progress from start-game readiness.
 * A tournament is completed only when this user has finished every game.
 */

export function unwrapReadiness(res) {
  return res?.data || res || null;
}

export function classifyTournamentPlay(tournament, readiness) {
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

  const allGamesDone =
    Boolean(readiness) &&
    completedCount >= numberOfGames &&
    !hasActiveSession &&
    nextGameNumber == null;

  const isInProgress =
    Boolean(readiness) && !allGamesDone && (hasActiveSession || completedCount > 0);

  return {
    numberOfGames,
    completedGameNumbers,
    completedCount,
    nextGameNumber,
    activeSession,
    hasActiveSession,
    allGamesDone,
    isInProgress,
    isCompleted: allGamesDone,
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

    if (!group.playMode && (row.playMode || row.tournament?.playMode)) {
      group.playMode = row.playMode || row.tournament?.playMode;
    }
  }

  for (const group of map.values()) {
    group.games.sort((a, b) => a.gameNumber - b.gameNumber);
  }

  return order.map((id) => map.get(id));
}
