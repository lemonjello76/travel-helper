// ============================================================
// AIRPORT PLAYBOOK LIBRARY
// One entry per airport code. Add a new airport = add an entry.
// Verified against airport websites — re-check before first use.
// LAS + TPA verified 2026-07-13.
// ============================================================
window.AIRPORTS = {

  LAS: {
    code: "LAS",
    name: "Harry Reid International",
    city: "Las Vegas",
    lat: 36.0840, lon: -115.1537,
    tz: "America/Los_Angeles",
    waitTimesUrl: "https://www.harryreidairport.com/security-at-las",
    mapUrl: "https://www.harryreidairport.com/maps",
    departure: {
      parking: {
        WN: "Park in the Terminal 1 garage — short term or long term, both connect to the terminal. Follow signs for Terminal 1 Parking.",
        default: "Check your airline's terminal first: Terminal 1 (Southwest, Spirit, Delta, American, United) or Terminal 3 (international + Frontier, Alaska, JetBlue, Hawaiian). Park at that terminal's garage."
      },
      checkin: {
        WN: "Southwest check-in is Terminal 1, Level 2 (ticketing level). Counters and kiosks are on the esplanade.",
        default: "Check-in is on Terminal 1 Level 2 (ticketing level) for most domestic airlines."
      },
      security: {
        precheck: "PreCheck is at the A/B checkpoint (3:30am–1am) and the C/D checkpoint (3:30am–1am). For Southwest C gates, the C/D checkpoint is closest. All T1 gates connect airside, so use whichever line is shorter.",
        standard: "Terminal 1 has three checkpoints: A/B, C Annex (3:05am–9:30pm), and C/D. All T1 gates connect airside — pick the shortest line."
      },
      gates: {
        WN: "Southwest departs from the B and C gates (mostly C). Check the app or monitors for your gate.",
        default: "Check monitors for your gate. A, B and C gates connect via walkways; D gates via tram."
      },
      rentalReturn: "Follow signs to the Rent-A-Car Center on Gilespie Street. Drop the car, then ride the free shuttle to Terminal 1 — about 10 minutes, so pad your timeline."
    },
    arrival: {
      toBaggage: "From your gate, follow Baggage Claim signs down to Terminal 1 Level 1. From D gates, take the tram back to the main building first.",
      baggage: "Baggage claim is on Terminal 1 Level 1. Check monitors for your carousel.",
      toRental: "All rental cars are OFF-site at the Rent-A-Car Center. From baggage claim Level 1, exit to the center median and catch the free blue-and-white rental car shuttle — runs continuously, about a 10 minute ride.",
      toParking: "Your truck is in the Terminal 1 garage — take the elevators up from baggage claim Level 1."
    }
  },

  TPA: {
    code: "TPA",
    name: "Tampa International",
    city: "Tampa",
    lat: 27.9755, lon: -82.5332,
    tz: "America/New_York",
    waitTimesUrl: "https://www.tampaairport.com/",
    mapUrl: "https://www.tampaairport.com/airport-maps",
    departure: {
      parking: {
        default: "Short Term Garage sits on top of the Main Terminal — elevators drop you right at ticketing (Level 2). Economy Garage is cheaper: ride the free SkyConnect train to the Main Terminal."
      },
      checkin: {
        WN: "Southwest check-in is in the Main Terminal, Level 2 (Blue side). After security you'll ride the shuttle to Airside A.",
        default: "Check-in is Main Terminal Level 2. Red side (north) and Blue side (south) — check the signs for your airline."
      },
      security: {
        precheck: "Security is at each airside, not the main terminal. Go up to Level 3 (transfer level), ride the shuttle to your airside — PreCheck lanes are at the airside checkpoint.",
        standard: "From ticketing, go up to Level 3 and take the shuttle to your airside. Security screening happens at the airside."
      },
      gates: {
        WN: "Southwest flies from Airside A. Shuttle from Main Terminal Level 3 — gates are right past the airside checkpoint.",
        default: "Each airline has an assigned airside (A, C, E, F). Shuttles leave from Main Terminal Level 3."
      },
      rentalReturn: "Follow signs to the Rental Car Center on Airport Service Road. Drop the car, then ride the free SkyConnect train to the Main Terminal — about 5 minutes, trains every 2."
    },
    arrival: {
      toBaggage: "Off the plane, follow the crowd to the airside shuttle — it takes you to the Main Terminal Level 3 (transfer level). Then take the elevator or escalator down to Level 1.",
      baggage: "Baggage claim is Main Terminal Level 1 — Red side (north) and Blue side (south). Southwest bags usually come out on the Blue side; check the monitors for your carousel.",
      toRental: "From baggage claim, follow the SkyConnect / Rental Cars signs — escalators and elevators take you up to the SkyConnect station. Free train, every 2 minutes, about a 5 minute ride to the Rental Car Center. All rental counters are in that one building.",
      toParking: "Take the elevator or escalator from baggage claim up to the parking garage — Short Term sits right on top of the Main Terminal."
    }
  }

};

// ============================================================
// AIRLINE REGISTRY — code: {name, appUrl}
// appUrl opens the airline's mobile site / app via app links.
// ============================================================
window.AIRLINES = {
  WN: { name: "Southwest",  appUrl: "https://mobile.southwest.com" },
  AA: { name: "American",   appUrl: "https://www.aa.com" },
  DL: { name: "Delta",      appUrl: "https://www.delta.com" },
  UA: { name: "United",     appUrl: "https://www.united.com" },
  AS: { name: "Alaska",     appUrl: "https://www.alaskaair.com" },
  B6: { name: "JetBlue",    appUrl: "https://www.jetblue.com" },
  NK: { name: "Spirit",     appUrl: "https://www.spirit.com" },
  F9: { name: "Frontier",   appUrl: "https://www.flyfrontier.com" }
};

// ============================================================
// RENTAL CAR REGISTRY
// ============================================================
window.RENTALS = {
  enterprise: { name: "Enterprise", url: "https://www.enterprise.com" },
  hertz:      { name: "Hertz",      url: "https://www.hertz.com" },
  avis:       { name: "Avis",       url: "https://www.avis.com" },
  budget:     { name: "Budget",     url: "https://www.budget.com" },
  national:   { name: "National",   url: "https://www.nationalcar.com" },
  alamo:      { name: "Alamo",      url: "https://www.alamo.com" },
  dollar:     { name: "Dollar",     url: "https://www.dollar.com" },
  thrifty:    { name: "Thrifty",    url: "https://www.thrifty.com" },
  sixt:       { name: "Sixt",       url: "https://www.sixt.com" }
};
