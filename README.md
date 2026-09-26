# School Bus Race — Anka Bilim Grand Prix (new driver system)

A 3D browser racing game about an invented motor sport: the **School Bus Race**. The school bus models seen most often on Turkish roads race on a street circuit in Ankara, and the first bus to reach Anka Bilim School wins.

This version has twelve drivers. You pick one of them. Each driver has **two passives** and **one ability** that you pay for with the students you pick up. The Ghostly Sisters count as one pick: Elif and Zeynep share one bus.

**To play:** open `index.html` in Chrome, Edge, Firefox or Safari. It needs an internet connection to load the 3D engine and the fonts.

## How to play

1. Press **Start engines**, choose one of the 12 drivers, then one of the 6 buses and one of the 4 circuits. Drivers you don't pick are driven by bots, except Sarp: he is only ever driven by a player.
2. Drive through the yellow bus stops to pick up students: 5 per stop, 6 stops per lap.
3. Spend your students on your driver's ability with **Shift**. Abilities have **no cooldown**; only their student cost limits them. Two drivers work differently: Ali doesn't collect students at all and plays with a satiety meter, and Sarp spends his students on liking the brainrot posts that pop up on his screen.
4. Finish first at Anka Bilim School. Races are 3, 6 or 10 laps against Easy, Normal or Hard rivals, or against your friends online (see below).

The race screen shows your students (or Ali's satiety meter, or Sarp's likes and permanent speed), whether your ability can be used right now, your Wheel Bar when a bite has taken from it, which sister is driving, Saner's engine heat, and how long every temporary effect still lasts. There is never a cooldown timer.

| Key | Action |
|---|---|
| ↑ or W | Gas |
| ↓ or S | Brake, then reverse |
| ← → or A D | Steer |
| Space | Drift |
| Shift | Use your ability (Sarp: like the newest post) |
| X | Sarp: close the newest post |
| H | Horn |
| C | Change camera |
| R | Back on track |
| B | Box this lap, or stay out (tyres and pit stops on) |
| P or Esc | Pause |
| M | Sound on/off |

On phones and tablets, on-screen buttons appear (ABILITY uses your ability). A game controller works too.

## Circuits

Pick the circuit on the bus screen (or press **T** there to switch). Every circuit has 6 bus stops per lap, grandstands at the start and the same rules.

| Circuit | Length | What it is like |
|---|---|---|
| **Anka Bilim** | 2.23 km | City streets and a car park stage, to the finish at Anka Bilim School. |
| **Eymir Lake** | 2.40 km | Fast sweepers around the lake, with sailing boats, and a tight hairpin at the far end. |
| **Atakule** | 1.85 km | A street circuit at sunset: right-angle corners between tall buildings, around the Atakule tower. |
| **Esenboğa Airport** | 2.50 km | The runway is an 800 m straight; hairpins at both ends and a taxiway that weaves past the terminal and parked planes. |

Best laps are saved for every circuit and bus.

## Drift mode

Switch **Drift mode** on or off on the bus screen before a race (online, the host decides). It is the same for every player and every bot in that race.

- **Off:** the normal steering.
- **On:** normal steering turns 20% less, and steering while you drift (Space, or the bus sliding) turns 20% more. So drifting through the corners pays off, but every bus can still take every corner without drifting.
- Ataberk's rain makes buses slide in both modes.

## Tyres and pit stops

Switch **Tyres & pits** on or off on the bus screen (online, the host decides). With it off, nobody's tyres wear and the pit lanes are closed.

| Compound | Colour | Lasts about | Pace |
|---|---|---|---|
| **Soft** | red | 2.5 laps | fastest |
| **Medium** | yellow | 4.5 laps | in between |
| **Hard** | white | 7.5 laps | slowest |
| **Intermediate** | green | 3.5 laps | best on a damp track |
| **Wet** | blue | 4.5 laps | best on a soaked track |

- Tyres get a little slower as they wear. Below 20% they fall off a cliff and the bus gets much slower (they never burst).
- **Before every race you set your strategy:** the set you start on, how many pit stops (up to 3), after which lap and which set to fit at each. The screen shows your stints as a bar, how long each compound lasts and how your plan compares with the fastest one the game can find (one click uses it). Online, everybody sets their own plan in the lobby.
- **Pit stops are automatic.** On a planned lap you hear "Box, box!" and at the pit entry the game takes over: it drives the pit lane at 80 km/h, stops in the box with your bus number, the crew changes all four tyres in 2.6 seconds and you get the bus back at the pit exit. Press **B** (or **BOX** on a phone) to stop on a lap that isn't planned, or to stay out on one that is. Driving into the pit lane yourself works too.
- Every circuit has its own pit lane: Anka Bilim on the left before the line, Eymir Lake and Atakule on the right just after it, Esenboğa Airport on the left of the runway before the line.
- The bots pick their own strategies from the faster plans; hard bots pick the best ones.
- While Zeynep drives the Ghostly Sisters' bus, their tyres wear 30% faster (and not at all while she drives on her own ice).

## Weather

Pick the weather on the bus screen (online, the host picks it): **Dry**, **Rain** (it rains all race, lighter or harder) or **Changing** (the rain comes during the race, or a wet track dries out).

- While it rains the track gets wet; when the rain stops it dries slowly. A wet track has less grip for everybody. The asphalt turns dark and shiny, the buses throw up spray and you can't see as far.
- The two rain tyres work like in F1: **intermediates** for a damp track, **wets** for a soaked one. Slicks slide on a wet track. Rain tyres are slow on a dry track and wear out fast there.
- The strategy screen shows the forecast lap by lap (dry, damp or wet), and the fastest plan takes it into account.
- If the weather turns, the game tells you ("Box for intermediates?") and at your next stop the crew fits the right set for the track. The bots react to the weather too, each a little earlier or later.
- The HUD shows when it rains and how wet the track is. Online, everybody gets the same forecast.
- With tyres and pit stops off, the rain still makes the track slippery for everybody.

## Online races with friends

Up to 6 friends can race together, each on their own phone or computer.

1. One of you presses **Race online** → **Create a room** and shares the 4-letter room code.
2. Everybody else presses **Race online**, types the code and presses **Join**.
3. In the lobby, everybody picks a driver and a bus. Each one can be taken by one player only.
4. The host chooses the circuit, the laps, the bots' level, tyres and pit stops, the weather and drift mode, and presses **Start race**. Everybody's game switches to the host's circuit. Empty buses are driven by bots.

Every ability works between players too: stuns, slowdowns, Ataberk's rain and cookie men, Volkan's field, Ali's sweet barriers, marks and bites, Ada's leprechaun, Zeynep's ice, Elif's darkness and Doruk's black hole all reach your friends' screens. Sarp's posts and screen tricks only ever appear on Sarp's own screen. When the race is over, the host takes everybody back to the lobby for the next one.

- It needs an internet connection. Devices first try to connect directly to each other with [PeerJS](https://peerjs.com/): free, no accounts.
- Many school and office Wi-Fis block direct connections. Then the game switches by itself to a **backup connection**, a free public relay on port 443 (the same port as normal websites). It is a little slower, but players on the backup connection and players connected directly can race in the same room. The lobby shows who uses which.
- If even the backup connection is blocked, use mobile data or a phone hotspot.
- The host runs the bots, so the host should keep the game open on screen.
- If a player leaves in the middle of a race, a bot takes over their bus. If that player was Sarp, the bot gets a free driver instead, because Sarp is never a bot.
- Your friends' buses move smoothly between updates: every device measures the delay of its connection, predicts where the other buses are right now, and corrects small differences gently instead of jumping. Late or lost messages no longer hold up the ones behind them.

## Rules for all abilities

- Speed bonuses that wear off (from abilities and passives) are capped together at **+25%**, and all slowdowns at **−35%**. Permanent bonuses (Sarp's likes, Ataberk's gym) and Ela's song come on top of the cap; Sarp's likes have no limit at all. Percentages are always of the bus's normal top speed.
- After a stun from a rival ends, no new stun from a rival can hit you for **2 s**. Stuns you give yourself don't count.
- An ability that is running can't be started again. When it ends you can use it again right away if you have enough students. Instant abilities (Egemen's ball, Doruk's black hole) are ready again once the ball or the hole is gone.
- One use of an ability affects the same rival at most once, unless its description says otherwise (a marked rival can bite the same driver twice per use of Ali's sweet vomit).
- Every bus has a **Wheel Bar**. Bites from rivals with Ali's sweet mark take 30 points from it; it refills by itself, and a low bar costs grip.
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
- **Ability: Shot** (5 students). Kick a football straight ahead, in the direction your bus points when you kick. It flies dead straight for about 2 bus lengths (it never curves, not even when you steer) and stuns the first rival it hits for 0.8 s. One ball at a time; a miss is not refunded.

### YulafSütlüIceLatte (İrem Gökce)

- **Passive 1: Low camera.** Your chase camera sits lower than everyone else's, right behind the back of the bus. You still see the road over the roof.
- **Passive 2: Catch-up speed.** +1% top speed for every driver ahead of you in the standings (up to +7%). It updates as positions change.
- **Ability: Random transformation** (5 students). One random transformation for 3 s: 30% Dex the cat (+12% speed, 20% smaller hitbox) · 30% giant thermos (every rival you touch is stunned for 0.8 s) · 30% coffee cup (drops coffee every 0.75 s; rivals driving through are 12% slower for 1.5 s) · 10% plant (it ends at once and you are stunned for 1 s).

### TosunKovalayan (Ataberk Tosun)

- **Passive 1: Gym.** Gym spots appear beside the racing line (you never have to use them). Drive into one: you are stuck lifting for 2 s, then keep +2% top speed until the finish. Works 3 times (+6% in total), once per spot per lap.
- **Passive 2: CookieRun Kale.** Cookie men wait on the road ahead of you (a new group about every 12 s, at most 2 groups at once). Touch them and they sprint 3 bus lengths ahead of you: every rival they run into is 30% slower for 1 s.
- **Ability: Rain** (20 students). Rain falls for 6 s: every bus except Sarp's loses 35% grip and starts drifting, but can still steer. When it stops, a rainbow appears and you get +12% speed for 3 s.

### ShangaiMath

- **Passive 1: Math question.** About every 25 s you get a short math question with two answers. 4 s later two answer gates appear on the road ahead: drive through the left or the right one. The right answer is on a random side, and the gates never stop other drivers.
- **Passive 2: Gate result.** Right gate: +7% speed for 2 s. Wrong gate: 15% slower for 2 s. 2 wrong gates in a row unlock your ability; a right gate resets the count.
- **Ability: Rage** (all students). Only after 2 wrong answers in a row. Spends ALL your students and your bus burns red with cartoon flames for 6 s. Every rival you hit catches fire (it looks hot but does no damage) and is slowed, depending on how many students you spent: 0–9: 5% for 1 s · 10–19: 12% for 2 s · 20–39: 20% for 2.5 s · 40+: 35% for 3 s.

### SarpDBastırma (Sarp Bayar)

> Players only: Sarp is never driven by a bot. Brainrot posts pop up all over your screen.

- **Passive 1: Brainrot posts.** Brainrot posts pop up anywhere on your screen (even over the road) every 10–14 s and stay for 10 s, one at a time. Close one with × for free, or let it run out. The speedometer and the driving controls always stay free.
- **Passive 2: Chill mood.** Nothing the other drivers' powers do touches you, good or bad: speed changes, reversed controls, stuns, marks, Wheel Bar bites, Ataberk's rain, ice or darkness. Crashes and the track surface still count. Only your own screen plays tricks on you: every 15–22 s a 0.4 s jumpscare, 1.5 s of wobbly camera or a 0.6 s glitch.
- **Ability: Permanent speed** (5 students per like). Like an open brainrot post for 5 students (tap ♥ on it, or press Shift) and keep +2% top speed until the finish. There is no limit: 1/2/3 likes give +2%/+4%/+6%, and so on. But your screen gets busier: at +4% posts come every 6–11 s, 2 at a time; at +8% your camera tilts 15–40°; at +12% fake things appear beside the road, real rivals vanish from your view for up to 0.6 s, and a post pops up every 2–4 s.

### CinnamonRoll (Ela Üstündağ)

- **Passive 1: Cinnamon roll.** Every rival you crash into gets a cinnamon roll: +6% speed for 3 s. A long scrape is one crash, and a new crash refreshes it instead of stacking.
- **Passive 2: Drift reward.** Finish a clean drift of at least 1 s and get +2% speed for every full second of it (up to +6%) for 2 s. A new drift refreshes the bonus, it never stacks.
- **Ability: Song** (30 students). Sing for up to 8 s: +2.5% speed for every second you finish, growing until the song ends (up to +20%, and it may go past the usual +25% cap). Brake, crash, or lose 10% of your speed within 0.3 s and the song stops: you are stunned for 2 s. Normal cornering is fine.

### TatlıKrizi (Ali)

- **Passive 1: Sweet barriers.** While you race, sweet barriers appear on fixed spots of the circuit every 16–20 s (at most 2, each gone after 14 s); there is always room to drive around them. A rival who hits one gets stuck for a moment and stunned for 0.7 s. You eat your own barriers for +28% satiety, but only below 80%: from 80% you are too full, get stuck and are stunned for 0.6 s.
- **Passive 2: Satiety meter.** You don't collect students: every student stays there for the others. You play with a 0–100% satiety meter that starts at 50% and drops 1.5% a second. Every bus stop gives +20% (each stop once a lap). Under 40%: hungry, 6% slower. 40–79%: just right, +5% speed. 80% and more: stuffed, 12% slower, but you shove buses you crash into 25% harder. At 100% the meter stays full until you use Sweet vomit.
- **Ability: Sweet vomit** (100% satiety). Only with a full 100% meter, and it empties it. For 1.5 s you spray sprinkles and candy 2 bus lengths ahead of you in a 60° cone (funny, never gross). Every rival it reaches gets a sweet mark for 10 s and gives you back +5% (up to +20% per use). A marked rival who touches another driver bites them: −30 points on their Wheel Bar (you can be bitten too). The same pair can bite once every 2 s, and at most 2 times per target per use. Sarp can't be marked.

### RomanceHunter (Ada Yeşil)

- **Passive 1: Clear leader.** When you lead by more than 2.5 s, your top speed drops 4%. It comes back once the gap is under 1.5 s or you lose the lead.
- **Passive 2: Trail follower.** A pink trail only you can see shows the path of the driver right ahead of you in the standings (it fades after about 2 s). Follow it 1–3 bus lengths behind them, in about the same lane, for 0.5 s: +6% speed for as long as you stay there.
- **Ability: Power of true love** (20 students). Ada calls her sweetheart Lapricote, an Irish leprechaun. He grabs the nearest rival up to 2 bus lengths ahead and throws it into the side wall in 0.5 s: a normal wall crash plus a 1.2 s stun. Only works when a rival is that close ahead with a wall beside it; otherwise no students are spent. Sarp can't be targeted.

### Saner

- **Passive 1: Power from walls.** Crashing into a wall doesn't cost you speed: you get +12% speed for 1.5 s instead (a new crash refreshes it, it never stacks). The wall still stops you going through. Scraping along a wall is one crash: let go and hit it again. Dirt and other slow ground beside the road doesn't slow you down.
- **Passive 2: Overheating.** Drive 5 s without hitting a wall, an obstacle or a bus and your engine overheats: 12% slower until your next real crash, which cools it down and starts a new 5 s count.
- **Ability: Uncontrolled speed** (25 students). +20% top speed, but your steering (and your drifting) turns 75% less. It lasts as long as you keep crashing: it ends 1.5 s after you use it or after your last crash into a wall, an obstacle or a bus. Crash into a rival while it runs and you are both stunned for 0.4 + 0.2 × (crashes so far) s, up to 1.6 s. Your wall bonus still works, within the +25% cap.

### Ghostly Sisters (Elif & Zeynep)

- **Passive 1: Turns by position.** One pick, two sisters in the same bus, sharing the students. In places 1–3 Zeynep drives; from place 4 on (in any size of race) Elif takes the wheel. They swap once the new place has held for 0.5 s; the bus and the camera stay where they are.
- **Passive 2: Two prices.** While Zeynep drives, the tyres wear 30% faster (with tyres & pit stops on). While Elif drives, steering and drifting turn 12% less.
- **Ability: Ice or darkness** (30 students). Who drives decides what the 30 students do. Zeynep's ice: every road turns to ice for 5 s and every other bus loses 60% grip (not you, and your tyres don't wear while you drive on it). Elif's darkness: you teleport about 1 bus length in front of the driver right ahead of you in the standings (only onto a safe, free spot on the road; otherwise nothing is spent), then everybody else can see 50% less far for 5 s. Sarp is immune to both.

### Doruk (Doruk Can Topay)

- **Passive 1: Grey trail.** You leave a grey trail on the road that fades after about 2 s (it never blocks anybody's view). A rival who follows it for 0.4 s is 12% slower for 1.5 s; to get caught again they must be off the trail for 1 s. Sarp is immune.
- **Passive 2: Dropped glasses.** Every real crash into a wall, an obstacle or a bus knocks your glasses off: your own screen goes a little blurry for 1.2 s (a new crash restarts it, it never gets worse).
- **Ability: Artificial black hole** (15 students). Throw a black hole core dead straight ahead. It flies up to 3 bus lengths (or until it hits something) and becomes a black hole for 3 s. It gently pulls rivals within 1.5 bus lengths toward its centre (never faster than 12% of their top speed, never through a wall) and stuns anyone who gets within 0.4 bus lengths of the centre for 1 s, once per hole. It never pulls you, and Sarp is immune. One hole at a time.

## Changing the numbers

Every balance number for the twelve drivers is in **`characters.js`**: costs, percentages, durations, chances, ranges, the common limits in `RULES`, drift mode in `DRIFT_MODE` and the Wheel Bar in `WHEEL_BAR`. Sarp and Ali have their own detailed settings there (post times, the three speed thresholds and screen tricks; barriers, the satiety bands, the vomit and the bites). The tyre compounds and pit stops are in the same file (`TYRES`: how long each compound lasts, its pace and grip, the cliff, the time in the box and the pit lane speed), and so is the weather (`WEATHER`: when the track counts as damp or wet, how much grip the rain takes away, how fast the track gets wet and dries). Change a value, save, and reload the page. The texts on the driver screen are built from the same numbers, so they stay correct.

The student rate (5 per stop, 6 stops per lap) belongs to the track and is not in that file. In test races with bots, a bus picks up about 35–60 students in 3 laps and 75–120 in 6 laps. That is enough for Ela's 30-student song in a 3-lap race, and ShangaiMath reaches the 40+ rage when he saves up. In test races Ali reached 100% satiety within the first lap or two, and Sarp passed all three speed thresholds in 3 laps by liking a post whenever he had 5 students.

To add another driver, add an entry to `CHARACTERS` (and its powers in `game.js`): the driver screen makes room for any number of drivers.

## Smooth play on slower computers

- The game watches its own frame rate while you race. When a computer can't keep up, it first draws the picture at a slightly lower resolution; if that is still not enough, it switches to simpler shadows, then to none. It sharpens the picture again when there is room.
- **Graphics** in the pause menu sets the best quality the game may use. **Low** also turns off edge smoothing (after reloading the page), which helps most on weak graphics chips.
- Computers where the browser has no working graphics chip start on the lowest settings.
- Everything an ability shows is prepared while the game loads, so the first use of a power doesn't freeze the race for a moment.

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
| `characters.js` | The character settings: every number for the twelve drivers |
| `game.js` | The game: track, buses, physics, bots, abilities, online races, sound |
| `photos.js` | The driver portraits (drivers without a photo get a drawn one) |

The 3D graphics use [three.js](https://threejs.org/) r128 and online races use [PeerJS](https://peerjs.com/) 1.5, both loaded from cdnjs. The backup connection uses the [Eclipse Paho](https://eclipse.dev/paho/) MQTT client with the free public brokers of shiftr.io (port 443) and HiveMQ. Every sound, including Ela's song, is generated in the browser with the Web Audio API.
