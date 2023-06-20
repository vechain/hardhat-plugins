import {HttpNetworkConfig, JsonRpcResponse} from "hardhat/types";
import { ConnexProviderWrapper } from "../src/ConnexProviderWrapper";
import { Driver } from "@vechain/connex-driver";
import * as assert from "assert";
import {createProvider} from "../src/helpers/createProvider";
import { createWallet } from "../src/helpers/createWallet";

describe('index tests', () => {
  const thorSoloUrl = "http://127.0.0.1:8669";
  const testDelegateUrl = 'https://test.delegate.url/test';
  const dummyResponse = { response: 'ok' };
  const genericError = 'Generic error!';

  const config = {
    chainId: 1,
    from: undefined,
    gas: 10000,
    gasPrice: 10000,
    gasMultiplier: 1,
    url: thorSoloUrl,
    accounts: 'remote',
    timeout: 1000,
    httpHeaders: { ['test']: 'test'} as { [name: string]: string },
  } as unknown as HttpNetworkConfig;

  it('create ConnexProviderWrapper', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    expect(connexProviderWrapper).toBeDefined();
  });

  it('create ConnexProviderWrapper and call remove disable delegate', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    expect(await connexProviderWrapper.disableDelegate()).toBeNull()
  });

  it('create ConnexProviderWrapper and expect connection error', async () => {

    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    try {
      await connexProviderWrapper.disableDelegate();
    } catch (e: any) {
      assert.equal(e.message, 'get blocks/0: connect ECONNREFUSED 127.0.0.1:8669');
    }
  });

  it('create ConnexProviderWrapper and set provider', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    expect(connexProviderWrapper.setProvider(provider)).toBe(void 0);
  });

  it('create ConnexProviderWrapper and set provider error', async () => {

    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    try {
      connexProviderWrapper.setProvider(provider);
    } catch (e: any) {
      assert.equal(e.message, 'get blocks/0: connect ECONNREFUSED 127.0.0.1:8669');
    }
  });

  it('create ConnexProviderWrapper and set delegate', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    connexProviderWrapper.setProvider(provider);
    await connexProviderWrapper.delegate({ url: 'https://test.delegate.url/test'});
    provider.then(resolved => {
      assert.equal(resolved['_delegate'].url, testDelegateUrl);
      }
    );
  });

  it('create ConnexProviderWrapper, send and receive response', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    connexProviderWrapper.setProvider(provider);
    provider.then(resolved => {
        jest.spyOn(resolved, 'request').mockResolvedValue(dummyResponse);
      }
    );
    const response = await connexProviderWrapper.send('testMethod', ['1']);
    assert.equal(response, dummyResponse);
  });

  it('create ConnexProviderWrapper, send and receive error response', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    try {
      await connexProviderWrapper.send('testMethod', ['1']);
    } catch (e: any) {
      assert.equal(e.message, 'Method testMethod not found');
    }
  });

  it('create ConnexProviderWrapper, sendAsync and receive response', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    connexProviderWrapper.setProvider(provider);
    provider.then(resolved => {
        jest.spyOn(resolved, 'request').mockResolvedValue(dummyResponse);
      }
    );
    const request = {
      jsonrpc: '2.0',
      method: 'testMethod',
      params: ['1'],
      id: 1
    };
    const expectedResponse = {
      id: request.id,
      jsonrpc: request.jsonrpc,
      result: dummyResponse
    }

    await connexProviderWrapper.sendAsync(request, (error: any, response: JsonRpcResponse) => {
      assert.deepStrictEqual(response, expectedResponse);
    });
  });

  it('create ConnexProviderWrapper, sendAsync and receive error response', async () => {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const connexProviderWrapper = new ConnexProviderWrapper(config, true);
    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    connexProviderWrapper.setProvider(provider);
    provider.then(resolved => {
        jest.spyOn(resolved, 'request').mockImplementation(() => {
          throw new Error(genericError);
        })
      }
    );
    const request = {
      jsonrpc: '2.0',
      method: 'testMethod',
      params: ['1'],
      id: 1
    };

    await connexProviderWrapper.sendAsync(request, (error: any, response: JsonRpcResponse) => {
      assert.equal(response.id, request.id);
      assert.equal(response.jsonrpc, request.jsonrpc);
      assert.equal(response.error, error);
      assert.equal(error.message, genericError);
    });
  });

});