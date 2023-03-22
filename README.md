# Hardhat Plugins for Vechain
This is a mono-repo containing plugins that extend the hardhat environment with a [Connex provider](https://github.com/vechain/web3-providers-connex).

## Packages
| package | status | desc |
| - | - | - |
| [hardhat-vechain](packages/vechain) | [![npm](https://badge.fury.io/js/%40vechain%2Fhardhat-vechain.svg)](https://www.npmjs.com/package/@vechain/hardhat-vechain) | Injection of a wrapped connex provider in `hre.vechain` |
| [hardhat-web3](packages/web3) | [![npm](https://badge.fury.io/js/%40vechain%2Fhardhat-web3.svg)](https://www.npmjs.com/package/@vechain/hardhat-web3) | Modification of Hardhat's Web3 environment to use a `hardhat-vechain` provider |
| [hardhat-ethers](packages/ethers) | [![npm](https://badge.fury.io/js/%40vechain%2Fhardhat-ethers.svg)](https://www.npmjs.com/package/@vechain/hardhat-ethers) | Modification of Hardhat's Ethers environment to use a `hardhat-vechain` provider |