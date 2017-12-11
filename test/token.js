require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestTokenContract} = require('./util/deploy.js');

contract('Token [basic features]', function(accounts) {
    let {tokenContract} = {};

    beforeEach(async () => {
        ({tokenContract} = await deployTestTokenContract());
    });

    it('Name of token', async () => {
        assert.equal(data.TOKEN_NAME, await tokenContract.name());
    });

    it('Symbol of token', async () => {
        assert.equal(data.TOKEN_SYMBOL, await tokenContract.symbol());
    });

    it('Decimals attribute', async () => {
        data.DECIMALS.should.be.bignumber.equal(
            await tokenContract.decimals()
        );
    });

    it('initial totalSupply', async () => {
        data.TOTAL_SUPPLY.should.be.bignumber.equal(
            await tokenContract.totalSupply()
        );
    });

    it('Initially owner has all tokens', async () => {
        data.TOTAL_SUPPLY.should.be.bignumber.equal(
            await tokenContract.balanceOf.call(accounts[0])
        );
    });

});
