import { useState, useEffect } from 'react';

import { connect } from 'dva';
import styles from './popularCurrency.less';
import deficoin from '@/assets/img/defi/deficoin.png';
import { Button } from 'antd-mobile';
import { cutFloatDecimal, numberToString, getSubSite } from '@/utils';
import { gotoCrossPlatformUrl } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
const PopularCurrency = ({ markets, user, dispatch, type, netValues, coinList, title, defiCurrency, list }) => {
  const [filterCoin, setFilterCoin] = useState([]);
  const [state, setState] = useState(true);

  useEffect(() => {
    if (markets.length > 0) {
      marketsFilter();
    }
  }, [markets]);
  const intersection = (nums1, nums2) => {
    return [
      ...new Set(
        nums1.filter(item => {
          return nums2.includes(item.currency);
        })
      )
    ];
  };
  const marketsFilter = () => {
    let filterList = intersection(markets, list.slice(0, 6));
    setFilterCoin(filterList);
  };
  const unfoldList = num => {
    let filterList = intersection(markets, list.slice(0, num));
    setFilterCoin(filterList);
    setState(!state);
  };
  const currencyListFun = () => {
    let data = filterCoin;
    if (filterCoin.length > 0) {
      data.sort((a, b) => a.currency.charCodeAt(0) - b.currency.charCodeAt(0));
    }
    return data.map(item => {
      return (
        <div className={styles.listContent} key={item.currency}>
          <div className={styles.listLeft}>
            <span className={styles.coinIcon}>
              <i className={styles.icon} style={{ backgroundImage: `url(${getSubSite('main')}/api/file/download/${item.icon})` }}></i>
            </span>
            <span className={styles.coinName}>{item.currency}</span>
          </div>
          <div className={styles.listLeft}>
            <div className={styles.coinName}>{numberToString(item.c)}</div>
            <span className={styles.floating} style={{ color: item.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
              {item.rate >= 0 && '+'}
              {(item.rate * 100).toFixed(2)}%
            </span>
          </div>
          <div className={styles.listLeft}>
            <div
              className={styles.btn}
              onClick={() => {
                gotoCrossPlatformUrl(`polka?trade_pair=${item.currency}_${item.market}`, `/trade/spot#${item.currency}_${item.market}`);
              }}
            >
              {formatMessage({ id: 'layout.title.tabbar.trade' })}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles.currencyList} style={{ marginBottom: type === 'rebase' && 0 }}>
      <div className={styles.currencyTitle}>{title ? title : formatMessage({ id: 'ecology.etfZone.hot' })}</div>
      <div>{currencyListFun()}</div>
      {state === true ? (
        <div
          className={styles.allContent}
          onClick={() => {
            unfoldList();
          }}
        >
          {formatMessage({ id: 'swap.order.tab.showAll' })}
          <i className="iconfont iconcaret-down"></i>
        </div>
      ) : (
        <div
          className={styles.allContent}
          onClick={() => {
            unfoldList(6);
          }}
        >
          {formatMessage({ id: 'ecology.function.PackUp' })}
          <i className="iconfont iconcaret-down1"></i>
        </div>
      )}
    </div>
  );
};

export default connect(({ auth, trading, etfIndex, defi }) => ({
  user: auth.user,
  markets: trading.originMarkets,
  netValues: etfIndex.netValues,
  coinList: etfIndex.coinList,
  defiCurrency: defi.defiCurrency,
  polkaCurrency: defi.polkaCurrency
}))(PopularCurrency);
