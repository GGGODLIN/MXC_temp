import { getSubSite } from '@/utils';
import { getLocale } from 'umi-plugin-locale';
import langMap from '@/utils/lang';

let _codeMap;
const _language = getLocale();
const language = langMap[_language] ? _language : 'en-US';

export async function getCodeMap(forceRefresh = false) {
  if (_codeMap && !forceRefresh) {
    return _codeMap;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const mainSite = getSubSite('main');
  const jsonSource = `${mainSite}/code`;

  let main = fetch(`${jsonSource}/main/${language}.json`)
    .then(response => response.json())
    .catch(err => null);

  let margin = fetch(`${jsonSource}/margin/${language}.json`)
    .then(response => response.json())
    .catch(err => null);

  return Promise.all([main, margin]).then(result => {
    const invalid = result.every(res => !res);
    if (invalid) {
      return null;
    }

    _codeMap = result.reduce((res, curr) => Object.assign(res, curr), {});
    return _codeMap;
  });
}

let _otcCodeMap;
export async function getOtcCodeMap(forceRefresh = false) {
  if (_otcCodeMap && !forceRefresh) {
    return _otcCodeMap;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const mainSite = getSubSite('main');
  const jsonSource = `${mainSite}/code`;

  return fetch(`${jsonSource}/otc/${language}.json`)
    .then(response => response.json())
    .then(json => {
      if (!json) {
        return null;
      }
      _otcCodeMap = json;
      return _otcCodeMap;
    })
    .catch(err => null);
}
