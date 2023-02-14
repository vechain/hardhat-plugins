import { SimpleWallet } from "@vechain/connex-driver";
import { derivePrivateKeys } from "hardhat/internal/core/providers/util";
import { HttpNetworkConfig } from "hardhat/types";
import { VECHAIN_DEFAULT_MNEMONIC, VECHAIN_URL_SOLO } from "../constants";
import { VechainHardhatPluginError } from "../error";

export function createWallet(config: HttpNetworkConfig) {
    const wallet = new SimpleWallet();

    let keys: Buffer[] = [];
    const accounts = config.accounts;
    if (accounts === "remote" && config.url !== VECHAIN_URL_SOLO) {
        throw new VechainHardhatPluginError("Default accounts are only supported on solo instances");
    } else if (accounts === "remote") {
        keys = derivePrivateKeys(VECHAIN_DEFAULT_MNEMONIC, "m/44'/60'/0'/0/", 0, 10, "");
    } else if (accounts instanceof Array) {
        keys = accounts
            .map(value => value.replace(/0x/, ''))
            .map(value => Buffer.from(value, "hex"));
    } else if (accounts.mnemonic !== undefined) {
        keys = derivePrivateKeys(
            accounts.mnemonic,
            accounts.path || "m/44'/60'/0'/0/",
            accounts.initialIndex || 0,
            accounts.count || 10,
            accounts.passphrase || ""
        );
    }
    keys.forEach(buffer => buffer.toString('hex'));

    return wallet;
}