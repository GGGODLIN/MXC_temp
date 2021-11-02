import { getETFIndexSymbols, getETFIndexInfo, getETFIndexOrderList } from '@/services/api';

export default {
  namespace: 'etfIndex',

  state: {
    symbols: [],
    netValues: {},
    etfCurrency: '',
    orders: [],
    coinList: [],
    orderType: 'subscribe',
    etfItem: {}
  },

  effects: {
    *getEtfSymbols({ payload }, { call, put, select }) {
      const res = yield call(getETFIndexSymbols);
      const { code, data } = res;

      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            symbols: data
            //etfCurrency: data[0].symbol
          }
        });
      }
    },
    *getEtfNetValue({ payload }, { call, put, select }) {
      const res = yield call(getETFIndexInfo, payload);
      const { code, data } = res;
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            netValues: data.value_info,
            coinList: data.coin_Ratio
          }
        });
      }
    },
    *getEtfOrderList({ payload }, { call, put, select }) {
      const res = yield call(getETFIndexOrderList, payload);
      const { code, data } = res;
      const { resultList } = data;

      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            orders: resultList
          }
        });
      }
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
