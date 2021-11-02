export default {
  namespace: 'login',

  state: {
    loginInfo: {},
    registerInfo: {},
    fingerprint: null
  },

  effects: {},

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
