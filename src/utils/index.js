import moment from 'moment';
import router from 'umi/router';
import { Base64 } from 'js-base64';

export const letters = '0123456789abcdefghijklmnopqrstuvwxyz$';
let globalKey = 0;

export const genKey = () => {
  return ++globalKey;
};

export const getCookie = c_name => {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(c_name + '=');
    let c_end;
    if (c_start !== -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(';', c_start);
      if (c_end === -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
};

export const setCookie = (name, value, days) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  const root =
    '.' +
    window.location.hostname
      .split('.')
      .slice(-2)
      .join('.');
  document.cookie = `${name}=${value || ''};domain=${root}${expires};path=/`;
};

// 清除cookie
export const clearCookie = (name, domain) => {
  let date = new Date();
  date.setTime(date.getTime() - 10000);
  let cookieValue = getCookie(name);
  let stDomain = '';
  if (domain) {
    stDomain = ';domain=' + domain;
  }
  if (cookieValue !== null) {
    document.cookie = name + '=' + ' ' + ';expires=' + date.toGMTString() + ';path=/' + stDomain;
  } else {
    alert(name + '的值为空！');
  }
};

export const fiatPrice = (price, decimal = 2, fiat = 'CNY') => {
  if (isNaN(Number(price))) {
    return '--';
  }
  const symbolMap = {
    CNY: '¥',
    USD: '$'
  };
  const prefix = symbolMap[fiat];
  const str = numberToString(price);
  if (/^\d+\.0*\d+$/i.test(str)) {
    const newStr = str.replace(/^(\d+\.0*)(\d+)$/i, (match, $1, $2) => $1 + $2.slice(0, decimal));
    return `${prefix}${newStr}`;
  }
  return `${prefix}${str}`;
};

export function processPriceInput(e) {
  const isFF = window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0;
  const keyReg = /^[\\.\d\w]$/;
  if (!keyReg.test(e.key)) {
    if (!isFF) {
      e.preventDefault();
    }
    return;
  }
  let toBe = '';
  if (typeof e.target.selectionStart === 'number') {
    toBe = `${e.target.value.slice(0, e.target.selectionStart)}${e.key}${e.target.value.slice(e.target.selectionEnd)}`;
  } else {
    toBe = `${e.target.value}${e.key}`;
  }
  return toBe;
}

export const shortNumberString = (value, dec = 3) => {
  let v = Number(value) || 0;
  let s;
  if (v > 1000000) {
    s = (v / 1000000).toFixed(dec);
    return `${s}M`;
  } else if (v > 1000) {
    s = (v / 1000).toFixed(dec);
    return `${s}K`;
  } else {
    return v.toFixed(dec);
  }
};

export const cutFloatDecimal = (_value, dec) => {
  const value = _value || 0;
  const regStr = `^([0-9]+\.[0-9]{${dec}})[0-9]*$`;
  if (value.toString().indexOf('e-') >= 0) {
    const str = numberToString(value).replace(new RegExp(regStr), '$1');
    const parts = str.split('.');
    let float = parts[1];
    if (float.length < dec) {
      float += new Array(dec - float.length).fill(0).join('');
      return parts[0] + '.' + float;
    }
    return str;
  } else {
    const str = value.toString().replace(new RegExp(regStr), '$1');
    return Number(str).toFixed(dec);
  }
};

export const toFixedPro = (value, dec) => {
  if (dec >= 0) {
    return +value.toFixed(dec);
  } else {
    const pow = Math.pow(10, -1 * dec);
    return Math.floor(value / pow) * pow;
  }
};

export const numberToString = _num => {
  let num = Number(_num);
  let numStr = String(_num);
  if (Math.abs(num) < 1) {
    let e = parseInt(num.toString().split('e-')[1]);
    if (e) {
      let negative = num < 0;
      if (negative) num *= -1;
      num *= Math.pow(10, e - 1);
      let temp = Number(num.toFixed(e));
      numStr = '0.' + new Array(e).join('0') + temp.toString().substring(2);
      if (negative) numStr = '-' + numStr;
    }
  } else {
    let e = parseInt(num.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      num /= Math.pow(10, e);
      numStr = num.toString() + new Array(e + 1).join('0');
    }
  }
  return numStr;
};

export function toFullScreen(id) {
  const dom = document.getElementById(id || 'root');
  if (dom.requestFullscreen) {
    return dom.requestFullscreen();
  } else if (dom.webkitRequestFullScreen) {
    return dom.webkitRequestFullScreen();
  } else if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  } else {
    return dom.msRequestFullscreen();
  }
}

export const timeToString = (ts, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(ts).format(format);
};

export function gotoLogin() {
  const { pathname, search } = window.location;
  const redirect = pathname + (search || '');
  router.push({
    pathname: '/auth/signin',
    query: {
      redirect: encodeURIComponent(redirect),
      mode: 'goBack'
    }
  });
}

export const gotoPreviousPage = ({ location, initialHistoryLength }) => {
  let redirect = decodeURIComponent(location.query.redirect || '');
  const root = window.location.hostname
    .split('.')
    .slice(-2)
    .join('.');
  if (!redirect.startsWith('/')) {
    const url = new URL(redirect);
    const targetHostname = url.hostname || '';
    const targetRoot = targetHostname
      .split('.')
      .slice(-2)
      .join('.');
    console.log(targetHostname, targetRoot, root);
    const validOutLink = root === targetRoot;
    if (redirect && redirect.startsWith('/')) {
      router.replace(redirect);
    } else if (validOutLink) {
      window.location.href = redirect;
    } else if (window.history.length - initialHistoryLength > 0) {
      router.goBack();
    } else {
      router.replace('/');
    }
  } else {
    router.push(redirect);
  }
};

export function gotoCrossPlatformUrl(appUrl, browserUrl) {
  const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';
  if (fromApp) {
    window.location.href = 'mxcappscheme://' + appUrl;
  } else {
    router.push(browserUrl);
  }
}

export function getClientHeight() {
  const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';

  return document.documentElement.clientHeight - (!fromApp ? 44 : 0);
}

export function gotoAppPlatformUrl(appUrl, title) {
  const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';
  const { pathname, search } = window.location;
  const redirect = pathname + (search || '');
  if (fromApp) {
    window.location.href = 'mxcappscheme://login?previous=' + appUrl + '&title=' + title;
  } else {
    router.push({
      pathname: '/auth/signin',
      query: {
        redirect: encodeURIComponent(redirect),
        mode: 'goBack'
      }
    });
  }
}

export function redirectToLogin(title = '') {
  const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';
  const { pathname, search, origin } = window.location;
  if (fromApp) {
    const _query = delQueStr(search, 'apptoken');
    const url = Base64.encode(origin + pathname + _query);
    window.location.href = `mxcappscheme://login?previous=${url}&title=${title}`;
  } else {
    router.push({
      pathname: '/auth/signin',
      query: {
        redirect: pathname + search,
        mode: 'goBack'
      }
    });
  }
}

export function browserPlatform() {
  const u = window.navigator.userAgent.toLowerCase();
  return {
    isMobile: /(iPhone|iPad|iPod|iOS|Android)/i.test(u),
    isIOS: /(iPhone|iPad|iPod|iOS)/i.test(u),
    isAndriod: /(Android)/i.test(u),
    isWechat: /(micromessenger)/i.test(u)
  };
}

export function getSubSite(subSite) {
  if (subSite === 'main') {
    if (NODE_ENV === 'production') {
      return window.location.origin.replace('m.', 'www.');
    }
    return MXC_ORIGIN;
  }
  if (subSite === 'otc') {
    if (NODE_ENV === 'production') {
      return window.location.origin.replace('m.', 'otc.');
    }
    return OTC_ORIGIN;
  }
  if (subSite === 'contract') {
    if (NODE_ENV === 'production') {
      return window.location.origin.replace('m.', MXC_DEPLOY === 'prod' ? 'contract.' : 'swap5.');
    }
    return CONTRACT_ORIGIN;
  }
  if (subSite === 'chat') {
    if (NODE_ENV === 'production') {
      return window.location.origin.replace('m.', 'chat.');
    }
    return CHAT_ORIGIN;
  }
  if (subSite === 'chatv4') {
    if (NODE_ENV === 'production') {
      return window.location.origin.replace('m.', 'chatv4.');
    }
    return CHAT_ORIGIN;
  }
  if (subSite === 'wbs') {
    if (NODE_ENV === 'production') {
      return 'wss://' + window.location.hostname.replace('m.', 'wbs.');
    }
    return SOCKETIO_ORIGIN;
  }
  return '';
}

export const replaceProductionUrl = url => {
  if (MXC_DEPLOY !== 'prod') {
    return url;
  }
  return url.replace('www.mxc.com', window.location.hostname);
};

export const pageSizeSetting = {
  topMessageHeight: 40,
  headerHeight: 60,
  tradeproHeaderHeight: 50,
  footerHeight: 220
};

export const calcRate = (newPrice, price, oldRate = 0) => {
  const base = price / (1 + oldRate);
  if (oldRate === 0) {
    return 0;
  }
  return newPrice / base - 1;
};

export const marketOrder = ['USDT', 'ETH', 'BTC'];

export const findRealPair = (pair, markets) => {
  let realPair;
  if (markets.length > 0) {
    for (let i = 0; i < markets.length; i++) {
      for (let j = 0; j < markets[i].list.length; j++) {
        let item = markets[i].list[j];
        if (item.currency === pair[0].toUpperCase() && item.market === pair[1].toUpperCase()) {
          realPair = item;
          break;
        }
      }
    }
  }
  return realPair;
};

export const conmpareName = (a, b) => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
};

export function setFormData(object) {
  const formdata = new FormData();
  if (object && typeof object === 'object') {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        formdata.append(key, element);
      }
    }
  }
  return formdata;
}

export function numberFormat(_num) {
  const num = Number(_num);
  const number = num.toString().indexOf('.') !== -1 ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  return number;
}

export const downloadUrl = {
  ios: 'https://mxc-download.approbatory.xyz:58888/downiosapp',
  android: {
    cn: 'https://mxcapp.oss-cn-shenzhen.aliyuncs.com/mxc.apk',
    en: 'https://mxcinternational.oss-ap-southeast-1.aliyuncs.com/mxc.apk'
  }
};

export function assetValuation(cnyPrices, amount, currency = 'BTC', market = 'USDT') {
  if (cnyPrices) {
    const btc = Number(cnyPrices['BTC']);
    const usdt = Number(cnyPrices['USDT']);
    const eth = Number(cnyPrices['ETH']);
    const cny = amount * usdt;

    if (currency === 'BTC') {
      return cutFloatDecimal(cny / btc, 8);
    } else if (currency === 'CNY') {
      return cutFloatDecimal(amount * Number(cnyPrices[market]), 2);
    }
  } else {
    return 0;
  }
}

export function add(arg1, arg2) {
  let r1, r2, m;
  try {
    r1 = numberToString(arg1)
      .toString()
      .split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = numberToString(arg2)
      .toString()
      .split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (Math.round(arg1 * m) + Math.round(arg2 * m)) / m;
}

export function sub(arg1, arg2) {
  let r1, r2, m, n;
  try {
    r1 = numberToString(arg1)
      .toString()
      .split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = numberToString(arg2)
      .toString()
      .split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  n = r1 >= r2 ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

export function multiply(arg1, arg2) {
  var m = 0,
    s1 = numberToString(arg1).toString(),
    s2 = numberToString(arg2).toString();
  try {
    m += s1.split('.')[1].length;
  } catch (e) {}
  try {
    m += s2.split('.')[1].length;
  } catch (e) {}
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}

export function divide(arg1, arg2) {
  let t1 = 0,
    t2 = 0,
    r1,
    r2,
    _arg1 = numberToString(arg1),
    _arg2 = numberToString(arg2);
  try {
    t1 = _arg1.toString().split('.')[1].length;
  } catch (e) {}
  try {
    t2 = _arg2.toString().split('.')[1].length;
  } catch (e) {}
  r1 = Number(_arg1.toString().replace('.', ''));
  r2 = Number(_arg2.toString().replace('.', ''));
  return (r1 / r2) * Math.pow(10, t2 - t1);
}
export function numbervalAccuracy(value, n) {
  // var f = Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
  var f = (value * Math.pow(10, n)) / Math.pow(10, n);

  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    s += '.';
  }
  for (var i = s.length - s.indexOf('.'); i <= n; i++) {
    s += '0';
  }
  return s;
}

// 只能输入数字，并且指定小数点后几位

export function numberAccuracy(obj, scale) {
  // let obj=val.target.value
  if (typeof scale == undefined) {
    scale = '1,';
  }
  obj.target.value = obj.target.value.replace(/[^\d.]/g, ''); //清除"数字"和"."以外的字符
  obj.target.value = obj.target.value.replace(/^\./g, ''); //验证第一个字符是数字而不是其他字符
  obj.target.value = obj.target.value.replace(/\.{2,}/g, '.'); //只保留第一个. 不能输入连续的.
  obj.target.value = obj.target.value
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.'); //清除后面的.
  let re = new RegExp('^(\\-)*(\\d+)\\.(\\d{' + scale + '}).*$');
  obj.target.value = obj.target.value.replace(re, '$1$2.$3'); //只能输入scale个小数
}

export function delQueStr(url, ref) {
  //删除url参数值
  let str = '';
  if (url.indexOf('?') != -1) str = url.substr(url.indexOf('?') + 1);
  else return url;
  let arr = '';
  let returnurl = '';
  let setparam = '';
  if (str.indexOf('&') != -1) {
    arr = str.split('&');
    for (let i in arr) {
      if (arr[i].split('=')[0] != ref) {
        returnurl = returnurl + arr[i].split('=')[0] + '=' + arr[i].split('=')[1] + '&';
      }
    }
    return url.substr(0, url.indexOf('?')) + '?' + returnurl.substr(0, returnurl.length - 1);
  } else {
    arr = str.split('=');
    if (arr[0] == ref) return url.substr(0, url.indexOf('?'));
    else return url;
  }
}

export const getPercent = (value, plus = true) => {
  const _value = Number(value) || 0;
  return `${plus ? (_value > 0 ? '+' : '') : ''}${(_value * 100).toFixed(2)}%`;
};

export const plusPrefix = value => {
  const _value = Number(value) || 0;
  return `${_value > 0 ? '+' : ''}${_value}`;
};
