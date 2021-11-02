import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { Tabs } from 'antd-mobile';
import { getMarketCoins } from '@/services/api';
import router from 'umi/router';
function QuickTrading(props) {
  const { coinActive, setCoinActive, otcuser, user, dispatch } = props;
  const [coinList, setCoinList] = useState([]);
  useEffect(() => {
    getTradingCoin();
  }, []);
  useEffect(() => {
    if (user.id) {
      dispatch({
        type: 'otc/otcUserInfo'
      });
    }
  }, []);
  const getTradingCoin = async () => {
    const res = await getMarketCoins();
    if (res.code === 0) {
      let dataList = [];
      res.data.forEach(data => {
        dataList.push({
          title: data.coinName,
          sub: data.coinName
        });
      });
      setCoinActive(res.data[0].coinName);
      setCoinList(dataList || []);
    }
  };
  return (
    <div>
      <div className={styles.headerTab}>
        <Tabs
          tabs={coinList}
          tabBarBackgroundColor={'transparent'}
          swipeable={false}
          onTabClick={(tab, index) => {
            setCoinActive(tab.title);
          }}
        ></Tabs>
        {otcuser.kycLevel > 0 && otcuser.setPaymentInfo === true ? (
          ''
        ) : (
          <div className={styles.userTypeContent}>
            <div>
              <span className={styles.userCertification} onClick={() => router.push('/ucenter/id-auth')}>
                {formatMessage({ id: 'otc.order.autonym' })}
                {otcuser.kycLevel > 0 ? <i className="iconfont iconxingzhuang"></i> : <i className="iconfont iconic_back"></i>}
                <i className="iconfont iconziyuan"></i>
              </span>
              <span></span>
            </div>
            <div>
              <span className={styles.setBank} onClick={() => router.push('/otc/paymentMethods')}>
                {formatMessage({ id: 'otc.order.setPayment' })}
                {otcuser.setPaymentInfo === true ? <i className="iconfont iconxingzhuang"></i> : <i className="iconfont iconic_back"></i>}
              </span>
            </div>
            <div>
              <span className={styles.linePoint}>
                <i className="iconfont iconziyuan"></i>
              </span>
              <span className={styles.startTrading}>{formatMessage({ id: 'otc.order.Starttrading' })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  otcuser: otc.otcuser
}))(QuickTrading);
