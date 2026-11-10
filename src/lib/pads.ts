import type { PadCount } from './echo';

export type Shape =
  'circle' | 'star' | 'triangle' | 'heart' | 'square' | 'moon';

// Each pad has a colour and a shape, so it can be told apart without
// seeing colours, and a note. Notes come from a pentatonic scale, so any
// song the kids make up sounds nice. Pads go from low to high.
type Pad = { colour: string; shape: Shape; frequency: number };

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const G4 = 392.0;
const A4 = 440.0;
const C5 = 523.25;

const RED = { colour: '#e5484d', shape: 'circle' } as const;
const BLUE = { colour: '#3b82f6', shape: 'star' } as const;
const YELLOW = { colour: '#f2b200', shape: 'triangle' } as const;
const GREEN = { colour: '#2fa36b', shape: 'heart' } as const;
const PURPLE = { colour: '#8e4ec6', shape: 'square' } as const;
const ORANGE = { colour: '#f76b15', shape: 'moon' } as const;

export const PADS: Record<PadCount, Pad[]> = {
  // A major chord: four notes that always go together.
  4: [
    { ...RED, frequency: C4 },
    { ...BLUE, frequency: E4 },
    { ...YELLOW, frequency: G4 },
    { ...GREEN, frequency: C5 },
  ],
  6: [
    { ...RED, frequency: C4 },
    { ...BLUE, frequency: D4 },
    { ...YELLOW, frequency: E4 },
    { ...GREEN, frequency: G4 },
    { ...PURPLE, frequency: A4 },
    { ...ORANGE, frequency: C5 },
  ],
};
