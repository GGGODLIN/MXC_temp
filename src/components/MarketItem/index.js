import Fiat from '@/components/Fiat';
import router from 'umi/router';
import { cutFloatDecimal, numberToString } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';

import styles from './MarketItem.less';

const goTrade = item => {
  router.push(`/trade/spot#${item.currency}_${item.market}`);
};

const MarketItem = ({ item, hasFav, startClick, show }) => {
  const handelClick = e => {
    e.stopPropagation();
    startClick(item);
  };

  return (
    <div className={styles.item} onClick={() => goTrade(item)}>
      <div className={styles.currency}>
        {hasFav && (
          <div className={`${styles.fav} ${item.favorite ? styles.active : ''}`} onClick={e => handelClick(e)}>
            <i className="iconfont iconic_favoriteadded"></i>
          </div>
        )}
        <div>
          <p>
            {show === true ? <div className={styles.coinColor}>{`${item.currency}`}</div> : `${item.currency}`}
            <span className={styles.market}>/{item.market}</span>
            {item.ratio && <b>{item.ratio}X</b>}
            {item.etf === true && <div className={styles.etfShow}>ETF</div>}
          </p>
          {!show && (
            <span>
              {formatMessage({ id: 'queue.list.history_tradedAmount' })}&nbsp;{numberToString(cutFloatDecimal(item.a, item.priceScale))}
            </span>
          )}
        </div>
      </div>
      <div className={styles.price}>
        <p>{numberToString(item.c)}</p>
        <span className={styles.fiat}>
          <Fiat value={item.c} market={item.market}></Fiat>
        </span>
      </div>
      <div className={styles.rate} style={{ backgroundColor: item.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
        {item.rate >= 0 && '+'}
        {(item.rate * 100).toFixed(2)}%
      </div>
    </div>
  );
};

export default MarketItem;
