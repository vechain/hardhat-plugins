# hardhat-vechain
A package extending the Hardhat environment with a `vechain` field.
The field contains a Hardhat `EthereumProvider` enabling requests via Connex.

# Usage
- Modify `hardhat.config.js` to include `require("@vechainfoundation/hardhat-vechain")`
- Configure `networks` to include a `vechain` configuration
> *Note: A solo Thor instance should be running for the below configurations to work*

## Sample `hardhat.config.js`
```js
const {
  VECHAIN_URL_SOLO
} = require("@vechainfoundation/hardhat-vechain");

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
- Access the provider using the globally available `vechain`
```js
describe("vechain", function() {
    it("should be able to send requests", async function () {
        const accounts = await vechain.request(method: "eth_accounts");
        assert.equals(accounts[0], "0xf077b491b355e64048ce21e3a6fc4751eeea77fa");
    });
});
```