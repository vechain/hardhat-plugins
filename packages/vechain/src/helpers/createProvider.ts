import { HttpNetworkConfig, NetworkConfig } from "hardhat/types";
import { Driver } from "@vechain/connex-driver";
import { VechainHardhatPluginError } from "../error";
import { Provider } from "@vechain/web3-providers-connex";
import { Framework } from "@vechain/connex-framework";
import { createNetwork } from "./createNetwork";
import { createWallet } from "./createWallet";

export async function createProvider(networkConfig: NetworkConfig): Promise<Provider> {
    const config = networkConfig as HttpNetworkConfig;

    if (config.restful === undefined) {
        config.restful = true;
    }

    const net = createNetwork(config);
    const wallet = createWallet(config);

    const driver = await Driver
        .connect(net, wallet);
    return new Provider({
        connex: new Framework(driver),
        wallet,
        net: config.restful === true ? net : undefined,
        delegate: config.delegate
    });
}