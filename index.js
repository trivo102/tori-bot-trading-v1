const ccxt = require('ccxt');
const moment = require('moment');
const delay = require('delay');

const binance = new ccxt.binance({
    apiKey: 'ZfIxLRvVhtLccj9vtyKovFb4Zp0Oi4izKxsWyNQpSeCFV3PFTQTMdJgAnPkfR6xE',
    secret: '5IZL5RThuscLh1NxLv1Hf500VY212zlQmCTvvthBfB77atX0atBA9vvPOjgDpdHN',
});

binance.setSandboxMode(true);

async function printBalance(btcPrice) {
    const balance = await binance.fetchBalance();
    const total = balance.total
    console.log(`Balance: BTC = ${total.BTC}, USDT = ${total.USDT}`);
    console.log(`Total USDT = ${(total.BTC - 1) * btcPrice + total.USDT}. \n`);
}

async function trading() {
    const price = await binance.fetchOHLCV('BTC/USDT', '5m', undefined, 4);
    const bPrice = price.map(price => {
        return {
            timestamp: moment(price[0]).format(),
            open: price[1], 
            hight: price[2], 
            low: price[3], 
            close: price[4], 
            volume: price[5]
        }
    });

    const lastPrice = bPrice[bPrice.length - 1].close
    const prevPrice = bPrice[2].close;

    var direction = 'wait';
    const TRADE_SIZE = 100;
    const quantity = TRADE_SIZE / prevPrice;

    if(prevPrice < bPrice[1].close && bPrice[1].close < bPrice[0].close) {
        direction = 'sell';
    } else if(prevPrice > bPrice[1].close && bPrice[1].close > bPrice[0].close){
        direction = 'buy';
    }
    console.log(direction);
    if(direction != 'wait') {
        const order = await binance.createMarketOrder('BTC/USDT', direction, quantity);
        console.log(`${moment().format()}: ${direction} ${quantity} BTC at ${lastPrice}`);
        printBalance(lastPrice);
    }
}

async function startTrading() {
    while (true) {
        const minute = new Date().getMinutes();
        console.log(minute);
        if(minute % 5 == 0) {
            await trading();
        }
        await delay(1 * 60 * 1000);
    }
}

async function main() {
    var begin = true;
    while (begin == true) {
        const second = new Date().getSeconds();
        if(second == 1) {
            await startTrading();
            begin = false;
        }
        await delay(1000);
    }
}

main()