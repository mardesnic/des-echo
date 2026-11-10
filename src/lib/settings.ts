import type { PadCount, PlayerCount } from './echo';
import type { Language } from './i18n';

export type Settings = {
  language: Language;
  players: PlayerCount;
  pads: PadCount;
  // Light up the pads on the other player's side as notes play.
  lights: boolean;
  // One free wrong note per song.
  secondChance: boolean;
};

export const initialSettings: Settings = {
  language: 'auto',
  players: 2,
  pads: 4,
  lights: true,
  secondChance: false,
};
