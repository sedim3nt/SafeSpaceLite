import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SafeSpaceRegistry...");

  const SafeSpaceRegistry = await ethers.getContractFactory("SafeSpaceRegistry");
  const registry = await SafeSpaceRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`SafeSpaceRegistry deployed to: ${address}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("");
  console.log("Next steps:");
  console.log(`1. Update CONTRACT_ADDRESS in src/lib/contracts.ts to: ${address}`);
  console.log("2. Verify on BaseScan (optional):");
  console.log(`   npx hardhat verify --network base-sepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
