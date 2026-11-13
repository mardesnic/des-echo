# Echo

A free music memory game for young kids that works offline. The game plays a song, you play it back, and the song grows a note every turn. How long a song can you remember?

Two kids can also play together: put the phone or tablet flat on the table between you, and each player gets half of the screen, facing them. One plays a note, the other plays it back and adds one of their own.

Made for ages 5 and up. There is no timer, and two players don't play against each other: the song is theirs together. A wrong note ends the song, which then plays once more from start to end, and you can try to beat your longest song.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-echo/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- Play alone: you play the first note, then the game adds a note each turn and you play the whole song back
- Or two players on one screen, each half turned to face its player
- 4 or 6 big buttons, each with its own colour, shape and note
- Notes from a pentatonic scale, so every song sounds nice
- Dots show how far into the song you are
- Hear the song again before your turn
- The buttons light up as notes play, on the other player's side too
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
