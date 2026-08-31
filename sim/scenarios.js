// ============================================================
// TRIP SIMULATOR — stress-test harness.
// Fakes the clock and the GPS, replays real + hypothetical trips
// through the ACTUAL app logic, and grades every reaction.
// Run in the browser on the app page:
//   fetch('sim/scenarios.js').then(r=>r.text()).then(eval); SIM.runAll();
// ============================================================
window.SIM = (() => {
  const realNow = Date.now.bind(Date);
  let simNow = realNow();
  const pad = n => String(n).padStart(2, '0');
  const D = ms => { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const T = ms => { const d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const H = 3600000, M = 60000;

  // GPS coordinates for the cast
  const GPS = {
    LAS: [36.0840, -115.1537], CLT: [35.2140, -80.9431], DAY: [39.9024, -84.2194],
    DFW: [32.8998, -97.0403], MCO: [28.4312, -81.3081],
    vegasHotel: [36.10, -115.17], nowhere: [39.0, -95.0]
  };

  // Base trip: the real Dayton run, times rebuilt relative to sim clock
  function daytonTrip(depOffsetMs) {
    const dep1 = simNow + depOffsetMs;
    return {
      from: 'LAS', to: 'DAY', airline: 'AA', flightConf: 'QVXTRB', firstName: 'Walter', lastName: 'Krug',
      flightOut: '1545', flightRet: '5157', precheck: 'yes', bags: 'no', heavyBag: 'no', pace: 'normal',
      seatOut: '16A', seatOut2: '17A', seatRet: '18A', seatRet2: '21F',
      depDateOut: D(dep1), depTimeOut: T(dep1),
      connOut: 'CLT', flightOut2: '5422', depTimeOut2: T(dep1 + 8 * H + 33 * M), // 7:39 elapsed + 54m conn
      depDateRet: D(dep1 + 2 * 86400000), depTimeRet: '06:25',
      connRet: 'DFW', flightRet2: '1584', depTimeRet2: '09:05',
      planBOut: 'Last CLT-DAY flight tonight ~10:35 PM (AA)\nCLT-CVG last ~10:55 PM, then 1 hr drive\nRental car at CLT: 7 hrs up I-77',
      planBRet: 'DFW-DAY later flights every ~2h\nDFW-CVG or CMH alternates',
      deadline: D(dep1 + 86400000) + 'T10:00', deadlineLabel: 'funeral 10 AM',
      rental: 'enterprise', rentalConf: '1498068412',
      hotelName: 'Holiday Inn Express Vandalia', hotelAddr: '7121 York Center Drive, Dayton, OH 45414',
      hotelConf: '40254106', homeAddr: 'KOA Las Vegas'
    };
  }

  // ---- capture rig ----
  let cap;
  const orig = {};
  function arm() {
    cap = { spoke: [], banners: [], notifs: [], views: [] };
    orig.now = Date.now; orig.speak = window.speak; orig.banner = window.banner;
    orig.notifyText = window.notifyText; orig.showView = window.showView;
    Date.now = () => simNow;
    window.speak = m => cap.spoke.push(String(m));
    window.banner = m => cap.banners.push(String(m));
    window.notifyText = (t, b) => cap.notifs.push(t + ' ' + b);
    window.showView = v => { cap.views.push(v); try { orig.showView(v); } catch (e) {} };
  }
  function disarm() {
    Date.now = orig.now; window.speak = orig.speak; window.banner = orig.banner;
    window.notifyText = orig.notifyText; window.showView = orig.showView;
  }

  function setup(tripObj, dir, phaseId) {
    trip = tripObj;
    localStorage.setItem('th_trip', JSON.stringify(trip));
    state = { dir: dir || 'out', phase: 0, voice: true, auto: true };
    planBAnnounced = false; connEnteredAt = 0; lastSpokenPhase = -1;
    geoFired = { depart: false, arrive: false, conn: false };
    pit = { anchor: null, start: 0, prompted: false, wrapWarned: false };
    auto = { anchor: null, dwellStart: 0, dwellDone: false, leaveCount: 0 };
    buildPhases();
    if (phaseId) state.phase = Math.max(0, phases.findIndex(p => p.id === phaseId));
  }
  const fix = (name, acc) => onPos({ coords: { latitude: GPS[name][0], longitude: GPS[name][1], accuracy: acc || 30 } });
  const tick = () => { // what the app's timers would do
    if (phases[state.phase] && ['conn'].includes(phases[state.phase].id)) planBCheck(false);
    reconcileTrip(false);
  };

  // ---- scenarios ----
  const SCENARIOS = [

    { name: 'REAL #1 — Dayton outbound as flown (on-time, 24 min to board at CLT)',
      run() {
        setup(daytonTrip(-8 * H), 'out', 'flight'); // leg1 departed 8h ago-ish; landing now at CLT
        // wheels down CLT with dep2 in ~33 min
        fix('CLT');
        return {
          'auto-advanced to connection': phases[state.phase].id === 'conn',
          'went yellow, not red': cap.banners.some(b => b.includes('straight to the gate')) && !cap.views.includes('planb'),
          'voice told him to move': cap.spoke.some(s => /straight to the gate/i.test(s))
        };
      } },

    { name: 'REAL #2 — the taxi-back (boarded at DAY, 4-hr delay kills the DFW connection BEFORE takeoff)',
      run() {
        const t = daytonTrip(-2 * 86400000 - 4 * H); // outbound long past
        setup(t, 'ret', 'board'); // boarded the return leg 1 at Dayton
        simNow += 45 * M; // sitting on the taxiway; dep+45m, 60-min conn now dead-ish
        planBCheck(true);
        const s = connStatus();
        return {
          'verdict computed at ORIGIN gate': !!s,
          'went RED before takeoff': s && s.lvl === 'red',
          'Plan B screen auto-opened': cap.views.includes('planb'),
          'voice said no-stress + ladder': cap.spoke.some(x => /Plan B is on your screen/i.test(x))
        };
      } },

    { name: 'REAL #3 — CLT tarmac gate-wait (landed on time, sat 25 min, connection erodes to red)',
      run() {
        setup(daytonTrip(-8 * H), 'out', 'flight');
        fix('CLT'); // lands: ~33 min buffer, yellow
        const before = connStatus().lvl;
        simNow += 25 * M; // parked on the taxiway waiting for a gate
        planBAnnounced = false;
        tick(); // the app's minute-check while in conn phase
        const after = connStatus();
        return {
          'started yellow': before === 'yellow',
          'eroded to red during the wait': after.lvl === 'red',
          'Plan B fired from the tarmac': cap.views.includes('planb')
        };
      } },

    { name: 'NEW — departure gone while at connection (storm cancellation night)',
      run() {
        setup(daytonTrip(-9 * H), 'out', 'conn');
        simNow += 90 * M; // leg2 dep long past
        planBAnnounced = false; planBCheck(true);
        const s = connStatus();
        return {
          'verdict says GONE': s && s.mins <= 0,
          'red level': s && s.lvl === 'red',
          'voice: work the ladder': cap.spoke.some(x => /has departed|Work the ladder/i.test(x))
        };
      } },

    { name: 'NEW — early arrival, comfortable connection (false-alarm check)',
      run() {
        const t = daytonTrip(-7 * H);
        t.depTimeOut2 = T(simNow + 95 * M); // 95-min buffer
        setup(t, 'out', 'flight');
        fix('CLT');
        return {
          'advanced to conn': phases[state.phase].id === 'conn',
          'NO red/yellow alarm': !cap.views.includes('planb') && !cap.banners.some(b => b.includes('straight to the gate')),
          'normal conn guidance spoken': cap.spoke.some(s => /stay inside security/i.test(s))
        };
      } },

    { name: 'NEW — row 28 + slow pace turns a "fine" 55-min connection into a warning',
      run() {
        const t = daytonTrip(-8 * H);
        t.depTimeOut2 = T(simNow + 55 * M); t.seatOut = '28F'; t.pace = 'slow';
        setup(t, 'out', 'flight');
        const s = connStatus();
        return {
          'deplane cost ~11 min applied': s && s.dm >= 10,
          'graded worse than ok': s && s.lvl !== 'ok'
        };
      } },

    { name: 'NEW — pit stop at CLT bar, then wrap-up call as boarding closes in',
      run() {
        const t = daytonTrip(-8 * H);
        t.depTimeOut2 = T(simNow + 80 * M);
        setup(t, 'out', 'gate');
        // parked at the bar 11 min
        for (let i = 0; i < 12; i++) { pitDetect(GPS.CLT[0], GPS.CLT[1], 20, simNow); simNow += M; }
        const gotPit = cap.spoke.some(s => /pit stop/i.test(s));
        // boarding = dep-30 = +50 from setup; we're at +12; jump to boarding-14
        simNow += 24 * M;
        pitDetect(GPS.CLT[0], GPS.CLT[1], 20, simNow);
        const gotWrap = cap.spoke.some(s => /wrap it up/i.test(s));
        return { 'pit-stop check-in fired once': gotPit, 'wrap-up call fired': gotWrap };
      } },

    { name: 'NEW — nonstop flight cancelled at origin (no connection: graceful Plan B, no crash)',
      run() {
        const t = daytonTrip(2 * H);
        t.connOut = ''; t.flightOut2 = ''; t.depTimeOut2 = '';
        setup(t, 'out', 'board');
        let crashed = false;
        try { renderPlanB(); planBCheck(true); } catch (e) { crashed = true; }
        const pb = document.getElementById('planbContent').textContent;
        return {
          'no crash without connection': !crashed,
          'Plan B screen still renders playbook': pb.includes('PLAN B') || pb.includes('LADDER') || pb.length > 100,
          'no false red (flight not broken)': !cap.views.includes('planb')
        };
      } },

    { name: 'NEW — return-day auto-flip (Sunday morning reconcile)',
      run() {
        const t = daytonTrip(-2 * 86400000 + 2 * H); // outbound 2 days ago; return dep ~6h from now
        t.depDateRet = D(simNow + 6 * H); t.depTimeRet = T(simNow + 6 * H);
        setup(t, 'out', 'done');
        state.phase = 2; // stale mid-trip state
        reconcileTrip(false);
        return {
          'flipped to return leg': state.dir === 'ret',
          'reset to phase 0 (rental return)': state.phase === 0 && phases[0].id === 'drive'
        };
      } },
  ];

  async function runAll() {
    const results = [];
    const savedTrip = localStorage.getItem('th_trip');
    for (const scn of SCENARIOS) {
      simNow = realNow();
      arm();
      let checks, error = null;
      try { checks = scn.run(); } catch (e) { error = e.message; checks = {}; }
      disarm();
      const fails = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k);
      results.push({
        scenario: scn.name,
        verdict: error ? 'ERROR: ' + error : (fails.length ? 'FAIL' : 'PASS'),
        failed: fails,
        heard: cap.spoke.map(s => s.slice(0, 90))
      });
    }
    if (savedTrip) { localStorage.setItem('th_trip', savedTrip); trip = JSON.parse(savedTrip); }
    state = { dir: 'out', phase: 0, voice: false, auto: true }; buildPhases();
    console.table(results.map(r => ({ scenario: r.scenario.slice(0, 60), verdict: r.verdict })));
    return results;
  }

  return { runAll, SCENARIOS, GPS, daytonTrip };
})();
