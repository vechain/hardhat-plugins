import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import ConnexProviderWrapper from "./ConnexProviderWrapper";

extendEnvironment(hre => {
    if (hre.network.name !== "vechain") {
        return;
    }
    hre.vechain = lazyObject(() => new ConnexProviderWrapper(hre.network.config));
    hre.network.provider = hre.vechain;
});

export * from "./constants";