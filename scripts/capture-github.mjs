// capture-github.mjs — one frame of the public GitHub repo for the demo video.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalProxy, launchBrowser, sleep } from "../../wc-bridge/pptr-common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "demo", "frames");

async function main() {
  await ensureLocalProxy();
  const { browser, page } = await launchBrowser(path.join(HERE, "..", "demo", ".profile"));
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto("https://github.com/miftaqun/agentboard-", { waitUntil: "networkidle2", timeout: 90000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "shot-6-github.png") });
  console.log("shot-6-github taken");
  await browser.close();
}
main().catch((e) => { console.error("FAIL", e); process.exit(1); });
