const GREEN_TEE_PREMIUM_GROUP = 10;

function isPar5PremiumPuttAt100m({ par, stage, questionGroup }) {
  return (
    par === 5 &&
    stage === "FAIRWAY_THIRD_SHOT" &&
    questionGroup >= GREEN_TEE_PREMIUM_GROUP
  );
}

/**
 * Match backend `resolvePlayLocationLabel` when API omits the field.
 */
export function formatPlayLocationLabel(input) {
  if (input?.locationLabel) return input.locationLabel;

  const par = Number(input?.currentPar) || 4;
  const questionGroup = Number(input?.questionGroup) || 0;
  let stage = input?.currentOrigin || "TEE";

  if (
    input?.screen === "INSTRUCTION" &&
    !input?.pendingMoveToNewHole &&
    input?.pendingNewOrigin
  ) {
    stage = input.pendingNewOrigin;
  }

  if (par === 4 && stage === "FAIRWAY_SECOND_SHOT") {
    return "Fairway";
  }

  if (
    par === 5 &&
    questionGroup > 0 &&
    isPar5PremiumPuttAt100m({ par, stage, questionGroup })
  ) {
    return "Green";
  }

  if (
    par === 5 &&
    (stage === "FAIRWAY_SECOND_SHOT" || stage === "FAIRWAY_THIRD_SHOT")
  ) {
    return "Fairway";
  }

  if (stage === "TEE") return "Tee";
  if (stage === "GREEN") return "Green";
  if (stage === "FAIRWAY_SECOND_SHOT") return "100m";
  if (stage === "FAIRWAY_THIRD_SHOT") return "100m";
  return String(stage).replace(/_/g, " ");
}
