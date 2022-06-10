require("dotenv").config();
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  //solidity: "0.8.4",
  //to add multiple solidity versions, use the following format:
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.rinkeby_rpc,
      accounts: [process.env.privateKey],
      chainId: 4,
      blockConfirmations: 4,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"],
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    /* outputFile: "gas-report.txt",
    noColors: true,*/
    currency: "USD",
    coinmarketcap: process.env.coinMarketcap_apiKey,
  },
  namedAccounts: {
    deployer: 0,
    4: 1,
    31337: 2,
  }
};
