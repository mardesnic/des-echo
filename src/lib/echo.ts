// Two players take turns growing one song. On your turn you play the
// song so far back, note by note, then add one new note of your own.
// Playing alone, the game adds the new notes and you play the song back.
// A wrong note ends the song, unless there is a second chance left:
// then the song plays again and you start your turn over.

// Player 0 sits at the bottom of the screen, player 1 at the top.
export type Player = 0 | 1;

export const PAD_COUNTS = [4, 6] as const;
export type PadCount = (typeof PAD_COUNTS)[number];

export type PlayerCount = 1 | 2;

export type Song = {
  players: PlayerCount;
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

// What a press did: played the right note, played the last note of the
// song back alone (the game adds the next one), added a new note, used up
// a second chance, ended the song, or nothing (not a pad, or song over).
export type Outcome = 'next' | 'done' | 'added' | 'retry' | 'end' | 'ignored';

export const other = (p: Player): Player => (p === 0 ? 1 : 0);

export const newSong = (
  players: PlayerCount,
  pads: PadCount,
  first: Player,
  chances: number
): Song => ({
  players,
  pads,
  notes: [],
  first: players === 1 ? 0 : first,
  turn: players === 1 ? 0 : first,
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
    if (song.notes[song.step] === pad) {
      const step = song.step + 1;
      const done = song.players === 1 && step === song.notes.length;
      return { song: { ...song, step }, outcome: done ? 'done' : 'next' };
    }
    if (song.chances > 0)
      return {
        song: { ...song, step: 0, chances: song.chances - 1 },
        outcome: 'retry',
      };
    return { song: { ...song, over: true }, outcome: 'end' };
  }

  // Playing alone, only the game adds notes.
  if (song.players === 1) return { song, outcome: 'ignored' };

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

// Playing alone: the game adds a note, and the player plays it all back.
// A note never comes three times in a row, which would be dull.
export function withGameNote(song: Song, random = Math.random): Song {
  const [a, b] = song.notes.slice(-2);
  const options = Array.from({ length: song.pads }, (_, i) => i).filter(
    (i) => !(i === a && i === b)
  );
  const pad = options[Math.floor(random() * options.length)];
  return { ...song, notes: [...song.notes, pad], step: 0 };
}

// The player on turn has played the whole song back and now adds a note
// (or, playing alone, waits for the game to add one).
export const isAdding = (song: Song) =>
  !song.over && song.step === song.notes.length;

export type Stats = {
  songs: number;
  // The longest song for each number of pads, for two and for one player.
  best: Record<PadCount, number>;
  solo: Record<PadCount, number>;
};

export const initialStats: Stats = {
  songs: 0,
  best: { 4: 0, 6: 0 },
  solo: { 4: 0, 6: 0 },
};

export const bestOf = (stats: Stats, players: PlayerCount, pads: PadCount) =>
  (players === 1 ? stats.solo : stats.best)[pads] ?? 0;

export const songLength = (song: Song) =>
  song.players === 1 ? Math.max(0, song.notes.length - 1) : song.notes.length;

export function recordSong(
  stats: Stats,
  song: Song
): { stats: Stats; newRecord: boolean } {
  // Alone, the song's last note was the game's, so it counts the notes
  // the player got right.
  const length = songLength(song);
  const newRecord = length > bestOf(stats, song.players, song.pads);
  const key = song.players === 1 ? 'solo' : 'best';
  return {
    stats: {
      ...stats,
      songs: stats.songs + 1,
      ...(newRecord && { [key]: { ...stats[key], [song.pads]: length } }),
    },
    newRecord,
  };
}
