import type { PadCount, PlayerCount } from './echo';

export type Settings = {
  players: PlayerCount;
  pads: PadCount;
};

export const initialSettings: Settings = {
  players: 1,
  pads: 4,
};
