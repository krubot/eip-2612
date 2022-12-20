require("dotenv").config();

task("logs", "Gets the Transfer logs on the current contract", async () => {
  const accounts = await ethers.getSigners()

  const Example = await ethers.getContractFactory("Example");

  if (process.env.GOERLI_EIP_2612_CONTRACT == null) {
    console.error("Contract has not been deployed, please deploy first using hardhat.");
    return
  }

  var example = Example.attach(process.env.GOERLI_EIP_2612_CONTRACT);

  let eventFilter = example.filters.Transfer();

  let events = await example.queryFilter(eventFilter);

  for (let event of events) {
    console.log({
      event: event.event,
      eventSignature: event.eventSignature,
      address: event.address,
      data: event.data,
      blockHash: event.blockHash,
      transactionHash: event.transactionHash,
      topics: event.topics,
      args: event.args
    });
  }
})

module.exports = {}
