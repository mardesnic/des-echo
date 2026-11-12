export const LANGS = ['en', 'hr'] as const;
export type Lang = (typeof LANGS)[number];
export type Language = 'auto' | Lang;

// Each language's name in that language, for the picker.
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  return preferred.some((l) => l.toLowerCase().startsWith('hr')) ? 'hr' : 'en';
}

type Forms = { one: string; few?: string; other: string };

// Croatian has three plural forms: 1 notu, 2 note, 5 nota.
const count = (lang: Lang, n: number, forms: Forms) => {
  const form = new Intl.PluralRules(lang).select(n) as keyof Forms;
  return `${n} ${forms[form] ?? forms.other}`;
};

const en = {
  title: 'Echo',
  settings: 'Settings',
  done: 'Done',
  newSong: 'New song',
  record: 'Longest song',
  pad: (n: number) => `Note ${n}`,
  listen: 'Listen…',
  first: 'Play the first note',
  repeat: 'Play the song back',
  add: 'Now add a new note!',
  replay: 'Hear the song again',
  songHad: (n: number) =>
    `Your song had ${count('en', n, { one: 'note', other: 'notes' })}!`,
  playedBack: (n: number) =>
    `You played back ${count('en', n, { one: 'note', other: 'notes' })}!`,
  haveAnotherGo: 'Have another go!',
  newRecord: 'New record!',
  playAgain: 'Play again',
  players: 'Players',
  pads: 'Buttons',
  language: 'Language',
  automatic: 'Automatic',
  statistics: 'Statistics',
  songsPlayed: 'Songs played',
  longest: (pads: number) => `Longest song, ${pads} buttons`,
  longestSolo: (pads: number) => `Alone, ${pads} buttons`,
  allGames: 'All games',
  source: 'Source',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Jeka',
  settings: 'Postavke',
  done: 'Gotovo',
  newSong: 'Nova pjesma',
  record: 'Najduža pjesma',
  pad: (n: number) => `Nota ${n}`,
  listen: 'Slušaj…',
  first: 'Odsviraj prvu notu',
  repeat: 'Ponovi pjesmu',
  add: 'Sad dodaj novu notu!',
  replay: 'Poslušaj pjesmu ponovno',
  songHad: (n: number) =>
    `Vaša pjesma ima ${count('hr', n, { one: 'notu', few: 'note', other: 'nota' })}!`,
  playedBack: (n: number) =>
    `Ponovljeno: ${count('hr', n, { one: 'nota', few: 'note', other: 'nota' })}!`,
  haveAnotherGo: 'Probaj opet!',
  newRecord: 'Novi rekord!',
  playAgain: 'Igraj ponovno',
  players: 'Igrači',
  pads: 'Gumbi',
  language: 'Jezik',
  automatic: 'Automatski',
  statistics: 'Statistika',
  songsPlayed: 'Odsvirane pjesme',
  longest: (pads: number) => `Najduža pjesma, ${pads} gumba`,
  longestSolo: (pads: number) => `Solo, ${pads} gumba`,
  allGames: 'Sve igre',
  source: 'Izvorni kod',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
