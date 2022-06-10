// SPDX-License-Identifier: ISC

pragma solidity ^0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint)
    {
        //to get the price you need to intreact with the oracle network in the chainlink contract
        //for that you need the ABI and the Contract Address

        (, int price, , , ) = priceFeed.latestRoundData();
        //it the price of the ETH in terms of USD
        //and it will return 8 decimal units
        return uint(price * 1e10);
    }

    /*     function getVersion() internal view returns (uint) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
        return priceFeed.version();
    } */

    function getConversionRate(uint _ethAmount, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint)
    {
        uint ethPrice = getPrice(priceFeed);
        uint ethPriceInUsd = (ethPrice * _ethAmount) / 1e18;
        return ethPriceInUsd;
    }
}
