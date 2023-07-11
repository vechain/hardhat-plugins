import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import type EthersT from "ethers";

import { VechainHardhatPluginError } from "@vechain/hardhat-vechain";
import { ConnexProviderWrapper } from "@vechain/hardhat-vechain";
import "./type-extensions";

import {
    getContractAt,
    getContractAtFromArtifact,
    getContractFactory,
    getContractFactoryFromArtifact,
    getImpersonatedSigner,
    getSigner,
    getSigners,
} from "@nomiclabs/hardhat-ethers/internal/helpers";
import { createUpdatableTargetProxy } from "@nomiclabs/hardhat-ethers/internal/updatable-target-proxy";
import { modifyFactory, modifyProvider } from "@vechain/web3-providers-connex/dist/ethers";
import { EthersProviderWrapper } from "@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper";
import { FactoryOptions, HardhatRuntimeEnvironment } from "hardhat/types";

const registerCustomInspection = (BigNumber: any) => {
    const inspectCustomSymbol = Symbol.for("nodejs.util.inspect.custom");

    BigNumber.prototype[inspectCustomSymbol] = function () {
        return `BigNumber { value: "${this.toString()}" }`;
    };
};

const modified = (provider: ConnexProviderWrapper) => {
    let modifiedProvider =  modifyProvider(new EthersProviderWrapper(provider as any));

    let getDefaultSigner = modifiedProvider.getSigner.bind(modifiedProvider);
    modifiedProvider.getSigner = (addressOrIndex) => {
        let defaultSigner = getDefaultSigner(addressOrIndex);
        defaultSigner.signTransaction = async (transaction) => {
            return provider.sign(transaction)
        }
        return defaultSigner;
    }

    return modifiedProvider
}

extendEnvironment(hre => {
    if (hre.vechain === undefined) {
        if (hre.network.name.includes("vechain")) {
            throw new VechainHardhatPluginError("Ethers plugin requires hardhat-vechain");
        } else {
            return;
        }
    }
    hre.ethers = lazyObject(() => {
        if (!hre.network.name.includes("vechain")) {
            throw new VechainHardhatPluginError("@vechain/hardhat-ethers expects @vechain/hardhat-vechain");
        }

        const { ethers } = require("ethers") as typeof EthersT;
        registerCustomInspection(ethers.BigNumber);

        const provider = hre.vechain!;
        const jsonRpcProvider = modified(provider);
        const { proxy } = createUpdatableTargetProxy(jsonRpcProvider);

        return {
            ...ethers,

            provider: proxy,

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
            deployContract: (async (
                hre: HardhatRuntimeEnvironment,
                name: string,
                argsOrSignerOrOptions?: any[] | EthersT.Signer | FactoryOptions,
                signerOrOptions?: EthersT.Signer | FactoryOptions
            ) => {
                let args = [];
                if (Array.isArray(argsOrSignerOrOptions)) {
                    args = argsOrSignerOrOptions;
                } else {
                    signerOrOptions = argsOrSignerOrOptions;
                }
                const bound = getContractFactory.bind(null, hre) as any;
                const factory = await bound(name, signerOrOptions).then(modifyFactory);
                return factory.deploy(...args);
            }).bind(null, hre) as any
        };
    });
});