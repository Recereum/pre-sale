pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract RecereumToken is StandardToken, Ownable {
    string public name = 'Recereum Token';
    string public symbol = 'RCR';
    uint256 public decimals = 18;

    function RecereumToken() public {
        totalSupply = 7999000 * (10**decimals);
        balances[msg.sender] = totalSupply;
    }
}
