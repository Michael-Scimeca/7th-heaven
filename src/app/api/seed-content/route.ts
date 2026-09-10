import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity";

const SEED_SITE_SETTINGS = {
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
    year: '2025', duration: '3:35', type: 'Official Music Video',
    description: "The latest official music video from 7th heaven — a powerful rock ballad about seeing the beauty in everyday moments. Shot on location in Chicago, the video captures the band's signature high-energy performance style blended with cinematic storytelling.",
    youtubeId: 'BzHUNTZ66zY',
    buyLink: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ',
    spotifyLink: 'https://open.spotify.com', appleMusicLink: 'https://music.apple.com',
    credits: [
     'Adam Heisler — Lead Vocals, Guitars, Bass',
     'Richard Hofherr — Guitars, Keys, Vocals',
     'Nick Cox — Guitars, Vocals',
     'Mark Kennetz — Bass, Vocals',
     'Frankie Harchut — Drums',
    ],
   },
   heroShowcase: {
    badge: 'SPECIAL EVENT',
    title: 'THE 40TH ANNIVERSARY TOUR',
    subtitle: 'Celebrating 40 Years of Rock — 200+ Shows Worldwide in 2026',
    date: 'SUMMER 2026',
    venue: 'CHICAGOLAND & BEYOND',
    description: "Four decades of high-energy rock performance. Join 7th heaven for an unforgettable tour featuring the iconic '30 Songs in 30 Minutes' medley, chart-topping originals, and legendary rock classics.",
    ticketLink: 'https://stationthirtyfour.com/events/',
    primaryCtaText: 'GET TICKETS NOW',
    secondaryCtaText: 'VIEW ALL TOUR DATES',
    featuredImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1920&q=80',
   },
   cruisePromo: {
    badge: 'ANNUAL FAN CRUISE',
    title: 'CHICAGO MUSIC CRUISE 2026',
    subtitle: 'Join 7th Heaven Aboard MSC World America!',
    dates: 'JANUARY 17-24, 2026',
    shipName: 'MSC WORLD AMERICA',
    departurePort: 'PORT OF MIAMI, FL',
    itinerary: 'MIAMI • COZUMEL • ROATAN • COSTA MAYA • OCEAN CAY',
    description: 'Sail away with 7th heaven for 7 nights of non-stop music, private concerts, Q&A sessions, VIP meet & greets, and Caribbean sun! Booking includes exclusive access to all band performances.',
    bookingUrl: 'http://www.chicagomusiccruise.com',
    vipPassUrl: 'http://www.chicagomusiccruise.com/vip',
    cabinsAvailable: true,
    startingPrice: '$899',
   },
   socialLinks: {
    facebook: 'https://www.facebook.com/7thheavenband',
    instagram: 'https://www.instagram.com/7thheavenband',
    youtube: 'https://www.youtube.com/7thheavenband',
    spotify: 'https://open.spotify.com/artist/7thheaven',
    appleMusic: 'https://music.apple.com/artist/7th-heaven',
    tiktok: 'https://www.tiktok.com/@7thheavenband',
   },
   contactInfo: {
    bookingEmail: 'rich@7thheavenband.com',
    bookingPhone: '(555) 301-4422',
    pressEmail: 'press@7thheavenband.com',
    merchEmail: 'merch@7thheavenband.com',
    mailingAddress: 'PO Box 777, Palatine, IL 60067',
   },
};

const SEED_TOUR_DATES = [
   { venue: 'Station 34', city: 'Mt. Prospect', state: 'IL', date: '2026-01-02', time: '8:30pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged', ticketLink: 'https://stationthirtyfour.com/events/' },
   { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-01-03', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor', ticketLink: 'https://www.oldrepublicbar.com' },
   { venue: 'Rookies', city: 'Hoffman Est.', state: 'IL', date: '2026-01-09', time: '8:00pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged' },
   { venue: 'Private Event', city: '', state: '', date: '2026-01-10', time: '', day: 'Sat', notes: '' },
   { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-01-11', time: '2:00pm', day: 'Sun', notes: 'F.A.N. Show - Unplugged', ticketLink: 'https://www.theoriginalsundancesaloon.com' },
   { venue: 'Chicago Music Cruise', city: 'Miami', state: 'FL', date: '2026-01-17', time: '', day: 'Sat', notes: 'MSC World America', ticketLink: 'http://www.chicagomusiccruise.com' },
   { venue: 'WGN TV News Segment', city: 'Chicago', state: 'IL', date: '2026-01-28', time: '10:00am', day: 'Wed', notes: 'TV Appearance' },
   { venue: 'Youth Services Fundraiser', city: 'Wilmette', state: 'IL', date: '2026-01-30', time: '7:00pm', day: 'Fri', notes: 'Fundraiser - Join Us!' },
   { venue: 'Des Plaines Theater', city: 'Des Plaines', state: 'IL', date: '2026-01-31', time: '9:00pm', day: 'Sat', notes: '' },
   { venue: 'Chicago Auto Show First Look', city: 'Chicago', state: 'IL', date: '2026-02-06', time: '7:30pm', day: 'Fri', notes: 'Ticketed Gala' },
   { venue: 'Hard Rock Casino', city: 'Gary', state: 'IN', date: '2026-02-07', time: '9:00pm', day: 'Sat', notes: 'Casino Show' },
   { venue: 'Durty Nellies', city: 'Palatine', state: 'IL', date: '2026-02-13', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Stage 119', city: 'Elmhurst', state: 'IL', date: '2026-02-14', time: '8:30pm', day: 'Sat', notes: '21 & Over' },
   { venue: 'Jamos Live', city: 'Mokena', state: 'IL', date: '2026-02-20', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: "Barb's Rescue Gala", city: 'Schaumburg', state: 'IL', date: '2026-02-21', time: '8:30pm', day: 'Sat', notes: 'Ticketed Gala' },
   { venue: 'Evenflow', city: 'Geneva', state: 'IL', date: '2026-02-27', time: '9:30pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-02-28', time: '9:00pm', day: 'Sat', notes: '21 & Over' },
   { venue: "Bannerman's", city: 'Bartlett', state: 'IL', date: '2026-03-06', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Broken Oar', city: 'P. Barrington', state: 'IL', date: '2026-03-07', time: '9:00pm', day: 'Sat', notes: '' },
   { venue: 'Home Show', city: 'Chicago', state: 'IL', date: '2026-03-11', time: '', day: 'Tue', notes: 'McCormick Place' },
   { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-03-22', time: '9:00pm', day: 'Sat', notes: '21 & Over' },
   { venue: 'Tailgaters', city: 'Bolingbrook', state: 'IL', date: '2026-03-27', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-03-28', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor' },
   { venue: "Rookie's Rockhouse", city: 'Hoffman Est.', state: 'IL', date: '2026-04-03', time: '8:00pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged' },
   { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-04-04', time: '9:00pm', day: 'Sat', notes: '21 & Over' },
   { venue: "Corrigan's Pub", city: 'Shorewood', state: 'IL', date: '2026-04-10', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Midway Sports', city: 'Bartlett', state: 'IL', date: '2026-04-11', time: '8:30pm', day: 'Sat', notes: 'All-Age till 10pm' },
   { venue: "Joe's Live", city: 'Rosemont', state: 'IL', date: '2026-04-17', time: '8:00pm', day: 'Thu', notes: '' },
   { venue: 'Stage 119', city: 'Elmhurst', state: 'IL', date: '2026-04-18', time: '8:30pm', day: 'Sat', notes: '21 & Over' },
   { venue: 'Evenflow', city: 'Geneva', state: 'IL', date: '2026-04-24', time: '9:30pm', day: 'Thu', notes: '21 & Over' },
   { venue: 'Rochaus', city: 'West Dundee', state: 'IL', date: '2026-04-25', time: '9:00pm', day: 'Fri', notes: '' },
   { venue: 'Station 34', city: 'Mt. Prospect', state: 'IL', date: '2026-05-01', time: '8:30pm', day: 'Fri', notes: 'F.A.N. Show - Unplugged' },
   { venue: 'Deer Park Fest', city: 'Deer Park', state: 'IL', date: '2026-05-02', time: '6:00pm', day: 'Sat', notes: 'Outdoor All-Age Festival', isFestival: true },
   { venue: "Bannerman's", city: 'Bartlett', state: 'IL', date: '2026-05-08', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Sideouts', city: 'Island Lake', state: 'IL', date: '2026-05-09', time: '9:00pm', day: 'Sat', notes: 'Outdoor Beer Garden' },
   { venue: 'Durty Nellies', city: 'Palatine', state: 'IL', date: '2026-05-15', time: '9:00pm', day: 'Thu', notes: '21 & Over' },
   { venue: 'Tailgaters', city: 'Bolingbrook', state: 'IL', date: '2026-05-16', time: '9:00pm', day: 'Fri', notes: '21 & Over' },
   { venue: 'Sundance Saloon', city: 'Mundelein', state: 'IL', date: '2026-05-22', time: '9:00pm', day: 'Sat', notes: '21 & Over' },
   { venue: 'Hard Rock Casino', city: 'Rockford', state: 'IL', date: '2026-05-23', time: '9:00pm', day: 'Fri', notes: 'Casino Show' },
   { venue: "Bandito Barney's", city: 'East Dundee', state: 'IL', date: '2026-05-24', time: '9:00pm', day: 'Sat', notes: 'Outdoor' },
   { venue: 'Will County Beer & Bourbon Fest', city: 'Joliet', state: 'IL', date: '2026-05-29', time: '6:00pm', day: 'Thu', notes: 'Festival', isFestival: true },
   { venue: 'Old Republic', city: 'Elgin', state: 'IL', date: '2026-05-30', time: '8:00pm', day: 'Sat', notes: 'All Age Outdoor' },
];

const SEED_PAGE_CONTENTS = [
  {
    _type: 'pageContent',
    _id: 'pageContent-home',
    pageKey: 'home',
    title: 'Home Page',
    heroHeading: '7th Heaven — Official Band Website',
    heroSubheading: 'Chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.',
    heroCtaText: 'Play Music',
    heroCtaLink: '#hero',
    sections: [
      { sectionId: 'videos', title: 'Video & Live Media', subtitle: 'Explore 7th Heaven\'s live concert highlights, festival performances, television broadcasts, and official music videos in smooth interactive parallax.' },
      { sectionId: 'logos', title: 'WHO WE\'VE PLAYED WITH & WHERE WE\'VE BEEN FEATURED', subtitle: 'Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications.' },
      { sectionId: 'news', title: 'Latest Band News', subtitle: 'Stay updated with official announcements, tour updates, new music releases, and exclusive band stories.' },
      { sectionId: 'merch', title: 'On Sale Now', subtitle: 'Official 7th Heaven Band Gear — Direct Merchant Store & Fast Shipping.', ctaText: 'Shop All →' }
    ]
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-cruise',
    pageKey: 'cruise',
    title: 'Caribbean Cruise',
    heroHeading: '7th Heaven Caribbean Cruise 2026',
    heroSubheading: '7 Nights of Tropical Sun, Private Concerts, VIP Parties & Unforgettable Memories Aboard MSC World America'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-book',
    pageKey: 'book',
    title: 'Book Us',
    heroHeading: 'BOOK 7TH HEAVEN FOR YOUR EVENT',
    heroSubheading: 'Bring 40 years of chart-topping rock, #1 Billboard hits, and high-energy live performance to your festival, venue, corporate event, or private party.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-contact',
    pageKey: 'contact',
    title: 'Contact Us',
    heroHeading: 'CONTACT 7TH HEAVEN',
    heroSubheading: 'Get in touch with the 7th Heaven team. Select a department below for representative details.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-media',
    pageKey: 'media',
    title: 'Media Vault',
    heroHeading: '7TH HEAVEN MEDIA VAULT',
    heroSubheading: '40 years of music, live performances, official music videos, and press highlights.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-faq',
    pageKey: 'faq',
    title: 'FAQ Page',
    heroHeading: 'FREQUENTLY ASKED QUESTIONS',
    heroSubheading: 'Everything you need to know about 7th Heaven shows, booking, merchandise, fan perks, and the annual Caribbean Cruise.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-rock-and-roll-kids',
    pageKey: 'rock-and-roll-kids',
    title: "Rock 'n' Roll Kids",
    heroHeading: "7th Heaven & the Rock 'n' Roll Kids",
    heroSubheading: 'An animated adventure series communicating messages of fun, positivity, and social consciousness through music and imagination.',
    storyHeading: 'Story & Concept',
    storyParagraph1: '7th heaven & the Rock \'n\' Roll Kids is based on the band 7th heaven, which is globally known as a pop Rock Band. The animated series communicates messages of fun, positivity and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, an adventure and a resolution.',
    storyParagraph2: 'We have been working with a team of skilled people that are helping us build a new animated series based on 7th heaven. The show is based on the band as young kids, who bring positivity to other kids, which are called “The Rock and Roll Kids”. We are working to create this as an animated TV series and comic books, games, apps, videos and original music. In a world filled with so much negativity, we want to bring a breath of fresh air to kids and help influence them in a positive light thru rock and roll music.',
    sections: [
      {
        sectionId: 'about',
        title: 'Story & Concept',
        subtitle: '7th heaven & the Rock \'n\' Roll Kids is based on the band 7th heaven, which is globally known as a pop Rock Band. The animated series communicates messages of fun, positivity and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, an adventure and a resolution.',
        body: 'We have been working with a team of skilled people that are helping us build a new animated series based on 7th heaven. The show is based on the band as young kids, who bring positivity to other kids, which are called “The Rock and Roll Kids”. We are working to create this as an animated TV series and comic books, games, apps, videos and original music. In a world filled with so much negativity, we want to bring a breath of fresh air to kids and help influence them in a positive light thru rock and roll music.'
      },
      {
        sectionId: 'characters',
        title: 'Character Roster',
        subtitle: 'Band Members & Cast'
      },
      {
        sectionId: 'comics',
        title: 'Comic Books & Publications',
        subtitle: 'Printed Comics & E-Books',
        ctaText: 'Paperback Book Series on Amazon',
        ctaLink: 'https://www.amazon.com/dp/B096TJNDWR'
      },
      {
        sectionId: 'founders',
        title: 'Series Founders & Contact',
        subtitle: 'Series Creators'
      }
    ],
    products: [
      { id: "ep1", title: "Land Of Confusion", badge: "Episode 1", desc: "The Rock 'N' Roll Kids embark on their first epic adventure, bringing positivity and music to resolve chaos in the city.", amazonUrl: "https://www.amazon.com/gp/product/B096TJNDWR", coverImg: "/images/comics/71j5h9aU3iS._SL1500_.jpg" },
      { id: "ep2", title: "Who Are You", badge: "Episode 2", desc: "Identity, friendship, and staying true to yourself when XEC Records try to change the band's authentic rock sound.", amazonUrl: "https://www.amazon.com/gp/product/B08FNMPFTR", coverImg: "/images/comics/71tQzMjwGaL._SL1360_.jpg" },
      { id: "ep3", title: "What You Give", badge: "Episode 3", desc: "A powerful tale of kindness and social consciousness as the kids use music to help community schools stay open.", amazonUrl: "https://www.amazon.com/gp/product/B08GLP426D", coverImg: "/images/comics/71OoJ1jhGXL._SL1360_.jpg" },
      { id: "ep4", title: "Runnin' Down A Dream", badge: "Episode 4", desc: "High-octane concert energy, flying drones, and an unbelievable battle of the bands showdown against ancient rock rivals.", amazonUrl: "https://www.amazon.com/gp/product/B08R68B2QF", coverImg: "/images/comics/719L5F4iUyL._SL1500_.jpg" },
      { id: "ep5", title: "Last In Line", badge: "Episode 5", desc: "The kids face their biggest challenge yet in an epic concert arena battle of music, heart, and teamwork.", amazonUrl: "https://www.amazon.com/gp/product/B08VYFJWYF?ref_=dbs_m_mng_rwt_calw_tpbk_4&storeType=ebooks", coverImg: "/images/comics/719CbfCsqyL._SL1500_.jpg" },
      { id: "ep6", title: "Operation Mind Crime", badge: "Episode 6", desc: "Special illustrated black & white edition uncovering the mystery of XEC Records headquarters.", amazonUrl: "https://www.amazon.com/gp/product/B09HG6KW8M?ref_=dbs_m_mng_rwt_calw_tpbk_5&storeType=ebooks", coverImg: "/images/comics/81yWx2cHMjL._SL1500_.jpg" },
      { id: "ep7", title: "Caught In The Game", badge: "Episode 7", desc: "Trapped inside a virtual reality video game grid, the Rock 'N' Roll Kids use music chords to beat the game boss.", amazonUrl: "https://www.amazon.com/gp/product/B0B1K859QC?ref_=dbs_m_mng_rwt_calw_tpbk_6&storeType=ebooks", coverImg: "/images/comics/61y6zQf1hCL._SL1500_.jpg" },
      { id: "ep8", title: "Don't Speak", badge: "Episode 8", desc: "A silent spell falls over the city until the band powers up their amplifiers to restore music and speech.", amazonUrl: "https://www.amazon.com/gp/product/B0BTRTCQ5W?ref_=dbs_m_mng_rwt_calw_tpbk_7&storeType=ebooks&qid=1681962352&sr=8-1", coverImg: "/images/comics/71mgiiwhIGL._SL1500_.jpg" },
      { id: "ep9", title: "Bad Company", badge: "Episode 9", desc: "Wild west desert showdown where the band brings rhythm, harmony, and friendship to outlaws.", amazonUrl: "https://www.amazon.com/7th-heaven-RocknRoll-Kids-Company/dp/B0CGZ1P2ZJ/ref=sr_1_3?crid=NHCNKT022TUP&keywords=7th+heaven+rock+kids&qid=1705630559&s=digital-text&sprefix=7th+heaven+rock+kids%2Cdigital-text%2C83&sr=1-3-catcorr", coverImg: "/images/comics/71njNs9hT2L._SL1500_.jpg" },
      { id: "cb", title: "Coloring Book", badge: "Coloring Book", desc: "20+ pages of high-resolution line art featuring all 7th Heaven characters, concert stages, and comic scenes.", amazonUrl: "https://www.amazon.com/heaven-RocknRoll-Kids-Coloring-Book/dp/1791341276/?_encoding=UTF8&pd_rd_w=y3LP8&content-id=amzn1.sym.cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_p=cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_r=135-6472012-0373844&pd_rd_wg=TnrXj&pd_rd_r=3a94a7b7-c821-4b82-85bb-e305d1283288&ref_=aufs_ap_sc_dsk", coverImg: "/images/comics/51Q94xAzn7L.jpg" },
      { id: "ab", title: "Art Book", badge: "Art Book", desc: "Exclusive concept sketches, character designs, storyboards, and development artwork from RNR Studios.", amazonUrl: "https://www.amazon.com/7th-Heaven-RocknRoll-Kids-Introduction/dp/1718876688/ref=sr_1_2?s=books&ie=UTF8&qid=1526169915&sr=1-2", coverImg: "/images/comics/71d2WbDeBHL._SL1360_.jpg" },
      { id: "vol1", title: "Comic Book - Vol. 1", badge: "Comic Book Vol. 1", desc: "The complete volume 1 anthology combining multiple episode issues, full-color pages, and bonus poster art.", amazonUrl: "https://www.amazon.com/dp/B096TJNDWR", coverImg: "/images/comics/71d2WbDeBHL._SL1360_.jpg" }
    ],
    characters: [
      { name: "Barefoot Rocker", role: "Lead Guitarist", desc: "Blonde hair, shades, and barefoot energy. Plays lightning-fast lead guitar solos and brings fearless optimism." },
      { name: "Cap Bassist", role: "Bass Guitarist", desc: "Baseball cap backwards, driving deep basslines that keep the groove locked down in every battle." },
      { name: "Power Drummer", role: "Drums & Percussion", desc: "The heartbeat of the band. Thunderous rhythms and high-tempo beats that power up the kids' magical music energy." },
      { name: "Headband Shredder", role: "Rhythm Guitarist", desc: "Red headband and heavy rhythm chords. Crafts catchy riffs that solve problems and unite the crowd." },
      { name: "Frontman Kid", role: "Lead Vocalist", desc: "Black hat and infectious mic vocals. Leads the team with powerful anthems of kindness and rock attitude." },
      { name: "Big Sam", role: "Culinary & Backstage", desc: "Red shirt chef keeping the band energized with great meals and warm backstage hospitality." },
      { name: "XEC Record Boss", role: "Corporate Executive", desc: "Purple-skinned corporate villain who tries to control the music business until the kids show him true rock positivity." },
      { name: "Security & Drone Ops", role: "Stage & Tour Crew", desc: "Dedicated crew with security gear and high-tech flying video drones capturing concert magic from above." }
    ],
    musicSingles: [
      { title: "Land Of Confusion", subtitle: "Animated Official Music Video", tag: "Theme Song", desc: "The band's iconic animated cover of Genesis' classic anthem. Blending hard-hitting rock riffs with vibrant superhero visuals.", youtubeId: "3ZhqLJDRxQ8", youtubeUrl: "https://www.youtube.com/watch?v=3ZhqLJDRxQ8" },
      { title: "Who Are You", subtitle: "Season 1 Featured Track", tag: "Featured Single", desc: "A high-energy rock anthem empowering kids to stay authentic, embrace their unique talents, and overcome peer pressure.", youtubeId: "97tX0sM3vE8", youtubeUrl: "https://www.youtube.com/watch?v=97tX0sM3vE8" },
      { title: "What You Give", subtitle: "Social Consciousness Single", tag: "Inspirational Anthem", desc: "An uplifting message about kindness, giving back to your community, and spreading light through hard work and rock 'n' roll.", youtubeId: "J3_lX9S5k4o", youtubeUrl: "https://www.youtube.com/watch?v=J3_lX9S5k4o" },
      { title: "Time of Our Lives", subtitle: "Animated Concert Finale", tag: "Concert Anthem", desc: "The grand finale song showcasing the Rock 'N' Roll Kids on stage performing live for cheering crowds.", youtubeId: "W3dkLd9UkZU", youtubeUrl: "https://www.youtube.com/watch?v=W3dkLd9UkZU" }
    ],
    founders: [
      { name: "Richard Hofherr", role: "Founder and songwriter of 7th heaven", desc: "Co-creator of 7th Heaven & The Rock 'n' Roll Kids animated series, comics, and video games.", phone: "(847) 551-5363", email: "Rich777@aol.com", mobileImg: "/images/contact/Dickie-contact-mobile.png", desktopImg: "/images/members/desktop-richy.png" },
      { name: "Roy Adorjan", role: "Lead Animator & Character Designer", desc: "Co-creator and art director for 7th Heaven & The Rock 'n' Roll Kids.", email: "info@minimartians.com", mobileImg: "/images/comics/roy-mobile.png", desktopImg: "/images/comics/desktop-roy.png" }
    ]
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-fan-photo-wall',
    pageKey: 'fan-photo-wall',
    title: 'Fan Photo Wall',
    heroHeading: 'FAN PHOTO & VIDEO WALL',
    heroSubheading: 'Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-shows-past',
    pageKey: 'shows-past',
    title: 'Past Shows Archive',
    heroHeading: 'PAST SHOWS ARCHIVE',
    heroSubheading: 'Relive 40 years of legendary live performances, festivals, club dates, and stadium shows.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-privacy',
    pageKey: 'privacy',
    title: 'Privacy Policy',
    heroHeading: 'PRIVACY POLICY',
    heroSubheading: 'How 7th Heaven protects your privacy, personal information, and data across our official web and mobile platforms.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-terms',
    pageKey: 'terms',
    title: 'Terms of Service',
    heroHeading: 'TERMS OF SERVICE',
    heroSubheading: 'Please read these terms carefully before accessing or using the 7th Heaven official website and services.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-returns',
    pageKey: 'returns',
    title: 'Returns Policy',
    heroHeading: 'RETURNS & REFUNDS POLICY',
    heroSubheading: 'Our guidelines and policies regarding merchandise returns, exchanges, and customer satisfaction.'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-crew-verify',
    pageKey: 'crew-verify',
    title: 'Crew PIN Verify',
    heroHeading: 'Crew PIN Verification',
    heroSubheading: 'Enter your 6-digit PIN to verify crew access'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-planner-verify',
    pageKey: 'planner-verify',
    title: 'Planner PIN Verify',
    heroHeading: 'PLANNER ACCESS PIN',
    heroSubheading: 'Enter your 6-digit PIN to access your Planner Dashboard'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-cruise-verify',
    pageKey: 'cruise-verify',
    title: 'Cruise PIN Verify',
    heroHeading: 'Check Your Email',
    heroSubheading: 'We sent a 6-digit verification code to'
  },
  {
    _type: 'pageContent',
    _id: 'pageContent-live',
    pageKey: 'live',
    title: 'Live Concert Hub',
    heroHeading: '7TH HEAVEN LIVE CONCERT HUB',
    heroSubheading: 'Watch live streams, backstage updates, and exclusive concert broadcasts.'
  },
];

async function seedAllContent() {
  // ═══ SITE SETTINGS (Singleton) ═══
  await sanityWriteClient.createOrReplace(SEED_SITE_SETTINGS);

  // ═══ PAGE CONTENTS (16 Site Pages) ═══
  await Promise.all(
    SEED_PAGE_CONTENTS.map(async (pageDoc) => {
      await sanityWriteClient.createOrReplace(pageDoc as any);
    })
  );

  // ═══ TOUR DATES ═══
  const existingIds: string[] = await sanityWriteClient.fetch('*[_type == "tourDate"]._id');
  if (existingIds.length > 0) {
    const tx = sanityWriteClient.transaction();
    existingIds.forEach((id: string) => tx.delete(id));
    await tx.commit();
  }

  const tourDates = SEED_TOUR_DATES;
  await Promise.all(
    tourDates.map(async (td) => {
      await sanityWriteClient.create({ _type: 'tourDate', isSoldOut: false, isFestival: false, ...td } as any);
    })
  );

  return {
    siteSettings: 1,
    pageContents: SEED_PAGE_CONTENTS.length,
    tourDates: tourDates.length,
  };
}

export async function POST() {
  try {
    const stats = await seedAllContent();
    return NextResponse.json({
      success: true,
      message: `Seeded Sanity CMS: ${stats.siteSettings} siteSettings + ${stats.pageContents} pageContents + ${stats.tourDates} tourDates`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
