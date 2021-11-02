import { useEffect, useState } from 'react';
import { getAssetBalance } from '@/services/api';
import { formatMessage } from 'umi/locale';
import { numberToString } from '@/utils';
import styles from './Hold.less';

export default function Container({ info }) {
  const [mainData, setMainData] = useState(0);
  const currency = info.settleCurrency || '';

  useEffect(() => {
    if (currency) {
      getMain(currency);
    }
  }, [currency]);

  const getMain = async currency => {
    const res = await getAssetBalance({ currency });
    const { balances, code } = res;

    if (code === 0) {
      setMainData(numberToString(balances[currency].available));
    }
  };

  return (
    <div className={styles.hold}>
      <div className={styles.head}>{formatMessage({ id: 'mc_launchpads_total' })}</div>
      <div className={styles.item}>
        <span>{formatMessage({ id: 'mc_launchpads_detail_available' }, { coin: currency })}</span>
        <span>
          {mainData} {currency}
        </span>
      </div>
      <div className={styles.item}>
        <span>{formatMessage({ id: 'mc_launchpads_detail_day' }, { coin: currency })}</span>
        <span>
          {info.snapPosition === null ? '--' : numberToString(info.snapPosition)} {currency}
        </span>
      </div>
    </div>
  );
}
