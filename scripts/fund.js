const { getNamedAccounts, ethers } = require('hardhat')

async function main() {
    //deployer is the wallet that you want to interact with the contract
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract('FundMe', deployer)
    console.log(deployer);
    console.log("funding");
    const transactionReceipt = await fundMe.fund({ value: ethers.utils.parseEther("1") })
    console.log(transactionReceipt);
}

main()