export const NONE_OF_THESE_PLAY_ANOTHER_SHOT_LABEL =
  'None of these - Play another shot';

export function isNoneOfTheAboveOption(q) {
  const text = String(q?.text || q?.question || '')
    .trim()
    .toLowerCase();
  const outcome = String(q?.outcomeLabel || '')
    .trim()
    .toLowerCase();
  return text === 'none of the above' || outcome === 'none of the above';
}
