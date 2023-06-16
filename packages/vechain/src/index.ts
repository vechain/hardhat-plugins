import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { ConnexProviderWrapper } from "./ConnexProviderWrapper";

extendEnvironment(hre => {
    if (!hre.network.name.includes("vechain")) {
        return;
    }
    hre.vechain = lazyObject(() => new ConnexProviderWrapper(hre.network.config, hre.hardhatArguments.verbose));
    hre.network.provider = hre.vechain;
});

export * from "./ConnexProviderWrapper";
export * from "./constants";
export * from "./error";