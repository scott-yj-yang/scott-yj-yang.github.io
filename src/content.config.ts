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
    /** Position within its year, lowest first, as the CV lists them. Papers without it follow, newest month first. */
    order: z.number().optional(),
    /** Shown after the venue, e.g. "Oral" or "Accepted in principle". */
    note: z.string().optional(),
    status: z.enum(["published", "accepted", "under-review", "preprint", "thesis", "workshop"]),
    selected: z.boolean().default(false),
    bibtexKey: z.string().optional(),
    /** The paper itself: publisher or OpenReview page. */
    link: z.string().optional(),
    pdf: z.string().optional(),
    code: z.string().optional(),
    /** Project page. */
    project: z.string().optional(),
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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      venue: z.string(),
      date: z.coerce.date(),
      kind: z.enum(["poster", "talk", "invited"]),
      poster: z.string().optional(),
      slides: z.string().optional(),
      /** A post about the event, such as a LinkedIn post. */
      post: z.string().optional(),
      /**
       * A photo from the event, cropped to 4:3. A path relative to the entry,
       * e.g. ../../assets/talks/name.jpg. Shown when the entry's Photo toggle is opened.
       */
      photo: image().optional(),
      photoAlt: z.string().optional(),
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
    docs: z.string().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const researchCode = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research-code" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      blurb: z.string(),
      repo: z.string(),
      demo: z.string().optional(),
      arxiv: z.string().optional(),
      tags: z.array(z.string()).default([]),
      org: z.string(),
      order: z.number().default(99),
      /** Show this project at the top of the home page. One at a time. */
      featured: z.boolean().default(false),
      /** The line that sells the project: the headline of the home page feature and of its own page. */
      headline: z.string().optional(),
      /** One or two sentences for the home page feature. Falls back to the blurb. */
      lede: z.string().optional(),
      /** The lead image: a path relative to the entry, e.g. ../../assets/research/name.jpg. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverCaption: z.string().optional(),
      /** A short silent video in public/media/. The home page feature shows it under the text and image. */
      clip: z
        .object({
          src: z.string(),
          webm: z.string().optional(),
          poster: z.string(),
          width: z.number(),
          height: z.number(),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
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
