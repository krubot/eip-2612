# Hardhat implementation of eip-2612

This repo deploys an implementation of the eip-2612 standard for learning. It uses hardhat package to run deployments on ethereum goerli network. Please read up on the eip-2612 standard [here](https://eips.ethereum.org/EIPS/eip-2612) to get further information.

## Setup

To setup this repo firstly make sure you clone a local copy of this repo down to your workspace using git. Next download all the node modules needed here by running the following:

```
npm install
```

Now you'll need to setup the environment variable to be used in the deployment by creating a `.env` file with the following content:

```
GOERLI_RPC_URL="<goerli-rpc-url>"
PRIVATE_KEY=["<private-key-1>","<private-key-2>",...]
```

Note: You will need at least 2 private keys with the first in the list having some goerli eth on it. [Here's a link to a faucet for goerli eth.](https://goerlifaucet.com)

You can use a rpc provider like `infura` and `Alchemy` for goerli and your private key can be grabbed from metamask. **Please make sure not to commit your .env file up, this can lead to loss of funds.**

## Compile and deploy

To compile this solidity code you'll need to run hardhat cli using `npx` like the following:

```
npx hardhat compile
```

Now you should be able to deploy your contract to goerli. To do this run the following:

```
npx hardhat run scripts/deploy.js
```

Your output should look like the following:

```
Compiled 1 Solidity file successfully
(node:1497840) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Deploying contracts with the account:  0xA7b192eBA8E0B07e2D25c632986fA4cB2666bB9f
Account balance:  305489738922212336
Transaction hash of the deployment:  0xaccb04026e2a51aa78a1ab213911e9a67b67c166616a6a584ec765d0f4d6170f
Contract has been deployed at:  0xe8AEa93E9cf5b1D2FA77EE8d3F2822a5241E231B
```

## Verification check

To verify the typedata deployment you can run the check command as follows:

```
npx hardhat check
```

Your output should then look like the following:

```
(node:1498193) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Contract nonce is:  0
Typed data signature:  0xd4cb8e718dfbe772af826db16ea4a41718cec8601eae95088b5752b7945da42477fd8a4566a865ff4f373145bf65af8220f453b9742fb7b51d959a8a0048b9dd1c
Typed data split signature v:  28
Typed data split signature r:  0xd4cb8e718dfbe772af826db16ea4a41718cec8601eae95088b5752b7945da424
Typed data split signature s:  0x77fd8a4566a865ff4f373145bf65af8220f453b9742fb7b51d959a8a0048b9dd
Signature recovery address:  0xA7b192eBA8E0B07e2D25c632986fA4cB2666bB9f
Current gas price is:  323982
Contract permit has been run.
Contract has transferred  10000000000000000  tokens from account  0xA7b192eBA8E0B07e2D25c632986fA4cB2666bB9f  to account  0x4Bb831A4E7947f6C191DB9c5bccD4aD584e96C87 .
```

## View logs

There might be a need to check that the Transfer event has been triggered and to debug its output. You can view the list of logs by running the following:

```
npx hardhat logs
```

Your output should then look like the following:

```
(node:1499309) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
{
  event: 'Transfer',
  eventSignature: 'Transfer(address,address,uint256)',
  address: '0xe8AEa93E9cf5b1D2FA77EE8d3F2822a5241E231B',
  data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
  blockHash: '0x8fff99dc426073cd79a7aa802b39ae60def02d2ede709b8e96292a30632aeaac',
  transactionHash: '0xaccb04026e2a51aa78a1ab213911e9a67b67c166616a6a584ec765d0f4d6170f',
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x000000000000000000000000a7b192eba8e0b07e2d25c632986fa4cb2666bb9f'
  ],
  args: [
    '0x0000000000000000000000000000000000000000',
    '0xA7b192eBA8E0B07e2D25c632986fA4cB2666bB9f',
    BigNumber { value: "1000000000000000000" },
    from: '0x0000000000000000000000000000000000000000',
    to: '0xA7b192eBA8E0B07e2D25c632986fA4cB2666bB9f',
    value: BigNumber { value: "1000000000000000000" }
  ]
}
...
```

## Permit2

As eip-2612 is an extention of the eip-20 standard it makes sense that most eip-20 tokens do not implement this standard and even if the core set of user of the coin wanted this they might not be able to upgrade or coordinate an upgrade either. This is a problem as its implementation allows for 2 distinct improvements over the current use of eip-20 on pools like uniswap:

 - Bad UX: Users must approve every new protocol on each token they intend to use with it, and this is almost always a separate transaction.

 - Bad security: Applications often ask for unlimited allowances to avoid having to repeat the above UX issue. This means that if the protocol ever gets exploited, every user's token that they've approved the protocol to spend can potentially be taken right out of their wallets.

Permit2 contract by uniswap looks lot fix this, you can find the code [here](https://github.com/Uniswap/permit2). Lets look at how Alice might interact with an erc20 swap using Permit2 contract:

 1. Alice calls approve() on an ERC20 to grant an infinite allowance to the canonical Permit2 contract.

 2. Alice signs an off-chain "permit2" message that signals that the protocol contract is allowed to transfer tokens on her behalf.

 3. Alice calls an interaction function on the protocol contract, passing in the signed permit2 message as a parameter.

 4. The protocol contract calls permitTransferFrom() on the Permit2 contract, which in turn uses its allowance (granted in 1.) to call transferFrom() on the ERC20 contract, moving the tokens held by Alice.

Now for any erc20 token we can approve the use initially by the Permit2 contract and after which we can use that token via Permit2 without having to allow any other contract have access to use that token. This makes it secure as long as the Permit2 contract does not have any massive bugs and the UX experence is improve a bit since we will only need to approve the allowance once at the start.
