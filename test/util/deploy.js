let data = require('../data.js');
let big = require('./bigNum.js').big;
let RecereumToken = artifacts.require('RecereumToken');
let RecereumPreSaleMock = artifacts.require('RecereumPreSaleMock');


async function deployTestContracts(accounts) {
    let tokenContract = await RecereumToken.new();
    let fundsWallet = accounts[1];
    let saleContract = await RecereumPreSaleMock.new(
        tokenContract.address,
        fundsWallet
    );
    await tokenContract.approve(
        saleContract.address,
        data.PRESALE_TOKEN_CAP,
        {from: accounts[0]}
    );
    return {
        tokenContract,
        saleContract,
        fundsWallet
    }
}

async function deployTestTokenContract() {
    let tokenContract = await RecereumToken.new();
    return {
        tokenContract,
    }
}

module.exports = {
    deployTestContracts,
    deployTestTokenContract,
}
