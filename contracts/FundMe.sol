// SPDX-License-Identifier: ISC

pragma solidity ^0.8.8;
import "./PriceConverter.sol";

error Fund__NotOwner();

contract FundMe {
    using PriceConverter for uint;

    //if a variable is initilize once and never changes you can use constant to save some gas
    uint256 public constant minimumUsd = 50 * 1e18;
    address[] private senders;
    mapping(address => uint) private sentAmount;
    AggregatorV3Interface private priceFeed;
    address private immutable owner;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        //msg.value is the amount we are sending to the contract
        //you have to specify the first parameter of the function infront as an object and use dot convextion and if there was a sencond parameter you have to provide that inside the function
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "Didn't send enough"
        ); // 1e18 == 1 * 10 * 18 == 1000000000000000000
        senders.push(msg.sender);
        sentAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint senderIndex = 0;
            senderIndex < senders.length;
            senderIndex++
        ) {
            address funders = senders[senderIndex];
            sentAmount[funders] = 0;
        }
        senders = new address[](0);

        //Now to transfer ETH from this contract to an address who call this withdraw function
        // Here msg.sender is of type address which cannot sent ether or anything to anyother address
        // So we are making the address payable type which can sent any crypto from this contract to the callers address
        //also here address(this) refers to the address of this contract address
        // payable(msg.sender).transfer(address(this).balance);

        //Now using send method
        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess,"send fail");

        //Now using call method and it is the most reccommed method
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    //since you are using this in the constructor you have to use immutable i dont know why i cant use contant also its only for the variable you are not changing

    modifier onlyOwner() {
        //require is old way for checking owner and it cost more gas
        //require(msg.sender == owner,"Sorry sir you are not the owner");

        //this is the new method for checking the owner
        if (msg.sender != owner) {
            revert Fund__NotOwner();
        }
        _;
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory sender = senders;
        //mappings cant be in memory
        for (uint funderIndex = 0; funderIndex < sender.length; funderIndex++) {
            address senderRead = sender[funderIndex];
            sentAmount[senderRead] = 0;
        }
        senders = new address[](0);
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Call Failed");
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getSenders(uint index) public view returns (address) {
        return senders[index];
    }

    function getSentAmount(address sender) public view returns (uint) {
        return sentAmount[sender];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    //What happen if someone send eth to this contract without calling the fund fuction
    /*   receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    } */
}
