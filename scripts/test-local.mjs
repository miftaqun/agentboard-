// Local end-to-end test: compile with solc-js, deploy MockAgentID + AgentBoard
// to an in-process ganache chain, and exercise every rule of the board.
import fs from "node:fs";
import solc from "solc";
import ganache from "ganache";
import { ethers } from "ethers";

function compile() {
  const sources = {
    "AgentBoard.sol": { content: fs.readFileSync(new URL("../contracts/AgentBoard.sol", import.meta.url), "utf8") },
    "MockAgentID.sol": { content: fs.readFileSync(new URL("../contracts/MockAgentID.sol", import.meta.url), "utf8") },
  };
  const input = {
    language: "Solidity",
    sources,
    settings: {
      evmVersion: "paris",
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (out.errors || []).filter((e) => e.severity === "error");
  if (errors.length) {
    console.error(errors.map((e) => e.formattedMessage).join("\n"));
    process.exit(1);
  }
  const warnings = (out.errors || []).filter((e) => e.severity === "warning");
  warnings.forEach((w) => console.log("WARN:", w.formattedMessage.split("\n")[0]));
  fs.mkdirSync(new URL("../build", import.meta.url), { recursive: true });
  for (const name of ["AgentBoard", "MockAgentID"]) {
    const c = out.contracts[`${name}.sol`][name];
    fs.writeFileSync(new URL(`../build/${name}.json`, import.meta.url),
      JSON.stringify({ abi: c.abi, bytecode: c.evm.bytecode.object }, null, 2));
  }
  return {
    board: out.contracts["AgentBoard.sol"].AgentBoard,
    mock: out.contracts["MockAgentID.sol"].MockAgentID,
  };
}

const { board, mock } = compile();
console.log("compiled OK. AgentBoard bytecode bytes:", board.evm.bytecode.object.length / 2);

const provider = new ethers.BrowserProvider(ganache.provider({ logging: { quiet: true } }));
const signers = [];
for (let i = 0; i < 5; i++) signers.push(await provider.getSigner(i));
const [deployer, alice, bob, carol, stranger] = signers;

async function deploy(artifact, signer, args = []) {
  const f = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, signer);
  const c = await f.deploy(...args);
  await c.waitForDeployment();
  return c;
}

const mockC = await deploy(mock, deployer);
const boardC = await deploy(board, deployer, [await mockC.getAddress()]);
console.log("mock:", await mockC.getAddress(), "| board:", await boardC.getAddress());

let pass = 0, fail = 0;
function check(name, cond) { cond ? (pass++, console.log("  PASS", name)) : (fail++, console.log("  FAIL", name)); }
async function expectRevert(name, txPromise, errName) {
  try {
    const tx = await txPromise;
    const rc = await tx.wait();
    check(name + " (should revert)", rc.status === 0);
  } catch (e) {
    const msg = e.message || "";
    check(name, msg.includes(errName) || msg.includes("revert"));
    if (!(msg.includes(errName))) console.log("    revert reason seen:", msg.slice(0, 160));
  }
}

// Setup identities: alice=digi, bob=robo, carol=mira; stranger has no Agent ID.
await mockC.connect(alice).register("digi");
await mockC.connect(bob).register("robo");
await mockC.connect(carol).register("mira");

// 1. Non-holder cannot check in.
await expectRevert("stranger checkIn reverts NotAgent", boardC.connect(stranger).checkIn(), "NotAgent");
// 2. Holder checks in.
await boardC.connect(alice).checkIn();
check("alice streak = 1", (await boardC.currentStreak(await alice.getAddress())) === 1n);
check("totalAgents = 1", (await boardC.totalAgents()) === 1n);
check("handleSnapshot = digi", (await boardC.handleSnapshot(await alice.getAddress())) === "digi");
// 3. Second check-in same day reverts.
await expectRevert("alice double checkIn reverts", boardC.connect(alice).checkIn(), "AlreadyCheckedInToday");
// 4. Bob checks in; totals move.
await boardC.connect(bob).checkIn();
check("totalAgents = 2", (await boardC.totalAgents()) === 2n);
check("totalCheckIns = 2", (await boardC.totalCheckIns()) === 2n);
// 5. Next day: alice streak grows to 2; carol starts at 1.
await provider.send("evm_increaseTime", [86400]);
await provider.send("evm_mine", []);
await boardC.connect(alice).checkIn();
check("alice streak day2 = 2", (await boardC.currentStreak(await alice.getAddress())) === 2n);
await boardC.connect(carol).checkIn();
check("carol streak = 1", (await boardC.currentStreak(await carol.getAddress())) === 1n);
// 6. Skip a day for alice -> streak resets to 1.
await provider.send("evm_increaseTime", [2 * 86400]);
await provider.send("evm_mine", []);
await boardC.connect(alice).checkIn();
check("alice streak reset = 1", (await boardC.currentStreak(await alice.getAddress())) === 1n);
check("alice bestStreak = 2", (await boardC.bestStreak(await alice.getAddress())) === 2n);
// 7. Notes: alice -> robo by handle name.
await boardC.connect(alice).leaveNote("robo", "gm robo, welcome to the board");
check("notesCount = 1", (await boardC.notesCount()) === 1n);
const n0 = await boardC.getNote(0);
check("note fromHandle = digi", n0.fromHandle === "digi");
check("note toHandle = robo", n0.toHandle === "robo");
check("note to = bob addr", n0.to === (await bob.getAddress()));
check("bob notesReceived = 1", (await boardC.notesReceivedCount(await bob.getAddress())) === 1n);
// 8. Note to unknown handle reverts.
await expectRevert("note to unknown reverts", boardC.connect(alice).leaveNote("nosuchagent", "hi"), "UnknownHandle");
// 9. Note to self reverts.
await expectRevert("note to self reverts", boardC.connect(alice).leaveNote("digi", "me"), "NoteToSelf");
// 10. Empty note reverts; overlong reverts.
await expectRevert("empty note reverts", boardC.connect(bob).leaveNote("digi", ""), "EmptyNote");
await expectRevert("overlong note reverts", boardC.connect(bob).leaveNote("digi", "x".repeat(281)), "NoteTooLong");
// 11. Non-holder cannot leave a note.
await expectRevert("stranger note reverts NotAgent", boardC.connect(stranger).leaveNote("digi", "hi"), "NotAgent");
// 12. Stats view.
const st = await boardC.stats();
check("stats agents = 3", st.agents === 3n && st.checkIns === 5n && st.noteCount === 1n);
// 13. Contract holds no balance and has no payable surface (bytecode sanity: balance 0).
check("board balance = 0", (await provider.getBalance(await boardC.getAddress())) === 0n);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
