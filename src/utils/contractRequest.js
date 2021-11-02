import { fetch } from 'dva';
import { message } from 'antd';
import nprogress from 'nprogress';
import { getCookie, clearCookie } from '@/utils';
import Utils from '@/utils/swapUtil';
import { stringify } from 'query-string';
import md5 from 'js-md5';
import { getLocale, formatMessage } from 'umi-plugin-locale';

const lang = getLocale();
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: 'Token失效,请重新登录',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};
const dictionary = 'abcdefghijklmnopqrstuvwxyz-0123456789_';
export default function request(url, option) {
  const newOptions = {
    showProgress: true,
    showErrorMsg: true,
    withCredentials: true,
    credentials: 'include',
    headers: {},
    ...option
  };
  if (NODE_ENV === 'development') {
    newOptions.credentials = 'include';
  }
  if (newOptions.body) {
    newOptions.body = JSON.stringify(newOptions.body);
  }
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      'Content-Type': 'application/json',
      ...newOptions.headers
    };
    if (newOptions.body) {
      const originBody = newOptions.body;
      let now = Date.now();
      if (window.g_app && window.g_app._store) {
        const state = window.g_app._store.getState() || {};
        const diff = state.global ? state.global.serverClientTimeDiff : 0;
        now += diff;
      }
      const tokenField = [dictionary[20], dictionary[37], dictionary[8], dictionary[3]].join('');
      const token = getCookie(tokenField);
      const firstMd5 = md5(token + now).substr(7);
      const hash = md5(now + originBody + firstMd5);
      // console.log('x-mxc-sign', token, body, now, firstMd5, hash);
      const hs = [
        dictionary[23],
        dictionary[26],
        dictionary[12],
        dictionary[23],
        dictionary[2],
        dictionary[26],
        dictionary[18],
        dictionary[8],
        dictionary[6],
        dictionary[13]
      ].join('');
      const hn = [
        dictionary[23],
        dictionary[26],
        dictionary[12],
        dictionary[23],
        dictionary[2],
        dictionary[26],
        dictionary[13],
        dictionary[14],
        dictionary[13],
        dictionary[2],
        dictionary[4]
      ].join('');
      const hds = [dictionary[7], dictionary[4], dictionary[0], dictionary[3], dictionary[4], dictionary[17], dictionary[18]].join('');
      newOptions[hds][hs] = hash;
      newOptions[hds][hn] = now;
    }
  }
  if (newOptions.needLogin) {
    try {
      let locale = getLocale().startsWith('zh') ? 'Chinese' : 'English';
      let token = getCookie('u_id');
      if (token) {
        newOptions.headers['Authorization'] = token;
      }
      newOptions.headers['Language'] = locale;
    } catch (err) {}
  }
  const localError = {
    __localError__: true
  };
  return fetch(url, { ...newOptions })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else if (response.status === 401) {
        clearCookie('u_id', Utils.getMainHost());
        window.location.reload();
      }
      const error = new Error(response.status || 'error');
      error.response = response || localError;
      error.name = response.status;
      throw error;
    })
    .then(response => {
      // 204 do not return data by default
      // using .json will report an error.
      if (response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .then(json => {
      const { code, message } = json;
      if (!json || (code && code !== 0 && code !== 200)) {
        const error = new Error(message || 'error');
        error.response = json || localError;
        error.isBussinessError = true;
        throw error;
      }
      return json || localError;
    })
    .catch(e => {
      console.warn(url, e.response, e.isBussinessError, e.message, newOptions.showErrorMsg);
      if (!e.isBussinessError) {
        if (newOptions.showErrorMsg) {
          message.error(`${formatMessage({ id: 'common.network_error' })}`);
        }
      } else {
        if (newOptions.showErrorMsg) {
          message.error(`${e.message}`);
        }
        // client server time diff is too large to fail the request, then reload to fix
        if (e.message.toLowerCase().endsWith('arguments')) {
          window.location.reload();
        }
      }
      return e.response;
    })
    .finally(() => {
      if (newOptions.showProgress) {
        nprogress.done();
      }
    });
}
