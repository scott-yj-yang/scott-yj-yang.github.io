# Personal Website Revamp — Design Spec

**Author:** Yuanjia (Scott) Yang
**Date:** 2026-04-15
**Status:** Draft → awaiting user review
**Target repo:** `scott-yj-yang.github.io` (existing; will be rewritten in place)
**Target domain:** `https://scottyang.org` (Cloudflare Registrar → GitHub Pages)

---

## 1. Purpose

Replace the outdated al-folio Jekyll site with a modern, content-focused personal website that:

- Represents Yuanjia (Scott) Yang as a first-year Neurosciences PhD student in the Talmo Pereira Lab at the Salk Institute.
- Showcases real research (MIMIC-MJX, VNL-Ray, etc.) instead of al-folio's placeholder Einstein content.
- Surfaces "live" current work via a writing blog, a `/now` page, and an auto-updating publications list.
- Includes light interactive elements for research figures and links out to the existing MIMIC-MJX demo site.
- Deploys to GitHub Pages at `scottyang.org`.

**Primary audience:** PIs and senior researchers (A) + NeuroAI peers and grad community (B). Tone is scholarly and publication-forward but approachable — demo-rich, not stuffy.

---

## 2. Identity and Branding

| Field | Value |
|---|---|
| Display name (hero, page title, OG meta) | **Yuanjia (Scott) Yang** |
| Secondary line | *a.k.a. Rheya* |
| Role | PhD student · Neurosciences (NGP) · UC San Diego |
| Lab | Talmo Pereira Lab · Salk Institute for Biological Studies |
| Publishing name (bibliography, citations, structured data) | **Yuanjia Yang** |
| Primary email | `yuy004@ucsd.edu` |
| Funding acknowledgment | NIH BRAIN U01 (1U01NS136507), surfaced in footer |

**Aesthetic direction:** "Modern Minimal"
- Sans-serif typography — **Inter** via `@fontsource/inter`, system fallback.
- Accent color: **lavender `#a78bfa`** (Tailwind `violet-400`). Echoes the hero photo without being literal.
- Generous whitespace, scannable, contemporary ML-researcher feel.
- Interest chips, section headings in small-caps uppercase eyebrows.
- Dark mode toggle (persisted; respects `prefers-color-scheme` on first visit).

**Hero photo:** `assets/img/scott-hero.jpg` (sourced from existing `9E4A8684.jpg`, resized to responsive variants at build time).

**Bio copy (home hero):**

> I'm a first-year Neurosciences PhD student at UC San Diego, working in Talmo Pereira's lab at the Salk Institute. I build neuromechanical simulation tools that let virtual animals learn naturalistic behavior — bridging deep reinforcement learning, biomechanics, and motor neuroscience. I'm interested in how the body's physical constraints shape what neural circuits need to compute, and what that means for how we model embodied control.

**Interest chips:** `neuroAI` · `motor control` · `biomechanics` · `deep RL` · `virtual rodents`

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro 5.x** | Content-first static site generator; MDX support; Islands Architecture for selective interactivity; fast builds; GitHub Pages compatible. |
| Content authoring | **MDX** via `@astrojs/mdx` | Lets us embed React/Svelte components inside markdown for interactive figures. |
| Styling | **Tailwind CSS 4** via `@astrojs/tailwind` | Coherent design tokens, trivially easy dark mode, utility-first keeps CSS out of components. |
| Typography | **Inter** via `@fontsource-variable/inter` | Modern sans-serif, excellent screen rendering, wide weight range. |
| Interactive islands | **React** via `@astrojs/react` | For sliders, tabs, and small interactive plots. SSR by default, hydrated only where needed. |
| Plots / charts | **Observable Plot** or **Plotly.js** (loaded on demand) | For research figures in writing posts. |
| Citations / bibliography | Small BibTeX parser (e.g. `@citation-js/core`) or hand-authored MDX | Imports `content/bibliography.bib` for the research page. |
| Icons | **Lucide** (`lucide-react` / SVG sprite) | Consistent icon set, tree-shakeable. |
| Search (optional, v2) | **Pagefind** | Static full-text search. Deferred to post-launch. |
| Deployment | **GitHub Pages** via GitHub Actions | Free, already owned repo; build Astro → publish `dist/` on push to `main`. |
| Domain | **scottyang.org** | Cloudflare Registrar + Cloudflare DNS → GitHub Pages. |

**Explicitly out of scope / rejected:**
- Next.js / SvelteKit (overkill for mostly-static content).
- Quarto (user does not need notebook-native authoring).
- Server-side rendering at runtime (GitHub Pages is static-only).
- Heavy 3D demos in-tree (the existing MIMIC-MJX demo site is linked out).
- Custom CMS, headless CMS, databases.

---

## 4. Site Map

```
/                       → Home (hero, bio, selected work, recent)
/research               → Publications + Talks + Research Code
/projects               → Grid of side projects (vibe-coded)
/projects/[slug]        → Individual project detail (optional MDX)
/writing                → Blog list, newest first
/writing/[slug]         → Individual writing post (MDX)
/now                    → "What I'm currently working on / reading"
/cv                     → Rendered CV + PDF download
/404                    → Custom 404
```

Footer (on every page): email · GitHub · Google Scholar · LinkedIn · Bluesky (if user has handle) · ORCID (if user has ID) · funding acknowledgment · © year.

Header (on every page): brand wordmark + nav (`research / projects / writing / now / cv`) + dark mode toggle.

**Brand wordmark style:** stylized lowercase `yuanjia yang` in the header nav (deliberate: sets a contemporary, ML-researcher-blog tone). This is **distinct from** the formal display name `Yuanjia (Scott) Yang` used in the hero, page `<title>`, Open Graph meta, and structured data. The formal display name is what shows up in search results and social previews.

---

## 5. Content Model

Astro Content Collections under `src/content/`:

### `papers/`

One MDX file per paper. Frontmatter schema:

```yaml
title: MIMIC-MJX: Neuromechanical Emulation of Animal Behavior
authors:
  - { name: "C.Y. Zhang", isSelf: false, isCoFirst: true }
  - { name: "Y. Yang", isSelf: true, isCoFirst: true }
  - { name: "A. Sirbu", isSelf: false }
venue: Under Review at Nature Methods
year: 2025
month: 11
status: under-review     # under-review | published | preprint | thesis | workshop
selected: true
bibtex_key: zhang2025mimicmjx
pdf: /papers/mimic-mjx.pdf
code: https://github.com/talmolab/track-mjx
demo: https://mimic-mjx.example.com
arxiv: https://arxiv.org/abs/...
doi:
funding: [ "NIH BRAIN U01 (1U01NS136507)" ]
tags: [ neuroAI, pose-estimation, biomechanics, imitation-learning ]
```

**Launch content** (three entries, populated from CV):

1. **MIMIC-MJX: Neuromechanical Emulation of Animal Behavior** — Zhang*, Yang*, Sirbu et al. — Under Review at Nature Methods — Nov 2025 — `selected: true`
2. **Massively Parallel Imitation Learning of Mouse Forelimb Musculoskeletal Reaching Dynamics** — Leonardis, Nagamori, Thanawalla, Yang, et al. — NeurIPS Workshop — 2025
3. **VNL-Ray: Biomechanically Realistic Virtual Rodent Behavior and Task Learning** — Yang — UCSD Master's Thesis — Mar 2025

### `talks/`

One MDX file per poster/talk. Frontmatter:

```yaml
title: MIMIC-MJX: Neuromechanical imitation of animal behavior enables flexible models of embodied control
venue: Cosyne 2026
city: Lisbon          # placeholder, user to confirm
date: 2026-03-01
kind: poster          # poster | talk | invited
poster: /posters/cosyne2026-mimicmjx.pdf
slides:
```

**Launch content** (five entries, from CV):

1. Cosyne 2026 — MIMIC-MJX poster
2. Cosyne 2026 — Musculoskeletal Imitation Learning poster
3. SfN 2025 — VNL-Playground poster
4. Cosyne 2025 — Biomechanical actuation poster
5. Cosyne 2024 — Biomechanical actuators poster

### `projects/`

Card grid on `/projects`. Each MDX file frontmatter:

```yaml
title: meeting-scribe
blurb: Automatic meeting transcription and summary CLI.
repo: https://github.com/scott-yj-yang/meeting-scribe
demo:
cover: /projects/meeting-scribe.png
tags: [ CLI, LLM, audio ]
date: 2025-06-01
draft: false
```

**Launch content** (six personal projects): `meeting-scribe`, `sweep-dashboard`, `LatePenalty`, `estrapatch`, `new-prompt`, `costco-receipt-splitter`. Blurbs: user will provide, or I will draft one-liners from the GitHub READMEs during implementation for user review.

### `research-code/`

A separate small collection for lab/research tooling shown on the `/research` page (not `/projects`):

- `talmolab/track-mjx`
- `talmolab/stac-mjx`
- `talmolab/vnl-playground`
- `FleischerResearchLab/CanvasGroupy`
- `FleischerResearchLab/group-signup`

Same card schema as `projects/` but rendered in a smaller grid beneath the Talks section on `/research`.

### `writing/`

One MDX per post. Frontmatter:

```yaml
title: Why biomechanics belongs in pose estimation
date: 2026-04-20
tags: [ research, pose-estimation ]
excerpt: A short note on why we built MIMIC-MJX the way we did.
draft: false
cover:
```

**Launch content:** empty. A skeleton `_template.mdx.example` ships with the repo for user reference.

### `news/`

Tiny markdown snippets for the home page "Recent" ticker. Each file has `date`, `kind` (post | talk | paper | misc), and one-line content with optional link.

---

## 6. Page Layouts

### 6.1 Home (`/`)

Top-to-bottom:

1. **Header** — brand + nav + dark mode toggle.
2. **Hero** (two-column on desktop, stacked on mobile):
    - Left: name block (`Yuanjia (Scott) Yang` with lavender accent on "(Scott)"), `a.k.a. Rheya` line, role line (`PhD student · Neurosciences · UC San Diego`), bio paragraph, interest chips.
    - Right: circular-framed hero photo.
3. **Selected Work** section — 2–3 papers from `papers/` where `selected: true`. Each entry: title, authors (self bolded), venue + status + year, action buttons (Live demo / PDF / Code / BibTeX).
4. **Recent** section — 3 most recent items from `news/`. Green live-dot for items tagged "current". Link to `/writing` at the bottom.
5. **Footer** — socials + funding line + © year.

Scale: targets a single-viewport "above the fold" view of the hero on a 14" laptop; everything else scrolls.

### 6.2 Research (`/research`)

1. **Publications** — grouped by year, newest first. Selected papers pinned above the year list. Each entry same card shape as home. BibTeX button pops a copyable modal or anchor link to `bibliography.bib`.
2. **Talks** — timeline of 5 posters, newest first. Venue, date, 1-line description, link to poster PDF.
3. **Research Code** — grid of the 5 lab/research repositories. Each card: repo name, short blurb, tags, "View on GitHub" button.

### 6.3 Projects (`/projects`)

Card grid (3 columns desktop / 1 mobile) of the 6 personal projects. Each card: cover image or gradient placeholder, title, blurb, tags, GitHub button. Card click goes to `/projects/[slug]` for a longer write-up if one exists; otherwise opens the repo.

### 6.4 Writing (`/writing`, `/writing/[slug]`)

- List view: reverse chronological, title / date / tags / excerpt. No cover images by default.
- Post view: prose column (`max-width: 68ch`), MDX supports embedded React components for figures. Table of contents on wide screens if the post has >2 `h2`. Prev/next links at the bottom.

### 6.5 Now (`/now`)

Single `src/pages/now.mdx` file, rendered in prose column. Sections: *Currently working on*, *Reading*, *Recent talks*, *Last updated*. One file to edit, deliberate low-commitment.

### 6.6 CV (`/cv`)

Rendered from structured data mirroring the CV PDF, with sections: *Education*, *Publications*, *Talks*, *Research Experience*, *Teaching & Mentorship*, *Technical Skills*, *Honors & Awards*. Prominent "Download PDF ↓" button at top right, linking `/cv/Yuanjia-Scott-Yang-CV.pdf` (copied from existing `Yuanjia(Scott)_Yang_CV.pdf` with a URL-safe filename).

The rendered CV and the PDF are maintained side-by-side for launch; keeping them in sync is an explicit user chore. An "autogenerate PDF from rendered CV" mechanism is explicitly out of scope for v1.

---

## 7. Interactive Elements

Scope for v1 (per user: "light interactive"):

- **Responsive plots** via Observable Plot or Plotly — used inside writing posts to show research figures that readers can hover/zoom. Loaded only on posts that use them.
- **Small React "islands"** for sliders, toggles, image comparisons. Available to MDX authors as `<Slider>`, `<BeforeAfter>`, `<Figure caption=...>`.
- **Link-out hero demo** for MIMIC-MJX — a prominent "Try the live demo →" button on the paper card routes to the existing MIMIC-MJX demo site (URL to be provided by user).

Explicitly out of scope for v1:
- In-tree 3D viewers (three.js / Babylon).
- Realtime data fetching.
- Notebook rendering in-place (user doesn't want Quarto).

---

## 8. Semi-Automated Publications Sync

The primary source of truth for publications is `src/content/papers/*.mdx`, hand-authored. An optional helper script reduces the chore of keeping it in sync with the outside world.

**Why not scrape Google Scholar?** Google Scholar has no public API, scraping is fragile and against ToS, and Scholar scrapers break often enough that wiring them into a build is not worth the operational cost. Instead we use one of two well-behaved public APIs:

- **Semantic Scholar Graph API** (preferred default) — free, no API key required for modest usage, returns authored papers by name with DOIs, venues, and coauthors.
- **OpenAlex API** (fallback / alternate) — free, no key, very complete, keyed by ORCID when available. Becomes the preferred source if the user provides an ORCID.

**Script:** `scripts/fetch-publications.ts`

1. Queries the chosen API for the user's authored papers.
2. For each returned paper, checks whether a matching entry already exists in `src/content/papers/` by `doi` or normalized title match.
3. For each new paper, writes a stub MDX file with fields populated where available, frontmatter `draft: true`, so it does not render on the public site until the user edits and sets `draft: false`.
4. Prints a short diff summary (`N new stubs written, M existing entries unchanged`).

**Runs opt-in**, not on every build: invoked via `pnpm run fetch-pubs`. Keeping it out of CI keeps the production build deterministic and immune to API flakiness. Failure modes (network error, API rate limit, zero results) exit gracefully with a non-zero status and a short message; they do not corrupt existing files.

The user's Google Scholar ID (`bjZuYAwAAAAJ`) is kept in the spec and on the `/research` page as a link, but is not used for automated sync.

---

## 9. Dark Mode

- Toggle in the header (sun / moon icon).
- Implementation: Tailwind `dark:` variant + `<html class="dark">` toggled by a tiny inline script in `<head>` to avoid FOUC.
- Persistence: `localStorage["theme"] = "dark" | "light"`.
- First visit: respects `prefers-color-scheme: dark` media query.
- Accent color `#a78bfa` works on both themes; background flips from near-white `#fafafa` to near-black `#0a0a0a`, surfaces from `#ffffff` to `#18181b`.

---

## 10. Deployment: GitHub Pages + Custom Domain

### Repository

Reuse existing `scott-yj-yang/scott-yj-yang.github.io`. Archive the current al-folio Jekyll site to a branch `legacy-jekyll` before the rewrite begins.

### Build & Publish

`.github/workflows/deploy.yml`:

- Triggers: push to `main`, manual `workflow_dispatch`.
- Steps: checkout → setup-node → `pnpm install` → `pnpm build` → upload `dist/` as Pages artifact → deploy.
- Uses official `actions/upload-pages-artifact` + `actions/deploy-pages`.
- Build output: `dist/`.
- No Jekyll processing (add empty `.nojekyll` file to repo root so GitHub Pages serves Astro output verbatim).

### Custom Domain (`scottyang.org`)

**In the repo:**
- File `public/CNAME` containing exactly: `scottyang.org`
- GitHub repo settings → Pages → Custom domain: `scottyang.org` → enable "Enforce HTTPS".

**In Cloudflare DNS (user action):**
- Add `A` records for `scottyang.org` (apex) pointing to GitHub Pages IPs:
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`
- Add `CNAME` record: `www` → `scott-yj-yang.github.io`
- Cloudflare proxy: **DNS-only (grey cloud)** for the apex A records during initial setup so GitHub Pages can issue the HTTPS cert. Can optionally be switched to proxied (orange cloud) after the cert is live.
- SSL/TLS mode in Cloudflare: **Full** (not "Full (strict)") while GitHub Pages is serving; or DNS-only and let GitHub Pages handle TLS end-to-end.

Document these exact steps in the repo's README during implementation.

---

## 11. Accessibility and Performance

**A11y targets:**
- All interactive elements keyboard-navigable.
- Focus rings (do not suppress).
- Color contrast AA on both themes (lavender against dark + light backgrounds both pass when used as accent, not body text).
- Alt text on every image.
- Semantic headings (one `h1` per page).
- `prefers-reduced-motion` respected for any transitions.

**Performance targets:**
- Lighthouse Performance ≥ 95 on the home page.
- Total home page weight < 300 KB (incl. hero photo, which will be served as responsive `avif`/`webp` via Astro's `<Image>`).
- No blocking JS on non-interactive pages.

---

## 12. Migration and Content Cleanup

**Preserved / migrated from the existing Jekyll site:**
- `_bibliography/papers.bib` → rewritten as `content/bibliography.bib` with real entries (drop all Einstein placeholders).
- `9E4A8684.jpg` → `src/assets/scott-hero.jpg`, resized.
- `Yuanjia(Scott)_Yang_CV.pdf` → `public/cv/Yuanjia-Scott-Yang-CV.pdf`.
- Any still-useful content from old `_projects/` MDX files.

**Dropped:**
- al-folio theme and all its plugins / Gemfile / Jekyll config.
- `_pages/office_hour.md`, `_pages/tutor.md`, `_pages/repositories.md`.
- Old `_news/*.md` entries (replaced with fresh current news).
- All Einstein placeholder bibliography entries.
- Docker / Dockerfile (unused).

**Legacy branch:** Before rewriting, create `git branch legacy-jekyll` from current `main` so the old site remains recoverable.

---

## 13. Project Layout

```
scott-yj-yang.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .nojekyll
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── CNAME                             # scottyang.org
│   ├── favicon.svg
│   ├── cv/
│   │   └── Yuanjia-Scott-Yang-CV.pdf
│   └── posters/                          # poster PDFs
├── src/
│   ├── assets/
│   │   └── scott-hero.jpg
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ThemeToggle.astro
│   │   ├── PaperCard.astro
│   │   ├── ProjectCard.astro
│   │   ├── TalkEntry.astro
│   │   ├── NewsItem.astro
│   │   ├── Chip.astro
│   │   └── mdx/
│   │       ├── Figure.tsx
│   │       ├── Slider.tsx
│   │       └── BeforeAfter.tsx
│   ├── content/
│   │   ├── config.ts                     # Zod schemas for collections
│   │   ├── papers/
│   │   ├── talks/
│   │   ├── projects/
│   │   ├── research-code/
│   │   ├── writing/
│   │   ├── news/
│   │   └── bibliography.bib
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PostLayout.astro
│   │   └── ProseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── research.astro
│   │   ├── projects/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── writing/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── now.mdx
│   │   ├── cv.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css
├── scripts/
│   └── fetch-publications.ts             # opt-in Scholar scraper
└── README.md
```

---

## 14. Open Decisions (deferred to implementation, not blocking spec approval)

These are questions we can answer inline while building without redesigning anything:

- **Bluesky / ORCID handles** — add if user provides, skip otherwise.
- **Project card blurbs** — user to provide, or assistant drafts from each repo's README for user approval.
- **Writing section launch post** — first post can be a Cosyne 2026 recap or a MIMIC-MJX explainer. Empty at launch is also acceptable.
- **Specific city for each Cosyne / SfN venue** — user to confirm or I look up publicly.
- **Talmo lab logo / Salk badge** — optional affiliation badge on home hero; default is text only.
- **Favicon** — default is `scottyang.org`'s first letter on a lavender background, SVG. User can swap.
- **Funding placement** — footer text `Research supported by NIH BRAIN U01 (1U01NS136507)`. User can promote it to about page if preferred.

---

## 15. Non-Goals / Explicitly Deferred to v2

- Full-text search (Pagefind).
- Comments on writing posts.
- RSS feed for writing (trivial to add later if desired).
- i18n (English only at launch).
- An in-tree MIMIC-MJX demo — the existing demo site is linked out.
- Newsletter signup.
- Analytics (deferred pending a privacy-respecting choice like Plausible or Umami).

---

## 16. Success Criteria

The revamp is considered complete when:

1. `https://scottyang.org` resolves over HTTPS and serves the new site.
2. All six pages (`/`, `/research`, `/projects`, `/writing`, `/now`, `/cv`) render without errors on desktop and mobile.
3. Home page shows the real hero, bio, interest chips, at least MIMIC-MJX as selected work, and at least three recent news items.
4. Research page shows all three papers and all five talks from the CV.
5. Projects page shows the six personal projects with blurbs and GitHub links.
6. CV page renders the same structure as the PDF and offers the PDF download.
7. Dark mode toggles cleanly with no FOUC.
8. Lighthouse Performance ≥ 95 and Accessibility ≥ 95 on the home page.
9. No placeholder Einstein content, no "incoming graduate student" copy, no dead links to removed pages.
10. Legacy `al-folio` branch exists at `legacy-jekyll` for recoverability.

---

## 17. Outstanding Content the User Still Needs to Provide

(Non-blocking for the spec, but will be needed during implementation.)

1. Existing MIMIC-MJX demo URL (for the "Live demo" button).
2. Bluesky handle, ORCID ID (if any).
3. Short blurbs for each of the six personal projects (or assistant drafts from READMEs for approval).
4. Cosyne / SfN venue cities if user wants them shown.
5. Optional: a first writing post (Cosyne 2026 recap is a natural fit).
6. Confirmation of the bio copy drafted in §2 — rewrite in own voice if desired.

---
