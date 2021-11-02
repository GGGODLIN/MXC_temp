import {
  getAnnouncements,
  getServerTime,
  getCountryList,
  getMXStatistics,
  getCoins,
  getAppUrl,
  getAppConfig,
  queryHotSearch
} from '@/services/api';
import { fetch } from 'dva';
export default {
  namespace: 'global',

  state: {
    initialHistoryLength: 0,
    announcements: [],
    serverClientTimeDiff: 0,
    countryList: [],
    topMessageClosed: false,
    MXStatistics: {},
    coinList: [],
    topBarIsStricky: false,
    appUrl: {},
    entranceList: [],
    activity: {},
    homeModalList: [0, 0],
    hotSearchList: []
  },

  effects: {
    *getAnnouncements({ payload }, { call, put, select }) {
      const response = yield call(getAnnouncements, {
        lang: payload.lang,
        showProgress: false
      });
      const data = response.msg;
      yield put({
        type: 'saveAnnouncements',
        payload: data
      });
    },
    *getServerTimestamp(_, { call, put, select }) {
      const response = yield call(getServerTime);
      let diff = 0;
      if (response.msg && !isNaN(Number(response.msg))) {
        diff = Number(response.msg) - Date.now();
      }
      yield put({
        type: 'saveServerClientTimeDiff',
        payload: diff
      });
    },
    *getCountryList(_, { call, put, select }) {
      const response = yield call(getCountryList);
      // 过滤掉其它国家选项
      // let filteredList = response.data.filter(country => country.code.toLowerCase() !== 'other');
      let filteredList = response.data;
      let defaultCountry = response?._extend?.defaultCountry;

      yield put({
        type: 'saveCountryList',
        payload: {
          countryList: filteredList,
          defaultCountry
        }
      });
    },
    *getMxStatistics(_, { call, put, select }) {
      const response = yield call(getMXStatistics);
      yield put({
        type: 'saveMxStatistics',
        payload: response || {}
      });
    },
    *getCoinList(_, { call, put, select }) {
      const response = yield call(getCoins);
      // 过滤掉其它国家选项
      let coinList = response.data.filter(i => !!i);

      yield put({
        type: 'saveCoinList',
        payload: [...coinList]
      });
    },
    *getAppUrl(_, { call, put, select }) {
      const response = yield call(getAppUrl);
      // 过滤掉其它国家选项
      let appUrl = response.data;

      yield put({
        type: 'saveAppUrl',
        payload: appUrl
      });
    },
    *getHomeConfig(_, { call, put, select }) {
      const response = yield getAppConfig();
      const { data } = response;
      data.items = data.items.filter(item => item.type === 19);
      yield put({
        type: 'saveHomgConfig',
        payload: data
      });
    },
    *getHotSearch(_, { call, put, select }) {
      const response = yield queryHotSearch();
      const { data } = response;
      yield put({
        type: 'saveHotSearchList',
        payload: data || []
      });
    }
  },

  reducers: {
    saveInitialHistoryLength(state, { payload }) {
      return {
        ...state,
        initialHistoryLength: payload
      };
    },
    saveAnnouncements(state, { payload }) {
      const announcements = payload || [];
      return {
        ...state,
        announcements,
        topMessageClosed: announcements.length === 0 ? true : state.topMessageClosed
      };
    },
    saveServerClientTimeDiff(state, { payload }) {
      return {
        ...state,
        serverClientTimeDiff: payload
      };
    },
    saveCountryList(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    saveTopMessageClosed(state, { payload }) {
      return {
        ...state,
        topMessageClosed: payload
      };
    },
    saveMxStatistics(state, { payload }) {
      return {
        ...state,
        MXStatistics: payload
      };
    },
    saveCoinList(state, { payload }) {
      return {
        ...state,
        coinList: payload
      };
    },
    saveTopBarIsStricky(state, { payload }) {
      return {
        ...state,
        topBarIsStricky: payload
      };
    },
    saveAppUrl(state, { payload }) {
      return {
        ...state,
        appUrl: payload
      };
    },
    saveHomgConfig(state, { payload }) {
      return {
        ...state,
        entranceList: [...payload.items],
        activity: { ...payload.activity }
      };
    },
    saveHomeModalList(state, { payload }) {
      return {
        ...state,
        homeModalList: payload
      };
    },
    saveHotSearchList(state, { payload }) {
      return {
        ...state,
        hotSearchList: payload
      };
    }
  }
};
