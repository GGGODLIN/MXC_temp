import { useEffect, useState } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { newMarginStepInfo } from '@/services/api';
import { connect } from 'dva';
import { WingBlank, Picker } from 'antd-mobile';

import styles from './index.less';

const MarginStep = ({ margins = [], location }) => {
  const [symbol, setSymbol] = useState([]);
  const [steps, setSteps] = useState([]);
  const _symbol = location.query.symbol || 'BTC_USDT';

  const getSteps = () => {
    newMarginStepInfo({ symbol: symbol[0] || _symbol }).then(res => {
      if (res.code === 200 && res.data.length > 0) {
        const { thresholds } = res.data[0];
        setSteps([...thresholds]);
      }
    });
  };

  useEffect(() => {
    getSteps();
  }, [symbol]);

  const toggle = e => {
    setSymbol([...e]);
  };
  return (
    <>
      <TopBar>{formatMessage({ id: 'mc_margin_level_sheet' })}</TopBar>
      <WingBlank>
        <p>{formatMessage({ id: 'mc_margin_level_desc' })}</p>
        <div className={styles.select}>
          {formatMessage({ id: 'index.trans.viconto' })}：
          <Picker
            data={margins
              .filter(i => i.enableGradually === 1)
              .map(i => {
                return { label: `${i.baseCurrency}_${i.quoteCurrency}`, value: `${i.baseCurrency}_${i.quoteCurrency}` };
              })}
            onOk={toggle}
            cols={1}
            value={symbol}
          >
            <div>
              {symbol[0] || _symbol}
              <i className={'iconfont icondropdown'}></i>
            </div>
          </Picker>
        </div>
        <div>
          {steps.map(item => (
            <div className={styles.step}>
              <p className={styles.symbol}>
                {symbol[0]} {formatMessage({ id: 'mc_margin_level' })}:{item.curLevel}
              </p>
              <p>
                <span>{formatMessage({ id: 'mc_margin_effect_multiple' })}</span>
                {`${item.ratio}X`}
                <span></span>
              </p>
              <p>
                <span>{formatMessage({ id: 'mc_margin_init_risk_rate' })}</span>
                <span>{item.initialLine}</span>
              </p>
              <p>
                <span>{formatMessage({ id: 'margin.title.strong_line' })}</span>
                <span>{item.stopLine}</span>
              </p>
              <p>
                <span>{formatMessage({ id: 'mc_margin_market_max_borrow' })}</span>
                <span>{item.mmaxBorrow}</span>
              </p>
              <p>
                <span>{formatMessage({ id: 'mc_margin_currency_max_borrow' })}</span>
                <span>{item.cmaxBorrow}</span>
              </p>
            </div>
          ))}
        </div>
      </WingBlank>
    </>
  );
};

export default connect(({ trading }) => ({
  margins: trading.margins
}))(MarginStep);
