import { HttpNetworkConfig } from "hardhat/types";
import { createNetwork } from "../../src/helpers/createNetwork";
const assert = require('chai').assert;

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
} as unknown as HttpNetworkConfig;

describe('create network tests', () => {
  it('create network test',  () => {
    const network = createNetwork(config);
    assert.equal(network.baseURL, thorSoloUrl);
  });

  it('create network with undefined network test',  function () {
    // @ts-ignore
    config.url = undefined;
    const network = createNetwork(config);
    assert.equal(network.baseURL, thorSoloUrl);
  });
});