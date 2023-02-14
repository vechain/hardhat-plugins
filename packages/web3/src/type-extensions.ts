import type Web3 from "web3";

import "@vechainfoundation/hardhat-common/dist/src/type-extensions"

declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        Web3: typeof Web3;
        web3: Web3;
    }
}