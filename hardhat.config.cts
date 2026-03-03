import { HardhatUserConfig } from 'hardhat/config';
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '.env.local' });

const PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  '0x0000000000000000000000000000000000000000000000000000000000000001';
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const BASE_MAINNET_RPC = process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    'base-sepolia': {
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    'base-mainnet': {
      url: BASE_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
