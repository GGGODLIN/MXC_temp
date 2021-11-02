import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { numberToString, cutFloatDecimal } from '@/utils';

import styles from './CoinList.less';

const CoinList = ({ list, eyes, type }) => {
  const toDetail = coin => {
    type === 'main' && router.push(`/uassets/detail?coin=${coin}`);
  };

  return (
    <div className={styles.list}>
      <div className={styles.head}>
        <span>{formatMessage({ id: 'assets.coin' })}</span>
        <span>{formatMessage({ id: 'container.freeze' })}</span>
        <span>{formatMessage({ id: 'assets.balances.Useable' })}</span>
      </div>
      {list.map(item => (
        <div className={styles.item} key={item.id} onClick={() => toDetail(item.currency)}>
          <div className={styles.name}>{item.currency}</div>
          <div className={styles.frozen}>
            <p>{eyes ? numberToString(item.frozen) : '*****'}</p>
            <label>≈ {eyes ? cutFloatDecimal(item.usdtFrozen, 2) : '*****'} USDT</label>
          </div>
          <div className={styles.balance}>
            <p>{eyes ? numberToString(item.available) : '*****'}</p>
            <label>≈ {eyes ? cutFloatDecimal(item.usdtAvailable, 2) : '*****'} USDT</label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoinList;
