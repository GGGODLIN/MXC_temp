import { getApiKeyList } from '@/services/api';
export default {
  namespace: 'api',
  state: {
    apiKeyList: null
  },

  effects: {
    *getApiKeyList(_, { call, put, select }) {
      const response = yield call(getApiKeyList);
      const { code, msg, data } = response;
      // console.log(rest)
      yield put({
        type: 'saveApiKeyList',
        payload: data
      });
    }
  },

  reducers: {
    saveApiKeyList(state, { payload }) {
      return {
        ...state,
        apiKeyList: payload || []
      };
    }
  }
};
