import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import { flatten } from 'lodash';
import Link from 'umi/link';
import classNames from 'classnames';
import { getPoolLockList, getPoolHoldList, getPoolMarginList, getNewAssetDetail } from '@/services/api';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import { numberToString, assetValuation, getSubSite } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';

import styles from './index.less';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const lang = getLocale();

const findMarkets = (currency, markets = []) => {
  let result = [];

  if (currency) {
    markets.map(market => {
      const list = market ? market.list : [];
      const item = list.find(el => el.currency === currency);

      if (item) {
        result.push({
          ...item,
          currency: item.currency,
          rate: item.rate ? (item.rate * 100).toFixed(2) : 0,
          c: item.c || 0
        });
      }
    });
  }

  return result;
};

const typeMaps = {
  LOCK: formatMessage({ id: 'assets.pos.lock.text' }),
  HOLD: formatMessage({ id: 'assets.pos.hold.text' }),
  MARGIN: formatMessage({ id: 'pos.title.pos_class_margin' })
};

const Detail = ({ location, markets, dispatch, cnyPrices, etfSymbols }) => {
  const { coin } = location.query;
  const [assetItem, setAssetItem] = useState({});
  const tradeArr = findMarkets(coin || '', markets);
  const [posList, setPosList] = useState([]);
  const hasEtf = etfSymbols.some(el => el.symbol.split('_')[0] === assetItem.currency);

  useEffect(() => {
    getSpotInfo();
  }, []);

  useEffect(() => {
    if (assetItem.currency) {
      Promise.all([getMargin(), getLock(), getHold()]).then(res => {
        const temp = flatten(res);
        const list = temp.filter(el => el.currency === assetItem.currency);

        setPosList(list);
      });

      dispatch({
        type: 'assets/save',
        payload: {
          withdrawFormValues: {}
        }
      });
    }
  }, [assetItem]);

  const getSpotInfo = async () => {
    const res = await getNewAssetDetail(coin);

    if (res.data && res.code === 200) {
      const item = res.data.chains.find(el => el.currency === coin) || {};
      setAssetItem({
        currencyFullName: res.data.currencyFullName,
        available: res.data.available,
        frozen: res.data.frozen,
        usdtTotal: res.data.usdtTotal,
        ...item
      });
    }
  };

  const getLock = () => {
    return new Promise(async (resolve, reject) => {
      const { code, allPools } = await getPoolLockList();

      if (code === 0) {
        resolve(allPools);
      }
    });
  };

  const getHold = () => {
    return new Promise(async (resolve, reject) => {
      const { code, allPools } = await getPoolHoldList();

      if (code === 0) {
        resolve(allPools);
      }
    });
  };

  const getMargin = () => {
    return new Promise(async (resolve, reject) => {
      const { code, allPools } = await getPoolMarginList();

      if (code === 0) {
        resolve(allPools);
      }
    });
  };

  return (
    <>
      <TopBar
        extra={
          <Link to="/uassets/record" className={styles.extra}>
            {formatMessage({ id: 'assets.record.link' })}
          </Link>
        }
      >
        <div className={styles.title}>{assetItem.currency}</div>
      </TopBar>
      <div className={styles.main}>
        <div className={styles.coin}>
          <i className={styles.icon} style={{ backgroundImage: `url(${MAIN_SITE_API_PATH}/file/download/${assetItem.icon})` }}></i>
          <span>
            {assetItem.currency}
            <label htmlFor="">-{assetItem.currencyFullName}</label>
          </span>
        </div>
        <div className={styles.balances}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'trade.spot.action.available' })}</label>
            <p>{numberToString(assetItem.available)}</p>
          </div>
          <div className={styles.split}></div>
          <div>
            <label htmlFor="">{formatMessage({ id: 'container.freeze' })}</label>
            <p>{numberToString(assetItem.frozen)}</p>
          </div>
        </div>
        <div className={styles.valuation}>
          {formatMessage({ id: 'assets.valuation' })}：{assetValuation(cnyPrices, assetItem.usdtTotal, 'BTC')} BTC ≈
          {lang.startsWith('zh') ? `${assetValuation(cnyPrices, assetItem.usdtTotal, 'CNY')} CNY` : `${assetItem.usdtTotal} USD`}
        </div>
      </div>
      <div className={styles.toTrade}>
        <div className={styles.head}>
          <h3>{formatMessage({ id: 'assets.trans.goTrade' })}</h3>
        </div>
        {tradeArr.map(item => (
          <div className={styles.item} key={item.market} onClick={() => router.push(`/trade/spot#${item.currency}_${item.market}`)}>
            <div>
              {item.currency}
              <span>/{item.market}</span>
            </div>
            {item.rate >= 0 ? <div className={styles.up}>+{item.rate}%</div> : <div className={styles.down}>{item.rate}%</div>}
            <div style={{ textAlign: 'right' }}>
              <p>{item.c}</p>
              {lang.startsWith('zh') ? (
                <label htmlFor="">≈{assetValuation(cnyPrices, item.c, 'CNY', item.market)} CNY</label>
              ) : (
                <label htmlFor="">≈{item.c} USD</label>
              )}
            </div>
          </div>
        ))}
      </div>
      {posList.length ? (
        <div className={styles.pos}>
          <div className={classNames(styles.posItem, styles.head)}>
            <div className={styles.first}>{formatMessage({ id: 'assets.pos.go_pos' })}</div>
            <div className={styles.f1}>{formatMessage({ id: 'assets.pos.the_yield' })}</div>
            <div className={styles.f2}>{formatMessage({ id: 'assets.pos.operating' })}</div>
          </div>
          {posList.map(item => {
            return (
              <div className={styles.posItem} key={item.id}>
                <div className={styles.first}>
                  <span>{typeMaps[item.type]}</span>
                  {item.type === 'MARGIN' && (
                    <span className={styles.tag}>
                      {item.additionCurrency}
                      {formatMessage({ id: 'pos.title.pos_opecial_field' })}
                    </span>
                  )}
                </div>
                <div className={styles.f1}>+{(item.profitRate * 100).toFixed(2)}%</div>
                <div className={styles.f2}>
                  <Button
                    type="primary"
                    inline
                    size="small"
                    className={'am-button-circle'}
                    onClick={e => router.push(`/pos/detail/${item.id}`)}
                  >
                    {formatMessage({ id: 'assets.pos.go_pos' })}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {!hasEtf && (
        <div className={styles.fixed}>
          <Button
            type="primary"
            disabled={!assetItem.enableDeposit && !assetItem.disableDepositReason}
            onClick={() => router.push(`/uassets/deposit?currency=${assetItem.currency}`)}
          >
            {formatMessage({ id: 'assets.balances.recharge' })}
          </Button>
          <Button
            type="warning"
            disabled={!assetItem.enableWithdraw && !assetItem.disableWithdrawReason}
            onClick={() => router.push(`/uassets/withdraw?currency=${assetItem.currency}`)}
          >
            {formatMessage({ id: 'assets.balances.cash' })}
          </Button>
        </div>
      )}
    </>
  );
};

export default connect(({ assets, trading, etfIndex }) => ({
  markets: trading.markets,
  cnyPrices: trading.cnyPrices,
  etfSymbols: etfIndex.symbols
}))(Detail);
