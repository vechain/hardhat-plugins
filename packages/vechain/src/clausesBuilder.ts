import { BaseContract } from "ethers";
import { VechainHardhatPluginError } from "./error";
import logger from 'pino';
import { Provider } from "@vechain/web3-providers-connex";


/**
 * A clause builder for VeChain.
 *
 * @example
 *   const myErc721 = await ethers.getContractAt("MyERC721", "0x9e7e737B23DCBDf1cc48d8B7f40Fc3b2E3808C96");
 *
 *   const clausBuilder = new ClausesBuilder(myErc721, provider);
 *
 *   const {txid, signer } = clausBuilder
 *     .withClause(myErc721.interface.encodeFunctionData("mint", ["0x9e7e737B23DCBDf1cc48d8B7f40Fc3b2E3808C96"]))
 *     .withClause(myErc721.interface.encodeFunctionData("mint", ["0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"]))
 *     .send();
 *
 *   console.log({txid, signer});
 */

export class ClausesBuilder <T extends BaseContract>{
  private readonly functionCalls: string[] = [];
  private readonly contract: T;
  private readonly provider: Provider;

  private log = logger({
    transport: {
      target: 'pino-pretty'
    }
  });

  constructor(contract: T, provider: Provider) {
    this.contract = contract;
    this.provider = provider;
  }


  /**
   * Add a clause to the builder
   * @param functionData - The function ABI encoded with its arguments
   *
   * @returns The builder
   */
  public withClause(functionData: string): ClausesBuilder<T> {
    this.functionCalls.push(functionData);
    return this;
  }

  public async send(): Promise<{
    txid: string
    signer: string
  }> {

    if (!this.provider.connex) {
      this.log.error('Error while getting provider');
      throw new VechainHardhatPluginError('vechain hardhat plugin requires vechain provider for clauses operation')
    }

    const contractAddress = await this.contract.getAddress()

    const clauses = this.functionCalls.map(functionCall => {
      return {
        to: contractAddress,
        data: functionCall,
        value: 0
      }
    })

    const signedTx = this.provider.connex.vendor.sign('tx', clauses);
    return signedTx.request();
  }

}
