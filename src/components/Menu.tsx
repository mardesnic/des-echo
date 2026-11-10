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
          <span>{t.players}</span>
          <Segmented
            options={[1, 2] as const}
            value={settings.players}
            label={String}
            onChange={(players) => setSettings({ ...settings, players })}
          />
        </div>

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
            {PAD_COUNTS.map((n) => (
              <tr key={`solo-${n}`}>
                <th>{t.longestSolo(n)}</th>
                <td>{stats.solo[n] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
