# School Bus Race — Anka Bilim Grand Prix (new driver system)

A 3D browser racing game about an invented motor sport: the **School Bus Race**. The school bus models seen most often on Turkish roads race on a street circuit in Ankara, and the first bus to reach Anka Bilim School wins.

This version adds a new driver system. You pick one of **nine drivers**. Each driver has **two passives** and **one ability** that you pay for with the students you pick up.

**To play:** open `index.html` in Chrome, Edge, Firefox or Safari. It needs an internet connection to load the 3D engine and the fonts.

## How to play

1. Press **Start engines**, choose one of the 9 drivers, then one of the 6 buses. Drivers you don't pick are driven by bots.
2. Drive through the yellow bus stops to pick up students: 5 per stop, 6 stops per lap.
3. Spend your students on your driver's ability with **Shift**. Abilities have **no cooldown**; only their student cost limits them. Ali is the exception: he eats his students and pays with his sweet meter instead.
4. Finish first at Anka Bilim School. Races are 3, 6 or 10 laps against Easy, Normal or Hard rivals.

The race screen shows your students (or Ali's sweet meter), whether your ability can be used right now, and how long every temporary effect still lasts.

| Key | Action |
|---|---|
| ↑ or W | Gas |
| ↓ or S | Brake, then reverse |
| ← → or A D | Steer |
| Space | Drift |
| Shift | Use your ability (and answer Ali's reaction check) |
| H | Horn |
| C | Change camera |
| R | Back on track |
| P or Esc | Pause |
| M | Sound on/off |

On phones and tablets, on-screen buttons appear (ABILITY uses your ability). A game controller works too.

## Rules for all abilities

- All speed bonuses from abilities and passives together are capped at **+25%**, and all slowdowns at **−35%**. Percentages are always of the bus's normal top speed.
- After a stun from a rival ends, no new stun from a rival can hit you for **2 s**. Stuns you give yourself don't count.
- An ability that is running can't be started again. When it ends you can use it again right away if you have enough students. Instant abilities (Egemen's ball, Ali's reaction check) are ready again once the ball or the check is over.
- One use of an ability affects the same rival at most once.
- The normal driving and crash physics are the same for everyone.

## Drivers

### Marjinal Maganda (Volkan Aytekin)

> Hard mode: left/right AND gas/brake are reversed for the whole race.

- **Passive 1: Marginal driving.** Your controls are reversed all race: left steers right, right steers left, gas brakes and brake accelerates. The camera does not flip.
- **Passive 2: Crash bonus.** Hit another moving bus and, instead of losing speed, you get +10% speed for 1.5 s. Walls and stopped buses don't count, one long scrape is one crash, and a new crash refreshes the bonus instead of stacking it.
- **Ability: Marginal field** (15 students). A moving field with a radius of about 2 bus lengths surrounds you for 4 s. Every other driver inside it gets reversed controls until they leave (bots need 0.8 s to adapt). Your own controls stay as they are.

### Gluten (Egemen Delikan)

- **Passive 1: Gluten food.** About every 14 s a snack only you can grab appears on the road ahead. 40% of them contain gluten (bread): grab one and you are 12% slower for 3 s.
- **Passive 2: Gluten-free food.** The other 60% are gluten-free (green apples): +10% speed for 3 s. At most 2 snacks are out at once and they never affect other drivers.
- **Ability: Shot** (5 students). Kick a football forward. It flies about 2 bus lengths and stuns the first rival it hits for 0.8 s. One ball at a time; a miss is not refunded.

### YulafSütlüIceLatte (İrem Gökce)

- **Passive 1: Low camera.** Your chase camera sits lower than everyone else's, right behind the back of the bus. You still see the road over the roof.
- **Passive 2: Catch-up speed.** +1% top speed for every driver ahead of you in the standings (up to +7%). It updates as positions change.
- **Ability: Random transformation** (5 students). One random transformation for 3 s: 30% Dex the cat (+12% speed, 20% smaller hitbox) · 30% giant thermos (every rival you touch is stunned for 0.8 s) · 30% coffee cup (drops coffee every 0.75 s; rivals driving through are 12% slower for 1.5 s) · 10% plant (it ends at once and you are stunned for 1 s).

### TosunKovalayan (Ataberk Tosun)

- **Passive 1: Gym.** Gym spots appear beside the racing line (you never have to use them). Drive into one: you are stuck lifting for 2 s, then keep +2% top speed until the finish. Works 3 times (+6% in total), once per spot per lap.
- **Passive 2: Dirt road.** No slowdown when you drive off the road onto the dirt at the edge of the track.
- **Ability: Rain** (20 students). Rain falls for 6 s: every bus except Sarp's loses 20% grip and starts drifting, but can still steer. When it stops, a rainbow appears and you get +12% speed for 3 s.

### FizikCan (Doruk Can Topay)

- **Passive 1: Math question.** About every 25 s you get a short math question with two answers. 4 s later two answer gates appear on the road ahead: drive through the left or the right one. The right answer is on a random side, and the gates never stop other drivers.
- **Passive 2: Gate result.** Right gate: +7% speed for 2 s. Wrong gate: 8% slower for 2 s. 2 wrong gates in a row unlock your ability; a right gate resets the count.
- **Ability: Rage** (all students). Only after 2 wrong answers in a row. Spends ALL your students and your bus glows red for 6 s. Every rival you hit is slowed, depending on how many students you spent: 0–9: 5% for 1 s · 10–19: 12% for 2 s · 20–39: 20% for 2.5 s · 40+: 35% for 3 s.

### SarpDBastırma (Sarp Bayar)

- **Passive 1: Brainrot windows.** Small silly pop-up windows flash at the edge of your screen every 17 s for up to 0.8 s. They never cover the road. Every use of your ability makes them 3 s more frequent (at most every 8 s).
- **Passive 2: Happy aura.** Nothing from the other drivers' powers touches you, good or bad: no reversed controls, stuns, coffee, burn, cinnamon rolls, forced pit stops or rain. Normal crashes and the track surface still count. To balance this, your top speed is 2% lower.
- **Ability: Permanent speed** (10 students). +2% top speed until the finish, every time you use it. Up to 3 times (+6%), so you end up 4% faster than normal.

### CinnamonRoll (Ela Üstündağ)

- **Passive 1: Cinnamon roll.** Every rival you crash into gets a cinnamon roll: +6% speed for 3 s. A long scrape is one crash, and a new crash refreshes it instead of stacking.
- **Passive 2: Drift reward.** Finish a clean drift of at least 1 s and get +2% speed for every full second of it (up to +6%) for 2 s. A new drift refreshes the bonus, it never stacks.
- **Ability: Song** (30 students). Sing for up to 8 s: +2.5% speed for every second you finish, and +20% in the last second. Brake, crash, or lose 10% of your speed within 0.3 s and the song stops: you are stunned for 2 s. Normal cornering is fine.

### TatlıKrizi (Ali)

- **Passive 1: Student snacks.** You eat the students you pick up (in a funny, cartoon way). They fill your sweet meter instead of a student count: +2% per student.
- **Passive 2: Desserts.** About every 18 s a donut only you can grab appears on the road ahead (one at a time): +8% sweet meter. The meter tops out at 100%.
- **Ability: Sweet crisis** (25%+ sweet meter). Needs at least 25% and empties the whole meter. 25–49%: +10% speed for 4 s. 50–99%: every other driver gets a 1.2 s reaction check; whoever fails is 15% slower for 2 s. 100%: for 8 s you hunt: the first rival you crash into is bitten for 1.5 s (neither of you can move), then you get +18% for 4 s and they must wait 2 s longer at their next pit stop (if they never stop again, it is added to their finish time). No target in time means no refund.

### RomanceHunter (Ada Yeşil)

- **Passive 1: Clear leader.** When you lead by more than 2.5 s, your top speed drops 4%. It comes back once the gap is under 1.5 s or you lose the lead.
- **Passive 2: Trail follower.** Follow the driver right ahead of you in the standings, 1–3 bus lengths behind and in about the same lane, for 0.5 s: +6% speed for as long as you stay there.
- **Ability: Power of true love** (20 students). Ada calls her sweetheart, an Irish leprechaun. He grabs the nearest rival up to 2 bus lengths ahead and throws it into the side wall in 0.5 s: a normal wall crash plus a 1.2 s stun. Only works when a rival is that close ahead with a wall beside it; otherwise no students are spent. Sarp can't be targeted.

## Changing the numbers

Every balance number for the nine drivers is in **`characters.js`**: costs, percentages, durations, chances, ranges and the common limits in `RULES`. Change a value, save, and reload the page. The texts on the driver screen are built from the same numbers, so they stay correct.

The student rate (5 per stop, 6 stops per lap) belongs to the track and is not in that file. In test races with bots, a bus picks up about 45 students in 3 laps and 75–95 in 6 laps. That is enough for Ela's 30-student song at least once in every race, and Doruk reaches the 40+ rage when he saves up.

## Tyres and pit stops

- Tyres wear out as you race: about a fifth of a set per lap, more if you drift, brake hard, hit walls or leave the road. Worn tyres grip less.
- The **TYRES** gauge turns yellow, then red. Below 12% a tyre can burst at any moment, and at 0% it always does.
- The pit lane is on the **left, right after the car park**. Keep to the 80 km/h limiter and stop in the box with your bus number. The crew changes all four tyres in 2.6 seconds.
- A bite from Ali makes your next stop 2 s longer. If you never stop again, the 2 s are added to your finish time.

## Buses

| No. | Bus | Tagline |
|---|---|---|
| 1 | Ford Transit | Reliable. Always ahead. |
| 2 | Mercedes-Benz Sprinter | Comfort meets performance. |
| 3 | Volkswagen Crafter | Space for greater things. |
| 4 | Renault Master | Practical. Powerful. |
| 5 | Fiat Ducato | Built for people. |
| 6 | Otokar Sultan | Türkiye'nin gücü. |

Each bus has its own top speed, acceleration, handling and weight.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: layout, HUD and menus |
| `characters.js` | The character settings: every number for the nine drivers |
| `game.js` | The game: track, buses, physics, bots, abilities, sound |
| `photos.js` | The driver portraits |

The 3D graphics use [three.js](https://threejs.org/) r128, loaded from cdnjs. Every sound, including Ela's song, is generated in the browser with the Web Audio API.
