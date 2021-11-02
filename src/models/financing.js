import { getAllFinancingHistoricalList } from '@/services/api';

export default {
  namespace: 'financing',
  state: {
    getfinancialList: [],
    numberpage: ''
  },

  effects: {
    // 理财超市
    *getAllFinancingHistoricalList({ params }, { call, put }) {
      const data = yield call(getAllFinancingHistoricalList, params);
      if (data.code === 0) {
        yield put({
          type: 'financial',
          payload: {
            data: data.data,
            page: data
          }
        });
      }
    }
  },
  reducers: {
    financial(state, { payload }) {
      let list = payload.data;
      let numberpage = payload.page;
      return {
        ...state,
        getfinancialList: [...list],
        numberpage: numberpage
      };
    }
  }
};
