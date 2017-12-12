pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './RecereumToken.sol';


contract RecereumPreSale is Ownable {
    using SafeMath for uint256;

    // Start date of presale, >= 2018-01-01
    uint256 public preSaleStartDate = 0;

    // End date of presale, < 2018-01-15
    uint256 public preSaleEndDate = 0;

    // Hard cap (in tokens) for presale
    uint256 public preSaleTokenCap = 0;

    // Tokens sold on presale
    uint256 public preSaleTokenSold = 0;

    // Each moment of time crowdsale is in one of these states
    enum State {
        BeforePreSale,
        PreSale,
        PreSaleDone
    }

    // Wallet that stores all tokens for sale
    address public fundsWallet = 0x0;

    // Token
    RecereumToken public token = RecereumToken(0x0);

    // Token price (in weis)
    uint256 tokenPriceWei = 1 ether / uint256(420);

    // Minimal ether required to buy tokens
    uint256 minimalPurchaseWei = 1 ether;

    /* **************
     * Public methods
     */

    function RecereumPreSale(
        address _token,
        address _fundsWallet,
        uint256 _preSaleStartDate,
        uint256 _preSaleEndDate,
        uint256 _preSaleTokenCap
    ) public {
        require(_token != 0x0);
        token = RecereumToken(_token);

        require(_fundsWallet != 0x0);
        fundsWallet = _fundsWallet;

        require(_preSaleStartDate != 0);
        preSaleStartDate = _preSaleStartDate;

        require(_preSaleEndDate != 0);
        preSaleEndDate = _preSaleEndDate;

        require(_preSaleTokenCap != 0);
        preSaleTokenCap = _preSaleTokenCap;
    }

    function getTime() public returns (uint256) {
        return now;
    }

    function() public payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address recipient) public payable {
        require(msg.value >= minimalPurchaseWei);
        State state = getState();
        require(state == State.PreSale);
        require(preSaleTokenSold < preSaleTokenCap);
        uint256 tokenAmount = msg.value.div(tokenPriceWei).mul(10**token.decimals());
        uint256 weiAccepted = 0;
        uint256 change = 0;
        if (preSaleTokenSold.add(tokenAmount) <= preSaleTokenCap) {
            weiAccepted = msg.value;
            change = 0;
        } else {
            tokenAmount = preSaleTokenCap.sub(preSaleTokenSold);
            weiAccepted = tokenAmount.mul(tokenPriceWei).div(10**token.decimals());
            change = msg.value - weiAccepted;
        }
        preSaleTokenSold = preSaleTokenSold.add(tokenAmount);
        fundsWallet.transfer(weiAccepted);
        token.transferFrom(owner, recipient, tokenAmount);
        if (change > 0) {
            msg.sender.transfer(change);
        }
    }

    function getState() public returns (State) {
        uint256 _date = getTime();
        if (_date < preSaleStartDate) {
            return State.BeforePreSale;
        }
        if (_date >= preSaleStartDate && _date < preSaleEndDate) {
            return State.PreSale;
        }
        return State.PreSaleDone;
    }
}
