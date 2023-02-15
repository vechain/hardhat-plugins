import { SimpleWallet } from "@vechain/connex-driver";
import { HttpNetworkConfig } from "hardhat/types";
import { HDNode } from "thor-devkit";
import { VECHAIN_DEFAULT_MNEMONIC, VECHAIN_URL_SOLO } from "../constants";
import { VechainHardhatPluginError } from "../error";

function derivePrivateKeys(mnemonic: string, count: number): Buffer[]  {
    const hdNode = HDNode.fromMnemonic(mnemonic.split(' '));
    let hdNodes: HDNode[] = [];
    for (let i = 0; i < count; ++i) {
        hdNodes.push(hdNode.derive(i));
    }
    return hdNodes.map(node => node.privateKey!);
}

export function createWallet(config: HttpNetworkConfig) {
    const wallet = new SimpleWallet();

    let keys: Buffer[] = [];
    const accounts = config.accounts;
    if (accounts === "remote" && config.url !== VECHAIN_URL_SOLO) {
        throw new VechainHardhatPluginError("Default accounts are only supported on solo instances");
    } else if (accounts === "remote") {
        keys = derivePrivateKeys(VECHAIN_DEFAULT_MNEMONIC, 10)
    } else if (accounts instanceof Array) {
        keys = accounts
            .map(value => value.replace(/0x/, ''))
            .map(value => Buffer.from(value, "hex"));
    } else if (accounts.mnemonic !== undefined) {
        keys = derivePrivateKeys(
            accounts.mnemonic,
            accounts.count || 10,
        );
    }
    keys.forEach(buffer => wallet.import(buffer.toString('hex')));

    return wallet;
}