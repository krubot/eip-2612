require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("./tasks")

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: JSON.parse(process.env.PRIVATE_KEYS)
    }
  },
  defaultNetwork: "goerli",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
  },
};
