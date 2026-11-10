# Echo

A free music memory game for two young kids that works offline. Put the phone or tablet flat on the table between you: each player gets half of the screen, facing them. One plays a note, the other plays it back and adds one of their own, and the song grows a note every turn. How long a song can you make together?

Made for ages 5 and up. There is no timer, and the players don't play against each other: the song is theirs together. A wrong note ends the song, which then plays once more from start to end, and the players can try to beat their longest song.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-echo/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- Two players on one screen, each half turned to face its player
- Or play alone: the game adds a note each turn, and you play the whole song back
- 4 or 6 big buttons, each with its own colour, shape and note
- Notes from a pentatonic scale, so every song sounds nice
- Dots show how far into the song you are
- Hear the song again before your turn
- **Help**: the other player's buttons light up as notes are played, or sound only for a harder game
- **Second chance**: one free wrong note per song, if you like
- The longest song is kept as a record (for two and for one player), with confetti when you beat it
- Each new song starts with the other player
- Picks up where you left off after a reload
- Keeps the screen on while you play
- In English and Croatian, following the phone's language unless you pick one
- Light and dark mode
- No ads, accounts or tracking

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # game and translation tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.

The game rules are in `src/lib/echo.ts`. All sounds are made with Web Audio in `src/lib/sound.ts`, so there are no sound files.
