import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const papers = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/papers" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.object({
      name: z.string(),
      isSelf: z.boolean().default(false),
      isCoFirst: z.boolean().default(false),
    })),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/talks" }),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research-code" }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    repo: z.string(),
    demo: z.string().optional(),
    arxiv: z.string().optional(),
    tags: z.array(z.string()).default([]),
    org: z.string(),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writing" }),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/news" }),
  schema: z.object({
    date: z.coerce.date(),
    kind: z.enum(["post", "talk", "paper", "misc"]),
  }),
});

export const collections = { papers, talks, projects, "research-code": researchCode, writing, news };
