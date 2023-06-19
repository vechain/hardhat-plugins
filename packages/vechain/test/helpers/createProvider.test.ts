import {createProvider} from "../../src/helpers/createProvider";
import {HttpNetworkConfig} from "hardhat/types";
import {Driver} from "@vechain/connex-driver";
import * as assert from "assert";

describe('create providers tests', function () {
  const thorSoloUrl = "http://127.0.0.1:8669";

  const config = {
    chainId: 1,
    from: null,
    gas: 10000,
    gasPrice: "auto",
    gasMultiplier: 1,
    url: thorSoloUrl,
    accounts: '',
    timeout: 1000,
    httpHeaders: { name: []}
  } as unknown as HttpNetworkConfig

  it('create provider test', async function () {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    const provider = await createProvider(config);

    assert.notEqual(provider.connex.thor, undefined);
    assert.notEqual(provider.connex.vendor, undefined);
    assert.notEqual(provider.wallet, undefined);
    assert.equal(provider.chainTag, 0);
    assert.notEqual(provider.restful, undefined);
  });

  it('create provider test with false restful', async function () {

    Driver.connect = jest.fn().mockReturnValue({
      genesis: {
        id: ''
      }
    });
    config['restful'] = false;
    const provider = await createProvider(config);

    assert.notEqual(provider.connex.thor, undefined);
    assert.notEqual(provider.connex.vendor, undefined);
    assert.notEqual(provider.wallet, undefined);
    assert.equal(provider.chainTag, 0);
    assert.equal(provider.restful, undefined);
  });

});