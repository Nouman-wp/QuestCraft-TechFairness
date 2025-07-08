const hre = require("hardhat");

async function main() {
  const QuestBadge = await hre.ethers.getContractFactory("QuestBadge");

  
  const [deployer] = await hre.ethers.getSigners();

  
  const questBadge = await QuestBadge.deploy(deployer.address);

  await questBadge.waitForDeployment();
  console.log(`⛓️ Contract deployed to: ${questBadge.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
