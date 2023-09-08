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
import { modifyFactory, modifyProvider } from "@vechain/web3-providers-connex/dist/ethers";

import * as thor from '@vechain/web3-providers-connex'
import { Framework } from '@vechain/connex-framework'
import { Driver, SimpleNet, SimpleWallet } from '@vechain/connex-driver'
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

        const provider = new HardhatEthersProvider(
            hre.vechain!,
            hre.network.name
        )

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