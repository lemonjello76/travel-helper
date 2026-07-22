# Travel Helper

In-ear, real-time travel guide. The next app after Job Tracker / Field Log.

**The idea:** an airport trip is an assembly line — park → check-in → security → gate →
fly → baggage → rental car → road. This app is a phase-based guide that announces the
next move in your earbuds at each step, then hands you off to Waze at the rental car.

## How it works

- **Trip file** (Setup tab): flights, rental, hotel. The app is the engine; the trip is the work order.
- **Airport playbooks** (`airports.js`): one entry per airport — where check-in, PreCheck,
  baggage, and rental cars are. v1 ships with LAS + TPA. New airport = new entry.
- **Phase engine**: NEXT button walks the assembly line; GPS geofences auto-advance
  (arriving at the departure airport, wheels-down at the destination).
- **Voice**: phone text-to-speech through whatever's in your ears. Toggle with 🔊.
- **Hub tab**: one-tap launchers (airline app, rental, hotel, Waze, TSA waits, local news)
  plus NWS weather + severe-weather alerts for both cities. Weather is free, no API key.
- **Waze handoff**: the last phase deep-links Waze with the hotel address pre-loaded.

## Known v1 limits (honest list)

- Geofence auto-advance only fires while the app is open (PWA limitation — background GPS
  needs a native wrapper; v2 candidate). The NEXT button always works.
- No live flight status yet (gate changes / delays) — v1.5 with FlightAware AeroAPI.
- TSA wait times are a link to the airport's page, not a live number in-app yet.
- Playbooks: LAS + TPA + MCO so far. (MCO added 7/22/26 for the Orlando pivot — verify airside/gate details on first use.)

## Stack

Single-file PWA — HTML/CSS/JS, no framework. localStorage. Service worker for offline.
Same pattern as Job Tracker. Host on GitHub Pages (HTTPS needed for GPS + install).
