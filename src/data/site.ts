/** Site-wide facts: edit here and the header, footer and home page follow. */
export const site = {
  name: "Yuanjia (Scott) Yang",
  shortName: "Scott Yang",
  description:
    "PhD student in Neurosciences at UC San Diego. NeuroAI, motor control, biomechanics.",
  /** Shown as plain text, written out so scrapers do not harvest it. */
  email: "yuy004 [at] health [dot] ucsd [dot] edu",
  funding: "Research supported by NIH BRAIN U01 (1U01NS136507)",
  nav: [
    { label: "Research", href: "/research" },
    { label: "Side Projects", href: "/projects" },
    { label: "Writing", href: "/writing" },
    { label: "CV", href: "/cv" },
  ],
  links: [
    { label: "GitHub", href: "https://github.com/scott-yj-yang" },
    { label: "Google Scholar", href: "https://scholar.google.com/citations?user=bjZuYAwAAAAJ" },
    { label: "ORCID", href: "https://orcid.org/0009-0005-4300-8453" },
    { label: "LinkedIn", href: "https://linkedin.com/in/scott-yang-aa03731b9" },
  ],
};

/**
 * Interactive course demos. They are full pages of their own (not content
 * entries), so the Side Projects page lists them from here.
 */
export const demos = [
  {
    title: "The Eigenvalue Value (in Neuroscience)",
    blurb: "Drag-and-explore companion to Christodoulou & Vogels (2022).",
    course: "UCSD NEU 200C",
    href: "/eigenvalue-companion",
  },
  {
    title: "Balanced Amplification",
    blurb: "Interactive walkthrough of the linear theory in Murphy & Miller (2009).",
    course: "UCSD NEU 200C",
    href: "/research/balanced-amplification",
  },
];
