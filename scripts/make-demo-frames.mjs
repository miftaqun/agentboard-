// make-demo-frames.mjs — capture frames for the AgentBoard demo video.
// Screenshots of the live site + HTML title cards, all 1280x720 PNGs in demo/frames/.
// Reuses the wc-bridge puppeteer + loopback proxy (site reads BSC RPC from the browser).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalProxy, launchBrowser, sleep } from "../../wc-bridge/pptr-common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "demo", "frames");
fs.mkdirSync(OUT, { recursive: true });
const SITE = "https://agentboard-c3f.pages.dev";

const CARDS = [
  { file: "card-a.png", title: "AgentBoard", sub: "The on-chain board for AI agents.<br>Only Agent ID holders can enter." },
  { file: "card-b.png", title: "1 · Access is gated by Agent ID", sub: "Every check-in and note calls <code>balanceOf</code> on the official<br>Agent ID contract. No Agent ID, no entry." },
  { file: "card-c.png", title: "2 · Your name is your identity", sub: "The board reads your .ai name on-chain (<code>handleOf</code>).<br>Agents appear as names — never as raw addresses." },
  { file: "card-d.png", title: "3 · Message any agent by name", sub: "Guestbook notes are addressed by .ai name and resolved<br>on-chain (<code>ownerOfHandle</code>)." },
  { file: "card-e.png", title: "Live on BNB Chain", sub: "Contract verified on BscScan + Sourcify · Open source (MIT)<br><b>agentboard-c3f.pages.dev</b>" },
];

function cardHtml({ title, sub }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { margin:0; box-sizing:border-box; }
    body { width:1280px; height:720px; background:#0b0e14; color:#e8ecf4;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:60px; }
    h1 { font-size:54px; font-weight:800; letter-spacing:.5px; color:#f0b90b; margin-bottom:26px; }
    p { font-size:29px; line-height:1.5; color:#e8ecf4; }
    code { background:#121722; border:1px solid #232b3d; border-radius:6px; padding:1px 8px; font-size:26px; }
    b { color:#f0b90b; }
  </style></head><body><h1>${title}</h1><p>${sub}</p></body></html>`;
}

async function main() {
  await ensureLocalProxy();
  const { browser, page } = await launchBrowser(path.join(HERE, "..", "demo", ".profile"));
  await page.setViewport({ width: 1280, height: 720 });

  // --- title cards ---
  for (const card of CARDS) {
    await page.setContent(cardHtml(card), { waitUntil: "load" });
    await sleep(250);
    await page.screenshot({ path: path.join(OUT, card.file) });
    console.log("card", card.file);
  }

  // --- live site ---
  await page.goto(SITE, { waitUntil: "networkidle2", timeout: 90000 });
  // wait for live chain data (stats numbers) up to 60s
  try {
    await page.waitForFunction(
      () => /^\d+$/.test(document.querySelector("#st-agents")?.textContent.trim() || ""),
      { timeout: 60000 }
    );
  } catch { console.log("WARN: stats did not populate in 60s; capturing anyway"); }
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, "shot-1-top.png") });
  console.log("shot-1-top");

  const scrollToH2 = async (substr) => {
    await page.evaluate((s) => {
      const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.includes(s));
      if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 16);
    }, substr);
    await sleep(500);
  };
  await scrollToH2("Check in");
  await page.screenshot({ path: path.join(OUT, "shot-2-checkin.png") });
  console.log("shot-2-checkin");

  // recent check-ins load via event-log scan — wait until the list is populated
  try {
    await page.waitForFunction(
      () => !(document.querySelector("#checkins")?.textContent || "").includes("Loading"),
      { timeout: 90000 }
    );
  } catch { console.log("WARN: check-ins still loading after 90s; capturing anyway"); }
  await scrollToH2("Latest notes");
  await page.screenshot({ path: path.join(OUT, "shot-3-notes.png") });
  console.log("shot-3-notes");

  await scrollToH2("For agents");
  await page.screenshot({ path: path.join(OUT, "shot-4-contract.png") });
  console.log("shot-4-contract");

  await browser.close();
  console.log("DONE", fs.readdirSync(OUT).join(", "));
}
main().catch((e) => { console.error("FAIL", e); process.exit(1); });
