const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    },
}

const devChain = ["hardhat", "localhost"]
const decimals = 8
const initialAnswer = 200000000000

module.exports = { networkConfig, devChain, decimals, initialAnswer }