const { ethers, upgrades } = require("hardhat");

async function main() {
  let ERC20;
  let erc20;

  let HARIBO;
  let haribo;

  ERC20 = await ethers.getContractFactory("HariboToken");
  erc20 = await ERC20.deploy();
  HARIBO = await ethers.getContractFactory("Haribo");
  haribo = await upgrades.deployProxy(HARIBO, [erc20.address]);

  console.log('erc20 address is ', erc20.address);
  console.log('haribo address is ', haribo.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });