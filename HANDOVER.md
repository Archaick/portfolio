# Portfolio — handover

Saeed Hareez's personal portfolio. This file is the brief for whoever builds it
(a new Claude session opened in this folder). Read it fully before starting.

## Who it is for

Saeed is the **sole developer** of every project below and the **co-founder of JISR**.
The page is for clients, partners, institutions and opportunities: people who give
it 10–30 seconds, often on a phone, opened from a WhatsApp or LinkedIn link.

## Decisions already made (don't reopen them)

- **One-page landing page**, not a desktop/OS-style site (that idea was considered
  and dropped: it hides the work behind clicks and needs a second phone version).
- **Stand out through content and one signature moment**, not gimmicks:
  - Hero: a calm **night-to-dawn sky that follows the local time in Indonesia**
    (Saeed's thread from the /guru learning app he built). Subtle. **No flashing,
    no fast twinkling** — the page may be shown on projectors.
  - Projects as **case studies, not thumbnails**: the problem, what he built, one
    big outcome number, screenshots, "Visit live" button.
  - Optional small live touch: e.g. a tiny working demo of the Qur'an recitation
    player with the ayah highlighted.
- **Look:** navy and gold, clean, generous spacing. **Avoid geometric / star
  decorative patterns** (stars in a sky are fine; Islamic-star tile patterns are not).
  **No human-like illustrated characters.**
- **Privacy:** screenshots must use **demo data or be blurred** — no real teachers',
  students' names, emails or school codes from the live apps.

## Stack and setup (done)

- Vite + React 19, plain CSS (no UI library yet; add one only if it earns its place).
- `firebase.json`: Firebase Hosting serving `dist/`, SPA rewrite, long cache for
  `/assets/**`, no-cache for HTML/JSON.
- `npm run deploy` = build + `firebase deploy --only hosting`.
- `.firebase/` and `.env*` are git-ignored.
- GitHub: https://github.com/Archaick/portfolio (branch `main`, pushed).

## Still to do before going live

1. **Create the Firebase project — ask Saeed first.** Name options he was given:
   `saeed-hareez` (→ `saeed-hareez.web.app`, recommended) or `archaick`. Then add
   `.firebaserc` with it as `default`. Hosting is free.
2. **Own domain (later):** recommended to buy his name (e.g. `saeedhareez.com`) and
   connect it in Firebase Hosting. Not bought yet.
3. **Deploy only when Saeed asks** (in his other projects he says "sync deploy").

## Inputs Saeed will provide

- **His resume** — he will drop it into this folder. Use it as the main source for
  the About, experience and skills sections. Ask before publishing a downloadable
  copy, and leave out home address, ID numbers or anything private.
- Languages: English only, or English + Indonesian + Arabic (Arabic needs proper RTL).
- Public contact links (email, WhatsApp, LinkedIn, GitHub `Archaick`).
- Screenshots / outcome numbers per project (or permission to make demo screenshots).

## Content plan (one page, in this order)

1. **Hero** — name, one line such as "Founder-developer building learning platforms
   for Qur'anic education", contact / GitHub / LinkedIn buttons, the sky.
2. **JISR (flagship)** — co-founder; ~160 active students (his figure). Live:
   `ar-jisr.web.app`. Confirm what to say about it with him.
3. **Markaz Tadarus** — `markaztadarus.com`. Public site plus internal tools and the
   **Belajar 5T** teacher learning platform: schools with join codes and admin
   approval, sections with quizzes (10+ question types), Qur'an recitation ayah by
   ayah with live highlighting and reciter choice, progress tracking, audit history
   and recycle bin, "view as teacher". Three languages (ID / EN / AR, full RTL).
   Vite, React, Mantine, Firebase (Firestore rules, Hosting), PWA.
4. **Markaz Al-Hijaz** — Next.js (static export), next-intl, Firebase; institute
   site with admin tools (news, forms, activity logs).
5. **Four Steps app** and **Tadarus Anak** (children's learning platform) — include
   if Saeed wants them; confirm details with him.
6. **Skills** — React, Next.js, Firebase, multilingual and RTL sites, PWAs, admin
   systems with audit trails and role-based access.
7. **Contact.**

Facts above came from working on his codebases; anything not confirmed by Saeed
(numbers, project descriptions, "Tadarus Build" and Four Steps details) should be
checked with him before publishing.

## Working with Saeed

- Recommend one clear option instead of listing many; he tires of long option lists.
- Show visual changes with a screenshot before asking him to deploy.
- Keep the page fast: small images (compress every image), no heavy libraries.
