// One-time migration of legacy Jekyll content (_posts, _people, _pubs,
// _software, _pages, _data) into Astro content collections (src/content/*).
// Safe to re-run: it always regenerates src/content/{posts,people,publications,software,pages,data}
// from the legacy source directories, which remain untouched.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';

const root = path.resolve(import.meta.dirname, '..');
const outRoot = path.join(root, 'src/content');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeEntry(outPath, data, body) {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const frontmatter = yaml.dump(cleaned, { lineWidth: -1 });
  fs.writeFileSync(outPath, `---\n${frontmatter}---\n${body ?? ''}`);
}

// ---- posts ----
function migratePosts() {
  const srcDir = path.join(root, '_posts');
  const outDir = path.join(outRoot, 'posts');
  ensureDir(outDir);
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!dateMatch) {
      console.warn(`skip post (no date prefix): ${file}`);
      continue;
    }
    const [, date, slug] = dateMatch;
    const { data, content } = matter.read(path.join(srcDir, file));

    // Jekyll's `media` layout embedded a Liquid loop over site.static_files
    // to render an image gallery from a folder under /images/. Replace it
    // with a `gallery: <folder>` field; PostGallery.astro reads the folder
    // directly from public/images at build time.
    const galleryBlock = /<div>\s*\{%\s*for image in site\.static_files\s*%\}[\s\S]*?images\/([^'"]+?)\/?['"][\s\S]*?\{%\s*endfor\s*%\}\s*<\/div>/;
    const galleryMatch = content.match(galleryBlock);
    const body = galleryMatch ? content.replace(galleryBlock, '').trim() : content;

    writeEntry(
      path.join(outDir, `${date}-${slug}.md`),
      {
        title: data.title,
        date,
        share: data.share,
        ads: data.ads,
        externalUrl: data['external-url'],
        image: data.image,
        gallery: galleryMatch?.[1],
      },
      body
    );
  }
}

// ---- people ----
// Legacy _people/alumni/*.md didn't distinguish PhD alumni from rotation
// students from other roles (postdocs, masters students, etc.) - the new
// People page wants those as three separate sections. Classified below by
// each person's `title` field: "PhD Candidate/Student" -> phd-alumni,
// "Rotation Student" -> rotation-alumni, everything else -> other-alumni.
// A few (Akima George, Nan Lin, Zhenning Zhang) have ambiguous titles with
// no explicit "PhD" or "Rotation" - defaulted to other-alumni but worth the
// user double-checking; see PROGRESS.md.
const ALUMNI_SUBSTATUS = {
  'Akima_George.md': 'other-alumni',
  'Alex_Weber.md': 'phd-alumni',
  'Catherine_Barnier.md': 'rotation-alumni',
  'Chen_Sun.md': 'phd-alumni',
  'Fan_Zhang.md': 'rotation-alumni',
  'Gargi_Dayama.md': 'other-alumni',
  'Marcus_Sherman.md': 'phd-alumni',
  'Nan_Lin.md': 'other-alumni',
  'Shaomiao_Xia.md': 'other-alumni',
  'Tony_Chun.md': 'other-alumni',
  'Xuefang_Zhao.md': 'phd-alumni',
  'Yifan_Wang.md': 'phd-alumni',
  'Zhenning_Zhang.md': 'other-alumni',
};

// Builds the extensible `links` array from the old flat fields. `linked-in`
// is deliberately skipped: the legacy values (e.g. "pub/ryan-mills-82b5854//")
// are in LinkedIn's old /pub/ URL format, deprecated years ago and never
// actually rendered on the old site either - migrating it would just
// publish a link that's likely already dead. Add a current LinkedIn URL by
// hand, or via the CMS once Phase 3 exists.
function buildPersonLinks(data) {
  const links = [];
  if (data.CV) links.push({ type: 'cv', url: `/assets/${data.CV}` });
  if (data['google-scholar']) {
    links.push({ type: 'googleScholar', url: `https://scholar.google.com/citations?user=${data['google-scholar']}` });
  }
  if (data.twitter) links.push({ type: 'twitter', url: `https://twitter.com/${data.twitter}` });
  if (data.email) links.push({ type: 'email', url: data.email });
  return links;
}

function migratePeople() {
  const srcRoot = path.join(root, '_people');
  const outDir = path.join(outRoot, 'people');
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const statuses = ['pi', 'phd', 'alumni', 'researchinvestigator'];
  for (const status of statuses) {
    const srcDir = path.join(srcRoot, status);
    if (!fs.existsSync(srcDir)) continue;
    for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
      const { data, content } = matter.read(path.join(srcDir, file));
      const resolvedStatus = status === 'alumni' ? (ALUMNI_SUBSTATUS[file] ?? 'other-alumni') : status;
      writeEntry(
        path.join(outDir, `${status}-${file}`),
        {
          publish: data.publish,
          status: resolvedStatus,
          name: data.name,
          title: data.title,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          picture: data.picture,
          startDate: data['start-date'],
          links: buildPersonLinks(data),
        },
        content
      );
    }
  }
}

// ---- publications ----
function migratePublications() {
  const srcDir = path.join(root, '_pubs');
  const outDir = path.join(outRoot, 'publications');
  ensureDir(outDir);
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
    const { data, content } = matter.read(path.join(srcDir, file));
    writeEntry(
      path.join(outDir, file),
      {
        pmid: data.pmid !== undefined ? String(data.pmid) : undefined,
        title: data.title,
        authors: data.authors,
        pubdate: data.pubdate !== undefined ? String(data.pubdate) : undefined,
        volume: data.volume !== undefined ? String(data.volume) : undefined,
        issue: data.issue !== undefined ? String(data.issue) : undefined,
        pages: data.pages !== undefined ? String(data.pages) : undefined,
        journal: data.journal,
      },
      content
    );
  }
}

// ---- software ----
function migrateSoftware() {
  const srcDir = path.join(root, '_software');
  const outDir = path.join(outRoot, 'software');
  ensureDir(outDir);
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
    const { data, content } = matter.read(path.join(srcDir, file));
    writeEntry(
      path.join(outDir, file),
      {
        title: typeof data.title === 'string' ? data.title.trim() : data.title,
        externalUrl: data.external_url,
        date: data.date,
        description: data.description,
        citation: data.citation,
      },
      content
    );
  }
}

// ---- pages ----
// news/people/publications/software were index pages built entirely from
// Liquid loops (no real prose) — they're rebuilt as dedicated Astro routes
// instead, so only genuinely static content pages are migrated here.
const DEDICATED_ROUTE_PAGES = new Set(['news.md', 'people.md', 'publications.md', 'software.md']);

function migratePages() {
  const srcDir = path.join(root, '_pages');
  const outDir = path.join(outRoot, 'pages');
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md') && !DEDICATED_ROUTE_PAGES.has(f))) {
    const { data, content } = matter.read(path.join(srcDir, file));
    writeEntry(
      path.join(outDir, file),
      {
        title: data.title,
        permalink: data.permalink,
        image: data.image ? { feature: data.image.feature } : undefined,
      },
      content
    );
  }
}

// ---- site data (navigation, footer) ----
// The `file()` loader needs each entry keyed by a unique id, so a plain
// array (as Jekyll's _data/*.yml used) is reshaped into an object map.
function slugify(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function migrateDataFile(srcFile, destFile) {
  const items = yaml.load(fs.readFileSync(srcFile, 'utf8'));
  const keyed = Object.fromEntries(
    items.map((item, order) => [slugify(item.title), { order, ...item }])
  );
  fs.writeFileSync(destFile, yaml.dump(keyed, { lineWidth: -1 }));
}

function migrateData() {
  const outDir = path.join(outRoot, 'data');
  ensureDir(outDir);
  migrateDataFile(path.join(root, '_data/navigation.yml'), path.join(outDir, 'navigation.yml'));
  migrateDataFile(path.join(root, '_data/footer.yml'), path.join(outDir, 'footer.yml'));
}

migratePosts();
migratePeople();
migratePublications();
migrateSoftware();
migratePages();
migrateData();

console.log('Content migration complete.');
