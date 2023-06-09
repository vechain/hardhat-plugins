# hardhat-vechain
A package extending Hardhat Ethers to use a Connex provider.

# Usage
- Modify `hardhat.config.js` to require `@vechain/hardhat-vechain` and `@vechain/hardhat-ethers`.
- Configure `networks` to include a `vechain` configuration
> *Note: A solo Thor instance should be running for the below configurations to work*

## Sample `hardhat.config.js`
```js
const {
  VECHAIN_URL_SOLO
} = require("@vechain/hardhat-vechain");
require("@vechain/hardhat-ethers");

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

## Testing
- Use Hardhat Ethers as usual
```js
describe("vechain-ethers", function() {
    it("should be able to get signers", async function () {
        const accounts = await ethers.getSigners();
        assert.equals(accounts[0], "0xf077b491b355e64048ce21e3a6fc4751eeea77fa");
    });
});
```