/**
 * Match backend `playLocationLabel` when API omits the field.
 * Tee / 100m / Green depending on stage and hole par.
 */
export function formatPlayLocationLabel(input) {
  if (input?.locationLabel) return input.locationLabel;

  const stage = input?.currentOrigin || 'TEE';
  const par = Number(input?.currentPar) || 4;

  if (stage === 'TEE') return 'Tee';
  if (stage === 'GREEN') return 'Green';
  if (stage === 'FAIRWAY_SECOND_SHOT') return 'Fairway';
  if (stage === 'FAIRWAY_THIRD_SHOT') return 'Fairway';
  return String(stage).replace(/_/g, ' ');
}
