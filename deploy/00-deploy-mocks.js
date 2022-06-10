const { network } = require("hardhat")
const { devChain, decimals, initialAnswer } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (devChain.includes(network.name)) {
        log("Local Network deacted deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [decimals, initialAnswer]
        })
        log("MockV3Aggregator deployed")
        log("-------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]