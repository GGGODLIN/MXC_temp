import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import certification from '@/assets/img/otc/certification.png';
import AdvertisingList from './advertisingList';
import { getMarketInfo } from '@/services/api';

function QuickTrading(props) {
  const { location, otcuser } = props;
  let id = location.query.id;
  const [bankVisible, setBankVisible] = useState(true);
  const [tabActive, setTabActive] = useState('BUY');
  const [currency, setCurrency] = useState('');
  const [coinActive, setCoinActive] = useState([]);
  const [merchantInfo, setMerchantInfo] = useState();
  const [merchantOrderInfo, setMerchantOrderInfo] = useState([]);
  useEffect(() => {
    if (id) {
      getCurrency();
    }
  }, [id]);
  const getCurrency = async () => {
    const res = await getMarketInfo(id);
    if (res.code === 0) {
      setMerchantInfo(res.data);
      let buyData = res.data.orders.filter(item => item.tradeType === 1);

      setMerchantOrderInfo(buyData);
    }
  };

  const buyTypeClick = () => {
    setTabActive('BUY');
    let buyData = merchantInfo.orders.filter(item => item.tradeType === 1);
    setMerchantOrderInfo(buyData);
  };
  const sellTypeClick = () => {
    setTabActive('SELL');
    let sellData = merchantInfo.orders.filter(item => item.tradeType === 0);
    setMerchantOrderInfo(sellData);
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'container.Business.information' })}</TopBar>
      <div className={styles.merchantContent}>
        <div className={styles.merchantName}>
          <div className={classNames(styles.merchantsheader, styles.zero)}>
            <em className={styles.name}>{merchantInfo ? merchantInfo.merchant.nickName.substr(merchantInfo.merchant.nickName, 1) : ''}</em>
            <div className={styles.onlineicon}>
              <span className={styles.onlinestatus}></span>
            </div>
          </div>
          <span className={styles.merchantNameColor}>{merchantInfo ? merchantInfo.merchant.nickName : ''}</span>
          <span>
            <img src={certification} />
          </span>
        </div>
        <div className={styles.merchantOrderTop}>
          <div className={styles.merchantOrderInfo}>
            <div className={styles.merchantOrder}>
              <span>{formatMessage({ id: 'otc.merchant.allorder' })}:</span>
              <span>
                {merchantInfo
                  ? Number(merchantInfo.merchantStatistics.totalBuyCount) + Number(merchantInfo.merchantStatistics.totalSellCount)
                  : '0'}
              </span>
            </div>
            <div className={styles.merchantOrder}>
              <span>{formatMessage({ id: 'otc.merchant.SingleRate' })}:</span>
              <span>{merchantInfo ? Number(merchantInfo.merchantStatistics.completeRate) * 100 : '0'}%</span>
            </div>
            <div className={styles.merchantOrder}>
              <span>{formatMessage({ id: 'otc.merchant.release' })}:</span>
              <span>{merchantInfo ? merchantInfo.merchantStatistics.avgHandleTime : '0'}</span>
            </div>
          </div>
          <div className={styles.merchantOrderInfo}></div>
        </div>
        <div className={styles.certification}>
          <div>
            <span>
              {formatMessage({ id: 'otc.merchant.email' })}
              <i className="iconfont iconxingzhuang"></i>
            </span>
          </div>
          <div>
            <span>
              {formatMessage({ id: 'otc.merchant.phone' })}
              <i className="iconfont iconxingzhuang"></i>
            </span>
          </div>
          <div>
            <span>
              {formatMessage({ id: 'otc.order.autonym' })}
              <i className="iconfont iconxingzhuang"></i>
            </span>
          </div>
          <div>
            <span>
              {formatMessage({ id: 'ucenter.index.level.high' })}
              <i className="iconfont iconxingzhuang"></i>
            </span>
          </div>
        </div>
        <div className={styles.merchantTrading}>
          <div className={styles.merchantTable}>
            <span className={classNames([tabActive === 'BUY' ? styles.tabActive : ''])} onClick={() => buyTypeClick()}>
              {formatMessage({ id: 'otc.merchant.buy' })}
            </span>

            <span className={classNames([tabActive === 'SELL' ? styles.tabActive : ''])} onClick={() => sellTypeClick()}>
              {formatMessage({ id: 'otc.merchant.sell' })}
            </span>
          </div>

          <AdvertisingList
            currency={currency}
            coinActive={coinActive}
            tabActiveType={tabActive}
            merchantOrderInfo={merchantOrderInfo}
            merchantInfo={merchantInfo}
          />
        </div>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(QuickTrading);
