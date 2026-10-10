# GrateApex (Expo) — Phase 1: accounts + onboarding

## Run it (on your Windows laptop)
1. Unzip, open the folder in VS Code, open a terminal there.
2. `npm install`
3. `npx expo install --fix`   (makes every package match your Expo Go version)
4. `npx expo start --web`  → opens in your browser (no phone needed). On an iPhone: `npx expo start`, then scan the QR code with the Camera app.

## One-time Firebase setup (console.firebase.google.com → project "grate-apex")
1. Build → Authentication → Sign-in method → enable **Email/Password**.
   (Students type a username; the app turns it into username@grateapex.app.)
2. Build → Firestore Database → Rules → paste `firestore.rules` → Publish.
   NOTE: this replaces the current rules. If the old web hub still uses
   the gauntlet or mock-exam leaderboards, copy those rules in first.

## How the app flows
App.tsx → Gate decides:  not logged in → AuthScreen → OnboardingScreen (hall, semester) → TutorialScreen → 5 tabs.

## Files
- src/config.ts     colours, halls, trial/prices, Firebase config
- src/firebase.ts   connects to Firebase
- src/auth.tsx      sign up / log in / log out + the user's profile
- src/screens/      AuthScreen, OnboardingScreen, TutorialScreen, Tabs

## If saving fails ("Couldn't save…")
The message now shows Firebase's real error code:
- `unavailable` / "client is offline"  → the Firestore database hasn't been created yet.
  Firebase console → Build → Firestore Database → Create database (production mode).
- `permission-denied` → publish `firestore.rules` (Firestore → Rules → Publish).

## Study tab (Phase 1b)
- Courses come from `src/data/catalog.ts`; each shows only for the hall + semester in its `halls` / `semesters`.
  All 5 old-hub courses are set to HB1, Semester 2. Change those two lists to show a course to more students.
- Questions are in `src/data/courses/*.json` (made from the old hub by `scripts/normalize_questions.py`).
  4,683 single-answer questions kept; multi-select and image questions were left out for now.
- Quiz rounds: up to 25 random questions. XP rule is the old hub's: +5 correct, -2 wrong, +15 finish, +40 perfect.
- Progress (XP, streak, per-course stats) saves on the device and syncs to Firestore `progress/{uid}`.

## Compete tab (Phase 2)
- Firestore collections: `scores/{uid}` (public leaderboard summary), `follows/{follower}_{followee}`.
- Follow someone = one-way. If you both follow each other you're "Friends ✓" (needed later for study groups).
- Tabs: Global (by XP), Course (by XP earned in that course), Friends (people you follow + you), Find (search by username).
- IMPORTANT: re-publish `firestore.rules` — it now has rules for `scores` and `follows`.
- Known limit: scores are written by the student's own app, so a determined user could fake XP.
  Fixing that properly needs Cloud Functions; fine for a prototype.

## Community tab (Phase 3)
- Boards: General, Ask a Senior, and one per course (from the catalog), plus "My posts".
- Firestore: `posts/{id}` (title, body, board, authorName, replyCount…) and `posts/{id}/replies/{id}`.
- Re-publish `firestore.rules` again — it now covers posts and replies.
- No extra indexes needed (lists are sorted on the phone).
- Not built yet: moderation/reporting, editing posts, "verified answer of the day", real "senior" badges.

## Feed + profiles (Phase 4)
- Feed tab: recent activity from you and everyone you follow — quiz results, level-ups, streak milestones
  (3/7/14/30/60/100 days) and shared weekly recaps ("Share my week").
- Tap any username (Feed, Compete, Community, followers lists) to open that student's public profile:
  rank, XP, streak, accuracy, per-course XP bars, followers/following lists, recent activity, follow button.
- Firestore: `users/{uid}/activity/{id}`. Re-publish `firestore.rules` once more.
- Not built yet: cheers/reactions on feed items, "verified answer of the day" cards.

## Study groups + live chat (Phase 5)
- Community → 👥 Study groups. Create a group, add friends, chat live (messages appear instantly, no refresh).
- Friends = people you follow who follow you back. The owner can only add a friend of theirs —
  this is enforced in `firestore.rules`, not just in the app. Max 10 members.
- Firestore: `groups/{id}` (memberUids, members) and `groups/{id}/messages/{id}`.
- Re-publish `firestore.rules`. The rules use exists()/get() lookups, so they cost a few extra reads per message.
- Not built yet: push notifications, unread counts, deleting messages from the UI, moderation,
  peer-hosted live Q&A, the exam-stress vent channel.

## Design (matches the original hub)
- Blue gradient background, frosted glass cards, Poppins font, gradient course icons, rank ring, stat tiles, weekly challenge.
- 11 themes from the original (`src/theme.tsx`). Pick one with the 🎨 button on the Study tab or in You → Themes.
  Themes unlock by level (Matcha 5, Gold 8, Cyberpunk 10, Desert 12, Retro 15, Lavender 18, Rainbow 20). The choice is remembered on the device.
- New packages (expo-linear-gradient, expo-font, @expo-google-fonts/poppins, react-native-svg):
  run `npm install` and then `npx expo install --fix`.
- Developer preview with fake data (no login): `EXPO_PUBLIC_PREVIEW=1 npx expo start --web`
  (optional: `EXPO_PUBLIC_PREVIEW_LEVEL=20` to unlock all themes).

## Learning engine (no AI)

All the rules live in `src/learning.ts`; progress is stored in `src/progress.tsx` (`recordRound`).
No Firestore rule changes are needed: it all lives in the private `progress/{uid}` document.

- **Review (spaced repetition):** a wrong answer becomes a card due in 2 days. Right on a due card moves it up: 2, 4, 7, 14, 30 days, then it is "learned". Wrong sends it back to 2 days.
- **Adaptive:** level 1-3 per course (starts at Medium). 80%+ goes up, under 50% goes down. Prefers unseen questions.
- **Pre/post-test:** 10 questions, then 10 *different* ones later; the result shows the change in points.
- **Worked example:** after every answer, the explanation is shown in its own box (about 95% of questions have one).
- **Weak spots:** topics under 75% after 4+ answers. Where a question has no topic, its set name is used.
- **Study plan:** pick an exam date; new questions are spread over the days left, keeping the last 3 days for revision.
- **On this day:** a mistake from 7+ days ago, the same one all day.

Honest limits: difficulty is *estimated from wording*, not from real results. Topics are only as good as the data (many questions have none). Spaced repetition is per question text, so editing a question resets its history.

## Lessons (stored in Firebase)

The 42 study guides from the old hub are converted into structured content (no HTML, no base64 pages):

- `content/lessons/*.json`: one file per lesson (title, section list, and the body as blocks: paragraphs, lists, tables, term boxes, callouts, step cards, diagrams).
- `content/images/*`: the 63 pictures (resized).
- `scripts/convert_guides.py`: the converter that produced them from the old guides (only needed if the old guides change).
- `scripts/seed-content.mjs`: uploads everything to Firestore.

In Firestore: `lessons/{id}` (small list entries), `lessonContent/{id}` (the body), `lessonImages/{id}` (a picture each).
The app reads them (`src/lessons.ts`), saves what you open on the phone so it works offline, and re-downloads a lesson when its version changes.
Inline words with a dotted underline are tappable definitions. Progress (sections finished) is saved with the student's other progress.

Load or update the lessons:

1. Firebase console > Project settings > Service accounts > **Generate new private key**. Save it as `serviceAccount.json` in the project folder (it is git-ignored; never put it in the app).
2. `cd scripts && npm install`
3. `node seed-content.mjs ../serviceAccount.json` (add a course name to load one course, `--dry-run` to test).
4. Publish the new `firestore.rules` (lessons are readable by signed-in students, writable by nobody from the app).

To fix a typo: edit the lesson's JSON in `content/lessons`, run step 3 again.

Not converted: the guides' built-in extras (flashcards, glossary, mnemonics, formula sheets), and the separate Glossary/Gallery/Reference pages for anatomy.

### Practice links and study aids (added to lessons)

- **Practice this lesson:** `scripts/map_questions.py` gives every quiz question to the lesson it best matches (by vocabulary, plus the old hub's "Quiz N = guide N" pairing). The question ids are saved in each lesson's `qids`. A lesson's Practice button starts a round of its questions, new ones first. Questions that match nothing clearly stay in the normal course rounds.
- **Flashcards and glossary:** built in the app from each lesson's term boxes and underlined words (the old guides did the same; they never stored cards). Spaced repetition: know a card and it returns after 1, 3, 7, 14, 30 days; miss it and it returns tomorrow. Saved in the student's progress (`terms`).
- **Mnemonics, key facts and step-by-step:** stored with the lesson (`extras` in `lessonContent`). `scripts/extract_extras.py` copied them from the old guides, leaving out copies that did not belong (anatomy guides carried psychology mnemonics; some entomology fact sheets were repeated).

To rebuild everything from the decoded old guides: `sh scripts/build_content.sh /path/to/decoded/guides`, then run the seed script again.

## Google sign-in

Same Firebase project as last semester's hub, so returning students who sign in with the same Google account get the same user id,
and their old progress (XP, streak, answered counts) in `progress/{uid}` is picked up and merged automatically.

- Web: a Google pop-up (falls back to a full-page redirect where pop-ups are blocked).
- Phone app (Expo Go): not available yet. Google needs a development build for native sign-in. The button explains this; username login still works.
- A first-time Google user picks a username (never the Gmail name), stored in `users/{uid}` and reserved in `usernames/{name}`.
- Firebase console: Authentication > Sign-in method > Google must be ON (it was last semester) and your website's address must be in Authentication > Settings > Authorized domains (`localhost` is there by default).
- Publish the new `firestore.rules` (adds the `usernames` registry).

## Hosting the web version on Vercel

1. Put the project folder on GitHub (the `.gitignore` already keeps `node_modules` and admin keys out).
2. vercel.com > Add New > Project > import the repo. `vercel.json` already sets the build (`npx expo export --platform web`), the output folder (`dist`) and the single-page routing. Deploy.
3. Firebase console > Authentication > Settings > Authorized domains > add your Vercel address (e.g. `grateapex.vercel.app`, and any custom domain). Without this, Google sign-in fails with an "unauthorized domain" message.
4. Every push to GitHub redeploys automatically. Lesson content is not part of the deploy: it lives in Firebase.

Test the production build locally first: `npx expo export --platform web` then serve the `dist` folder.

## Desktop layout
On web at 1000px or wider the app switches to a desktop layout: left sidebar, two-column Study pages, a lesson reader with a table of contents, hover effects, and keyboard shortcuts (quiz: A-E or 1-5 to answer, Enter for next; lessons: arrow keys). Phones and Expo Go keep the bottom-tab layout.

## Installable app, offline lessons, share links
- **Install:** `public/manifest.webmanifest`, icons and `public/sw.js`. `scripts/postbuild-web.mjs` adds the tags and registers the service worker after every web build (the Vercel build command runs it).
- **Offline:** the service worker saves the app itself. Lessons you open are saved on the device (IndexedDB on web), and each course has a "Save this course for offline" button.
- **Share links:** `/l/<lesson-id>` and `/c/<course-id>`. The post-build step writes a page for each one with a preview card (title, summary, picture). Pictures live in `public/og/`; after changing lessons run `python3 scripts/make_og.py` (needs Pillow). Set `SITE_URL` in Vercel if you add a custom domain.
- Test the service worker on the deployed https site, not in `expo start`.

## Practice Center (replaces the old "sets" list)
Course page: per-lesson practice, then Mixed, Adaptive, Review and Weak spots, then the original hub's **Practice Center**: Predicted Tests (5 fixed mock exams, answers at the end), Custom Quiz Builder (topics, count, timer, feedback style) and Timed Drill (20 questions, countdown per question), plus Past questions where the course has them. Duplicate questions across the old sets are merged into one.

### Past questions
Questions from past papers carry a `p: 1` flag (`scripts/normalize_questions.py`). Papers in layouts the first extraction missed (Biochemistry Past Questions 1-3, Anatomy Past Questions 1-4) come from `scripts/extract_past.cjs`. After changing question files run `python3 scripts/normalize_questions.py`, then `python3 scripts/map_questions.py .`, then re-seed lessons.

## Uploads (photos and videos)

Photos and videos are hosted on **Cloudinary** (free tier); Firestore only stores the links.
Works in: Feed posts, Community posts and replies, group chats, profile pictures.

1. Make a free account at cloudinary.com and note your **Cloud name** (Dashboard).
2. Settings → Upload → **Add upload preset**: Signing mode **Unsigned**, a fixed folder (e.g. `grateapex`),
   allowed formats `jpg,png,webp,gif,mp4,mov,webm`, and an incoming transformation that limits images
   (e.g. `c_limit,w_1600`). Set a max file size (50 MB) in the preset or Security settings.
3. Give the app the two values, either as Vercel env vars (Project → Settings → Environment Variables, then redeploy)
   `EXPO_PUBLIC_CLOUDINARY_CLOUD` and `EXPO_PUBLIC_CLOUDINARY_PRESET`, or by editing `CLOUDINARY` in `src/config.ts`.
4. Re-publish `firestore.rules` (new `post` feed type, media lists, profile `photo`).

Limits in the app: 3 attachments per post/reply, images up to 10 MB, videos up to 50 MB.
An unsigned preset can be used by anyone who reads the preset name from the site, so keep the folder, formats and
size limits strict and watch your Cloudinary usage. Only `https://res.cloudinary.com/` links are ever displayed.

## Achievements

23 badges (questions answered, streaks, levels, accuracy, courses, lessons, flashcards, exam date). They are worked out
from each student's saved progress (`src/achievements.ts`), so there's nothing extra to store or publish, and
progress carries across devices. To add one, add a line to `ACHIEVEMENTS`. A banner pops up when a badge is earned;
the first time on a device it just records what's already earned. The shelf is on the You tab.

## Look and feel (phone)

Floating pill tab bar with a raised Study button (`FloatingBar` in `screens/Tabs.tsx`), a title row with bell and
search buttons on each tab (`ScreenHeader`; bell opens Feed, search opens Compete → Find), the You tab
(`screens/YouScreen.tsx`: photo, Posts/Followers/Following, your posts, achievement tiles, settings list) and the
Compete tab (rank ring, leaderboard chips, trophy case). Icons are drawn in `src/Icon.tsx`. Desktop keeps its sidebar.

## AI tutor and AI practice questions

`api/ai.js` is a Vercel serverless function. The app never holds the AI key: students send their Firebase login token,
the function checks it, counts one use against a daily limit (`aiUsage/{uid}` in Firestore), reads the lesson text from
Firestore itself (so students can't feed it other material), and calls Anthropic.

Set these in Vercel (Project → Settings → Environment Variables), then redeploy:
- `GEMINI_API_KEY`: free key from aistudio.google.com (Get API key). If set, Gemini is used.
- `FIREBASE_SERVICE_ACCOUNT`: the whole contents of your `serviceAccount.json`, pasted as one value. Never commit that file.
- `AI_MODEL` (optional): default `gemini-3.5-flash`. If you hit the free limits, try `gemini-3.5-flash-lite` (lighter, higher limits).
- `AI_DAILY_LIMIT` (optional): AI uses per student per day, default 20 (a chat message or a set of practice questions each count 1).
- `ANTHROPIC_API_KEY` (optional): if there's no Gemini key, the function uses Claude instead (default model `claude-haiku-4-5-20251001`).

The free tier has a shared daily request limit for your whole project, so if many students use it at once the AI says it is busy;
lower `AI_DAILY_LIMIT` to stretch it, or add billing / switch provider later (only `ask()` in `api/ai.js` changes).
Google may use free-tier prompts to improve its models outside the EU/UK/EEA; prompts here are lesson text plus the student's question.

Then re-publish `firestore.rules` (adds `aiUsage`). In a lesson: **🤖 Ask AI** (tutor chat) and **✨ AI practice** (5 new questions).
The function only exists on Vercel, so in `expo start` the buttons say the AI isn't available; use `vercel dev` to test locally.

## Premium and payments

Students pay for Premium (GHS 25 per semester, GHS 40 for two) from You → Premium. It switches on a record in
`subscriptions/{uid}` that only the server can write (`usePremium()` in `src/premium.tsx` reads it). **Nothing is locked yet**:
when you decide what Premium unlocks, check `usePremium().premium` in that feature.

Two ways to pay:
1. **Paystack** (card and Mobile Money, automatic). `api/pay.js` starts the payment and confirms it; `api/paystack-webhook.js`
   confirms it even if the student closes the page. Vercel variable `PAYSTACK_SECRET_KEY`: use the **test** key (`sk_test_...`)
   first (no documents needed), the **live** key (`sk_live_...`) once Paystack activates your account (for a Starter Business in
   Ghana they ask for a personal ID, TIN and a personal bank or MoMo account, not company papers). In the Paystack dashboard
   (Settings → API Keys & Webhooks) set the Webhook URL to `https://YOUR-SITE/api/paystack-webhook`.
2. **Manual MoMo** (no account, no documents). Set Vercel variables `EXPO_PUBLIC_MOMO_NUMBER`, `EXPO_PUBLIC_MOMO_NAME` and
   optionally `EXPO_PUBLIC_MOMO_NETWORK`. A student pays you, enters the transaction ID, and it appears for you to approve.

**Admins:** in the Firebase console create a Firestore document `admins/<your uid>` (any content; your uid is under
Authentication → Users). Then You → "Premium and payments (admin)" lists MoMo claims with Approve / Reject. Approving checks
the same MoMo reference hasn't already been used. Always compare it with your own MoMo messages first.

Prices are decided on the server (`PLANS` in `api/_lib.js`); keep `src/config.ts` in step so the screen shows the same numbers.
Re-publish `firestore.rules` (adds `subscriptions`, `payments`, `admins`, `momoRequests`).

## Likes, comments, reshares, delete, stories
- Feed posts and discussion posts can be **liked**; feed posts can be **commented on**; posts can be **reshared** to your followers (a "reshare" feed item with the original quoted). Authors can **delete** their posts; post owners can also delete comments/replies on them.
- **Stories**: a row of circles at the top of the Feed. Photo, video or coloured-text, hidden after 24 hours (old ones are tidied up when their owner opens the app). Owners see who viewed each story.
- **Re-publish `firestore.rules`** after updating (new rules for likes, comments, stories and views).

## XP battles
Compete → ⚔️ XP Battles (or "Challenge to a battle" on someone's profile). Challenge a person, pick a stake (10/25/50/100 XP each) and a course. When they accept, both stakes are held, you both get the same 7 questions live (20s each, faster correct answers score more), and the winner takes the pot; a draw returns the stakes.
- The referee is `api/battle.js` (Vercel function, needs the same `FIREBASE_SERVICE_ACCOUNT` as the AI/payments). It picks the questions, keeps the answers, grades, and moves XP, so players can't fake a win.
- XP won/lost is kept in `battleLedger/{uid}` and added on top of earned XP everywhere (Study, Compete, leaderboard).
- Re-publish `firestore.rules` (new `battles` and `battleLedger` rules) and redeploy.

### Testing the server features from a local dev server
`/api/*` only exists on Vercel. To try AI / battles / payments while running `npx expo start --web` locally, put `EXPO_PUBLIC_API_BASE=https://grate-apex-hub.vercel.app` in your `.env` and restart with `--clear`.

## Class lock (hall + semester)
Everyone picks hall + semester once, confirms it ("can't be changed later"), and it's saved with `classLocked: true`. Existing students are asked to confirm once on their next login (their current choice is pre-selected).
- Enforced in `firestore.rules`: a locked user can't change `hall`/`semester`, and lessons can only be read for courses in their own class (see `lessonOpen`).
- The AI tutor and battles check it on the server too (battles only use courses both students share).
- Who sees which course lives in `src/data/access.json` (also copy any change into the course list in `lessonOpen` in `firestore.rules`).
- To fix someone who picked wrong: in the Firebase console open `users/<uid>`, set `classLocked` to false (and edit hall/semester if you like). They'll be asked to choose again.

### Class lock and HB2 access
Hall + semester are chosen once at sign-up, confirmed on a "this can't be changed" screen, and locked (the database refuses changes; an admin can fix a mistake by setting `classLocked` to false on the user's document). **HB2 students can open all HB1 courses** as well as their own; HB1 students only see HB1. The rule lives in `canSee()` (`src/data/catalog.ts`), `allowedCourses()` (`api/_lib.js`) and `lessonOpen()` (`firestore.rules`), so re-publish the rules and redeploy.

## Notifications
The 🔔 in every screen header opens your notifications (red badge = unread): likes, comments, reshares, new followers, replies to your discussions, and battle challenges/accepts. They're stored in `users/{uid}/notifications` (rules in `firestore.rules`; battle ones are written by `api/battle.js`). In-app only, no phone push yet.
Story videos start muted (browsers block autoplay with sound); tap "Tap for sound".

## Push notifications (web push)
Works in Chrome/Edge/Firefox/Android, and on iPhone once the app is added to the Home Screen (iOS 16.4+). Setup, once:
1. Run `npx web-push generate-vapid-keys` (prints a public and a private key).
2. In Vercel add `VAPID_PUBLIC_KEY` (public), `VAPID_PRIVATE_KEY` (private), and `EXPO_PUBLIC_VAPID_PUBLIC` (the same public key again, so the app can see it). Redeploy.
3. Re-publish `firestore.rules`.
Students turn it on in You → Push notifications (or from the banner in the 🔔 list). `GET /api/push` shows `{"vapid":true}` when the keys are set. Never commit the private key.

## Question of the Day and Help & support
- **Question of the Day** (Study tab): one question per day, the same for everyone in the same hall + semester (chosen from your courses by date). Right = +20 XP, wrong = +5 XP and it comes back in review. Shows what % of the class got it right, and a daily streak. Re-publish `firestore.rules` (new `qotd` rules).
- **Help & support** (You tab): FAQ, a "Message us" form (stored in `supportTickets`), and the student's past messages with replies. Admins (users with an `admins/<uid>` document) also see an inbox there to reply and close; the student gets a notification. Optional: set `EXPO_PUBLIC_SUPPORT_WHATSAPP` (number with country code, e.g. 233XXXXXXXXX) and/or `EXPO_PUBLIC_SUPPORT_EMAIL` in Vercel to show WhatsApp / Email buttons.

## AI flashcards
In every lesson section there's a "✨ AI flashcards for this topic (10)" button. The server (`api/ai.js`, mode `flashcards`) reads only that topic's text and returns 10 cards, which open in the normal flashcard player (spaced repetition included). Cards are saved on the device, so reopening is free; "↻ New set" makes fresh ones. Each new set costs one AI use from the daily limit.

## Comment replies
Every comment on a feed post and every reply on a discussion post has a **Reply** link. Replies sit indented under the comment they answer (replying to a reply stays in the same thread and tags the person). If a comment is deleted, its replies stay under a "deleted" note. The person you reply to gets a notification. Re-publish `firestore.rules` (comments may now carry `parentId` / `replyTo`).

## Username changes
You page > **Change username**. Once every 30 days; the new name must be free (3–20 letters, numbers, underscores).
- The old name stays reserved for that account (nobody can take it), and signing in with either name works: the `usernames/{name}` entry stores the original hidden login (`login`).
- Old posts/comments keep the old name; everything new, the leaderboard and the profile use the new one.
- **Re-publish `firestore.rules`** (registry entries may now hold `login`, `get` is public so renamed accounts can sign in, and the user doc allows one validated username change per 30 days).

## Flashcards tab: Grate Apex + AI generated
In a lesson, the Flashcards tab has two options: **Grate Apex** (our spaced-repetition cards) and **AI generated** (pick a topic, 10 cards, saved on the device and reopened free). The "✨ AI flashcards" button at the end of a topic still works and saves into the same place.
When the app runs on localhost, `/api` calls go to the deployed site automatically (`src/apiBase.ts`); set `EXPO_PUBLIC_API_BASE` to override.

## AI flashcards are saved to your account
Sets live in Firestore at `users/{uid}/aiDecks/{lessonId}__{sectionId}` (rule already in `firestore.rules`; **re-publish it**), with a device copy as backup. Old device-only sets are uploaded the first time they're opened. In the AI generated tab, **Spaced review** reviews every AI card from all your sets on the same 1/3/7/14/30-day schedule as the Grate Apex cards.

## Battles: custom stake/questions + battle room
- The challenger types the **XP stake** (5–1000, up to their XP) and the **number of questions** (3–20); quick-pick chips remain.
- Accepting moves the battle to a **room** (`status: "lobby"`; stakes are held). It goes live only when **both players are in the room** (they check in every 8s; the server starts it when both checked in within 25s). Either player can call it off (both stakes returned); a room nobody completes is refunded after 10 minutes.
- Redeploy `api/battle.js` (no rules change).

## HB1 Semester 1 courses (from GrAte_Apex_Hub_3_1.zip)
Eight courses for **HB1 · Semester 1** (HB2 students see them in the "HB1 courses" list): Biological Chemistry (`biolchem`), Basic Medical Genetics (`medgen`), Computer Appreciation (`compapp`), Algebra (`algebra`), Statistical Methods (`stats`), Communication Skills (`commskills`), Basic Medical Chemistry (`bmc`), Cell Structure (`cellstruct`): 61 lessons, about 5,700 questions.
- Lessons: `content/lessons/<course>-NN.json` (made by `scripts/convert_hb1s1.py`, also handling the accordion sections and the plain "Study Notes" layout of Medical Genetics).
- Questions: `src/data/courses/<course>.json`: one Quiz per topic, a Guide Review Quiz and Past Questions sets (`scripts/build_hb1s1_questions.py`). Questions that need a typed number (about 350 in Algebra and Statistics) are left out because the app only has multiple choice.
- Access: `src/data/access.json`, `catalog.ts`, `lessonOpen` in `firestore.rules` (**re-publish the rules**) and `api/battle.js` know the new courses.
- **Load the lessons into Firestore:** `node scripts/seed-content.mjs ../serviceAccount.json` (or add a course name to load one, e.g. `... algebra`).

## Messages and sending posts
- **Community → ✉️ Messages**: one-to-one chats with friends (people who follow each other), text + photo/video, unread dot and count, notification (at most one per chat every 10 minutes). Long-press your own message to delete it. Data: `chats/{uidA_uidB}` + `chats/{id}/messages`.
- **Send** button on every post (Feed and Community): choose a friend or a study group, add an optional note, and the post arrives as a card in that chat.
- **Re-publish `firestore.rules`** (new `chats` rules, `message` notifications, shared posts in group chats).

## Chat: read receipts, replies, forwarding, voice messages
- **Read receipts** (DMs): your messages show ✓ (sent) and ✓✓ Seen once the friend has opened the chat (`chats/{id}.seen`).
- **Reply**: long-press a DM → Reply. The quoted message appears inside the new bubble (DMs only).
- **Forward**: long-press any DM or group message → Forward, then pick a friend or group. Forwarded messages carry a "↪ Forwarded" label; voice messages can be forwarded too.
- **Voice messages**: tap 🎤 (when the text box is empty), record up to 2 minutes, Send. Works in DMs and groups. Recording is web-only (MediaRecorder); native needs `expo-audio`. Audio uploads to Cloudinary.
- Re-publish `firestore.rules` (new `audio`, `reply`, `fwd` message fields).

## Audio calls, documents, profile pictures in Messages
- **Audio calls** (web only): 📞 in a chat header rings that friend. WebRTC peer-to-peer, signalled through `calls/{id}` in Firestore; STUN is Google's free server, so it costs nothing. The friend sees the incoming-call screen while the app is open (if it's closed they get the usual "is calling you" notification/push). Some strict networks (certain mobile carriers) can't connect without a TURN relay; optionally set `EXPO_PUBLIC_TURN_URL`, `EXPO_PUBLIC_TURN_USER`, `EXPO_PUBLIC_TURN_CRED` (e.g. a free Metered account) in Vercel and redeploy.
- **Documents**: 📎 in DMs and groups sends PDF/Word/PowerPoint/Excel/etc. (max 10 MB) via Cloudinary; forwardable. If PDFs/zips won't open, in Cloudinary → Settings → Security enable "PDF and ZIP files delivery". Uses `expo-document-picker` (run `npm install`).
- **Messages page** shows profile pictures; tap one to enlarge it. The photo button is now 🖼️.
- Re-publish `firestore.rules` (new `calls` collection and `doc` field).

- Chats now open full-screen (over the tab bar and bell) so they fit phones; the composer buttons are tighter.

- Voice messages play through a plain audio element on web (original file first, Cloudinary mp3 conversion as fallback). The `calls` read rule was rewritten so the "who is calling me" query is allowed; re-publish firestore.rules.

- Chat view re-subscribes after each send and retries while the chat does not exist yet, so a new message always appears straight away.

- Voice recordings are converted in the browser to 16 kHz mono WAV before upload (plays in every browser). Messages recorded before this version may still not play on some devices; re-record them.

- Incoming calls no longer depend on the receiving device clock (a PC with a drifting clock treated calls as stale); closing the tab hangs up.

- Incoming calls ring (tone, flashing tab title, desktop notification if the tab is hidden); Messages shows a "📞 Incoming calls: …" line when the listener is not running, to diagnose why a device is not receiving.

## Fonts
Poppins for headings, labels and anything bold (weight 600+); Roboto for body text and inputs. Set in `src/Text.tsx`; fonts loaded in `App.tsx` (`@expo-google-fonts/roboto`, run `npm install`).

## Calls like WhatsApp (group calls) and 24-hour chat times
- Full-screen call screen: ring a friend, then ➕ **Add** more friends while on the call (up to 6). Mute, End, per-person status (Calling… / Connecting… / Connected / Left / Declined), call timer, ringtone for the person being called. Everyone connects directly to everyone (WebRTC mesh); Firestore only carries the hand-shake (`calls/{id}` with `peers` and `signals`, invites in `users/{uid}/callInvites`).
- Chat message times are 24-hour ("14:32", "Mon 14:32", "12 Sep 14:32"); the inbox shows the time of the last message.
- **Re-publish `firestore.rules`** (the `calls` rules changed, new `callInvites` rules). Both people need the latest deploy to call each other.

## More classes, badge, story swipes
- New classes **HB3, MB1, MB2, MB3** (chosen at sign-up like HB1/HB2). HB2, HB3 and MB1-MB3 can open every HB1 and HB2 course (`ADVANCED` in `src/data/catalog.ts`, mirrored in `api/_lib.js` and `firestore.rules` `lessonOpen`). Classes with no courses of their own see the HB1/HB2 revision courses straight away on the Study page.
- The 💬 Community icon (phone bar and desktop sidebar) shows a red count of conversations with unread messages.
- Stories: swipe left for the next person's story, swipe right for the previous one, swipe down to close; taps still go story by story.
- `lessons` list rule is now open to signed-in students (titles only; a per-course rule on the id can't be used for a list query). Lesson bodies (`lessonContent`) stay locked by course. Re-publish `firestore.rules`.

## Reactions, typing indicator, streak reminders

- **Reactions**: long-press a message (DMs and groups) → pick 👍 ❤️ 😂 😮 😢 🙏. Tap your own chip to remove it. Needs the latest `firestore.rules` published.
- **Typing indicator**: DMs only. Shows "typing…" under the friend's name for a few seconds. Needs the chat to exist (after the first message).
- **Streak reminders**: Vercel cron calls `/api/reminders` daily at 17:00 UTC (= 5 pm Ghana). It pushes "🔥 Your N-day streak ends tonight!" to students who have a live streak and haven't studied today.
  - Add env var `CRON_SECRET` in Vercel (any long random string), then redeploy. VAPID keys must be set too.
  - Only students with push enabled get reminders. They can opt out in You → "Daily streak reminder".
  - Test: `curl -H "Authorization: Bearer $CRON_SECRET" "https://grate-apex-hub.vercel.app/api/reminders?dry=1"` (counts only, sends nothing).

## Calls that ring like WhatsApp (even when the app is closed)
- **Rings when the app is closed**: starting a call now sends a dedicated high-priority push (`/api/callpush`, 45 s lifetime) that stays on screen, vibrates, and has **Answer** / **Decline** buttons. Answer opens the app and picks up straight away; tapping the notification body opens the usual ring screen. If the caller hangs up first, the ringing notification is replaced by **Missed call** (a cancel push). Needs push set up as before (VAPID keys) and the friend must have turned notifications on.
- **Caller hears a ringing tone** until the friend answers; the incoming phone also vibrates.
- **Busy**: if your friend is already on a call, you see "They're on another call." straight away instead of waiting 45 s.
- **Reconnecting**: on a network drop or wifi↔data switch the call tries to reconnect (ICE restart) and shows "Reconnecting…"; the timer keeps counting.
- Screen stays awake during a call (where the browser supports it).
- Nothing new to configure in Firestore (no rules change). Re-deploy so `public/sw.js` and `api/callpush.js` go live; people may need to reopen the app once to pick up the new service worker.
- Still web only (installed PWA or browser). A phone can't be woken with a full-screen ring while locked from a web app; that needs a native app with CallKit/ConnectionService.
