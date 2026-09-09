/**
 * Match backend `resolvePlayLocationLabel` when API omits the field.
 */
export function formatPlayLocationLabel(input) {
  if (input?.locationLabel) return input.locationLabel;

  const stage = input?.currentOrigin || 'TEE';
  const par = Number(input?.currentPar) || 4;

  if (par === 4) {
    if (
      input?.screen === 'INSTRUCTION' &&
      input?.instructionText ===
        'Nice drive — play next shot from 100m or better shot'
    ) {
      if (input?.pendingDestination === 'Fairway') return 'Fairway';
      if (input?.pendingDestination === 'None of the above') return 'Tee';
    }
    if (stage === 'FAIRWAY_SECOND_SHOT') {
      if (input?.pendingDestination === 'Tee') return 'Tee';
      return 'Fairway';
    }
  }

  if (par === 5) {
    if (
      input?.screen === 'INSTRUCTION' &&
      input?.instructionText ===
        'Nice drive — play your next shot from 200m or better shot.'
    ) {
      return 'Fairway';
    }
    if (
      input?.screen === 'INSTRUCTION' &&
      input?.instructionText ===
        'Play your next shot from 100 m or better shot.'
    ) {
      if (stage === 'TEE' && input?.pendingDestination === 'None of the above') {
        return 'Tee';
      }
      return 'Fairway';
    }
    if (stage === 'FAIRWAY_SECOND_SHOT') {
      if (input?.pendingDestination === 'Tee') return 'Tee';
      return 'Fairway';
    }
  }

  if (stage === 'TEE') return 'Tee';
  if (stage === 'GREEN') return 'Green';
  if (stage === 'FAIRWAY_SECOND_SHOT') return '100m';
  if (stage === 'FAIRWAY_THIRD_SHOT') return '100m';
  return String(stage).replace(/_/g, ' ');
}
