import 'intl';
import 'intl/locale-data/jsonp/zh';
import { parse } from 'query-string';
import { setLocale, getLocale } from 'umi-plugin-locale';
import { Toast, Modal } from 'antd-mobile';
import langMap from '@/utils/lang';
import { browserPlatform } from '@/utils';
// import { getSites } from '@/utils/sites';
// getSites();

Toast.config({
  duration: 3,
  mask: false
});

const locale = getLocale();
const querys = parse(window.location.search);
const shortMatchLang = locale && Object.keys(langMap).filter(key => langMap[key]?.short?.toUpperCase() === locale?.toUpperCase());

const hideRoutes = [];
const shouldHide = hideRoutes.find(r => window.location.pathname.startsWith(r));

if (querys.lang) {
  if (querys.lang === 'zh-CN' && shouldHide) {
    // 特殊处理ksm插槽活动，简体中文跳转到繁体中文去
    // if (window.location.pathname.startsWith('/activity/ksm-slot') || window.location.pathname.startsWith('/launchpad')) {
    //   setLocale('zh-TW', false);
    // } else {
    //   setLocale('en-US', false);
    // }
  } else {
    // 受限于antd/lib/locale-provider的蛋疼设定，语言文件必须用ab-CD.js的格式，在此需特殊处理语言
    if (langMap[querys.lang] && querys.lang !== locale) {
      setLocale(querys.lang, false);
    } else if (!langMap[querys.lang]) {
      setLocale('en-US', false);
    }
  }
} else if (!locale || (locale && !langMap[locale] && /[A-Z]/.test(locale))) {
  setLocale('en-US', false);
} else if (shortMatchLang && shortMatchLang.length) {
  // 部分浏览器返回的默认语言是tr、vi、ko这种，需要再匹配下简写
  const _locale = shortMatchLang[0];
  setLocale(_locale || 'en-US', false);
} else if (locale && browserPlatform().isIOS && !/[A-Z]/.test(locale)) {
  const _locales = locale.split('-');
  const _locale = _locales.length === 2 ? `${_locales[0]}-${_locales[1].toUpperCase()}` : 'en-US';
  setLocale(_locale, false);
}

if (/Android [4-9]/.test(navigator.appVersion)) {
  window.addEventListener('resize', function() {
    if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
      window.setTimeout(function() {
        if ('scrollIntoView' in document.activeElement) {
          document.activeElement.scrollIntoView();
        } else {
          document.activeElement.scrollIntoViewIfNeeded();
        }
      }, 0);
    }
  });
}

const SHOULD_UNREGISTER_SW = true;
if (!SHOULD_UNREGISTER_SW) {
  // Pop up a prompt on the page asking the user if they want to use the latest version
  window.addEventListener('sw.updated', e => {
    // Check if there is sw whose state is waiting in ServiceWorkerRegistration
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
    const worker = e.detail && e.detail.waiting;
    if (!worker) {
      return;
    }

    // Send skip-waiting event to waiting SW with MessageChannel
    const channel = new MessageChannel();

    channel.port1.onmessage = msgEvent => {
      console.warn('msgEvent.data: ', msgEvent.data);
      // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
      // window.location.reload(true);
    };

    worker.postMessage(
      {
        type: 'skip-waiting'
      },
      [channel.port2]
    );
  });
} else if ('serviceWorker' in navigator) {
  /* eslint-disable */
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// const enablePwa = true;
// if (enablePwa) {
//   // Notify user if offline now
//   window.addEventListener('sw.offline', () => {
//     Toast.offline('当前处于离线状态');
//   });

//   // Pop up a prompt on the page asking the user if they want to use the latest version
//   window.addEventListener('sw.updated', e => {
//     const reloadSW = async () => {
//       // Check if there is sw whose state is waiting in ServiceWorkerRegistration
//       // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
//       const worker = e.detail && e.detail.waiting;

//       if (!worker) {
//         return true;
//       }

//       // Send skip-waiting event to waiting SW with MessageChannel
//       await new Promise((resolve, reject) => {
//         const channel = new MessageChannel();

//         channel.port1.onmessage = msgEvent => {
//           if (msgEvent.data.error) {
//             reject(msgEvent.data.error);
//           } else {
//             resolve(msgEvent.data);
//           }
//         };

//         worker.postMessage(
//           {
//             type: 'skip-waiting'
//           },
//           [channel.port2]
//         );
//       });

//       // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
//       window.location.reload(true);
//       return true;
//     };

//     reloadSW();

//     // Modal.alert('有新内容', '请点击“刷新”按钮或者手动刷新页面', [
//     //   {
//     //     text: '刷新',
//     //     onPress: () => {
//     //       reloadSW();
//     //     }
//     //   }
//     // ]);
//   });
// } else if ('serviceWorker' in navigator) {
//   /* eslint-disable */
//   navigator.serviceWorker.getRegistrations().then(registrations => {
//     for (let registration of registrations) {
//       registration
//         .unregister()
//         .then(() => self.clients.matchAll())
//         .then(clients => {
//           clients.forEach(client => {
//             if (client.url && 'navigate' in client) {
//               client.navigate(client.url);
//             }
//           });
//         });
//     }
//   });
//   // navigator.serviceWorker.ready
//   //   .then(registration => {
//   //     registration.unregister();
//   //     return true;
//   //   })
//   //   .catch(() => {
//   //     console.log('serviceWorker unregister error');
//   //   });
// }
