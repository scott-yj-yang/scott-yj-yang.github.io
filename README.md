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

- **Papers:** `src/content/papers/` — one `.mdx` per publication. Set `selected: true` to show it on the home page; `note` adds text after the venue (for example `Oral`); `order` sets its position within its year, lowest first.
- **Talks:** `src/content/talks/` — one `.mdx` per poster/talk. The home page lists the three newest. Optional `photo` (a 4:3 image in `src/assets/talks/`, with `photoAlt`) adds a "Photo" toggle that opens the picture; `post` links to a post about it.
- **Research software:** `src/content/research-code/` — one `.mdx` per tool. `featured: true` puts one at the top of the home page: its `headline` and `lede` on the left, its `cover` image on the right, and its `clip` (a short silent video in `public/media/`: MP4, optional WebM, and a poster image) underneath. On the project's own page the headline and cover lead, and the text places the clip with `<Clip {...frontmatter.clip} />`.
- **Projects:** `src/content/projects/` — one `.mdx` per side project
- **Writing:** `src/content/writing/` — blog posts in MDX
- **News:** `src/content/news/` — short dated items for the home page
- **Name, links, menu, interactive demos:** `src/data/site.ts`
- **CV:** `src/pages/cv.astro` + `public/cv/Yuanjia-Scott-Yang-CV.pdf`. The page takes its publications and presentations from the papers and talks above; its other sections are lists at the top of the file.

## Design

One typeface (Inter), one accent colour, thin rules instead of cards. The colours are
tokens at the top of `src/styles/global.css`, with dark-mode values beside them; pages
use them through utilities such as `text-muted`, `text-faint`, `border-rule` and
`text-accent`. Shared pieces are in `src/components/`: `Section` (a labelled section),
`PubItem`, `TalkEntry`, `NewsItem`, `LinkList`, `Tags`, `Prose` (long-form text), `Clip` (a looping
video that plays only while on screen) and `Figure` (an image with a caption, for MDX pages).
`LoopDiagram`, `LoopStep` and `LoopLegend` draw the three-step sensorimotor-loop diagram on the
MIMIC-MJX page; the drawing is SVG that takes its colours from the same tokens.

The home page portrait is a button: pressing it slides a trans flag out from behind its
upper-right corner, and pressing again tucks it back. Its styles are the `.portrait-*`
rules in `global.css`; the click handler is at the end of `src/pages/index.astro`.

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
