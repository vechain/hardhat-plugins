import { SimpleNet } from "@vechain/connex-driver";
import { HttpNetworkConfig } from "hardhat/types";
import { VECHAIN_URL_SOLO } from "../constants";

export function createNetwork(config: HttpNetworkConfig) {
    if (config.url === undefined) {
        config.url = VECHAIN_URL_SOLO;
        console.info(`Using default localhost url for VeChain network: ${config.url}`);
    }
    return new SimpleNet(config.url);
}
