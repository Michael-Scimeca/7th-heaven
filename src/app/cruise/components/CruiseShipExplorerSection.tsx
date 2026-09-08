"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import LazyMount from "@/components/LazyMount";

export default function CruiseShipExplorerSection() {
  const [foodTypeTab, setFoodTypeTab] = useState<"included" | "paid">("included");
  const [barTab, setBarTab] = useState<"bars" | "entertainment">("bars");

  return (
    <div id="ship-explorer" className="py-[32px] md:py-20" style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}>
      <LazyMount minHeight="800px" rootMargin="300px 0px">
        <div className="text-left w-full mb-10">
          <h2 className="font-bold uppercase text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
            Ship Specifications <span className="accent-gradient-text">& Inclusions</span>
          </h2>
          <p className="mt-3 font-semibold max-w-2xl">
            Explore structural specs, dining options (included vs fee-based), entertainment venues, and bars on our state-of-the-art vessel.
          </p>
        </div>

        {/* Specs & Dimensions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-left">
          {[
            { label: "Gross Tonnage", value: "248,663 GT" },
            { label: "Total Length", value: "1,196.9 Feet" },
            { label: "Total Width", value: "159.1 Feet" },
            { label: "Decks Tall", value: "20 Decks" },
          ].map((stat) => (
            <div key={stat.label} className="bg-transparent border-0 p-0 text-left">
              <span className="text-white font-bold uppercase block">{stat.label}</span>
              <span className="text-lg md:text-xl font-bold text-white mt-1 block">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── STAR OF THE SEAS OFFICIAL SHIP PHOTO GALLERY ── */}
        <div className="mb-16">
          <div className="mb-6 text-left">
            <h3 className="font-bold uppercase text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Star of the Seas <span className="accent-gradient-text">Official Photo Gallery</span>
            </h3>
            <p className="font-semibold mt-1">
              Authentic ship photography directly from Royal Caribbean's newest Icon-Class flagship launching August 2025.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "Star of the Seas Sunset Aerial", img: "/images/cruise/ship/star-aerial-sunset.jpg", category: "Icon Class Ship" },
              { title: "Twilight Evening Aerial View", img: "/images/cruise/ship/star-aerial-evening.jpg", category: "Exterior Architecture" },
              { title: "The AquaDome Theater", img: "/images/cruise/ship/aquadome.jpg", category: "Mainstage Venue" },
              { title: "Central Park Neighborhood", img: "/images/cruise/ship/central-park.jpg", category: "Open-Air Garden" },
              { title: "The Hideaway Adults Pool", img: "/images/cruise/ship/hideaway-pool.jpg", category: "Infinity Edge Pool" },
              { title: "Category 6 Waterpark", img: "/images/cruise/ship/cat6-waterpark.jpg", category: "Thrill Waterpark" },
              { title: "Chops Grille Steakhouse", img: "/images/cruise/ship/chopsgrille.jpg", category: "Specialty Dining" },
              { title: "Izumi Teppanyaki & Hibachi", img: "/images/cruise/ship/izumi-hibachi.jpg", category: "Asian Specialty" },
              { title: "Lime & Coconut Pool Bar", img: "/images/cruise/ship/lime-and-coconut.jpg", category: "Tropical Lounge" },
              { title: "Schooner Piano Lounge", img: "/images/cruise/ship/schooner-bar.jpg", category: "Cocktail Bar" },
              { title: "Dueling Pianos Music Hall", img: "/images/cruise/ship/duelingpianos.jpg", category: "Live Nightlife" },
              { title: "Ultimate Family Townhouse", img: "/images/cruise/ship/family-townhouse.jpg", category: "Suite Luxury" },
            ].map((item) => (
              <div key={item.title} className="relative rounded-2xl overflow-hidden group h-52 sm:h-60 rounded-lg">
                <Image
                  width={400}
                  height={300}
                  unoptimized
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <SectionBadge label={item.category} className="self-start mb-1.5" />
                  <p className="font-bold leading-snug">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dining Tab Section */}
        <div className="bg-transparent p-0 text-left mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-bold uppercase text-white">Dining Explorer Guide</h3>
              <p className="font-semibold mt-1">Discover included food spots and premium specialty restaurants.</p>
            </div>
            {/* Dining Filter Tabs */}
            <div className="flex items-center gap-2">
              <FoolishShrimpButton
                onClick={() => setFoodTypeTab("included")}
                isActive={foodTypeTab === "included"}
                className="px-4 py-2 font-bold uppercase text-xs cursor-pointer"
              >
                Included (Free)
              </FoolishShrimpButton>
              <FoolishShrimpButton
                onClick={() => setFoodTypeTab("paid")}
                isActive={foodTypeTab === "paid"}
                className="px-4 py-2 font-bold uppercase text-xs cursor-pointer"
              >
                Specialty (With Fee)
              </FoolishShrimpButton>
            </div>
          </div>

          {/* Bento Box Food Grid */}
          <div key={foodTypeTab} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80 animate-[fade-in_0.35s_ease-out_both]">
            {(foodTypeTab === "included"
              ? [
                { name: "Windjammer Buffet", img: "/images/cruise/ship/windjammer.jpg", tag: "Buffet" },
                { name: "Main Dining Room", img: "/images/cruise/ship/star-aerial-sunset.jpg", tag: "Main Dining" },
                { name: "Park Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "Deli & Bites" },
                { name: "Pearl Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "24/7 Snacks" },
                { name: "Sorrento's Pizza", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Fresh Pizza" },
                { name: "Basecamp", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Casual Eats" },
                { name: "Surfside Bites", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Quick Service" },
                { name: "Surfside Eatery", img: "/images/cruise/ship/windjammer.jpg", tag: "Family Buffet" },
                { name: "El Loco Fresh", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Mexican" },
                { name: "Creme De La Crepe", img: "/images/cruise/ship/central-park.jpg", tag: "Creperie" },
                { name: "Pig Out BBQ", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "BBQ Grill" },
                { name: "Toast & Garden", img: "/images/cruise/ship/central-park.jpg", tag: "Breakfast" },
                { name: "Mai Thai", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Asian Fusion" },
                { name: "Feta Mediterranean", img: "/images/cruise/ship/central-park.jpg", tag: "Greek & Med" },
                { name: "La Cocinita", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Street Food" },
                { name: "Sprinkles Ice Cream", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Soft Serve" },
                { name: "Coastal Kitchen (Suites)", img: "/images/cruise/ship/family-townhouse.jpg", tag: "Suite Dining" },
                { name: "The Grove (Suites)", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Suite Buffet" },
                { name: "Vitality Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "Healthy Eats" },
                { name: "Room Service (Breakfast)", img: "/images/cruise/ship/windjammer.jpg", tag: "In-Stateroom" },
              ]
              : [
                { name: "Chops Grille", img: "/images/cruise/ship/chopsgrille.jpg", tag: "Steakhouse" },
                { name: "Izumi Hibachi", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Teppanyaki" },
                { name: "Izumi Sushi", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Sushi Bar" },
                { name: "Izumi in the Park", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Walk-Up Asian" },
                { name: "Hooked Seafood", img: "/images/cruise/ship/windjammer.jpg", tag: "Seafood" },
                { name: "Giovanni's Italian Kitchen", img: "/images/cruise/ship/central-park.jpg", tag: "Trattoria" },
                { name: "Playmakers Sports Bar", img: "/images/cruise/ship/duelingpianos.jpg", tag: "Pub & Arcade" },
                { name: "Lincoln Park Supper Club", img: "/images/cruise/ship/chopsgrille.jpg", tag: "Fine Dining" },
                { name: "Desserted Milkshake Bar", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Over-the-Top Shakes" },
                { name: "Pier 7", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Beach Club" },
                { name: "Celebration Table", img: "/images/cruise/ship/chopsgrille.jpg", tag: "VIP Dining" },
                { name: "Starbucks Coffee", img: "/images/cruise/ship/central-park.jpg", tag: "Espresso Bar" },
                { name: "Sugar Beach", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Candy & Treats" },
                { name: "Room Service (Lunch/Dinner)", img: "/images/cruise/ship/chopsgrille.jpg", tag: "24/7 In-Room" },
                { name: "Trellis Bar Dining", img: "/images/cruise/ship/central-park.jpg", tag: "Outdoor Dining" },
              ]
            ).map((food) => (
              <div key={food.name} className="relative rounded-lg overflow-hidden group border border-black/10 h-48 md:h-56">
                <Image width={200} height={200} unoptimized src={food.img} alt={food.name} className="w-full h-full object-cover" />
                <div className="absolute rounded-lg inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <SectionBadge label={food.tag} className="self-start mb-1.5" />
                  <p className="font-bold leading-snug">{food.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BARS & ENTERTAINMENT SEGMENTED TABS SECTION ── */}
        <div className="py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-4 border-b border-white/10 text-left">
            <div className="w-full lg:w-auto">
              <h3 className="font-bold uppercase text-white">Bars & Entertainment Explorer</h3>
              <p className="font-semibold mt-1">Explore 20 onboard lounges, nightlife venues, and world-class attractions.</p>
            </div>
            <div className="flex p-1 shrink-0 self-start lg:self-center max-w-full overflow-x-auto gap-2">
              <FoolishShrimpButton
                onClick={() => setBarTab("bars")}
                isActive={barTab === "bars"}
                className="px-4 py-2 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
              >
                <span>Bars & Clubs</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${barTab === "bars" ? "bg-white/20 text-white" : "bg-white/10 text-purple-300"}`}>20</span>
              </FoolishShrimpButton>
              <FoolishShrimpButton
                onClick={() => setBarTab("entertainment")}
                isActive={barTab === "entertainment"}
                className="px-4 py-2 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
              >
                <span>Entertainment</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${barTab === "entertainment" ? "bg-white/20 text-white" : "bg-white/10 text-purple-300"}`}>20</span>
              </FoolishShrimpButton>
            </div>
          </div>

          <div key={barTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white/80 animate-[fade-in_0.35s_ease-out_both]">
            {(barTab === "bars"
              ? [
                { name: "Lime & Coconut Bar", img: "/images/cruise/ship/limecoconut.jpg", tag: "Poolside" },
                { name: "Rye & Beam", img: "/images/cruise/ship/ryebeam.jpg", tag: "Bourbon" },
                { name: "Lemon Post Bar", img: "/images/cruise/ship/lemonpost.jpg", tag: "Outdoor" },
                { name: "Swim & Tonic Pool Bar", img: "/images/cruise/ship/swimtonic.jpg", tag: "Swim-Up" },
                { name: "The Hideaway Lounge", img: "/images/cruise/ship/thehideaway.jpg", tag: "Adults Only" },
                { name: "Vue Bar", img: "/images/cruise/ship/vuebar.jpg", tag: "Ocean View" },
                { name: "Overlook Bar & Pods", img: "/images/cruise/ship/overlookbar.jpg", tag: "AquaDome" },
                { name: "Basecamp Bar", img: "/images/cruise/ship/basecampbar.jpg", tag: "Thrill Zone" },
                { name: "Trellis Bar", img: "/images/cruise/ship/trellisbar.jpg", tag: "Central Park" },
                { name: "Boleros Latin Bar", img: "/images/cruise/ship/bolerosbar.jpg", tag: "Latin Dance" },
                { name: "Cantina Fresca", img: "/images/cruise/ship/cantinafrescabar.jpg", tag: "Mexican" },
                { name: "Bubbles Champagne Bar", img: "/images/cruise/ship/bubblesbar.jpg", tag: "Champagne" },
                { name: "Point & Feather Pub", img: "/images/cruise/ship/pointfeather.jpg", tag: "English Pub" },
                { name: "Schooner Bar", img: "/images/cruise/ship/schoonerbar.jpg", tag: "Piano Lounge" },
                { name: "1400 Lobby Bar", img: "/images/cruise/ship/1400bar.jpg", tag: "Atrium" },
                { name: "Dueling Pianos Lounge", img: "/images/cruise/ship/duelingpianosbar.jpg", tag: "Live Music" },
                { name: "Lou's Jazz & Blues", img: "/images/cruise/ship/lousbar.jpg", tag: "Jazz Club" },
                { name: "Music Hall Lounge", img: "/images/cruise/ship/musichallbar.jpg", tag: "Rock Venue" },
                { name: "Playmakers Lounge", img: "/images/cruise/ship/playmakersbar.jpg", tag: "Sports & Arcade" },
                { name: "Casino Royale Bar", img: "/images/cruise/ship/casinoroyalbar.jpg", tag: "Casino Lounge" },
              ]
              : [
                { name: "Back to the Future Musical", img: "/images/cruise/ship/backtothefurure.jpg", tag: "Broadway Show" },
                { name: "Flowrider Surf Simulator", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_flowrider_2361_rt-crop-u35615.jpg", tag: "Surf Simulator" },
                { name: "Absolute Zero Ice Rink", img: "/images/cruise/ship/superclub.jpg", tag: "Ice Arena" },
                { name: "Torque Racing Arena", img: "/images/cruise/ship/torgue.jpg", tag: "E-Karting" },
                { name: "SOL Pool Zone", img: "/images/cruise/ship/sol.jpg", tag: "Top Deck Pool" },
                { name: "Create! Art Studio", img: "/images/cruise/ship/create.jpg", tag: "Craft Studio" },
                { name: "The Price is Right Game", img: "/images/cruise/ship/thepriceisright.jpg", tag: "Game Show" },
                { name: "The Quest Adult Game", img: "/images/cruise/ship/quest.jpg", tag: "Adult Show" },
                { name: "Comedy Live Theater", img: "/images/cruise/ship/comedy.jpg", tag: "Standup Comedy" },
                { name: "Headliner Concert Stage", img: "/images/cruise/ship/headliner.jpg", tag: "Live Concerts" },
                { name: "Spotlight Karaoke Box", img: "/images/cruise/ship/karoke.jpg", tag: "Karaoke" },
                { name: "Music Hall Nightclub", img: "/images/cruise/ship/lous.jpg", tag: "Nightclub" },
                { name: "Ultimate Family Townhouse", img: "/images/cruise/ship/rci_ic_202401_cc_ahendel_ultimatefamilytownhouse_e43a2011_rt-crop-u36238.jpg", tag: "3-Story Suite" },
                { name: "Splashaway Bay & Cat 6", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_cat6waterpark_hurricanehunter_gopr0154_rt-crop-u35622.jpg", tag: "Water Park" },
                { name: "Adrenaline Peak Climb", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_adrenalinepeak_6050_rt-crop-u35524.jpg", tag: "Rock Climbing" },
                { name: "Adventure Ocean Kids Club", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_adventureocean_1407_rt-crop-u36294.jpg", tag: "Youth Program" },
                { name: "Central Park Gardens", img: "/images/cruise/ship/central%20park2-crop-u36273.jpg", tag: "Nature Park" },
                { name: "Lost Dunes Mini Golf", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_lostdunes_6868_rt-crop-u35608.jpg", tag: "Mini Golf" },
                { name: "Surfside Carousel", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_surfsidecarousel_1851_rt-crop-u37671.jpg", tag: "Carousel" },
                { name: "Royal AquaDome Theater", img: "/images/cruise/ship/aquadome.jpg", tag: "Main Theater" },
              ]
            ).map((item) => (
              <div key={item.name} className="relative overflow-hidden rounded-lg group border border-black/10 h-48 md:h-56">
                <Image width={200} height={200} unoptimized src={item.img} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <SectionBadge label={item.tag} className="self-start mb-1.5" />
                  <p className="font-bold leading-snug">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LazyMount>
    </div>
  );
}
