import { getPayPrecision, getCurrencyPrecision, getOtcUser } from '@/services/api';
const mcotcUser =
  localStorage.getItem('mc_otcUser') && localStorage.getItem('mc_otcUser') != 'null' && localStorage.getItem('mc_otcUser') != 'undefined'
    ? JSON.parse(localStorage.getItem('mc_otcUser'))
    : {};
console.log('获取当前信息', mcotcUser);

export default {
  namespace: 'otc',
  state: {
    otcuser: mcotcUser || {},
    orderListInfo: {},
    precision: {}, // 当前币种精度
    payPrecision: {}, //列表页所有国家支持货币精度
    pushPrecision: JSON.parse(sessionStorage.getItem('pushAccuracy')) || {},
    currencyActive: sessionStorage.getItem('currencyactive') || {},
    pushList: {},
    referencePrice: {},
    allPaymentList: JSON.parse(sessionStorage.getItem('mxc_allPayment')) || [],
    paymentConfig: JSON.parse(sessionStorage.getItem('mxc_payment')) || {},
    coinNameBalances: {} //当前币种的余额
  },

  effects: {
    // otc
    *otcUserInfo(_, { call, put, select }) {
      const response = yield call(getOtcUser);
      const { code, msg, ...rest } = response;
      yield put({
        type: 'otcsaveCurrentUser',
        payload: rest.data || {}
      });
      let user = JSON.stringify(rest.data || {});
      localStorage.setItem('mc_otcUser', user);
    },
    *putOrderInfo(payload, { call, put }) {
      const { data } = payload;
      yield put({
        type: 'OrderInfo',
        data: {
          ...data
        }
      });
    },
    // 支付货币币种精度
    *paycurrencyPrecision({ payload }, { call, put, select }) {
      let currency = payload.Currency;
      const response = yield call(getPayPrecision, currency);
      const { code, msg, ...rest } = response;
      yield put({
        type: 'putPayPrecision',
        payload: rest.data
      });
    },
    // 币种精度
    *currencyPrecision({ payload }, { call, put, select }) {
      let currency = payload.Currency;
      const response = yield call(getCurrencyPrecision, currency);
      const { code, msg, ...rest } = response;
      yield put({
        type: 'putPrecision',
        payload: rest.data
      });
    }
  },
  reducers: {
    changeAllPaymentList(state, { payload }) {
      return {
        ...state,
        allPaymentList: payload
      };
    },
    getPaymentConfig(state, { payload }) {
      console.log(payload);
      return {
        ...state,
        paymentConfig: payload || {}
      };
    },
    getCoinNameBalances(state, { payload }) {
      return {
        ...state,
        coinNameBalances: payload || {}
      };
    },
    changeReferencePrice(state, { payload }) {
      return {
        ...state,
        referencePrice: payload
      };
    },
    otcsaveCurrentUser(state, { payload }) {
      return {
        ...state,
        otcuser: payload
      };
    },
    OrderInfo(state, { payload }) {
      return {
        ...state,
        orderListInfo: payload
      };
    },
    putPayPrecision(state, { payload }) {
      return {
        ...state,
        payPrecision: payload
      };
    },
    putPrecision(state, { payload }) {
      return {
        ...state,
        precision: payload
      };
    },
    putCurrency(state, { payload }) {
      return {
        ...state,
        currencyActive: payload
      };
    },
    changePushPrecision(state, { payload }) {
      return {
        ...state,
        pushPrecision: payload
      };
    },
    changePushList(state, { payload }) {
      return {
        ...state,
        pushList: payload
      };
    }
  }
};
