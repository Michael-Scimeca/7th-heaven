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

// POST /api/seed-content — Seeds all site content into Sanity
// Run once, then delete or protect this route
export async function POST() {
 try {
  // ═══ SITE SETTINGS (Singleton) ═══
  const siteSettings = SEED_SITE_SETTINGS;

  await sanityWriteClient.createOrReplace(siteSettings);

  // ═══ TOUR DATES ═══
  // Clear existing
  const existingIds: string[] = await sanityWriteClient.fetch('*[_type == "tourDate"]._id');
  if (existingIds.length > 0) {
   const tx = sanityWriteClient.transaction();
   existingIds.forEach((id: string) => tx.delete(id));
   await tx.commit();
  }

  const tourDates = SEED_TOUR_DATES;

  await Promise.all(tourDates.map(async (td) => {
   await sanityWriteClient.create({ _type: 'tourDate', isSoldOut: false, isFestival: false, ...td } as any);
  }));

  return NextResponse.json({
   success: true,
   message: `Seeded: 1 siteSettings + ${tourDates.length} tour dates`,
  });
 } catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ success: false, error: msg }, { status: 500 });
 }
}
