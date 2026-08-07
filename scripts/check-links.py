#!/usr/bin/env python3
"""QA link/asset checker for the built site.

Run after `npm run build`:
    python3 scripts/check-links.py

Walks dist/*.html and reports:
  - any internal href/src that doesn't resolve to a real file in dist/
  - a summary of external link domains referenced (eyeball check for typos)
"""
import os
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.refs.append(value)


def main():
    internal_broken = []
    domain_counts = {}
    checked_files = 0

    for root, _dirs, files in os.walk(DIST):
        for fn in files:
            if not fn.endswith(".html"):
                continue
            checked_files += 1
            path = os.path.join(root, fn)
            page_url = "/" + os.path.relpath(path, DIST)
            with open(path, encoding="utf-8") as f:
                html = f.read()
            parser = RefParser()
            parser.feed(html)
            for ref in parser.refs:
                if ref.startswith(("#", "mailto:", "tel:")):
                    continue
                parsed = urlparse(ref)
                if parsed.scheme in ("http", "https"):
                    domain_counts[parsed.netloc] = domain_counts.get(parsed.netloc, 0) + 1
                    continue
                if not ref.startswith("/"):
                    continue  # relative, none expected in this codebase
                clean = ref.split("#")[0].split("?")[0]
                if clean == "":
                    continue
                fs_path = os.path.join(DIST, clean.lstrip("/"))
                candidates = [fs_path, fs_path.rstrip("/") + "/index.html"]
                if not any(os.path.exists(c) for c in candidates):
                    internal_broken.append((page_url, ref))

    print(f"Checked {checked_files} HTML files.")
    print(f"Internal broken references: {len(internal_broken)}")
    for page, ref in internal_broken:
        print(f"  {page} -> {ref}")

    print(f"\nExternal domains referenced ({sum(domain_counts.values())} links, {len(domain_counts)} domains):")
    for domain, count in sorted(domain_counts.items(), key=lambda x: -x[1]):
        print(f"  {count:4d}  {domain}")

    if internal_broken:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
