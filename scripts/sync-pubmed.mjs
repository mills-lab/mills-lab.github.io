#!/usr/bin/env node
// Finds new Ryan Mills publications on PubMed and writes them into _pubs/
// (the same legacy-source directory scripts/migrate-content.mjs reads from
// for everything else - run that afterward to regenerate
// src/content/publications/).
//
// Two kinds of output:
//
// 1. New publications, written directly as _pubs/<pmid>.md. A candidate
//    only qualifies when PubMed's own author metadata individually credits
//    him - an "AU - Mills RE" entry whose linked AUID matches his ORCID
//    (0000-0003-3425-6998) or whose affiliation mentions Michigan. This is
//    what keeps grant-funded-but-not-authored papers out automatically:
//    NIH grant numbers live in MEDLINE's separate GR field, which this
//    never inspects, so a paper Mills co-leads funding for but didn't
//    write can't pass the author check no matter how it was discovered.
//
// 2. Consortium leads: papers credited only via a collective name (MEDLINE
//    CN field, e.g. "1000 Genomes Project") for one of the consortia he's
//    actually part of, with no individual PubMed author entry for him at
//    all - common for large consortium papers where the working member
//    list only exists in the paper's own supplementary material, not in
//    PubMed's structured metadata. These can't be verified automatically,
//    so they're printed as a manual-review list instead of auto-added.
//    (Historical example already in the catalog: PMID 21666693 lists only
//    "1000 Genomes Project" as CN, no individual "Mills RE" author entry -
//    added by hand originally, which is exactly the situation this list
//    is meant to surface going forward.)
//
// If a bioRxiv/medRxiv preprint later gets a peer-reviewed publication,
// only the published version is kept - checked by title against both the
// existing catalog (deletes the superseded preprint's file) and this run's
// other new candidates (drops it before it's ever written).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pubsDir = path.join(root, '_pubs');

const ORCID = '0000-0003-3425-6998';
const CONSORTIA = [
  '1000 Genomes Project',
  'Brain Somatic Mosaicism Network',
  'Somatic Mosaicism across Human Tissues Network',
];

// If a bioRxiv/medRxiv preprint later gets a peer-reviewed publication,
// only the published version is kept - matches title against both the
// existing catalog and this run's other new candidates and drops the
// preprint side whenever a non-preprint match exists.
const PREPRINT_SERVERS = new Set(['bioRxiv', 'medRxiv', 'chemRxiv', 'Research Square', 'SSRN', 'arXiv']);
const normalizeTitle = (title) => (title ?? '').toLowerCase().trim().replace(/\.$/, '').replace(/\s+/g, ' ');

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const dryRun = process.argv.includes('--dry-run');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function esearch(term) {
  const url = `${EUTILS}/esearch.fcgi?db=pubmed&retmax=500&retmode=json&term=${encodeURIComponent(term)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`esearch failed (${res.status}) for term: ${term}`);
  const data = await res.json();
  return data.esearchresult?.idlist ?? [];
}

async function efetchMedline(pmid) {
  const url = `${EUTILS}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=medline&retmode=text`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`efetch failed (${res.status}) for PMID ${pmid}`);
  return res.text();
}

function decodeHtmlEntities(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

// MEDLINE plain-text: "TAG - value", with continuation lines indented 6
// spaces and no tag. Merges continuations into a flat ordered list of
// {tag, value} entries (order and repeats both matter - authors and CN
// group names are read off this in document order below).
function parseMedlineLines(text) {
  const entries = [];
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') continue;
    const m = raw.match(/^([A-Z]{2,4})\s*- (.*)$/);
    if (m) {
      entries.push({ tag: m[1], value: m[2].trim() });
    } else if (raw.startsWith('      ') && entries.length > 0) {
      entries[entries.length - 1].value += ' ' + raw.trim();
    }
  }
  return entries;
}

function field(entries, tag) {
  return entries.find((e) => e.tag === tag)?.value;
}

// Reconstructs the author byline exactly as MEDLINE orders it, including
// any CN (collective/group name, e.g. "SMaHT MEI Working Group") at its
// real position in the sequence - matches the format already used
// throughout the existing publications catalog.
function buildAuthorString(entries) {
  return entries
    .filter((e) => e.tag === 'AU' || e.tag === 'CN')
    .map((e) => e.value)
    .join(', ');
}

// Confirms "Mills RE" is credited as an individual author (not just via a
// GR grant-support line, which this never looks at) with either a matching
// ORCID or a Michigan affiliation. Author blocks in MEDLINE text run
// FAU -> AU -> [AUID] -> [AD]*, terminated by the next FAU/CN, so this
// walks entries looking for that specific block rather than trusting
// flattened AU/AD arrays to line up.
function verifyIndividualAuthorship(entries) {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].tag !== 'AU' || entries[i].value !== 'Mills RE') continue;
    let hasOrcid = false;
    let hasMichigan = false;
    for (let j = i + 1; j < entries.length && entries[j].tag !== 'FAU' && entries[j].tag !== 'AU' && entries[j].tag !== 'CN'; j++) {
      if (entries[j].tag === 'AUID' && entries[j].value.includes(ORCID)) hasOrcid = true;
      if (entries[j].tag === 'AD' && /Michigan/i.test(entries[j].value)) hasMichigan = true;
    }
    if (hasOrcid || hasMichigan) return true;
  }
  return false;
}

function buildPubEntry(pmid, entries) {
  const title = decodeHtmlEntities(field(entries, 'TI') ?? '');
  const authors = decodeHtmlEntities(buildAuthorString(entries));
  const pubdate = field(entries, 'DP') ?? '';
  const volume = field(entries, 'VI') ?? '';
  const issue = field(entries, 'IP') ?? '';
  const pages = field(entries, 'PG') ?? 'N/A';
  const journal = decodeHtmlEntities(field(entries, 'TA') ?? '');

  const frontmatter = [
    '---',
    `pmid: ${pmid}`,
    `title: ${title}`,
    `authors: ${authors}`,
    `pubdate: ${pubdate}`,
    `volume: ${volume}`,
    `issue: ${issue}`,
    `pages: ${pages}`,
    `journal: ${journal}`,
    '---',
    '',
  ].join('\n');

  return { pmid, title, journal, frontmatter };
}

function writePubEntry(entry) {
  if (!dryRun) fs.writeFileSync(path.join(pubsDir, `${entry.pmid}.md`), entry.frontmatter);
}

function loadExistingCatalog() {
  return fs
    .readdirSync(pubsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const text = fs.readFileSync(path.join(pubsDir, f), 'utf8');
      const title = text.match(/^title:\s*(.*)$/m)?.[1]?.trim() ?? '';
      const journal = text.match(/^journal:\s*(.*)$/m)?.[1]?.trim() ?? '';
      return { pmid: f.replace(/\.md$/, ''), title, journal, file: path.join(pubsDir, f) };
    });
}

// Drops the preprint side of any preprint/published pair - checked against
// both the existing catalog (deletes the old preprint's file) and this
// run's other new candidates (drops it before it's ever written). A group
// with only preprint entries (no published version exists yet) is left
// alone; a group with multiple non-preprint entries (the existing catalog
// has one such case, an unrelated PubMed indexing duplicate) is also left
// alone - this only acts when there's an actual preprint-vs-published mix.
function reconcilePreprints(newEntries, existingCatalog) {
  const groups = new Map();
  for (const e of [...existingCatalog.map((e) => ({ ...e, isExisting: true })), ...newEntries.map((e) => ({ ...e, isExisting: false }))]) {
    const key = normalizeTitle(e.title);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  const supersededExisting = [];
  const supersededNew = new Set();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const hasPublished = group.some((e) => !PREPRINT_SERVERS.has(e.journal));
    if (!hasPublished) continue;
    for (const e of group) {
      if (!PREPRINT_SERVERS.has(e.journal)) continue;
      if (e.isExisting) {
        if (!dryRun) fs.rmSync(e.file);
        supersededExisting.push(e);
      } else {
        supersededNew.add(e.pmid);
      }
    }
  }

  return {
    survivingNew: newEntries.filter((e) => !supersededNew.has(e.pmid)),
    supersededExisting,
    supersededNew: newEntries.filter((e) => supersededNew.has(e.pmid)),
  };
}

async function main() {
  const existingPmids = new Set(
    fs.readdirSync(pubsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
  );

  console.log(`Existing catalog: ${existingPmids.size} publications.\n`);

  // --- Discover candidates: name+affiliation search unioned with an
  // ORCID search - each alone misses a handful the other catches (see
  // PROGRESS.md for the specific comparison that motivated this). ---
  const nameHits = await esearch('Mills RE[Author] AND Michigan[Affiliation]');
  await sleep(400);
  const orcidHits = await esearch(`${ORCID}[Author - Identifier]`);
  await sleep(400);

  const candidatePmids = [...new Set([...nameHits, ...orcidHits])].filter((id) => !existingPmids.has(id));

  // Corrections/errata aren't separate publications - PubMed titles them
  // with one of these prefixes, matching the original paper's title.
  const CORRECTION_PREFIX = /^(Author Correction|Erratum|Corrigendum|Correction|Retraction)\b\s*:/i;

  const added = [];
  const rejected = [];
  const skippedCorrections = [];
  for (const pmid of candidatePmids) {
    const text = await efetchMedline(pmid);
    await sleep(400);
    const entries = parseMedlineLines(text);
    const title = field(entries, 'TI');
    if (CORRECTION_PREFIX.test(title ?? '')) {
      skippedCorrections.push({ pmid, title });
      continue;
    }
    if (verifyIndividualAuthorship(entries)) {
      added.push(buildPubEntry(pmid, entries));
    } else {
      rejected.push({ pmid, title });
    }
  }

  const { survivingNew, supersededExisting, supersededNew } = reconcilePreprints(added, loadExistingCatalog());
  for (const entry of survivingNew) writePubEntry(entry);

  // --- Consortium leads: papers credited via a group name for a known
  // consortium, with no individual author entry for him - can't be
  // verified automatically, surfaced for manual review instead. ---
  const consortiumLeads = [];
  for (const name of CONSORTIA) {
    const hits = await esearch(`"${name}"[Corporate Author]`);
    await sleep(400);
    for (const pmid of hits) {
      if (existingPmids.has(pmid) || added.some((a) => a.pmid === pmid)) continue;
      if (consortiumLeads.some((c) => c.pmid === pmid)) continue;
      consortiumLeads.push({ pmid, consortium: name });
    }
  }
  // Only fetch titles for consortium leads if there's a manageable number
  // to report (avoids a slow/expensive fetch storm on a first-ever run).
  for (const lead of consortiumLeads.slice(0, 50)) {
    const text = await efetchMedline(lead.pmid);
    await sleep(400);
    const entries = parseMedlineLines(text);
    lead.title = field(entries, 'TI');
    lead.journal = field(entries, 'TA');
  }

  // --- Report ---
  const lines = [];
  lines.push(`## PubMed sync report`);
  lines.push('');
  if (survivingNew.length > 0) {
    lines.push(`### Added ${survivingNew.length} new publication${survivingNew.length === 1 ? '' : 's'}`);
    lines.push('');
    for (const p of survivingNew) lines.push(`- [${p.pmid}](https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/) — ${p.title} (${p.journal})`);
    lines.push('');
  } else {
    lines.push('No new individually-authored publications found.');
    lines.push('');
  }
  if (supersededExisting.length > 0 || supersededNew.length > 0) {
    const total = supersededExisting.length + supersededNew.length;
    lines.push(`### ${total} preprint${total === 1 ? '' : 's'} superseded by a published version`);
    lines.push('');
    for (const p of supersededExisting) {
      lines.push(`- [${p.pmid}](https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/) — ${p.title} (${p.journal}) — removed from the catalog, replaced by the published version below`);
    }
    for (const p of supersededNew) {
      lines.push(`- [${p.pmid}](https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/) — ${p.title} (${p.journal}) — not added, a published version already covers this`);
    }
    lines.push('');
  }
  if (skippedCorrections.length > 0) {
    lines.push(`### ${skippedCorrections.length} correction/erratum notice${skippedCorrections.length === 1 ? '' : 's'} skipped`);
    lines.push('');
    for (const c of skippedCorrections) lines.push(`- [${c.pmid}](https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/) — ${c.title ?? '(title unavailable)'}`);
    lines.push('');
  }
  if (rejected.length > 0) {
    lines.push(`### ${rejected.length} candidate${rejected.length === 1 ? '' : 's'} rejected (author check failed)`);
    lines.push('');
    for (const r of rejected) lines.push(`- [${r.pmid}](https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/) — ${r.title ?? '(title unavailable)'}`);
    lines.push('');
  }
  if (consortiumLeads.length > 0) {
    lines.push(`### ${consortiumLeads.length} consortium-credited paper${consortiumLeads.length === 1 ? '' : 's'} — needs manual review`);
    lines.push('');
    lines.push(
      "These are credited only via a group name (e.g. \"1000 Genomes Project\") for a consortium Ryan Mills is part of, with no individual PubMed author entry for him - PubMed's metadata can't confirm his personal involvement, so they were not added automatically. Check the paper's own author/consortium-member list and ask Claude to add any that are genuinely his if so."
    );
    lines.push('');
    for (const c of consortiumLeads) {
      lines.push(`- [${c.pmid}](https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/) — ${c.title ?? '(title unavailable)'} (${c.journal ?? c.consortium}) — *${c.consortium}*`);
    }
    lines.push('');
  }

  const report = lines.join('\n');
  console.log(report);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
  }
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `added_count=${added.length}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
