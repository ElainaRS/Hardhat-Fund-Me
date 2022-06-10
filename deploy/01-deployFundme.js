const { network } = require("hardhat")
const { networkConfig, devChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress;

    if (devChain.includes(network.name)) {
        const ethUsdAggregatorAddresss = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregatorAddresss.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put pricefeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------------------------------")
    if (!devChain.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}
module.exports.tags = ["all", "fundme"]