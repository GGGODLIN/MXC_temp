import { getGeetestToken } from '@/services/api';
import { Toast } from 'antd-mobile';
import { browserPlatform } from '@/utils';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import langMap from '@/utils/lang';

const UA = browserPlatform();
let lang = getLocale();
lang = lang.startsWith('zh') ? lang.toLowerCase() : langMap[lang].short;

const availableScenarioes = [
  'LOGIN',
  'REGISTER_PHONE',
  'REGISTER_EMAIL',
  'FORGET_PASSWORD',
  'CHANGE_PASSWORD',
  'BIND_PHONE',
  'BIND_GOOGLE_AUTH',
  'WITHDRAW',
  'LABS',
  'API',
  'TEST'
];

const scenarioes = {};

const registerSingleScenario = us => {
  getGeetestToken().then(res => {
    const data = res.data;
    if (!data || !data.gt || !window.initGeetest) {
      return Toast.fail(formatMessage({ id: 'layout.captcha.msg.asset_error' }));
    }
    window.initGeetest(
      {
        gt: data.gt,
        challenge: data.challenge,
        offline: !data.success, // 表示用户后台检测极验服务器是否宕机
        new_captcha: true, // 用于宕机时表示是新验证码的宕机
        product: 'bind',
        width: '90%',
        https: true,
        lang
      },
      captchaObj => {
        const instance = {
          scenario: us,
          captchaObj,
          bindSuccess: false,
          geetest_offline: data.success
        };
        scenarioes[us] = instance;
      }
    );
  });
};

const refreshScenaio = scenario => {
  if (scenarioes[scenario]) {
    scenarioes[scenario].captchaObj.destroy();
    scenarioes[scenario] = null;
    registerSingleScenario(scenario);
  }
};

export const registerGeetestScenario = _scenarioes => {
  _scenarioes.forEach(s => {
    const us = s.toUpperCase();
    if (availableScenarioes.includes(us) && !scenarioes[us]) {
      registerSingleScenario(us);
    }
  });
};

export const geetestCaptcha = (scenario, fn) => {
  const s = scenarioes[scenario];
  if (!s) {
    // return Toast.fail(formatMessage({ id: 'layout.captcha.msg.unreigster_error' }));
    refreshScenaio(scenario);
    // the hacky way of fix the bug
    setTimeout(() => {
      geetestCaptcha(scenario, fn);
    }, 1000);
  } else {
    const { captchaObj } = s;
    captchaObj
      .onSuccess(() => {
        const result = captchaObj.getValidate();
        if (!result) {
          refreshScenaio(scenario);
          return console.error(formatMessage({ id: 'layout.captcha.msg.behavior_error' }));
        }
        if (typeof fn === 'function') {
          fn({
            geetest_offline: s.geetest_offline,
            ...result
          });
        }
        refreshScenaio(scenario);
      })
      .onClose(e => {
        refreshScenaio(scenario);
      })
      .onError(e => {
        Toast.fail(`Geetest error: ${e.error_code} | ${e.msg}`);
        refreshScenaio(scenario);
      });
    captchaObj.verify();
  }
};
