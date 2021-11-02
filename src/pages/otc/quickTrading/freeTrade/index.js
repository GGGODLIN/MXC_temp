import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { formatMessage } from 'umi-plugin-locale';
import AdvertisingList from './advertisingList';
import router from 'umi/router';
function FreeTrade(props) {
  const { currency, coinActive, tabActiveType, userAsstes, tradingOffer, refreshing, advertising, otcuser } = props;
  useEffect(() => {}, []);

  const entrustOrderBtn = () => {
    if (otcuser.account) {
      router.push('/otc/entrustOrder');
    } else {
      router.push('/auth/signin');
    }
  };
  return (
    <div className={styles.freeTradeContent}>
      <div className={styles.headerTab}>
        <div>{formatMessage({ id: 'otc.title.optional' })}</div>

        {/* <div
          className={styles.rightOrderBtn}
          onClick={() => {
            entrustOrderBtn();
          }}
        >
          <i className="iconfont iconweituogd"></i>
          {formatMessage({ id: 'otc.trading.entrust' })}
        </div> */}
      </div>
      <AdvertisingList
        currency={currency}
        coinActive={coinActive}
        tabActiveType={tabActiveType}
        userAsstes={userAsstes}
        tradingOffer={tradingOffer}
        refreshing={refreshing}
        advertising={advertising}
      />
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  otcuser: otc.otcuser
}))(FreeTrade);
