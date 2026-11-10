import { useCallback, useEffect, useRef, useState } from 'react';

import { Confetti } from './components/Confetti';
import { Icon } from './components/Icon';
import { SettingsView } from './components/Menu';
import { Side, type Wobble } from './components/Side';
import {
  initialStats,
  newSong,
  other,
  press,
  recordSong,
  type Player,
  type Song,
  type Stats,
} from './lib/echo';
import { STRINGS, detectLang } from './lib/i18n';
import { PADS } from './lib/pads';
import { initialSettings, type Settings } from './lib/settings';
import { bonk, fanfare, playNote } from './lib/sound';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

// How long between notes when a song is played to the players, in ms.
const REPLAY_GAP = 550;
const FINALE_GAP = 330;

const fresh = (s: Settings, first: Player): Song =>
  newSong(s.pads, first, s.secondChance ? 1 : 0);

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
  const { song } = store;
  const setSong = (s: Song) => setStore({ song: s });
  const [stats, setStats] = useStoredState<Stats>('echo-stats', initialStats);
  const [view, setView] = useState<'play' | 'settings'>('play');

  // While a song plays to the players, nobody can press.
  const [busy, setBusy] = useState(false);
  const [lit, setLit] = useState<[number | null, number | null]>([null, null]);
  const [wobble, setWobble] = useState<Wobble | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  useWakeLock();

  const lang = settings.language === 'auto' ? detectLang() : settings.language;
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

  const start = (s: Song) => {
    stopAll();
    setSong(s);
    setBusy(false);
    setLit([null, null]);
    setWobble(null);
    setRetrying(false);
    setNewRecord(false);
  };

  const onPress = (player: Player, pad: number) => {
    if (busy || song.over || player !== song.turn) return;
    const { song: next, outcome } = press(song, pad);
    if (outcome === 'ignored') return;
    setSong(next);

    if (outcome === 'next' || outcome === 'added') {
      playNote(PADS[song.pads][pad].frequency);
      flash(settings.lights ? [player, other(player)] : [player], pad, 300);
      setRetrying(false);
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

    if (outcome === 'retry') {
      setRetrying(true);
      later(900, () =>
        playSong(next, settings.lights ? [player] : [], REPLAY_GAP, () =>
          setBusy(false)
        )
      );
      return;
    }

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
    playSong(song, settings.lights ? [player] : [], REPLAY_GAP, () =>
      setBusy(false)
    );
  };

  // Each new song starts with the other player.
  const playAgain = () => start(fresh(settings, other(song.first)));

  const changeSettings = (s: Settings) => {
    setSettings(s);
    if (s.pads !== settings.pads || s.secondChance !== settings.secondChance)
      start(fresh(s, song.first));
  };

  if (view === 'settings')
    return (
      <main className='app'>
        <header className='header'>
          <h1>{t.title}</h1>
          <button
            className='button button--small'
            onClick={() => setView('play')}
          >
            {t.done}
          </button>
        </header>
        <SettingsView
          settings={settings}
          setSettings={changeSettings}
          stats={stats}
          t={t}
        />
        <footer className='footer'>
          <a href='https://github.com/mardesnic/des-echo'>{t.source}</a>
        </footer>
      </main>
    );

  const result =
    song.over && !busy ? { length: song.notes.length, newRecord } : null;
  const best = stats.best[song.pads] ?? 0;

  const side = (p: Player) => (
    <Side
      player={p}
      song={song}
      lit={lit[p]}
      wobble={wobble}
      busy={busy}
      retrying={retrying}
      result={result}
      onPress={(pad) => onPress(p, pad)}
      onReplay={() => onReplay(p)}
      onPlayAgain={playAgain}
      t={t}
    />
  );

  return (
    <main className='duo'>
      {side(1)}

      <div className='middle'>
        <button
          className='tool'
          onClick={() => setView('settings')}
          aria-label={t.settings}
        >
          <Icon name='settings' />
        </button>
        <div className='middle__info'>
          <span className='record' aria-label={`${t.record}: ${best}`}>
            ★ {best}
          </span>
          {song.chances > 0 && (
            <span className='heart' role='img' aria-label={t.chance}>
              ♥
            </span>
          )}
        </div>
        <button
          className='tool'
          onClick={playAgain}
          disabled={!song.notes.length || song.over}
          aria-label={t.newSong}
        >
          <Icon name='clear' />
        </button>
      </div>

      {side(0)}

      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </main>
  );
}
