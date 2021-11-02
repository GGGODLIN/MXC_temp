import { getInstruments, getSupportCurrencies } from '@/services/contractapi';

export default {
  namespace: 'information',

  state: {
    productList: null,
    depositCurrencies: []
  },

  effects: {
    *getProductList({ payload }, { call, put, select }) {
      const response = yield call(getInstruments);
      const data = response.data;
      yield put({
        type: 'saveProductList',
        payload: data
      });
    },
    *reduceDepositCurrencies({ payload }, { call, put, select }) {
      const res = yield call(getSupportCurrencies);
      yield put({
        type: 'setDepositCurrencies',
        payload: {
          data: res.data || []
        }
      });
    }
  },

  reducers: {
    saveProductList(state, { payload }) {
      return {
        ...state,
        productList: payload || []
      };
    },
    setDepositCurrencies(state, { payload }) {
      return {
        ...state,
        depositCurrencies: [...payload.data]
      };
    }
  }
};
