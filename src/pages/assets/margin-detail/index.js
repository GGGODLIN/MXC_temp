import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import Link from 'umi/link';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import { newmarginAvlBorrow, newmarginAssetsBalance, newBorrowRecord } from '@/services/api';
import { cutFloatDecimal, assetValuation, numberToString } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import moment from 'moment';

import styles from './index.less';

const lang = getLocale();

const findMarkets = (origin, markets = []) => {
  origin.map(item => {
    const marketsItem = markets.find(el => el.marketName === item.market);
    const list = marketsItem ? marketsItem.list : [];
    const market = list.find(el => el.currency === item.vcoinNameEn && el.margin) || {};
    item.rate = market.rate ? (market.rate * 100).toFixed(2) : 0;
    item.c = market.c || 0;

    return item;
  });

  return origin;
};

const initState = {
  accountName: 'ZXE/USDT',
  stopOutPrice: '--',
  stopLine: '1.05',
  withdrawLine: '2',
  riskRate: '--',
  btcAmount: '0',
  netBtcAmount: '0',
  debtBtcAmount: '0',
  usdtAmount: '0',
  cynAmount: '0',
  currencyAsset: {
    name: '',
    total: '0',
    available: '0',
    frozen: '0',
    borrow: '0',
    interest: null
  },
  marketAsset: {
    name: '',
    total: '0',
    available: '0',
    frozen: '0',
    borrow: '0',
    interest: null
  }
};

const Detail = ({ list, location, markets, cnyPrices, accounts }) => {
  const { coin } = location.query;
  const [currency, market] = coin.split('_');
  const [marginItem, setMarginItem] = useState(initState);
  const [marginAvlBorrow, setMarginAvlBorrow] = useState({ currency: {}, market: {} });
  const [borrowRecord, setBorrowRecord] = useState([]);
  const isAuto = accounts.length > 0 && accounts.find(i => i.symbol === coin).tradeMode === 'AUTO';
  useEffect(() => {
    getMarginAccount();
    getAvlBorrow();
    getBorrowRecord();
  }, []);

  const getMarginAccount = () => {
    newmarginAssetsBalance({
      accountType: 'STEP',
      symbol: coin
    }).then(res => {
      const _marginItem = { ...marginItem };
      _marginItem.accountName = coin;
      _marginItem.currencyAsset.name = currency;
      _marginItem.marketAsset.name = market;
      if (res.code === 200) {
        setMarginItem({ ...res.data[0] });
      } else {
        setMarginItem(_marginItem);
      }
    });
  };

  const getAvlBorrow = () => {
    newmarginAvlBorrow(coin).then(res => {
      if (res.code === 200) {
        const currencyAvlBorrow = res.data.find(i => i.currency === currency) || {};
        const marketAvlBorrow = res.data.find(i => i.currency === market) || {};
        setMarginAvlBorrow({
          currency: currencyAvlBorrow,
          market: marketAvlBorrow
        });
      }
    });
  };

  const getBorrowRecord = () => {
    newBorrowRecord({
      accountType: 'STEP',
      pageNum: 1,
      pageSize: 100,
      accountName: `${currency}/${market}`,
      status: 'REPAID_PARTIALLY,WAIT_REPAY'
    }).then(res => {
      if (res.code === 200) {
        setBorrowRecord([...res.data.resultList]);
      }
    });
  };

  return (
    <>
      <TopBar goback={true}>
        <div className={styles.title}>{coin}</div>
      </TopBar>
      <div className={styles.area}>
        <div className={styles.accountRisk}>
          <span>
            {formatMessage({ id: 'margin.title.safey_ratio' })}
            <b>≥ {isNaN(marginItem.riskRate * 100) ? '200' : (marginItem.riskRate * 100).toFixed(0)}%</b>
            <i className="iconfont icontips"></i>
          </span>
          <span>
            {formatMessage({ id: 'margin.title.strong_line' })}
            <b>{(marginItem.stopLine * 100).toFixed(0)}%</b>
          </span>
          <span>
            {formatMessage({ id: 'margin.title.break_price' })}
            <b>{isNaN(marginItem.stopOutPrice * 1) ? '--' : cutFloatDecimal(marginItem.stopOutPrice, 2)} U</b>
          </span>
        </div>
        <p className={styles.explosion}>*{formatMessage({ id: 'margin.title.explosion_desc' })}</p>
        <div className={styles.marginItemInfo}>
          <span>{formatMessage({ id: 'assets.total.balances' })}</span>
          <div>
            <p>{cutFloatDecimal(marginItem.btcAmount, 8)} BTC</p>
            <span>
              {cutFloatDecimal(
                marginItem.netBtcAmount * (lang.startsWith('zh') ? cnyPrices['BTC'] : cnyPrices['BTC'] / cnyPrices['USDT']),
                2
              )}{' '}
              {lang.startsWith('zh') ? 'CNY' : 'USDT'}
            </span>
          </div>
        </div>
        <div className={styles.marginItemInfo}>
          <span>{formatMessage({ id: 'margin.title.mount_loan' })}</span>
          <div>
            <p>{cutFloatDecimal(marginItem.btcAmount - marginItem.netBtcAmount, 8)} BTC</p>
            <span>
              {cutFloatDecimal(
                (marginItem.btcAmount - marginItem.netBtcAmount) *
                  (lang.startsWith('zh') ? cnyPrices['BTC'] : cnyPrices['BTC'] / cnyPrices['USDT']),
                2
              )}{' '}
              {lang.startsWith('zh') ? 'CNY' : 'USDT'}
            </span>
          </div>
        </div>
        <div className={styles.marginItemInfo}>
          <span>{formatMessage({ id: 'margin.title.net_assets' })}</span>
          <div>
            <p>{cutFloatDecimal(marginItem.netBtcAmount, 8)} BTC</p>
            <span>
              {cutFloatDecimal(
                marginItem.netBtcAmount * (lang.startsWith('zh') ? cnyPrices['BTC'] : cnyPrices['BTC'] / cnyPrices['USDT']),
                2
              )}{' '}
              {lang.startsWith('zh') ? 'CNY' : 'USDT'}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.area}>
        <h3>借贷信息</h3>
        <table>
          <tr>
            <td>类型</td>
            <td>{currency}</td>
            <td>{market}</td>
          </tr>
          <tr>
            <td>可借</td>
            <td>{marginAvlBorrow.currency.avlBorrow}</td>
            <td>{marginAvlBorrow.market.avlBorrow}</td>
          </tr>
          <tr>
            <td>已借</td>
            <td>{marginItem.currencyAsset.borrow}</td>
            <td>{marginItem.marketAsset.borrow}</td>
          </tr>
          <tr>
            <td>未还利息</td>
            <td>{marginItem.currencyAsset.interest || 0}</td>
            <td>{marginItem.marketAsset.interest || 0}</td>
          </tr>
        </table>
      </div>
      {borrowRecord.length > 0 && (
        <div className={styles.area}>
          <h3>未还订单</h3>
          {borrowRecord.map(b => (
            <div key={b.id} className={styles.borrowItem}>
              <div className={styles.top}>
                <span>
                  <b>借</b>
                  {b.currency}
                </span>
                <Button
                  size="small"
                  type="ghost"
                  onClick={() => router.push(`/margin/back?symbol=${currency}/${market}&recordNo=${b.recordNo}`)}
                >
                  还币
                </Button>
              </div>
              <table className={styles.bottom}>
                <tr>
                  <td>借币时间</td>
                  <td>订单编号</td>
                  <td>未还数量</td>
                </tr>
                <tr>
                  <td>{moment(b.createTime).format('YYYY-MM-DD HH:mm:ss')}</td>
                  <td>{b.recordNo}</td>
                  <td>{b.remainAmount}</td>
                </tr>
              </table>
            </div>
          ))}
        </div>
      )}

      <div className={styles.fixed}>
        <Button type="ghost" onClick={() => router.push(`/uassets/transfer?type=margin&currency=${currency}/${market}`)}>
          <i className="iconfont icontransfer"></i> {formatMessage({ id: 'assets.transfer' })}
        </Button>
        {!isAuto && (
          <Button type="ghost" onClick={() => router.push(`/margin/loan?symbol=${coin}`)}>
            <i className="iconfont iconloan"></i> {formatMessage({ id: 'margin.title.toLoan' })}
          </Button>
        )}

        <Button type="ghost" onClick={() => router.push(`/margin/spot#${coin}`)}>
          <i className="iconfont iconMarginTrade"></i> {formatMessage({ id: 'assets.trans.goTrade' })}
        </Button>
      </div>
    </>
  );
};

export default connect(({ trading, assets, margin }) => ({
  list: assets.allList,
  markets: trading.markets,
  cnyPrices: trading.cnyPrices,
  accounts: margin.accounts
}))(Detail);
