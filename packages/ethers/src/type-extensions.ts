import type { ethers } from "ethers";

import type {
  FactoryOptions as FactoryOptionsT,
  getContractFactory as getContractFactoryT,
  HardhatEthersHelpers,
  Libraries as LibrariesT
} from "@nomiclabs/hardhat-ethers/types";

import "@vechainfoundation/hardhat-common/dist/type-extensions";

// As seen in https://github.com/NomicFoundation/hardhat/blob/290451dc92fc6a40a59a7ffbdf1464874508fd11/packages/hardhat-ethers/src/internal/type-extensions.ts
declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof ethers & HardhatEthersHelpers;
  }

  type Libraries = LibrariesT;
  type FactoryOptions = FactoryOptionsT;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type getContractFactory = typeof getContractFactoryT;
}