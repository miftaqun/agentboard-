// Deploy AgentBoard to BNB Chain mainnet (56) from Semu's burner wallet.
// Authorized by Mif 2026-11-19 (route: burner wallet funded with 0.005 BNB).
// Idempotent: if deployments/mainnet.json already records a deployment, exits 0 without sending anything.
// Constructor arg is fixed to the official Agent ID contract. No other parameters exist.
import fs from "node:fs";
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ethers } from "ethers";

const AGENT_ID = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
const MIN_BALANCE = ethers.parseEther("0.002");
const STATE = new URL("../deployments/mainnet.json", import.meta.url);
const RPCS = [
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed.bnbchain.org",
  "https://bsc-dataseed3.binance.org",
];

if (fs.existsSync(STATE)) {
  console.log("ALREADY_DEPLOYED", fs.readFileSync(STATE, "utf8"));
  process.exit(0);
}
const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) https.globalAgent = new HttpsProxyAgent(proxy);

const burner = JSON.parse(fs.readFileSync("/home/hatch/workspace/nilly/burner-evm.json", "utf8"));
const artifact = JSON.parse(fs.readFileSync(new URL("../build/AgentBoard.json", import.meta.url), "utf8"));

let provider = null, wallet = null, lastErr = null;
for (const url of RPCS) {
  try {
    const p = new ethers.JsonRpcProvider(url, 56, { staticNetwork: true });
    const net = await p.getNetwork();
    if (net.chainId !== 56n) throw new Error("wrong chain " + net.chainId);
    provider = p;
    wallet = new ethers.Wallet(burner.private_key, p);
    break;
  } catch (e) { lastErr = e; }
}
if (!wallet) { console.error("NO_RPC", lastErr?.message); process.exit(2); }

const bal = await provider.getBalance(wallet.address);
console.log("deployer:", wallet.address, "| balance BNB:", ethers.formatEther(bal));
if (bal < MIN_BALANCE) { console.error("NOT_FUNDED: balance below 0.002 BNB"); process.exit(3); }

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
console.log("deploying AgentBoard with agentId =", AGENT_ID);
const contract = await factory.deploy(AGENT_ID);
const tx = contract.deploymentTransaction();
console.log("tx:", tx.hash);
const receipt = await tx.wait();
if (!receipt || receipt.status !== 1) { console.error("DEPLOY_TX_FAILED", receipt?.status); process.exit(4); }
const address = await contract.getAddress();
const code = await provider.getCode(address);
if (!code || code === "0x") { console.error("NO_CODE_AT_ADDRESS"); process.exit(5); }
const wired = await contract.agentId();
if (wired.toLowerCase() !== AGENT_ID.toLowerCase()) { console.error("AGENTID_MISMATCH", wired); process.exit(6); }
const stats = await contract.stats();
const record = {
  project: "AgentBoard",
  chainId: 56,
  address,
  txHash: tx.hash,
  block: receipt.blockNumber,
  deployer: wallet.address,
  agentId: AGENT_ID,
  statsAtDeploy: { agents: stats[0].toString(), checkIns: stats[1].toString(), notes: stats[2].toString() },
  deployedAt: new Date().toISOString(),
};
fs.writeFileSync(STATE, JSON.stringify(record, null, 2));
console.log("DEPLOYED", JSON.stringify(record, null, 2));
