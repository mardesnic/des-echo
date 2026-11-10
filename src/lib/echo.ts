// Two players take turns growing one song. On your turn you play the
// song so far back, note by note, then add one new note of your own.
// A wrong note ends the song, unless there is a second chance left:
// then the song plays again and you start your turn over.

// Player 0 sits at the bottom of the screen, player 1 at the top.
export type Player = 0 | 1;

export const PAD_COUNTS = [4, 6] as const;
export type PadCount = (typeof PAD_COUNTS)[number];

export type Song = {
  pads: PadCount;
  notes: number[];
  // Who started; the next song starts with the other player.
  first: Player;
  turn: Player;
  // How many notes of the song the player on turn has played back.
  step: number;
  // Second chances left in this song.
  chances: number;
  over: boolean;
};

// What a press did: played the right note, added a new one, used up a
// second chance, ended the song, or nothing (not a pad, or song over).
export type Outcome = 'next' | 'added' | 'retry' | 'end' | 'ignored';

export const other = (p: Player): Player => (p === 0 ? 1 : 0);

export const newSong = (
  pads: PadCount,
  first: Player,
  chances: number
): Song => ({
  pads,
  notes: [],
  first,
  turn: first,
  step: 0,
  chances,
  over: false,
});

// The player on turn presses a pad.
export function press(
  song: Song,
  pad: number
): { song: Song; outcome: Outcome } {
  if (song.over || !Number.isInteger(pad) || pad < 0 || pad >= song.pads)
    return { song, outcome: 'ignored' };

  if (song.step < song.notes.length) {
    if (song.notes[song.step] === pad)
      return { song: { ...song, step: song.step + 1 }, outcome: 'next' };
    if (song.chances > 0)
      return {
        song: { ...song, step: 0, chances: song.chances - 1 },
        outcome: 'retry',
      };
    return { song: { ...song, over: true }, outcome: 'end' };
  }

  return {
    song: {
      ...song,
      notes: [...song.notes, pad],
      turn: other(song.turn),
      step: 0,
    },
    outcome: 'added',
  };
}

// The player on turn has played the whole song back and now adds a note.
export const isAdding = (song: Song) =>
  !song.over && song.step === song.notes.length;

export type Stats = {
  songs: number;
  // The longest song for each number of pads.
  best: Record<PadCount, number>;
};

export const initialStats: Stats = { songs: 0, best: { 4: 0, 6: 0 } };

export function recordSong(
  stats: Stats,
  song: Song
): { stats: Stats; newRecord: boolean } {
  const length = song.notes.length;
  const newRecord = length > (stats.best[song.pads] ?? 0);
  return {
    stats: {
      songs: stats.songs + 1,
      best: newRecord ? { ...stats.best, [song.pads]: length } : stats.best,
    },
    newRecord,
  };
}
