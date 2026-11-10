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
  chance: 'Second chance',
  pad: (n: number) => `Note ${n}`,
  listen: 'Listen…',
  first: 'Play the first note',
  repeat: 'Play the song back',
  add: 'Now add a new note!',
  tryAgain: 'Try again!',
  replay: 'Hear the song again',
  songHad: (n: number) =>
    `Your song had ${count('en', n, { one: 'note', other: 'notes' })}!`,
  newRecord: 'New record!',
  playAgain: 'Play again',
  pads: 'Buttons',
  lights: 'Help',
  lightsOn: 'Lights and sound',
  lightsOff: 'Sound only',
  lightsHint:
    'With lights, the other side lights up too, and so does the song when you hear it again.',
  mistakes: 'Wrong note',
  strict: 'Ends the song',
  secondChance: 'Second chance',
  language: 'Language',
  automatic: 'Automatic',
  statistics: 'Statistics',
  songsPlayed: 'Songs played',
  longest: (pads: number) => `Longest song, ${pads} buttons`,
  source: 'Source',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Jeka',
  settings: 'Postavke',
  done: 'Gotovo',
  newSong: 'Nova pjesma',
  record: 'Najduža pjesma',
  chance: 'Druga prilika',
  pad: (n: number) => `Nota ${n}`,
  listen: 'Slušaj…',
  first: 'Odsviraj prvu notu',
  repeat: 'Ponovi pjesmu',
  add: 'Sad dodaj novu notu!',
  tryAgain: 'Pokušaj ponovno!',
  replay: 'Poslušaj pjesmu ponovno',
  songHad: (n: number) =>
    `Vaša pjesma ima ${count('hr', n, { one: 'notu', few: 'note', other: 'nota' })}!`,
  newRecord: 'Novi rekord!',
  playAgain: 'Igraj ponovno',
  pads: 'Gumbi',
  lights: 'Pomoć',
  lightsOn: 'Svjetla i zvuk',
  lightsOff: 'Samo zvuk',
  lightsHint:
    'Sa svjetlima zasvijetli i druga strana, a i pjesma kad je slušaš ponovno.',
  mistakes: 'Kriva nota',
  strict: 'Završava pjesmu',
  secondChance: 'Druga prilika',
  language: 'Jezik',
  automatic: 'Automatski',
  statistics: 'Statistika',
  songsPlayed: 'Odsvirane pjesme',
  longest: (pads: number) => `Najduža pjesma, ${pads} gumba`,
  source: 'Izvorni kod',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
