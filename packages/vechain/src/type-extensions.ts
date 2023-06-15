import { DelegateOpt } from "@vechain/web3-providers-connex/dist/types";
import { ConnexProviderWrapper } from "./ConnexProviderWrapper";

declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        vechain?: ConnexProviderWrapper;
      }
}

declare module "hardhat/types/config" {
    interface HttpNetworkConfig {
        delegate?: DelegateOpt,
        restful?: boolean,
        remoteSigning?: boolean,
    }
}