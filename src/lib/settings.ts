import type { PadCount, PlayerCount } from './echo';
import type { Language } from './i18n';

export type Settings = {
  language: Language;
  players: PlayerCount;
  pads: PadCount;
};

export const initialSettings: Settings = {
  language: 'auto',
  players: 2,
  pads: 4,
};
