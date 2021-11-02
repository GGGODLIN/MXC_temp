import { mainSocketListenStatus  } from '@/services/main-socket';

export default {
  namespace: 'wsStatus',

  state: {
    connectState: '',
    delayTime: 0,
  },

  effects: {
  },

  reducers: {
    setConnectState(state, action) {
      return {
        ...state,
        connectState: action.payload,
      };
    },
    setDelayTime(state, action) {
      return {
        ...state,
        delayTime: action.payload,
      };
    },
  },

  subscriptions: {
    socket({ dispatch } ) {
      return mainSocketListenStatus((action) => {
        dispatch(action);
      });
    },
  },
};
