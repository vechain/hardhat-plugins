import { BaseContract } from "ethers";
import { VechainHardhatPluginError } from "./error";
import logger from 'pino';
import { Provider } from "@vechain/web3-providers-connex";
export interface Clause {
  args: any[],
  abi: string,
  method: string
}

export class ClausesBuilder {
  private readonly clauses: Clause[] = [];
  private readonly contract: BaseContract;
  private readonly provider: Provider;

  private log = logger({
    transport: {
      target: 'pino-pretty'
    }
  });

  constructor(contract: BaseContract, provider: Provider) {
    this.contract = contract;
    this.provider = provider;
  }

  public withClause(clause: Clause): ClausesBuilder {
    this.clauses.push(clause);
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

    const processedClausesPromises = this.clauses.map(async clause => {
      const abi = JSON.parse(clause.abi);
      const functionAbi = abi.find((func: any) => func.type === 'function' && func.name === clause.method);
      const address = await this.contract.getAddress();
      const method = this.provider.connex.thor.account(address).method(functionAbi);
      return method.asClause(clause.args);
    });
    
    const processedClauses = await Promise.all(processedClausesPromises);
    const signedTx = this.provider.connex.vendor.sign('tx', processedClauses);
    return signedTx.request();
  }
  
}