'use strict';
/* =====================================================================
   SCHOOL BUS RACE — CHARACTER SETTINGS
   Every balance number for the drivers lives in this one file.

   · Speed changes are fractions of the bus's normal top speed: 0.10 = +10 %.
   · Times are in seconds, distances in metres, ability costs in students.
   · Ranges written in "bus lengths" use RULES.busLength metres per bus.
   · Ali plays with his satiety meter (0–100 %) instead of students, and
     Sarp spends his students on liking brainrot posts.
   · A range written [a, b] means "a random time between a and b seconds".

   The texts on the driver screen are built from these numbers, so they
   stay correct when you change a value. Students are picked up at the
   yellow bus stops (5 per stop, 6 stops per lap); that rate is part of
   the track, not of the characters, and is not changed here.
   The driver screen makes room for any number of drivers.
   ===================================================================== */
const RULES = {
  maxBonus: 0.25,   // speed bonuses that wear off (abilities and passives) are capped together at +25 %;
                    // permanent ones (Sarp's likes, Ataberk's gym) and Ela's song come on top of the cap
  maxSlow: 0.35,    // all slowdowns from abilities and passives together are capped at −35 %
  stunGuard: 2,     // after a stun from a rival ends, new rival stuns are ignored for this long (self-stuns are exempt)
  busLength: 7,     // one "bus length" in metres
  contactGap: 0.3,  // touches closer together than this count as one continuous contact, not a new crash
};

/* ---------- DRIFT MODE (switched on or off before every race, the same for players and bots) ----------
   Off: the normal steering. On: steering is weaker in normal driving and stronger while
   drifting (drift button held or the bus sliding), so drifting through corners pays off. */
const DRIFT_MODE = {
  steer: -0.20,   // normal steering turns this much less
  drift: 0.20,    // steering while drifting turns this much more
};

/* ---------- WHEEL BAR (every bus has one; bites from Ali's marked rivals take from it) ---------- */
const WHEEL_BAR = {
  regen: 2.5,       // points it refills per second
  gripLoss: 0.35,   // an empty bar costs this much grip (a half-full bar half as much)
};

/* ---------- TYRES AND PIT STOPS (switched on or off before every race) ----------
   Five compounds like in Formula 1: three slicks for a dry track and two for the
   rain. life: laps a new set lasts before it is worn out (the same on every
   circuit). pace: top speed on a fresh set. grip: cornering grip on a fresh set.
   wet: the track wetness a rain tyre is made for (0 dry, 1 soaked).
   In the pit lane the game drives and the crew changes the tyres. */
const TYRES = {
  S: { name: 'Soft', color: '#ff3b30', life: 2.5, pace: 0.025, grip: 0.07 },
  M: { name: 'Medium', color: '#ffd12a', life: 4.5, pace: 0, grip: 0 },
  H: { name: 'Hard', color: '#f4f4f4', life: 7.5, pace: -0.03, grip: -0.05 },
  I: { name: 'Intermediate', color: '#2fbf5a', life: 3.5, pace: -0.02, grip: 0, wet: 0.45 },
  W: { name: 'Wet', color: '#2f7bff', life: 4.5, pace: -0.04, grip: 0.02, wet: 0.9 },
  fade: 0.02,        // a set gets up to this much slower as it wears
  cliff: 20,         // below this % left, a set falls off the cliff...
  cliffPace: -0.12,  // ...and at 0 % it is this much slower
  cliffGrip: -0.3,   // ...with this much less grip
  slideWear: 1.2,    // drifting and sliding wear the tyres this much faster
  pitTime: 2.6,      // seconds in the box while the crew changes all four tyres
  pitSpeed: 22,      // pit lane speed limit in m/s (80 km/h)
  maxStops: 3,
};

/* ---------- WEATHER (dry, rain or changing, picked before every race) ----------
   Track wetness goes from 0 (dry) to 1 (soaked). While it rains the track gets
   wet, when the rain stops it dries slowly. */
const WEATHER = {
  damp: 0.3,         // from this wetness the track counts as damp (intermediates)...
  soaked: 0.72,      // ...and from this as wet (full wet tyres)
  gripLoss: 0.25,    // a soaked track has this much less grip for everybody
  speedLoss: 0.04,   // and everybody drives a little slower (spray, puddles)
  slickGrip: -0.7,   // slick tyres on a soaked track: grip change (less when damp)
  slickPace: -0.1,   // ...and speed change
  tooDry: -0.08,     // rain tyres on a drier track than they are made for: speed change per unit of wetness
  tooWet: -0.35,     // intermediates on a wetter track than they are made for: grip change
  overheat: 4,       // rain tyres wear up to this much faster on a dry track
  wetting: 0.08,     // how fast the track gets wet in the rain...
  drying: 0.015,     // ...and dries when it stops (share per second)
};

const pct = (x) => (Math.round(Math.abs(x) * 1000) / 10) + '%';
const sec = (t) => t + ' s';
const span = (r) => r[0] + '–' + r[1] + ' s';

const CHARACTERS = [
  {
    id: 'volkan', name: 'Volkan Aytekin', nick: 'Marjinal Maganda', color: '#ff7a1a',
    warning: 'Hard mode: left/right AND gas/brake are reversed for the whole race.',
    passive1: {
      key: 'reversed', name: 'Marginal driving',
      desc: () => 'Your controls are reversed all race: left steers right, right steers left, gas brakes and brake accelerates. The camera does not flip.',
    },
    passive2: {
      key: 'crashBonus', name: 'Crash bonus', bonus: 0.10, time: 1.5, minOtherSpeed: 3,
      desc: (p) => `Hit another moving bus and, instead of losing speed, you get +${pct(p.bonus)} speed for ${sec(p.time)}. Walls and stopped buses don't count, one long scrape is one crash, and a new crash refreshes the bonus instead of stacking it.`,
    },
    ability: {
      key: 'field', name: 'Marginal field', cost: 15, radius: 2, time: 4, botDelay: 0.8,
      desc: (a) => `A moving field with a radius of about ${a.radius} bus lengths surrounds you for ${sec(a.time)}. Every other driver inside it gets reversed controls until they leave (bots need ${sec(a.botDelay)} to adapt). Your own controls stay as they are.`,
    },
  },
  {
    id: 'egemen', name: 'Egemen Delikan', nick: 'Gluten', color: '#e0a13c',
    passive1: {
      key: 'food', name: 'Gluten food', every: 14, glutenChance: 0.40, slow: 0.12, time: 3, maxItems: 2,
      desc: (p) => `About every ${sec(p.every)} a snack only you can grab appears on the road ahead. ${pct(p.glutenChance)} of them contain gluten (bread): grab one and you are ${pct(p.slow)} slower for ${sec(p.time)}.`,
    },
    passive2: {
      key: 'foodFree', name: 'Gluten-free food', bonus: 0.10, time: 3,
      desc: (p, c) => `The other ${pct(1 - c.passive1.glutenChance)} are gluten-free (green apples): +${pct(p.bonus)} speed for ${sec(p.time)}. At most ${c.passive1.maxItems} snacks are out at once and they never affect other drivers.`,
    },
    ability: {
      key: 'shot', name: 'Shot', cost: 5, range: 2, stun: 0.8, ballSpeed: 30,
      desc: (a) => `Kick a football straight ahead, in the direction your bus points when you kick. It flies dead straight for about ${a.range} bus lengths (it never curves, not even when you steer) and stuns the first rival it hits for ${sec(a.stun)}. One ball at a time; a miss is not refunded.`,
    },
  },
  {
    id: 'irem', name: 'İrem Gökce', nick: 'YulafSütlüIceLatte', color: '#c8a27a',
    passive1: {
      key: 'lowCam', name: 'Low camera', back: 2.4, height: 0.55,
      desc: () => 'Your chase camera sits lower than everyone else\'s, right behind the back of the bus. You still see the road over the roof.',
    },
    passive2: {
      key: 'catchUp', name: 'Catch-up speed', perDriver: 0.01, max: 0.07,
      desc: (p) => `+${pct(p.perDriver)} top speed for every driver ahead of you in the standings (up to +${pct(p.max)}). It updates as positions change.`,
    },
    ability: {
      key: 'transform', name: 'Random transformation', cost: 5, time: 3,
      cat: { chance: 0.30, bonus: 0.12, hitbox: 0.8 },
      thermos: { chance: 0.30, stun: 0.8 },
      coffee: { chance: 0.30, dropEvery: 0.75, slow: 0.12, slowTime: 1.5, dropLife: 8 },
      plant: { chance: 0.10, selfStun: 1 },
      desc: (a) => `One random transformation for ${sec(a.time)}: ` +
        `${pct(a.cat.chance)} Dex the cat (+${pct(a.cat.bonus)} speed, ${pct(1 - a.cat.hitbox)} smaller hitbox) · ` +
        `${pct(a.thermos.chance)} giant thermos (every rival you touch is stunned for ${sec(a.thermos.stun)}) · ` +
        `${pct(a.coffee.chance)} coffee cup (drops coffee every ${sec(a.coffee.dropEvery)}; rivals driving through are ${pct(a.coffee.slow)} slower for ${sec(a.coffee.slowTime)}) · ` +
        `${pct(a.plant.chance)} plant (it ends at once and you are stunned for ${sec(a.plant.selfStun)}).`,
    },
  },
  {
    id: 'ataberk', name: 'Ataberk Tosun', nick: 'TosunKovalayan', color: '#2fbf5a',
    passive1: {
      key: 'gym', name: 'Gym', selfStun: 2, bonus: 0.02, maxVisits: 3,
      desc: (p) => `Gym spots appear beside the racing line (you never have to use them). Drive into one: you are stuck lifting for ${sec(p.selfStun)}, then keep +${pct(p.bonus)} top speed until the finish. Works ${p.maxVisits} times (+${pct(p.bonus * p.maxVisits)} in total), once per spot per lap.`,
    },
    passive2: {
      key: 'cookies', name: 'CookieRun Kale', every: 12, maxOut: 2, run: 3, slow: 0.30, time: 1,
      desc: (p) => `Cookie men wait on the road ahead of you (a new group about every ${sec(p.every)}, at most ${p.maxOut} groups at once). Touch them and they sprint ${p.run} bus lengths ahead of you: every rival they run into is ${pct(p.slow)} slower for ${sec(p.time)}.`,
    },
    ability: {
      key: 'rain', name: 'Rain', cost: 20, time: 6, gripLoss: 0.35, rainbowBonus: 0.12, rainbowTime: 3,
      desc: (a) => `Rain falls for ${sec(a.time)}: every bus except Sarp's loses ${pct(a.gripLoss)} grip and starts drifting, but can still steer. When it stops, a rainbow appears and you get +${pct(a.rainbowBonus)} speed for ${sec(a.rainbowTime)}.`,
    },
  },
  {
    id: 'shangai', name: 'ShangaiMath', nick: 'ShangaiMath', color: '#3b82ff',
    passive1: {
      key: 'quiz', name: 'Math question', every: 25, gateDelay: 4, botCorrect: 0.65,
      desc: (p) => `About every ${sec(p.every)} you get a short math question with two answers. ${sec(p.gateDelay)} later two answer gates appear on the road ahead: drive through the left or the right one. The right answer is on a random side, and the gates never stop other drivers.`,
    },
    passive2: {
      key: 'gates', name: 'Gate result', bonus: 0.07, bonusTime: 2, slow: 0.15, slowTime: 2, unlockWrong: 2,
      desc: (p) => `Right gate: +${pct(p.bonus)} speed for ${sec(p.bonusTime)}. Wrong gate: ${pct(p.slow)} slower for ${sec(p.slowTime)}. ${p.unlockWrong} wrong gates in a row unlock your ability; a right gate resets the count.`,
    },
    ability: {
      key: 'rage', name: 'Rage', cost: 'all', time: 6,
      tiers: [
        { min: 0, time: 1, slow: 0.05 },
        { min: 10, time: 2, slow: 0.12 },
        { min: 20, time: 2.5, slow: 0.20 },
        { min: 40, time: 3, slow: 0.35 },
      ],
      desc: (a, c) => `Only after ${c.passive2.unlockWrong} wrong answers in a row. Spends ALL your students and your bus burns red with cartoon flames for ${sec(a.time)}. Every rival you hit catches fire (it looks hot but does no damage) and is slowed, depending on how many students you spent: ` +
        a.tiers.map((t, i) => (a.tiers[i + 1] ? `${t.min}–${a.tiers[i + 1].min - 1}` : `${t.min}+`) + `: ${pct(t.slow)} for ${sec(t.time)}`).join(' · ') + '.',
    },
  },
  {
    id: 'sarp', name: 'Sarp Bayar', nick: 'SarpDBastırma', color: '#b0784a', noBot: true,
    warning: 'Players only: Sarp is never driven by a bot. Brainrot posts pop up all over your screen.',
    passive1: {
      key: 'posts', name: 'Brainrot posts', every: [10, 14], show: 10, max: 1,
      desc: (p, c) => `Brainrot posts pop up anywhere on your screen (even over the road) every ${span(p.every)} and stay for ${sec(p.show)}, ${p.max === 1 ? 'one' : 'at most ' + p.max} at a time. Close one with × for free, or let it run out. The speedometer and the driving controls always stay free.`,
    },
    passive2: {
      key: 'chill', name: 'Chill mood', vfxEvery: [15, 22], jumpscare: 0.4, drunk: 1.5, glitch: 0.6, jumpscareShare: 1 / 3, drunkShare: 1 / 3,
      desc: (p) => `Nothing the other drivers' powers do touches you, good or bad: speed changes, reversed controls, stuns, marks, Wheel Bar bites, Ataberk's rain, ice or darkness. Crashes and the track surface still count. Only your own screen plays tricks on you: every ${span(p.vfxEvery)} a ${sec(p.jumpscare)} jumpscare, ${sec(p.drunk)} of wobbly camera or a ${sec(p.glitch)} glitch.`,
    },
    ability: {
      key: 'like', name: 'Permanent speed', cost: 5, bonus: 0.02,
      // speed thresholds, from the permanent speed the likes have added (each one keeps the ones before it)
      t1: 0.04, t1Every: [6, 11], t1Max: 2, t1Show: 10,                                   // 1: Brainrot overload
      t2: 0.08, tiltMin: 15, tiltMax: 40, tiltPerLike: 2.5, shift: 1.2,                   // 2: tilted camera (degrees, metres)
      t3: 0.12, t3Every: [2, 4], fakeEvery: [6, 10], hideEvery: [8, 12], hideTime: 0.6, hideShare: 0.25,   // 3: paranormal reality
      desc: (a) => `Like an open brainrot post for ${a.cost} students (tap ♥ on it, or press Shift) and keep +${pct(a.bonus)} top speed until the finish. There is no limit: 1/2/3 likes give +${pct(a.bonus)}/+${pct(a.bonus * 2)}/+${pct(a.bonus * 3)}, and so on. But your screen gets busier: at +${pct(a.t1)} posts come every ${span(a.t1Every)}, ${a.t1Max} at a time; at +${pct(a.t2)} your camera tilts ${a.tiltMin}–${a.tiltMax}°; at +${pct(a.t3)} fake things appear beside the road, real rivals vanish from your view for up to ${sec(a.hideTime)}, and a post pops up every ${span(a.t3Every)}.`,
    },
  },
  {
    id: 'ela', name: 'Ela Üstündağ', nick: 'CinnamonRoll', color: '#e8618c',
    passive1: {
      key: 'cinnamon', name: 'Cinnamon roll', bonus: 0.06, time: 3,
      desc: (p) => `Every rival you crash into gets a cinnamon roll: +${pct(p.bonus)} speed for ${sec(p.time)}. A long scrape is one crash, and a new crash refreshes it instead of stacking.`,
    },
    passive2: {
      key: 'driftReward', name: 'Drift reward', minDrift: 1, perSecond: 0.02, max: 0.06, time: 2,
      desc: (p) => `Finish a clean drift of at least ${sec(p.minDrift)} and get +${pct(p.perSecond)} speed for every full second of it (up to +${pct(p.max)}) for ${sec(p.time)}. A new drift refreshes the bonus, it never stacks.`,
    },
    ability: {
      key: 'song', name: 'Song', cost: 30, time: 8, perSecond: 0.025, failStun: 2, speedDrop: 0.10, dropWindow: 0.3,
      desc: (a) => `Sing for up to ${sec(a.time)}: +${pct(a.perSecond)} speed for every second you finish, growing until the song ends (up to +${pct(a.perSecond * a.time)}, and it may go past the usual +${pct(RULES.maxBonus)} cap). Brake, crash, or lose ${pct(a.speedDrop)} of your speed within ${sec(a.dropWindow)} and the song stops: you are stunned for ${sec(a.failStun)}. Normal cornering is fine.`,
    },
  },
  {
    id: 'ali', name: 'Ali', nick: 'TatlıKrizi', color: '#a66cff',
    passive1: {
      key: 'barriers', name: 'Sweet barriers', every: [16, 20], max: 2, life: 14, eat: 28, eatBelow: 80, rivalStun: 0.7, selfStun: 0.6, snag: 0.45,
      desc: (p) => `While you race, sweet barriers appear on fixed spots of the circuit every ${span(p.every)} (at most ${p.max}, each gone after ${sec(p.life)}); there is always room to drive around them. A rival who hits one gets stuck for a moment and stunned for ${sec(p.rivalStun)}. You eat your own barriers for +${p.eat}% satiety, but only below ${p.eatBelow}%: from ${p.eatBelow}% you are too full, get stuck and are stunned for ${sec(p.selfStun)}.`,
    },
    passive2: {
      key: 'satiety', name: 'Satiety meter', start: 50, decay: 1.5, stop: 20, hungry: 40, full: 80, hungrySlow: 0.06, goodBonus: 0.05, fullSlow: 0.12, fullPush: 0.25,
      desc: (p) => `You don't collect students: every student stays there for the others. You play with a 0–100% satiety meter that starts at ${p.start}% and drops ${p.decay}% a second. Every bus stop gives +${p.stop}% (each stop once a lap). Under ${p.hungry}%: hungry, ${pct(p.hungrySlow)} slower. ${p.hungry}–${p.full - 1}%: just right, +${pct(p.goodBonus)} speed. ${p.full}% and more: stuffed, ${pct(p.fullSlow)} slower, but you shove buses you crash into ${pct(p.fullPush)} harder. At 100% the meter stays full until you use Sweet vomit.`,
    },
    ability: {
      key: 'vomit', name: 'Sweet vomit', cost: 'meter', time: 1.5, angle: 60, range: 2, mark: 10, regain: 5, regainMax: 20, bite: 30, biteGap: 2, bitesPerTarget: 2,
      desc: (a) => `Only with a full 100% meter, and it empties it. For ${sec(a.time)} you spray sprinkles and candy ${a.range} bus lengths ahead of you in a ${a.angle}° cone (funny, never gross). Every rival it reaches gets a sweet mark for ${sec(a.mark)} and gives you back +${a.regain}% (up to +${a.regainMax}% per use). A marked rival who touches another driver bites them: −${a.bite} points on their Wheel Bar (you can be bitten too). The same pair can bite once every ${sec(a.biteGap)}, and at most ${a.bitesPerTarget} times per target per use. Sarp can't be marked.`,
    },
  },
  {
    id: 'ada', name: 'Ada Yeşil', nick: 'RomanceHunter', color: '#ff4f9a',
    passive1: {
      key: 'leadPenalty', name: 'Clear leader', slow: 0.04, onGap: 2.5, offGap: 1.5,
      desc: (p) => `When you lead by more than ${sec(p.onGap)}, your top speed drops ${pct(p.slow)}. It comes back once the gap is under ${sec(p.offGap)} or you lose the lead.`,
    },
    passive2: {
      key: 'trail', name: 'Trail follower', bonus: 0.06, minLengths: 1, maxLengths: 3, lane: 2.5, hold: 0.5, trailLife: 2,
      desc: (p) => `A pink trail only you can see shows the path of the driver right ahead of you in the standings (it fades after about ${sec(p.trailLife)}). Follow it ${p.minLengths}–${p.maxLengths} bus lengths behind them, in about the same lane, for ${sec(p.hold)}: +${pct(p.bonus)} speed for as long as you stay there.`,
    },
    ability: {
      key: 'leprechaun', name: 'Power of true love', cost: 20, range: 2, throwTime: 0.5, stun: 1.2,
      desc: (a) => `Ada calls her sweetheart Lapricote, an Irish leprechaun. He grabs the nearest rival up to ${a.range} bus lengths ahead and throws it into the side wall in ${sec(a.throwTime)}: a normal wall crash plus a ${sec(a.stun)} stun. Only works when a rival is that close ahead with a wall beside it; otherwise no students are spent. Sarp can't be targeted.`,
    },
  },
  {
    id: 'saner', name: 'Saner', nick: 'Saner', color: '#e10600',
    passive1: {
      key: 'wallPower', name: 'Power from walls', bonus: 0.12, time: 1.5, minHit: 1.2,
      desc: (p) => `Crashing into a wall doesn't cost you speed: you get +${pct(p.bonus)} speed for ${sec(p.time)} instead (a new crash refreshes it, it never stacks). The wall still stops you going through. Scraping along a wall is one crash: let go and hit it again. Dirt and other slow ground beside the road doesn't slow you down.`,
    },
    passive2: {
      key: 'overheat', name: 'Overheating', after: 5, slow: 0.12,
      desc: (p) => `Drive ${sec(p.after)} without hitting a wall, an obstacle or a bus and your engine overheats: ${pct(p.slow)} slower until your next real crash, which cools it down and starts a new ${sec(p.after)} count.`,
    },
    ability: {
      key: 'wild', name: 'Uncontrolled speed', cost: 25, bonus: 0.20, turn: 0.75, window: 1.5, stunBase: 0.4, stunPer: 0.2, stunMax: 1.6,
      desc: (a) => `+${pct(a.bonus)} top speed, but your steering (and your drifting) turns ${pct(a.turn)} less. It lasts as long as you keep crashing: it ends ${sec(a.window)} after you use it or after your last crash into a wall, an obstacle or a bus. Crash into a rival while it runs and you are both stunned for ${a.stunBase} + ${a.stunPer} × (crashes so far) s, up to ${sec(a.stunMax)}. Your wall bonus still works, within the +${pct(RULES.maxBonus)} cap.`,
    },
  },
  {
    id: 'sisters', name: 'Elif & Zeynep', nick: 'Ghostly Sisters', color: '#7fdcff',
    sisters: { zeynep: { name: 'Zeynep', color: '#9fe8ff' }, elif: { name: 'Elif', color: '#b28cff' } },
    passive1: {
      key: 'swap', name: 'Turns by position', zeynepUpTo: 3, hold: 0.5,
      desc: (p) => `One pick, two sisters in the same bus, sharing the students. In places 1–${p.zeynepUpTo} Zeynep drives; from place ${p.zeynepUpTo + 1} on (in any size of race) Elif takes the wheel. They swap once the new place has held for ${sec(p.hold)}; the bus and the camera stay where they are.`,
    },
    passive2: {
      key: 'costs', name: 'Two prices', zeynepWear: 0.30, elifTurn: 0.12,
      desc: (p) => `While Zeynep drives, the tyres wear ${pct(p.zeynepWear)} faster (with tyres & pit stops on). While Elif drives, steering and drifting turn ${pct(p.elifTurn)} less.`,
    },
    ability: {
      key: 'sisterPower', name: 'Ice or darkness', cost: 30,
      ice: { time: 5, gripLoss: 0.60 },
      dark: { time: 5, vision: 0.5, gap: 1 },
      desc: (a) => `Who drives decides what the ${a.cost} students do. Zeynep's ice: every road turns to ice for ${sec(a.ice.time)} and every other bus loses ${pct(a.ice.gripLoss)} grip (not you, and your tyres don't wear while you drive on it). Elif's darkness: you teleport about ${a.dark.gap} bus length in front of the driver right ahead of you in the standings (only onto a safe, free spot on the road; otherwise nothing is spent), then everybody else can see ${pct(1 - a.dark.vision)} less far for ${sec(a.dark.time)}. Sarp is immune to both.`,
    },
  },
  {
    id: 'doruk', name: 'Doruk Can Topay', nick: 'Doruk', color: '#9aa7bd',
    passive1: {
      key: 'greyTrail', name: 'Grey trail', life: 2, width: 1.7, follow: 0.4, slow: 0.12, time: 1.5, rearm: 1,
      desc: (p) => `You leave a grey trail on the road that fades after about ${sec(p.life)} (it never blocks anybody's view). A rival who follows it for ${sec(p.follow)} is ${pct(p.slow)} slower for ${sec(p.time)}; to get caught again they must be off the trail for ${sec(p.rearm)}. Sarp is immune.`,
    },
    passive2: {
      key: 'glasses', name: 'Dropped glasses', blur: 1.2,
      desc: (p) => `Every real crash into a wall, an obstacle or a bus knocks your glasses off: your own screen goes a little blurry for ${sec(p.blur)} (a new crash restarts it, it never gets worse).`,
    },
    ability: {
      key: 'hole', name: 'Artificial black hole', cost: 15, range: 3, speed: 26, time: 3, radius: 1.5, pull: 0.12, core: 0.4, stun: 1,
      desc: (a) => `Throw a black hole core dead straight ahead. It flies up to ${a.range} bus lengths (or until it hits something) and becomes a black hole for ${sec(a.time)}. It gently pulls rivals within ${a.radius} bus lengths toward its centre (never faster than ${pct(a.pull)} of their top speed, never through a wall) and stuns anyone who gets within ${a.core} bus lengths of the centre for ${sec(a.stun)}, once per hole. It never pulls you, and Sarp is immune. One hole at a time.`,
    },
  },
];
