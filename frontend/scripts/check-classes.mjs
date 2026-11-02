#!/usr/bin/env node
/**
 * Fail the build when a class name used in JSX/TSX has no CSS definition.
 *
 * The frontend uses a handful of Tailwind-shaped utilities that are provided by
 * src/styles/utilities.css, plus dynamic state tokens (active/on/open/…) that
 * are composed at runtime. Everything else must exist in a stylesheet.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

const ALLOWED = new Set([
  // Runtime state tokens composed with template strings.
  "active",
  "on",
  "open",
  "selected",
  "online",
  "offline",
  "recording",
  "listening",
  "success",
  "error",
  "assistant",
  "user",
  "dark",
  "theme-dark",
  "theme-light",
  "is-ready",
  "no-transition",
  "sweep-active",
]);

function addTokens(value, target) {
  const cleaned = value.replace(/\$\{[\s\S]*?\}/g, " ");
  for (const token of cleaned.split(/\s+/)) {
    if (!token || token.length < 2) continue;
    if (!/^[A-Za-z_-][\w:.-]*$/.test(token)) continue;
    target.add(token);
  }
}

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, files);
    else if (/\.(jsx|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function collectFromSource(source, file, used) {
  const marker = /className\s*=\s*/g;

  while (marker.exec(source)) {
    let index = marker.lastIndex;
    while (/\s/.test(source[index])) index += 1;
    const char = source[index];

    if (char === '"' || char === "'") {
      const end = source.indexOf(char, index + 1);
      if (end === -1) continue;
      addTokens(source.slice(index + 1, end), used.get(file));
      marker.lastIndex = end + 1;
      continue;
    }

    if (char !== "{") continue;

    let depth = 0;
    let inString = null;

    for (let cursor = index; cursor < source.length; cursor += 1) {
      const current = source[cursor];

      if (inString) {
        if (current === "\\") {
          cursor += 1;
          continue;
        }
        if (current === inString) inString = null;
        continue;
      }

      if (current === '"' || current === "'" || current === "`") {
        inString = current;
        continue;
      }

      if (current === "{") depth += 1;
      if (current === "}") {
        depth -= 1;
        if (depth === 0) {
          const expression = source.slice(index + 1, cursor);
          for (const quoted of expression.matchAll(
            /"([^"]*)"|'([^']*)'|`([^`]*)`/g,
          )) {
            addTokens(quoted[1] ?? quoted[2] ?? quoted[3] ?? "", used.get(file));
          }
          marker.lastIndex = cursor + 1;
          break;
        }
      }
    }
  }
}

async function collectDefinedClasses(dir, defined) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectDefinedClasses(full, defined);
      continue;
    }
    if (!entry.name.endsWith(".css")) continue;

    const css = (await readFile(full, "utf8")).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    for (const match of css.matchAll(/(?:^|[\s,>+~()])\.((?:[\w-]|\\.)+)/g)) {
      const name = match[1].replace(/\\(.)/g, "$1");
      if (/^[A-Za-z_-]/.test(name)) defined.add(name);
    }

    // Compound selectors such as `.send.stop-btn` are not preceded by a
    // delimiter, so collect them separately. Digit-leading matches are values
    // (0.5rem, 1.5s), not class names.
    for (const match of css.matchAll(/\.([A-Za-z_-][\w-]*)/g)) {
      defined.add(match[1]);
    }
  }
}

const used = new Map();
for (const file of await walk(SRC)) {
  const relative = path.relative(ROOT, file);
  used.set(relative, new Set());
  collectFromSource(await readFile(file, "utf8"), relative, used);
}

const defined = new Set();
await collectDefinedClasses(SRC, defined);

let failures = 0;
for (const [file, tokens] of [...used].sort()) {
  const missing = [...tokens]
    .filter((token) => !defined.has(token) && !ALLOWED.has(token))
    .sort();

  if (missing.length) {
    failures += missing.length;
    console.error(`\n${file}`);
    console.error(`  missing: ${missing.join(", ")}`);
  }
}

if (failures) {
  console.error(`\n${failures} undefined class name(s).`);
  process.exit(1);
}

console.log(
  `All class names resolve (${used.size} files, ${defined.size} selectors).`,
);
