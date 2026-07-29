"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

interface Track {
  id: string;
  number: number;
  title: string;
  duration: string;
  audioUrl: string;
}

interface Album {
  id: string;
  title: string;
  subtitle?: string;
  year: string;
  coverImage: string;
  centerLabelColor: string;
  storeUrl: string;
  tracks: Track[];
}

const ALBUMS: Album[] = [
  {
    id: "be-here",
    title: "BE HERE",
    subtitle: "POP MUSIC",
    year: "2021",
    coverImage: "/images/album/Be-Here.png",
    centerLabelColor: "#eab308",
    storeUrl: "/store",
    tracks: [
      { id: "bh1",  number: 1,  title: "ARE WE THERE YET",          duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDElMjBBcmUlMjBXZSUyMFRoZXJlJTIwWWV0Lm1wMw==" },
      { id: "bh2",  number: 2,  title: "COME WHAT MAY",              duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDIlMjBDb21lJTIwV2hhdCUyME1heS5tcDM=" },
      { id: "bh3",  number: 3,  title: "FOR NEVER AND EVER",         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDMlMjBGb3IlMjBOZXZlciUyMGFuZCUyMEV2ZXIubXAz" },
      { id: "bh4",  number: 4,  title: "SUNDRESSES",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDQlMjBTdW5kcmVzc2VzLm1wMw==" },
      { id: "bh5",  number: 5,  title: "AIN'T THAT JUST BEAUTIFUL",  duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDUlMjBBaW50JTIwVGhhdCUyMEp1c3QlMjBCZWF1dGlmdWwubXAz" },
      { id: "bh6",  number: 6,  title: "MONSTER",                    duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDYlMjBNb25zdGVyLm1wMw==" },
      { id: "bh7",  number: 7,  title: "COUNTRY IN THE CITY",        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDclMjBDb3VudHJ5JTIwSW4lMjBUaGUlMjBDaXR5Lm1wMw==" },
      { id: "bh8",  number: 8,  title: "I LOVE THESE DAYS",          duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDglMjBJJTIwTG92ZSUyMFRoZXNlJTIwRGF5cy5tcDM=" },
      { id: "bh9",  number: 9,  title: "INFINITY AND A DAY",         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDklMjBJbmZpbml0eSUyMEFuZCUyMEElMjBEYXkubXAz" },
      { id: "bh10", number: 10, title: "LEGENDS",                    duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTAlMjBMZWdlbmRzLm1wMw==" },
      { id: "bh11", number: 11, title: "GET BACK UP AGAIN",          duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTElMjJHZXQlMjBCYWNrJTIwVXAlMjBBZ2Fpbi5tcDM=" },
      { id: "bh12", number: 12, title: "TAKE A RIDE OF LIFE",        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTIlMjJUYWtlJTIwQSUyMFJpZGUlMjBPZiUyMExpZmUubXAz" },
      { id: "bh13", number: 13, title: "SATURDAY NIGHT",             duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTMlMjJTYXR1cmRheSUyME5pZ2h0Lm1wMw==" },
      { id: "bh14", number: 14, title: "I WANNA SEE YOU SHINE",      duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTQlMjJJJTIwV2FubmElMjBTZWUlMjBZb3UlMjBTaGluZS5tcDM=" },
    ],
  },
  {
    id: "color-in-motion",
    title: "COLOR IN MOTION",
    subtitle: "7TH HEAVEN",
    year: "2018",
    coverImage: "/images/album/colot-in-motion.png",
    centerLabelColor: "#ec4899",
    storeUrl: "/store",
    tracks: [
      { id: "cim1",  number: 1,  title: "THIS IS WHERE THE PARTY'S AT", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAxJTIwVGhpcyUyMElzJTIwV2hlcmUlMjBUaGUlMjBQYXJ0eSUyN3MlMjBBdC5tcDM=" },
      { id: "cim2",  number: 2,  title: "WONDERFUL WORLD",              duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAyJTIwV29uZGVyZnVsJTIwV29ybGQubXAz" },
      { id: "cim3",  number: 3,  title: "SAY IT ALREADY",               duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAzJTIwU2F5JTIwSXQlMjBBbHJlYWR5Lm1wMw==" },
      { id: "cim4",  number: 4,  title: "TIME AND AGAIN",               duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA0JTIwVGltZSUyMEFuZCUyMEFnYWluLm1wMw==" },
      { id: "cim5",  number: 5,  title: "BETTER LUCK NEXT TIME",        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA1JTIwQmV0dGVyJTIwTHVjayUyME5leHQlMjBUaW1lLm1wMw==" },
      { id: "cim6",  number: 6,  title: "I SEE YOU SMILE",              duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA2JTIwSSUyMFNlZSUyMFlvdSUyMFNtaWxlLm1wMw==" },
      { id: "cim7",  number: 7,  title: "MAKE YOU LOVE ME",             duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA3JTIwTWFrZSUyMFlvdSUyMExvdmUlMjBNZS5tcDM=" },
      { id: "cim8",  number: 8,  title: "HAPPY NOW",                    duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA4JTIwSGFwcHklMjJOb3cubXAz" },
      { id: "cim9",  number: 9,  title: "PICKING UP THE PIECES",        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA5JTIwUGlja2luZyUyMFVwJTIwVGhlJTIwUGllY2VzLm1wMw==" },
      { id: "cim10", number: 10, title: "CLOSEST THING",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzEwJTIwQ2xvc2VzdCUyMFRoaW5nLm1wMw==" },
    ],
  },
  {
    id: "luminous",
    title: "LUMINOUS",
    subtitle: "7TH HEAVEN",
    year: "2017",
    coverImage: "/images/album/luminous.png",
    centerLabelColor: "#8b5cf6",
    storeUrl: "/store",
    tracks: [
      { id: "lu1",  number: 1,  title: "HOME",                           duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMSUyMEhvbWUubXAz" },
      { id: "lu2",  number: 2,  title: "BEAUTIFUL LIFE",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMiUyMEJlYXV0aWZ1bCUyMExpZmUubXAz" },
      { id: "lu3",  number: 3,  title: "MIDWEST GIRL IN THE SUMMERTIME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMyUyME1pZHdlc3QlMjBHaXJsJTIwaW4lMjB0aGUlMjJTdW1tZXJ0aW1lLm1wMw==" },
      { id: "lu4",  number: 4,  title: "ALWAYS",                         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNCUyMEFsd2F5cy5tcDM=" },
      { id: "lu5",  number: 5,  title: "IF YOU CHANGE YOUR MIND",        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNSUyMklmJTIwWW91JTIwQ2hhbmdlJTIwWW91ciUyME1pbmQubXAz" },
      { id: "lu6",  number: 6,  title: "CONTACT",                        duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNiUyMkNvbnRhY3QubXAz" },
      { id: "lu7",  number: 7,  title: "FORGET ABOUT ME",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNyUyMkZvcmdldCUyMkFib3V0JTIyTWUubXAz" },
      { id: "lu8",  number: 8,  title: "EYES WIDE OPEN",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOCUyMkV5ZXMlMjJXaWRlJTIyT3Blbi5tcDM=" },
      { id: "lu9",  number: 9,  title: "SO WONDERFUL",                   duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOSUyMlNvJTIyV29uZGVyZnVsLm1wMw==" },
      { id: "lu10", number: 10, title: "SOS",                            duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8xMCUyMlNPUy5tcDM=" },
    ],
  },
  {
    id: "next",
    title: "NEXT",
    subtitle: "7TH HEAVEN",
    year: "2008",
    coverImage: "/images/album/next.png",
    centerLabelColor: "#10b981",
    storeUrl: "/store",
    tracks: [
      { id: "uu1",  number: 1,  title: "BETTER THIS WAY",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wMSUyMEJldHRlciUyMFRoaXMlMjBXYXkubXAz" },
      { id: "uu2",  number: 2,  title: "CELLOPHANE",                      duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wMiUyMENlbGxvcGhhbmUubXAz" },
      { id: "uu3",  number: 3,  title: "STILL BE HERE",                   duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wMyUyMFN0aWxsJTIwQmUlMjBIZXJlLm1wMw==" },
      { id: "uu4",  number: 4,  title: "GRAVITY",                         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wNCUyMEdyYXZpdHkubXAz" },
      { id: "uu5",  number: 5,  title: "GAVE YOU MY WORD",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wNSUyMEdhdmUlMjBZb3UlMjJNeSUyMldvcmQubXAz" },
      { id: "uu6",  number: 6,  title: "KILL THE CYCLE",                  duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wNiUyMEtpbGwlMjJUaGUlMjJDeWNsZS5tcDM=" },
      { id: "uu7",  number: 7,  title: "THIS SUMMERS GONNA LAST FOREVER", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wNyUyMFRoaXMlMjJTdW1tZXJzJTIyR29ubmElMjJMYXN0JTIyRm9yZXZlci5tcDM=" },
      { id: "uu8",  number: 8,  title: "GHOST OF ME",                     duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wOCUyMEdob3N0JTIyT2YlMjJNZS5tcDM=" },
      { id: "uu9",  number: 9,  title: "SAVE YOUR LIFE",                  duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8wOSUyMlNhdmUlMjJZb3VyJTIyTGlmZS5tcDM=" },
      { id: "uu10", number: 10, title: "HAND ON MY HEART",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xMCUyMkhhbmQlMjJPbiUyMk15JTIySGVhcnQubXAz" },
      { id: "uu11", number: 11, title: "WINNING IT ALL",                  duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xMSUyMldpbm5pbmclMjJJdCUyMkFsbC5tcDM=" },
      { id: "uu12", number: 12, title: "OH SO REALLY OLD",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xMiUyMk9oJTIyU28lMjJSZWFsbHklMjJPbGQubXAz" },
      { id: "uu13", number: 13, title: "TRAGEDY",                         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xMyUyMlRyYWdlZHkubXAz" },
      { id: "uu14", number: 14, title: "UNDONE",                          duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xNCUyMlVuZG9uZS5tcDM=" },
      { id: "uu15", number: 15, title: "DREAM OF NEW DAY",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xNSUyMkRyZWFtJTIyT2YlMjJOZXclMjJEYXkubXAz" },
      { id: "uu16", number: 16, title: "ELECTRONIC KARMA",                duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xNiUyMkVsZWN0cm9uaWMlMjJLYXJtYS5tcDM=" },
      { id: "uu17", number: 17, title: "TAKE ME BACK",                    duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xNyUyMlRha2UlMjJNZSUyMkJhY2subXAz" },
      { id: "uu18", number: 18, title: "WHILE YOU DREAM",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMjAlMjBVLlMuQS4lMjAtJTIwVS5LLi8xOCUyMldoaWxlJTIyWW91JTIyRHJlYW0ubXAz" },
    ],
  },
  {
    id: "spectrum",
    title: "SPECTRUM",
    subtitle: "7TH HEAVEN",
    year: "2013",
    coverImage: "/images/album/spectrum.png",
    centerLabelColor: "#3b82f6",
    storeUrl: "/store",
    tracks: [
      { id: "sy1",  number: 1,  title: "WE LIVE LIFE YOUNG",              duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzAxJTIwV2UlMjBMaXZlJTIwTGlmZSUyMFlvdW5nLm1wMw==" },
      { id: "sy2",  number: 2,  title: "PAGES",                           duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzAyJTIwUGFnZXMubXAz" },
      { id: "sy3",  number: 3,  title: "NEVER GONNA BRING ME DOWN",       duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzAzJTIwTmV2ZXIlMjBHb25uYSUyMEJyaW5nJTIwTWUlMjBEb3duLm1wMw==" },
      { id: "sy4",  number: 4,  title: "COUNTING THE DAYS",               duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA0JTIwQ291bnRpbmclMjJUaGUlMjJEYXlzLm1wMw==" },
      { id: "sy5",  number: 5,  title: "RHIANNA",                         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA1JTIwUmhpYW5uYS5tcDM=" },
      { id: "sy6",  number: 6,  title: "POWER OF LOVE",                   duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA2JTIwUG93ZXIlMjJPZiUyMkxvdmUubXAz" },
      { id: "sy7",  number: 7,  title: "TAKE MY HEART (DO IT ALL AGAIN)", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA3JTIwVGFrZSUyME15JTIwSGVhcnQlMjAoRG8lMjBJdCUyMEFsbCUyMEFnYWluKS5tcDM=" },
      { id: "sy8",  number: 8,  title: "LIVE ON",                         duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA4JTIwTGl2ZSUyMk9uLm1wMw==" },
      { id: "sy9",  number: 9,  title: "LIGHT UP THE WORLD",              duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzA5JTIwTGlnaHQlMjJVcCUyMlRoZSUyMldvcmxkLm1wMw==" },
      { id: "sy10", number: 10, title: "I BEGIN AGAIN",                   duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzEwJTIwSSUyMkJlZ2luJTIyQWdhaW4ubXAz" },
      { id: "sy11", number: 11, title: "I'LL BE WAITING",                 duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzExJTIwSSUyN2xsJTIwQmUlMjBXYWl0aW5nLm1wMw==" },
      { id: "sy12", number: 12, title: "WHY YA GOTTA BE LIKE THAT",      duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMTQlMjBTeW5lcmd5LzEyJTIwV2h5JTIwWWElMjJHb3R0YSUyMkJlJTIyTGlrZSUyMlRoYXQubXAz" },
    ],
  },
];

/*--------------------
SoundWaveCanvas
--------------------*/
const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

function SoundWaveCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ h: 0, amp: 0, rafId: 0 });

  const draw = useCallback((time: number) => {
    // Skip canvas draw while page-transition wave is animating — frees frame budget
    if ((window as any).__pageTransitionActive) {
      stateRef.current.rafId = requestAnimationFrame((ts) => draw(ts / 1000));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = stateRef.current;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    // settings: width:150, height:6, amplitude:-0.18, speed:5.7
    const targetH   = isPlaying ? 6 : 0.8;
    const targetAmp = isPlaying ? Math.abs(-0.18) * Math.PI * 2 : 0.05;
    st.h   = lerp(st.h,   targetH,   0.055);
    st.amp = lerp(st.amp, targetAmp, 0.055);

    ctx.clearRect(0, 0, W, H);

    const steps = 150;
    const speed = 5.7;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      const t = time * speed + (i / steps) * st.amp * Math.PI * 2;
      const y = H / 2 - Math.sin(t) * st.h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#d946ef";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    st.rafId = requestAnimationFrame((ts) => draw(ts / 1000));
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const st = stateRef.current;
    cancelAnimationFrame(st.rafId);
    st.rafId = requestAnimationFrame((ts) => draw(ts / 1000));
    return () => cancelAnimationFrame(st.rafId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "24px", height: "24px", display: "block" }}
    />
  );
}


export default function VinylHeroPlayer({
  onAlbumChange,
}: {
  onAlbumChange?: (albumId: string) => void;
}) {
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [scale, setScale]   = useState(1);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const swiperRef  = useRef<import("swiper").Swiper | null>(null);

  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 700) {
          setScale(Math.max(0.45, (window.innerWidth - 100) / 600));
        } else {
          setScale(1);
        }
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Whenever the active album or track changes, reload the audio source.
  // React updating the src= prop on <audio> does NOT trigger a browser reload —
  // we must set .src and call .load() imperatively.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
    if (!url) return;
    audio.src = url;
    audio.load();
    setProgress(0);
    setCurrentTime("0:00");
    setDuration("0:00");
  }, [activeAlbumIdx, activeTrackIdx]);

  const currentAlbum = ALBUMS[activeAlbumIdx];
  const currentTrack = currentAlbum.tracks[activeTrackIdx] || currentAlbum.tracks[0];

  const loadTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setAudioError(false);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

  const playTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    setAudioError(false);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); setAudioError(true); });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setAudioError(false);
      audioRef.current.play()
        .catch((err) => {
          console.warn("Audio play failed:", err);
          setAudioError(true);
        });
    }
  };

  const prevTrack = () => {
    const idx = activeTrackIdx > 0 ? activeTrackIdx - 1 : currentAlbum.tracks.length - 1;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const nextTrack = () => {
    const idx = activeTrackIdx < currentAlbum.tracks.length - 1 ? activeTrackIdx + 1 : 0;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIdx = swiper.realIndex;
    if (newIdx !== activeAlbumIdx) {
      setActiveAlbumIdx(newIdx);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      setDuration("0:00");
      onAlbumChange?.(ALBUMS[newIdx]?.id ?? "");
      if (audioRef.current) {
        audioRef.current.pause();
        const url = ALBUMS[newIdx]?.tracks[0]?.audioUrl;
        if (url) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
      }
    }
    // Reactivate as soon as Swiper commits to the new slide
    setIsDragging(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const durKnown = isFinite(dur) && !isNaN(dur) && dur > 0;
    if (durKnown) setProgress((cur / dur) * 100);
    setCurrentTime(fmt(cur));
    setDuration(durKnown ? fmt(dur) : "0:00");
  };

  // Fire as soon as the browser knows the duration — before the user presses play
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (isFinite(dur) && !isNaN(dur) && dur > 0) setDuration(fmt(dur));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const pct = parseFloat(e.target.value);
    const dur = audioRef.current.duration || 0;
    audioRef.current.currentTime = (pct / 100) * dur;
    setProgress(pct);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const unscaledWidth = 600;
  const unscaledHeight = 280; // Enough height to cover the 250px sleeve + margin

  return (
    <div
      className="relative flex justify-end items-end"
      style={{
        width: scale < 1 ? `${unscaledWidth * scale}px` : `${unscaledWidth}px`,
        height: scale < 1 ? `${unscaledHeight * scale}px` : `${unscaledHeight}px`,
      }}
    >
      <div
        className="absolute right-0 bottom-0 select-none"
        style={{
          width: `${unscaledWidth}px`,
          height: `${unscaledHeight}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "bottom right",
        }}
      >
      {/* Hidden Audio — src managed imperatively via useEffect/playTrack, NOT via React src= prop */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
        onError={() => setAudioError(true)}
      />

      {/* ── SWIPER VINYL DISC SLIDER ── */}
      <div
        className="vinyl-slider-wrap"
        style={{
          width: '600px',
          height: '250px',
          marginTop: '20px',
          position: 'relative',
        }}
      >


      <div className="relative" style={{ width: '600px' }}>


        {/* LAYER 1: Sleeve card background — sits BEHIND the disc (z-10) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-[250px] h-[250px] border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]" />
        </div>

        {/* LAYER 2: Swiper disc track — wrapped in fade mask so side discs dissolve */}
        <div style={{
          WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)',
          maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)',
        }}>
        <Swiper
          slidesPerView="auto"
          centeredSlides={true}
          loop={false}
          initialSlide={activeAlbumIdx}
          spaceBetween={30}
          grabCursor={true}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={handleSlideChange}
          onSliderFirstMove={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          style={{ overflow: "visible", position: "relative", zIndex: 20 }}
          className="vinyl-swiper"
        >
          {ALBUMS.map((album, idx) => (
            <SwiperSlide
              key={album.id}
              style={{ width: "165px", height: "250px", display: "flex", alignItems: "center" }}
            >

              {({ isActive }) => {
                const vinylSrc = `/vin${(idx % 3) + 1}.png`;
                return (
                <div
                  className={`relative rounded-full flex items-center justify-center mx-auto transition-opacity duration-0 overflow-hidden cursor-pointer ${
                    isActive && !isDragging
                      ? "opacity-100 scale-110 z-10 shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                      : "opacity-90 scale-90 z-0"
                  } ${isActive ? "vinyl-spinning" : ""}`}
                  style={{
                    width: "165px",
                    height: "165px",
                    animationPlayState: isActive ? (isPlaying ? "running" : "paused") : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) {
                      togglePlay();
                    } else {
                      // Switch to this album and auto-play first track
                      swiperRef.current?.slideTo(idx);
                      setActiveAlbumIdx(idx);
                      setActiveTrackIdx(0);
                      playTrack(0);
                    }
                  }}
                >
                  {/* Real vinyl disc image */}
                  <Image
                    src={vinylSrc}
                    alt={`${album.title} vinyl`}
                    fill
                    sizes="165px"
                    className="object-cover rounded-full"
                  />
                  {/* Center label with album art — sits on top of the vinyl image */}
                  <div className="relative z-10 flex items-center justify-center">
                      <div
                        className="relative w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]"
                        style={{ backgroundColor: album.centerLabelColor }}
                      >
                        <Image src={album.coverImage} alt={album.title} fill sizes="60px" className="object-cover brightness-110 contrast-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col items-center justify-end pb-1.5 text-center">
                          <span className="text-[var(--font-size-5xs)] font-black text-white uppercase tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,1)] leading-none">{album.title}</span>
                          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)] border border-black/60 mt-0.5" />
                        </div>
                      </div>
                  </div>
                </div>
                );
              }}
            </SwiperSlide>
          ))}
        </Swiper>
        </div>

        {/* LAYER 3: Controls overlay — z-30, floats ABOVE the disc */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div
            className="relative w-[250px] h-[250px] flex flex-col justify-between p-4 pointer-events-none"
            onMouseEnter={() => setShowTracklist(true)}
            onMouseLeave={() => setShowTracklist(false)}
            style={{ pointerEvents: 'auto' }}
          >

            {/* Top Controls */}
            <div className="flex items-center justify-center pointer-events-auto">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow">
                <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Previous Track">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="ml-[1px]"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Next Track">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 13 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
                </button>
                <div className="w-[1px] h-3 bg-white/20 my-auto" />
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className={`p-1 rounded-full transition-all cursor-pointer ${showTracklist ? "text-[#d946ef] bg-purple-500/30 scale-110" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                  title="Toggle Playlist"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
                <div className="w-[1px] h-3 bg-white/20 my-auto" />
                {/* Volume */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 shrink-0">
                  {volume === 0
                    ? <path d="M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6M17 9l6 6"/>
                    : volume < 0.5
                    ? <><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none"/></>
                    : <><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none"/></>}
                </svg>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-14 h-[3px] rounded-full appearance-none cursor-pointer bg-white/20"
                  style={{ accentColor: "#d946ef" }}
                />
              </div>
            </div>

            {/* Bottom: Title + Waveform */}
            <div className="flex items-end justify-between pointer-events-none mt-auto">
              <div className="flex flex-col gap-1 pointer-events-auto">
                <div
                  onClick={(e) => { e.stopPropagation(); }}
                  className="bg-white text-black rounded-lg px-2.5 py-1 shadow-md max-w-[110px] cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  <div className="text-[var(--font-size-2xs)] font-black uppercase leading-tight flex items-center gap-1">
                    <span className="truncate">{currentAlbum.title}</span>
                    <span className="text-[var(--font-size-4xs)] font-bold text-purple-600 bg-purple-100 px-1 rounded shrink-0">PLAYLIST ☰</span>
                  </div>
                  <div className="text-[var(--font-size-4xs)] font-extrabold uppercase tracking-tight text-black/70 leading-none truncate mt-0.5">
                    {currentTrack.title}
                  </div>
                </div>
                {/* BUY CD button */}
                <Link
                  href={currentAlbum.storeUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white text-[var(--font-size-4xs)] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105 w-fit"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                  Buy CD
                </Link>
              </div>
              <SoundWaveCanvas isPlaying={isPlaying} />
            </div>

            {/* Progress Scrubber — pinned to very bottom */}
            <div className="pointer-events-auto px-1 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="w-full h-[3px] rounded-full appearance-none cursor-pointer bg-white/20"
                style={{ accentColor: "#d946ef" }}
              />
              <div className="flex justify-between text-[var(--font-size-3xs)] font-mono text-white/60 mt-0.5">
                <span>{currentTime}</span>
                <span>{duration}</span>
              </div>
            </div>
          </div>
        </div>
      {/* ── TRACKLIST PANEL — anchored right of the 270px center card ── */}
      <div
        className={`absolute top-0 bottom-0 flex flex-col text-left transition-all duration-500 ease-out origin-left z-40 ${
          showTracklist
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ left: 'calc(50% + 125px)', width: showTracklist ? '220px' : '0px', overflow: 'hidden' }}
        onMouseEnter={() => setShowTracklist(true)}
        onMouseLeave={() => setShowTracklist(false)}
      >
        <div className="pl-4 border-l border-white/15 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10 whitespace-nowrap">
          <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-purple-300">
            {currentAlbum.title} TRACKLIST
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[var(--font-size-4xs)] font-bold text-white/40">{currentAlbum.tracks.length} SONGS</span>
            <button
              onClick={() => setShowTracklist(false)}
              className="text-white/50 hover:text-white text-xs font-bold px-1 rounded transition-colors cursor-pointer"
            >✕</button>
          </div>
        </div>
        <ol className="space-y-1 font-sans text-[var(--font-size-2xs)] font-bold uppercase text-white/80 tracking-tight max-h-[200px] overflow-y-auto pr-2 whitespace-nowrap">
          {currentAlbum.tracks.map((track, tIdx) => {
            const isSelected = tIdx === activeTrackIdx;
            return (
              <li
                key={track.id}
                onClick={(e) => { e.stopPropagation(); playTrack(tIdx); }}
                className={`flex items-center gap-2 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 ${
                  isSelected ? "text-purple-200 font-black bg-purple-500/15" : "hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[var(--font-size-4xs)] font-mono opacity-50 w-4 text-right">{track.number}.</span>
                <span className="truncate flex-1">{track.title}</span>
                {isSelected && isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />}
              </li>
            );
          })}
        </ol>
        </div>
      </div>

      </div>
      </div>
      </div>
    </div>
  );
}
