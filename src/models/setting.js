import { parse } from 'query-string';

const initSettings = JSON.parse(window.localStorage.getItem('mxc.settings')) || {};
const querys = parse(window.location.search);
if (querys.theme) {
  initSettings.theme = querys.theme;
  window.localStorage.setItem('mxc.settings', JSON.stringify(initSettings));
}

if (!initSettings.theme) {
  initSettings.theme = 'dark';
}

export default {
  namespace: 'setting',
  state: initSettings,
  reducers: {
    changeSetting(state, { payload }) {
      const newState = {
        ...state,
        ...payload
      };
      window.localStorage.setItem('mxc.settings', JSON.stringify(newState));
      return newState;
    }
  }
};
