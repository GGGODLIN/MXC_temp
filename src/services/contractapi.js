import contractRequest from '@/utils/contractRequest';
import request from '@/utils/request';
import { stringify } from 'query-string';
import { getSubSite, getCookie } from '@/utils';

const MAIN_SITE_API_PATH = `${getSubSite('main')}/api`;
const CONTRACT_API = `${getSubSite('contract')}/api/v1`;

// 取消订单
export async function cancelOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/order/cancel`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}
// 修改杠杆倍数
export async function subChangeLeverage(params) {
  return contractRequest(`${CONTRACT_API}/private/position/change_leverage`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}

// 取消全部委托订单
export async function cancelAllOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/order/cancel_all`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}

// 取消全部计划委托订单
export async function cancelAllPlanOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/planorder/cancel_all`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}

export async function getRiskLevelLimit(params) {
  return contractRequest(`${CONTRACT_API}/private/account/risk_limit?${stringify(params)}`, {
    method: 'GET',
    needLogin: true
  });
}
export async function putRiskLevelLimit(params) {
  return contractRequest(`${CONTRACT_API}/private/account/change_risk_level`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}
// 深度快照
export async function depthCommits(symbol, limit) {
  return contractRequest(`${CONTRACT_API}/contract/depth_commits/${symbol}/${limit} `);
}

export async function getServerTime() {
  return contractRequest(`${CONTRACT_API}/contract/ping`);
}

// 获取取消订单
export async function getCloseOrder(params) {
  return contractRequest(`${CONTRACT_API}/private/order/close_orders?${stringify(params)}`, {
    needLogin: true
  });
}
// 单次提交订单
export async function submitOrder(params) {
  console.log(params);
  return contractRequest(`${CONTRACT_API}/private/order/submit`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}
// 提交计划委托
export async function submitPlanOrder(params) {
  return contractRequest(`${CONTRACT_API}/private/planorder/place`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}
// 取消计划委托
export async function cancelPlanOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/planorder/cancel`, {
    method: 'POST',
    body: params,
    needLogin: true
  });
}
// 获取合约账户信息
export async function getAccountsAsset(currency) {
  return contractRequest(`${CONTRACT_API}/private/account/asset/${currency}`, { needLogin: true });
}
// 获取合约币种账户信息
export async function getAccountsAssetList() {
  return contractRequest(`${CONTRACT_API}/private/account/assets`, { needLogin: true });
}
// 获取支持划转币种
export async function getSupportCurrencies() {
  return contractRequest(`${CONTRACT_API}/contract/support_currencies`);
}
// 获取成交明细
export async function getDealDetails(order_id) {
  return contractRequest(`${CONTRACT_API}/private/order/deal_details/${order_id}`, { needLogin: true });
}
// 获取用户历史仓位
export async function getUserPositionsHistory(params) {
  return contractRequest(`${CONTRACT_API}/private/position/history_positions?${stringify(params)}`, { needLogin: true });
}
// 获取用户仓位
export async function getUserPositions(params) {
  return contractRequest(`${CONTRACT_API}/private/position/open_positions?${stringify(params)}`, {
    needLogin: true
  });
}
// 获取用户订单记录
export async function getUserOrders({ symbol, params }) {
  return contractRequest(`${CONTRACT_API}/private/order/open_orders${symbol ? `/${symbol}` : ''}?${stringify(params)}`, {
    needLogin: true
  });
}
// 获取所有用户订单记录
export async function getUserOrdersAll(contract_id) {
  return contractRequest(`${CONTRACT_API}/private/order/open_orders`, { needLogin: true });
}
// 获取用户计划委托记录
export async function getUserPlanOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/planorder/orders?${stringify(params)}`, { needLogin: true });
}
// 查询历史成交
export async function getHistoryOrders(params) {
  return contractRequest(`${CONTRACT_API}/private/order/history_orders?${stringify(params)}`, { needLogin: true });
}
// 获取合约列表
export async function getInstruments(params) {
  return contractRequest(`${CONTRACT_API}/contract/detail`);
}
// 获取合约深度
export async function getDepth(contract_id) {
  return contractRequest(`${CONTRACT_API}/contract/depth/${contract_id}`);
}
// 获取合约Ticker
export async function getTickers(params) {
  return contractRequest(`${CONTRACT_API}/contract/ticker?${stringify(params)}`);
}
// 获取合约交易记录
export async function getTrades(symbol) {
  return contractRequest(`${CONTRACT_API}/contract/deals/${symbol}`);
}

export async function getFundingRate(symbol) {
  return contractRequest(`${CONTRACT_API}/contract/funding_rate/${symbol}`);
}
export async function getKlineHistory({ symbol, interval, start, end }) {
  // end = end ? end : Date.parse(String(new Date()).replace(/-/g, '/'))
  // end = Date.parse(String(new Date()).replace(/-/g, '/'))
  // if (isIncremental) { // 增量查询
  //   start = end - 10000
  // } else { // 查询全部
  //   start = start || (end - 86400000)
  // }
  start = parseInt(start / 1000);
  end = parseInt(end / 1000);
  symbol = symbol || 1;
  symbol = String(symbol);
  let getUrl;
  getUrl =
    // ifcontract +
    // '/quote?symbol=' +
    '/contract/kline/' + symbol + '?start=' + start + '&end=' + end + '&interval=' + interval;
  return contractRequest(`${CONTRACT_API}${getUrl}`);
}

export async function getMXCSysBalances() {
  return request(`${MAIN_SITE_API_PATH}/member/asset/sys_balances?sys=SWAP`);
}

export async function getMXCSysTrans(params) {
  return request(`${MAIN_SITE_API_PATH}/member/asset/transfer`, {
    method: 'POST',
    body: params
  });
}
// 发放模拟币
export async function postMXCSimulation(params) {
  return request(`${MAIN_SITE_API_PATH}/swap/simulation/deposit`, {
    method: 'POST',
    body: params
  });
}
// 查询是否开通合约
export async function getMXCAccountExist() {
  return request(`${MAIN_SITE_API_PATH}/swap/account/exist`);
}
// 创建合约账号
export async function createAccount(params) {
  return request(`${MAIN_SITE_API_PATH}/swap/account/create`, {
    method: 'POST',
    body: params
  });
}
// 给逐仓仓位追加或减少保证金 type ADD:追加保证金,SUB:减少保证金
export async function marginOper({ positionId, amount, type }) {
  return contractRequest(`${CONTRACT_API}/private/position/change_margin`, {
    method: 'POST',
    body: { positionId, amount, type },
    needLogin: true
  });
}

// 获取指数k线数据
export async function getIndexBar({ symbol, interval, start, end }) {
  start = parseInt(start / 1000);
  end = parseInt(end / 1000);
  symbol = symbol || 1;
  symbol = String(symbol);
  let getUrl;
  getUrl = '/contract/kline/index_price/' + symbol + '?start=' + start + '&end=' + end + '&interval=' + interval;

  return contractRequest(`${CONTRACT_API}${getUrl}`);
}

// 获取合理价格k线数据
export async function getFpBar({ symbol, interval, start, end }) {
  start = parseInt(start / 1000);
  end = parseInt(end / 1000);
  symbol = symbol || 1;
  symbol = String(symbol);
  let getUrl;
  getUrl = '/contract/kline/fair_price/' + symbol + '?start=' + start + '&end=' + end + '&interval=' + interval;

  return contractRequest(`${CONTRACT_API}${getUrl}`);
}

// 获取某个合约资金费率列表
export async function getFundingRateList(params) {
  return contractRequest(`${CONTRACT_API}/contract/funding_rate/history?${stringify(params)}`, {
    showProgress: false
  });
}

// 获取某个合约保险基金列表
export async function getRiskReserves(params) {
  return contractRequest(`${CONTRACT_API}/contract/risk_reverse/history?${stringify(params)}`, {
    showProgress: false
  });
}
// 获取某个合约保险基金列表
export async function getFundingRecord(params) {
  return contractRequest(`${CONTRACT_API}/private/position/funding_records?${stringify(params)}`, {
    needLogin: true
  });
}

// 获取排行榜
export async function getRankList(type) {
  return contractRequest(`${CONTRACT_API}/contract/rank_list/${type}`, {
    method: 'GET'
  });
}

// 获取排行榜
export async function getRankSelf(type) {
  return contractRequest(`${CONTRACT_API}/private/account/profit_rate/${type}`, {
    method: 'GET',
    needLogin: true
  });
}

// 合约资产分析
export async function getAssetsAnalysis(type, params) {
  return contractRequest(`${CONTRACT_API}/private/account/asset/analysis/${type}?${stringify(params)}`, {
    method: 'GET',
    needLogin: true
  });
}
