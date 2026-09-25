'use strict';
/* =====================================================================
   SCHOOL BUS RACE — CHARACTER SETTINGS
   Every balance number for the nine drivers lives in this one file.

   · Speed changes are fractions of the bus's normal top speed: 0.10 = +10 %.
   · Times are in seconds, distances in metres, ability costs in students.
   · Ranges written in "bus lengths" use RULES.busLength metres per bus.
   · Ali pays with his sweet meter (0–100 %) instead of students.

   The texts on the driver screen are built from these numbers, so they
   stay correct when you change a value. Students are picked up at the
   yellow bus stops (5 per stop, 6 stops per lap); that rate is part of
   the track, not of the characters, and is not changed here.
   ===================================================================== */
const RULES = {
  maxBonus: 0.25,   // all speed bonuses from abilities and passives together are capped at +25 %
  maxSlow: 0.35,    // all slowdowns from abilities and passives together are capped at −35 %
  stunGuard: 2,     // after a stun from a rival ends, new rival stuns are ignored for this long (self-stuns are exempt)
  busLength: 7,     // one "bus length" in metres
  contactGap: 0.3,  // touches closer together than this count as one continuous contact, not a new crash
};

const pct = (x) => (Math.round(Math.abs(x) * 1000) / 10) + '%';
const sec = (t) => t + ' s';

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
      desc: (a) => `Kick a football forward. It flies about ${a.range} bus lengths and stuns the first rival it hits for ${sec(a.stun)}. One ball at a time; a miss is not refunded.`,
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
      key: 'dirt', name: 'Dirt road',
      desc: () => 'No slowdown when you drive off the road onto the dirt at the edge of the track.',
    },
    ability: {
      key: 'rain', name: 'Rain', cost: 20, time: 6, gripLoss: 0.20, rainbowBonus: 0.12, rainbowTime: 3,
      desc: (a) => `Rain falls for ${sec(a.time)}: every bus except Sarp's loses ${pct(a.gripLoss)} grip and starts drifting, but can still steer. When it stops, a rainbow appears and you get +${pct(a.rainbowBonus)} speed for ${sec(a.rainbowTime)}.`,
    },
  },
  {
    id: 'doruk', name: 'Doruk Can Topay', nick: 'FizikCan', color: '#3b82ff',
    passive1: {
      key: 'quiz', name: 'Math question', every: 25, gateDelay: 4, botCorrect: 0.65,
      desc: (p) => `About every ${sec(p.every)} you get a short math question with two answers. ${sec(p.gateDelay)} later two answer gates appear on the road ahead: drive through the left or the right one. The right answer is on a random side, and the gates never stop other drivers.`,
    },
    passive2: {
      key: 'gates', name: 'Gate result', bonus: 0.07, bonusTime: 2, slow: 0.08, slowTime: 2, unlockWrong: 2,
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
      desc: (a, c) => `Only after ${c.passive2.unlockWrong} wrong answers in a row. Spends ALL your students and your bus glows red for ${sec(a.time)}. Every rival you hit is slowed, depending on how many students you spent: ` +
        a.tiers.map((t, i) => (a.tiers[i + 1] ? `${t.min}–${a.tiers[i + 1].min - 1}` : `${t.min}+`) + `: ${pct(t.slow)} for ${sec(t.time)}`).join(' · ') + '.',
    },
  },
  {
    id: 'sarp', name: 'Sarp Bayar', nick: 'SarpDBastırma', color: '#b0784a',
    passive1: {
      key: 'brainrot', name: 'Brainrot windows', every: 17, show: 0.8, minusPerUse: 3, minEvery: 8,
      desc: (p) => `Small silly pop-up windows flash at the edge of your screen every ${sec(p.every)} for up to ${sec(p.show)}. They never cover the road. Every use of your ability makes them ${sec(p.minusPerUse)} more frequent (at most every ${sec(p.minEvery)}).`,
    },
    passive2: {
      key: 'aura', name: 'Happy aura', baseSpeed: -0.02,
      desc: (p) => `Nothing from the other drivers' powers touches you, good or bad: no reversed controls, stuns, coffee, burn, cinnamon rolls, Ali's forced stop or rain. Normal crashes and the track surface still count. To balance this, your top speed is ${pct(p.baseSpeed)} lower.`,
    },
    ability: {
      key: 'speedUp', name: 'Permanent speed', cost: 10, bonus: 0.02, maxUses: 3,
      desc: (a, c) => `+${pct(a.bonus)} top speed until the finish, every time you use it. Up to ${a.maxUses} times (+${pct(a.bonus * a.maxUses)}), so you end up ${pct(a.bonus * a.maxUses + c.passive2.baseSpeed)} faster than normal.`,
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
      key: 'song', name: 'Song', cost: 30, time: 8, perSecond: 0.025, finalBonus: 0.20, failStun: 2, speedDrop: 0.10, dropWindow: 0.3,
      desc: (a) => `Sing for up to ${sec(a.time)}: +${pct(a.perSecond)} speed for every second you finish, and +${pct(a.finalBonus)} in the last second. Brake, crash, or lose ${pct(a.speedDrop)} of your speed within ${sec(a.dropWindow)} and the song stops: you are stunned for ${sec(a.failStun)}. Normal cornering is fine.`,
    },
  },
  {
    id: 'ali', name: 'Ali', nick: 'TatlıKrizi', color: '#a66cff',
    passive1: {
      key: 'eat', name: 'Student snacks', perStudent: 2,
      desc: (p) => `You eat the students you pick up (in a funny, cartoon way). They fill your sweet meter instead of a student count: +${p.perStudent}% per student.`,
    },
    passive2: {
      key: 'desserts', name: 'Desserts', every: 18, perDessert: 8,
      desc: (p) => `About every ${sec(p.every)} a donut only you can grab appears on the road ahead (one at a time): +${p.perDessert}% sweet meter. The meter tops out at 100%.`,
    },
    ability: {
      key: 'sweetCrisis', name: 'Sweet crisis', cost: 'meter', minMeter: 25,
      low: { bonus: 0.10, time: 4 },
      mid: { from: 50, checkTime: 1.2, slow: 0.15, slowTime: 2, botPass: 0.5 },
      full: { from: 100, seekTime: 8, biteTime: 1.5, bonus: 0.18, bonusTime: 4, stopPenalty: 2 },
      desc: (a) => `Needs at least ${a.minMeter}% and empties the whole meter. ` +
        `${a.minMeter}–${a.mid.from - 1}%: +${pct(a.low.bonus)} speed for ${sec(a.low.time)}. ` +
        `${a.mid.from}–${a.full.from - 1}%: every other driver gets a ${sec(a.mid.checkTime)} reaction check; whoever fails is ${pct(a.mid.slow)} slower for ${sec(a.mid.slowTime)}. ` +
        `${a.full.from}%: for ${sec(a.full.seekTime)} you hunt: the first rival you crash into is bitten for ${sec(a.full.biteTime)} (neither of you can move), then you get +${pct(a.full.bonus)} for ${sec(a.full.bonusTime)}, and they must stop for ${sec(a.full.stopPenalty)} the next time they cross the start/finish line (while they wait they are a ghost nobody can hit; at the finish the ${sec(a.full.stopPenalty)} are added to their race time). No target in time means no refund.`,
    },
  },
  {
    id: 'ada', name: 'Ada Yeşil', nick: 'RomanceHunter', color: '#ff4f9a',
    passive1: {
      key: 'leadPenalty', name: 'Clear leader', slow: 0.04, onGap: 2.5, offGap: 1.5,
      desc: (p) => `When you lead by more than ${sec(p.onGap)}, your top speed drops ${pct(p.slow)}. It comes back once the gap is under ${sec(p.offGap)} or you lose the lead.`,
    },
    passive2: {
      key: 'trail', name: 'Trail follower', bonus: 0.06, minLengths: 1, maxLengths: 3, lane: 2.5, hold: 0.5,
      desc: (p) => `Follow the driver right ahead of you in the standings, ${p.minLengths}–${p.maxLengths} bus lengths behind and in about the same lane, for ${sec(p.hold)}: +${pct(p.bonus)} speed for as long as you stay there.`,
    },
    ability: {
      key: 'leprechaun', name: 'Power of true love', cost: 20, range: 2, throwTime: 0.5, stun: 1.2,
      desc: (a) => `Ada calls her sweetheart, an Irish leprechaun. He grabs the nearest rival up to ${a.range} bus lengths ahead and throws it into the side wall in ${sec(a.throwTime)}: a normal wall crash plus a ${sec(a.stun)} stun. Only works when a rival is that close ahead with a wall beside it; otherwise no students are spent. Sarp can't be targeted.`,
    },
  },
];
