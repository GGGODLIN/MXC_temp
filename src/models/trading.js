import { mainSocketListenTrading } from '@/services/main-socket';
import { calcRate, cutFloatDecimal, genKey, marketOrder } from '@/utils';
import { getUserFavorites, getSupportSymbol, newMarginCoinList, getMarketSymbols } from '@/services/api';
import { getLocale } from 'umi-plugin-locale';

const lang = getLocale();

const initTrading = {
  markets: [],
  originMarkets: [],
  firstLoadedMarkets: [],
  cnyPrices: {},
  selectedFiat: 'CNY',
  currentPair: {},
  asks: [],
  bids: [],
  trades: [],
  orders: [],
  margins: [],
  triggerOrders: [],
  selectedPrice: '',
  selectedBidQuantity: '',
  selectedAskQuantity: '',
  userFavorites: [],
  showKlineOrDepth: 'kline',
  showCollapsePairs: false
};

const localTrading = JSON.parse(window.localStorage.getItem('mxc.trading')) || {};

const getNewList = (oldList, pushList, priceScale, quantityScale) => {
  let filterdList = oldList;
  pushList.forEach(_n => {
    const n = {
      p: Number(_n.p),
      q: Number(_n.q),
      priceString: cutFloatDecimal(_n.p, priceScale),
      quanString: cutFloatDecimal(_n.q, quantityScale)
    };
    const idx = filterdList.findIndex(item => Number(item.p) === n.p);
    if (idx >= 0) {
      n.changed = true;
      n.new = false;
      filterdList[idx] = n;
    } else {
      n.new = true;
      filterdList.push(n);
    }
    // let i = -1;
    // for (let j = 0; j < filterdList.length; j++) {
    //   const o = filterdList[j];
    //   o.changed = false;
    //   o.new = false;
    //   if (o.priceString === cutFloatDecimal(n.p, priceScale)) {
    //     i = j;
    //   }
    // }
    // if (i >= 0) {
    //   if (!(n.q > 0)) {
    //     filterdList.splice(i, 1);
    //   } else {
    //     filterdList[i] = {
    //       ...filterdList[i],
    //       ...n,
    //       changed: true
    //     };
    //   }
    // } else if (n.q > 0) {
    //   n.new = true;
    //   filterdList.push({
    //     ...n,
    //     priceString: cutFloatDecimal(n.p, priceScale),
    //     quanString: cutFloatDecimal(n.q, quantityScale)
    //   });
    // }
  });
  return filterdList.filter(a => Number(a.q) > 0).sort((a, b) => b.p - a.p);
};

const mergeFavorites = (list = [], markets = []) => {
  markets.forEach(market => {
    market.list.forEach(item => {
      const symbol = `${item.currency}_${item.market}`;
      item.favorite = list.includes(symbol);
    });
  });
  return [...markets];
};

const mergeMargin = (list = [], markets = []) => {
  markets.forEach(market => {
    market.list.forEach(item => {
      const symbol = `${item.currency}_${item.market}`;
      const _margin = list.find(i => symbol === `${i.baseCurrency}_${i.quoteCurrency}`);
      if (_margin) {
        item.ratio = _margin.ratio;
        item.margin = true;
      }
    });
  });
  return [...markets];
};

export default {
  namespace: 'trading',

  state: {
    ...initTrading,
    ...localTrading,
    selectedFiat: lang.startsWith('zh') ? 'CNY' : 'USD'
  },

  effects: {
    *saveLocal(_, { call, put, select }) {
      const trading = yield select(state => state.trading);
      const temp = {
        markets: trading.markets,
        firstLoadedMarkets: trading.firstLoadedMarkets,
        cnyPrices: trading.cnyPrices,
        selectedFiat: trading.selectedFiat,
        currentPair: trading.currentPair,
        showKlineOrDepth: trading.showKlineOrDepth,
        margins: trading.margins
        // asks: trading.asks,
        // bids: trading.bids,
        // trades: trading.trades
      };
      console.log('save local markets');

      yield window.localStorage.setItem('mxc.trading', JSON.stringify(temp));
    },
    *getUserFavorites(_, { call, put, select }) {
      const auth = yield select(state => state.auth);
      const res = yield call(getUserFavorites, auth.user.id);
      yield put({
        type: 'setUserFavorites',
        payload: res
      });
    },
    *getMargins(_, { call, put, select }) {
      const res = yield call(newMarginCoinList);
      const { data } = res;
      yield put({
        type: 'setMargins',
        payload: data.map(item => {
          const symbol = item.symbol.split('_');
          return {
            quoteCurrency: symbol[1],
            symbol: symbol.join('/'),
            baseCurrency: symbol[0],
            ratio: item.ratio,
            stopLine: item.stopLine,
            enableGradually: item.enableGradually
          };
        })
      });
    },
    *getSymbols(_, { call, put, select }) {
      const res = yield call(getMarketSymbols);
      const { data, code } = res;
      if (code === 200) {
        yield put({
          type: 'setMarkets',
          payload: data
        });
      }
    }
  },

  reducers: {
    setShowKlineOrDepth(state, { payload }) {
      return {
        ...state,
        showKlineOrDepth: payload
      };
    },
    setUserFavorites(state, { payload }) {
      const { markets, currentPair } = state;
      const symbol = `${currentPair.currency}_${currentPair.market}`;
      return {
        ...state,
        userFavorites: payload,
        markets: mergeFavorites(payload, markets),
        currentPair: {
          ...currentPair,
          favorite: payload.includes(symbol)
        }
      };
    },
    setMargins(state, { payload }) {
      const markets = state.markets;
      return {
        ...state,
        margins: payload,
        markets: mergeMargin(payload, markets)
      };
    },
    setMarkets(state, { payload }) {
      const limitList = [],
        etfs = [],
        assess = [],
        scalesObj = {};
      let markets = [];
      let originMarkets = [];

      Object.entries(payload).forEach(([prop, value]) => {
        const normalList = [];

        value.forEach(pair => {
          if (pair.etf) {
            etfs.push(pair);
          } else if (pair.type === 'NEW') {
            limitList.push(pair);
          } else if (pair.type === 'ASSESS') {
            assess.push(pair);
          } else {
            normalList.push(pair);
          }
          scalesObj[`${pair.currency}/${pair.market}`] = {
            [pair.market]: pair.priceScale,
            [pair.currency]: pair.quantityScale
          };
        });
        if (prop === 'USDT') {
          originMarkets = value;
        }
        if (marketOrder.includes(prop)) {
          markets.push({
            marketName: prop,
            list: normalList
          });
        }
      });
      markets = markets.sort((a, b) => {
        const aI = marketOrder.indexOf(a.marketName);
        const bI = marketOrder.indexOf(b.marketName);
        return aI - bI;
      });
      markets = markets.concat([
        {
          marketName: 'ETF',
          list: etfs
        },
        {
          marketName: 'market.new',
          list: limitList
        },
        {
          marketName: 'market.assess',
          list: assess
        }
      ]);
      if (state.userFavorites.length) {
        markets = mergeFavorites(state.userFavorites, markets);
      }
      if (state.margins && state.margins.length) {
        mergeMargin(state.margins, markets);
      }
      return {
        ...state,
        markets,
        originMarkets: originMarkets,
        scales: scalesObj,
        firstLoadedMarkets: markets
      };
    },
    setMarketsPush(state, { payload }) {
      const { markets, currentPair } = state;
      let newCurrent = null;
      Object.entries(payload).forEach(([prop, value]) => {
        const pair = prop.split('_');
        for (let i = 0; i < markets.length; i++) {
          for (let j = 0; j < markets[i].list.length; j++) {
            let item = markets[i].list[j];
            if (item.currency === pair[0] && item.market === pair[1]) {
              const newData = value;
              item.c = newData.p;
              item.rate = newData.r;
              item.l = item.l - newData.p > 0 ? newData.p : item.l;
              item.h = item.h - newData.p < 0 ? newData.p : item.h;
              if (item.market === currentPair.market && item.currency === currentPair.currency) {
                item.q = currentPair.q;
                newCurrent = item;
              }
              break;
            }
          }
        }
      });
      return {
        ...state,
        markets: [...markets],
        currentPair: newCurrent
          ? {
              ...currentPair,
              ...newCurrent
            }
          : currentPair
      };
    },
    setCnyPrices(state, { payload }) {
      return {
        ...state,
        cnyPrices: payload
      };
    },
    setSelectedFiat(state, { payload }) {
      return {
        ...state,
        selectedFiat: payload
      };
    },
    setSelectedFromMarkets(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    setShowCollapsePairs(state, { payload }) {
      return {
        ...state,
        showCollapsePairs: payload
      };
    },
    setFullTrades(state, { payload }) {
      // console.log('setFullTrades', payload);
      const { symbol, data } = payload;
      const { currentPair } = state;
      const { currency, market } = currentPair;
      if (symbol !== `${currency}_${market}`) {
        console.log('mismatch deal data');
        return state;
      }
      let _data = data.length > 50 ? data.slice(0, 50) : data;
      _data = data.map(t => {
        return {
          ...t,
          id: genKey()
        };
      });
      return {
        ...state,
        trades: _data
      };
    },
    setFullDepth(state, { payload }) {
      // console.log('setFullDepth', payload);
      const { symbol, data } = payload;
      const { currentPair } = state;
      const { currency, market, priceScale, quantityScale } = currentPair;
      if (symbol !== `${currency}_${market}`) {
        console.log('mismatch deal data');
        // return { ...state };
        return state;
      }
      const { bids, asks } = data;
      const _bids = bids.map(i => ({
        ...i,
        priceString: cutFloatDecimal(i.p, priceScale),
        quanString: cutFloatDecimal(i.q, quantityScale)
      }));
      const _asks = asks
        .sort((a, b) => b.p - a.p)
        .map(i => ({
          ...i,
          priceString: cutFloatDecimal(i.p, priceScale),
          quanString: cutFloatDecimal(i.q, quantityScale)
        }));
      return {
        ...state,
        bids: _bids,
        asks: _asks
      };
    },
    setCurrentPair(state, { payload }) {
      // console.log('setCurrentPair', payload)
      return {
        ...state,
        currentPair: payload
        // trades: [],
        // orders: [],
        // triggerOrders: []
      };
    },
    setCurrentPairValue(state, { payload }) {
      // console.log('setCurrentPairValue', payload)
      const { currentPair } = state;
      const newPair = {
        ...currentPair,
        ...payload
      };
      return {
        ...state,
        currentPair: newPair
      };
    },
    setPushPairValue(state, { payload }) {
      // console.log('setCurrentPairValue', payload)
      const { currentPair, trades, bids, asks } = state;
      const { symbol, data } = payload;
      const { currency, market } = currentPair;
      if (symbol !== `${currency}_${market}`) {
        console.log('mismatch push data');
        return state;
      }
      let newTrades, newBids, newAsks, newCurrentPair;
      if (data.deals) {
        let sumQuan = 0;
        const pushes = data.deals
          .map(t => {
            sumQuan += Number(t.q);
            return {
              ...t,
              id: genKey()
            };
          })
          .sort((a, b) => b.t - a.t);
        newTrades = pushes.concat(trades);
        newTrades = newTrades.length > 50 ? newTrades.slice(0, 50) : newTrades;
        const latest = newTrades[0];
        if (latest) {
          const p = Number(latest.p);
          const q = sumQuan;
          const l = currentPair.l > p ? p : currentPair.l;
          const h = currentPair.h < p ? p : currentPair.h;
          const quan = currentPair.q + q;
          const newRate = calcRate(p, currentPair.c, currentPair.rate);
          newCurrentPair = {
            ...currentPair,
            c: latest.p,
            rate: newRate,
            l: l,
            h: h,
            q: quan
          };
        }
      }
      if (data.asks) {
        // console.log('new asks')
        newAsks = getNewList(asks, data.asks, currentPair.priceScale, currentPair.quantityScale);
      }
      if (data.bids) {
        // console.log('new bids')
        newBids = getNewList(bids, data.bids, currentPair.priceScale, currentPair.quantityScale);
      }
      return {
        ...state,
        trades: newTrades ? [...newTrades] : trades,
        currentPair: newCurrentPair || currentPair,
        asks: newAsks ? [...newAsks] : asks,
        bids: newBids ? [...newBids] : bids
      };
    },
    setOrders(state, { payload }) {
      const { currentPair } = state;
      const { quantityScale, priceScale } = currentPair;
      const orders = payload.data.map(o => {
        return {
          ...o,
          priceString: cutFloatDecimal(o.price, priceScale),
          remainQuantityString: cutFloatDecimal(o.remainQuantity, quantityScale),
          quantityString: cutFloatDecimal(o.quantity, quantityScale),
          amountString: cutFloatDecimal(o.amount, priceScale)
        };
      });
      return {
        ...state,
        orders
      };
    },
    setPushOrders(state, { payload }) {
      // console.log('setPushOrders', action.payload)
      const { currentPair, orders } = state;
      const { symbol, data } = payload;
      const { currency, market, quantityScale, priceScale } = currentPair;
      if (symbol !== `${currency}_${market}`) {
        console.log('mismatch push orders');
        return state;
      }
      const newOrders = [...orders];
      const invalid = Number(data.quantity) === 0 || Number(data.remainQuantity) === 0;
      const i = orders.findIndex(o => o.id === data.id);
      const order = {
        ...data,
        priceString: cutFloatDecimal(data.price, priceScale),
        remainQuantityString: cutFloatDecimal(data.remainQuantity, quantityScale),
        quantityString: cutFloatDecimal(data.quantity, quantityScale),
        amountString: cutFloatDecimal(data.amount, priceScale)
      };
      if (i >= 0) {
        if (invalid) {
          newOrders.splice(i, 1);
        } else {
          newOrders[i] = {
            ...newOrders[i],
            ...order
          };
        }
      } else {
        if (!invalid) {
          newOrders.unshift(order);
        }
      }
      return {
        ...state,
        orders: newOrders
      };
    },
    setTriggerOrders(state, { payload }) {
      const { currentPair } = state;
      const { quantityScale, priceScale } = currentPair;
      const triggerOrders = payload.data.map(o => {
        const amount = Number(o.price) * Number(o.quantity);
        return {
          ...o,
          amount,
          priceString: cutFloatDecimal(o.price, priceScale),
          triggerPriceString: cutFloatDecimal(o.triggerPrice, priceScale),
          quantityString: cutFloatDecimal(o.quantity, quantityScale),
          amountString: cutFloatDecimal(amount, priceScale)
        };
      });
      return {
        ...state,
        triggerOrders
      };
    },
    setPushTriggerOrders(state, { payload }) {
      // console.log('setPushTriggerOrders', action.payload)
      const { currentPair, triggerOrders } = state;
      const { symbol, data } = payload;
      const { currency, market, quantityScale, priceScale } = currentPair;
      if (symbol !== `${currency}_${market}`) {
        console.log('mismatch push orders');
        return state;
      }
      const newOrders = [...triggerOrders];
      const i = triggerOrders.findIndex(o => o.id === data.id);
      const amount = Number(data.price) * Number(data.quantity);
      const order = {
        ...data,
        amount,
        priceString: cutFloatDecimal(data.price, priceScale),
        triggerPriceString: cutFloatDecimal(data.triggerPrice, priceScale),
        quantityString: cutFloatDecimal(data.quantity, quantityScale),
        amountString: cutFloatDecimal(amount, priceScale)
      };
      if (i >= 0) {
        if (data.state !== 'NEW') {
          newOrders.splice(i, 1);
        }
      } else {
        if (data.state === 'NEW') {
          newOrders.unshift(order);
        }
      }
      return {
        ...state,
        triggerOrders: newOrders
      };
    }
  },

  subscriptions: {
    socket({ dispatch }) {
      return mainSocketListenTrading(({ type, payload }) => {
        dispatch({
          type,
          payload
        });
      });
    }
  }
};
