import { Button } from 'antd-mobile';
import { connect } from 'dva';
import router from 'umi/router';
import { cutFloatDecimal } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';

import styles from './MarginAssets.less';

const lang = getLocale();

const MarginAssets = ({ safety, eyes, cnyPrices }) => {
  const toTransfer = e => {
    router.push(`/uassets/transfer?type=margin`);
  };

  return (
    <div className={styles.assets}>
      <div className={styles.exhibit}>
        <div>
          <p>{formatMessage({ id: 'assets.balances.margin' })}</p>
          <label>{eyes ? cutFloatDecimal(safety.totalAssetQty, 2) || 0 : '*****'}</label>
          <p>
            ≈{' '}
            {eyes
              ? lang.startsWith('zh')
                ? `${safety.totalAssetQty ? (safety.totalAssetQty * (cnyPrices.USDT || 1)).toFixed(2) : 0} CNY`
                : `${cutFloatDecimal(safety.totalAssetQty, 2) || 0} USD`
              : '*****'}
          </p>
        </div>
        <Button type="ghost" size="small" className={'am-button-circle'} onClick={toTransfer}>
          {formatMessage({ id: 'assets.transfer' })}
        </Button>
      </div>
    </div>
  );
};

export default connect(({ margin, trading }) => ({
  safety: margin.safety,
  cnyPrices: trading.cnyPrices
}))(MarginAssets);
