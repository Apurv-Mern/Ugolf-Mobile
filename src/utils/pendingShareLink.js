/** Holds share-link params until the player is logged in (prepare requires auth). */

let pending = null;

export function isUuid(value) {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export function setPendingShareLink(payload) {
  if (!payload?.joinToken) return;
  pending = {
    tournamentId: payload.tournamentId || null,
    joinToken: String(payload.joinToken).trim(),
    linkType: payload.linkType || 'shared',
  };
}

export function getPendingShareLink() {
  return pending;
}

export function clearPendingShareLink() {
  pending = null;
}
