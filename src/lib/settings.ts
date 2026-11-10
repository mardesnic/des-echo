import type { PadCount } from './echo';
import type { Language } from './i18n';

export type Settings = {
  language: Language;
  pads: PadCount;
  // Light up the pads on the other player's side as notes play.
  lights: boolean;
  // One free wrong note per song.
  secondChance: boolean;
};

export const initialSettings: Settings = {
  language: 'auto',
  pads: 4,
  lights: true,
  secondChance: false,
};
