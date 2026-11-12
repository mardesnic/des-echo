import { useCallback, useEffect, useRef, useState } from 'react';

import { HomeLink } from './components/HomeLink';
import { Confetti } from './components/Confetti';
import { Icon } from './components/Icon';
import { SettingsView } from './components/Menu';
import { Side, type Wobble } from './components/Side';
import {
  initialStats,
  isAdding,
  newSong,
  other,
  press,
  recordSong,
  songLength,
  withGameNote,
  type Player,
  type Song,
  type Stats,
} from './lib/echo';
import { STRINGS, detectLang } from './lib/i18n';
import { PADS } from './lib/pads';
import { initialSettings, type Settings } from './lib/settings';
import { bonk, fanfare, playNote } from './lib/sound';
import { popMenu, pushMenu, useBackButton } from './lib/use-back-button';
import { useLanguage } from './lib/use-shared-settings';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

// How long between notes when a song is played to the players, in ms.
const REPLAY_GAP = 550;
const FINALE_GAP = 330;

const fresh = (s: Settings, first: Player): Song =>
  newSong(s.players, s.pads, first);

export default function App() {
  const [settings, setSettings] = useStoredState<Settings>(
    'echo-settings',
    initialSettings
  );
  // Keys are prefixed: other apps on the same GitHub Pages origin share
  // this storage.
  const [store, setStore] = useStoredState<{ song: Song }>('echo', {
    song: fresh(settings, 0),
  });
  // Songs saved before playing alone was added are for two.
  const song: Song = { ...store.song, players: store.song.players ?? 2 };
  const solo = song.players === 1;
  const setSong = (s: Song) => setStore({ song: s });
  const [stats, setStats] = useStoredState<Stats>('echo-stats', initialStats);
  const [view, setViewState] = useState<'play' | 'settings'>('play');
  // Settings opens over the game, so the phone's Back button closes it.
  const setView = (next: 'play' | 'settings') => {
    if (next === 'play') popMenu();
    else pushMenu();
    setViewState(next);
  };
  useBackButton(() => setViewState('play'));

  // While a song plays to the players, nobody can press.
  const [busy, setBusy] = useState(false);
  const [lit, setLit] = useState<[number | null, number | null]>([null, null]);
  const [wobble, setWobble] = useState<Wobble | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  useWakeLock();

  const [language, setLanguage] = useLanguage();
  const lang = language === 'auto' ? detectLang() : language;
  const t = STRINGS[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  // Every timer, so a new song can stop whatever is still playing.
  const timers = useRef<number[]>([]);
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const stopAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => stopAll, []);

  const flash = (players: Player[], pad: number, ms: number) => {
    if (!players.length) return;
    setLit((l) => {
      const next = [...l] as typeof l;
      for (const p of players) next[p] = pad;
      return next;
    });
    later(ms, () =>
      setLit((l) => {
        const next = [...l] as typeof l;
        for (const p of players) if (next[p] === pad) next[p] = null;
        return next;
      })
    );
  };

  // Plays the song note by note, lighting it up on the given sides.
  const playSong = (
    s: Song,
    players: Player[],
    gap: number,
    done: () => void
  ) => {
    s.notes.forEach((pad, i) =>
      later(i * gap, () => {
        playNote(PADS[s.pads][pad].frequency);
        flash(players, pad, gap * 0.7);
      })
    );
    later(s.notes.length * gap, done);
  };

  // Playing alone, the game adds a note and plays the whole song.
  const addNote = (s: Song) => {
    const next = withGameNote(s);
    setSong(next);
    setBusy(true);
    playSong(next, [0], REPLAY_GAP, () => setBusy(false));
  };

  // Every new song alone waits for Go, so the game never starts playing
  // by itself (and the phone lets sound play after a tap).
  const ready = solo && !song.over && !busy && !song.notes.length;

  // Once the song has been played back, the game adds the next note.
  const waiting =
    solo && !song.over && !busy && isAdding(song) && song.notes.length > 0;
  useEffect(() => {
    if (!waiting) return;
    // A long pause, so the player's own last note isn't heard as the
    // start of the game's song.
    const id = window.setTimeout(() => addNote(song), 1300);
    return () => clearTimeout(id);
    // Only when it starts waiting, not on every render while it waits.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, song.notes.length]);

  const start = (s: Song) => {
    stopAll();
    setSong(s);
    setBusy(false);
    setLit([null, null]);
    setWobble(null);
    setNewRecord(false);
  };

  const onPress = (player: Player, pad: number) => {
    if (busy || song.over || player !== song.turn) return;
    const { song: next, outcome } = press(song, pad);
    if (outcome === 'ignored') return;
    setSong(next);

    if (outcome === 'next' || outcome === 'added' || outcome === 'done') {
      playNote(PADS[song.pads][pad].frequency);
      // The other side lights up too, so the other player can follow.
      flash([player, other(player)], pad, 300);
      if (outcome === 'added') {
        // A short pause, so the new note is heard before the turn passes.
        setBusy(true);
        later(500, () => setBusy(false));
      }
      return;
    }

    bonk();
    setWobble({ player, pad, key: Date.now() });
    setBusy(true);

    // The song is over: play it all once more, then celebrate it.
    const recorded = recordSong(stats, next);
    setStats(recorded.stats);
    setNewRecord(recorded.newRecord);
    later(900, () =>
      playSong(next, [0, 1], FINALE_GAP, () => {
        fanfare();
        setBusy(false);
        if (recorded.newRecord) setCelebrating(true);
      })
    );
  };

  const onReplay = (player: Player) => {
    if (busy || player !== song.turn || song.step || !song.notes.length) return;
    setBusy(true);
    playSong(song, [player], REPLAY_GAP, () => setBusy(false));
  };

  // Each new song starts with the other player. Alone, it waits for Go.
  const playAgain = () => start(fresh(settings, other(song.first)));

  const changeSettings = (s: Settings) => {
    setSettings(s);
    if (s.players !== settings.players || s.pads !== settings.pads)
      start(fresh(s, song.first));
  };

  if (view === 'settings')
    return (
      <main className='app'>
        <header className='header'>
          <div className='header__title'>
            <HomeLink label={t.allGames} />
            <h1>{t.title}</h1>
          </div>
          <button
            className='button button--small'
            onClick={() => setView('play')}
          >
            {t.done}
          </button>
        </header>
        <SettingsView
          language={language}
          setLanguage={setLanguage}
          settings={settings}
          setSettings={changeSettings}
          stats={stats}
          t={t}
        />
        <footer className='footer'>
          <a href='/des-kids-games/'>{t.allGames}</a>
          <a href='https://github.com/mardesnic/des-echo'>{t.source}</a>
          <span className='footer__version'>
            {t.version} {__VERSION__}
          </span>
        </footer>
      </main>
    );

  const length = songLength(song);
  const result =
    song.over && !busy
      ? {
          text: !length
            ? t.haveAnotherGo
            : solo
              ? t.playedBack(length)
              : t.songHad(length),
          newRecord,
        }
      : null;

  const side = (p: Player) => (
    <Side
      player={p}
      song={song}
      lit={lit[p]}
      wobble={wobble}
      busy={busy}
      result={result}
      onPress={(pad) => onPress(p, pad)}
      onReplay={() => onReplay(p)}
      onPlayAgain={playAgain}
      ready={ready}
      onGo={() => addNote(song)}
      t={t}
    />
  );

  return (
    <main className={solo ? 'duo duo--solo' : 'duo'}>
      {!solo && side(1)}

      <div className='middle'>
        <div className='header__title'>
          <HomeLink label={t.allGames} />
          <h1>{t.title}</h1>
        </div>
        <div className='middle__actions'>
          <button className='button button--small' onClick={playAgain}>
            {t.newGame}
          </button>
          <button
            className='button button--small button--icon'
            onClick={() => setView('settings')}
            aria-label={t.settings}
          >
            <Icon name='settings' />
          </button>
        </div>
      </div>

      {side(0)}

      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </main>
  );
}
