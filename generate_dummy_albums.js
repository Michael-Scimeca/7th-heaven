const fs = require('fs');
const path = require('path');

const albumsRaw = [
  { title: "Be Here", year: "2021", type: "ALBUM", img: "images/behere.jpg" },
  { title: "Color In Motion", year: "2018", type: "ALBUM", img: "images/colorinmotion.jpg" },
  { title: "Luminous", year: "2017", type: "ALBUM", img: "images/luminous-sm.jpg" },
  { title: "Next", year: "2015", type: "ALBUM", img: "images/next_sm.jpg" },
  { title: "The Best of 1985 - 2015", year: "2015", type: "ALBUM", img: "images/best_sm.jpg" },
  { title: "Spectrum", year: "2014", type: "ALBUM", img: "images/spectrum_sm.jpg" },
  { title: "Synergy", year: "2013", type: "ALBUM", img: "images/synergy_sm.jpg" },
  { title: "Dance Media", year: "2012", type: "ALBUM", img: "images/dancemedia_sm.jpg" },
  { title: "Pop Media", year: "2011", type: "ALBUM", img: "images/popmedia_sm.jpg" },
  { title: "Jukebox", year: "2010", type: "ALBUM", img: "images/jukebox_sm.jpg" },
  { title: "U.S.A. - U.K.", year: "2008", type: "ALBUM", img: "images/usauk_sm.jpg" },
  { title: "Silver", year: "2004", type: "ALBUM", img: "images/silver_sm.jpg" },
  { title: "Faces Time Replaces", year: "2000", type: "ALBUM", img: "images/faces_sm.jpg" },
  { title: "Covered", year: "2019", type: "REMIXES", img: "images/covered.jpg" },
  { title: "Pop Medley 4", year: "2017", type: "REMIXES", img: "images/popmedley4.jpg" },
  { title: "Christmas 2018", year: "2018", type: "REMIXES", img: "images/christmas2018_sm.jpg" },
  { title: "Pop Medley 3", year: "2018", type: "REMIXES", img: "images/popmedley3_sm.jpg" },
  { title: "Medley CD/DVD", year: "2010", type: "REMIXES", img: "images/medley_sm.jpg" },
  { title: "Unplugged", year: "2009", type: "REMIXES", img: "images/unplugged_sm.jpg" },
  { title: "Merry Christmas in Chicago", year: "2012", type: "REMIXES", img: "images/christmas_sm.jpg" },
  { title: "Christmas CD", year: "2004", type: "REMIXES", img: "images/christmas2010_sm.jpg" }
];

const FAKE_MP3_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const albums = albumsRaw.map(a => {
  const coverUrl = `https://7thheavenband.com/${a.img}`;
  return {
    id: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: a.title,
    image: coverUrl,
    year: a.year,
    type: a.type,
    tracks: Array.from({ length: 8 }).map((_, i) => ({
      title: `${a.title} - Track ${i + 1}`,
      file: FAKE_MP3_URL,
      image: coverUrl
    }))
  };
});

fs.writeFileSync(path.join(__dirname, 'public/data/albums.json'), JSON.stringify(albums, null, 2));
console.log("Written dummy albums!");
