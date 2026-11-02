#!/usr/bin/env node
/**
 * Dependency-free screenshot harness.
 *
 * Starts a headless Chrome/Edge with the DevTools protocol, captures the
 * dashboard in both themes at four widths, and writes PNGs to .artifacts/shots.
 *
 * Usage:
 *   npm run dev -- --port 5199        (in another terminal)
 *   SHOT_URL=http://localhost:5199/ npm run shots
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, ".artifacts", "shots");
const URL = process.env.SHOT_URL || "http://localhost:5173/";
const PORT = Number(process.env.SHOT_PORT || 9333);

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const VIEWPORTS = [
  {
    width: 1440,
    height: 900,
    routes: [
      "overview",
      "forecast",
      "alerts",
      "history",
      "settings",
      "maps",
    ],
  },
  { width: 1024, height: 900, routes: ["overview", "forecast", "alerts"] },
  { width: 768, height: 1024, routes: ["overview", "alerts"] },
  { width: 390, height: 844, routes: ["overview"] },
];

const ROUTE_LABELS = {
  overview: "Overview",
  forecast: "7-Day Forecast",
  alerts: "Safety & Alerts",
  history: "Query History",
  settings: "Preferences",
  maps: "Interactive Radar",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  const found = CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      "No Chrome/Edge binary found. Set CHROME_PATH to the executable.",
    );
  }
  return found;
}

async function waitForPort(port, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  throw new Error(`DevTools endpoint on port ${port} did not start.`);
}

function createClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 0;

  const ready = new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = () => reject(new Error("DevTools socket failed."));
  });

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const entry = message.id && pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
  };

  return {
    ready,
    send(method, params = {}) {
      const id = (nextId += 1);
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed.");
  }
  return result.result?.value;
}

async function clickRoute(client, label) {
  return evaluate(
    client,
    `(() => {
      const button = [...document.querySelectorAll(".side-item")].find((item) =>
        item.textContent.includes(${JSON.stringify(label)}),
      );
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
}

async function waitForApp(client, timeout = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const ready = await evaluate(
      client,
      '!!document.querySelector(".app-shell")',
    );
    if (ready) return;
    await sleep(250);
  }
}

async function setTheme(client, dark) {
  await evaluate(
    client,
    `localStorage.setItem("weathergpt_dark", "${dark ? "true" : "false"}")`,
  );
  await client.send("Page.reload", { ignoreCache: false });
  await sleep(3200);
  await waitForApp(client);
}

async function capture(client, file) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(file, Buffer.from(screenshot.data, "base64"));
}

async function main() {
  const browser = findBrowser();
  const profile = await mkdtemp(path.join(os.tmpdir(), "wgpt-shots-"));
  const child = spawn(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );

  try {
    await waitForPort(PORT);

    const targetResponse = await fetch(
      `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(URL)}`,
      { method: "PUT" },
    );
    const target = await targetResponse.json();
    const client = createClient(target.webSocketDebuggerUrl);
    await client.ready;

    await client.send("Page.enable");
    await client.send("Runtime.enable");

    await mkdir(OUT, { recursive: true });

    for (const dark of [true, false]) {
      const theme = dark ? "dark" : "light";

      await client.send("Page.navigate", { url: URL });
      await sleep(2500);
      await waitForApp(client);
      await setTheme(client, dark);

      for (const viewport of VIEWPORTS) {
        await client.send("Emulation.setDeviceMetricsOverride", {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: viewport.width < 600,
        });
        // Reload after changing viewport so mobile layout rules are evaluated
        // from a clean load instead of a resized desktop page.
        await client.send("Page.reload", { ignoreCache: false });
        await sleep(2800);
        await waitForApp(client);

        for (const route of viewport.routes) {
          const label = ROUTE_LABELS[route];
          const clicked = await clickRoute(client, label);
          if (!clicked) {
            console.warn(`Route not found in the sidebar: ${label}`);
            continue;
          }
          await sleep(650);
          await evaluate(client, "window.scrollTo(0, 0)");
          await sleep(120);

          const innerWidth = await evaluate(client, "window.innerWidth");
          const file = path.join(OUT, `${theme}-${viewport.width}-${route}.png`);
          await capture(client, file);
          console.log(
            `${path.relative(ROOT, file)} (innerWidth ${innerWidth})`,
          );
        }
      }
    }

    client.close();
    console.log(`\nScreenshots written to ${path.relative(ROOT, OUT)}`);
  } finally {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } catch {
      child.kill();
    }
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
