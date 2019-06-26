import {ipcRenderer, Event} from 'electron';
import io from 'socket.io-client';
import axios from 'axios';

const CANDLES_HISTORY_API = 'https://api.tinkoff.ru/trading/symbols/candles?appName=invest_terminal&appVersion=1.0.0';

ipcRenderer.on('sessionId', async (_: Event, sessionId: string) => {
    const socket = io('wss://api-invest.tinkoff.ru', {
        transports: ['websocket', 'polling'],
        path: '/mdstream-public/v1/md-stream/socket.io',
        query: {
            sessionId,
        },
    });

    const orders:Array<{canBuy: string; canSell: string}> = [];
    let lastBuy: number = 0;
    let lastSell: number = 0;
    let wallet: number = 10000;
    let count: number = 0;
    let lastCount: number = 0;
    const commissionCoefficient = 0.00025;
    const profitCoefficient = 0.5;

    const buy = () => {
        const canBuy = parseFloat(orders[orders.length - 1].canBuy);
        count = wallet / canBuy;
        lastBuy = canBuy;
        const cost = count * canBuy;
        lastCount = count;
        wallet = wallet - (cost + (cost * commissionCoefficient));
        console.log('buy', lastBuy);
    };

    const trySell = () => {
        const canSell = parseFloat(orders[orders.length - 1].canSell);
        const cost = count * canSell;
        const commission = cost * commissionCoefficient;
        const lastCost = count * lastBuy;
        const lastCommission = lastCost * commissionCoefficient;
        const profit = lastCost - cost - commission - lastCommission;

        if (profit > profitCoefficient) {
            lastSell = canSell;
            wallet = wallet + cost - commission;
            count = 0;
            console.log('sell', canSell);
            console.log('profit:', profit);
        }
    };

    const tryBuy = () => {
        const order = orders[orders.length - 1];
        const canBuy = parseFloat(order.canBuy);
        const count = lastCount || wallet / canBuy;
        const cost = count * canBuy;
        const commission = cost * commissionCoefficient;
        const total = cost + commission;

        const lastSellCost = lastCount * lastSell;
        const lastSellCommission = lastSellCost * commissionCoefficient;
        const lastCost = lastSellCommission + lastSellCost;

        if (total < lastCost) {
            buy();
        }
    };

    const calculate = () => {
        if (lastBuy === 0) {
            buy();
            return;
        }

        if (!!count) {
            trySell();
            return;
        }

        if (count === 0) {
            tryBuy();
        }
    };

    try {
        const resp = await axios(`${CANDLES_HISTORY_API}&sessionId=${sessionId}`, {
            method: 'POST',
            data: {
                ticker: 'MSFT',
                resolution: '1',
                from: '2019-06-10T18:51:42.677Z',
                to: '2019-06-11T18:51:42.677Z',
            },
            withCredentials: true,
        });

        ipcRenderer.send('wsDataCandlesHistory', resp.data);





    } catch (e) {
        console.error(e.stack);
    }

    socket.emit('candles:subscribe', JSON.stringify({
        interval: '1min',
        symbol: 'MSFT_SPBXM',
    }));

    socket.emit('orderbook:subscribe', JSON.stringify({
        symbols: ['MSFT_SPBXM'],
        depth: 1,
    }));

    socket.on('candles', (data: string) => {
        ipcRenderer.send('wsData', {type: 'candles', data});
    });

    socket.on('orderbook', (data: string) => {
        // ipcRenderer.send('wsData', {type: 'orderbook', data});
        const item = JSON.parse(data);
        orders.push({
            canBuy: item.bids[0][0],
            canSell: item.asks[0][0],
        });
        calculate();
        console.log('wallet:', wallet, count);
        console.log('bid/ask:', item.bids[0][0], item.asks[0][0]);

        ipcRenderer.send('wsData', {type: 'orderbook', data: {
            ask: item.asks[0][0],
            bid: item.bids[0][0],
            symbol: 'MSFT_SPBXM',
        }});

            // await new Promise(res => setTimeout(res, 50));
    });
});
