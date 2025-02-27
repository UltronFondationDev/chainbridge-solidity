/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 import { HardhatUserConfig } from 'hardhat/config';
 import 'hardhat-contract-sizer';
 import 'hardhat-gas-reporter';
 import '@typechain/hardhat';
 import '@nomiclabs/hardhat-etherscan';
 import '@nomiclabs/hardhat-waffle';
 import '@nomiclabs/hardhat-ethers';

 import "./deploy/deploy";
 import "./deploy/changeFee";
 import "./deploy/setResourceIds";
 import "./deploy/changeRelayers";
 import "./deploy/withdraw";
 import "./deploy/changeNonce";
 import "./deploy/multisig";
 import "./deploy/changeTreasury";
 require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./hardhat-test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/i2LgfhBeI-JidguSNlFuToo7kPSkFBPb",
        blockNumber: 11095000,
      },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    ultron: {
      url: `https://ultron-rpc.net`,
      chainId: 1231,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ethereum: {
      url: "https://eth-mainnet.alchemyapi.io/v2/yTaJRZrkn9LUEI6S7_GQhU4_9fhMgMsv",
      chainId: 1,
      gasPrice: 25000000000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      url: "https://polygon-bor.publicnode.com",
      chainId: 137,
      gasPrice: 40000000000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    fantom: {
      url: "https://rpc.ftm.tools/",
      chainId: 250,
      gasPrice: 50000000000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ultron_testnet: {
      url: `https://ultron-dev.io`,
      chainId: 1230,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      chainId: 5,
      gas: 2100000,
      gasPrice: 8000000000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsc_testnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      chainId: 97,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    avalanche_fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    }, 
    mumbai: {
      url: "https://rpc-mumbai.matic.today",
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    }, 
    fantom_testnet: {
      url: `https://rpc.testnet.fantom.network/`,
      chainId: 4002,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true
  }
};

export default config;