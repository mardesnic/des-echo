import { describe, expect, it } from 'vitest';

import {
  initialStats,
  isAdding,
  newSong,
  press,
  recordSong,
  withGameNote,
  type Song,
} from './echo';

const play = (song: Song, pads: number[]) =>
  pads.reduce((s, p) => press(s, p).song, song);

describe('a song', () => {
  it('starts empty, with the first player adding a note', () => {
    const song = newSong(2, 4, 1, 0);
    expect(song.turn).toBe(1);
    expect(isAdding(song)).toBe(true);
    const { song: next, outcome } = press(song, 2);
    expect(outcome).toBe('added');
    expect(next.notes).toEqual([2]);
    expect(next.turn).toBe(0);
    expect(next.step).toBe(0);
  });

  it('grows by one note a turn, passing between the players', () => {
    let song = newSong(2, 4, 0, 0);
    song = play(song, [0]); // A adds 0
    song = play(song, [0, 3]); // B repeats, adds 3
    expect(song.turn).toBe(0);
    const { song: s1, outcome: o1 } = press(song, 0);
    expect(o1).toBe('next');
    expect(isAdding(s1)).toBe(false);
    const { song: s2, outcome: o2 } = press(s1, 3);
    expect(o2).toBe('next');
    expect(isAdding(s2)).toBe(true);
    const { song: s3, outcome: o3 } = press(s2, 1);
    expect(o3).toBe('added');
    expect(s3.notes).toEqual([0, 3, 1]);
    expect(s3.turn).toBe(1);
  });

  it('ends on a wrong note', () => {
    const song = play(newSong(2, 4, 0, 0), [2]);
    const { song: next, outcome } = press(song, 1);
    expect(outcome).toBe('end');
    expect(next.over).toBe(true);
    expect(next.notes).toEqual([2]);
    expect(press(next, 2).outcome).toBe('ignored');
  });

  it('gives a second chance: the turn starts over', () => {
    let song = play(newSong(2, 4, 0, 1), [2, 2, 1]); // A: 2, B: 2 then adds 1
    song = play(song, [2]); // A gets the first note right
    const { song: next, outcome } = press(song, 3);
    expect(outcome).toBe('retry');
    expect(next.step).toBe(0);
    expect(next.chances).toBe(0);
    expect(next.turn).toBe(0);
    expect(next.over).toBe(false);
    // The next wrong note ends it.
    expect(press(next, 0).outcome).toBe('end');
  });

  it('ignores pads that are not there', () => {
    const song = newSong(2, 4, 0, 0);
    expect(press(song, 4).outcome).toBe('ignored');
    expect(press(song, -1).outcome).toBe('ignored');
    expect(press(newSong(2, 6, 0, 0), 5).outcome).toBe('added');
  });
});

describe('playing alone', () => {
  it('has the game add every note', () => {
    let song = newSong(1, 4, 1, 0);
    expect(song.turn).toBe(0);
    expect(press(song, 2).outcome).toBe('ignored');
    song = withGameNote(song, () => 0.6);
    expect(song.notes).toEqual([2]);
    const { song: next, outcome } = press(song, 2);
    expect(outcome).toBe('done');
    expect(isAdding(next)).toBe(true);
    expect(press(next, 1).outcome).toBe('ignored');

    song = withGameNote(next, () => 0);
    expect(song.notes).toEqual([2, 0]);
    expect(song.step).toBe(0);
    expect(press(song, 2).outcome).toBe('next');
  });

  it('ends on a wrong note, or gives a second chance', () => {
    const song = withGameNote(newSong(1, 4, 0, 1), () => 0);
    const retry = press(song, 3);
    expect(retry.outcome).toBe('retry');
    expect(press(retry.song, 3).outcome).toBe('end');
  });

  it('never picks the same note three times in a row', () => {
    const song = { ...newSong(1, 4, 0, 0), notes: [1, 1] };
    for (let r = 0; r < 1; r += 0.05)
      expect(withGameNote(song, () => r).notes[2]).not.toBe(1);
    // Twice is fine.
    expect(withGameNote({ ...song, notes: [1] }, () => 0.3).notes).toEqual([
      1, 1,
    ]);
  });
});

describe('stats', () => {
  it('keep the longest song for each number of pads', () => {
    const song = { ...play(newSong(2, 4, 0, 0), [1, 1, 2]), over: true };
    const first = recordSong(initialStats, song);
    expect(first.newRecord).toBe(true);
    expect(first.stats.best).toEqual({ 4: 2, 6: 0 });
    expect(first.stats.songs).toBe(1);

    const shorter = { ...play(newSong(2, 4, 0, 0), [1]), over: true };
    const second = recordSong(first.stats, shorter);
    expect(second.newRecord).toBe(false);
    expect(second.stats.best).toEqual({ 4: 2, 6: 0 });
    expect(second.stats.songs).toBe(2);
  });

  it('keep songs played alone apart, counting only notes played back', () => {
    // The game's third note was never played back.
    const song: Song = { ...newSong(1, 6, 0, 0), notes: [1, 2, 3], over: true };
    const { stats, newRecord } = recordSong(initialStats, song);
    expect(newRecord).toBe(true);
    expect(stats.solo).toEqual({ 4: 0, 6: 2 });
    expect(stats.best).toEqual({ 4: 0, 6: 0 });
  });
});
