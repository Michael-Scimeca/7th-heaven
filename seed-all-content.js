// Seed ALL site content into Sanity
// Run: node seed-all-content.js

const { createClient } = require('@sanity/client');
const fs = require('fs');

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const client = createClient({
  projectId: '1dg5ciuj',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_API_TOKEN,
  useCdn: false,
});

// ══════════════════════════════════════
// SITE SETTINGS (Singleton)
// ══════════════════════════════════════
const siteSettings = {
  _type: 'siteSettings',
  _id: 'siteSettings',
  bandName: '7th Heaven',
  tagline: 'An experience you just have to see and hear.',
  subTagline: '40 years of rocking the world.',
  bioIntro: '7th heaven is an experience you just have to see and hear! 7th heaven has charted #1 on the Midwest Billboard Charts three times; and has had 7 major radio hits. The band has toured the world; playing: U.K., Ireland, Greece, Amsterdam, Panama, Mexico and all over the United States.',
  bioIntro2: 'The band has played Las Vegas numerous times, as well as played on 20 international cruise ships. Known for the famous "30 Songs in 30 Minutes" medley of songs from the 70\'s and 80\'s, 7th heaven has been an entertainment staple for 40 years. Playing around 200 shows a year, with an average of 100 outdoor events, 7th heaven has earned the right to say ..."We\'ve seen a million faces and rocked them all!"',
  stats: [
    { _key: 's1', number: '40+', label: 'Years Performing' },
    { _key: 's2', number: '#1', label: 'Billboard Charts' },
    { _key: 's3', number: '200+', label: 'Shows per Year' },
    { _key: 's4', number: '5,000+', label: 'Songs Written' },
  ],
  latestRelease: {
    title: "Ain't That Just Beautiful",
    year: '2025',
    duration: '3:35',
    type: 'Official Music Video',
    description: "The latest official music video from 7th heaven — a powerful rock ballad about seeing the beauty in everyday moments. Shot on location in Chicago, the video captures the band's signature high-energy performance style blended with cinematic storytelling.",
    youtubeId: 'BzHUNTZ66zY',
    buyLink: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ',
    spotifyLink: 'https://open.spotify.com',
    appleMusicLink: 'https://music.apple.com',
    credits: [
      { _key: 'c1', role: 'Written by', name: 'Adam Heisler & Richard Hofherr' },
      { _key: 'c2', role: 'Produced by', name: '7th Heaven' },
      { _key: 'c3', role: 'Directed by', name: 'Michael Scimeca' },
      { _key: 'c4', role: 'Mixed & Mastered', name: 'NTD Studios' },
    ],
  },
  socialLinks: [
    { _key: 'sl1', name: 'Spotify', url: 'https://open.spotify.com/artist/7thheavenband' },
    { _key: 'sl2', name: 'Apple Music', url: 'https://music.apple.com' },
    { _key: 'sl3', name: 'YouTube', url: 'https://www.youtube.com' },
    { _key: 'sl4', name: 'Facebook', url: 'https://www.facebook.com/7thheavenband' },
    { _key: 'sl5', name: 'Instagram', url: 'https://www.instagram.com' },
  ],
  platformLinks: [
    { _key: 'pl1', name: 'Apple Music', url: 'https://music.apple.com', label: 'Music' },
    { _key: 'pl2', name: 'Amazon', url: 'https://music.amazon.com', label: 'Amazon' },
    { _key: 'pl3', name: 'YouTube', url: 'https://www.youtube.com', label: 'YouTube' },
    { _key: 'pl4', name: 'Facebook', url: 'https://www.facebook.com/7thheavenband', label: 'Facebook' },
    { _key: 'pl5', name: 'Instagram', url: 'https://www.instagram.com', label: 'Instagram' },
    { _key: 'pl6', name: 'X', url: 'https://x.com', label: 'X / Twitter' },
    { _key: 'pl7', name: 'Myspace', url: 'https://myspace.com', label: 'Myspace' },
    { _key: 'pl8', name: 'ReverbNation', url: 'https://www.reverbnation.com', label: 'ReverbNation' },
    { _key: 'pl9', name: 'Spotify', url: 'https://open.spotify.com/artist/7thheavenband', label: 'Spotify' },
    { _key: 'pl10', name: 'Shazam', url: 'https://www.shazam.com', label: 'Shazam' },
    { _key: 'pl11', name: 'SoundCloud', url: 'https://soundcloud.com', label: 'SoundCloud' },
  ],
  endorsements: [
    { _key: 'e1', name: 'Shure', logoPath: '/images/sponsor-logos/SHURE.svg' },
    { _key: 'e2', name: 'Dunlop', logoPath: '/images/sponsor-logos/DUNLOP.svg' },
    { _key: 'e3', name: 'Mesa/Boogie', logoPath: '/images/sponsor-logos/Mesa_Boogie_Engineering_Logo.svg.svg' },
    { _key: 'e4', name: 'Paiste', logoPath: '/images/sponsor-logos/PRASISTE.svg' },
    { _key: 'e5', name: 'Ernie Ball', logoPath: '/images/sponsor-logos/ERNIEBALL.svg' },
    { _key: 'e6', name: 'Dean Markley', logoPath: '/images/sponsor-logos/Dean-Markley-logo.svg' },
    { _key: 'e7', name: 'Vic Firth', logoPath: '/images/sponsor-logos/VIC.svg' },
    { _key: 'e8', name: 'Parker', logoPath: '/images/sponsor-logos/Parker_guitars_logo.svg' },
    { _key: 'e9', name: 'Grundorf', logoPath: '/images/sponsor-logos/groundorf.svg' },
    { _key: 'e10', name: 'Toontrack', logoPath: '/images/sponsor-logos/TOON.svg' },
  ],
  contacts: [
    { _key: 'ct1', category: 'Booking', company: 'NTD Management', email: 'info@NTDManagement.com', phone: '847-551-5363' },
    { _key: 'ct2', category: 'Press • Media', company: 'NTD Records', name: 'Lenny Rago', email: 'LRago@NTDRecords.com', phone: '847-269-6200', note: 'No Bookings' },
    { _key: 'ct3', category: 'Technical • Production • Advance', name: 'Jeff Dobbs', email: 'jeffdobbs64@yahoo.com', phone: '847-772-5333', note: 'No Bookings' },
    { _key: 'ct4', category: 'Advance — Non-Technical', name: 'Alan McRae', email: 'Alan@NTDManagement.com', phone: '630-842-9129', note: 'No Bookings' },
  ],
  bookingPhone: '847-551-5363',
  bookingEmail: 'Rich@7thheaven.com',
  accomplishments: [
    'Three #1 Hit Songs on the Billboard Charts',
    'Seven Major Radio Hit Songs',
    'Five CDs reached #1 on the Billboard Charts',
    'Opened for "Bon Jovi" & "Kid Rock" at Soldier Field to 80,000 people',
    'Opened for "Styx" to 80,000 people',
    'Written/Recorded over 5,000 songs to date — Released over 1,000 original songs',
    'Released "Jukebox", a collection of 700 original songs',
    'Seen on NBC, ABC, FOX & WGN',
    'Performed around the world, including: London (U.K.), Dublin, Ireland, Amsterdam, Panama, Cabo San Lucas, Puerto Vallarta, Hawaii, Vegas (numerous times) and 20 international cruise ships',
    '"Beautiful Life" heard on the MTV show "Teen Mom 2" Episode 11 — Trouble in Paradise',
    '"She Could Use a Little Sunshine" currently played on the CBS Morning Show; and also in the Ziplock TV Commercial',
    'Performed the National Anthem at the Chicago Bulls / LA Lakers game — seen on worldwide TV',
    'Started in 1985 — 40 years ago (when we were little kids)',
    'Recognized as one of the biggest independent bands in the world',
    'Wrote & Performed TV/Radio Commercial for "Empress Casino"',
    'Wrote & Performed TV Commercial for "Walter E. Smithe / Chicago Cubs"',
    'Voted best band in Chicago thru Bar Star',
    'Mailing list is over 100,000 with 50,000+ Facebook likes',
    'Averages 100 outdoor festivals per year',
    "7th heaven's music has been heard on MTV",
    'Featured in Guitar Edge Magazine July/Aug 2006',
    'Endorsed by many major musical instrument manufacturers',
    'Packs venues across the Midwest U.S.',
    'Website receives an average of 100,000 hits per day',
    'Extremely high-energy live shows',
    'Six 7th heaven songs are in the film "Lizzie"',
    'One 7th heaven song in the film "Light Years Away"',
    'Appeared in numerous local, national & global magazines with featured articles',
    'Performed twice on the "Jenny Jones" TV Show (Over 75 million viewers Worldwide)',
    'Performed on the "Mancow\'s Morning Madhouse" radio show to over 1 million listeners',
    "7th heaven's original music is featured at numerous restaurants and retail outlets across the world",
  ],
  performedWith: [
    'Bon Jovi','Def Leppard','Journey','Rick Springfield','REO Speedwagon',
    'Foreigner','Styx','Sammy Hagar','The Fixx','Neon Trees','Mark McGrath',
    'Fitz and the Tantrums','Kid Rock','3 Doors Down','Filter','Pat Benatar',
    'Jefferson Starship','Survivor','Ratt','Cheap Trick','Bret Michaels',
    'Night Ranger','Huey Lewis and the News','Train','Warrant','Vixen',
    'Firehouse','Kansas','38 Special','Zebra','Joe Lynn Turner','Nelson',
    'Meat Loaf','Joan Jett & The Blackhearts','The Smithereens','Molly Hatchet',
    'Leann Rimes','John Waite','Eric Martin','The Outfield','Gin Blossoms',
    'Wasp','Europe','Lou Gramm','Great White','Bonham','Rare Earth',
    'Joe Walsh','Mitch Ryder & the Detroit Wheels','Bachman Turner Overdrive',
    'Badfinger','George Thorogood','Quiet Riot','The Spinners','Taylor Dayne',
    'Foghat','Ted Nugent','Tiffany',
  ],
  btsVideos: [
    { _key: 'bts1', youtubeId: 'BzHUNTZ66zY', title: "Making of 'Ain't That Just Beautiful'", subtitle: 'Behind the scenes of our latest music video shoot in Chicago', director: 'Michael Scimeca', year: 2025 },
    { _key: 'bts2', youtubeId: 'QIYHp2QpjkQ', title: 'Rehearsal Session', subtitle: 'A raw look at how 7th Heaven prepares for the stage', director: '7th Heaven', year: 2019 },
  ],
  navLinks: [
    { _key: 'n1', href: '/', label: 'Home' },
    { _key: 'n2', href: '/tour', label: 'Tour' },
    { _key: 'n3', href: '/bio', label: 'Bio' },
    { _key: 'n4', href: '/video', label: 'Video' },
    { _key: 'n5', href: '/shows', label: 'Past Shows' },
    { _key: 'n6', href: '/live/test-room', label: 'Live' },
    { _key: 'n7', href: '/fan-photo-wall', label: 'Fan Wall' },
    { _key: 'n8', href: '/book', label: 'Book' },
  ],
};

// ══════════════════════════════════════
// TOUR DATES
// ══════════════════════════════════════
const tourDates = [
  { venue: 'Station 34', city: 'Mt. Prospect', state: 'IL', date: '2026-01-02', time: '8:30pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged', directionsLink: 'https://www.google.com/maps/search/?api=1&query=Station+34+Mt+Prospect+IL', ticketLink: 'https://stationthirtyfour.com/events/', lat: 42.0640, lng: -87.9370 },
  { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-01-03', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor', directionsLink: 'https://www.google.com/maps/search/?api=1&query=Old+Republic+Elgin+IL', ticketLink: 'https://www.oldrepublicbar.com', lat: 42.0354, lng: -88.2826 },
  { venue: 'Rookies', city: 'Hoffman Est.', state: 'IL', date: '2026-01-09', time: '8:00pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged', directionsLink: 'https://www.google.com/maps/search/?api=1&query=Rookies+Hoffman+Estates+IL', ticketLink: 'https://www.rookiespub.com/hoffmanestates.html', lat: 42.0680, lng: -88.1200 },
  { venue: 'Private Event', city: '', state: '', date: '2026-01-10', time: '', day: 'Sat', notes: '' },
  { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-01-11', time: '2:00pm', day: 'Sun', notes: 'F.A.N. Show - Unplugged', directionsLink: 'https://www.google.com/maps/search/?api=1&query=Sundance+Saloon+Mundelein+IL', ticketLink: 'https://www.theoriginalsundancesaloon.com', lat: 42.2631, lng: -88.0037 },
  { venue: 'Chicago Music Cruise', city: 'Miami', state: 'FL', date: '2026-01-17', time: '', day: 'Sat', notes: 'MSC World America', ticketLink: 'http://www.chicagomusiccruise.com' },
  { venue: 'WGN TV News Segment', city: 'Chicago', state: 'IL', date: '2026-01-28', time: '10:00am', day: 'Wed', notes: 'TV Appearance', ticketLink: 'https://wgntv.com', lat: 41.8905, lng: -87.6358 },
  { venue: 'Youth Services Fundraiser', city: 'Wilmette', state: 'IL', date: '2026-01-30', time: '7:00pm', day: 'Fri', notes: 'Fundraiser - Join Us!', ticketLink: 'https://e.givesmart.com/events/Lk3/', lat: 42.0753, lng: -87.7256 },
  { venue: 'Des Plaines Theater', city: 'Des Plaines', state: 'IL', date: '2026-01-31', time: '9:00pm', day: 'Sat', notes: '', ticketLink: 'https://desplainestheatre.com', lat: 42.0334, lng: -87.8834 },
  { venue: 'Chicago Auto Show First Look', city: 'Chicago', state: 'IL', date: '2026-02-06', time: '7:30pm', day: 'Fri', notes: 'Ticketed Gala', ticketLink: 'https://www.chicagoautoshow.com/first-look-for-charity/' },
  { venue: 'Hard Rock Casino', city: 'Gary', state: 'IN', date: '2026-02-07', time: '9:00pm', day: 'Sat', notes: 'Casino Show', ticketLink: 'https://www.hardrockcasinonorthernindiana.com' },
  { venue: 'Durty Nellies', city: 'Palatine', state: 'IL', date: '2026-02-13', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://durtynellies.com', lat: 42.1103, lng: -88.0340 },
  { venue: 'Stage 119', city: 'Elmhurst', state: 'IL', date: '2026-02-14', time: '8:30pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.stage-events-elmhurst.com' },
  { venue: 'Jamos Live', city: 'Mokena', state: 'IL', date: '2026-02-20', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://www.jamoslive.com' },
  { venue: "Barb's Rescue Gala", city: 'Schaumburg', state: 'IL', date: '2026-02-21', time: '8:30pm', day: 'Sat', notes: 'Ticketed Gala', ticketLink: 'https://www.barbsrescue.org' },
  { venue: 'Evenflow', city: 'Geneva', state: 'IL', date: '2026-02-27', time: '9:30pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://evenflowmusic.com', lat: 41.8842, lng: -88.3059 },
  { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-02-28', time: '9:00pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.theoriginalsundancesaloon.com', lat: 42.2636, lng: -88.0040 },
  { venue: "Bannerman's", city: 'Bartlett', state: 'IL', date: '2026-03-06', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://bannermanssportsgrill.com' },
  { venue: 'Broken Oar', city: 'P. Barrington', state: 'IL', date: '2026-03-07', time: '9:00pm', day: 'Sat', notes: '', ticketLink: 'https://www.brokenoar.com' },
  { venue: 'Home Show', city: 'Chicago', state: 'IL', date: '2026-03-11', time: '', day: 'Tue', notes: 'McCormick Place', ticketLink: 'https://www.theinspiredhomeshow.com/events/' },
  { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-03-22', time: '9:00pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.theoriginalsundancesaloon.com', lat: 42.2636, lng: -88.0040 },
  { venue: 'Tailgaters', city: 'Bolingbrook', state: 'IL', date: '2026-03-27', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'http://www.tailgatersgrill.com' },
  { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-03-28', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor', ticketLink: 'https://www.oldrepublicbar.com', lat: 42.0354, lng: -88.2826 },
  { venue: "Rookie's Rockhouse", city: 'Hoffman Est.', state: 'IL', date: '2026-04-03', time: '8:00pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged', ticketLink: 'https://www.rookiespub.com/hoffmanestates.html', lat: 42.0680, lng: -88.1200 },
  { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-04-04', time: '9:00pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.theoriginalsundancesaloon.com', lat: 42.2636, lng: -88.0040 },
  { venue: "Corrigan's Pub", city: 'Shorewood', state: 'IL', date: '2026-04-10', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://corriganspub52.com' },
  { venue: 'Midway Sports', city: 'Bartlett', state: 'IL', date: '2026-04-11', time: '8:30pm', day: 'Sat', notes: 'All-Age till 10pm', ticketLink: 'https://midwaybartlett.com' },
  { venue: "Joe's Live", city: 'Rosemont', state: 'IL', date: '2026-04-17', time: '8:00pm', day: 'Thu', notes: '', ticketLink: 'https://www.joesliverosemont.com' },
  { venue: 'Stage 119', city: 'Elmhurst', state: 'IL', date: '2026-04-18', time: '8:30pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.stage-events-elmhurst.com' },
  { venue: 'Evenflow', city: 'Geneva', state: 'IL', date: '2026-04-24', time: '9:30pm', day: 'Thu', notes: '21 & Over', ticketLink: 'https://evenflowmusic.com', lat: 41.8842, lng: -88.3059 },
  { venue: 'Rochaus', city: 'West Dundee', state: 'IL', date: '2026-04-25', time: '9:00pm', day: 'Fri', notes: '', ticketLink: 'https://rochaus.com' },
  { venue: 'Station 34', city: 'Mt. Prospect', state: 'IL', date: '2026-05-01', time: '8:30pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged', ticketLink: 'https://stationthirtyfour.com/events/', lat: 42.0640, lng: -87.9370 },
  { venue: 'Deer Park Fest', city: 'Deer Park', state: 'IL', date: '2026-05-02', time: '6:00pm', day: 'Sat', notes: 'Outdoor All-Age Festival', isFestival: true },
  { venue: "Bannerman's", city: 'Bartlett', state: 'IL', date: '2026-05-08', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'https://bannermanssportsgrill.com' },
  { venue: 'Sideouts', city: 'Island Lake', state: 'IL', date: '2026-05-09', time: '9:00pm', day: 'Sat', notes: 'Outdoor Beer Garden', ticketLink: 'https://www.3dsideouts.com/events/7th-heaven/' },
  { venue: 'Durty Nellies', city: 'Palatine', state: 'IL', date: '2026-05-15', time: '9:00pm', day: 'Thu', notes: '21 & Over', ticketLink: 'https://durtynellies.com', lat: 42.1108, lng: -88.0345 },
  { venue: 'Tailgaters', city: 'Bolingbrook', state: 'IL', date: '2026-05-16', time: '9:00pm', day: 'Fri', notes: '21 & Over', ticketLink: 'http://www.tailgatersgrill.com' },
  { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-05-22', time: '9:00pm', day: 'Sat', notes: '21 & Over', ticketLink: 'https://www.theoriginalsundancesaloon.com', lat: 42.2636, lng: -88.0040 },
  { venue: 'Hard Rock Casino', city: 'Rockford', state: 'IL', date: '2026-05-23', time: '9:00pm', day: 'Fri', notes: 'Casino Show', ticketLink: 'https://casino.hardrock.com/rockford/entertainment/upcoming-events/7th-heaven' },
  { venue: "Bandito Barney's", city: 'East Dundee', state: 'IL', date: '2026-05-24', time: '9:00pm', day: 'Sat', notes: 'Outdoor' },
  { venue: 'Will County Beer & Bourbon Fest', city: 'Joliet', state: 'IL', date: '2026-05-29', time: '6:00pm', day: 'Thu', notes: 'Festival', isFestival: true, ticketLink: 'https://habitatwill.org/events/mix-of-26-beyond-beer-bourbon-fest/friday-event-details/' },
  { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-05-30', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor', ticketLink: 'https://www.oldrepublicbar.com', lat: 42.0354, lng: -88.2826 },
];

async function seed() {
  console.log('🎵 Seeding ALL content into Sanity...\n');

  // 1. Site Settings (createOrReplace for singleton)
  console.log('📋 Creating Site Settings...');
  await client.createOrReplace(siteSettings);
  console.log('  ✅ Site Settings created\n');

  // 2. Delete existing tour dates first
  console.log('🗑️  Clearing existing tour dates...');
  const existing = await client.fetch('*[_type == "tourDate"]._id');
  if (existing.length > 0) {
    const tx = client.transaction();
    existing.forEach(id => tx.delete(id));
    await tx.commit();
    console.log(`  ✅ Deleted ${existing.length} existing tour dates\n`);
  }

  // 3. Seed tour dates
  console.log('📅 Seeding tour dates...');
  for (const td of tourDates) {
    const doc = { _type: 'tourDate', isSoldOut: false, isFestival: false, ...td };
    const result = await client.create(doc);
    console.log(`  ✅ ${td.venue} (${td.city || 'TBD'}) — ${td.date} → ${result._id}`);
  }

  console.log(`\n🎉 Done! Seeded:`);
  console.log(`  • 1 Site Settings document`);
  console.log(`  • ${tourDates.length} tour dates`);
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
