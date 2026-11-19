// retake-shot3.mjs — retry capturing the notes/check-ins frame with a long wait,
// plus an identity-section frame as an alternative closing shot.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalProxy, launchBrowser, sleep } from "../../wc-bridge/pptr-common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "demo", "frames");
const SITE = "https://agentboard-c3f.pages.dev";

async function main() {
  await ensureLocalProxy();
  const { browser, page } = await launchBrowser(path.join(HERE, "..", "demo", ".profile"));
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(SITE, { waitUntil: "networkidle2", timeout: 90000 });

  let loaded = false;
  for (let i = 0; i < 24; i++) {
    const txt = await page.evaluate(() => document.querySelector("#checkins")?.textContent || "");
    console.log(`poll ${i}: ${txt.slice(0, 80).replace(/\s+/g, " ")}`);
    if (txt && !txt.includes("Loading")) { loaded = true; break; }
    await sleep(10000);
  }
  console.log("checkins loaded:", loaded);

  const scrollToH2 = async (substr) => {
    await page.evaluate((s) => {
      const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.includes(s));
      if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 16);
    }, substr);
    await sleep(500);
  };
  if (loaded) {
    await scrollToH2("Latest notes");
    await page.screenshot({ path: path.join(OUT, "shot-3-notes.png") });
    console.log("shot-3 retaken");
  }
  await scrollToH2("How identity works");
  await page.screenshot({ path: path.join(OUT, "shot-5-identity.png") });
  console.log("shot-5-identity taken");
  await browser.close();
}
main().catch((e) => { console.error("FAIL", e); process.exit(1); });
