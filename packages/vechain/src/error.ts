import { HardhatPluginError } from "hardhat/plugins";
import { VECHAIN_HARDHAT_PLUGIN_NAME } from "./constants";

export class VechainHardhatPluginError extends HardhatPluginError {
    constructor(
        message: string,
        parent?: Error
    ) {
        super(VECHAIN_HARDHAT_PLUGIN_NAME, message, parent);
    }
}