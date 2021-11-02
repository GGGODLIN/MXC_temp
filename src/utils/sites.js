import { getSubSite } from '@/utils';

// const jsonApiMaps = {
//   test: 'https://testmxc.oss-cn-chengdu.aliyuncs.com/business/test.json',
//   preRelease: 'https://pre-bucket-wow.oss-ap-southeast-1.aliyuncs.com/business/pre.json',
//   prod: 'https://mexccommonconfig.oss-accelerate.aliyuncs.com/web/mxcweb.json'
// };

// const currentApiPath = jsonApiMaps[MXC_DEPLOY];

// export async function getSites() {
//   if (window.SITESDATA) return window.SITESDATA;
//   return fetch(currentApiPath)
//     .then(res => res.json())
//     .then(res => {
//       window.SITESDATA = res;
//       return res;
//     });
// }

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

export async function getUcenterPath() {
  // const sites = await getSites();
  let uc_api = `${MAIN_SITE_API_PATH.replace('/api', '')}/ucenter/api`;
  // if (sites && sites.ucenter_sites && sites.ucenter_sites[0]) {
  //   uc_api = sites.ucenter_sites[0];
  // }
  return uc_api;
}
