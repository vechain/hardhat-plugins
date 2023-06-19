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
import { createProvider } from "./helpers/createProvider";
import { DelegateOpt } from "@vechain/web3-providers-connex/dist/types";

export default class ConnexProviderWrapper extends EventEmitter implements EthereumProvider {
    private _provider: Promise<Provider>;
    private _verbose: boolean;
    private _log: debug.Debugger;

    constructor(networkConfig: NetworkConfig, verbose: boolean) {
        super();
        this._log = debug("hardhat:vechain:provider");
        this._verbose = verbose;
        this._provider = createProvider(networkConfig);
        this._provider
            .then(provider => {
                provider.emit = this.emit.bind(this);
            })
            .catch(error => {
                this._log(`Error while creating provider: ${error.stack}`);
                throw error;
            });
    }

    public setProvider(provider: Promise<Provider>) {
        this._provider.then(provider => {
            provider.emit = provider.emit.bind(provider);
        })
        .catch(error => {
            this._log(`Error while setting provider: ${error.stack}`);
            throw error;
        });

        this._provider = provider;

        this._provider
            .then(provider => {
                provider.emit = this.emit.bind(this);
            })
           .catch(error => {
                this._log(`Error while setting provider: ${error.stack}`);
                throw error;
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