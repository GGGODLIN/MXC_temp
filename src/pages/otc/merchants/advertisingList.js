import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './advertisingList.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import certification from '@/assets/img/otc/certification.png';
import TradeOrderModel from '@/pages/otc/quickTrading/freeTrade/tradeOrderModel.js';
import { getMarketList, getOtcAssets, getQuickOrderInfo } from '@/services/api';
import Item from 'antd-mobile/lib/popover/Item';
import { getSubSite, numberFormat, numbervalAccuracy } from '@/utils';
function AdvertisingList(props) {
  const { currency, coinActive, tabActiveType, payPrecision, merchantOrderInfo, allPaymentList, currencyActive, dispatch } = props;
  const [page, setPage] = useState({});
  const [advertising, setAdvertising] = useState([]);
  const [tradeOrderVisible, setTradeOrderVisible] = useState(false);
  const [advertisingInfo, setAdvertisingInfo] = useState({});
  const [userAsstes, setUserAsstes] = useState({});
  const [tradingOffer, setTradingOffer] = useState({});

  useEffect(() => {
    if (currencyActive) {
      dispatch({
        type: 'otc/paycurrencyPrecision',
        payload: {
          Currency: currencyActive
        }
      });
    }
  }, [currencyActive]);
  useEffect(() => {
    if (currencyActive && tabActiveType && coinActive) {
      marketInfo();
    }
  }, [currencyActive, tabActiveType, coinActive]);
  useEffect(() => {
    if (currencyActive && advertisingInfo.coinName) {
      getAsstes();
    }
  }, [advertisingInfo]);
  const getAsstes = async () => {
    const res = await getOtcAssets(advertisingInfo.coinName);
    if (res.code === 0) {
      if (res.data) {
        setUserAsstes(res.data);
      }
    }
  };
  const tradingBtnClick = async item => {
    await setAdvertisingInfo(item);
    await getMarketPriceInfo(item);
    await tradingClick();
  };
  const getMarketPriceInfo = async item => {
    let params = {
      currency: currencyActive,
      coinName: item.coinName
    };
    const res = await getQuickOrderInfo(params);
    if (res.code === 0) {
      setTradingOffer(res.data.m);
    }
  };
  const tradingClick = () => {
    setTradeOrderVisible(true);
  };
  const marketInfo = async () => {
    let params = {
      currency: currency,
      tradeType: tabActiveType === 'BUY' ? 'SELL' : 'BUY',
      coinName: coinActive,
      payMethod: '', //支付方式待定
      page: 1
    };
    const res = await getMarketList(params);
    if (res.code === 0) {
      setPage(res.page || []);
      setAdvertising(res.data || {});
    }
  };

  const fiatPaymentType = pay => {
    var result = pay.split(',').sort();
    return result.map(res => {
      let payIcon = allPaymentList.find(item => item.id == res);
      return (
        <>
          <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
        </>
      );
    });
  };
  const tradingAdvertising = () => {
    return merchantOrderInfo.map(item => {
      return (
        <div className={styles.listConten} key={item.id}>
          <div className={styles.listInfo}>
            <div className={styles.listName}>{item.coinName}</div>
            <div className={styles.listAmount}>
              <span>{formatMessage({ id: 'assets.treaty.history.number' })}</span>
              <span>{item.availableQuantity}</span>
            </div>
            <div className={styles.listLimit}>
              {formatMessage({ id: 'otc.quick.limit' })}
              <span>{numberFormat(item.minTradeLimit)}</span>
              <span>-</span>
              <span>{numberFormat(item.maxTradeLimit)}</span>
            </div>
            <div className={styles.listPayment}>{fiatPaymentType(item.payMethod)}</div>
          </div>
          <div className={styles.listBtn}>
            <div className={styles.listVolume}>
              {/* <span>{Number(merchantInfo.merchantStatistics.totalBuyCount) + Number(merchantInfo.merchantStatistics.totalSellCount)}</span>
              <span>|</span>
              <span>{parseInt(Number(merchantInfo.merchantStatistics.completeRate) * 100)}%</span> */}
            </div>
            <div className={styles.listPrice}>
              {formatMessage({ id: 'container.Theunit.price' })}({currency})
            </div>
            <div className={styles.listNumber}>{numbervalAccuracy(item.price, 2)}</div>

            <div
              className={styles.listTradingBtn}
              onClick={() => {
                tradingBtnClick(item);
              }}
            >
              {tabActiveType === 'SELL' ? formatMessage({ id: 'otc.quick.sell' }) : formatMessage({ id: 'assets.discount.wraning.buy' })}
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <div>
      <TradeOrderModel
        tradeOrderVisible={tradeOrderVisible}
        setTradeOrderVisible={setTradeOrderVisible}
        advertisingInfo={advertisingInfo}
        currency={currency}
        userAsstes={userAsstes}
        coinActive={coinActive}
        tabActiveType={tabActiveType}
        tradingOffer={tradingOffer}
      />
      {merchantOrderInfo.length > 0 ? tradingAdvertising() : ''}
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  allPaymentList: otc.allPaymentList,
  payPrecision: otc.payPrecision,
  currencyActive: otc.currencyActive
}))(AdvertisingList);
