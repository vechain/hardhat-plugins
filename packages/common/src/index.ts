import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import ConnexProviderWrapper from "./ConnexProviderWrapper";

extendEnvironment(hre => {
    hre.vechain = lazyObject(() => new ConnexProviderWrapper(hre.network.config));
});