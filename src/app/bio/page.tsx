import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/live";
import { queries, SanitySiteSettings, SanityBandMember, urlFor } from "@/lib/sanity";

export const metadata: Metadata = {
 title: "Bio — 7th Heaven",
 description: "Meet the members of 7th heaven and learn about their 40-year journey of rocking stages worldwide.",
};

const FALLBACK_MEMBERS: Partial<SanityBandMember>[] = [
 {
  name: "Adam Heisler", role: "Lead Vocals",
  birthday: "March 13", zodiac: "Pisces",
  bestTrait: "I care too much", worstTrait: "I care too much",
  favBands: "Ben Rector, Billy Joel", favAlbum: "The Stranger — Billy Joel",
  favMovie: "Give me a good romantic comedy and a box of tissues",
  fav7hSong: "You and I", favQuote: "I'm always happy and never satisfied",
  hobbies: "Being a Dad", funFact: "I used to be a Jr. Black belt in Tae Kwon Do",
  firstSong: "First song was one I wrote", bestFeeling: "Making someone happy",
  influences: "God",
 },
 {
  name: "Richard Hofherr", role: "Guitars • Keys • Vocals",
  birthday: "May 17", zodiac: "Taurus",
  bestTrait: "My Perspectives, Work Ethic, Loyalty, Instincts", worstTrait: "Time Management",
  favBands: "Dan Reed Network, Bryan Adams, Incubus, Def Leppard, Duran Duran, U2, Queen, Van Halen",
  favAlbum: "Hysteria — Def Leppard",
  favMovie: "Caddyshack, Vacation, James Bond, Star Wars, Blues Brothers",
  fav7hSong: "Sing, Diamonds, Beautiful Life, Midwest Girls",
  favQuote: "Life is all about perspectives. You can look at the glass half-empty and half-full, both are correct. One of them will bring you to a positive place.",
  hobbies: "Doing anything with my Sons. Working on new business ideas.",
  funFact: "I have never had alcohol, drugs, cigarettes or a headache. Love Each Other, Appreciate Each Other and Respect Each Other.",
  firstSong: "Photograph — Def Leppard",
  bestFeeling: "Being with my two sons (Michael & Matthew), and to accomplish",
  influences: "God, Steve Jobs, Walter Payton, Michael Jordan, Eddie Van Halen, Elon Musk",
 },
 {
  name: "Nick Cox", role: "Guitars • Vocals • Piano",
  birthday: "March 19", zodiac: "Pisces",
  bestTrait: "Great listener", worstTrait: "Can't hear very well",
  favBands: "Kiss, Queen, Heart, Zeppelin, My Chemical Romance, Avenged Sevenfold, Butch Walker",
  favAlbum: "Queen Live Killers, Physical Graffiti — Led Zeppelin",
  favMovie: "American History X", fav7hSong: "Take Me With You",
  favQuote: "The universe is a pretty big place. If it's just us… seems like an awful waste of space.",
  hobbies: "Astrophotography and observing the night sky",
  funFact: "I love just staying home on my couch",
  firstSong: "Angie — Rolling Stones", bestFeeling: "Sneezing",
  influences: "Freddy Mercury, Yngwie Malmsteen, Paul Gilbert, Butch Walker, Adam Heisler",
 },
 {
  name: "Mark Kennetz", role: "Bass • Vocals • Uke • Guitar",
  birthday: "October 19", zodiac: "Libra",
  bestTrait: "Being a Ninja", worstTrait: "n/a",
  favBands: "Sublime, Led Zeppelin, Muse", favAlbum: "40 oz to Freedom — Sublime",
  favMovie: "Hot Fuzz, Anchorman, Big Lebowski", fav7hSong: "Ethereal",
  favQuote: "The past is in our heads, the future is in our hands",
  hobbies: "Snowboarding, Blading, Biking, Motorcycle Riding, Saving Dolphins",
  funFact: "I'm a stage 2 carnivore, which means I eat anything with 2 legs or less, except bacon :)",
  firstSong: "People Are Strange — The Doors",
  bestFeeling: "Riding a motorcycle on an awesome day",
  influences: "The Doors, Sublime",
 },
 {
  name: "Frankie Harchut", role: "Drums",
  birthday: "May 31", zodiac: "Gemini",
  bestTrait: "Care For Others", worstTrait: "Sometimes Easily Distracted",
  favBands: "Sevendust, Korn, A Day To Remember, Nickelback",
  favAlbum: "Throwing Copper, Slippery When Wet",
  favMovie: "Turner and Hooch, Casino, My Cousin Vinny, Major League",
  fav7hSong: "Midwest Girls In The Summertime",
  favQuote: "Success is where preparation and opportunity meet",
  hobbies: "Recording Drums and Mixing",
  funFact: "I'm Polish, or wait, everyone knows that :)",
  firstSong: "Selling The Drama — Live",
  bestFeeling: "When I'm playing music and forget any and all problems",
  influences: "Todd Sucherman, Morgan Rose, John Otto, Jeff Porcaro, Dave Weckl",
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
 const { data: settingsData } = await sanityFetch({ query: queries.siteSettings });
 const { data: bandMembersData } = await sanityFetch({ query: queries.allBandMembers });
 const settings = settingsData as SanitySiteSettings | null;
 
 const sanityMembers = bandMembersData as SanityBandMember[] | null;
 const members = sanityMembers?.length ? sanityMembers : FALLBACK_MEMBERS;

 const accomplishments = settings?.accomplishments?.length ? settings.accomplishments : FALLBACK_ACCOMPLISHMENTS;
 const performedWith = settings?.performedWith?.length ? settings.performedWith : FALLBACK_PERFORMED_WITH;

 return (
 <div className="pt-[72px]">


 {/* Members */}
 <section className="pt-16 pb-32 bg-[var(--color-bg-secondary)]">
 <div className="site-container">
 <div className="flex flex-col gap-12">
 {members.map((m, i) => (
  <div key={m.name} className="flex flex-col lg:flex-row bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden transition-all hover:border-[var(--color-border-hover)] relative group" id={`bio-member-${i}`}>
   
   {/* Left Side: Full Body Image */}
   <div className="w-full lg:w-[35%] relative bg-gradient-to-b from-transparent to-[var(--color-accent)]/10 flex items-end justify-center overflow-hidden min-h-[400px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-white/5 pt-8">
     {/* Background glow */}
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-accent)]/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
     {m.image ? (
       <img 
         src={urlFor(m.image).url()} 
         alt={m.name} 
         className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-500 group-hover:scale-105 origin-bottom" 
       />
     ) : (
       <img 
         src={`/images/members/${m.name?.split(' ')[0].toLowerCase()}.png`} 
         alt={m.name} 
         className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-500 group-hover:scale-105 origin-bottom" 
       />
     )}
   </div>

   {/* Right Side: Details */}
   <div className="w-full lg:w-[65%] flex flex-col">
    {/* Top bar */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 border-b border-white/5">
     <div>
      <h3 className="heading-card mb-1">{m.name}</h3>
      <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-accent)]">{m.role}</p>
     </div>
     <div className="flex items-center gap-4 mt-4 sm:mt-0">
      {m.zodiac && <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 font-bold">{m.zodiac}</span>}
      {m.birthday && <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/50 font-bold bg-white/[0.04] px-3 py-1 border border-white/5">🎂 {m.birthday}</span>}
     </div>
    </div>

    {/* Quote */}
    {m.favQuote && (
      <div className="px-6 md:px-8 py-5 bg-[var(--color-accent)]/5 border-b border-white/5">
       <p className="text-[0.95rem] text-white/80 italic leading-relaxed">&ldquo;{m.favQuote}&rdquo;</p>
      </div>
    )}

    {/* Details grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-white/[0.03] grow">
     {[
      { label: "Best Trait", value: m.bestTrait },
      { label: "Favorite Bands", value: m.favBands },
      { label: "Favorite Album", value: m.favAlbum },
      { label: "Favorite Movie(s)", value: m.favMovie },
      { label: "Fav 7H Song", value: m.fav7hSong },
      { label: "First Song Learned", value: m.firstSong },
      { label: "Best Feeling", value: m.bestFeeling },
      { label: "Hobbies", value: m.hobbies },
      { label: "Influences", value: m.influences },
     ].filter(detail => detail.value).map((detail) => (
      <div key={detail.label} className="p-5 md:p-6 bg-[var(--color-bg-card)]">
       <p className="text-[0.55rem] uppercase tracking-[0.15em] text-[var(--color-accent)] font-bold mb-2">{detail.label}</p>
       <p className="text-[0.85rem] text-white/60 leading-relaxed">{detail.value}</p>
      </div>
     ))}
    </div>

    {/* Fun fact */}
    {m.funFact && (
      <div className="px-6 md:px-8 py-5 bg-[var(--color-bg-primary)] flex flex-col sm:flex-row sm:items-start gap-3">
       <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white font-black shrink-0 mt-0.5 bg-[var(--color-accent)] px-2 py-1 rounded-sm">Fun Fact</span>
       <p className="text-[0.85rem] text-white/70 leading-relaxed">{m.funFact}</p>
      </div>
    )}
   </div>
  </div>
 ))}
 </div>
 </div>
 </section>

 {/* Accomplishments */}
 <section className="py-32 bg-[var(--color-bg-primary)]">
 <div className="site-container">
 <div className="text-center mb-16">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Accomplishments</span>
 <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
 40 Years of <span className="gradient-text">Achievements</span>
 </h2>
 </div>
 <div className="max-w-[900px] mx-auto flex flex-col gap-2">
 {accomplishments.map((item, i) => (
 <div key={i} className="flex items-start gap-4 px-6 py-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed transition-all duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card-hover)]">
 <span className="text-[var(--color-accent)] shrink-0 mt-0.5">✦</span>
 <p>{item}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Performed With */}
 <section className="py-32 bg-[var(--color-bg-secondary)]">
 <div className="site-container">
 <div className="text-center mb-16">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Shared the Stage With</span>
 <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
 Major Label <span className="gradient-text">Artists</span>
 </h2>
 </div>
 <div className="flex flex-wrap justify-center gap-2 max-w-[1000px] mx-auto">
 {performedWith.map((artist, i) => (
 <span key={i} className="inline-block px-4 py-1.5 text-[0.85rem] text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-150 hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[rgba(133,29,239,0.1)]">
 {artist}
 </span>
 ))}
 <span className="inline-block px-4 py-1.5 text-[0.85rem] text-[var(--color-text-secondary)] opacity-50">and many more...</span>
 </div>
 </div>
 </section>

 {/* Download */}
 <section className="py-32 bg-[var(--color-bg-primary)] text-center">
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
