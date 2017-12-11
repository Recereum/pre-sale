let moment = require('moment');
let big = require('./util/bigNum.js').big;

const TOKEN_NAME = 'Recereum Token';
const TOKEN_SYMBOL = 'RCR';
const DECIMALS = big(18);
const ETHER = big(10).toPower(18);
const TOTAL_SUPPLY = big(7999000).mul(10**DECIMALS);
const PRESALE_TOKEN_CAP = big(480000).mul(10**DECIMALS);
const PRESALE_START_DATE = moment('2018-01-01T00:00:00Z').unix();
const PRESALE_END_DATE = moment('2018-01-15T00:00:00Z').unix();
const MINIMAL_PURCHASE_WEI = ETHER.mul(1);
const TOKEN_PRICE_WEI = ETHER.divToInt(300);

module.exports = {
    TOKEN_NAME,
    TOKEN_SYMBOL,
    DECIMALS,
    ETHER,
    TOTAL_SUPPLY,
    PRESALE_TOKEN_CAP,
    PRESALE_START_DATE,
    PRESALE_END_DATE,
    MINIMAL_PURCHASE_WEI,
    TOKEN_PRICE_WEI,
}
