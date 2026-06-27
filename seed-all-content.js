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
  {
    "venue": "Station 34",
    "city": "Mt. Prospect",
    "state": "IL",
    "date": "2026-01-02",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.0664167,
    "lng": -87.9372908
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-01-03",
    "time": "8:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "Rookies",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-01-09",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-01-10",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-01-11",
    "time": "2:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Chicago Music Cruise",
    "city": "Miami",
    "state": "FL",
    "date": "2026-01-17",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": 25.7741566,
    "lng": -80.1935973
  },
  {
    "venue": "WGN TV News Segment",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-01-28",
    "time": "10:00am",
    "day": "Wed",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Youth Services Fundraiser",
    "city": "Wilmette",
    "state": "IL",
    "date": "2026-01-30",
    "time": "7:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.0887132,
    "lng": -87.7025069
  },
  {
    "venue": "Des Plaines Theater",
    "city": "Des Plaines",
    "state": "IL",
    "date": "2026-01-31",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0415823,
    "lng": -87.8873916
  },
  {
    "venue": "Chicago Auto Show First Look",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-02-06",
    "time": "7:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Hard Rock Casino",
    "city": "Gary",
    "state": "IN",
    "date": "2026-02-07",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.5702561,
    "lng": -87.3365496
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-02-11",
    "time": "",
    "day": "Wed",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Durty Nellies",
    "city": "Palatine",
    "state": "IL",
    "date": "2026-02-13",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1105502,
    "lng": -88.0434304
  },
  {
    "venue": "Stage 119",
    "city": "Elmurst",
    "state": "IL",
    "date": "2026-02-14",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Jamos Live",
    "city": "Mokena",
    "state": "IL",
    "date": "2026-02-20",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.5261437,
    "lng": -87.8892189
  },
  {
    "venue": "Jamo's Live",
    "city": "Mokena",
    "state": "IL",
    "date": "2026-02-20",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.5261437,
    "lng": -87.8892189
  },
  {
    "venue": "Barb's Rescue Gala",
    "city": "Schaumburg",
    "state": "IL",
    "date": "2026-02-21",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0333608,
    "lng": -88.083406
  },
  {
    "venue": "Evenflow",
    "city": "Geneva",
    "state": "IL",
    "date": "2026-02-27",
    "time": "9:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8875281,
    "lng": -88.3053525
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-02-28",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-03-01",
    "time": "",
    "day": "Sun",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Bannerman's",
    "city": "Bartlett",
    "state": "IL",
    "date": "2026-03-06",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9908485,
    "lng": -88.1850028
  },
  {
    "venue": "Broken Oar",
    "city": "P. Barrington",
    "state": "IL",
    "date": "2026-03-07",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1539141,
    "lng": -88.1361888
  },
  {
    "venue": "Home Show",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-03-11",
    "time": "",
    "day": "Wed",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Home Show McCormick Place",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-03-11",
    "time": "5:30pm",
    "day": "Wed",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-03-22",
    "time": "2:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "date": "2026-03-27",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.7003302,
    "lng": -88.0717708
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-03-28",
    "time": "8:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "Rookie's Rockhouse",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-04-03",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-04-04",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Corrigan's Pub",
    "city": "Shorewood",
    "state": "IL",
    "date": "2026-04-10",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.5200305,
    "lng": -88.2017293
  },
  {
    "venue": "Midway Sports",
    "city": "Bartlett",
    "state": "IL",
    "date": "2026-04-11",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.9908485,
    "lng": -88.1850028
  },
  {
    "venue": "Joe's Live",
    "city": "Rosemont",
    "state": "IL",
    "date": "2026-04-17",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9941334,
    "lng": -87.8756737
  },
  {
    "venue": "Joe's Live - Parkinson's Show",
    "city": "Rosemont",
    "state": "IL",
    "date": "2026-04-17",
    "time": "7:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9941334,
    "lng": -87.8756737
  },
  {
    "venue": "Stage 119",
    "city": "Elmurst",
    "state": "IL",
    "date": "2026-04-18",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Evenflow",
    "city": "Geneva",
    "state": "IL",
    "date": "2026-04-24",
    "time": "9:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8875281,
    "lng": -88.3053525
  },
  {
    "venue": "Rochaus",
    "city": "West Dundee",
    "state": "IL",
    "date": "2026-04-25",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0980812,
    "lng": -88.2828581
  },
  {
    "venue": "Station 34",
    "city": "Mt. Prospect",
    "state": "IL",
    "date": "2026-05-01",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.0664167,
    "lng": -87.9372908
  },
  {
    "venue": "Deer Park Fest",
    "city": "Deer Park",
    "state": "IL",
    "date": "2026-05-02",
    "time": "6:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1608585,
    "lng": -88.0814651
  },
  {
    "venue": "Town Center ParkGrand Opening",
    "city": "Deer Park",
    "state": "IL",
    "date": "2026-05-02",
    "time": "6:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1608585,
    "lng": -88.0814651
  },
  {
    "venue": "Bannerman's",
    "city": "Bartlett",
    "state": "IL",
    "date": "2026-05-08",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9908485,
    "lng": -88.1850028
  },
  {
    "venue": "Sideouts",
    "city": "Island Lake",
    "state": "IL",
    "date": "2026-05-09",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.2761341,
    "lng": -88.1920272
  },
  {
    "venue": "Durty Nellies",
    "city": "Palatine",
    "state": "IL",
    "date": "2026-05-15",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1105502,
    "lng": -88.0434304
  },
  {
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "date": "2026-05-16",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.7003302,
    "lng": -88.0717708
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-05-22",
    "time": "7:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Hard Rock Casino",
    "city": "Rockford",
    "state": "IL",
    "date": "2026-05-23",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.2713945,
    "lng": -89.093966
  },
  {
    "venue": "Bandito Barney's",
    "city": "East Dundee",
    "state": "IL",
    "date": "2026-05-24",
    "time": "3:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.0989145,
    "lng": -88.2714689
  },
  {
    "venue": "Will County Beer & Bourbon Fest",
    "city": "Joliet",
    "state": "IL",
    "date": "2026-05-29",
    "time": "7:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.5263603,
    "lng": -88.0840212
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-05-30",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "CD & ME",
    "city": "Frankfort",
    "state": "IL",
    "date": "2026-06-04",
    "time": "9:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.4979467,
    "lng": -87.8495946
  },
  {
    "venue": "Schiller Park Greek Fest",
    "city": "Schiller Park",
    "state": "IL",
    "date": "2026-06-05",
    "time": "7:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9558637,
    "lng": -87.8708965
  },
  {
    "venue": "Hard Rock Casino",
    "city": "Gary",
    "state": "IN",
    "date": "2026-06-06",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.5702561,
    "lng": -87.3365496
  },
  {
    "venue": "Private Corporate Event",
    "city": "",
    "state": "IL",
    "date": "2026-06-07",
    "time": "",
    "day": "Sun",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "CANCELLED - NOW AUG 19",
    "city": "Hinsdale",
    "state": "IL",
    "date": "2026-06-11",
    "time": "6:30pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.8024604,
    "lng": -87.9299841
  },
  {
    "venue": "Racine Harbor Fest",
    "city": "Racine",
    "state": "WI",
    "date": "2026-06-12",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.7313756,
    "lng": -87.7834769
  },
  {
    "venue": "Hideaway Brew Garden",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-06-13",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-06-17",
    "time": "",
    "day": "Wed",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Potter's Place",
    "city": "Naperville",
    "state": "IL",
    "date": "2026-06-18",
    "time": "7:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.7728699,
    "lng": -88.1479278
  },
  {
    "venue": "Elmhurst Greek Fest",
    "city": "Elmhurst",
    "state": "IL",
    "date": "2026-06-19",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8994745,
    "lng": -87.9403418
  },
  {
    "venue": "Prospect Hts Block Party Fest",
    "city": "Prospect Hts",
    "state": "IL",
    "date": "2026-06-20",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0953049,
    "lng": -87.9375694
  },
  {
    "venue": "Broken Oar",
    "city": "P. Barrington",
    "state": "IL",
    "date": "2026-06-21",
    "time": "4:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.1539141,
    "lng": -88.1361888
  },
  {
    "venue": "Winnetka CITP",
    "city": "Winnetka",
    "state": "IL",
    "date": "2026-06-24",
    "time": "7:00pm",
    "day": "Wed",
    "notes": "",
    "lat": 42.1080703,
    "lng": -87.7365286
  },
  {
    "venue": "Wauconda Fest",
    "city": "Wauconda",
    "state": "IL",
    "date": "2026-06-25",
    "time": "7:30pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.2589122,
    "lng": -88.1392474
  },
  {
    "venue": "Milwaukee Summerfest",
    "city": "Milwaukee",
    "state": "WI",
    "date": "2026-06-26",
    "time": "3:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 43.0386475,
    "lng": -87.9090751
  },
  {
    "venue": "Wheeling Rock The Runway",
    "city": "Wheeling",
    "state": "IL",
    "date": "2026-06-27",
    "time": "6:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.138889,
    "lng": -87.9310944
  },
  {
    "venue": "Rotary GroveFest",
    "city": "Downers Gro.",
    "state": "IL",
    "date": "2026-06-27",
    "time": "9:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.7936822,
    "lng": -88.0102281
  },
  {
    "venue": "York Township Fest",
    "city": "Lombard",
    "state": "IL",
    "date": "2026-06-28",
    "time": "5:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 41.8864687,
    "lng": -88.0201536
  },
  {
    "venue": "Arlington Hts Frontier Days",
    "city": "Arlington Hts",
    "state": "IL",
    "date": "2026-07-01",
    "time": "8:00pm",
    "day": "Wed",
    "notes": "",
    "lat": 42.0811563,
    "lng": -87.9802164
  },
  {
    "venue": "Bartlett Fest",
    "city": "Bartlett",
    "state": "IL",
    "date": "2026-07-02",
    "time": "9:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.9908485,
    "lng": -88.1850028
  },
  {
    "venue": "Hoffman Estates Fest Fireworks",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-07-03",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Mt. Prospect Lions Fest",
    "city": "Mt. Prospect",
    "state": "IL",
    "date": "2026-07-05",
    "time": "9:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.0664167,
    "lng": -87.9372908
  },
  {
    "venue": "Taste of Park Ridge",
    "city": "Park Ridge",
    "state": "IL",
    "date": "2026-07-09",
    "time": "8:30pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.0112329,
    "lng": -87.8406031
  },
  {
    "venue": "Norridge Island in the City Fest",
    "city": "Norridge",
    "state": "IL",
    "date": "2026-07-10",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9633641,
    "lng": -87.827284
  },
  {
    "venue": "Batavia Windmill Fest",
    "city": "Batavia",
    "state": "IL",
    "date": "2026-07-11",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.8500284,
    "lng": -88.3125738
  },
  {
    "venue": "Bandito Barney's",
    "city": "East Dundee",
    "state": "IL",
    "date": "2026-07-12",
    "time": "3:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.0989145,
    "lng": -88.2714689
  },
  {
    "venue": "Arboretum of South Barrington",
    "city": "S. Barrington",
    "state": "IL",
    "date": "2026-07-15",
    "time": "6:30pm",
    "day": "Wed",
    "notes": "",
    "lat": 42.093889,
    "lng": -88.1342353
  },
  {
    "venue": "Carol Stream CITP",
    "city": "Carol Stream",
    "state": "IL",
    "date": "2026-07-16",
    "time": "7:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.9125286,
    "lng": -88.1347927
  },
  {
    "venue": "Oak Brook Terrace",
    "city": "Oak Brook",
    "state": "IL",
    "date": "2026-07-17",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8327126,
    "lng": -87.9484125
  },
  {
    "venue": "America's Gym Grand Opening",
    "city": "Wheeling",
    "state": "IL",
    "date": "2026-07-18",
    "time": "1:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.138889,
    "lng": -87.9310944
  },
  {
    "venue": "Huntley Food Truck Fest",
    "city": "Huntley",
    "state": "IL",
    "date": "2026-07-18",
    "time": "5:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1722503,
    "lng": -88.42692
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-07-18",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-07-19",
    "time": "2:30pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Zion CITP",
    "city": "Zion",
    "state": "IL",
    "date": "2026-07-23",
    "time": "7:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.4501169,
    "lng": -87.8337753
  },
  {
    "venue": "Lincolnwood Fest",
    "city": "Lincolnwood",
    "state": "IL",
    "date": "2026-07-24",
    "time": "5:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.0055985,
    "lng": -87.735572
  },
  {
    "venue": "Streamwood Fest",
    "city": "Streamwood",
    "state": "IL",
    "date": "2026-07-25",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0255827,
    "lng": -88.1784085
  },
  {
    "venue": "Algonquin Fest",
    "city": "Algonquin",
    "state": "IL",
    "date": "2026-07-26",
    "time": "5:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.1655801,
    "lng": -88.2942493
  },
  {
    "venue": "Mt. Prospect CITP",
    "city": "Mt. Prospect",
    "state": "IL",
    "date": "2026-07-30",
    "time": "7:30pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.0664167,
    "lng": -87.9372908
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-07-31",
    "time": "",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Taste of Orland Park",
    "city": "Orland Park",
    "state": "IL",
    "date": "2026-08-01",
    "time": "7:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.630663,
    "lng": -87.8536288
  },
  {
    "venue": "Lake County Fair",
    "city": "Grayslake",
    "state": "IL",
    "date": "2026-08-02",
    "time": "3:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.3433518,
    "lng": -88.0412192
  },
  {
    "venue": "Addison National Night Out",
    "city": "Addison",
    "state": "IL",
    "date": "2026-08-04",
    "time": "7:00pm",
    "day": "Tue",
    "notes": "",
    "lat": 41.931696,
    "lng": -87.9889556
  },
  {
    "venue": "St. Charles CITP",
    "city": "St Charles",
    "state": "IL",
    "date": "2026-08-06",
    "time": "7:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.9139808,
    "lng": -88.3128183
  },
  {
    "venue": "Linden Fest",
    "city": "Lindenhurst",
    "state": "IL",
    "date": "2026-08-07",
    "time": "9:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.4105765,
    "lng": -88.0261911
  },
  {
    "venue": "Country Club Hills Fest",
    "city": "Country C H",
    "state": "IL",
    "date": "2026-08-08",
    "time": "3:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Vet Fest Oswego",
    "city": "Oswego",
    "state": "IL",
    "date": "2026-08-08",
    "time": "8:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.6834778,
    "lng": -88.3525714
  },
  {
    "venue": "Hideaway Brew Garden",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-08-09",
    "time": "3:00pm",
    "day": "Sun",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "PB & J Fest",
    "city": "Kenosha",
    "state": "WI",
    "date": "2026-08-13",
    "time": "6:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.5846773,
    "lng": -87.8212263
  },
  {
    "venue": "Oak Brook Center Mall",
    "city": "Oak Brook",
    "state": "IL",
    "date": "2026-08-14",
    "time": "6:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8327126,
    "lng": -87.9484125
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-08-15",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Grayslake Summer Fest",
    "city": "Garyslake",
    "state": "IL",
    "date": "2026-08-15",
    "time": "10:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Crosstown Classic",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-08-16",
    "time": "4:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Hinsdale CITP",
    "city": "Hinsdale",
    "state": "IL",
    "date": "2026-08-19",
    "time": "6:30pm",
    "day": "Wed",
    "notes": "",
    "lat": 41.8024604,
    "lng": -87.9299841
  },
  {
    "venue": "Potter's Place",
    "city": "Naperville",
    "state": "IL",
    "date": "2026-08-20",
    "time": "7:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.7728699,
    "lng": -88.1479278
  },
  {
    "venue": "Hollywood Casino Aurora",
    "city": "Aurora",
    "state": "IL",
    "date": "2026-08-21",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.7571701,
    "lng": -88.3147539
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-08-22",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Bandito Barney's",
    "city": "East Dundee",
    "state": "IL",
    "date": "2026-08-23",
    "time": "3:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.0989145,
    "lng": -88.2714689
  },
  {
    "venue": "Block 59 Naperville Fest",
    "city": "Naperville",
    "state": "IL",
    "date": "2026-08-27",
    "time": "6:30pm",
    "day": "Thu",
    "notes": "",
    "lat": 41.7728699,
    "lng": -88.1479278
  },
  {
    "venue": "DeKalb Corn Fest",
    "city": "DeKalb",
    "state": "IL",
    "date": "2026-08-28",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8903447,
    "lng": -88.7713953
  },
  {
    "venue": "Phoenix Park Bandshell",
    "city": "Delavan",
    "state": "WI",
    "date": "2026-08-29",
    "time": "7:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.633102,
    "lng": -88.6460554
  },
  {
    "venue": "Broken Oar",
    "city": "P. Barrington",
    "state": "IL",
    "date": "2026-08-30",
    "time": "4:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.1539141,
    "lng": -88.1361888
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-09-02",
    "time": "",
    "day": "Wed",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-09-04",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "Buffalo Grove Fest",
    "city": "Buffalo Grove",
    "state": "IL",
    "date": "2026-09-05",
    "time": "3:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1544205,
    "lng": -87.9589621
  },
  {
    "venue": "Frankfort Fest",
    "city": "Frankfort",
    "state": "IL",
    "date": "2026-09-05",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.4979467,
    "lng": -87.8495946
  },
  {
    "venue": "Yorkville Fest",
    "city": "Yorkville",
    "state": "IL",
    "date": "2026-09-06",
    "time": "4:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 41.6411409,
    "lng": -88.4472948
  },
  {
    "venue": "Pub 72 Octoberfest",
    "city": "Gilberts",
    "state": "IL",
    "date": "2026-09-11",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1034365,
    "lng": -88.3745145
  },
  {
    "venue": "Evviva Fest",
    "city": "Lisle",
    "state": "IL",
    "date": "2026-09-12",
    "time": "4:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.801159,
    "lng": -88.0747687
  },
  {
    "venue": "Lake Zurich Rock the Block",
    "city": "Lake Zurich",
    "state": "IL",
    "date": "2026-09-12",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1969689,
    "lng": -88.0934108
  },
  {
    "venue": "Goebert's Farm Fest",
    "city": "Pingree Grov.",
    "state": "IL",
    "date": "2026-09-18",
    "time": "7:30pm",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "West Dundee Heritage Fest",
    "city": "West Dundee",
    "state": "IL",
    "date": "2026-09-19",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.0980812,
    "lng": -88.2828581
  },
  {
    "venue": "Des Plaines Fall Fest",
    "city": "Des Plaines",
    "state": "IL",
    "date": "2026-09-20",
    "time": "2:15pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.0415823,
    "lng": -87.8873916
  },
  {
    "venue": "Norwood Park Fest",
    "city": "Norwood Pk",
    "state": "IL",
    "date": "2026-09-20",
    "time": "6:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 41.9880657,
    "lng": -87.8027487
  },
  {
    "venue": "Private Event",
    "city": "",
    "state": "IL",
    "date": "2026-09-23",
    "time": "",
    "day": "Wed",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Huntley Fall Fest",
    "city": "Huntley",
    "state": "IL",
    "date": "2026-09-25",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1722503,
    "lng": -88.42692
  },
  {
    "venue": "Long Grove Apple Fest",
    "city": "Long Grove",
    "state": "IL",
    "date": "2026-09-26",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.1783584,
    "lng": -87.9978518
  },
  {
    "venue": "Private Party",
    "city": "",
    "state": "IL",
    "date": "2026-09-27",
    "time": "",
    "day": "Sun",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Durty Nellies",
    "city": "Palatine",
    "state": "IL",
    "date": "2026-10-02",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1105502,
    "lng": -88.0434304
  },
  {
    "venue": "Hideaway Brew Garden",
    "city": "Hoffman Est.",
    "state": "IL",
    "date": "2026-10-03",
    "time": "7:30pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "House of Mercy Charity Ball",
    "city": "Janesville",
    "state": "WI",
    "date": "2026-10-10",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.6829765,
    "lng": -89.0226793
  },
  {
    "venue": "Sideouts",
    "city": "Island Lake",
    "state": "IL",
    "date": "2026-10-16",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.2761341,
    "lng": -88.1920272
  },
  {
    "venue": "Hollywood Casino",
    "city": "Joliet",
    "state": "IL",
    "date": "2026-10-17",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": 41.5263603,
    "lng": -88.0840212
  },
  {
    "venue": "Big Brother - Big Sister",
    "city": "Chicago",
    "state": "IL",
    "date": "2026-10-23",
    "time": "8:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.8755616,
    "lng": -87.6244212
  },
  {
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "date": "2026-10-24",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.7003302,
    "lng": -88.0717708
  },
  {
    "venue": "Home Bar",
    "city": "Arlington Hts",
    "state": "IL",
    "date": "2026-10-30",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.0811563,
    "lng": -87.9802164
  },
  {
    "venue": "Hard Rock Casino",
    "city": "Gary",
    "state": "IN",
    "date": "2026-10-31",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.5702561,
    "lng": -87.3365496
  },
  {
    "venue": "Stage 119",
    "city": "Elmurst",
    "state": "IL",
    "date": "2026-11-06",
    "time": "8:30pm",
    "day": "Fri",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Turkey for Tots Christmas Benefit",
    "city": "Bournbonnais",
    "state": "IL",
    "date": "2026-11-07",
    "time": "8:00pm",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "date": "2026-11-14",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.03726,
    "lng": -88.2810994
  },
  {
    "venue": "Rockin's For Heroes @ Joe's Live",
    "city": "Rosemont",
    "state": "IL",
    "date": "2026-11-15",
    "time": "8:30pm",
    "day": "Sun",
    "notes": "",
    "lat": 41.9941334,
    "lng": -87.8756737
  },
  {
    "venue": "Bannerman's",
    "city": "Bartlett",
    "state": "IL",
    "date": "2026-11-20",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 41.9908485,
    "lng": -88.1850028
  },
  {
    "venue": "Jamo's Live",
    "city": "Mokena",
    "state": "IL",
    "date": "2026-11-21",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.5261437,
    "lng": -87.8892189
  },
  {
    "venue": "Broken Oar",
    "city": "P. Barrington",
    "state": "IL",
    "date": "2026-11-22",
    "time": "4:00pm",
    "day": "Sun",
    "notes": "",
    "lat": 42.1539141,
    "lng": -88.1361888
  },
  {
    "venue": "Turkey Testicle Festival",
    "city": "Huntley",
    "state": "IL",
    "date": "2026-11-25",
    "time": "2:00pm",
    "day": "Wed",
    "notes": "",
    "lat": 42.1722503,
    "lng": -88.42692
  },
  {
    "venue": "Basecamp",
    "city": "Lisle",
    "state": "IL",
    "date": "2026-11-28",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.801159,
    "lng": -88.0747687
  },
  {
    "venue": "Hollywood Casino",
    "city": "Joliet",
    "state": "IL",
    "date": "2026-12-04",
    "time": "",
    "day": "Fri",
    "notes": "",
    "lat": 41.5263603,
    "lng": -88.0840212
  },
  {
    "venue": "Private Corporate Event",
    "city": "",
    "state": "IL",
    "date": "2026-12-05",
    "time": "",
    "day": "Sat",
    "notes": "",
    "lat": null,
    "lng": null
  },
  {
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "date": "2026-12-12",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 42.263079,
    "lng": -88.0039653
  },
  {
    "venue": "Durty Nellies",
    "city": "Palatine",
    "state": "IL",
    "date": "2026-12-18",
    "time": "9:00pm",
    "day": "Fri",
    "notes": "",
    "lat": 42.1105502,
    "lng": -88.0434304
  },
  {
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "date": "2026-12-19",
    "time": "9:00pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.7003302,
    "lng": -88.0717708
  },
  {
    "venue": "Joe's Live",
    "city": "Rosemont",
    "state": "IL",
    "date": "2026-12-26",
    "time": "8:30pm",
    "day": "Sat",
    "notes": "",
    "lat": 41.9941334,
    "lng": -87.8756737
  },
  {
    "venue": "Hard Rock Casino",
    "city": "Rockford",
    "state": "IL",
    "date": "2026-12-31",
    "time": "9:00pm",
    "day": "Thu",
    "notes": "",
    "lat": 42.2713945,
    "lng": -89.093966
  },
  {
    "venue": "Chicago Music Cruise",
    "city": "Caribbean",
    "state": "IL",
    "date": "2027-01-10",
    "time": "",
    "day": "Sun",
    "notes": "",
    "lat": 42.2256397,
    "lng": -89.0445595
  }
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
