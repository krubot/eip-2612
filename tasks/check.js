require("dotenv").config();

task("check", "Runs a typedata check against the contract and returns the response", async () => {
    const accounts = await ethers.getSigners()

    // The domain config
    const domain = {
        name: 'MyToken',
        version: '1',
        chainId: 5, // Chain ID of Goerli network
        verifyingContract: process.env.GOERLI_EIP_2612_CONTRACT
    };

    // The named list of all type definitions
    const types = {
        Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256'}
        ]
    };

    const Example = await ethers.getContractFactory("Example");

    const ExampleAccount0 = Example.connect(accounts[0]);
    const ExampleAccount1 = Example.connect(accounts[1]);

    if (process.env.GOERLI_EIP_2612_CONTRACT == null) {
      console.error("Contract has not been deployed, please deploy first using hardhat.");
      return
    }

    var exampleAccount0 = ExampleAccount0.attach(process.env.GOERLI_EIP_2612_CONTRACT);
    var exampleAccount1 = ExampleAccount1.attach(process.env.GOERLI_EIP_2612_CONTRACT);

    const nonce = await exampleAccount0.nonces(accounts[0].address);
    console.log("Contract nonce is: ",nonce.toString());

    // The data to sign
    const value = {
        owner: accounts[0].address,
        spender: accounts[1].address,
        value: ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(18)),
        nonce: ethers.BigNumber.from(nonce),
        deadline: ethers.BigNumber.from(Date.now()/ 1000 | 0 + 3600) // Epoch 1 hour in the future
    };

    const sig = await accounts[0]._signTypedData(domain, types, value);
    console.log("Typed data signature: ",sig);

    const sigSplit = ethers.utils.splitSignature(sig);
    console.log("Typed data split signature v: ",sigSplit.v);
    console.log("Typed data split signature r: ",sigSplit.r);
    console.log("Typed data split signature s: ",sigSplit.s);

    const sigAddress = ethers.utils.recoverAddress(ethers.utils._TypedDataEncoder.hash(domain, types, value),sig);
    console.log("Signature recovery address: ",sigAddress);

    const gasPrice = await accounts[0].getGasPrice();
    console.log("Current gas price is: ",gasPrice.toString());

    const contractVerify = await exampleAccount0.permit(
      accounts[0].address,
      accounts[1].address,
      ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(18)),
      ethers.BigNumber.from(Date.now()/ 1000 | 0 + 3600), // Epoch 1 hour in the future
      sigSplit.v,
      sigSplit.r,
      sigSplit.s,
      {gasLimit:ethers.BigNumber.from(100000), gasPrice:gasPrice}
    );
    const contractVerifyReceipt = await contractVerify.wait()
    console.log("Contract permit has been run.");

    const contractTransfer = await exampleAccount1.transferFrom(
      accounts[0].address,
      accounts[1].address,
      ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(16)),
      {gasLimit:ethers.BigNumber.from(100000), gasPrice:gasPrice}
    )
    const contractTransferReceipt = await contractTransfer.wait()
    console.log("Contract has transferred ", ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(16)).toString()," tokens from account ", accounts[0].address, " to account ", accounts[1].address, ".");
})

module.exports = {}
