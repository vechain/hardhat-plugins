import debug from "debug";
import { EventEmitter } from "events";
import {
    NetworkConfig,
    EthereumProvider,
    JsonRpcRequest,
    JsonRpcResponse,
    RequestArguments
} from "hardhat/types";
import { Provider } from "@vechain/web3-providers-connex";
import { SimpleWallet, Wallet } from "@vechain/connex-driver";
import { createWallet } from "./helpers/createWallet";
import { createProvider } from "./helpers/createProvider";
import { DelegateOpt } from "@vechain/web3-providers-connex/dist/types";
import { Deferrable, randomBytes } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider"
import { VechainHardhatPluginError } from "./error";
import { Transaction } from "thor-devkit";

export default class ConnexProviderWrapper extends EventEmitter implements EthereumProvider {
    private _provider: Promise<Provider>;
    private _wallet: SimpleWallet;
    private _verbose: boolean;
    private _log: debug.Debugger;

    constructor(networkConfig: NetworkConfig, verbose: boolean) {
        super();
        this._log = debug("hardhat:vechain:provider");
        this._verbose = verbose;
        this._wallet = createWallet(networkConfig);
        this._provider = createProvider(networkConfig, this._wallet);
        this._provider
            .then(provider => {
                provider.emit = this.emit.bind(this);
            });
    }

    public async sign(transaction: Deferrable<TransactionRequest>) {
		let key: Wallet.Key | undefined = undefined;
		if (this._wallet && transaction.from) {
            const keys = this._wallet.list;
            const found = transaction.from ? keys.find(k => k.address === transaction.from) : keys[0];
            if (found) {
                key = found
            }
        }
        if (key === undefined) {
            throw new VechainHardhatPluginError(`transaction.from: ${transaction.from} is not included in wallet`);
        }

		const clauses: [Transaction.Clause] = [{
			to: transaction.to?.toString() || null,
			value: transaction.value ? transaction.value.toString() : '0x0',
			data: transaction.data?.toString() || '0x'
		}];
	
		const gas = transaction.gasLimit?.toString() || await this.request({
			method: 'eth_estimateGas',
			params: [transaction]
		}) as string;
	
		const chainId = (await this._provider).chainTag;
	
		const best = await this.request({
			method: 'eth_getBlockByNumber',
			params: ['latest']
		}) as any;
	
		const txBody: Transaction.Body = {
			chainTag: chainId,
			blockRef: best.hash.slice(0, 18),
			expiration: 18,
			clauses,
			gasPriceCoef: 0,
			gas,
			dependsOn: null,
			nonce: '0x' + randomBytes(8).toString()
		}
	
		const tx = new Transaction(txBody)
		tx.signature = await key.sign(tx.signingHash());
	
		return '0x' + tx.encode().toString('hex');
    }

    public setProvider(provider: Promise<Provider>) {
        this._provider.then(provider => {
            provider.emit = provider.emit.bind(provider);
        });

        this._provider = provider;

        this._provider
            .then(provider => {
                provider.emit = this.emit.bind(this);
            });
    }

    public async delegate(delegate: DelegateOpt) {
        return this
            ._provider
            .then(provider => provider.enableDelegate(delegate));
    }

    public async disableDelegate() {
        return this
            ._provider
            .then(provider => provider.disableDelegate());
    }

    async send(method: string, params?: any[] | undefined): Promise<any> {
        return this.request({ method, params });
    }

    sendAsync(payload: JsonRpcRequest, callback: (error: any, response: JsonRpcResponse) => void): void {
        this._provider
            .then(provider => provider.request(payload))
            .then(result => {
                if (this._verbose) {
                    this._log(`Request:\n${JSON.stringify(payload)}`);
                    this._log(`Response:\n${JSON.stringify(result)}`);
                }
                return result;
            })
            .then(result => callback(
                null,
                {
                    id: payload.id,
                    jsonrpc: '2.0',
                    result
                }
            ))
            .catch(error => {
                if (this._verbose) {
                    console.debug(`Request:\n${JSON.stringify(payload)}`);
                    console.error(`Error:\n${JSON.stringify(error)}`);
                }
                callback(error, {
                    id: payload.id,
                    jsonrpc: '2.0',
                    error
                })
            });
    }

    async request(args: RequestArguments): Promise<unknown> {
        return this._provider
            .then(provider => provider.request(args as any))
            .then(result => {
                if (this._verbose) {
                    this._log(`Request:\n${JSON.stringify(args)}`);
                    this._log(`Response:\n${JSON.stringify(result)}`);
                }
                return result;
            })
            .catch(error => {
                if (this._verbose) {
                    console.debug(`Request:\n${JSON.stringify(args)}`);
                    console.error(`Error:\n${JSON.stringify(error)}`);
                }
                throw error;
            });
    }
}