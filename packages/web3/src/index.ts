import { extendEnvironment } from "hardhat/config";
import { lazyFunction, lazyObject } from "hardhat/plugins";
import { Web3HTTPProviderAdapter } from "@nomiclabs/hardhat-web3/dist/src/web3-provider-adapter"
import { VechainHardhatPluginError } from "@vechain/hardhat-vechain";
import "./type-extensions";

extendEnvironment(hre => {
    if (hre.vechain === undefined) {
        throw new VechainHardhatPluginError("vechain-web3 plugin requires hardhat-vechain");
    }
    hre.Web3 = lazyFunction(() => require("web3"));
    hre.web3 = lazyObject(() => {
        const Web3 = require("web3");
        return new Web3(new Web3HTTPProviderAdapter(hre.vechain!));
    });
});