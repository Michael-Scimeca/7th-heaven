// Inject storeUrl, spotifyUrl, appleMusicUrl into albums.json
const fs = require('fs');
const ALBUMS_FILE = './public/data/albums.json';
const albumsData = JSON.parse(fs.readFileSync(ALBUMS_FILE, 'utf8'));

// Store page URLs (from https://7thheavenband.com/store.html)
const storeUrls = {
  "01-be-here": "https://7thheavenband.com/be-here.html",
  "07-color-in-motion": "https://7thheavenband.com/color-in-motion.html",
  "09-luminous": "https://7thheavenband.com/luminous.html",
  "10-next": "https://7thheavenband.com/next.html",
  "11-best-of-1985-2015": "https://7thheavenband.com/best-of.html",
  "13-spectrum": "https://7thheavenband.com/spectrum.html",
  "14-synergy": "https://7thheavenband.com/synergy.html",
  "15-dance-media": "https://7thheavenband.com/dance-media.html",
  "16-pop-media": "https://7thheavenband.com/pop-media.html",
  "17-jukebox": "https://7thheavenband.com/jukebox.html",
  "20-u-s-a-u-k-": "https://7thheavenband.com/usa-uk.html",
  "24-silver": "https://7thheavenband.com/silver.html",
  "26-faces-time-replaces": "https://7thheavenband.com/faces-time-replaces.html",
  "02-covered": "https://7thheavenband.com/covered.html",
  "08-pop-medley-4": "https://7thheavenband.com/pop-medley-4.html",
  "06-christmas-2018": "https://7thheavenband.com/chistmas-2018.html",
  "12-pop-medley-3": "https://7thheavenband.com/pop-medley-3.html",
  "18-medley": "https://7thheavenband.com/medley-cd.html",
  "22-unplugged": "https://7thheavenband.com/unplugged.html",
  "19-merry-christmas-in-chicago": "https://7thheavenband.com/merry-christmas.html",
  "21-christmas": "https://7thheavenband.com/christmas.html",
  "23-live-at-durty-nellies": "https://7thheavenband.com/live-at-durty-nellies.html",
};

// Apple Music artist page - link all albums to the artist page
// (individual album links would require manual lookup for each)
const APPLE_MUSIC_ARTIST = "https://music.apple.com/us/artist/7th-heaven/307436098";

// Spotify - link to artist search (individual album IDs would require API access)
const SPOTIFY_ARTIST = "https://open.spotify.com/search/7th%20heaven%20band";

albumsData.forEach(album => {
  album.storeUrl = storeUrls[album.id] || "";
  album.spotifyUrl = SPOTIFY_ARTIST;
  album.appleMusicUrl = APPLE_MUSIC_ARTIST;
});

fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albumsData, null, 2));
console.log("Done! Added storeUrl, spotifyUrl, and appleMusicUrl to all albums.");
