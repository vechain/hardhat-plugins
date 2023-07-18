import {BaseContract} from "ethers";
import {VechainHardhatPluginError} from "./error";

export interface Clause {
  args: any[],
  abi: string,
  method: string
}

export class ClausesBuilder {
  private readonly clauses: Clause[] = [];
  private readonly contract: BaseContract;

  constructor(contract: BaseContract) {
    this.contract = contract;
  }

  public withClause(clause: Clause): ClausesBuilder {
    this.clauses.push(clause);
    return this;
  }


  public async send(): Promise<any> {
    const net = await this.contract.provider.getNetwork();
    if (!net || !net['_defaultProvider']) {
      throw new VechainHardhatPluginError('vechain hardhat plugin requires vechain network for clauses operation')
    }
    const provider = net._defaultProvider(null, null);
    if (!provider) {
      throw new VechainHardhatPluginError('vechain hardhat plugin requires vechain provider for clauses operation')
    }
    const processedClauses = this.clauses.map(clause => {
      const abi = JSON.parse(clause.abi);
      const functionAbi = abi.find((func: any) => func.type === 'function' && func.name === clause.method);
      const method = provider.connex.thor.account(this.contract.address).method(functionAbi);
      return method.asClause(clause.args);
    });
    const signedTx = provider.connex.vendor.sign('tx', processedClauses);
    return signedTx.request();
  }
}