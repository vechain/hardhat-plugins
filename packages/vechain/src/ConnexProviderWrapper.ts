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

    constructor(networkConfig: NetworkConfig) {
        super();
        this._provider = createProvider(networkConfig);
        this._provider
            .then(provider => {
                provider.emit = this.emit.bind(this);
            });
    }

    public delegate(delegate: DelegateOpt) {
        this._provider
            .then(provider => provider.enableDelegate(delegate));
    }

    public disableDelegate() {
        this._provider
            .then(provider => provider.disableDelegate());
    }

    async send(method: string, params?: any[] | undefined): Promise<any> {
        return this.request({ method, params });
    }

    sendAsync(payload: JsonRpcRequest, callback: (error: any, response: JsonRpcResponse) => void): void {
        this._provider
            .then(provider => provider.request(payload))
            .then(result => callback(
                null,
                {
                    id: payload.id,
                    jsonrpc: '2.0',
                    result
                }
            ))
            .catch(error => callback(
                error,
                {
                    id: payload.id,
                    jsonrpc: '2.0',
                    error
                }
            ));
    }

    async request(args: RequestArguments): Promise<unknown> {
        return this._provider.then(provider => provider.request(args as any));
    }
}