import { fetch } from 'dva';
import { Toast } from 'antd-mobile';
import router from 'umi/router';
import { stringify } from 'query-string';
import nprogress from 'nprogress';
import md5 from 'js-md5';
// import { letters } from '@/utils';
import { getCookie } from '@/utils';
import { getLocale } from 'umi-plugin-locale';
import langMap from '@/utils/lang';
import { formatMessage } from 'umi-plugin-locale';
import { getCodeMap, getOtcCodeMap } from '@/services/error-code';
import { template, templateSettings } from 'lodash';
let _language = getLocale();
// 首次打开页面，getLocale()会返回ja、ko这种格式语言，这种也会默认成英文
let language = langMap[_language] ? _language : 'en-US';

const dictionary = 'abcdefghijklmnopqrstuvwxyz-0123456789_';
const interpolate = /{([\s\S]+?)}/g;
templateSettings.interpolate = interpolate;

// const headerKey = [letters[22], letters[33], letters[1], letters[0], letters[0], letters[0], letters[36]].join('');

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
  const newOptions = {
    showProgress: true,
    showErrorMsg: true,
    crossDomain: false,
    isOtc: false,
    credentials: 'include',
    customHeaders: true, // whether add language header and so on..
    needSignature: true, // whether add signature header
    ...option
  };

  if (newOptions.customHeaders) {
    newOptions.headers = {
      language: newOptions.isOtc ? _language : language,
      ...newOptions.headers
    };
  }

  if (newOptions.isUC) {
    newOptions.headers['Ucenter-Token'] = getCookie('u_id') || '';
    newOptions.headers['Ucenter-Via'] = 'H5';
  }

  const isValidPost = (newOptions.method === 'POST' || newOptions.method === 'PUT') && newOptions.body;

  if (isValidPost) {
    newOptions.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...newOptions.headers
    };
    const originBody = newOptions.body;
    const contentType = newOptions.headers['Content-Type'].toString().toLowerCase();
    if (contentType === 'application/json') {
      if (typeof newOptions.body !== 'string') {
        newOptions.body = JSON.stringify(newOptions.body);
      }
    } else if (!(newOptions.body instanceof FormData) && typeof newOptions.body !== 'string') {
      newOptions.body = stringify(newOptions.body);
    }

    if (newOptions.needSignature) {
      let now = Date.now();
      if (window.g_app && window.g_app._store) {
        const state = window.g_app._store.getState() || {};
        const diff = state.global ? state.global.serverClientTimeDiff : 0;
        now += diff;
      }

      let bodyString = '';
      if (originBody instanceof FormData) {
        const entries = Object.fromEntries(originBody);
        bodyString = stringify(entries);
      } else if (typeof originBody !== 'string') {
        bodyString = stringify(originBody);
      } else {
        let reverse;
        try {
          reverse = JSON.parse(originBody);
        } catch (e) {}
        if (typeof reverse === 'object') {
          bodyString = stringify(reverse);
        } else {
          bodyString = originBody;
        }
      }

      const tokenField = [dictionary[20], dictionary[37], dictionary[8], dictionary[3]].join('');
      const token = getCookie(tokenField);
      const firstMd5 = md5(token + now).substr(7);
      const hash = md5(now + bodyString + firstMd5);
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
  if (newOptions.showProgress) {
    nprogress.start();
  }
  const localError = {
    __localError__: true
  };
  return fetch(url, { credentials: 'include', ...newOptions })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.status || 'error');
      error.response = response || localError;
      error.name = response.status;
      throw error;
      // const errortext = codeMessage[response.status] || response.statusText;
      // const error = new Error(errortext);
      // error.name = response.status;
      // error.response = response;
      // throw error;
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
      const { code, msg, message } = json;
      if (!json || (code && code !== 0 && code !== 200)) {
        const error = new Error(msg || message || 'error');
        error.response = json || localError;
        error.code = code;
        error.isBussinessError = true;
        throw error;
      }
      return json || localError;
    })
    .catch(async e => {
      const { code, message, response } = e;
      let handledMsg = '';
      if (code === 500 && message === 'Maintenanceing' && window.location.pathname !== '/maintain') {
        router.push({
          pathname: '/maintain',
          query: {
            announcement: encodeURIComponent(response.url || '/'),
            redirect: window.location.href
          }
        });
      }
      if (!e.isBussinessError) {
        if (newOptions.showErrorMsg) {
          Toast.fail(`${formatMessage({ id: 'common.network_error' })}`);
        }
      } else {
        let errorMap;
        if (url.search('otc.') !== -1) {
          errorMap = await getOtcCodeMap();
        } else {
          errorMap = await getCodeMap();
        }
        const variables = response?._extend;
        const templ = errorMap && errorMap[code];
        handledMsg = message;

        if (templ) {
          if (variables) {
            const compiled = template(templ);
            handledMsg = compiled(variables);
          } else {
            if (!interpolate.test(templ)) {
              handledMsg = templ;
            }
          }
        }

        if (newOptions.showErrorMsg) {
          Toast.fail(handledMsg);
        }
        // client server time diff is too large to fail the request, then reload to fix
        if (message.toLowerCase().endsWith('arguments')) {
          window.location.reload();
        }
      }
      return {
        message,
        handledMsg,
        ...(response || localError)
      };
    })
    .finally(() => {
      if (newOptions.showProgress) {
        nprogress.done();
      }
    });
}
