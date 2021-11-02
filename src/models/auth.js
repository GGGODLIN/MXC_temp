import { getUcenterIndexInfo, queryCurrentUser, getAntiPhishing, newMarginCheck, userLogout, loginByUcenter } from '@/services/api';
import { getCookie } from '@/utils';
export default {
  namespace: 'auth',

  state: {
    user: {},
    kycInfo: {}, // 实名认证信息
    authStatus: {}, // 实名认证状态
    vipLevel: null, // vip提现额
    logList: null, // 登录历史
    loginMember: null, // 用户信息
    phishingCode: null, // 防钓鱼码
    isOpenMarginV2: false, // 是否开通了杠杆
    inviteCode: null,
    marginChecking: false
  },

  effects: {
    *fetchCurrent(_, { call, put, select }) {
      const response = yield call(queryCurrentUser);
      const { code, msg, data } = response;

      if (code === 0) {
        if (data.token && !getCookie('u_id')) {
          yield put({
            type: 'putLoginByUcenter',
            payload: {
              ucenterToken: data.token
            }
          });
        }

        yield put({
          type: 'saveCurrentUser',
          payload: data
        });
      } else if (code === 10059 || code === 99999) {
        if (getCookie('u_id')) {
          userLogout();

          yield put({
            type: 'saveCurrentUser',
            payload: {}
          });
        }
      }
    },
    *getUcenterIndexInfo(_, { call, put, select }) {
      const { code, msg, data } = yield call(getUcenterIndexInfo);

      yield put({
        type: 'saveUcenterIndexInfo',
        payload: {
          loginMember: data,
          vipLevel: data.vipLevel,
          logList: data.logList,
          inviteCode: data.inviteCode,
          kycInfo: data.kycInfo
        }
      });

      yield put({
        type: 'saveAuthStatus',
        payload: data.kycInfo || {}
      });
    },
    *getPhishingCode(action, { call, put }) {
      const { code, msg, data } = yield call(getAntiPhishing);

      yield put({
        type: 'savePhishingCode',
        payload: data
      });
    },
    *checkMarginAccountState(_, { call, put, select }) {
      const response = yield call(newMarginCheck);
      const { code, msg, data } = response;
      if (code === 200) {
        yield put({
          type: 'saveMarginAccountState',
          payload: data
        });
        yield put({
          type: 'saveMarginChecking',
          payload: true
        });
      }
    },
    *putLoginByUcenter({ payload }, { call, put, select }) {
      const res = yield call(loginByUcenter, payload);
      return res;
    }
  },

  reducers: {
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        user: payload
      };
    },
    saveUcenterIndexInfo(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    saveMarginAccountState(state, { payload }) {
      return {
        ...state,
        isOpenMarginV2: payload
      };
    },
    saveMarginChecking(state, { payload }) {
      return {
        ...state,
        marginChecking: payload
      };
    },
    savePhishingCode(state, action) {
      let mixCode;

      if (action.payload) {
        if (action.payload.length > 2) {
          mixCode = action.payload.slice(0, -2) + '**';
        } else if (action.payload.length > 1) {
          mixCode = action.payload.slice(0, -1) + '*';
        } else {
          mixCode = action.payload || '';
        }
      }

      return {
        ...state,
        phishingCode: mixCode
      };
    },
    resetUserInfo(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    saveAuthStatus(state, action) {
      const { junior, senior } = action.payload || {};
      const authStatus = {
        juniorUnverified: !junior, // 未做初级
        juniorIng: junior && junior.status === 0, // 初级审核中
        juniorReject: junior && junior.status === 2, // 初级审核失败
        juniorSuccess: junior && junior.status === 1, // 初级审核通过
        seniorUnverified: !senior, // 未做高级
        seniorIng: senior && senior.status === 0, // 高级审核中
        seniorReject: senior && senior.status === 2, // 高级审核失败
        seniorSuccess: senior && senior.status === 1 // 高级审核通过
      };

      return {
        ...state,
        authStatus
      };
    }
  }
};
