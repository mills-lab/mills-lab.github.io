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
    writeEntry(
      path.join(outDir, `${date}-${slug}.md`),
      {
        title: data.title,
        date,
        share: data.share,
        ads: data.ads,
        externalUrl: data['external-url'],
        image: data.image,
      },
      content
    );
  }
}

// ---- people ----
function migratePeople() {
  const srcRoot = path.join(root, '_people');
  const outDir = path.join(outRoot, 'people');
  ensureDir(outDir);
  const statuses = ['pi', 'phd', 'alumni', 'researchinvestigator'];
  for (const status of statuses) {
    const srcDir = path.join(srcRoot, status);
    if (!fs.existsSync(srcDir)) continue;
    for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
      const { data, content } = matter.read(path.join(srcDir, file));
      writeEntry(
        path.join(outDir, `${status}-${file}`),
        {
          publish: data.publish,
          status,
          name: data.name,
          title: data.title,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          picture: data.picture,
          googleScholar: data['google-scholar'],
          cv: data.CV,
          linkedIn: data['linked-in'],
          twitter: data.twitter,
          email: data.email,
          startDate: data['start-date'],
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
function migratePages() {
  const srcDir = path.join(root, '_pages');
  const outDir = path.join(outRoot, 'pages');
  ensureDir(outDir);
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
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
  const keyed = Object.fromEntries(items.map((item) => [slugify(item.title), item]));
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
