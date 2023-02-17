# hardhat-vechain
A package extending Hardhat Web3 plugin to use a Connex provider.

# Usage
- Modify `hardhat.config.js` to require `@vechainfoundation/hardhat-vechain` and `@vechainfoundation/hardhat-ethers`.
- Configure `networks` to include a `vechain` configuration
> *Note: A solo Thor instance should be running for the below configurations to work*

## Sample `hardhat.config.js`
```js
const {
  VECHAIN_URL_SOLO
} = require("@vechainfoundation/hardhat-vechain");
require("@vechainfoundation/hardhat-ethers");

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

## Testing
- Use Hardhat web3 as usual
```js
describe("vechain-web3", function() {
    it("should be able to get accounts", async function () {
        const accounts = await await web3.eth.getAccounts();;
        assert.equals(accounts[0], "0xf077b491b355e64048ce21e3a6fc4751eeea77fa");
    });
});
```