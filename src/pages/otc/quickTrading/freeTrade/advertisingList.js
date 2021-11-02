import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './advertisingList.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import certification from '@/assets/img/otc/certification.png';
import TradeOrderModel from './tradeOrderModel';
import { getMarketList } from '@/services/api';
import Empty from '@/components/Empty';
import { getSubSite, numberFormat, numbervalAccuracy } from '@/utils';
import router from 'umi/router';
const lang = getLocale();
function AdvertisingList(props) {
  const { currency, coinActive, tabActiveType, payPrecision, userAsstes, tradingOffer, otcuser, allPaymentList, advertising } = props;
  const [tradeOrderVisible, setTradeOrderVisible] = useState(false);
  const [advertisingInfo, setAdvertisingInfo] = useState({});
  const tradingClick = () => {
    setTradeOrderVisible(true);
  };
  const paymentTooltip = item => {
    const paymentMaps = {
      1: (
        <span>
          {' '}
          <i className="iconfont iconPX-yinhang"></i>
        </span>
      ),
      2: (
        <span>
          <i className="iconfont iconPX-zhifubao"></i>
        </span>
      ),
      3: (
        <span>
          <i className="iconfont iconPX-weixin"></i>
        </span>
      )
    };
    return paymentMaps[item];
  };
  const fiatPaymentType = pay => {
    let iconUrl = '';
    let payIcon = allPaymentList.find(item => item.id == pay);
    if (payIcon) {
      iconUrl = (
        <>
          <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
        </>
      );
    }
    return iconUrl;
  };

  const paymentIcon = record => {
    let paymentInfo = record.payMethod;
    var result = paymentInfo.split(',');
    return result.map(item => {
      return (
        <span key={item} className={styles.payMethodContent}>
          {fiatPaymentType(item)}
        </span>
      );
    });
  };
  const tradingState = record => {
    let text = '';
    if (record.requireMobile === true && !otcuser.mobile) {
      text = (
        <div
          className={styles.needTradingContent}
          onClick={() => {
            router.push(`/ucenter/security`);
          }}
        >
          {formatMessage({ id: 'mc_otc_trading_Need' })}

          {formatMessage({ id: 'securecheck.bind.phone' })}
        </div>
      );
    } else if (otcuser.kycLevel < record.kycLevel && record.kycLevel === 1) {
      text = (
        <div
          className={styles.needTradingContent}
          onClick={() => {
            router.push(`/ucenter/id-auth-result`);
          }}
        >
          {formatMessage({ id: 'mc_otc_trading_Need' })}
          {formatMessage({ id: 'ucenter.index.level.low' })}
        </div>
      );
    } else if (otcuser.kycLevel < record.kycLevel && record.kycLevel === 2) {
      text = (
        <div
          className={styles.needTradingContent}
          onClick={() => {
            router.push(`/ucenter/id-auth-result`);
          }}
        >
          {formatMessage({ id: 'mc_otc_trading_Need' })}
          {formatMessage({ id: 'ucenter.index.level.high' })}
          <i className="iconfont iconic_back"></i>
        </div>
      );
    } else {
      text = (
        <div
          className={styles.listTradingBtn}
          onClick={() => {
            setAdvertisingInfo(record);
            tradingClick();
          }}
        >
          {tabActiveType === 'BUY' ? formatMessage({ id: 'assets.discount.wraning.buy' }) : formatMessage({ id: 'otc.quick.sell' })}
        </div>
      );
    }
    return text;
  };

  const tradingAdvertising = () => {
    return advertising.map(item => {
      return (
        <div className={styles.listConten} key={item.id}>
          <div className={styles.listInfo}>
            <div
              className={styles.listName}
              onClick={() => {
                router.push(`/otc/merchants?id=${item.merchant.uid}`);
              }}
            >
              {item.merchant.nickName}
              <img src={certification} />
              {item.merchant.greenDiamond === true && <i className="iconfont iconic_GreenDiamond"></i>}
            </div>
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
            <div className={styles.listPayment}>{paymentIcon(item)}</div>
          </div>
          <div className={styles.listBtn}>
            <div className={styles.listVolume}>
              <span> </span>
              <span> </span>
            </div>
            <div className={styles.listPrice}>
              {formatMessage({ id: 'container.Theunit.price' })}({currency})
            </div>
            <div className={styles.listNumber}>{numbervalAccuracy(item.price, payPrecision.scale)}</div>

            {otcuser.account ? (
              <>
                {tradingState(item)}
                {/* <div
                  className={styles.listTradingBtn}
                  onClick={() => {
                    setAdvertisingInfo(item);
                    tradingClick();
                  }}
                >
                  {tabActiveType === 'BUY' ? formatMessage({ id: 'assets.discount.wraning.buy' }) : formatMessage({ id: 'otc.quick.sell' })}
                </div> */}
              </>
            ) : (
              <div className={styles.listTradingBtn}>{formatMessage({ id: 'act.btn.loginname' })}</div>
            )}
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
      {advertising && advertising.length > 0 ? tradingAdvertising() : <Empty />}
      {lang !== 'zh-CN' && (
        <div
          className={styles.creditCardContent}
          onClick={() => {
            router.push('/otc/creditCard');
          }}
        >
          {formatMessage({ id: 'mc_otc_creditCard_btn' })}
        </div>
      )}
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  allPaymentList: otc.allPaymentList,
  payPrecision: otc.payPrecision,
  otcuser: otc.otcuser
}))(AdvertisingList);
