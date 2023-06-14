import {HttpNetworkConfig, HttpNetworkHDAccountsConfig} from "hardhat/types";
import {createWallet} from "../../src/helpers/createWallet";
import {HDNode} from "thor-devkit";
const assert = require('chai').assert;
const expect = require('chai').expect;

const thorSoloUrl = "http://127.0.0.1:8669";
const invalidUrl = "http://127.0.0.1:8700";

const config = {
  chainId: 1,
  from: null,
  gas: 10000,
  gasPrice: "auto",
  gasMultiplier: 1,
  url: thorSoloUrl,
  accounts: 'remote',
  timeout: 1000,
  httpHeaders: { name: []}
} as unknown as HttpNetworkConfig;

const defaultMnemonic = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross';
const defaultAddress = '0xf077b491b355e64048ce21e3a6fc4751eeea77fa';
const testMnemonic = "yard echo inherit first merit brisk amused cave vacuum hurdle cube mean";
const testAddress = '0x97dcbb3badeea5a2da768ac3ce33f5c9ce098c9d';

function derivePrivateKeys(mnemonic: string, count: number): Buffer[]  {
  const hdNode = HDNode.fromMnemonic(mnemonic.split(' '));
  let hdNodes: HDNode[] = [];
  for (let i = 0; i < count; ++i) {
    hdNodes.push(hdNode.derive(i));
  }
  return hdNodes.map(node => node.privateKey!);
}

describe('create wallet tests', function () {
  it('create wallet with default mnemonic',function () {
    const wallet = createWallet(config);
    assert.equal(wallet.list.length, 10);
    assert.equal(wallet.list[0].address, defaultAddress);
  });

  it('created wallet should be able to remove address',function () {
    const wallet = createWallet(config);
    assert.equal(wallet.list.length, 10);
    wallet.remove(defaultAddress);
    assert.equal(wallet.list.length, 9);
    assert.notEqual(wallet.list[0].address, defaultAddress);
  });

  it('created wallet should be able to add keys',function () {
    const wallet = createWallet(config);
    assert.equal(wallet.list.length, 10);

    const key = derivePrivateKeys(testMnemonic, 1);
    wallet.import(key[0].toString('hex'));
    assert.equal(wallet.list.length, 11);
    assert.equal(wallet.list[10].address, testAddress);
  });

  it('create wallet with remote account and non thor solo url should fail',function () {
    config.url = invalidUrl;
    expect(function(){
      createWallet(config);
    }).to.throw('Default accounts are only supported on solo instances');
  });

  it('create wallet with account array',function () {
    config.url = thorSoloUrl;
    const defaultKey = derivePrivateKeys(defaultMnemonic, 1);
    const testKey = derivePrivateKeys(testMnemonic, 1);
    config.accounts = [defaultKey[0].toString('hex'), testKey[0].toString('hex')];
    const wallet = createWallet(config);
    assert.equal(wallet.list.length, 2);
    assert.equal(wallet.list[0].address, defaultAddress);
    assert.equal(wallet.list[1].address, testAddress);
  });

  it('create wallet with account mnemonic',function () {
    config.accounts = { mnemonic: testMnemonic } as HttpNetworkHDAccountsConfig;
    const wallet = createWallet(config);
    assert.equal(wallet.list.length, 10);
    assert.equal(wallet.list[0].address, testAddress);
  });


});