import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: {
        mnemonic: "pool grab screen stick subject use issue retire live merry universe sing",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20
      },
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000
    },
    zama: {
      url: "https://devnet.zama.ai",
      accounts: {
        mnemonic: "pool grab screen stick subject use issue retire live merry universe sing",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20
      },
      chainId: 8009
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};