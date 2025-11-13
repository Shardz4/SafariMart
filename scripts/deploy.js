const hre = require("hardhat");
const { ethers } = require("hardhat");

// USDC Contract Address on Polygon Mainnet (native USDC)
const USDC_POLYGON_MAINNET = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
// USDC Contract Address on Polygon Mumbai Testnet
const USDC_POLYGON_MUMBAI = "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97";
// For localhost, we'll use a mock address (you can deploy a mock ERC20)
const USDC_LOCALHOST = "0x0000000000000000000000000000000000000000"; // Will be replaced with mock

async function main() {
  console.log("\n🚀 Starting deployment to", hre.network.name, "network...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Determine USDC address based on network
  let usdcAddress;
  if (hre.network.name === "polygon") {
    usdcAddress = USDC_POLYGON_MAINNET;
    console.log("🪙 Using USDC on Polygon Mainnet:", usdcAddress);
  } else if (hre.network.name === "mumbai") {
    usdcAddress = USDC_POLYGON_MUMBAI;
    console.log("🪙 Using USDC on Mumbai Testnet:", usdcAddress);
  } else {
    // For localhost/hardhat, deploy a mock USDC
    console.log("🪙 Deploying Mock USDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("✅ Mock USDC deployed to:", usdcAddress);
    
    // Mint some USDC to deployer for testing
    const mintTx = await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
    await mintTx.wait();
    console.log("💵 Minted 1,000,000 USDC to deployer\n");
  }

  // Deploy RWAToken
  console.log("📦 Deploying RWAToken...");
  const RWAToken = await ethers.getContractFactory("RWAToken");
  const rwaToken = await RWAToken.deploy();
  await rwaToken.waitForDeployment();
  const rwaTokenAddress = await rwaToken.getAddress();
  console.log("✅ RWAToken deployed to:", rwaTokenAddress);

  // Deploy RWAMarketplace
  console.log("\n📦 Deploying RWAMarketplace...");
  const RWAMarketplace = await ethers.getContractFactory("RWAMarketplace");
  const rwaMarketplace = await RWAMarketplace.deploy(rwaTokenAddress, usdcAddress);
  await rwaMarketplace.waitForDeployment();
  const rwaMarketplaceAddress = await rwaMarketplace.getAddress();
  console.log("✅ RWAMarketplace deployed to:", rwaMarketplaceAddress);

  // Verify deployer is owner
  console.log("\n🔍 Verifying deployment...");
  const owner = await rwaToken.owner();
  console.log("RWAToken owner:", owner);
  const marketplaceOwner = await rwaMarketplace.owner();
  console.log("RWAMarketplace owner:", marketplaceOwner);

  console.log("\n" + "=".repeat(80));
  console.log("✨ DEPLOYMENT SUCCESSFUL! ✨");
  console.log("=".repeat(80));
  console.log("\n📋 Contract Addresses:");
  console.log("   RWAToken:", rwaTokenAddress);
  console.log("   RWAMarketplace:", rwaMarketplaceAddress);
  console.log("   USDC Token:", usdcAddress);
  console.log("\n📝 Add these to your .env.local file:");
  console.log(`   NEXT_PUBLIC_RWA_TOKEN_ADDRESS=${rwaTokenAddress}`);
  console.log(`   NEXT_PUBLIC_RWA_MARKETPLACE_ADDRESS=${rwaMarketplaceAddress}`);
  console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log("\n🔗 Network:", hre.network.name);
  console.log("=".repeat(80) + "\n");

  // Wait for block confirmations on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await rwaToken.deploymentTransaction().wait(6);
    await rwaMarketplace.deploymentTransaction().wait(6);
    console.log("✅ Confirmed!\n");

    // Verify on Polygonscan (if on Polygon networks)
    if (hre.network.name === "polygon" || hre.network.name === "mumbai") {
      console.log("🔍 Verifying contracts on Polygonscan...");
      try {
        await hre.run("verify:verify", {
          address: rwaTokenAddress,
          constructorArguments: [],
        });
        await hre.run("verify:verify", {
          address: rwaMarketplaceAddress,
          constructorArguments: [rwaTokenAddress, usdcAddress],
        });
        console.log("✅ Contracts verified on Polygonscan\n");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n", error);
    process.exit(1);
  });