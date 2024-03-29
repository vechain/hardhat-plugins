# hardhat-vechain
A package extending the Hardhat environment with a `vechain` field.
The field contains a Hardhat `EthereumProvider` enabling requests via Connex.

# Usage
- Modify `hardhat.config.js` to include `require("@vechain/hardhat-vechain")`
- Configure `networks` to include a `vechain` configuration
> *Note: A solo Thor instance should be running for the below configurations to work*

## Sample `hardhat.config.js`
```js
const {
  VECHAIN_URL_SOLO
} = require("@vechain/hardhat-vechain");

module.exports = {
    solidity: {
        version: "0.8.17",
    },
    networks: {
        vechain: {
            url: VECHAIN_URL_SOLO
        },
    }
};
```

## Sample `hardhat.config.js` with fee delegation

Fee delegation can be configured by providing optional ```delegate``` config which has required ``url`` and optional ``signer`` field. Url needs to point to delegation a valid
delegation service, for example ```https://sponsor-testnet.vechain.energy/by/${projectId}```.
```js
const {
  VECHAIN_URL_SOLO
} = require("@vechain/hardhat-vechain");
require("@vechain/hardhat-web3");

module.exports = {
    solidity: {
        version: "0.8.17",
    },
    networks: {
        vechain: {
            url: VECHAIN_URL_SOLO,
            delegate: {
                url: "${feeDelegationServiceUrl}",
                signer: "${optionalSigner}"
            }
        },
    }
};
```
## Multi network support sample `hardhat.config.js`

Multiple network can also be configured to simplify testing and deployments. Networks which are targeting ``VechainThor``
nodes should have ```vechain``` as part of the network name (vechain, vechain_testnet, vechainNode are all valid). Network
names without this requirement won't be preprocessed by the plugin and it is not expected to function properly with Thor 
network. Sample configuration:

```js
const {
  VECHAIN_URL_SOLO
} = require("@vechain/hardhat-vechain");
require("@vechain/hardhat-web3");

module.exports = {
    solidity: {
        version: "0.8.17",
    },
    networks: {
        vechain_solo: {
            url: VECHAIN_URL_SOLO,
            delegate: {
                url: "${feeDelegationServiceUrl}",
                signer: "${optionalSigner}"
            }
        },
        vechain_mainnet: {
            url: "https://mainnet.veblocks.net",
        },
    }
};
```

## Testing
- Access the provider using the globally available `vechain`
```js
describe("vechain", function() {
    it("should be able to send requests", async function () {
        const accounts = await vechain.request({ method: "eth_accounts" });
        assert.equals(accounts[0], "0xf077b491b355e64048ce21e3a6fc4751eeea77fa");
    });
});
```