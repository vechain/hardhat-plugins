import {HttpNetworkConfig} from "hardhat/types";
import {createProvider} from "../src/helpers/createProvider";
import {createWallet} from "../src/helpers/createWallet";
import {ClausesBuilder} from "../src/clausesBuilder";
import {BaseContract} from "ethers";
import {Provider} from "@vechain/web3-providers-connex";

const baseContract = {
  interface: {
    encodeFunctionData: jest.fn().mockImplementation(() => {
      return 'fakeFunctionData';
    })
  },
  getAddress: jest.fn().mockReturnValue("0x0000000000000000000000000000456E65726779")
} as unknown as BaseContract;

describe('builder tests', () => {

  const thorSoloUrl = "http://127.0.0.1:8669";
  const dummyResponse = {
    response: 'ok',
    hash: '0x000015ce4dd3541ea6cd3bf6d328604d8e4d17747196f4c45e40d6b56d9ac5f2'
  };
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

  const expectedTxResponse = {"signer": "0xf077b491b355e64048ce21e3a6fc4751eeea77fa", "txid": "0xe85e3d3cc12f35223e8ec9dd2fb1e5d404136e7621b41fc6a6922aca9e12cf26"}

  it('should add clause', async () => {

    var wallet = createWallet(config);
    wallet.import("0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36");

    var provider = await createProvider(config, wallet);

    const clauseBuilder = new ClausesBuilder(baseContract, provider);
    const builderWithClause = clauseBuilder.withClause(
      baseContract.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"])
    )
    expect(builderWithClause['functionCalls']).toEqual(["fakeFunctionData"]);
  });

  it('should add two clauses', async () => {

    var wallet = createWallet(config);
    var provider = await createProvider(config, wallet);

    const clauseBuilder = new ClausesBuilder(baseContract, provider);
    const builderWithClause = clauseBuilder
      .withClause(baseContract.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"]))
      .withClause(baseContract.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"]))

    expect(builderWithClause['functionCalls']).toEqual([
      "fakeFunctionData",
      "fakeFunctionData"
    ]);
  });

  it('should send transaction', async () => {
    const wallet = createWallet(config);
    wallet.import("0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36");
    const provider = createProvider(config, wallet);
    provider.then(resolved => {
      jest.spyOn(resolved, 'request').mockResolvedValue(dummyResponse);
    });


    const connexProviderWrapper = {
      connex: {
        thor: {
          account: jest.fn().mockImplementation(() => {
            return {
              method: jest.fn().mockImplementation( () => {
                return {
                  asClause: jest.fn().mockImplementation( () => {
                    return {};
                  })
                };
              })
            };
          })
        },
        vendor: {
          sign: jest.fn().mockImplementation(() => {
            return {
              request: jest.fn().mockImplementation(() => {
                return expectedTxResponse;
              })
            };
          })
        }
      }
    } as unknown as Provider;

    const clauseBuilder = new ClausesBuilder(baseContract, connexProviderWrapper);

    const tx = await clauseBuilder
      .withClause(
        baseContract.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"])
      )
      .send()
    expect(tx).toEqual(expectedTxResponse);
  });

  it('should throw error', async () => {

    const invalidConnexProviderWrapper = {
    } as unknown as Provider;

    const wallet = createWallet(config);
    const provider = createProvider(config, wallet);
    provider.then(resolved => {
      jest.spyOn(resolved, 'request').mockResolvedValue(dummyResponse);
    });

    const clauseBuilder = new ClausesBuilder(baseContract, invalidConnexProviderWrapper);
    try {
      await clauseBuilder
        .withClause(
          baseContract.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"])
        )
        .send()
    } catch (e) {
      const error = e as Error;
      expect(error.message).toEqual('vechain hardhat plugin requires vechain provider for clauses operation')
    }
  });

});
