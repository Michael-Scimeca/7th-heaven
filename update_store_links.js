const fs = require('fs');

const albums = JSON.parse(fs.readFileSync('/Users/michaelscimeca/Desktop/7thHeaven/public/data/albums.json', 'utf8'));

// Mapping: album title (lowercased) -> { paypalId, appleMusicUrl }
const storeData = {
  'be here': {
    paypalId: 'CP5NWKWMEQMMJ',
    appleMusicUrl: 'https://music.apple.com/us/album/be-here/1574028989'
  },
  'color in motion': {
    paypalId: '898VXQMC4P56W',
    appleMusicUrl: 'https://itunes.apple.com/us/album/color-in-motion/1396991645'
  },
  'luminous': {
    paypalId: 'RNPJ563TQ8DZL',
    appleMusicUrl: 'https://itunes.apple.com/us/album/luminous/id1245773378'
  },
  'next': {
    paypalId: 'P385ETRMVMM6A',
    appleMusicUrl: 'https://itunes.apple.com/us/album/next/id1031165315'
  },
  'best of 1985 - 2015': {
    paypalId: 'U4ACSP4GA5B3S',
    appleMusicUrl: 'https://itunes.apple.com/us/album/the-best-of-1985-2015/id1033170582'
  },
  'the best of 1985-2015': {
    paypalId: 'U4ACSP4GA5B3S',
    appleMusicUrl: 'https://itunes.apple.com/us/album/the-best-of-1985-2015/id1033170582'
  },
  'spectrum': {
    paypalId: 'TJYYRSA9NWHPQ',
    appleMusicUrl: 'https://itunes.apple.com/us/album/spectrum/id888333305'
  },
  'synergy': {
    paypalId: 'XLBQNPTASJ7B6',
    appleMusicUrl: 'https://itunes.apple.com/us/album/synergy/id659349901?ls=1'
  },
  'dance media': {
    paypalId: 'AW55KXN7ZDXHU',
    appleMusicUrl: 'https://itunes.apple.com/us/album/dance-media/id757794685?ls=1'
  },
  'pop media': {
    paypalId: '2929EYL5RJUFL',
    appleMusicUrl: 'https://itunes.apple.com/us/album/pop-media/id450460483?ls=1'
  },
  'the time has come': {
    paypalId: '2929EYL5RJUFL',
    appleMusicUrl: 'https://itunes.apple.com/us/album/pop-media/id450460483?ls=1'
  },
  'jukebox': {
    paypalId: 'MVQ7MMZASE73J',
    appleMusicUrl: 'https://itunes.apple.com/us/album/jukebox/id393689012'
  },
  'u.s.a. - u.k.': {
    paypalId: 'DCWC6RSPJ2NDN',
    appleMusicUrl: 'https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewAlbum?id=311664465&s=143441'
  },
  'live at durty nellies': {
    paypalId: 'KCUNKPBZTKCFE',
    appleMusicUrl: 'https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewAlbum?id=311467213&s=143441'
  },
  'silver': {
    paypalId: 'B98PQAASXAT28',
    appleMusicUrl: 'https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewAlbum?id=309839472&s=143441'
  },
  'faces time replaces': {
    paypalId: 'S6JSA4226M5GQ',
    appleMusicUrl: 'https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewAlbum?id=309860257&s=143441'
  },
  'covered': {
    paypalId: 'B9NB2TDP2HV4Q',
    appleMusicUrl: 'https://music.apple.com/us/album/covered/1477195488'
  },
  'pop medley 4': {
    paypalId: '38CGNDFZR79G8',
    appleMusicUrl: ''
  },
  'pop medley 3': {
    paypalId: '7AWRBT3PQGXZG',
    appleMusicUrl: ''
  },
  'unplugged': {
    paypalId: '',
    appleMusicUrl: ''
  },
  'christmas 2018': {
    paypalId: '2E3CDEBG5KNH8',
    appleMusicUrl: 'https://itunes.apple.com/us/album/christmas-2018/1442330039'
  },
  'merry christmas in chicago': {
    paypalId: 'PSGCVG3FZRMHL',
    appleMusicUrl: 'https://itunes.apple.com/us/album/merry-christmas-in-chicago/id403959041#ls=1'
  },
  'christmas': {
    paypalId: 'V4YHM3T2MK658',
    appleMusicUrl: ''
  },
  'media overkill': {
    paypalId: '',
    appleMusicUrl: ''
  }
};

let updated = 0;
albums.forEach(album => {
  const titleLower = album.title.toLowerCase()
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
  
  const data = storeData[titleLower];
  if (data) {
    if (data.paypalId) {
      album.paypalButtonId = data.paypalId;
    }
    if (data.appleMusicUrl) {
      album.appleMusicUrl = data.appleMusicUrl;
    }
    updated++;
    console.log(`✓ Updated: ${album.title}`);
  } else {
    console.log(`  Skipped: ${album.title} (no match)`);
  }
});

console.log(`\nTotal updated: ${updated}/${albums.length}`);

fs.writeFileSync(
  '/Users/michaelscimeca/Desktop/7thHeaven/public/data/albums.json',
  JSON.stringify(albums, null, 2),
  'utf8'
);

console.log('✅ albums.json saved successfully');
