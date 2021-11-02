import { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { WingBlank, InputItem, WhiteSpace } from 'antd-mobile';
import { flattenDepth } from 'lodash';
import styles from './index.less';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { numberToString } from '@/utils';

import rank1 from '@/assets/img/rank_1.svg';
import rank2 from '@/assets/img/rank_2.svg';
import rank3 from '@/assets/img/rank_3.svg';
import fire from '@/assets/img/fire.svg';
import fireHalf from '@/assets/img/fire-half.svg';

const rankMap = {
  1: rank1,
  2: rank2,
  3: rank3
};

const getStars = hotLevel => {
  if (!hotLevel || hotLevel <= 0) {
    return null;
  }
  const stars = new Array(parseInt(hotLevel / 2)).fill('full');
  const halfStar = hotLevel % 2;
  if (halfStar) {
    stars.push('half');
  }
  return stars;
};

const Search = ({ dispatch, markets, hotSearchList }) => {
  const [keyWords, setKeyWords] = useState('');
  const [recent, setRecent] = useState([]);
  const filterList = () => {
    const allMarket = flattenDepth(
      markets.map(item => item.list),
      1
    );
    return allMarket.filter(item => `${item.currency}/${item.market}`.toLowerCase().indexOf(keyWords.toLowerCase()) >= 0);
  };

  const handleChange = e => {
    setKeyWords(e);
  };

  useEffect(() => {
    const localRcent = localStorage.getItem('mxc.recent.searches');
    const LocalRcent = localRcent ? JSON.parse(localRcent) : [];
    setRecent(LocalRcent);
    dispatch({ type: 'global/getHotSearch' });
  }, []);

  const goTrade = item => {
    if (item.currency) {
      router.push(`/trade/spot#${item.currency}_${item.market}`);
    } else {
      router.push(`/trade/spot#${item}`);
    }

    saveDeal(item);
  };

  const saveDeal = item => {
    const ls = localStorage.getItem('mxc.recent.searches');
    let recent = ls ? JSON.parse(ls) : [];
    if (recent.some(a => a === `${item.currency}/${item.market}`))
      recent.splice(
        recent.findIndex(a => a === `${item.currency}/${item.market}`),
        1
      );
    recent.unshift(`${item.currency}/${item.market}`);
    if (recent.length > 5) recent.length = 5;
    localStorage.setItem('mxc.recent.searches', JSON.stringify(recent));
  };

  const [hotSearchListHide, setHotSearchListHide] = useState(false);
  const hotSearchListHideChange = () => {
    setHotSearchListHide(!hotSearchListHide);
  };

  return (
    <>
      <div className={styles.searchBar}>
        <InputItem
          className={`am-search-input ${styles.input}`}
          onChange={e => handleChange(e)}
          placeholder={formatMessage({ id: 'trade.spot_order.filter.trade' })}
          clear
        />
        <span className={styles.cancel} onClick={() => router.goBack()}>
          {formatMessage({ id: 'common.cancel' })}
        </span>
      </div>
      {keyWords.length === 0 && (
        <div className={styles.recent}>
          <div className={styles.title}>
            {formatMessage({ id: 'mc_exchange_hot' })}
            <span onClick={() => hotSearchListHideChange()}>
              {hotSearchListHide ? formatMessage({ id: 'ecology.function.open' }) : formatMessage({ id: 'ecology.function.PackUp' })}
            </span>
          </div>
          <div className={hotSearchListHide && styles.hotSearchListHide}>
            {hotSearchList.map((h, index) => {
              const stars = getStars(h.hotLevel);
              const key = h.currencyDisplay || h.currency;
              return (
                <div key={key} className={styles.recentItem} onClick={() => goTrade(h)}>
                  <div className={styles.left}>
                    <div className={styles.rank}>{index < 3 ? <img src={rankMap[index + 1]} alt="交易所" /> : <b>{index + 1}</b>}</div>
                    <span className={styles.itemContent}>{key}</span>
                  </div>
                  {stars && (
                    <div className={styles.right}>
                      {stars.map((s, idx) => (
                        <img key={idx} className={styles.fire} src={s === 'full' ? fire : fireHalf} alt="交易所" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className={styles.title}>{formatMessage({ id: 'trade.title.recent' })}</p>
          {recent.map(currency => (
            <p key={currency} className={styles.recentItem} onClick={() => goTrade(currency.replace('/', '_'))}>
              {currency}
            </p>
          ))}
        </div>
      )}
      {keyWords.length > 0 &&
        filterList().map(item => (
          <p key={`${item.currency}_${item.market}`} className={styles.itemResult} onClick={() => goTrade(item)}>
            <span className={styles.currency}>
              {item.currency}/{item.market}
            </span>
            <span className={styles.price}>{numberToString(item.c)}</span>
            <span className={styles.rate} style={{ color: item.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
              {item.rate >= 0 && '+'}
              {(item.rate * 100).toFixed(2)}%
            </span>
          </p>
        ))}
    </>
  );
};

export default connect(({ global, auth, trading }) => ({
  user: auth.user,
  markets: trading.firstLoadedMarkets,
  hotSearchList: global.hotSearchList
}))(Search);
