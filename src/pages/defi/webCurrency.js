import { useState, useEffect } from 'react';
import { connect } from 'dva';
import styles from './popularCurrency.less';
import { numberToString, getSubSite } from '@/utils';
import { gotoCrossPlatformUrl } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';
const PopularCurrency = ({ markets, type, title, list }) => {
  const [filterCoin, setFilterCoin] = useState([]);
  useEffect(() => {
    setFilterCoin(list || []);
  }, [list]);

  const currencyListFun = () => {
    let data = filterCoin;
    if (filterCoin.length > 0) {
      data.sort((a, b) => {
        let x = a.currency.toLowerCase();
        let y = b.currency.toLowerCase();
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
    }

    console.log(data);

    return data.map(item => {
      return (
        <div className={styles.listContent} key={item.currency}>
          <div className={styles.listLeft}>
            <span className={styles.coinIcon}>
              <i className={styles.icon} style={{ backgroundImage: `url(${getSubSite('main')}/api/file/download/${item.icon})` }}></i>
            </span>
            <span className={styles.coinName}>{item.currencyDisplayName ? item.currencyDisplayName : item.currency}</span>
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
