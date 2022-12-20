require("dotenv").config();

const { writeFileSync } = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  console.log("Deploying contracts with the account: ", accounts[0].address);

  console.log("Account balance: ", (await accounts[0].getBalance()).toString());

  if (process.env.GOERLI_EIP_2612_CONTRACT == null) {
    var airdrop = []

    for (account of accounts) {
      airdrop.push({airdropAddress: account.address,airdropAmount: ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(18))});
    }

    const Example = await ethers.getContractFactory("Example");
    const example = await Example.deploy("MyToken","HIX",airdrop);

    console.log("Transaction hash of the deployment: ", example.deployTransaction.hash);

    await example.deployed();

    console.log("Contract has been deployed at: ", example.address);

    writeFileSync('.env','GOERLI_EIP_2612_CONTRACT=\"' + example.address + '\"\n',{flag:'a+'});
  } else {
    console.log("Contract has already been deployed at: ", process.env.GOERLI_EIP_2612_CONTRACT);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
