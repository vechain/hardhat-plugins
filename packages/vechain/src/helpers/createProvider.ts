import { HttpNetworkConfig, NetworkConfig } from "hardhat/types";
import { Driver, SimpleWallet } from "@vechain/connex-driver";
import { Provider } from "@vechain/web3-providers-connex";
import { Framework } from "@vechain/connex-framework";
import { createNetwork } from "./createNetwork";
import "../type-extensions";

export async function createProvider(networkConfig: NetworkConfig, wallet: SimpleWallet): Promise<Provider> {
    const config = networkConfig as HttpNetworkConfig;

    if (config.restful === undefined) {
        config.restful = true;
    }

    const net = createNetwork(config);

    const driver = await Driver
        .connect(net, wallet);
    return new Provider({
        connex: new Framework(driver),
        wallet,
        net: config.restful === true ? net : undefined,
        delegate: config.delegate
    });
}