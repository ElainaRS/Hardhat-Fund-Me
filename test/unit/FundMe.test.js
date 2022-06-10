const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function () {
        //another way for us to get the accounts from the network tab in the hardhat-config file
        //const accounts  =  await ethers.getSigners()
        //for hardhat network 
        //const accountZero = accounts[0]

        deployer = (await getNamedAccounts()).deployer
        //deploying our fundme contract
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    describe("fund", async () => {
        it("fails if you dont send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough")
        })
        it("update the amount funded data Structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getSentAmount(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("adds funder to the funders array", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getSenders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single founder", async () => {
            //Arrage
            const startingbalance = await ethers.provider.getBalance(fundMe.address)
            const deployerBalance = await ethers.provider.getBalance(deployer)

            //Act
            const response = await fundMe.withdraw()
            let transactionReceipt = await response.wait(1)
            let { gasUsed, effectiveGasPrice } = transactionReceipt
            let gasCost = effectiveGasPrice.mul(gasUsed)

            let endingFundMeBalance = await ethers.provider.getBalance(fundMe.address)
            let endingDeployerBalance = await ethers.provider.getBalance(deployer)

            //Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingbalance.add(deployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
        it("allows us to withdraw for multiple funders", async () => {
            //Arrange
            let accounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                let fundMeConnetedContract = await fundMe.connect(accounts[i])
                await fundMeConnetedContract.fund({ value: sendValue })
            }
            const startingbalance = await ethers.provider.getBalance(fundMe.address)
            const deployerBalance = await ethers.provider.getBalance(deployer)
            //Act
            let transactionResponse = await fundMe.cheaperWithdraw()
            let transactionReceipt = await transactionResponse.wait(1)
            let { gasUsed, effectiveGasPrice } = transactionReceipt
            let gasCost = effectiveGasPrice.mul(gasUsed)

            let endingFundMeBalance = await ethers.provider.getBalance(fundMe.address)
            let endingDeployerBalance = await ethers.provider.getBalance(deployer)

            //Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingbalance.add(deployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            //also make sure the funders array is empty
            await expect(fundMe.getSenders(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.getSentAmount(accounts[i].address), 0)
            }
        })

        it("only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWith("Fund__NotOwner")
        })

    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly ", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})