import { newMarginSocketListen } from '@/services/margin-socket';
import { cutFloatDecimal } from '@/utils';
import { newmarginAssetsBalance, newMarginTriggerHistoryOrder, newmarginAccount, newMarginOrder } from '@/services/api';

const safetyText = {
  1: 'margin.title.risk_1',
  2: 'margin.title.risk_2',
  3: 'margin.title.risk_3'
};

const InitState = {
  accounts: [],
  account: {
    currencyAsset: {
      borrow: 0,
      interest: 0,
      name: 'BTC',
      total: 0
    },
    liquidationPrice: '0',
    marketAsset: {
      borrow: 0,
      interest: 0,
      name: 'USDT',
      total: 0
    },
    stopLine: '0',
    riskRate: '0'
  },
  openAccounts: [],
  orders: [],
  triggerOrders: [],
  quantityScale: '',
  lastPair: '',
  currentPairBalance: {},
  currentPair: {},
  isRegist: false,
  collapse: false,
  marginType: 'cross'
};

export default {
  namespace: 'margin',
  state: InitState,
  effects: {
    *getMarginBalance({ payload }, { call, put, select }) {
      const response = yield call(newmarginAssetsBalance, { accountType: payload.accountType, symbol: payload.symbol });
      const { code, msg, ...rest } = response;
      const [currency, market] = payload.symbol.split('_');
      const data = rest.data.find(i => i.accountName === payload.symbol.replace('_', '/')) || {
        assetItem: [],
        accountName: '',
        stopOutPrice: '0',
        stopLine: '1.1',
        withdrawLine: '2',
        riskRate: '0',
        btcAmount: '0',
        usdtAmount: '0',
        cynAmount: '0'
      };
      const balances = {};
      balances.btcAmount = data.btcAmount;
      balances.usdtAmount = data.usdtAmount;
      balances.cynAmount = data.cynAmount;
      balances[currency] = data.currencyAsset || { available: '0' };
      balances[market] = data.marketAsset || { available: '0' };
      yield put({
        type: 'setMarginOpenAccounts',
        payload: rest.data.map(i => i.accountName)
      });
      yield put({
        type: 'saveMarginBalance',
        payload: {
          balances
        }
      });
      const _assetItem0 = data.currencyAsset || {};
      const _assetItem1 = data.marketAsset || {};
      const _accountName = data.accountName ? data.accountName : payload.symbol.replace('_', '/');
      yield put({
        type: 'setMarginAccount',
        payload: {
          data: {
            currencyAsset: {
              borrow: _assetItem0.borrow,
              interest: _assetItem0.interest,
              name: _assetItem0.name,
              total: _assetItem0.total
            },
            liquidationPrice: data.stopOutPrice,
            marketAsset: {
              borrow: _assetItem1.borrow,
              interest: _assetItem1.interest,
              name: _assetItem1.name,
              total: _assetItem1.total
            },
            btcAmount: data.btcAmount,
            riskRate: data.riskRate,
            stopLine: data.stopLine,
            usdtAmount: data.usdtAmount,
            cynAmount: data.cynAmount,
            withdrawLine: data.withdrawLine
          },
          symbol: _accountName
        }
      });
    },
    *getMarginAccounts({ payload }, { call, put, select }) {
      const res = yield call(newmarginAccount, { accountType: 'STEP' });
      const { data, code } = res;
      if (code === 200) {
        yield put({
          type: 'setMarginAccounts',
          payload: data
        });
      }
    },
    *getMarginOrder({ payload }, { call, put, select }) {
      const res = yield call(newMarginOrder, payload);
      const { data } = res;
      const _order = data.resultList;
      yield put({
        type: 'setOrders',
        payload: { data: _order }
      });
    },
    *getMarginTriggerOrder({ payload }, { call, put, select }) {
      const res = yield call(newMarginTriggerHistoryOrder, payload);
      const { data, code } = res;
      if (code === 200) {
        const _order = data.resultList;
        yield put({
          type: 'setTriggerOrders',
          payload: { data: _order }
        });
      }
    }
  },
  reducers: {
    setMarginAccount(state, { payload }) {
      const { data, symbol, channel } = payload;
      const _currentSymbol = `${state.currentPair.currency}${channel ? '_' : '/'}${state.currentPair.market}`;
      let _account = {};
      if (_currentSymbol === symbol) {
        _account = { ...state.account, ...data };
      } else {
        _account = { ...state.account };
      }
      return {
        ...state,
        account: _account
      };
    },
    setMarginAccounts(state, { payload }) {
      const accounts = [...payload];
      return {
        ...state,
        accounts
      };
    },
    setOrders(state, { payload }) {
      const data = payload.data || [];

      const orders = data.map(o => {
        const pairArray = o.symbol.split('_');
        return {
          ...o,
          currency: pairArray[0],
          market: pairArray[1]
        };
      });
      return {
        ...state,
        orders
      };
    },
    setPushOrders(state, { payload }) {
      const { orders } = state;
      const data = payload;
      const pairArray = data.symbol.split('_');
      const newOrders = [...orders];
      const invalid =
        Number(data.quantity) === 0 ||
        Number(data.remainQuantity) === 0 ||
        data.status === 'CANCELED' ||
        data.status === 'PARTIALLY_CANCELED' ||
        data.status === 'FILLED';
      const i = orders.findIndex(o => o.orderNo === data.orderNo);
      const order = {
        ...data,
        currency: pairArray[0],
        market: pairArray[1]
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
    saveMarginBalance(state, { payload }) {
      return {
        ...state,
        currentPairBalance: payload || {}
      };
    },
    setCurrentPair(state, { payload }) {
      return {
        ...state,
        currentPair: payload || {}
      };
    },
    setRegist(state, { payload }) {
      return {
        ...state,
        isRegist: payload
      };
    },
    setLastPair(state, { payload }) {
      return {
        ...state,
        lastPair: payload
      };
    },
    toggleCollapse(state) {
      return {
        ...state,
        collapse: !state.collapse
      };
    },
    setMarginType(state, { payload }) {
      return {
        ...state,
        marginType: payload
      };
    },
    setMarginOpenAccounts(state, { payload }) {
      return {
        ...state,
        openAccounts: payload
      };
    },
    setTriggerOrders(state, { payload }) {
      const triggerOrders = payload.data.map(o => {
        const pairArray = o.symbol.split('_');
        const amount = Number(o.price) * Number(o.quantity);
        return {
          ...o,
          currency: pairArray[0],
          market: pairArray[1],
          amount
        };
      });
      return {
        ...state,
        triggerOrders
      };
    },
    setPushTriggerOrders(state, { payload }) {
      // console.log('setPushTriggerOrders', action.payload)
      const { triggerOrders } = state;
      const data = payload;

      const newOrders = [...triggerOrders];
      const i = triggerOrders.findIndex(o => o.orderNo === data.id);
      const amount = Number(data.price) * Number(data.quantity);
      const order = {
        ...data,
        amount,
        orderNo: data.id
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
      return newMarginSocketListen(({ type, payload }) => {
        dispatch({
          type,
          payload
        });
      });
    }
  }
};
