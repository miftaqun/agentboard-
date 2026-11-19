// Verify the web page's dependency-free ABI decoders against ground truth:
// deploy Mock+Board on ganache, act, then decode RAW eth_call / eth_getLogs
// results with the exact helper functions copied from site/index.html and
// compare with ethers' decoding.
import fs from "node:fs";
import ganache from "ganache";
import { ethers } from "ethers";

/* ===== helpers copied verbatim from site/index.html ===== */
function word(hex, i) { return hex.slice(2 + i * 64, 2 + (i + 1) * 64); }
function toUint(hex, i) { return BigInt("0x" + word(hex, i)); }
function toAddr(hex, i) { return "0x" + word(hex, i).slice(24); }
function decStr(hex, offWord) {
  const off = Number(toUint(hex, offWord)) * 2 + 2;
  const len = Number(BigInt("0x" + hex.slice(off, off + 64)));
  const bytes = [];
  for (let j = 0; j < len; j++) bytes.push(parseInt(hex.slice(off + 64 + j * 2, off + 66 + j * 2), 16));
  return new TextDecoder().decode(new Uint8Array(bytes));
}
function encUint(n) { return BigInt(n).toString(16).padStart(64, "0"); }
/* ======================================================== */

const board = JSON.parse(fs.readFileSync(new URL("../build/AgentBoard.json", import.meta.url), "utf8"));
const mock = JSON.parse(fs.readFileSync(new URL("../build/MockAgentID.json", import.meta.url), "utf8"));
const g = ganache.provider({ logging: { quiet: true } });
const provider = new ethers.BrowserProvider(g);
const deployer = await provider.getSigner(0);
const alice = await provider.getSigner(1);
const bob = await provider.getSigner(2);
async function deploy(artifact, signer, args = []) {
  const f = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const c = await f.deploy(...args); await c.waitForDeployment(); return c;
}
const mockC = await deploy(mock, deployer);
const boardC = await deploy(board, deployer, [await mockC.getAddress()]);
const B = await boardC.getAddress();
await mockC.connect(alice).register("digi");
await mockC.connect(bob).register("robo");
await boardC.connect(alice).checkIn();
await boardC.connect(bob).checkIn();
await boardC.connect(alice).leaveNote("robo", "gm robo — decoder check ✓ unicode: héllo");

let pass = 0, fail = 0;
const check = (n, c) => c ? (pass++, console.log("  PASS", n)) : (fail++, console.log("  FAIL", n));
const rawCall = (data) => g.request({ method: "eth_call", params: [{ to: B, data }, "latest"] });

// stats()
const sRaw = await rawCall("0xd80528ae");
check("stats agents=2", toUint(sRaw, 0) === 2n);
check("stats checkIns=2", toUint(sRaw, 1) === 2n);
check("stats notes=1", toUint(sRaw, 2) === 1n);

// getNote(0) raw vs ethers — single dynamic struct return: strip leading offset word
const nRawFull = await rawCall("0xa965a941" + encUint(0));
const nRaw = "0x" + nRawFull.slice(66);
const truth = await boardC.getNote(0);
check("note.from", toAddr(nRaw, 0).toLowerCase() === truth.from.toLowerCase());
check("note.to", toAddr(nRaw, 1).toLowerCase() === truth.to.toLowerCase());
check("note.fromHandle", decStr(nRaw, 2) === truth.fromHandle);
check("note.toHandle", decStr(nRaw, 3) === truth.toHandle);
check("note.message (unicode)", decStr(nRaw, 4) === truth.message);
check("note.timestamp", toUint(nRaw, 5) === truth.timestamp);

// CheckedIn logs raw decode
const logs = await g.request({ method: "eth_getLogs", params: [{ address: B, fromBlock: "0x0", toBlock: "latest",
  topics: ["0xf10295c597748f2c3ac0936236c2bf94808674466164eeed758a134b46b8f1be"] }] });
check("2 checkin logs", logs.length === 2);
const l0 = logs[0];
check("log agent topic", "0x" + l0.topics[1].slice(26) === (await alice.getAddress()).toLowerCase());
check("log handle", decStr(l0.data, 0) === "digi");
check("log streak word1", toUint(l0.data, 1) === 1n);
check("log total word2", toUint(l0.data, 2) === 1n);

console.log(`\nDECODER RESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
