pragma solidity ^0.4.15;

import './RecereumPreSale.sol';


contract RecereumPreSaleMock is RecereumPreSale {
    uint256 mockTime = 0;

    function RecereumPreSaleMock(
        address _token,
        address _fundsWallet
    )
        public
        RecereumPreSale(_token, _fundsWallet)
    {
        // emptiness
    }

    // Debug method to redefine current time
    function setTime(uint256 _time) public {
        mockTime = _time;
    }

    function getTime() public returns (uint256) {
        if (mockTime != 0) {
            return mockTime;
        } else {
            return now;
        } 
    }
}
