import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, getSubSite } from '@/utils';

import styles from './MarginCoinList.less';

const markSymbol = '*****';

const CoinList = ({ list, eyes, type }) => {
  const toDetail = coin => {
    if (type === 'main') {
      router.push(`/uassets/detail?coin=${coin}`);
    } else if (type === 'margin') {
      router.push(`/uassets/margin-detail?coin=${coin}`);
    }
  };

  return (
    <div className={styles.list}>
      {list.map(item => {
        const currencyName = item.currencyAsset.name || item.accountName.split('_')[0];
        const marketName = item.marketAsset.name || item.accountName.split('_')[1];

        return (
          <div className={styles.item} key={item.accountName} onClick={() => toDetail(`${currencyName}_${marketName}`)}>
            <div className={styles.head}>
              <div className={styles.coin}>
                {currencyName}/{marketName}
              </div>
              <div className={styles.burst}>
                {eyes ? (
                  <>
                    <span>{formatMessage({ id: 'margin.title.break_price' })}</span> {item.stopOutPrice}{' '}
                    <i className="iconfont iconic_back"></i>
                  </>
                ) : (
                  markSymbol
                )}
              </div>
            </div>
            <div className={styles.body}>
              <div>
                <p className={styles.tit}>{formatMessage({ id: 'assets.coin' })}</p>
                <p>{currencyName}</p>
                <p>{marketName}</p>
              </div>
              <div>
                <p className={styles.tit}>{formatMessage({ id: 'trade.spot.action.available' })}</p>
                <p>{eyes ? cutFloatDecimal(item.currencyAsset.available, 8) : markSymbol}</p>
                <p>{eyes ? cutFloatDecimal(item.marketAsset.available, 8) : markSymbol}</p>
              </div>
              <div>
                <p className={styles.tit}>{formatMessage({ id: 'container.freeze' })}</p>
                <p>{eyes ? cutFloatDecimal(item.currencyAsset.frozen, 8) : markSymbol}</p>
                <p>{eyes ? cutFloatDecimal(item.marketAsset.frozen, 8) : markSymbol}</p>
              </div>
              <div>
                <p className={styles.tit}>{formatMessage({ id: 'assets.margin.loan.title' })}</p>
                <p>{eyes ? cutFloatDecimal(item.currencyAsset.borrow, 8) : markSymbol}</p>
                <p>{eyes ? cutFloatDecimal(item.marketAsset.borrow, 8) : markSymbol}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoinList;
