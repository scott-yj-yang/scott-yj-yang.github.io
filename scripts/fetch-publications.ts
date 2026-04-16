import { writeFileSync, existsSync, readdirSync, readFileSync } from "fs";
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
    const content = readFileSync(join(PAPERS_DIR, file), "utf-8");
    const match = content.match(/^title:\s*"?(.+?)"?\s*$/m);
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
