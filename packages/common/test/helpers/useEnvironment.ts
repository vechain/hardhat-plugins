import { resetHardhatContext } from "hardhat/plugins-testing";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

import "./type-extensions";

declare module "mocha" {
  interface Context {
    env: HardhatRuntimeEnvironment;
  }
}

export function useEnvironment(
  fixtureProjectName: string,
  networkName = "vechain"
) {
  beforeEach("Loading hardhat environment", async function () {
    process.chdir(path.join(__dirname, "fixture-projects", fixtureProjectName));
    process.env.HARDHAT_NETWORK = networkName;

    this.env = await require("hardhat");
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}