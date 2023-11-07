import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import EthersT from "ethers";

import { VechainHardhatPluginError } from "@vechain/hardhat-vechain";
import "./type-extensions";

import {
    getContractAt,
    getContractAtFromArtifact,
    getContractFactory,
    getContractFactoryFromArtifact,
    getImpersonatedSigner,
    getSigner,
    getSigners,
    deployContract
} from "@nomicfoundation/hardhat-ethers/internal/helpers";
import { HardhatEthersProvider as HardhatEthersProviderT } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { modifyFactory } from "@vechain/web3-providers-connex/dist/ethers";

extendEnvironment(hre => {
    if (hre.vechain === undefined) {
        if (hre.network.name.includes("vechain")) {
            throw new VechainHardhatPluginError("vechain-ethers plugin requires hardhat-vechain");
        } else {
            return;
        }
    }

    hre.ethers = lazyObject(() => {
        const { ethers } = require("ethers") as typeof EthersT;
        const { HardhatEthersProvider } = require("@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider") as {
            HardhatEthersProvider: typeof HardhatEthersProviderT;
        }

        var provider = new HardhatEthersProvider(
            hre.vechain!,
            hre.network.name
        )

        provider.getNetwork = async function() {
            const chainId = await this.send("eth_chainId", []);
            const hexChainId = chainId.toString(16);
            return new ethers.Network(hre.network.name, "0x" + hexChainId);
        };

        provider.getSigner = async (address?: string | number | undefined) => {
            if (address === null || address === undefined) {
                address = 0;
            }
            const accountsPromise = provider.send("eth_accounts", []);

            // Account index
            if (typeof address === "number") {
                const accounts = await accountsPromise;
                if (address >= accounts.length) {
                    throw new Error(`Address index out of bounds: ${address}`);
                }
                
                let defaultSigner = await getSigner(hre, accounts[address]);

                defaultSigner.signTransaction = async (transaction: any) => {
                    return hre.vechain!.sign(transaction);
                }
                return defaultSigner;
            }
            else {
                // If the address is a string, you might want to handle it differently or throw another error.
                throw new Error(`Unsupported address type: ${address}`);
            }
        }

        return {
            ...ethers,

            provider,

            getSigner: (address: string) => getSigner(hre, address),
            getSigners: () => getSigners(hre),
            getContractAtFromArtifact: getContractAtFromArtifact.bind(null, hre),
            getContractAt: getContractAt.bind(null, hre),
            getImpersonatedSigner: (address: string) =>
                getImpersonatedSigner(hre, address),
            getContractFactory: ((...args: any[]) => {
                const bound = getContractFactory.bind(null, hre) as any;
                return bound(...args).then(modifyFactory);
            }) as any,
            getContractFactoryFromArtifact: ((...args: any[]) => {
                const bound = getContractFactoryFromArtifact.bind(null, hre) as any;
                return bound(...args).then(modifyFactory);
            }) as any,
            deployContract: deployContract.bind(null, hre) as any,
        };
    });
});