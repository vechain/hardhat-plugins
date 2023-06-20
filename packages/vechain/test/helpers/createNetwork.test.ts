import {HttpNetworkAccountsConfig, HttpNetworkConfig} from "hardhat/types";
import * as assert from "assert";
import {createNetwork} from "../../src/helpers/createNetwork";

describe('create network tests', () => {
  const thorSoloUrl = "http://127.0.0.1:8669";

  const remoteAccount: HttpNetworkAccountsConfig = ["remote"] as HttpNetworkAccountsConfig

  const config = {
    chainId: 1,
    from: undefined,
    gas: 10000,
    gasPrice: 10000,
    gasMultiplier: 1,
    url: thorSoloUrl,
    accounts: remoteAccount,
    timeout: 1000,
    httpHeaders: { ['test']: 'test'} as { [name: string]: string },
  } as unknown as HttpNetworkConfig;

  it('create network test',  () => {
    const network = createNetwork(config);
    assert.equal(network.baseURL, thorSoloUrl);
  });

  it('create network with undefined network test', () => {
    // @ts-ignore
    config.url = undefined;
    const network = createNetwork(config);
    assert.equal(network.baseURL, thorSoloUrl);
  });
});