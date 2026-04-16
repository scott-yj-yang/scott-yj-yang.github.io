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
