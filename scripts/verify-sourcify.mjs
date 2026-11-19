// Submit AgentBoard for Sourcify verification (chain 56) using the EXACT
// standard-JSON input the contract was compiled with (both source files,
// solc 0.8.28, evmVersion paris, optimizer 200) so the metadata can match fully.
import fs from "node:fs";

const ADDRESS = "0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD";
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const stdJsonInput = {
  language: "Solidity",
  sources: {
    "AgentBoard.sol": { content: read("../contracts/AgentBoard.sol") },
    "MockAgentID.sol": { content: read("../contracts/MockAgentID.sol") },
  },
  settings: {
    evmVersion: "paris",
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const body = {
  stdJsonInput,
  compilerVersion: "v0.8.28+commit.7893614a",
  contractIdentifier: "AgentBoard.sol:AgentBoard",
};
const res = await fetch(`https://sourcify.dev/server/v2/verify/56/${ADDRESS}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log("HTTP", res.status);
console.log((await res.text()).slice(0, 1500));
