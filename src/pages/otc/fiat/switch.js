import React, { useReducer } from 'react';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { createForm } from 'rc-form';
import styles from './switch.less';
import Switchbuy from './switchbuy.js';
const initialState = {
  usdtRateInfo: {},
  buyshow: true,
  tradeType: 0,
  switchBtnName: formatMessage({ id: 'otcfiat.trading.buy' }),
  buybtnshow: true
};
function reducer(state, action) {
  return { ...state, ...action };
}
const buyupdate = {
  buyshow: true,
  switchBtnName: formatMessage({ id: 'otcfiat.trading.buy' }),
  buybtnshow: true,
  tradeType: 0
};
const sellupdate = {
  buyshow: false,
  switchBtnName: formatMessage({ id: 'otcfiat.trading.sell' }),
  buybtnshow: true,
  tradeType: 1
};
function SwitchHook() {
  const [state, setState] = useReducer(reducer, initialState);
  return (
    <>
      <div className={styles.centernswitch}>
        <div className={styles.switchContent}>
          <div
            className={classNames([styles.switchbtn, state.buyshow ? styles.switchbtntwo : ''])}
            onClick={() => setState({ ...buyupdate })}
          >
            {formatMessage({ id: 'trade.box.buy' })}
          </div>
          <div
            className={classNames([styles.switchbtn, state.buyshow === false ? styles.switchbtnbuy : ''])}
            onClick={() => setState({ ...sellupdate })}
          >
            {formatMessage({ id: 'trade.box.sell' })}
          </div>
        </div>
        <Switchbuy value={state} />
      </div>
    </>
  );
}
export default createForm()(SwitchHook);
