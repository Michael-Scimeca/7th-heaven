const venues = [
 { name: "Station 34", city: "Mt. Prospect", state: "IL", lat: 42.0640, lng: -87.9370, type: "unplugged", date: "January 2", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Station+34+Mt+Prospect+IL", websiteUrl: "https://stationthirtyfour.com/events/" },
 { name: "Old Republic", city: "Elgin", state: "IL", lat: 42.0354, lng: -88.2826, type: "full", date: "January 3", time: "8:30pm", info: "All Age Sunset", mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+Republic+Elgin+IL", websiteUrl: "" },
 { name: "Rookies", city: "Hoffman Est.", state: "IL", lat: 42.0680, lng: -88.1200, type: "unplugged", date: "January 9", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rookies+Hoffman+Estates+IL", websiteUrl: "" },
 { name: "Sundance Saloon", city: "Mundelein", state: "IL", lat: 42.2631, lng: -88.0037, type: "unplugged", date: "January 11", time: "2:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sundance+Saloon+Mundelein+IL", websiteUrl: "" },
 { name: "WGN TV News", city: "Chicago", state: "IL", lat: 41.8905, lng: -87.6358, type: "tv", date: "January 28", time: "10:00am", info: "TV Appearance", mapUrl: "https://www.google.com/maps/search/?api=1&query=WGN+TV+Chicago+IL", websiteUrl: "https://wgntv.com" },
 { name: "Youth Services", city: "Wilmette", state: "IL", lat: 42.0753, lng: -87.7256, type: "fundraiser", date: "January 30", time: "7:00pm", info: "Fundraiser - Join Us!", mapUrl: "https://www.google.com/maps/search/?api=1&query=Wilmette+IL", websiteUrl: "" },
 { name: "Des Plaines Theater", city: "Des Plaines", state: "IL", lat: 42.0334, lng: -87.8834, type: "full", date: "January 31", time: "9:00pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Des+Plaines+Theater+IL", websiteUrl: "https://desplainestheatre.com" },
 { name: "Hard Rock Casino", city: "Rockford", state: "IL", lat: 42.2711, lng: -89.0940, type: "casino", date: "February 7", time: "8:00pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hard+Rock+Casino+Rockford+IL", websiteUrl: "https://hardrockcasinoil.com" },
 { name: "Durty Nellies", city: "Palatine", state: "IL", lat: 42.1103, lng: -88.0340, type: "full", date: "February 14", time: "9:30pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Durty+Nellies+Palatine+IL", websiteUrl: "https://www.durtynellies.com" },
 { name: "Stage 119", city: "Mt. Prospect", state: "IL", lat: 42.0663, lng: -87.9375, type: "full", date: "February 15", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Stage+119+Mt+Prospect+IL", websiteUrl: "" },
 { name: "Jamo's Live", city: "Rosemont", state: "IL", lat: 41.9786, lng: -87.8706, type: "full", date: "February 21", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jamos+Live+Rosemont+IL", websiteUrl: "https://www.jamoslive.com" },
 { name: "Barb's Rescue Gala", city: "Hoffman Est.", state: "IL", lat: 42.0610, lng: -88.1290, type: "fundraiser", date: "February 22", time: "", info: "Fundraiser", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hoffman+Estates+IL", websiteUrl: "" },
 { name: "Evenflow", city: "Geneva", state: "IL", lat: 41.8842, lng: -88.3059, type: "full", date: "February 27", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Evenflow+Geneva+IL", websiteUrl: "https://evenflowbar.com" },
 { name: "Sundance Saloon", city: "Mundelein", state: "IL", lat: 42.2636, lng: -88.0040, type: "full", date: "March 22", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sundance+Saloon+Mundelein+IL", websiteUrl: "" },
 { name: "Bannerman's", city: "Chicago", state: "IL", lat: 41.9466, lng: -87.6756, type: "full", date: "March 8", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bannermans+Chicago+IL", websiteUrl: "" },
 { name: "Broken Oar", city: "Mokena", state: "IL", lat: 41.5267, lng: -87.8829, type: "full", date: "March 7", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Broken+Oar+Mokena+IL", websiteUrl: "" },
 { name: "Tailgaters", city: "Bolingbrook", state: "IL", lat: 41.6986, lng: -88.0684, type: "full", date: "March 27", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tailgaters+Bolingbrook+IL", websiteUrl: "" },
 { name: "Old Republic", city: "Elgin", state: "IL", lat: 42.0359, lng: -88.2830, type: "unplugged", date: "March 28", time: "", info: "Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+Republic+Elgin+IL", websiteUrl: "" },
 { name: "Rookie's Rockhouse", city: "Bartlett", state: "IL", lat: 41.9950, lng: -88.1856, type: "full", date: "March 29", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rookies+Rockhouse+Bartlett+IL", websiteUrl: "" },
 { name: "Corrigan's Pub", city: "Island Lake", state: "IL", lat: 42.2753, lng: -88.1920, type: "full", date: "April 5", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Corrigans+Pub+Island+Lake+IL", websiteUrl: "" },
 { name: "Midway Sports", city: "Shorewood", state: "IL", lat: 41.5230, lng: -88.2020, type: "full", date: "April 5", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Midway+Sports+Shorewood+IL", websiteUrl: "" },
 { name: "Joe's Live", city: "Rosemont", state: "IL", lat: 41.9795, lng: -87.8695, type: "full", date: "April 11", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Joes+Live+Rosemont+IL", websiteUrl: "https://joeslive.com" },
 { name: "Rochaus", city: "W. Dundee", state: "IL", lat: 42.0989, lng: -88.2768, type: "full", date: "April 26", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rochaus+West+Dundee+IL", websiteUrl: "https://rochaus.com" },
 { name: "Station 34", city: "Mt. Prospect", state: "IL", lat: 42.0645, lng: -87.9375, type: "full", date: "May 1", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Station+34+Mt+Prospect+IL", websiteUrl: "https://stationthirtyfour.com/events/" },
 { name: "Deer Park Fest", city: "Deer Park", state: "IL", lat: 42.1600, lng: -88.0810, type: "outdoor", date: "May 2", time: "", info: "Outdoor Festival", mapUrl: "https://www.google.com/maps/search/?api=1&query=Deer+Park+IL", websiteUrl: "" },
 { name: "Sideouts", city: "Island Lake", state: "IL", lat: 42.2780, lng: -88.1930, type: "full", date: "May 9", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sideouts+Island+Lake+IL", websiteUrl: "" },
 { name: "Durty Nellies", city: "Palatine", state: "IL", lat: 42.1108, lng: -88.0345, type: "full", date: "May 16", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Durty+Nellies+Palatine+IL", websiteUrl: "https://www.durtynellies.com" },
 { name: "Will County BBF", city: "Joliet", state: "IL", lat: 41.5281, lng: -88.0834, type: "outdoor", date: "May 23", time: "", info: "Beer & Bourbon Fest", mapUrl: "https://www.google.com/maps/search/?api=1&query=Joliet+IL", websiteUrl: "" },
];

    const currentYear = new Date('2026-04-19T15:00:00Z').getFullYear();
    const nowTime = new Date('2026-04-19T15:00:00Z').getTime() - (1000 * 60 * 60 * 24); // Give 24 hr grace period for 'today'
    let nextIndex = 0;
    let minDiff = Infinity;

    venues.forEach((v, i) => {
     const showDate = new Date(`${v.date}, ${currentYear}`).getTime();
     if (!isNaN(showDate) && showDate >= nowTime && (showDate - nowTime) < minDiff) {
      minDiff = showDate - nowTime;
      nextIndex = i;
     }
    });
console.log("NEXT SHOW IS: " + nextIndex + " - " + venues[nextIndex].name + " " + venues[nextIndex].date);
