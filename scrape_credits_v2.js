const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const BASE_URL = 'https://7thheavenband.com/';
const ALBUMS_FILE = './public/data/albums.json';

const fetchHtml = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if(res.statusCode !== 200) return reject(new Error('Status: ' + res.statusCode));
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

async function scrapeCredits() {
  const albumsData = JSON.parse(fs.readFileSync(ALBUMS_FILE, 'utf8'));

  for (let i = 0; i < albumsData.length; i++) {
    const album = albumsData[i];
    
    let filename = album.id.replace(/^\d+-/, '') + '.html';
    
    // Hardcoded overrides for known odd URLs
    if (album.id.includes('pop-medley-3')) filename = 'pop-medley-3.html';
    if (album.id.includes('pop-medley-4')) filename = 'pop-medley-4.html';
    if (album.id.includes('best-of')) filename = 'best-of.html';
    if (album.id.includes('christmas-2018')) filename = 'chistmas-2018.html';
    if (album.id.includes('faces-time-replaces')) filename = 'faces-times-replaces.html';
    if (album.id.includes('covered')) filename = 'covered.html';
    if (album.id.includes('live-at-soldier-field')) filename = 'live-at-solider-field.html';
    if (album.id.includes('medley-cd-dvd')) filename = 'medley-cd.html';
    if (album.id.includes('christmas-cd')) filename = 'christmas.html';

    console.log(`Scraping ${filename}...`);
    try {
      const html = await fetchHtml(BASE_URL + filename);
      const $ = cheerio.load(html);
      
      // Iterate through all text nodes linearly in the DOM to keep order
      const lines = [];
      $('*').contents().each((_, el) => {
         if (el.nodeType === 3) {
            let t = $(el).text().trim().replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
            if (t) lines.push(t);
         }
      });
      
      album.lineup = [];
      album.credits = [];

      let section = null;
      for (let j = 0; j < lines.length; j++) {
         let line = lines[j].toLowerCase();
         // Start markers
         if (line.includes('line-up on this cd') || line === 'line-up') {
             section = 'lineup';
             continue;
         } else if (line.includes('credits') && line.length < 15) {
             section = 'credits';
             continue;
         } else if (line.includes('product upc') || line.includes('ntd records') || /^\d+\./.test(line)) {
             break; // End of section
         }
         
         // Ignore random navigational noise
         if (line.includes('home') || line.includes('store') || line.includes('facebook')) continue;

         if (section === 'lineup') {
             // Handle "Adam Heisler - Lead Vocals" structure if split
             if(album.lineup.length > 0 && lines[j].startsWith('-')) {
                 album.lineup[album.lineup.length - 1] += ' ' + lines[j];
             } else {
                 album.lineup.push(lines[j]);
             }
         } else if (section === 'credits') {
             album.credits.push(lines[j]);
         }
      }
      
      // Clean up concatenated weirdness
      album.lineup = album.lineup.filter(l => l.length > 2);
      album.credits = album.credits.filter(l => l.length > 2);
      
      console.log(`-- Found ${album.lineup.length} Line-Up items and ${album.credits.length} Credits items.`);

    } catch (err) {
       console.log(`-- Failed to fetch/parse ${filename}: ${err.message}`);
    }
  }

  fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albumsData, null, 2));
  console.log("Updated albums.json with robust V2 scraper!");
}

scrapeCredits();
