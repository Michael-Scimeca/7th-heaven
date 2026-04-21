// This script manually injects the credits and lineup data extracted from
// each album page on https://7thheavenband.com/store.html
const fs = require('fs');
const ALBUMS_FILE = './public/data/albums.json';
const albumsData = JSON.parse(fs.readFileSync(ALBUMS_FILE, 'utf8'));

// Map of album ID -> { lineup, credits }
// Extracted by reading each individual album page on the official store
const creditsMap = {
  "01-be-here": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Frankie Harchut - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr & Adam Heisler",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "07-color-in-motion": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr & Adam Heisler",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "09-luminous": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr & Adam Heisler",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "10-next": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Additional Background Vocals: Josie Treffy, Rose",
      "Additional Keyboards: Christian Cullen"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr & Adam Heisler",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "11-best-of-1985-2015": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Tony DiGiulio - Lead Vocals",
      "Keith Semple - Lead Vocals",
      "Andrew Blake - Lead Vocals",
      "Anthony Federov - Lead Vocals",
      "Michael Sean - Lead Vocals",
      "Dan Miller - Drums",
      "Danny Weymouth - Bass, Vocals",
      "Jeff Vincent - Vocals",
      "Matt Clark - Vocals"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "13-spectrum": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "14-synergy": {
    lineup: [
      "Anthony Federov - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Additional production, Back-Up Vocals & Keyboards by: Evan Parness for Station Creation, NYC on \"I Begin Again\"",
      "Additional production, Back-Up Vocals & Keyboards by: Jeff Vincent on \"Rhianna\" & \"Take My Heart\"",
      "Additional Piano on \"I Begin Again\" by: Bill Grainer",
      "Additional Back-Up Vocals by: Tony DiGiulio"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "15-dance-media": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "16-pop-media": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "17-jukebox": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Dan Miller - Drums",
      "Danny Weymouth - Bass",
      "Andrew Blake - Vocals",
      "Matt Clark - Vocals",
      "Mark Jones - Vocals",
      "Tony DiGulio - Vocals",
      "Michael Sean - Vocals",
      "Peter Greco - Vocals",
      "Vic Vasquez - Vocals",
      "Famous Amos - Vocals",
      "Chris Senior - Bass",
      "Stephen Jensen - Bass",
      "Dan Cassidy - Vocals",
      "Melissa Dye - Vocals",
      "Sean Albrecht - Vocals"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "20-u-s-a-u-k-": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Dan Miller - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "24-silver": {
    lineup: [
      "Andrew Blake - Lead Vocals, Guitars, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Mark Kennetz - Bass, Vocals",
      "Dan Miller - Drums",
      "Additional Vocals: Matt Clark, Mark Jones"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "26-faces-time-replaces": {
    lineup: [
      "Tony DiGiulio - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Danny Weymouth - Bass, Vocals",
      "Nick Cox - Guitars, Vocals",
      "Dan Miller - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "02-covered": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Additional Back-Up Vocals: Keith Semple, Tony Di Giulio, Tamara Mooshey"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr & Adam Heisler",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "08-pop-medley-4": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "06-christmas-2018": {
    lineup: [
      "Adam Heisler - Lead Vocals, Guitar, Keys",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Additional Vocals: Dino Manzella, Tamara Mooshey",
      "Additional Background Vocals: Keith Semple, Andrew Blake, Tony DiGiulio"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "12-pop-medley-3": {
    lineup: [
      "Adam Heisler - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Mark Kennetz - Bass, Vocals",
      "Nick Cox - Guitars, Vocals",
      "Michael Mooshy - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "18-medley": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Mark Kennetz - Bass, Vocals",
      "Nick Cox - Guitars, Vocals",
      "Michael Mooshey - Drums",
      "Dan Miller - Drums",
      "Additional Vocals by: Andrew Blake & Tony Di Giulio"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "22-unplugged": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Tamara Mooshey - Vocals"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "19-merry-christmas-in-chicago": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums",
      "Tamara Mooshey - Vocals"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "21-christmas": {
    lineup: [
      "Andrew Blake - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Mark Kennetz - Bass, Vocals",
      "Dan Miller - Drums",
      "Additional Vocals by: Erica Heiden, Dino Manzella, Melissa Dye, Nick Cox & Sean Albrecht"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  },
  "23-live-at-durty-nellies": {
    lineup: [
      "Keith Semple - Lead Vocals",
      "Richard Hofherr - Guitars, Vocals, Keys",
      "Nick Cox - Guitars, Vocals",
      "Mark Kennetz - Bass, Vocals",
      "Michael Mooshey - Drums"
    ],
    credits: [
      "Produced, Engineered & Arranged by: Richard Hofherr",
      "Mixed & Mastered by: Richard Hofherr",
      "Recorded at: NTD Studios",
      "Graphics by: NTD Graphics"
    ]
  }
};

// Apply the credits map to albums.json
let matched = 0;
let unmatched = 0;
albumsData.forEach(album => {
  if (creditsMap[album.id]) {
    album.lineup = creditsMap[album.id].lineup;
    album.credits = creditsMap[album.id].credits;
    matched++;
  } else {
    // Albums not on the store (Pop Medley 5, Pop Medley 6, Club Medley 1,
    // 70's & 80's Original Medley, Pop Life, Sampler Vol 1, The Time Has Come, Media Overkill)
    // These don't have individual store pages
    album.lineup = album.lineup || [];
    album.credits = album.credits || [];
    unmatched++;
  }
});

fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albumsData, null, 2));
console.log(`Done! Matched ${matched} albums, ${unmatched} albums have no store page.`);
console.log('Unmatched albums:');
albumsData.filter(a => !creditsMap[a.id]).forEach(a => console.log(`  - ${a.title} (${a.id})`));
