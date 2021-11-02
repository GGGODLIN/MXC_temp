import { stringify } from 'query-string';
import request from '@/utils/request';
import huanxin from '@/utils/huanxin';
import { getLocale } from 'umi-plugin-locale';
import { getSubSite, getCookie } from '@/utils';
import { getUcenterPath } from '@/utils/sites';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;
const APP_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}` : `${getSubSite('main')}`;
const OTC_API_PATH = NODE_ENV === 'production' ? `${getSubSite('otc')}/api` : OTC_API;

export async function userLogin(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/login`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function loginByUcenter(params) {
  return request(`${MAIN_SITE_API_PATH}/login/login_by_ucenter`, {
    method: 'POST',
    body: params
  });
}

export async function userRegister(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/register`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function resetPassword(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/password/reset`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    },
    isUC: true
  });
}

export async function resetPasswordCheck(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/password/reset_check_account`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function resetPasswordAuth(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/password/reset_check_code`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function resetPasswordBySupport(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/password/reset_by_support`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    },
    isUC: true
  });
}

export async function secondAuth(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/login/second_auth`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function userLogout() {
  return request(`${MAIN_SITE_API_PATH}/user/logout`);
}

export async function userCenterLogout() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/logout`, {
    method: 'POST',
    showProgress: false,
    isUC: true
  });
}

export async function getCurrencyInfo(currency) {
  return request(`${MAIN_SITE_API_PATH}/market/introduce/${currency}`, {
    showErrorMsg: false
  });
}

export async function getMainBanners(params) {
  return request(`${MAIN_SITE_API_PATH}/index/banner?${stringify(params)}`);
}

export async function queryCurrentUser() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/login/validation`, {
    method: 'POST',
    showProgress: false,
    showErrorMsg: false,
    isUC: true
  });
}

export async function getAssetBalance({ currency, ...rest }) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/balances?currency=${currency}`, { ...rest });
}

export async function makeLimitOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order`, {
    method: 'POST',
    body: params,
    needFingerprint: true
  });
}

export async function cancelLimitOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/cancel?${stringify(params)}`, {
    method: 'DELETE'
  });
}

export async function cancelAllLimitOrders(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/cancelAll?${stringify(params)}`, {
    method: 'DELETE'
  });
}

export async function makeTriggerOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/trigger/place`, {
    method: 'POST',
    body: params,
    needFingerprint: true
  });
}

export async function getUserFavorites(uid) {
  if (uid) {
    return request(`${MAIN_SITE_API_PATH}/member/preference/collect`, {
      showProgress: false
    });
  } else {
    let localList = JSON.parse(window.localStorage.getItem('mxc.user.local_favorites')) || [];
    return new Promise(resolve => resolve(localList));
  }
}

export async function addFavorite(params, uid) {
  if (uid) {
    return request(`${MAIN_SITE_API_PATH}/member/preference/collect`, {
      method: 'POST',
      body: params
    });
  } else {
    let localList = JSON.parse(window.localStorage.getItem('mxc.user.local_favorites')) || [];
    const idx = localList.findIndex(i => i === params.symbol);
    if (idx < 0) {
      localList.push(params.symbol);
      window.localStorage.setItem('mxc.user.local_favorites', JSON.stringify(localList));
    }
    return new Promise(resolve => resolve());
  }
}

export async function deleteFavorite(params, uid) {
  if (uid) {
    return request(`${MAIN_SITE_API_PATH}/member/preference/collect?${stringify(params)}`, {
      method: 'DELETE'
    });
  } else {
    let localList = JSON.parse(window.localStorage.getItem('mxc.user.local_favorites')) || [];
    const idx = localList.findIndex(i => i === params.symbol);
    if (idx >= 0) {
      localList.splice(idx, 1);
      window.localStorage.setItem('mxc.user.local_favorites', JSON.stringify(localList));
    }
    return new Promise(resolve => resolve());
  }
}

export async function getUserOrders(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/list?${stringify(params)}`);
}

export async function getAssetsOverview() {
  return request(`${MAIN_SITE_API_PATH}/member/asset/overview`, {
    showErrorMsg: false
  });
}

export async function getTradeRecords(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/deals?${stringify(params)}`);
}

export async function getDepositAddress(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/build_recharge_address`, {
    method: 'POST',
    body: params,
    showErrorMsg: false
  });
}

export async function getDepositRecords(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/deposit?${stringify(params)}`);
}

export async function getWithdrawAddresses(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/markList?${stringify(params)}`);
}

export async function getWithdrawAddressesWithPagiantion(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/page_mark?${stringify(params)}`);
}

export async function getWithdrawRecords(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/withdraw_history?${stringify(params)}`);
}

export async function cancelWithdraw(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/withdraw/cancel`, {
    method: 'POST',
    body: params
  });
}

// 发送短信接口会自动获取已登录用户的绑定手机号，这个接口可以发送登录状态下非绑定手机号的短信验证码
export async function sendSMSCodeNotLogin(params) {
  return request(`${MAIN_SITE_API_PATH}/code/send_sms_code`, {
    method: 'POST',
    body: params,
    credentials: 'omit'
  });
}

export async function getMXStatistics(params) {
  return request(`${MAIN_SITE_API_PATH}/statistics/mx?${stringify(params)}`);
}

export async function addWithdrawAddress(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/add_mark`, {
    method: 'POST',
    body: params
  });
}

export async function doWithdraw(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/do_withdraw`, {
    method: 'POST',
    body: params
  });
}

export async function deleteWithdrawAddress(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/remove_mark?${stringify(params)}`);
}

export async function getGeetestToken() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/code/geetest_token`, {
    method: 'GET',
    isUC: true,
    showProgress: false
  });
}

export async function getAnnouncements({ lang, ...rest }) {
  return request(`${MAIN_SITE_API_PATH}/notice?lang=${lang}`, rest);
}

export async function checkWithdrawAmount(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/check_withdraw_amount`, {
    method: 'POST',
    body: params
  });
}

export async function getLabsList(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/list?${stringify(params)}`);
}

export async function getLabsDetail(pid) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/detail?pid=${pid}`);
}

export async function getLabsRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/member_bought_log?${stringify(params)}`);
}

export async function getLabsLotNumber(pid) {
  const params = { pid: pid };
  return request(`${MAIN_SITE_API_PATH}/launchpad/do_draw`, {
    method: 'POST',
    body: params
  });
}

export async function applyLabs(pid) {
  const params = { pid: pid };
  return request(`${MAIN_SITE_API_PATH}/launchpad/do_apply`, {
    method: 'POST',
    body: params
  });
}

export async function buyLabs(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/do_buy`, {
    method: 'POST',
    body: params
  });
}

export async function bindingLabs(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/do_bidding`, {
    method: 'POST',
    body: params
  });
}

export async function getCountryList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/country${params ? `?${stringify(params)}` : ''}`, {
    showProgress: false
  });
}

export async function getKlineHistory(params) {
  return request(`${MAIN_SITE_API_PATH}/market/kline?${stringify(params)}`, { showProgress: false });
}

export async function getTriggerOrderList(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/trigger/list?${stringify(params)}`, { showProgress: false });
}

export async function cancelTriggerOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/member/order/trigger/cancel`, {
    method: 'POST',
    body: params
  });
}

export async function getServerTime() {
  return request(`${MAIN_SITE_API_PATH}/common/ping`, {
    showProgress: false,
    showErrorMsg: false,
    credentials: 'same-origin'
  });
}

export async function registerHuanxinUser(params) {
  return request(huanxin.userApi, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    },
    showProgress: false,
    showErrorMsg: false,
    crossDomain: true
  });
}

export async function getServerFee() {
  return request(`${MAIN_SITE_API_PATH}/servicefee/zh_cn`);
}
// 阳光普照活动
export async function sunshineList(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/sun_shines`, {
    method: 'GET',
    showProgress: false
  });
}

export async function sunshineDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/sun_shines/detail/${params}`, {
    method: 'GET',
    showProgress: false
  });
}

export async function sunshineRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/sun_shines/history${params ? `?${stringify(params)}` : ''}`, {
    showProgress: false
  });
}

export async function sunshineVote(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/apply_lock`, {
    method: 'POST',
    showProgress: false,
    body: params
  });
}

export async function getVoteList(params) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/phases${params ? `?${stringify(params)}` : ''}`, {
    showProgress: false
  });
}

export async function getCoinRemainVotes(pid) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/remain_votes?phaseProjectId=${pid}`);
}

export async function doCoinVote(params) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/do_vote`, {
    method: 'POST',
    body: params,
    showProgress: false
  });
}

export async function getVoteRecordList(params) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/my_vote${params ? `?${stringify(params)}` : ''}`);
}

export async function getVoteDetail(pid) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/coin_detail?phaseProjectId=${pid}`);
}

export async function unlockVote(params) {
  return request(`${MAIN_SITE_API_PATH}/vote/coin/return_by_user?${stringify(params)}`, {
    method: 'GET',
    showProgress: false
    // body: params,
  });
}

/*
 *理财超市
 */
export async function getAllFinancingProducts() {
  return request(`${MAIN_SITE_API_PATH}/fund/p_list`);
}

export async function getAllFinancingHistoricalList(params) {
  return request(`${MAIN_SITE_API_PATH}/fund/lock_product?${stringify(params)}`);
}

export async function getAllFinancingProductDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/fund/p_detail?${stringify(params)}`);
}

//理财锁仓记录
export async function getUserFinancingHistoricalList(params) {
  return request(`${MAIN_SITE_API_PATH}/fund/member_lock_log?${stringify(params)}`);
}

// 战队列表
export async function getTeamListInfo() {
  return request(`${MAIN_SITE_API_PATH}/member/commission/teamCompetition`);
}

// 返佣
export async function getInviteRebateInfo() {
  return request(`${MAIN_SITE_API_PATH}/member/commission/info`);
}

// 返佣列表
export async function getInviteRebateMembers(params) {
  return request(`${MAIN_SITE_API_PATH}/member/commission/invites?${stringify(params)}`);
}

// 返佣记录
export async function getInviteRebateDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/commission/list?${stringify(params)}`);
}

// 返佣榜单前三名
export async function getRebateTopn(params) {
  return request(`${MAIN_SITE_API_PATH}/member/commission/topn?${stringify(params)}`);
}

export async function assetTransfer(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/transfer`, {
    method: 'POST',
    body: params
  });
}

export async function getAssetSysBalance(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/sys_balances?${stringify(params)}`);
}

export async function transferHistory(params = { page: 1, page_size: 10, sys: 'SWAP' }) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/transfer_history?${stringify(params)}`);
}

export async function getUcenterIndexInfo() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/user_info`, {
    showProgress: false,
    showErrorMsg: false,
    isUC: true
  });
}

export async function mobileBind(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/mobile/bind`, {
    method: 'POST',
    body: params,
    isUC: true,
    showProgress: false
  });
}

export async function mobileModify(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/mobile/modify`, {
    method: 'POST',
    body: params,
    isUC: true,
    showProgress: false
  });
}

export async function getGoogleAuthInfo() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/google_auth/info`, {
    method: 'POST',
    showProgress: false,
    showErrorMsg: false,
    isUC: true
  });
}

export async function googleAuthBindToggle(type = 'bind', params = {}) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/google_auth/${type}`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isUC: true
  });
}

export async function getGoogleAuthCheck() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/google_auth/check`, {
    isUC: true
  });
}

export async function saveIdentityAuth(params = {}) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/kyc_junior/commit/b`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isUC: true
  });
}

export async function saveIdentityAuthChina(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/kyc_junior/commit/a`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isCORS: true
  });
}

export async function getSecureCheckList() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/secure/check`, {
    showProgress: false,
    isUC: true
  });
}

export async function getApiKeyList() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/api_key/get_list`, {
    showProgress: false,
    isUC: true
  });
}

export async function apiKeyHandle(params, type = 'add') {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/api_key/${type}`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isUC: true
  });
}

export async function getApiKeyPermission() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/api_key/permissions`, {
    showProgress: false,
    isUC: true
  });
}

export async function changePassword(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/password/change`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isUC: true
  });
}

//理财超市锁仓
export async function getdoLock(params) {
  return request(`${MAIN_SITE_API_PATH}/fund/do_lock`, {
    method: 'POST',
    body: params
  });
}

export async function regValid(params = {}) {
  return request(`${MAIN_SITE_API_PATH}/rgvalid`, {
    method: 'POST',
    body: params
  });
}

export async function sendValidMail(params = {}) {
  return request(`${MAIN_SITE_API_PATH}/sendMail`, {
    method: 'POST',
    body: {
      language: getLocale() === 'zh-CN' ? 'CN' : 'EN',
      ...params
    }
  });
}

export async function getWebsitePing(url) {
  return request(`${url}/api/common/ping`, { showProgress: false });
}

export async function getAvailableSymbols() {
  return request(`${MAIN_SITE_API_PATH}/apiKey/availableSymbols`, {
    showProgress: false
  });
}

export async function getActivityFee() {
  return request(`${MAIN_SITE_API_PATH}/activity/tradefee`, {
    showProgress: false
  });
}

export async function bindAntiPhishing(code) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/phishing_code/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      phishingCode: code
    },
    showProgress: false,
    isUC: true
  });
}

export async function getAntiPhishing() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/phishing_code/get`, {
    showProgress: false,
    isUC: true
  });
}

export async function frozenAccount(params) {
  return request(`${MAIN_SITE_API_PATH}/member/ucenter/selfFrozen`, {
    method: 'POST',
    body: params
  });
}

export async function getDividendData() {
  return request(`${MAIN_SITE_API_PATH}/member/commission/position`, {});
}

export async function getLanchQuestion(lang) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/question?lang=${lang}`, {
    showProgress: false
  });
}

export async function getPhishingCode() {
  return request(`${MAIN_SITE_API_PATH}/member/ucenter/get_fishing_code`, {
    showProgress: false
  });
}

// otc
// 用户BankList
export async function getBankLists(params) {
  return request(`${OTC_API_PATH}/user/credit_card?status=${params}`);
}
//ALL  BankList
export async function getALLBank(params) {
  return request(`${OTC_API_PATH}/bank/list`);
}
//添加银行卡
export async function putBankList(params) {
  return request(`${OTC_API_PATH}/user/credit_card`, {
    method: 'POST',
    body: params,
    isOtc: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// 用户BankList-DELETE
export async function putRmBank(params) {
  return request(`${OTC_API_PATH}/user/credit_card/${params}`, {
    method: 'DELETE'
  });
}
//用户额度
export async function getOTCTradeInfo(params) {
  return request(`${OTC_API_PATH}/c2c/user/tradeInfo`);
}
//usdt汇率
export async function getOTCPrice(params, paramstwo) {
  return request(`${OTC_API_PATH}/coin/${params}/price?currency=${paramstwo}`);
}
//用户资产信息
export async function getBlance(params) {
  return request(`${OTC_API_PATH}/user/asset/${params}`);
}
//用户订单查询
export async function getC2cQueryOrder(params) {
  return request(`${OTC_API_PATH}/c2c/user/order/?${stringify(params)}`);
}
//用户订单详情查询
export async function getc2cOrderDetail(params) {
  return request(`${OTC_API_PATH}/c2c/user/order/${params}`);
}
//商家电话号码
export async function getDealerMobile(params) {
  return request(`${OTC_API_PATH}/c2c/user/getDealerMobile?${stringify(params)}`);
}
//用户订单确认付款
export async function putuserSetConfirm(params) {
  return request(`${OTC_API_PATH}/c2c/order/confirm_paid/${params}`, {
    method: 'PUT',
    isOtc: true
  });
}
//商家用户环信id
export async function getChatid(params) {
  return request(`${OTC_API_PATH}/c2c/user/getDealerIm?tradeNo=${params}`);
}
// 用户下单
export async function postAddOrder(params) {
  return request(`${OTC_API_PATH}/c2c/user/order`, {
    method: 'POST',
    body: params,
    isOtc: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
// 用户撤单
export async function deleteAddOrder(params) {
  return request(`${OTC_API_PATH}/c2c/user/order/${params}`, {
    method: 'DELETE',
    isOtc: true
  });
}
/*
 * OTC用户挂单限额接口
 */
export async function getEntrustLimit(params) {
  return request(`${OTC_API_PATH}/common/delegation/amount/limit?${stringify(params)}`, {
    isOtc: true
  });
}
/*
 * 用户委托挂单
 */
export async function userMakerOrder(params) {
  return request(`${OTC_API_PATH}/user/delegation`, {
    method: 'POST',
    body: params,
    isOtc: true
  });
}
/*
 * 获取自己委托挂单
 */
export async function getMeMakerOrder(params) {
  return request(`${OTC_API_PATH}/user/delegation?${stringify(params)}`, {
    isOtc: true
  });
}
/*
 * 撤销自己委托挂单
 */
export async function putMeMakerOrder(params) {
  return request(`${OTC_API_PATH}/user/delegation/delete?${stringify(params)}`, {
    method: 'DELETE',
    isOtc: true
  });
}
/*
 * 供应商接口
 */
export async function getSupplier(params) {
  return request(`${OTC_API_PATH}/acceptance/supplier?${stringify(params)}`, {
    showProgress: false
  });
}

/*
 * 信用卡购买支持的币种
 */
export async function getCreditCardCoins(params) {
  return request(`${OTC_API_PATH}/acceptance/coins?${stringify(params)}`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 信用卡购买支持的法币
 */
export async function getCreditCardCurrencies(params) {
  return request(`${OTC_API_PATH}/acceptance/currencies?${stringify(params)}`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 信用卡购买币种单价
 */
export async function getrdPartPrice(params) {
  return request(`${OTC_API_PATH}/acceptance/price `, {
    method: 'POST',
    body: params,
    isOtc: true
  });
}
/*
 * 信用卡购买币种实际成交单价
 */
export async function getPracticalPrice(params) {
  return request(`${OTC_API_PATH}/acceptance/actual_price`, {
    method: 'POST',
    body: params,
    isOtc: true
  });
}
/*
 * 信用卡购买币种支持支付方式
 */
export async function getCreditCardPayment(params) {
  return request(`${OTC_API_PATH}/acceptance/payment_methods`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 获取当前币种的充值地址
 */
export async function getCoinAdress(currency, ServiceProviders) {
  return request(`${OTC_API_PATH}/user/address/${currency}/${ServiceProviders}`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 信用卡下单提交
 */
export async function putCreditCardOrder(params) {
  return request(`${OTC_API_PATH}/acceptance/order`, {
    method: 'POST',
    body: params,
    isOtc: true
  });
}

/*
 * 信用卡下单订单记录
 */
export async function getCreditCardOrderList(params) {
  return request(`${OTC_API_PATH}/acceptance/order?${stringify(params)}`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 信用卡下单额度限制
 */
export async function getCreditCardLimit(params) {
  return request(`${OTC_API_PATH}/acceptance/trade_limit?${stringify(params)}`, {
    showProgress: false,
    isOtc: true
  });
}
/*
 * 用户-用户确认收款结束订单
 */
export async function userConfirmReceipt(params) {
  return request(`${OTC_API_PATH}/order/finish`, {
    method: 'POST',
    body: params
  });
}
/*
 * OTC 用户商家发起申诉
 */
export async function putOrderAppeal(params) {
  return request(`${OTC_API_PATH}/order/complain`, {
    method: 'POST',
    body: params,
    showProgress: false,
    isOtc: true
  });
}
/*
 * OTC 用户商家上传图片
 */
export async function putOrderAppealImg(data = {}) {
  console.log(data);
  return request(`${OTC_API_PATH}/common/upload_file`, {
    method: 'POST',
    credentials: 'include',
    body: data,
    showProgress: false,
    isOtc: true
  });
}
/*
 * OTC 查看申诉信息
 */
export async function getAppealInfo(params = {}) {
  return request(`${OTC_API_PATH}/order/complain/msg?${stringify(params)}`, {
    method: 'GET',
    showProgress: false,
    isOtc: true
  });
}
/*
 * OTC 申诉评论
 */
export async function putAppealComment(params = {}) {
  return request(`${OTC_API_PATH}/order/complain/observe`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    },
    showProgress: false,
    isOtc: true
  });
}
/*
 * OTC 发起申诉
 */
export async function putAppealArbitrate(params = {}) {
  return request(`${OTC_API_PATH}/order/complain/arbitrate/${params}`, {
    method: 'PUT',
    showProgress: false,
    isOtc: true
  });
}

// PUsh
export async function getpush(params) {
  return request(`${MAIN_SITE_API_PATH}/push`);
}
// push-币种价格
export async function getCnyPrice(params) {
  return request(`${MAIN_SITE_API_PATH}/market/price/${params}`);
}
// push-个人资产
export async function getMainBalance(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/balances?currency=${params}`);
}
// push-求购
export async function putmakeBidOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/push/create_order`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
// push-发送
export async function getPushBids(params, page, pageSize) {
  return request(`${MAIN_SITE_API_PATH}/push/trade/${params}?page=${page}&pageSize=${pageSize}`);
}
// push-发送订单取消
export async function putCancelPushBid(params) {
  return request(`${MAIN_SITE_API_PATH}/push/trade/${params}`, {
    method: 'DELETE'
  });
}

// push-订单记录
export async function getOrderHistory(params, page, pageSize) {
  if (params === 'BUY') {
    return request(`${MAIN_SITE_API_PATH}/push/order/history/${params}?page=${page}&pageSize=${pageSize}`);
  } else {
    return request(`${MAIN_SITE_API_PATH}/push/deal/history/${params}?page=${page}&pageSize=${pageSize}`);
  }
}
// push-订单详情
export async function getPushInfo(params) {
  return request(`${MAIN_SITE_API_PATH}/push/order/${params}`);
}
//push-发送确认
export async function putdoPush(params) {
  return request(`${MAIN_SITE_API_PATH}/push/do_push`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
// end
export async function getTopStart() {
  return request(`${MAIN_SITE_API_PATH}/common/rate/top/star`, {
    showProgress: false
  });
}

export async function getProfitRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/commissions?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getPoolDetail(currency) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/detail?poolId=${currency}`, {
    showProgress: false
  });
}

export async function setPoolIn(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/pool_in`, {
    method: 'POST',
    body: params
  });
}

export async function setPoolOut(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/pool_out`, {
    method: 'POST',
    body: params
  });
}

export async function getPoolList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/list`, {
    showProgress: false
  });
}

export async function getPoolDefiList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/defi_list`, {
    showProgress: false
  });
}

export async function getPoolLockList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/lock_list`, {
    showProgress: false
  });
}

export async function getPoolHoldList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/hold_list`, {
    showProgress: false
  });
}

export async function getPoolHistory(id) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/history_profit?poolId=${id}`, {
    showProgress: false
  });
}

export async function getOtherRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/trans_log?${stringify(params)}`);
}

export async function getLockRecordDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/lock_record_detail?${stringify(params)}`, {
    showProgress: false
  });
}

export async function setPoolLock(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/apply_lock`, {
    method: 'POST',
    body: params
  });
}

export async function setPoolUnLock(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/apply_unlock`, {
    method: 'POST',
    body: params
  });
}

export async function getHoldPoolRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/hold_record?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getHoldPoolRecordDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/hold_record_detail?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getLockPoolRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/lock_record?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getCoins() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/coins`, {
    showProgress: false
  });
}

export async function getNews() {
  return request(`${MAIN_SITE_API_PATH}/news/list?pageNum=1&pageSize=999`, {
    showProgress: false
  });
}

export async function getWithdrawDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/withdraw/detail?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getDepositDetail(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/deposit/detail?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getKycInfo(params) {
  return request(`${MAIN_SITE_API_PATH}/member/ucenter/kyc_info`, {
    showProgress: false
  });
}

export async function saveWithdrawAddress(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/save_remark`, {
    method: 'POST',
    body: params
  });
}

export async function sutersConvert(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/suters_convert`, {
    method: 'POST',
    body: params
  });
}

export async function getAppUrl() {
  return request(`${MAIN_SITE_API_PATH}/common/app/download`, {
    showProgress: false
  });
}

export async function enableFeeDiscount(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/enable_fee_discount`, {
    method: 'POST',
    body: params
  });
}

export async function getSupportSymbol() {
  return request(`${MAIN_SITE_API_PATH}/margin/supportsymbol`, {
    showProgress: false
  });
}

export async function marginRegister() {
  return request(`${MAIN_SITE_API_PATH}/margin/register`, {
    showProgress: false
  });
}

export async function getBailCurrency() {
  return request(`${MAIN_SITE_API_PATH}/margin/bail_currency`, {
    showProgress: false
  });
}

export async function getBorrowCurrency() {
  return request(`${MAIN_SITE_API_PATH}/margin/borrow_currency`, {
    showProgress: false
  });
}

export async function makeMarginLimitOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/order/place `, {
    method: 'POST',
    body: params
  });
}

export async function getBorrowAvailable(type, currency) {
  return request(`${MAIN_SITE_API_PATH}/margin/borrow_available/${type}/${currency}`, {
    showProgress: false
  });
}

export async function getMarginBalance(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/hold_balance?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getMarginAccount() {
  return request(`${MAIN_SITE_API_PATH}/margin/account_info`, {
    showProgress: false
  });
}

export async function getWithdrawNum(currency) {
  return request(`${MAIN_SITE_API_PATH}/margin/withdraw_num/${currency}`, {
    showProgress: false
  });
}

export async function borrowCurrency(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/borrow`, {
    method: 'POST',
    body: params
  });
}

export async function getBorrowReocord(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/borrow_record`, {
    method: 'POST',
    body: params
  });
}

export async function getBorrowIntrst(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/repay_interest?${stringify(params)}`, {
    showProgress: false
  });
}

export async function repayBorrow(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/repay`, {
    method: 'POST',
    body: params
  });
}

export async function getMarginAsset(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/asset/list`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function getMarginOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/order/list`, {
    method: 'POST',
    body: params
  });
}

export async function getDealOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/order/deal_list`, {
    method: 'POST',
    body: params
  });
}

export async function cancelMarginOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/order/cancel/${params}`, {
    showProgress: false
  });
}

export async function getMarginRatio() {
  return request(`${MAIN_SITE_API_PATH}/margin/ratio`, {
    showProgress: false
  });
}

export async function getBorrowRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/borrow_record`, {
    method: 'POST',
    body: params
  });
}

export async function getRepeyRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/margin/repay_record`, {
    method: 'POST',
    body: params
  });
}

/**
 * otc
 *
 */
export async function getOtcUser() {
  return request(`${OTC_API_PATH}/user`, {
    showProgress: false
  });
}
export async function getPayList() {
  return request(`${OTC_API_PATH}/payment/method`, {
    showProgress: false
  });
}
export async function getCountriesCurrency(params) {
  return request(`${OTC_API_PATH}/common/country`, {
    showProgress: false
  });
}
export async function getPayMoney(params) {
  return request(`${OTC_API_PATH}/common/currency`, {
    showProgress: false
  });
}
export async function getMarketCoins(params) {
  return request(`${OTC_API_PATH}/common/coins`, {
    showProgress: false
  });
}
export async function getQuickOrderInfo(params) {
  return request(`${OTC_API_PATH}/common/reference_price?${stringify(params)}`, {
    showProgress: false
  });
}
export async function getOtcAssets(params) {
  return request(`${OTC_API_PATH}/user/asset/${params}`, {
    showProgress: false
  });
}
export async function getMarketList(params) {
  return request(`${OTC_API_PATH}/market?${stringify(params)}`, {
    showProgress: false
  });
}
export async function getPayPrecision(params) {
  return request(`${OTC_API_PATH}/common/currency/${params}`, {
    showProgress: false
  });
}
export async function getCurrencyPrecision(params) {
  return request(`${OTC_API_PATH}/common/coin/${params}`, {
    showProgress: false
  });
}
export async function postPlaceTheOrder(params) {
  return request(`${OTC_API_PATH}/order/deal`, {
    method: 'POST',
    body: params
  });
}
export async function getPlaceTheOrder(params) {
  return request(`${OTC_API_PATH}/order/info/${params}`, {
    showProgress: false
  });
}
export async function getMarketInfo(params) {
  return request(`${OTC_API_PATH}/common/share/${params}`, {
    showProgress: false
  });
}
export async function putQuickOrder(params) {
  return request(`${OTC_API_PATH}/order/flush_trade_match`, {
    method: 'POST',
    body: params
  });
}
export async function getHoldCurrency(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/holdCurrencyDetail?${stringify(params)}`);
}

export async function queryTradeAmount(params) {
  return request(`${MAIN_SITE_API_PATH}/launchpad/query_trade_amount `, {
    method: 'POST',
    body: params
  });
}
export async function postQuickOrder(params) {
  return request(`${OTC_API_PATH}/order/fast_trade `, {
    method: 'POST',
    body: params
  });
}
export async function getMdayLotNumber(pid) {
  const params = { pid: pid };
  return request(`${MAIN_SITE_API_PATH}/launchpad/do_draw_now`, {
    method: 'POST',
    body: params
  });
}
export async function getFiatorderHistory(params) {
  return request(`${OTC_API_PATH}/order/deal/history?${stringify(params)}`, {
    showProgress: false
  });
}
export async function getMethodOfPayment(Type, params) {
  return request(`${OTC_API_PATH}/payment/user`, {
    method: Type,
    body: params
  });
}
export async function putPaySwitch(params) {
  return request(`${OTC_API_PATH}/payment/user/switch`, {
    method: 'PUT',
    body: params
  });
}
export async function putPaymentMethod(type, params) {
  return request(`${OTC_API_PATH}/payment/user`, {
    method: type,
    body: params
  });
}
export async function putPayInfo(params) {
  return request(`${OTC_API_PATH}/payment/user/${params}`, {
    showProgress: false
  });
}
export async function putPaymentType(params) {
  return request(`${OTC_API_PATH}/order/confirm_paid`, {
    method: 'PUT',
    body: params
  });
}
export async function putUserCancel(params) {
  return request(`${OTC_API_PATH}/order/cancel `, {
    method: 'PUT',
    body: params
  });
}
export async function putOrderComplaintSelect(params) {
  return request(`${OTC_API_PATH}/order/complain_type`, {
    method: 'GET',
    body: params
  });
}
export async function putOrderComplaint(params) {
  return request(`${OTC_API_PATH}/order/complain`, {
    method: 'POST',
    body: params
  });
}

export async function getPoolMarginList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/margin_list`, {
    showProgress: false
  });
}

export async function getPoolFinanceList() {
  return request(`${MAIN_SITE_API_PATH}/member/miner_pool/finance_list`, {
    showProgress: false
  });
}

export async function newMarginCheck() {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/account/check`, {
    showProgress: false
  });
}
export async function getEtfRate(currency) {
  return request(`${MAIN_SITE_API_PATH}/common/etf/funding_rate/${currency}`, {
    showProgress: false
  });
}

export async function newMarginCoinList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/common/symbols?${stringify(params)}`, {
    showProgress: false
  });
}

export async function getETFNetValue(pair) {
  return request(`${MAIN_SITE_API_PATH}/common/etf/net_worth/${pair}`, {
    showProgress: false
  });
}

export async function newmarginRegister() {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/account/open`, {
    showProgress: false
  });
}

export async function newmarginAccount(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/account/query?${stringify(params)}`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function newmarginToggleMode(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/account/change_trade_mode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: params
  });
}

export async function newmarginAvlBorrow(symbol) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/avl_borrow?accountType=STEP&symbol=${symbol}`, {
    showProgress: false
  });
}

export async function newmarginAvlTransfer(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/avl_transfer?accountType=STEP&${stringify(params)}`, {
    showProgress: false
  });
}

export async function newmarginAssetsBalance(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/balance?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newmarginAssetsBorrow(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/borrow`, {
    method: 'POST',
    body: params
  });
}

export async function newmarginBorrowList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/borrow_list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newmarginAssetsrepay(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/repay`, {
    method: 'POST',
    body: params
  });
}

export async function newmarginRepayList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/repay_list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newMarginOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/open_order?${stringify(params)}`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function newMarginStepInfo(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/common/gradually_symbols?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newMarginStepLevel(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/account/level?accountType=STEP&${stringify(params)}`);
}

export async function getETFIndexInfo(currency) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/info/${currency}`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function postETFIndexOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/order`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getETFIndexOrderList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/list`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getETFIndexSymbols() {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/symbols`);
}

export async function getETFIndexConfigLimit(currency) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/config_limit/${currency}`, {
    showProgress: false
  });
}

export async function newMarginHistoryOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newMarginTriggerHistoryOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/trigger/list?${stringify(params)}`, {
    showProgress: false
  });
}
export async function newCancelMarginOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/cancel/STEP/${params}`, {
    showProgress: false,
    method: 'DELETE'
  });
}

export async function newMakeMarginLimitOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/place `, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: params
  });
}

export async function newBorrowRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/borrow_list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newRepeyRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/repay_list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newMarginBorrow(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/borrow `, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: params
  });
}

export async function newMarginRepay(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/asset/repay `, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: params
  });
}

export async function newMarginDealRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/deal_list?${stringify(params)}`, {
    showProgress: false
  });
}

export async function newMarginTriggerOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/trigger/place`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      nonce: Math.random()
        .toString()
        .slice(2, 15)
    },
    body: params,
    needFingerprint: true
  });
}

export async function newCancelMarginTriggerOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/margin/order/trigger/cancel/${params}`, {
    showProgress: false,
    method: 'DELETE'
  });
}

export async function getETFKline(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/etf_line`, {
    method: 'POST',
    body: params,
    showProgress: false,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getETFIndexKline(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/index_line`, {
    method: 'POST',
    body: params,
    showProgress: false,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function cancelEtfIndexOrder(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_index/order_cancel`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getMarketSymbols() {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/symbols`, {
    method: 'GET'
  });
}

export async function getMarketDeals(symbol) {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/deals?symbol=${symbol}`, {
    method: 'GET'
  });
}

export async function getMarketDepth(symbol) {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/depth?symbol=${symbol}`, {
    method: 'GET'
  });
}

export async function getMarketSymbol(symbol) {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/symbol?symbol=${symbol}`, {
    method: 'GET'
  });
}

// 获取红包状态
export async function getRedPacketInfo(id) {
  return request(`${MAIN_SITE_API_PATH}/red_packet/${id}`, {
    method: 'GET',
    credentials: 'omit',
    showProgress: false
  });
}

// 抢红包接口
export async function receiveRedPacket(params) {
  return request(`${MAIN_SITE_API_PATH}/red_packet/receive`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
    showProgress: false
  });
}

// 新用户抢红包接口
export async function receiveRedPacketRegister(params) {
  return request(`${MAIN_SITE_API_PATH}/red_packet/register/receive`, {
    method: 'POST',
    body: params,
    credentials: 'omit',
    showProgress: false
  });
}

// 获取红包领取记录
export async function getRedPacketRecord(id) {
  return request(`${MAIN_SITE_API_PATH}/red_packet/list/${id}`, {
    method: 'GET',
    credentials: 'omit',
    showProgress: false
  });
}

// 获取活动列表
export async function getVotingGovernList() {
  return request(`${MAIN_SITE_API_PATH}/vote/simple/vote_activity_list`, {
    showProgress: false
  });
}

// 获取某个活动详情
export async function getVotingGovernDetail(id) {
  return request(`${MAIN_SITE_API_PATH}/vote/simple/vote_info?code=${id}`, {
    showProgress: false
  });
}

// 投票接口
export async function doVoteGovern(params) {
  return request(`${MAIN_SITE_API_PATH}/vote/simple/voting?${stringify(params)}`, {
    showProgress: false
  });
}

// 查询我的投票接口
export async function getMyVoteGovern(id) {
  return request(`${MAIN_SITE_API_PATH}/vote/simple/my_vote?code=${id}`, {
    showProgress: false
  });
}

// 充值PK赛
export async function getGameRechargeInfo() {
  return request(`${MAIN_SITE_API_PATH}/activity/deposit/info`, {
    method: 'GET',
    showProgress: false,
    showErrorMsg: false
  });
}

// 充值排名赛
export async function getGameRankingInfo() {
  return request(`${MAIN_SITE_API_PATH}/activity/deposit/rank/info`, {
    method: 'GET',
    showProgress: false,
    showErrorMsg: false
  });
}

// 分叉币兑换
export async function forkConversion(params) {
  return request(`${MAIN_SITE_API_PATH}/member/fork/convert`, {
    method: 'POST',
    body: params,
    showProgress: false
  });
}

// 分叉币兑换反向
export async function forkConversionReverse(params) {
  return request(`${MAIN_SITE_API_PATH}/member/fork/merge`, {
    method: 'POST',
    body: params,
    showProgress: false
  });
}

// 分叉币兑换明细
export async function forkConversionRecord(params) {
  return request(`${MAIN_SITE_API_PATH}/member/fork/history?${stringify(params)}`, {
    method: 'GET',
    showProgress: false
  });
}
// 获取币种专区分类
export async function getZones() {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/concept_plates`, {
    showProgress: false
  });
}
// 获取币种专区分类简介
export async function getZonesInfo(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/concept_plate_introduce?${stringify(params)}`, {
    showProgress: false
  });
}
// 灰度持仓
export async function grayCoinList(params) {
  return request(`https://dncapi.fxhapp.com/api/v3/grayscale/index_list?webp=1`, {
    method: 'GET',
    showProgress: false,
    showErrorMsg: false,
    credentials: 'same-origin',
    customHeaders: false
  });
}

export async function getEtfRankList(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_ranking/income_ranking?${stringify(params)}`, {
    method: 'GET',
    showProgress: false
  });
}
export async function getEtfRankInfo(params) {
  return request(`${MAIN_SITE_API_PATH}/platform/etf_ranking/income_info?${stringify(params)}`, {
    method: 'GET'
  });
}
// BETH兑换
export async function stakingConversion(params) {
  return request(`${MAIN_SITE_API_PATH}/member/fork/convert`, {
    method: 'POST',
    body: params,
    showProgress: false
  });
}
/*
 * 获取zendesk token
 */
export async function getZendeskInfo(params) {
  return request(`${getSubSite('chat')}/api/im/get_zendesk_jwt_token`, {
    showProgress: false
  });
}

export async function getNewAsset(type) {
  return request(`${MAIN_SITE_API_PATH}/platform/asset/${type}`, {
    method: 'GET'
  });
}

export async function getNewAssetDetail(currency) {
  return request(`${MAIN_SITE_API_PATH}/platform/asset/spot/${currency}`, {
    method: 'GET'
  });
}
export async function getAppConfig() {
  return request(`${APP_API_PATH}/app${NODE_ENV === 'production' ? '/v21' : ''}/platform/app_config`, {
    method: 'GET',
    headers: {
      version: '3.1.7'
    }
  });
}

export async function getCreditCardSlect(params) {
  return request(`${OTC_API_PATH}/acceptance/currency_coins`, {
    showProgress: false
  });
}
export async function sendUcenterEmailCode(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/code/send_mail_code`, {
    method: 'POST',
    body: params,
    isUC: true
  });
}

export async function sendUcenterSMSCode(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/code/send_sms_code`, {
    method: 'POST',
    body: params,
    isUC: true,
    showProgress: false
  });
}

export async function emailBind(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/email/bind`, {
    method: 'POST',
    isUC: true,
    body: params
  });
}

export async function emailModify(params) {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/email/modify`, {
    method: 'POST',
    isUC: true,
    body: params
  });
}

export async function getForbidMailSuffix() {
  const uc_api = await getUcenterPath();
  return request(`${uc_api}/config/mail_suffix`, {
    isCORS: true
  });
}

export async function checkAddress(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/check_address`, {
    method: 'POST',
    body: params,
    showProgress: false
  });
}

export async function checkAmount(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/check_withdraw_amount`, {
    method: 'POST',
    body: params,
    showProgress: false,
    showErrorMsg: false
  });
}

export async function queryCurrencyTip(currency) {
  return request(`${MAIN_SITE_API_PATH}/market/coin/${currency}`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function queryHotSearch() {
  return request(`${MAIN_SITE_API_PATH}/platform/spot/market/hot_search`, {
    showProgress: false,
    showErrorMsg: false
  });
}

export async function getNewAssetOverview() {
  return request(`${MAIN_SITE_API_PATH}/platform/asset/overview`, {
    showProgress: false
  });
}
