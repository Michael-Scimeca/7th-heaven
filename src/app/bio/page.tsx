import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient, queries, SanitySiteSettings, SanityBandMember } from "@/lib/sanity";
import BioParallaxSlider from "@/components/BioParallaxSlider";
import AccomplishmentsLayouts from "@/components/AccomplishmentsLayouts";

export const metadata: Metadata = {
 title: "Bio — 7th Heaven",
 description: "Meet the members of 7th heaven and learn about their 40-year journey of rocking stages worldwide.",
};

export const revalidate = 60;

const FALLBACK_MEMBERS: Partial<SanityBandMember>[] = [
 {
  name: "Adam Heisler", role: "Lead Vocals",
  birthday: "March 13", zodiac: "Pisces",
  bestTrait: "I care too much",
  favBands: "Ben Rector, Billy Joel", favAlbum: "The Stranger — Billy Joel",
  favMovie: "Give me a good romantic comedy",
  fav7hSong: "You and I", favQuote: "I'm always happy and never satisfied",
  funFact: "I used to be a Jr. Black belt in Tae Kwon Do",
  image: "/images/members/adam.png"
 },
 {
  name: "Richard Hofherr", role: "Guitars • Keys • Vocals",
  birthday: "May 17", zodiac: "Taurus",
  bestTrait: "My Perspectives, Work Ethic, Loyalty",
  favBands: "Def Leppard, Queen, Van Halen",
  favAlbum: "Hysteria — Def Leppard",
  favMovie: "Blues Brothers, Star Wars",
  fav7hSong: "Sing, Diamonds, Midwest Girls",
  favQuote: "Life is all about perspectives. You can look at the glass half-empty and half-full.",
  funFact: "I have never had alcohol, drugs, cigarettes or a headache.",
  image: "/images/members/richard.png"
 },
 {
  name: "Nick Cox", role: "Guitars • Vocals • Piano",
  birthday: "March 19", zodiac: "Pisces",
  bestTrait: "Great listener",
  favBands: "Kiss, Queen, Zeppelin, Avenged Sevenfold",
  favAlbum: "Physical Graffiti — Led Zeppelin",
  favMovie: "American History X", fav7hSong: "Take Me With You",
  favQuote: "The universe is a pretty big place... seems like an awful waste of space.",
  funFact: "I love just staying home on my couch",
  image: "/images/members/nick.png"
 },
 {
  name: "Mark Kennetz", role: "Bass • Vocals • Uke • Guitar",
  birthday: "October 19", zodiac: "Libra",
  bestTrait: "Being a Ninja",
  favBands: "Sublime, Led Zeppelin, Muse", favAlbum: "40 oz to Freedom — Sublime",
  favMovie: "Hot Fuzz, Anchorman", fav7hSong: "Ethereal",
  favQuote: "The past is in our heads, the future is in our hands",
  funFact: "Stage 2 carnivore — eat anything with 2 legs or less!",
  image: "/images/members/mark.png"
 },
 {
  name: "Frankie Harchut", role: "Drums",
  birthday: "May 31", zodiac: "Gemini",
  bestTrait: "Care For Others",
  favBands: "Sevendust, Korn, A Day To Remember",
  favAlbum: "Throwing Copper",
  favMovie: "My Cousin Vinny, Casino",
  fav7hSong: "Midwest Girls In The Summertime",
  favQuote: "Success is where preparation and opportunity meet",
  funFact: "I'm Polish, or wait, everyone knows that :)",
  image: "/images/members/frankie.png"
 },
];

const FALLBACK_ACCOMPLISHMENTS = [
 "Three #1 Hit Songs on the Billboard Charts",
 "Seven Major Radio Hit Songs",
 "Five CDs reached #1 on the Billboard Charts",
 'Opened for "Bon Jovi" & "Kid Rock" at Soldier Field to 80,000 people',
 'Opened for "Styx" to 80,000 people',
 "Written/Recorded over 5,000 songs to date — Released over 1,000 original songs",
];

const FALLBACK_PERFORMED_WITH = [
 "Bon Jovi", "Def Leppard", "Journey", "Rick Springfield", "REO Speedwagon",
 "Foreigner", "Styx", "Sammy Hagar", "Kid Rock", "3 Doors Down",
];

export default async function BioPage() {
 const [settingsData, bandMembersData] = await Promise.all([
  sanityClient.fetch<SanitySiteSettings | null>(queries.siteSettings, {}, { next: { revalidate: 60, tags: ['sanity:settings'] } }),
  sanityClient.fetch<SanityBandMember[]>(queries.allBandMembers, {}, { next: { revalidate: 60, tags: ['sanity:members'] } }),
 ]);
 const settings = settingsData as SanitySiteSettings | null;
 
 const sanityMembers = bandMembersData as SanityBandMember[] | null;
 const members = sanityMembers?.length ? sanityMembers : FALLBACK_MEMBERS;

 const accomplishments = settings?.accomplishments?.length ? settings.accomplishments : FALLBACK_ACCOMPLISHMENTS;
 const performedWith = settings?.performedWith?.length ? settings.performedWith : FALLBACK_PERFORMED_WITH;

  return (
    <div className="pt-[130px] md:pt-[150px] bg-black overflow-x-hidden w-full max-w-full">

      {/* Full Screen Bio Parallax Slider */}
      <section className="w-full max-w-full overflow-visible bg-black pt-2 pb-8">
    <BioParallaxSlider members={members} />
  </section>

  {/* Accomplishments */}
  <section className="py-32 bg-[var(--color-bg-secondary)]">
    <div className="site-container">
      <div className="text-center mb-10">
        <span className="inline-block text-sm font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">Accomplishments</span>
        <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
          40 Years of <span className="gradient-text">Achievements</span>
        </h2>
      </div>

      <AccomplishmentsLayouts accomplishments={accomplishments} />
    </div>
  </section>

 {/* Performed With */}
 <section className="py-32 bg-[var(--color-bg-secondary)]">
 <div className="site-container">
 <div className="text-center mb-16">
 <span className="inline-block text-sm font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Shared the Stage With</span>
 <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
 Major Label <span className="gradient-text">Artists</span>
 </h2>
 </div>
 <div className="flex flex-wrap justify-center gap-2 max-w-[1000px] mx-auto">
 {performedWith.map((artist, i) => (
 <span key={i} className="inline-block px-4 py-1.5 text-base text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-150 hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[rgba(133,29,239,0.1)]">
 {artist}
 </span>
 ))}
 <span className="inline-block px-4 py-1.5 text-base text-[var(--color-text-secondary)] opacity-50">and many more...</span>
 </div>
 </div>
 </section>

 {/* Download */}
 <section className="py-32 text-center">
 <div className="site-container">
 <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight mb-4">
 Download the <span className="gradient-text">Official Bio</span>
 </h2>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mb-10">
 Get the full 7th heaven press bio for booking and media inquiries.
 </p>
 <a href="#" className="btn-primary btn-primary-hover" id="download-bio-btn">📄 Download Bio (PDF)</a>
 </div>
 </section>
 </div>
 );
}
