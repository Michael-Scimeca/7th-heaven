const https = require('https');
const fs = require('fs');
const path = require('path');

const fetchXML = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

const extractTags = (xml, tag) => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};

const extractItems = (xml) => {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      file: (/<file>(.*?)<\/file>/.exec(itemXml) || [])[1],
      image: (/<image>(.*?)<\/image>/.exec(itemXml) || [])[1],
      kind: (/<kind>(.*?)<\/kind>/.exec(itemXml) || [])[1],
      title: (/<title>(.*?)<\/title>/.exec(itemXml) || [])[1],
    });
  }
  return items;
};

async function scrape() {
  console.log("Fetching root playlist...");
  const rootXml = await fetchXML('https://7thheavenband.com/wimpy7/wimpy.php');
  const rootItems = extractItems(rootXml);
  
  const albums = [];
  
  const albumsToScrape = rootItems.filter(item => item.kind === 'xml');
  let existingAlbums = [];
  try {
    existingAlbums = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'data', 'albums.json')));
  } catch (e) {}
  
  for (const albumData of albumsToScrape) {
    console.log(`Fetching album: ${albumData.title}`);
    const encodedUrl = albumData.file.replace(/ /g, '%20');
    const albumXml = await fetchXML(encodedUrl);
    const tracks = extractItems(albumXml).filter(t => t.kind === 'mp3').map(t => {
      return {
        title: t.title,
        file: t.file.replace(/ /g, '%20'),
        image: t.image ? t.image.replace(/ /g, '%20') : undefined
      };
    });
    
    // Sort tracks alphabetically (usually numbers at start of title)
    tracks.sort((a, b) => a.title.localeCompare(b.title));
    
    const albumId = albumData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingAlbum = existingAlbums.find(a => a.id === albumId) || {};
    
    albums.push({
      id: albumId,
      title: existingAlbum.title || albumData.title.replace(/^\d+\s*/, ''),
      image: existingAlbum.image || (albumData.image ? albumData.image.replace(/ /g, '%20') : null),
      year: existingAlbum.year || "201X",
      type: existingAlbum.type || "ALBUM",
      spotifyUrl: existingAlbum.spotifyUrl,
      appleMusicUrl: existingAlbum.appleMusicUrl,
      tracks: tracks
    });
  }
  
  const outputDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outputDir, 'albums.json'), JSON.stringify(albums, null, 2));
  console.log("Scraping complete! Saved to public/data/albums.json");
}

scrape().catch(console.error);
