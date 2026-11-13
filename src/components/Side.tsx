import type { PointerEvent } from 'react';

import { isAdding, type Player, type Song } from '../lib/echo';
import type { Strings } from '../lib/i18n';
import { PADS, type Shape } from '../lib/pads';
import { Icon } from './Icon';

const SHAPES: Record<Shape, string> = {
  circle: 'M12 5a7 7 0 1 0 0 14 7 7 0 1 0 0-14z',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
  triangle: 'M12 4.5 20 19H4z',
  heart:
    'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z',
  square:
    'M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  moon: 'M15 4a8 8 0 1 0 5 13.5A7 7 0 0 1 15 4z',
};

export type Wobble = { player: Player; pad: number; key: number };

// One player's half of the screen: what to do now, how far into the song
// they are, and the pads. The top half is turned to face its player.
export function Side({
  player,
  song,
  lit,
  wobble,
  busy,
  result,
  onPress,
  onReplay,
  onPlayAgain,
  t,
}: {
  player: Player;
  song: Song;
  lit: number | null;
  wobble: Wobble | null;
  busy: boolean;
  result: { text: string; newRecord: boolean } | null;
  onPress: (pad: number) => void;
  onReplay: () => void;
  onPlayAgain: () => void;
  t: Strings;
}) {
  const solo = song.players === 1;
  const mine = song.turn === player && !song.over;
  // Alone, the game's turn is while it adds a note and plays the song;
  // the first note is the player's.
  const gameTurn = solo && (busy || (isAdding(song) && song.notes.length > 0));
  const active = mine && !busy && !gameTurn;
  const pads = PADS[song.pads];

  const prompt = !mine
    ? song.over
      ? ''
      : t.listen
    : gameTurn
      ? t.listen
      : !song.notes.length
        ? t.first
        : isAdding(song)
          ? t.add
          : t.repeat;

  // Taps react on touch down, without the click delay; a click with no
  // pointer behind it is the keyboard.
  const down = (pad: number) => (e: PointerEvent) => {
    if (e.button) return;
    e.preventDefault();
    onPress(pad);
  };

  return (
    <section
      className={[
        'side',
        player === 1 && 'side--top',
        mine && !gameTurn && 'side--turn',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className='status'>
        <div>
          <p className='prompt' aria-live='polite'>
            {prompt}
          </p>
          {!song.over && song.notes.length > 0 && (
            <div className='dots' aria-hidden='true'>
              {song.notes.map((_, i) => (
                <span
                  key={i}
                  className={i < song.step ? 'dot dot--on' : 'dot'}
                />
              ))}
              {mine && !solo && isAdding(song) && (
                <span className='dot dot--new' />
              )}
            </div>
          )}
        </div>
        {mine && !gameTurn && song.notes.length > 0 && song.step === 0 && (
          <button
            className='tool'
            onClick={onReplay}
            disabled={busy}
            aria-label={t.replay}
          >
            <Icon name='replay' />
          </button>
        )}
      </div>

      <div className='pads-area'>
        <div className={`pads pads--${song.pads}`}>
          {pads.map((p, i) => (
            <button
              key={
                wobble?.player === player && wobble.pad === i
                  ? `${i}-${wobble.key}`
                  : i
              }
              className={[
                'pad',
                lit === i && 'pad--lit',
                wobble?.player === player && wobble.pad === i && 'pad--wobble',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ color: p.colour }}
              disabled={!active}
              aria-label={t.pad(i + 1)}
              onPointerDown={down(i)}
              onClick={(e) => e.detail === 0 && onPress(i)}
            >
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d={SHAPES[p.shape]} />
              </svg>
            </button>
          ))}
        </div>

        {result && (
          <div className='result'>
            <div className='result__card'>
              <p className='result__icon' aria-hidden='true'>
                🎵
              </p>
              <h2>{result.text}</h2>
              {result.newRecord && (
                <p className='result__record'>{t.newRecord}</p>
              )}
              <button className='button' onClick={onPlayAgain}>
                {t.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
