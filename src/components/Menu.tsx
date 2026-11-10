import { PAD_COUNTS, type Stats } from '../lib/echo';
import { LANG_NAMES, LANGS, type Language, type Strings } from '../lib/i18n';
import type { Settings } from '../lib/settings';

function Segmented<T>({
  options,
  value,
  label,
  onChange,
}: {
  options: readonly T[];
  value: T;
  label: (o: T) => string;
  onChange: (o: T) => void;
}) {
  return (
    <div className='segmented'>
      {options.map((o) => (
        <button
          key={String(o)}
          aria-pressed={value === o}
          onClick={() => onChange(o)}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

export function SettingsView({
  settings,
  setSettings,
  stats,
  t,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  stats: Stats;
  t: Strings;
}) {
  const languages: Language[] = ['auto', ...LANGS];

  return (
    <>
      <section className='card'>
        <h2>{t.settings}</h2>

        <div className='field'>
          <span>{t.pads}</span>
          <Segmented
            options={PAD_COUNTS}
            value={settings.pads}
            label={String}
            onChange={(pads) => setSettings({ ...settings, pads })}
          />
        </div>

        <div className='field'>
          <span>
            {t.lights}
            <span className='muted'>{t.lightsHint}</span>
          </span>
          <Segmented
            options={[true, false]}
            value={settings.lights}
            label={(on) => (on ? t.lightsOn : t.lightsOff)}
            onChange={(lights) => setSettings({ ...settings, lights })}
          />
        </div>

        <div className='field'>
          <span>{t.mistakes}</span>
          <Segmented
            options={[false, true]}
            value={settings.secondChance}
            label={(on) => (on ? t.secondChance : t.strict)}
            onChange={(secondChance) =>
              setSettings({ ...settings, secondChance })
            }
          />
        </div>

        <div className='field'>
          <span>{t.language}</span>
          <Segmented
            options={languages}
            value={settings.language}
            label={(l) => (l === 'auto' ? t.automatic : LANG_NAMES[l])}
            onChange={(language) => setSettings({ ...settings, language })}
          />
        </div>
      </section>

      <section className='card'>
        <h2>{t.statistics}</h2>
        <table className='stats'>
          <tbody>
            <tr>
              <th>{t.songsPlayed}</th>
              <td>{stats.songs}</td>
            </tr>
            {PAD_COUNTS.map((n) => (
              <tr key={n}>
                <th>{t.longest(n)}</th>
                <td>{stats.best[n] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
