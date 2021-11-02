import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { numberToString, getSubSite, cutFloatDecimal } from '@/utils';

import styles from './CoinList.less';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const ContractCoinList = ({ list, eyes }) => {
  return (
    <div className={styles.list}>
      <div className={styles.head}>
        <span>{formatMessage({ id: 'assets.coin' })}</span>
        <span>{formatMessage({ id: 'container.freeze' })}</span>
        <span>{formatMessage({ id: 'assets.balances.Useable' })}</span>
      </div>
      {list.map(item => (
        <div className={styles.item} key={item.id}>
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

export default ContractCoinList;
