import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
 title: "Bio — 7th Heaven",
 description: "Meet the members of 7th heaven and learn about their 40-year journey of rocking stages worldwide.",
};

const members = [
 {
  name: "Adam Heisler",
  role: "Lead Vocals",
  birthday: "March 13",
  zodiac: "Pisces",
  bestTrait: "I care too much",
  worstTrait: "I care too much",
  favBands: "Ben Rector, Billy Joel",
  favAlbum: "The Stranger — Billy Joel",
  favMovie: "Give me a good romantic comedy and a box of tissues",
  fav7hSong: "You and I",
  favQuote: "I'm always happy and never satisfied",
  hobbies: "Being a Dad",
  funFact: "I used to be a Jr. Black belt in Tae Kwon Do",
  firstSong: "First song was one I wrote",
  bestFeeling: "Making someone happy",
  influences: "God",
 },
 {
  name: "Richard Hofherr",
  role: "Guitars • Keys • Vocals",
  birthday: "May 17",
  zodiac: "Taurus",
  bestTrait: "My Perspectives, Work Ethic, Loyalty, Instincts",
  worstTrait: "Time Management",
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
  name: "Nick Cox",
  role: "Guitars • Vocals • Piano",
  birthday: "March 19",
  zodiac: "Pisces",
  bestTrait: "Great listener",
  worstTrait: "Can't hear very well",
  favBands: "Kiss, Queen, Heart, Zeppelin, My Chemical Romance, Avenged Sevenfold, Butch Walker",
  favAlbum: "Queen Live Killers, Physical Graffiti — Led Zeppelin",
  favMovie: "American History X",
  fav7hSong: "Take Me With You",
  favQuote: "The universe is a pretty big place. If it's just us… seems like an awful waste of space.",
  hobbies: "Astrophotography and observing the night sky",
  funFact: "I love just staying home on my couch",
  firstSong: "Angie — Rolling Stones",
  bestFeeling: "Sneezing",
  influences: "Freddy Mercury, Yngwie Malmsteen, Paul Gilbert, Butch Walker, Adam Heisler",
 },
 {
  name: "Mark Kennetz",
  role: "Bass • Vocals • Uke • Guitar",
  birthday: "October 19",
  zodiac: "Libra",
  bestTrait: "Being a Ninja",
  worstTrait: "n/a",
  favBands: "Sublime, Led Zeppelin, Muse",
  favAlbum: "40 oz to Freedom — Sublime",
  favMovie: "Hot Fuzz, Anchorman, Big Lebowski",
  fav7hSong: "Ethereal",
  favQuote: "The past is in our heads, the future is in our hands",
  hobbies: "Snowboarding, Blading, Biking, Motorcycle Riding, Saving Dolphins",
  funFact: "I'm a stage 2 carnivore, which means I eat anything with 2 legs or less, except bacon :)",
  firstSong: "People Are Strange — The Doors",
  bestFeeling: "Riding a motorcycle on an awesome day",
  influences: "The Doors, Sublime",
 },
 {
  name: "Frankie Harchut",
  role: "Drums",
  birthday: "May 31",
  zodiac: "Gemini",
  bestTrait: "Care For Others",
  worstTrait: "Sometimes Easily Distracted",
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

const accomplishments = [
 "Three #1 Hit Songs on the Billboard Charts",
 "Seven Major Radio Hit Songs",
 "Five CDs reached #1 on the Billboard Charts",
 'Opened for "Bon Jovi" & "Kid Rock" at Soldier Field to 80,000 people',
 'Opened for "Styx" to 80,000 people',
 "Written/Recorded over 5,000 songs to date — Released over 1,000 original songs",
 'Released "Jukebox", a collection of 700 original songs',
 "Seen on NBC, ABC, FOX & WGN",
 "Performed around the world, including: London (U.K.), Dublin, Ireland, Amsterdam, Panama, Cabo San Lucas, Puerto Vallarta, Hawaii, Vegas (numerous times) and 20 international cruise ships",
 '"Beautiful Life" heard on the MTV show "Teen Mom 2" Episode 11 — Trouble in Paradise',
 '"She Could Use a Little Sunshine" currently played on the CBS Morning Show; and also in the Ziplock TV Commercial',
 "Performed the National Anthem at the Chicago Bulls / LA Lakers game — seen on worldwide TV",
 "Started in 1985 — 40 years ago (when we were little kids)",
 "Recognized as one of the biggest independent bands in the world",
 'Wrote & Performed TV/Radio Commercial for "Empress Casino"',
 'Wrote & Performed TV Commercial for "Walter E. Smithe / Chicago Cubs"',
 "Voted best band in Chicago thru Bar Star",
 "Mailing list is over 100,000 with 50,000+ Facebook likes",
 "Averages 100 outdoor festivals per year",
 "7th heaven's music has been heard on MTV",
 "Featured in Guitar Edge Magazine July/Aug 2006",
 "Endorsed by many major musical instrument manufacturers",
 "Packs venues across the Midwest U.S.",
 "Website receives an average of 100,000 hits per day",
 "Extremely high-energy live shows",
 'Six 7th heaven songs are in the film "Lizzie"',
 'One 7th heaven song in the film "Light Years Away"',
 "Appeared in numerous local, national & global magazines with featured articles",
 'Performed twice on the "Jenny Jones" TV Show (Over 75 million viewers Worldwide)',
 'Performed on the "Mancow\'s Morning Madhouse" radio show to over 1 million listeners',
 "7th heaven's original music is featured at numerous restaurants and retail outlets across the world",
];

const performedWith = [
 "Bon Jovi", "Def Leppard", "Journey", "Rick Springfield", "REO Speedwagon",
 "Foreigner", "Styx", "Sammy Hagar", "The Fixx", "Neon Trees", "Mark McGrath",
 "Fitz and the Tantrums", "Kid Rock", "3 Doors Down", "Filter", "Pat Benatar",
 "Jefferson Starship", "Survivor", "Ratt", "Cheap Trick", "Bret Michaels",
 "Night Ranger", "Huey Lewis and the News", "Train", "Warrant", "Vixen",
 "Firehouse", "Kansas", "38 Special", "Zebra", "Joe Lynn Turner", "Nelson",
 "Meat Loaf", "Joan Jett & The Blackhearts", "The Smithereens", "Molly Hatchet",
 "Leann Rimes", "John Waite", "Eric Martin", "The Outfield", "Gin Blossoms",
 "Wasp", "Europe", "Lou Gramm", "Great White", "Bonham", "Rare Earth",
 "Joe Walsh", "Mitch Ryder & the Detroit Wheels", "Bachman Turner Overdrive",
 "Badfinger", "George Thorogood", "Quiet Riot", "The Spinners", "Taylor Dayne",
 "Foghat", "Ted Nugent", "Tiffany",
];

export default function BioPage() {
 return (
 <div className="pt-[72px]">
 {/* Hero */}
 <section className="pt-24 pb-10 text-center bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
 <div className="site-container">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">About</span>
 <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight tracking-tight">
 The <span className="gradient-text">7th Heaven</span> Story
 </h1>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mt-4">An experience you just have to see and hear.</p>
 </div>
 </section>

 {/* Bio Text */}
 <section className="py-32 bg-[var(--color-bg-primary)]">
 <div className="max-w-[800px] mx-auto px-6 text-center">
 <p className="text-[var(--color-text-secondary)] text-[1.05rem] leading-loose mb-6">
 7th heaven is an experience you just have to see and hear! 7th heaven has charted #1 on the Midwest Billboard Charts three times; and has had 7 major radio hits. The band has toured the world; playing: U.K., Ireland, Greece, Amsterdam, Panama, Mexico and all over the United States.
 </p>
 <p className="text-[var(--color-text-secondary)] text-[1.05rem] leading-loose">
 The band has played Las Vegas numerous times, as well as played on 20 international cruise ships. Known for the famous &quot;30 Songs in 30 Minutes&quot; medley of songs from the 70&apos;s and 80&apos;s, 7th heaven has been an entertainment staple for 40 years. Playing around 200 shows a year, with an average of 100 outdoor events, 7th heaven has earned the right to say ...&quot;We&apos;ve seen a million faces and rocked them all!&quot;
 </p>
 </div>
 </section>

 {/* Members */}
 <section className="py-32 bg-[var(--color-bg-secondary)]">
 <div className="site-container">
 <div className="text-center mb-16">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Band Members</span>
 <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
  Meet the <span className="gradient-text">Players</span>
 </h2>
 </div>
 <div className="flex flex-col gap-8">
 {members.map((m, i) => (
  <div key={m.name} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden transition-all hover:border-[var(--color-border-hover)]" id={`bio-member-${i}`}>
   {/* Top bar: name + role + birthday */}
   <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 border-b border-white/5">
    <div className="flex items-center gap-5">
     <div className="w-16 h-16 shrink-0 flex items-center justify-center accent-gradient-bg">
      <span className="font-[var(--font-heading)] text-[1.4rem] font-extrabold text-white">{m.name.charAt(0)}</span>
     </div>
     <div>
      <h3 className="font-[var(--font-heading)] text-xl font-bold">{m.name}</h3>
      <p className="text-sm text-[var(--color-accent)]">{m.role}</p>
     </div>
    </div>
    <div className="flex items-center gap-4 mt-3 md:mt-0">
     <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/25 font-bold">{m.zodiac}</span>
     <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 font-bold bg-white/[0.04] px-3 py-1">🎂 {m.birthday}</span>
    </div>
   </div>

   {/* Quote banner */}
   <div className="px-6 md:px-8 py-4 bg-[var(--color-accent)]/5 border-b border-white/5">
    <p className="text-[0.85rem] text-white/60 italic">&ldquo;{m.favQuote}&rdquo;</p>
   </div>

   {/* Details grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.03]">
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
    ].map((detail) => (
     <div key={detail.label} className="p-4 bg-[var(--color-bg-card)]">
      <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25 font-bold mb-1">{detail.label}</p>
      <p className="text-[0.8rem] text-white/60 leading-relaxed">{detail.value}</p>
     </div>
    ))}
   </div>

   {/* Fun fact banner */}
   <div className="px-6 md:px-8 py-4 border-t border-white/5 flex items-start gap-3">
    <span className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--color-accent)] font-bold shrink-0 mt-0.5">Fun Fact</span>
    <p className="text-[0.8rem] text-white/50">{m.funFact}</p>
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
