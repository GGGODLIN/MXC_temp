import React, { useCallback, useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import cs from 'classnames';
import styles from './MarginMode.less';
import { formatMessage } from 'umi-plugin-locale';
import { newmarginToggleMode } from '@/services/api';
import { Toast, Modal } from 'antd-mobile';
import { gotoLogin } from '@/utils';

const MarginMode = ({ dispatch, currency, market, user, account, accounts, openAccounts }) => {
  const [showMask, setShowMask] = useState(false);
  const accountModel = accounts.find(i => i.symbol === `${currency}_${market}`) || {};
  const toggleMode = tradeMode => {
    const { currencyAsset, marketAsset } = account;
    const borrow = Number(marketAsset.borrow) + Number(currencyAsset.borrow) > 0;
    if (!user.id) {
      return gotoLogin();
    }
    if (!openAccounts.some(i => i === `${currency}/${market}`)) {
      return Toast.info(formatMessage({ id: 'margin.title.pleace_trans' }));
    }
    if (borrow) {
      return Toast.info(formatMessage({ id: 'margin.title.auto_toggle' }));
    }
    newmarginToggleMode({
      accountType: 'STEP',
      symbol: `${currency}_${market}`,
      tradeMode: tradeMode
    }).then(res => {
      dispatch({
        type: 'margin/getMarginAccounts'
      });
    });
  };

  useEffect(() => {
    if (user.id) {
      dispatch({
        type: 'margin/getMarginAccounts'
      });
    }
  }, [user]);

  const toggle = () => {
    setShowMask(!showMask);
  };

  const MarginTradeModeTip = () => {
    Modal.alert(
      null,
      <div style={{ textAlign: 'left' }}>
        <h3>{formatMessage({ id: 'margin.title.auto_mode_normal2' })}</h3>
        <p>{formatMessage({ id: 'margin.title.auto_mode_normal3' })}</p>
        <h3>{formatMessage({ id: 'margin.title.auto_mode__auto2' })}</h3>
        <p>{formatMessage({ id: 'margin.title.auto_mode__auto3' })}</p>
      </div>
    );
  };

  return (
    <div className={cs('m-b-10', styles.modeWrapper)}>
      <span onClick={MarginTradeModeTip}>{formatMessage({ id: 'margin.title.auto_mode' })}</span>
      <div className={styles.modeSelect}>
        {showMask && <div className={styles.modeMask} onClick={toggle}></div>}
        <div className={styles.modeBox} onClick={toggle}>
          {formatMessage({ id: accountModel.tradeMode === 'NORMAL' ? 'margin.title.auto_mode_normal2' : 'margin.title.auto_mode__auto2' })}
          <i className="iconfont icondropdown"></i>
          {showMask && (
            <div className={styles.optionsBox}>
              <p
                className={accountModel.tradeMode === 'NORMAL' || !accountModel.tradeMode ? styles.active : ''}
                onClick={() => toggleMode('NORMAL')}
              >
                {formatMessage({ id: 'margin.title.auto_mode_normal2' })}
              </p>
              <p className={accountModel.tradeMode === 'AUTO' && styles.active} onClick={() => toggleMode('AUTO')}>
                {formatMessage({ id: 'margin.title.auto_mode__auto2' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(({ auth, margin }) => {
  const pair = margin.currentPair;
  return {
    market: pair.market,
    currency: pair.currency,
    user: auth.user,
    account: margin.account,
    accounts: margin.accounts,
    openAccounts: margin.openAccounts
  };
})(MarginMode);
