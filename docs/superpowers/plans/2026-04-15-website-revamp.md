# Personal Website Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated al-folio Jekyll site with a modern Astro-based static site deployed to `scottyang.org` via GitHub Pages.

**Architecture:** Astro 5 with MDX for content, Tailwind CSS 4 for styling, React islands for interactivity. Content Collections with Zod schemas for type-safe content. Static output deployed via GitHub Actions.

**Tech Stack:** Astro 5, MDX, Tailwind CSS 4, React 19, TypeScript, Inter font, Lucide icons, pnpm

**Spec:** `docs/superpowers/specs/2026-04-15-website-revamp-design.md`

---

## File Structure

```
scott-yj-yang.github.io/
├── .github/workflows/deploy.yml
├── .gitignore
├── .nojekyll
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── CNAME
│   ├── favicon.svg
│   └── cv/Yuanjia-Scott-Yang-CV.pdf
├── src/
│   ├── assets/scott-hero.jpg
│   ├── components/
│   │   ├── Chip.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── NewsItem.astro
│   │   ├── PaperCard.astro
│   │   ├── ProjectCard.astro
│   │   ├── TalkEntry.astro
│   │   └── ThemeToggle.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── news/
│   │   ├── papers/
│   │   ├── projects/
│   │   ├── research-code/
│   │   ├── talks/
│   │   └── writing/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PostLayout.astro
│   │   └── ProseLayout.astro
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── cv.astro
│   │   ├── index.astro
│   │   ├── now.mdx
│   │   ├── research.astro
│   │   ├── projects/index.astro
│   │   ├── projects/[slug].astro
│   │   ├── writing/index.astro
│   │   └── writing/[slug].astro
│   └── styles/global.css
└── scripts/fetch-publications.ts
```

---

### Task 1: Archive legacy Jekyll site and scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/styles/global.css`
- Delete: all Jekyll files (`_config.yml`, `Gemfile`, `Dockerfile`, `_sass/`, `_includes/`, `_layouts/`, `_plugins/`, `_pages/`, `_projects/`, `_news/`, `_bibliography/`, `_data/`, `assets/`, `bin/`, `404.html`, `robots.txt`, `CONTRIBUTING.md`, `README.md`, `.all-contributorsrc`, `.github/`)

- [ ] **Step 1: Create legacy-jekyll branch**

```bash
cd /Users/scottyang/Developer/scott-yj-yang.github.io
git branch legacy-jekyll
```

This preserves the old site for recoverability.

- [ ] **Step 2: Stash assets we need to keep, then delete all Jekyll files**

Copy the photo and CV to a temp location, then remove everything except `.git`, `.gitignore`, and `docs/`:

```bash
mkdir -p /tmp/site-migration
cp 9E4A8684.jpg /tmp/site-migration/scott-hero.jpg
cp "Yuanjia(Scott)_Yang_CV.pdf" /tmp/site-migration/Yuanjia-Scott-Yang-CV.pdf

git rm -r _config.yml Gemfile Dockerfile _sass _includes _layouts _plugins _pages _projects _news _bibliography _data assets bin 404.html robots.txt CONTRIBUTING.md README.md .all-contributorsrc .github
git rm -f "9E4A8684 copy.jpg" 2>/dev/null || true
```

- [ ] **Step 3: Initialize Astro project in-place**

```bash
pnpm init
pnpm add astro@latest
pnpm add -D typescript
```

- [ ] **Step 4: Create `astro.config.mjs`**

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://scottyang.org",
  output: "static",
});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Create minimal `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yuanjia (Scott) Yang</title>
  </head>
  <body>
    <h1>Yuanjia (Scott) Yang</h1>
    <p>Site under construction.</p>
  </body>
</html>
```

- [ ] **Step 7: Add scripts to `package.json`**

Ensure `package.json` has:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
pnpm dev
```

Expected: Astro dev server starts at `localhost:4321`, shows "Yuanjia (Scott) Yang" heading. Stop the server after confirming.

- [ ] **Step 9: Verify build succeeds**

```bash
pnpm build
```

Expected: `dist/` directory created with `index.html`.

- [ ] **Step 10: Update `.gitignore` for Astro**

Replace contents of `.gitignore` with:

```
node_modules/
dist/
.astro/
.DS_Store
.superpowers/
*.env
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: archive Jekyll, scaffold Astro project"
```

---

### Task 2: Install Tailwind CSS 4, React, MDX, and Inter font

**Files:**
- Modify: `astro.config.mjs`, `src/styles/global.css`, `src/pages/index.astro`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add @astrojs/mdx @astrojs/react react react-dom
pnpm add -D @tailwindcss/vite tailwindcss @fontsource-variable/inter lucide-react
```

- [ ] **Step 2: Update `astro.config.mjs` with integrations and Tailwind vite plugin**

```javascript
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://scottyang.org",
  output: "static",
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";

@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --color-accent: #a78bfa;
  --color-accent-light: #c4b5fd;
  --color-accent-dark: #7c3aed;
}
```

- [ ] **Step 4: Update `src/pages/index.astro` to use Tailwind classes and import global CSS**

```astro
---
import "../styles/global.css";
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yuanjia (Scott) Yang</title>
  </head>
  <body class="bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
    <h1 class="text-4xl font-bold p-8">Yuanjia <span class="text-accent">(Scott)</span> Yang</h1>
    <p class="px-8 text-zinc-500">Site under construction.</p>
  </body>
</html>
```

- [ ] **Step 5: Verify**

```bash
pnpm dev
```

Expected: page renders with Inter font, "(Scott)" in lavender accent color. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind 4, React, MDX, Inter font"
```

---

### Task 3: Base layout, dark mode, Header, and Footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/ThemeToggle.astro`**

Inline script that runs before paint to prevent FOUC. Toggles `dark` class on `<html>`.

```astro
---
---
<button
  id="theme-toggle"
  aria-label="Toggle dark mode"
  class="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
>
  <svg id="icon-sun" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
  <svg id="icon-moon" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
</button>

<script is:inline>
  (function() {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.classList.toggle("dark", dark);

    function updateIcons() {
      const isDark = document.documentElement.classList.contains("dark");
      document.getElementById("icon-sun").classList.toggle("hidden", !isDark);
      document.getElementById("icon-moon").classList.toggle("hidden", isDark);
    }

    updateIcons();

    document.getElementById("theme-toggle").addEventListener("click", function() {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateIcons();
    });
  })();
</script>
```

- [ ] **Step 2: Create `src/components/Header.astro`**

```astro
---
import ThemeToggle from "./ThemeToggle.astro";

const navItems = [
  { label: "research", href: "/research" },
  { label: "projects", href: "/projects" },
  { label: "writing", href: "/writing" },
  { label: "now", href: "/now" },
  { label: "cv", href: "/cv" },
];

const currentPath = Astro.url.pathname;
---
<header class="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
  <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
    <a href="/" class="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
      yuanjia yang
    </a>
    <nav class="flex items-center gap-6">
      {navItems.map((item) => (
        <a
          href={item.href}
          class:list={[
            "text-sm transition-colors",
            currentPath.startsWith(item.href)
              ? "text-accent font-medium"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
          ]}
        >
          {item.label}
        </a>
      ))}
      <ThemeToggle />
    </nav>
  </div>
</header>
```

- [ ] **Step 3: Create `src/components/Footer.astro`**

```astro
---
const links = [
  { label: "email", href: "mailto:yuy004@ucsd.edu" },
  { label: "github", href: "https://github.com/scott-yj-yang" },
  { label: "scholar", href: "https://scholar.google.com/citations?user=bjZuYAwAAAAJ" },
  { label: "linkedin", href: "https://linkedin.com/in/scott-yang-aa03731b9" },
];
---
<footer class="border-t border-zinc-200 dark:border-zinc-800">
  <div class="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p>&copy; {new Date().getFullYear()} Yuanjia Yang</p>
      <div class="flex gap-4">
        {links.map((link) => (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
    <p class="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
      Research supported by NIH BRAIN U01 (1U01NS136507)
    </p>
  </div>
</footer>
```

- [ ] **Step 4: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import "@/styles/global.css";

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Yuanjia (Scott) Yang",
  description = "PhD student in Neurosciences at UC San Diego. NeuroAI, motor control, biomechanics.",
} = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <script is:inline>
      (function() {
        const stored = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (stored === "dark" || (!stored && prefersDark)) {
          document.documentElement.classList.add("dark");
        }
      })();
    </script>
  </head>
  <body class="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
    <Header />
    <main class="mx-auto max-w-3xl px-6 py-12">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Update `src/pages/index.astro` to use BaseLayout**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout>
  <h1 class="text-4xl font-bold">Yuanjia <span class="text-accent">(Scott)</span> Yang</h1>
  <p class="mt-2 text-zinc-500">Site under construction.</p>
</BaseLayout>
```

- [ ] **Step 6: Verify**

```bash
pnpm dev
```

Expected: page shows header with nav links, dark mode toggle works (click toggles between sun/moon, body background changes), footer with socials and funding line. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: base layout with header, footer, dark mode toggle"
```

---

### Task 4: Content collection schemas

**Files:**
- Create: `src/content/config.ts`, `src/content/papers/.gitkeep`, `src/content/talks/.gitkeep`, `src/content/projects/.gitkeep`, `src/content/research-code/.gitkeep`, `src/content/writing/.gitkeep`, `src/content/news/.gitkeep`

- [ ] **Step 1: Create `src/content/config.ts` with all Zod schemas**

```typescript
import { defineCollection, z } from "astro:content";

const papers = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    authors: z.array(
      z.object({
        name: z.string(),
        isSelf: z.boolean().default(false),
        isCoFirst: z.boolean().default(false),
      })
    ),
    venue: z.string(),
    year: z.number(),
    month: z.number().optional(),
    status: z.enum(["published", "under-review", "preprint", "thesis", "workshop"]),
    selected: z.boolean().default(false),
    bibtexKey: z.string().optional(),
    pdf: z.string().optional(),
    code: z.string().optional(),
    demo: z.string().optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    funding: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["poster", "talk", "invited"]),
    poster: z.string().optional(),
    slides: z.string().optional(),
    paper: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    repo: z.string(),
    demo: z.string().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const researchCode = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    repo: z.string(),
    tags: z.array(z.string()).default([]),
    org: z.string(),
  }),
});

const writing = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

const news = defineCollection({
  type: "content",
  schema: z.object({
    date: z.coerce.date(),
    kind: z.enum(["post", "talk", "paper", "misc"]),
  }),
});

export const collections = { papers, talks, projects, "research-code": researchCode, writing, news };
```

- [ ] **Step 2: Create `.gitkeep` placeholder files for each collection directory**

```bash
mkdir -p src/content/{papers,talks,projects,research-code,writing,news}
touch src/content/{papers,talks,projects,research-code,writing,news}/.gitkeep
```

- [ ] **Step 3: Verify**

```bash
pnpm build
```

Expected: build succeeds (empty collections are valid).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: content collection schemas for papers, talks, projects, writing, news"
```

---

### Task 5: Seed papers and talks from CV

**Files:**
- Create: `src/content/papers/mimic-mjx.mdx`, `src/content/papers/forelimb-imitation.mdx`, `src/content/papers/vnl-ray.mdx`, `src/content/talks/cosyne-2026-mimic.mdx`, `src/content/talks/cosyne-2026-muscle.mdx`, `src/content/talks/sfn-2025-vnl.mdx`, `src/content/talks/cosyne-2025-biomech.mdx`, `src/content/talks/cosyne-2024-actuators.mdx`
- Delete: `src/content/papers/.gitkeep`, `src/content/talks/.gitkeep`

- [ ] **Step 1: Create `src/content/papers/mimic-mjx.mdx`**

```mdx
---
title: "MIMIC-MJX: Neuromechanical Emulation of Animal Behavior"
authors:
  - { name: "C.Y. Zhang", isSelf: false, isCoFirst: true }
  - { name: "Y. Yang", isSelf: true, isCoFirst: true }
  - { name: "A. Sirbu", isSelf: false }
venue: Under Review at Nature Methods
year: 2025
month: 11
status: under-review
selected: true
code: https://github.com/talmolab/track-mjx
funding: ["NIH BRAIN U01 (1U01NS136507)"]
tags: [neuroAI, pose-estimation, biomechanics, imitation-learning]
---

Massively parallel imitation learning of mouse forelimb musculoskeletal reaching dynamics using neuromechanical emulation in MuJoCo-MJX.
```

- [ ] **Step 2: Create `src/content/papers/forelimb-imitation.mdx`**

```mdx
---
title: "Massively Parallel Imitation Learning of Mouse Forelimb Musculoskeletal Reaching Dynamics"
authors:
  - { name: "E. Leonardis", isSelf: false }
  - { name: "A. Nagamori", isSelf: false }
  - { name: "A. Thanawalla", isSelf: false }
  - { name: "Y. Yang", isSelf: true }
venue: NeurIPS Workshop
year: 2025
status: workshop
selected: false
tags: [imitation-learning, biomechanics, motor-control]
---

Physics-aware constraints promote naturalistic muscle activity in massively parallel musculoskeletal imitation learning.
```

- [ ] **Step 3: Create `src/content/papers/vnl-ray.mdx`**

```mdx
---
title: "VNL-Ray: Biomechanically Realistic Virtual Rodent Behavior and Task Learning via Deep Reinforcement Learning"
authors:
  - { name: "Y. Yang", isSelf: true }
venue: Master's Thesis, UC San Diego
year: 2025
month: 3
status: thesis
selected: false
tags: [deep-rl, virtual-rodent, biomechanics]
---

Master's thesis on distributed deep RL training for biomechanically realistic virtual rodent behavior using Ray and MuJoCo-MJX.
```

- [ ] **Step 4: Create all 5 talk files**

Create `src/content/talks/cosyne-2026-mimic.mdx`:

```mdx
---
title: "MIMIC-MJX: Neuromechanical imitation of animal behavior enables flexible models of embodied control"
venue: Cosyne 2026
date: 2026-03-01
kind: poster
paper: mimic-mjx
---
```

Create `src/content/talks/cosyne-2026-muscle.mdx`:

```mdx
---
title: "Musculoskeletal Imitation Learning: Physics-Aware Constraints Promote Naturalistic Muscle Activity"
venue: Cosyne 2026
date: 2026-03-01
kind: poster
---
```

Create `src/content/talks/sfn-2025-vnl.mdx`:

```mdx
---
title: "VNL-Playground: Fast and Biologically Realistic Virtual Environment for Simulating Animal Behavior"
venue: Society for Neuroscience (SfN) Annual Meeting
date: 2025-11-01
kind: poster
---
```

Create `src/content/talks/cosyne-2025-biomech.mdx`:

```mdx
---
title: "Examining the impact of biomechanical actuation on neural representations for embodied control"
venue: Cosyne 2025
date: 2025-03-01
kind: poster
---
```

Create `src/content/talks/cosyne-2024-actuators.mdx`:

```mdx
---
title: "The impact of biomechanical actuators on neural embodied control"
venue: Cosyne 2024
date: 2024-03-01
kind: poster
---
```

- [ ] **Step 5: Remove `.gitkeep` files from papers and talks directories**

```bash
rm src/content/papers/.gitkeep src/content/talks/.gitkeep
```

- [ ] **Step 6: Verify**

```bash
pnpm build
```

Expected: build succeeds. All content files validate against Zod schemas.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "content: seed 3 papers and 5 talks from CV"
```

---

### Task 6: Seed projects, research code, and news

**Files:**
- Create: 6 files in `src/content/projects/`, 5 files in `src/content/research-code/`, 3 files in `src/content/news/`
- Delete: `.gitkeep` placeholders for these dirs

- [ ] **Step 1: Create personal project files**

Create `src/content/projects/meeting-scribe.mdx`:

```mdx
---
title: meeting-scribe
blurb: Automatic meeting transcription and summary tool.
repo: https://github.com/scott-yj-yang/meeting-scribe
tags: [CLI, LLM, audio]
date: 2025-01-01
---
```

Create `src/content/projects/sweep-dashboard.mdx`:

```mdx
---
title: sweep-dashboard
blurb: Dashboard for visualizing hyperparameter sweep results.
repo: https://github.com/scott-yj-yang/sweep-dashboard
tags: [visualization, ML]
date: 2025-01-01
---
```

Create `src/content/projects/late-penalty.mdx`:

```mdx
---
title: LatePenalty
blurb: Automated late penalty calculator for course grading.
repo: https://github.com/scott-yj-yang/LatePenalty
tags: [education, automation]
date: 2024-01-01
---
```

Create `src/content/projects/estrapatch.mdx`:

```mdx
---
title: estrapatch
blurb: Estrogen patch scheduling and reminder app.
repo: https://github.com/scott-yj-yang/estrapatch
tags: [health, scheduling]
date: 2025-01-01
---
```

Create `src/content/projects/new-prompt.mdx`:

```mdx
---
title: new-prompt
blurb: Custom terminal prompt configuration tool.
repo: https://github.com/scott-yj-yang/new-prompt
tags: [CLI, terminal]
date: 2024-01-01
---
```

Create `src/content/projects/costco-receipt-splitter.mdx`:

```mdx
---
title: costco-receipt-splitter
blurb: Split Costco receipts among roommates or friends.
repo: https://github.com/scott-yj-yang/costco-receipt-splitter
tags: [utility, finance]
date: 2025-01-01
---
```

Note: blurbs are placeholders drafted from repo names. User should review and revise these during implementation.

- [ ] **Step 2: Create research code files**

Create `src/content/research-code/track-mjx.mdx`:

```mdx
---
title: track-mjx
blurb: GPU-accelerated neuromechanical pose estimation in MuJoCo-MJX.
repo: https://github.com/talmolab/track-mjx
tags: [JAX, MuJoCo, pose-estimation]
org: Talmo Lab
---
```

Create `src/content/research-code/stac-mjx.mdx`:

```mdx
---
title: stac-mjx
blurb: Skeletal tracking and calibration in MuJoCo-MJX.
repo: https://github.com/talmolab/stac-mjx
tags: [JAX, MuJoCo, calibration]
org: Talmo Lab
---
```

Create `src/content/research-code/vnl-playground.mdx`:

```mdx
---
title: vnl-playground
blurb: Fast, biologically realistic virtual environment for simulating animal behavior.
repo: https://github.com/talmolab/vnl-playground
tags: [deep-RL, virtual-rodent, simulation]
org: Talmo Lab
---
```

Create `src/content/research-code/canvas-groupy.mdx`:

```mdx
---
title: CanvasGroupy
blurb: Automated Canvas LMS group management and signup tool.
repo: https://github.com/FleischerResearchLab/CanvasGroupy
tags: [education, Canvas, automation]
org: Fleischer Research Lab
---
```

Create `src/content/research-code/group-signup.mdx`:

```mdx
---
title: group-signup
blurb: Student group signup and scheduling system.
repo: https://github.com/FleischerResearchLab/group-signup
tags: [education, scheduling]
org: Fleischer Research Lab
---
```

- [ ] **Step 3: Create news files**

Create `src/content/news/cosyne-2026.mdx`:

```mdx
---
date: 2026-03-01
kind: talk
---
Presented two posters at [Cosyne 2026](/research) — MIMIC-MJX and Musculoskeletal Imitation Learning.
```

Create `src/content/news/nature-methods-submission.mdx`:

```mdx
---
date: 2025-11-01
kind: paper
---
Submitted MIMIC-MJX to Nature Methods (co-first author).
```

Create `src/content/news/phd-start.mdx`:

```mdx
---
date: 2025-09-01
kind: misc
---
Started PhD in Neurosciences at UC San Diego, joining the Talmo Pereira Lab at the Salk Institute.
```

- [ ] **Step 4: Remove `.gitkeep` files**

```bash
rm src/content/projects/.gitkeep src/content/research-code/.gitkeep src/content/news/.gitkeep src/content/writing/.gitkeep
```

- [ ] **Step 5: Verify**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "content: seed 6 projects, 5 research repos, 3 news items"
```

---

### Task 7: Migrate photo and CV assets

**Files:**
- Create: `src/assets/scott-hero.jpg`, `public/cv/Yuanjia-Scott-Yang-CV.pdf`, `public/favicon.svg`

- [ ] **Step 1: Copy hero photo from temp location**

```bash
mkdir -p src/assets
cp /tmp/site-migration/scott-hero.jpg src/assets/scott-hero.jpg
```

- [ ] **Step 2: Copy CV PDF**

```bash
mkdir -p public/cv
cp /tmp/site-migration/Yuanjia-Scott-Yang-CV.pdf public/cv/Yuanjia-Scott-Yang-CV.pdf
```

- [ ] **Step 3: Create `public/favicon.svg`**

A simple lavender-accent favicon with "Y":

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#a78bfa"/>
  <text x="16" y="23" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="white" text-anchor="middle">Y</text>
</svg>
```

- [ ] **Step 4: Verify**

```bash
ls src/assets/scott-hero.jpg public/cv/Yuanjia-Scott-Yang-CV.pdf public/favicon.svg
pnpm build
```

Expected: all three files exist, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "assets: add hero photo, CV PDF, favicon"
```

---

### Task 8: Reusable components (Chip, PaperCard, ProjectCard, TalkEntry, NewsItem)

**Files:**
- Create: `src/components/Chip.astro`, `src/components/PaperCard.astro`, `src/components/ProjectCard.astro`, `src/components/TalkEntry.astro`, `src/components/NewsItem.astro`

- [ ] **Step 1: Create `src/components/Chip.astro`**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---
<span class="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
  {label}
</span>
```

- [ ] **Step 2: Create `src/components/PaperCard.astro`**

```astro
---
interface Props {
  title: string;
  authors: { name: string; isSelf: boolean; isCoFirst: boolean }[];
  venue: string;
  year: number;
  status: string;
  pdf?: string;
  code?: string;
  demo?: string;
  arxiv?: string;
}

const { title, authors, venue, year, status, pdf, code, demo, arxiv } = Astro.props;

function formatAuthors(authors: Props["authors"]) {
  return authors.map((a) => {
    let text = a.name;
    if (a.isCoFirst) text += "*";
    return { text, isSelf: a.isSelf };
  });
}

const formatted = formatAuthors(authors);
---
<div class="py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
  <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
  <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
    {formatted.map((a, i) => (
      <>
        {i > 0 && ", "}
        {a.isSelf ? <strong class="text-zinc-900 dark:text-zinc-100">{a.text}</strong> : <span>{a.text}</span>}
      </>
    ))}
  </p>
  <p class="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
    {venue} · {year}
    {status === "under-review" && <span class="ml-2 italic text-accent">Under Review</span>}
  </p>
  <div class="mt-2 flex flex-wrap gap-2">
    {demo && <a href={demo} target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-dark transition-colors">Live demo →</a>}
    {pdf && <a href={pdf} target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">PDF</a>}
    {code && <a href={code} target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">Code</a>}
    {arxiv && <a href={arxiv} target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">arXiv</a>}
  </div>
</div>
```

- [ ] **Step 3: Create `src/components/ProjectCard.astro`**

```astro
---
interface Props {
  title: string;
  blurb: string;
  repo: string;
  demo?: string;
  tags: string[];
  slug?: string;
}

const { title, blurb, repo, demo, tags, slug } = Astro.props;
const href = slug ? `/projects/${slug}` : repo;
const isExternal = !slug;
---
<a
  href={href}
  target={isExternal ? "_blank" : undefined}
  rel={isExternal ? "noopener noreferrer" : undefined}
  class="group block rounded-lg border border-zinc-200 p-5 transition-all hover:border-accent hover:shadow-md dark:border-zinc-800 dark:hover:border-accent"
>
  <h3 class="font-semibold text-zinc-900 group-hover:text-accent dark:text-zinc-100 transition-colors">{title}</h3>
  <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{blurb}</p>
  <div class="mt-3 flex flex-wrap gap-1.5">
    {tags.map((tag) => (
      <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{tag}</span>
    ))}
  </div>
</a>
```

- [ ] **Step 4: Create `src/components/TalkEntry.astro`**

```astro
---
interface Props {
  title: string;
  venue: string;
  date: Date;
  kind: string;
  poster?: string;
  slides?: string;
}

const { title, venue, date, kind, poster, slides } = Astro.props;
const year = date.getFullYear();
const month = date.toLocaleString("en-US", { month: "short" });
---
<div class="flex gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
  <div class="w-20 shrink-0 text-sm tabular-nums text-zinc-400 dark:text-zinc-500">
    {month} {year}
  </div>
  <div>
    <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
    <p class="text-sm text-zinc-500 dark:text-zinc-400">
      {venue} · <span class="capitalize">{kind}</span>
    </p>
    {(poster || slides) && (
      <div class="mt-1 flex gap-2">
        {poster && <a href={poster} target="_blank" rel="noopener noreferrer" class="text-xs text-accent hover:underline">Poster</a>}
        {slides && <a href={slides} target="_blank" rel="noopener noreferrer" class="text-xs text-accent hover:underline">Slides</a>}
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 5: Create `src/components/NewsItem.astro`**

```astro
---
interface Props {
  date: Date;
  kind: string;
}

const { date, kind } = Astro.props;
const formatted = date.toLocaleString("en-US", { month: "short", year: "numeric" });

const kindColors: Record<string, string> = {
  paper: "bg-emerald-400",
  talk: "bg-blue-400",
  post: "bg-accent",
  misc: "bg-zinc-400",
};
const dotColor = kindColors[kind] || kindColors.misc;
---
<div class="flex gap-3 py-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0">
  <div class="w-20 shrink-0 text-sm tabular-nums text-zinc-400 dark:text-zinc-500">{formatted}</div>
  <div class="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
    <span class:list={["mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotColor]}></span>
    <span><slot /></span>
  </div>
</div>
```

- [ ] **Step 6: Verify**

```bash
pnpm build
```

Expected: build succeeds. Components compile without errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: reusable components — Chip, PaperCard, ProjectCard, TalkEntry, NewsItem"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write `src/pages/index.astro`**

Replace the full file:

```astro
---
import { getCollection } from "astro:content";
import { Image } from "astro:assets";
import BaseLayout from "@/layouts/BaseLayout.astro";
import PaperCard from "@/components/PaperCard.astro";
import NewsItem from "@/components/NewsItem.astro";
import Chip from "@/components/Chip.astro";
import heroImage from "@/assets/scott-hero.jpg";

const allPapers = await getCollection("papers", ({ data }) => !data.draft);
const selectedPapers = allPapers
  .filter((p) => p.data.selected)
  .sort((a, b) => b.data.year - a.data.year);

const allNews = await getCollection("news");
const recentNews = allNews
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 5);

const chips = ["neuroAI", "motor control", "biomechanics", "deep RL", "virtual rodents"];
---
<BaseLayout>
  <!-- Hero -->
  <section class="flex flex-col-reverse items-start gap-8 sm:flex-row sm:items-center">
    <div class="flex-1">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
        Yuanjia <span class="text-accent">(Scott)</span><br />Yang
      </h1>
      <p class="mt-2 text-sm text-zinc-400 dark:text-zinc-500">a.k.a. Rheya</p>
      <p class="mt-1 text-base text-zinc-600 dark:text-zinc-300">
        PhD student · Neurosciences · UC San Diego
      </p>
      <p class="mt-4 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        I'm a first-year Neurosciences PhD student at UC San Diego, working in
        Talmo Pereira's lab at the Salk Institute. I build neuromechanical
        simulation tools that let virtual animals learn naturalistic behavior —
        bridging deep reinforcement learning, biomechanics, and motor neuroscience.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => <Chip label={c} />)}
      </div>
    </div>
    <div class="shrink-0">
      <Image
        src={heroImage}
        alt="Yuanjia (Scott) Yang"
        width={180}
        height={180}
        class="rounded-full object-cover"
      />
    </div>
  </section>

  <!-- Selected Work -->
  <section class="mt-16">
    <div class="flex items-baseline justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Selected Work</h2>
      <a href="/research" class="text-xs text-accent hover:underline">All publications →</a>
    </div>
    <div class="mt-4">
      {selectedPapers.map((paper) => (
        <PaperCard
          title={paper.data.title}
          authors={paper.data.authors}
          venue={paper.data.venue}
          year={paper.data.year}
          status={paper.data.status}
          pdf={paper.data.pdf}
          code={paper.data.code}
          demo={paper.data.demo}
          arxiv={paper.data.arxiv}
        />
      ))}
    </div>
  </section>

  <!-- Recent -->
  <section class="mt-16">
    <div class="flex items-baseline justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Recent</h2>
      <a href="/writing" class="text-xs text-accent hover:underline">Writing →</a>
    </div>
    <div class="mt-4">
      {recentNews.map(async (item) => {
        const { Content } = await item.render();
        return (
          <NewsItem date={item.data.date} kind={item.data.kind}>
            <Content />
          </NewsItem>
        );
      })}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Expected: home page shows hero with photo (circular), name with lavender "(Scott)", a.k.a. Rheya line, role, bio paragraph, interest chips, Selected Work section with MIMIC-MJX, Recent section with 3 news items. Dark mode toggles cleanly. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: home page with hero, selected work, recent news"
```

---

### Task 10: Research page

**Files:**
- Create: `src/pages/research.astro`

- [ ] **Step 1: Write `src/pages/research.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import PaperCard from "@/components/PaperCard.astro";
import TalkEntry from "@/components/TalkEntry.astro";

const allPapers = await getCollection("papers", ({ data }) => !data.draft);
const papersByYear = allPapers
  .sort((a, b) => b.data.year - a.data.year || (b.data.month ?? 0) - (a.data.month ?? 0));

const years = [...new Set(papersByYear.map((p) => p.data.year))];

const talks = (await getCollection("talks", ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const researchCode = await getCollection("research-code");
---
<BaseLayout title="Research — Yuanjia (Scott) Yang">
  <h1 class="text-3xl font-bold tracking-tight">Research</h1>

  <!-- Publications -->
  <section class="mt-10">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Publications</h2>
    {years.map((year) => (
      <div class="mt-6">
        <h3 class="text-sm font-medium text-zinc-300 dark:text-zinc-600">{year}</h3>
        {papersByYear.filter((p) => p.data.year === year).map((paper) => (
          <PaperCard
            title={paper.data.title}
            authors={paper.data.authors}
            venue={paper.data.venue}
            year={paper.data.year}
            status={paper.data.status}
            pdf={paper.data.pdf}
            code={paper.data.code}
            demo={paper.data.demo}
            arxiv={paper.data.arxiv}
          />
        ))}
      </div>
    ))}
  </section>

  <!-- Talks -->
  <section class="mt-14">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Talks & Posters</h2>
    <div class="mt-4">
      {talks.map((talk) => (
        <TalkEntry
          title={talk.data.title}
          venue={talk.data.venue}
          date={talk.data.date}
          kind={talk.data.kind}
          poster={talk.data.poster}
          slides={talk.data.slides}
        />
      ))}
    </div>
  </section>

  <!-- Research Code -->
  <section class="mt-14">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Research Code</h2>
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      {researchCode.map((rc) => (
        <a
          href={rc.data.repo}
          target="_blank"
          rel="noopener noreferrer"
          class="group block rounded-lg border border-zinc-200 p-4 transition-all hover:border-accent dark:border-zinc-800 dark:hover:border-accent"
        >
          <p class="text-sm font-semibold text-zinc-900 group-hover:text-accent dark:text-zinc-100 transition-colors">{rc.data.title}</p>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{rc.data.blurb}</p>
          <p class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{rc.data.org}</p>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Expected: `/research` page shows 3 papers grouped by year (2025), 5 talks in reverse chronological order, and 5 research code cards in a 2-column grid. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: research page with publications, talks, research code"
```

---

### Task 11: Projects pages (index + detail)

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`

- [ ] **Step 1: Create `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import ProjectCard from "@/components/ProjectCard.astro";

const projects = (await getCollection("projects", ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Projects — Yuanjia (Scott) Yang">
  <h1 class="text-3xl font-bold tracking-tight">Projects</h1>
  <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Side projects and tools I've built.</p>

  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {projects.map((project) => (
      <ProjectCard
        title={project.data.title}
        blurb={project.data.blurb}
        repo={project.data.repo}
        demo={project.data.demo}
        tags={project.data.tags}
        slug={project.body?.trim() ? project.slug : undefined}
      />
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/projects/[slug].astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import Chip from "@/components/Chip.astro";

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects
    .filter((p) => p.body?.trim())
    .map((project) => ({
      params: { slug: project.slug },
      props: { project },
    }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---
<BaseLayout title={`${project.data.title} — Yuanjia (Scott) Yang`}>
  <a href="/projects" class="text-sm text-accent hover:underline">← Projects</a>
  <h1 class="mt-4 text-3xl font-bold tracking-tight">{project.data.title}</h1>
  <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{project.data.blurb}</p>
  <div class="mt-3 flex flex-wrap gap-2">
    {project.data.tags.map((tag: string) => <Chip label={tag} />)}
  </div>
  <div class="mt-2 flex gap-3 text-sm">
    <a href={project.data.repo} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">GitHub →</a>
    {project.data.demo && <a href={project.data.demo} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Demo →</a>}
  </div>
  <article class="prose prose-zinc mt-8 max-w-none dark:prose-invert">
    <Content />
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Expected: `/projects` shows a grid of 6 project cards. Clicking a card opens the GitHub repo (since the MDX bodies are minimal, detail pages only render for projects with body content). Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: projects page with card grid and detail route"
```

---

### Task 12: Writing pages (index + post detail)

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[slug].astro`, `src/layouts/PostLayout.astro`

- [ ] **Step 1: Create `src/layouts/PostLayout.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Chip from "@/components/Chip.astro";

interface Props {
  title: string;
  date: Date;
  tags: string[];
  excerpt?: string;
}

const { title, date, tags, excerpt } = Astro.props;
const formatted = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
---
<BaseLayout title={`${title} — Yuanjia (Scott) Yang`} description={excerpt}>
  <a href="/writing" class="text-sm text-accent hover:underline">← Writing</a>
  <h1 class="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
  <div class="mt-2 flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500">
    <time datetime={date.toISOString()}>{formatted}</time>
    <div class="flex gap-1.5">
      {tags.map((tag) => <Chip label={tag} />)}
    </div>
  </div>
  <article class="prose prose-zinc mt-8 max-w-none dark:prose-invert">
    <slot />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/writing/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";

const posts = (await getCollection("writing", ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Writing — Yuanjia (Scott) Yang">
  <h1 class="text-3xl font-bold tracking-tight">Writing</h1>
  <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Conference recaps, technique notes, and thinking out loud.</p>

  {posts.length === 0 ? (
    <p class="mt-8 text-sm text-zinc-400 dark:text-zinc-500 italic">Nothing here yet. Check back soon.</p>
  ) : (
    <div class="mt-8 space-y-6">
      {posts.map((post) => (
        <a href={`/writing/${post.slug}`} class="group block">
          <p class="text-sm text-zinc-400 dark:text-zinc-500">
            {post.data.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
          <h2 class="text-lg font-semibold text-zinc-900 group-hover:text-accent dark:text-zinc-100 transition-colors">
            {post.data.title}
          </h2>
          {post.data.excerpt && (
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{post.data.excerpt}</p>
          )}
        </a>
      ))}
    </div>
  )}
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/writing/[slug].astro`**

```astro
---
import { getCollection } from "astro:content";
import PostLayout from "@/layouts/PostLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("writing");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<PostLayout title={post.data.title} date={post.data.date} tags={post.data.tags} excerpt={post.data.excerpt}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```

Expected: `/writing` shows "Nothing here yet." (because there are no writing posts seeded). Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: writing pages with list view and post detail"
```

---

### Task 13: Now page, CV page, and 404

**Files:**
- Create: `src/pages/now.mdx`, `src/pages/cv.astro`, `src/pages/404.astro`, `src/layouts/ProseLayout.astro`

- [ ] **Step 1: Create `src/layouts/ProseLayout.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<BaseLayout title={`${title} — Yuanjia (Scott) Yang`}>
  <article class="prose prose-zinc max-w-none dark:prose-invert">
    <slot />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/now.mdx`**

```mdx
---
layout: "@/layouts/ProseLayout.astro"
title: Now
---

# Now

_Last updated: April 2026_

## Currently working on

- Neuromechanical simulation frameworks for studying biological motor control
- Finishing up the MIMIC-MJX paper review cycle
- Settling into the Talmo Pereira Lab at the Salk Institute

## Reading

- _Add your current reading here_

## Recently presented at

- Cosyne 2026 — two posters on MIMIC-MJX and musculoskeletal imitation learning
```

- [ ] **Step 3: Create `src/pages/cv.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout title="CV — Yuanjia (Scott) Yang">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold tracking-tight">Curriculum Vitae</h1>
    <a
      href="/cv/Yuanjia-Scott-Yang-CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
    >
      Download PDF ↓
    </a>
  </div>

  <!-- Education -->
  <section class="mt-10">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Education</h2>
    <div class="mt-4 space-y-6">
      <div>
        <div class="flex items-baseline justify-between">
          <h3 class="font-semibold">Ph.D. in Neuroscience</h3>
          <span class="text-sm text-zinc-400">Sept 2025 – Present</span>
        </div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">UC San Diego · Talmo Pereira Lab, Salk Institute for Biological Studies</p>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Focus: Computational Neuroscience, Neuromechanical Modeling, Deep RL</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Funding: NIH BRAIN U01 (1U01NS136507)</p>
      </div>
      <div>
        <div class="flex items-baseline justify-between">
          <h3 class="font-semibold">M.S. in Computer Science and Engineering — AI</h3>
          <span class="text-sm text-zinc-400">Sept 2023 – Mar 2025</span>
        </div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">UC San Diego</p>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Thesis: VNL-Ray: Biomechanically Realistic Virtual Rodent Behavior and Task Learning via Deep RL</p>
      </div>
      <div>
        <div class="flex items-baseline justify-between">
          <h3 class="font-semibold">B.S. in Data Science & Cognitive Science</h3>
          <span class="text-sm text-zinc-400">Sept 2019 – Mar 2023</span>
        </div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">UC San Diego · GPA: 3.94/4 · Magna Cum Laude · Provost's Honor</p>
      </div>
    </div>
  </section>

  <!-- Skills -->
  <section class="mt-10">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Technical Skills</h2>
    <div class="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
      <p><strong class="text-zinc-900 dark:text-zinc-100">Programming:</strong> Python, JAX, JavaScript, R, MATLAB, Java, SQL, LaTeX</p>
      <p><strong class="text-zinc-900 dark:text-zinc-100">ML/RL:</strong> TensorFlow, PyTorch, Stable-Baselines3, Brax</p>
      <p><strong class="text-zinc-900 dark:text-zinc-100">Simulation:</strong> MuJoCo, MuJoCo-MJX, STAC-MJX</p>
      <p><strong class="text-zinc-900 dark:text-zinc-100">Infrastructure:</strong> Ray, GPU/TPU computing, Docker, Git</p>
      <p><strong class="text-zinc-900 dark:text-zinc-100">Data:</strong> NumPy, SciPy, Pandas, Matplotlib, Scikit-learn</p>
    </div>
  </section>

  <!-- Teaching -->
  <section class="mt-10">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Teaching</h2>
    <div class="mt-4">
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Teaching Assistant — UC San Diego, Dept. of Cognitive Science & Halıcıoğlu Data Science Institute</p>
      <ul class="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        <li>COGS 188 — Reinforcement Learning (Sp24)</li>
        <li>COGS 118B — Unsupervised Machine Learning (Wi23)</li>
        <li>COGS 118A — Supervised Machine Learning (Sp23, Wi23, Sp22)</li>
        <li>COGS 108 — Data Science in Practice (Fa24, Fa23, Sp23, Wi22)</li>
        <li>DSC 30 — Data Structures & Algorithms (Wi22, Fa21, Su21, Sp21)</li>
        <li>COGS 18 — Introduction to Python (Wi21)</li>
        <li>DSC 10 — Principles of Data Science (Su21)</li>
      </ul>
    </div>
  </section>

  <!-- Awards -->
  <section class="mt-10">
    <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Honors & Awards</h2>
    <div class="mt-4 space-y-3">
      <div class="flex items-baseline justify-between">
        <p class="text-sm font-medium">Magna Cum Laude</p>
        <span class="text-sm text-zinc-400">Mar 2023</span>
      </div>
      <div class="flex items-baseline justify-between">
        <div>
          <p class="text-sm font-medium">UC Scholars</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Summer Research Scholarship for excellent undergraduate research</p>
        </div>
        <span class="text-sm text-zinc-400">Summer 2022</span>
      </div>
    </div>
  </section>

  <p class="mt-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
    Full details in the <a href="/cv/Yuanjia-Scott-Yang-CV.pdf" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">PDF version</a>.
  </p>
</BaseLayout>
```

- [ ] **Step 4: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout title="404 — Page Not Found">
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <h1 class="text-6xl font-bold text-accent">404</h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">This page doesn't exist.</p>
    <a href="/" class="mt-6 text-sm text-accent hover:underline">← Back home</a>
  </div>
</BaseLayout>
```

- [ ] **Step 5: Verify**

```bash
pnpm dev
```

Expected: `/now` renders the markdown content. `/cv` shows structured education, skills, teaching, awards + PDF download button. Navigate to a nonexistent route to see 404. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: now page, CV page, 404 page"
```

---

### Task 14: Tailwind typography plugin for prose styling

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Install typography plugin**

```bash
pnpm add -D @tailwindcss/typography
```

- [ ] **Step 2: Add the plugin import to `src/styles/global.css`**

Add this line after the tailwindcss import:

```css
@import "tailwindcss";
@import "@tailwindcss/typography";
@import "@fontsource-variable/inter";

@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --color-accent: #a78bfa;
  --color-accent-light: #c4b5fd;
  --color-accent-dark: #7c3aed;
}
```

- [ ] **Step 3: Verify prose styling**

```bash
pnpm dev
```

Expected: `/now` page content is styled with proper typography (paragraph spacing, heading sizes, list styles). Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind typography plugin for prose content"
```

---

### Task 15: GitHub Actions deploy workflow and CNAME

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME`, `.nojekyll`

- [ ] **Step 1: Create `.nojekyll`**

```bash
touch .nojekyll
```

- [ ] **Step 2: Create `public/CNAME`**

Contents (exactly):

```
scottyang.org
```

- [ ] **Step 3: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Verify build still works locally**

```bash
pnpm build
```

Expected: build succeeds. `dist/CNAME` file exists.

```bash
cat dist/CNAME
```

Expected: `scottyang.org`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "ci: GitHub Actions deploy workflow + CNAME for scottyang.org"
```

---

### Task 16: Mobile-responsive header with hamburger menu

**Files:**
- Modify: `src/components/Header.astro`

The current header nav links are hidden on small screens. Add a hamburger toggle for mobile.

- [ ] **Step 1: Update `src/components/Header.astro`**

Replace the full file:

```astro
---
import ThemeToggle from "./ThemeToggle.astro";

const navItems = [
  { label: "research", href: "/research" },
  { label: "projects", href: "/projects" },
  { label: "writing", href: "/writing" },
  { label: "now", href: "/now" },
  { label: "cv", href: "/cv" },
];

const currentPath = Astro.url.pathname;
---
<header class="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
  <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
    <a href="/" class="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
      yuanjia yang
    </a>
    <!-- Desktop nav -->
    <nav class="hidden items-center gap-6 sm:flex">
      {navItems.map((item) => (
        <a
          href={item.href}
          class:list={[
            "text-sm transition-colors",
            currentPath.startsWith(item.href)
              ? "text-accent font-medium"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
          ]}
        >
          {item.label}
        </a>
      ))}
      <ThemeToggle />
    </nav>
    <!-- Mobile toggle -->
    <div class="flex items-center gap-2 sm:hidden">
      <ThemeToggle />
      <button id="menu-toggle" aria-label="Toggle menu" class="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </button>
    </div>
  </div>
  <!-- Mobile menu -->
  <nav id="mobile-menu" class="hidden border-t border-zinc-100 px-6 pb-4 dark:border-zinc-800 sm:hidden">
    {navItems.map((item) => (
      <a
        href={item.href}
        class:list={[
          "block py-2 text-sm transition-colors",
          currentPath.startsWith(item.href)
            ? "text-accent font-medium"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
        ]}
      >
        {item.label}
      </a>
    ))}
  </nav>
</header>

<script is:inline>
  document.getElementById("menu-toggle").addEventListener("click", function() {
    document.getElementById("mobile-menu").classList.toggle("hidden");
  });
</script>
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Expected: on desktop, nav links show normally. On mobile-width (<640px), a hamburger icon appears; clicking it reveals a stacked nav menu. Stop server.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: mobile-responsive header with hamburger menu"
```

---

### Task 17: Semi-automated publications sync script

**Files:**
- Create: `scripts/fetch-publications.ts`
- Modify: `package.json` (add script)

- [ ] **Step 1: Create `scripts/fetch-publications.ts`**

```typescript
import { writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const AUTHOR_NAME = "Yuanjia Yang";
const PAPERS_DIR = join(process.cwd(), "src", "content", "papers");

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  year: number;
  externalIds?: { DOI?: string; ArXiv?: string };
  venue?: string;
  authors: { name: string }[];
}

async function fetchFromSemanticScholar(): Promise<SemanticScholarPaper[]> {
  const query = encodeURIComponent(AUTHOR_NAME);
  const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${query}&limit=5`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    console.error(`Author search failed: ${searchRes.status}`);
    return [];
  }

  const searchData = await searchRes.json();
  const authors = searchData.data ?? [];
  if (authors.length === 0) {
    console.error("No matching author found.");
    return [];
  }

  const authorId = authors[0].authorId;
  console.log(`Found author: ${authors[0].name} (ID: ${authorId})`);

  const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,venue,externalIds,authors&limit=100`;
  const papersRes = await fetch(papersUrl);
  if (!papersRes.ok) {
    console.error(`Papers fetch failed: ${papersRes.status}`);
    return [];
  }

  const papersData = await papersRes.json();
  return papersData.data ?? [];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function getExistingTitles(): Set<string> {
  if (!existsSync(PAPERS_DIR)) return new Set();
  const files = readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".mdx"));
  const titles = new Set<string>();
  for (const file of files) {
    const content = Bun
      ? Bun.file(join(PAPERS_DIR, file)).text()
      : require("fs").readFileSync(join(PAPERS_DIR, file), "utf-8");
    const match = (typeof content === "string" ? content : "").match(/^title:\s*"?(.+?)"?\s*$/m);
    if (match) titles.add(match[1].toLowerCase().trim());
  }
  return titles;
}

async function main() {
  console.log("Fetching papers from Semantic Scholar...\n");

  const papers = await fetchFromSemanticScholar();
  if (papers.length === 0) {
    console.log("No papers found. Exiting.");
    process.exit(0);
  }

  const existing = getExistingTitles();
  let newCount = 0;

  for (const paper of papers) {
    if (!paper.title || existing.has(paper.title.toLowerCase().trim())) continue;

    const slug = slugify(paper.title);
    const filePath = join(PAPERS_DIR, `${slug}.mdx`);

    if (existsSync(filePath)) continue;

    const authors = paper.authors.map((a) => {
      const isSelf = a.name.toLowerCase().includes("yang");
      return `  - { name: "${a.name}", isSelf: ${isSelf}, isCoFirst: false }`;
    });

    const content = `---
title: "${paper.title}"
authors:
${authors.join("\n")}
venue: "${paper.venue || "Unknown"}"
year: ${paper.year || new Date().getFullYear()}
status: published
selected: false
tags: []
draft: true
${paper.externalIds?.DOI ? `doi: "${paper.externalIds.DOI}"` : ""}
${paper.externalIds?.ArXiv ? `arxiv: "https://arxiv.org/abs/${paper.externalIds.ArXiv}"` : ""}
---

_Auto-generated stub. Edit and set draft: false to publish._
`;

    writeFileSync(filePath, content.replace(/\n{3,}/g, "\n\n"), "utf-8");
    console.log(`  NEW: ${paper.title} → ${slug}.mdx`);
    newCount++;
  }

  console.log(`\nDone. ${newCount} new stub(s) written, ${papers.length - newCount} existing or skipped.`);
  if (newCount > 0) {
    console.log("Review new files in src/content/papers/ and set draft: false to publish.");
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Add script to `package.json`**

Add to the `"scripts"` section:

```json
"fetch-pubs": "npx tsx scripts/fetch-publications.ts"
```

- [ ] **Step 3: Install tsx for running TypeScript**

```bash
pnpm add -D tsx
```

- [ ] **Step 4: Verify**

```bash
pnpm run fetch-pubs
```

Expected: script runs, finds the author on Semantic Scholar, prints paper titles. Any new papers appear as `draft: true` stubs in `src/content/papers/`. If Semantic Scholar returns no results or is unreachable, the script exits gracefully with a message.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-publications.ts package.json pnpm-lock.yaml
git commit -m "feat: semi-automated publications sync via Semantic Scholar"
```

Note: do NOT commit any auto-generated `draft: true` stubs from the test run. If any were created, delete them before committing:

```bash
git checkout -- src/content/papers/
```

---

### Task 18: Final verification and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Full build test**

```bash
pnpm build
```

Expected: build succeeds with zero errors.

- [ ] **Step 2: Preview all pages**

```bash
pnpm preview
```

Visit each route and verify:

| Route | Check |
|---|---|
| `/` | Hero, photo, bio, chips, MIMIC-MJX selected paper, 3 news items |
| `/research` | 3 papers grouped by year, 5 talks, 5 research code cards |
| `/projects` | 6 project cards in grid |
| `/writing` | "Nothing here yet" placeholder |
| `/now` | Markdown content renders with prose styling |
| `/cv` | Education, skills, teaching, awards; PDF download works |
| `/404` | Shows when navigating to nonexistent route |

Verify dark mode toggle works on every page. Verify mobile hamburger menu works on narrow viewport.

Stop the preview server.

- [ ] **Step 3: Write `README.md`**

```markdown
# scottyang.org

Personal website for Yuanjia (Scott) Yang — PhD student in Neurosciences at UC San Diego.

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [MDX](https://mdxjs.com). Deployed to [GitHub Pages](https://pages.github.com) at [scottyang.org](https://scottyang.org).

## Development

```bash
pnpm install
pnpm dev          # start dev server at localhost:4321
pnpm build        # build static site to dist/
pnpm preview      # preview built site locally
pnpm check        # type-check Astro files
```

## Content

- **Papers:** `src/content/papers/` — one `.mdx` per publication
- **Talks:** `src/content/talks/` — one `.mdx` per poster/talk
- **Projects:** `src/content/projects/` — one `.mdx` per side project
- **Writing:** `src/content/writing/` — blog posts in MDX
- **News:** `src/content/news/` — short items for the home page ticker
- **Now:** `src/pages/now.mdx` — edit directly
- **CV:** `src/pages/cv.astro` + `public/cv/Yuanjia-Scott-Yang-CV.pdf`

## Sync publications

Optionally pull new papers from Semantic Scholar:

```bash
pnpm run fetch-pubs
```

New papers are saved as `draft: true` stubs. Review and set `draft: false` to publish.

## Custom domain (scottyang.org)

DNS is managed via Cloudflare. Required records:

| Type | Name | Content |
|------|------|---------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | scott-yj-yang.github.io |

In GitHub repo settings → Pages → set custom domain to `scottyang.org` and enable "Enforce HTTPS."
```

- [ ] **Step 4: Run Lighthouse (optional, manual)**

If Lighthouse CLI is available:

```bash
npx lighthouse http://localhost:4321 --output=json --quiet | npx lighthouse --output=html
```

Target: Performance ≥ 95, Accessibility ≥ 95.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README with development, content, and deployment instructions"
```

---

### Task 19: Push to GitHub and configure Pages

**Files:** none (remote configuration)

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Expected: GitHub Actions workflow triggers and builds the site.

- [ ] **Step 2: Configure GitHub Pages**

In browser, go to `https://github.com/scott-yj-yang/scott-yj-yang.github.io/settings/pages`:

1. Under "Build and deployment" → Source: select **GitHub Actions**
2. Under "Custom domain": enter `scottyang.org`
3. Check "Enforce HTTPS"

- [ ] **Step 3: Configure Cloudflare DNS**

In Cloudflare dashboard for `scottyang.org`:

1. Add four `A` records for `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
   - Proxy status: **DNS only** (grey cloud)
2. Add `CNAME` record: `www` → `scott-yj-yang.github.io` — DNS only
3. SSL/TLS mode: **Full**

- [ ] **Step 4: Verify deployment**

Wait for GitHub Actions to complete (check the Actions tab). Then:

```bash
curl -I https://scottyang.org
```

Expected: HTTP 200, served over HTTPS. Visit `https://scottyang.org` in a browser and verify all pages render correctly.

- [ ] **Step 5: Verify legacy branch exists**

```bash
git log legacy-jekyll --oneline -1
```

Expected: shows the last Jekyll commit (e.g. `7fed7e3 add office hour / main description`).

---

## Summary

| Task | Description | Key output |
|------|-------------|------------|
| 1 | Archive Jekyll, scaffold Astro | Working `pnpm dev` with blank page |
| 2 | Tailwind 4, React, MDX, Inter | Styled page with lavender accent |
| 3 | BaseLayout, Header, Footer, dark mode | Full page chrome with nav + toggle |
| 4 | Content collection schemas | Type-safe Zod schemas for 6 collections |
| 5 | Seed papers + talks | 3 papers, 5 talks from CV |
| 6 | Seed projects, research code, news | 6 projects, 5 repos, 3 news items |
| 7 | Migrate photo + CV | Hero image + downloadable PDF |
| 8 | Reusable components | Chip, PaperCard, ProjectCard, TalkEntry, NewsItem |
| 9 | Home page | Hero, selected work, recent news |
| 10 | Research page | Publications, talks, research code |
| 11 | Projects pages | Card grid + detail route |
| 12 | Writing pages | List + post detail (empty for launch) |
| 13 | Now + CV + 404 | Three additional pages |
| 14 | Typography plugin | Prose styling for MDX content |
| 15 | Deploy workflow + CNAME | GitHub Actions CI/CD |
| 16 | Mobile header | Hamburger menu for small screens |
| 17 | Publications sync | Opt-in Semantic Scholar script |
| 18 | Final verification + README | Full test + documentation |
| 19 | Push + configure Pages + DNS | Live site at scottyang.org |
