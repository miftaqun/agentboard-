import fs from "node:fs";
import { ethers } from "ethers";
const burner = JSON.parse(fs.readFileSync("/home/hatch/workspace/nilly/burner-evm.json", "utf8"));
const key = burner.privateKey || burner.private_key || burner.key;
const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
const w = new ethers.Wallet(key, provider);
console.log("burner:", w.address);
console.log("tBNB balance:", ethers.formatEther(await provider.getBalance(w.address)));
