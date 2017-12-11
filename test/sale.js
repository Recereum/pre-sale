require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let {etherUsedForTx} = require('./util/gas.js');

let RecereumToken = artifacts.require('RecereumToken');
let RecereumPreSaleMock = artifacts.require('RecereumPreSaleMock');
let {deployTestContracts} = require('./util/deploy.js');

contract('Crowdsale [Basic Features]', function(accounts) {
    let {tokenContract, saleContract, fundsWallet} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract, fundsWallet} = await deployTestContracts(accounts));
    });

    it('Owner wallet should allow sale contract to transfer up to hard cap tokens', async () => {
        data.PRESALE_TOKEN_CAP.should.be.bignumber.equal(
            await tokenContract.allowance.call(accounts[0], saleContract.address)
        );
    });

    it('Fail to purchase tokens with ether amount less than minimal purhcase limit', async () => {
        await saleContract.setTime(data.PRESALE_START_DATE);
        await saleContract.sendTransaction({value: data.MINIMAL_PURCHASE_WEI.sub(1)})
            .should.be.rejectedWith(': revert');
    });

    it('Buy some tokens with minimal allowed ether', async () => {
        let buyerWallet = accounts[2];
        await saleContract.setTime(data.PRESALE_START_DATE);
        // initial balances
        let fundsBalance = await web3.eth.getBalance(fundsWallet);
        let ethBalance = await web3.eth.getBalance(buyerWallet);
        let tokenBalance = await tokenContract.balanceOf.call(buyerWallet);
        // Spend minimal allowed ether
        let weiAmount = data.MINIMAL_PURCHASE_WEI.mul(1);
        let res = await saleContract.sendTransaction({value: weiAmount, from: buyerWallet});
        // calculate expected values
        let tokenAmount = weiAmount.divToInt(data.TOKEN_PRICE_WEI).mul(10**data.DECIMALS);
        let etherUsed = etherUsedForTx(res);
        // Do checks
        tokenBalance.add(tokenAmount).should.be.bignumber.equal(
            await tokenContract.balanceOf.call(buyerWallet)
        );
        fundsBalance.add(weiAmount).should.be.bignumber.equal(
            await web3.eth.getBalance(fundsWallet)
        );
    });

    it('Try to buy more tokens than token cap', async () => {
        let buyerWallet = accounts[2];
        await saleContract.setTime(data.PRESALE_START_DATE);
        // initial balances
        let fundsBalance = await web3.eth.getBalance(fundsWallet);
        let ethBalance = await web3.eth.getBalance(buyerWallet);
        let tokenBalance = await tokenContract.balanceOf.call(buyerWallet);
        // Spend minimal allowed ether
        let weiAmount = data.PRESALE_TOKEN_CAP.divToInt(10**data.DECIMALS)
            .mul(data.TOKEN_PRICE_WEI).add(data.ETHER);
        let res = await saleContract.sendTransaction({value: weiAmount, from: buyerWallet});
        // calculate expected values
        let tokenAmount = weiAmount.divToInt(data.TOKEN_PRICE_WEI).mul(10**data.DECIMALS);
        let acceptedTokens = data.PRESALE_TOKEN_CAP;
        let acceptedWei = acceptedTokens.divToInt(10**data.DECIMALS).mul(data.TOKEN_PRICE_WEI);
        let etherUsed = etherUsedForTx(res);
        // Do checks
        tokenBalance.add(acceptedTokens).should.be.bignumber.equal(
            await tokenContract.balanceOf.call(buyerWallet)
        );
        fundsBalance.add(acceptedWei).should.be.bignumber.equal(
            await web3.eth.getBalance(fundsWallet)
        );
        ethBalance.sub(acceptedWei).sub(etherUsed).should.be.bignumber.equal(
            await web3.eth.getBalance(buyerWallet)
        );
    });

    it('Fail to buy token before presale started', async () => {
        let buyerWallet = accounts[2];
        await saleContract.setTime(data.PRESALE_START_DATE - 1);
        let weiAmount = data.MINIMAL_PURCHASE_WEI.mul(1);
        await saleContract.sendTransaction({value: weiAmount, from: buyerWallet})
            .should.be.rejectedWith(': revert');
    });

    it('Fail to buy token after presale ended', async () => {
        let buyerWallet = accounts[2];
        await saleContract.setTime(data.PRESALE_END_DATE);
        let weiAmount = data.MINIMAL_PURCHASE_WEI.mul(1);
        await saleContract.sendTransaction({value: weiAmount, from: buyerWallet})
            .should.be.rejectedWith(': revert');
    });

});
