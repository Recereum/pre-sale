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
        let buyerBalance = await web3.eth.getBalance(buyerWallet);
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
        let buyerBalance = await web3.eth.getBalance(buyerWallet);
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
        buyerBalance.sub(acceptedWei).sub(etherUsed).should.be.bignumber.equal(
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

    it('Buy token, then change date and fail to buy', async () => {
        let buyerWallet = accounts[2];
        await saleContract.setTime(data.PRESALE_START_DATE);
        let weiAmount = data.MINIMAL_PURCHASE_WEI.mul(1);
        await saleContract.sendTransaction({value: weiAmount, from: buyerWallet})

        await saleContract.setTime(data.PRESALE_END_DATE);
        await saleContract.sendTransaction({value: weiAmount, from: buyerWallet})
            .should.be.rejectedWith(': revert');
    });


    it('Just another purchase test', async () => {
        let tokenContract = await RecereumToken.new();
        let fundsWallet = accounts[1];
        let buyerWallet = accounts[2];
        let tokenCap = 500 * (10**data.DECIMALS);
        let saleContract = await RecereumPreSaleMock.new(
            tokenContract.address,
            fundsWallet,
            data.PRESALE_START_DATE,
            data.PRESALE_END_DATE,
            tokenCap
        );
        await tokenContract.approve(
            saleContract.address,
            tokenCap,
            {from: accounts[0]}
        );
        await saleContract.setTime(data.PRESALE_START_DATE);

        // initial balances
        let fundsBalance = await web3.eth.getBalance(fundsWallet);
        let buyerBalance = await web3.eth.getBalance(buyerWallet);
        let tokenBalance = await tokenContract.balanceOf.call(buyerWallet);
        0..should.be.bignumber.equal(tokenBalance);

        // Spend 1 ether, buy 420 tokens
        let weiAmount = data.ETHER.mul(1)
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
        buyerBalance.sub(weiAmount).sub(etherUsed).should.be.bignumber.equal(
            await web3.eth.getBalance(buyerWallet)
        );

        // Spend 1 ether more, buy 80 tokens because of hard cap of 500 tokens
        let res2 = await saleContract.sendTransaction({
            value: data.ETHER.mul(1),
            from: buyerWallet
        });
        // calculate expected values
        let newTokenAmount = 80 * (10**data.DECIMALS);
        let etherUsed2 = etherUsedForTx(res2);
        let extraFundsAmount = data.TOKEN_PRICE_WEI.mul(80);
        // Do checks
        tokenBalance.add(tokenAmount).add(newTokenAmount).should.be.bignumber.equal(
            await tokenContract.balanceOf.call(buyerWallet)
        );
        fundsBalance.add(weiAmount).add(extraFundsAmount).should.be.bignumber.equal(
            await web3.eth.getBalance(fundsWallet)
        );
        buyerBalance.sub(weiAmount).sub(extraFundsAmount).sub(etherUsed).sub(etherUsed2).should.be.bignumber.equal(
            await web3.eth.getBalance(buyerWallet)
        );

        // Spend 1 ether more, get exception
        let res3 = await saleContract.sendTransaction({
                value: data.ETHER.mul(1),
                from: buyerWallet
            }).should.be.rejectedWith(': revert');
    });
});
