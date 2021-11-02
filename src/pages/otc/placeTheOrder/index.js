import React, { useState, createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Link, router } from 'umi';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import phone from '@/assets/img/otc/phone.png';
import msg from '@/assets/img/otc/msg.png';
import BankList from './bankList';
import { getPlaceTheOrder, putUserCancel, userConfirmReceipt } from '@/services/api';
import CountDown from '@/components/CountDown';
import UserFinihPaymentModel from './userFinihPaymentModel';
import { Modal, Toast, Button } from 'antd-mobile';

const locale = getLocale();
const alert = Modal.alert;
function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function PlaceTheOrder(props) {
  const { match, otcuser, allPaymentList } = props;
  let id = match.params.id;
  const [wayToTrade, setWayToTrade] = useState('');
  const [orderInfo, setOrderInfo] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({});
  const [tradingTimeout, setTimeout] = useState(''); //服务器时间
  const [paymentId, setPaymentId] = useState();
  const [payment, setPayment] = useState('');
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [responseTime, setResponseTime] = useState(''); //服务器时间
  const [timeVisible, setTimeVisible] = useState(true);

  useEffect(() => {
    if (id) {
      userOrderInfo();
    }
  }, [id]);
  useInterval(() => {
    userOrderInfo();
  }, 5000);
  const userOrderInfo = async () => {
    const res = await getPlaceTheOrder(id);
    if (res.code === 0) {
      setOrderInfo(res.data);
      if (res.data.paymentInfo.length > 0) {
        let data = JSON.parse(sessionStorage.getItem('activeId'));
        if (data) {
          var some = res.data.paymentInfo.some(r => {
            return r.id === data.id;
          });
          if (some === true) {
            setWayToTrade(data.id);
            setPaymentId(data.payMethod);
            setPaymentInfo(data);
            setPayment(data.payMethod);
          } else {
            setWayToTrade(res.data.paymentInfo[0].id);
            setPaymentId(res.data.paymentInfo[0].id);
            setPaymentInfo(res.data.paymentInfo[0]);
            setPayment(res.data.paymentInfo[0].payMethod);
          }
        } else {
          setWayToTrade(res.data.paymentInfo[0].id);
          setPaymentId(res.data.paymentInfo[0].id);
          setPaymentInfo(res.data.paymentInfo[0]);
          setPayment(res.data.paymentInfo[0].payMethod);
        }
        let timestamp = Date.parse(new Date());
        let ordertime = res.responseTime;
        let updateTime = res.data.updateTime;
        setResponseTime(res.responseTime);
        //  setTradingAwaitTime(updateTime - timestamp);
        setTimeout(ordertime - timestamp);
      }
    }
  };
  const userCancelOrder = async () => {
    let params = {
      orderDealId: id
    };
    const res = await putUserCancel(params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'otc.payment.clearOrder' }), 1);
      userOrderInfo();
    }
  };

  const tabChangeType = item => {
    let data = JSON.stringify(item);
    sessionStorage.setItem('activeId', data);
    setWayToTrade(item.id);
    setPaymentInfo(item);
  };

  const paymentList = payment => {
    return payment.map(item => {
      return (
        <div
          key={item.id}
          className={classNames([item.id == wayToTrade ? styles.tabActive : '', styles.payMethodBtn])}
          onClick={() => {
            tabChangeType(item);
          }}
        >
          {fiatPaymentType(item.payMethod)}
        </div>
      );
    });
  };
  const fiatPaymentType = pay => {
    let iconUrl = '';
    let payIcon = allPaymentList.find(item => item.id == pay);
    if (payIcon) {
      iconUrl = <>{locale.startsWith('zh') ? payIcon.nameCn : payIcon.nameEn}</>;
    }
    return iconUrl;
  };
  const userFinihPayment = () => {
    setCurrencyVisible(true);
  };
  const fiatOrderType = val => {
    const orderTypeMaps = {
      1: formatMessage({ id: 'otc.orderState.one' }),
      2: formatMessage({ id: 'otc.orderState.two' }),
      3: formatMessage({ id: 'otc.orderState.three' }),
      4: formatMessage({ id: 'otc.orderState.four' }),
      5: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      6: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      7: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      8: formatMessage({ id: 'otc.orderState.eight' }),
      9: formatMessage({ id: 'otc.orderState.eight' }),
      0: formatMessage({ id: 'otc.orderState.ten' }),
      13: formatMessage({ id: 'mc_otc_trading_paymentFinish' })
    };
    return orderTypeMaps[val];
  };
  // 用户卖币,点击放行
  const userSellConfirmReceipt = async id => {
    let data = {
      orderDealId: id
    };
    const res = await userConfirmReceipt(data);
    if (res.code === 0) {
      userOrderInfo();
    }
  };
  const buyClearOrder = () => {};
  const tradingTypeBtn = val => {
    let text = '';
    switch (val) {
      case 0:
        text = (
          <div className={styles.footerBtn}>
            <div
              className={styles.clearBtn}
              onClick={() =>
                alert(formatMessage({ id: 'otc.order.clear' }), formatMessage({ id: 'otc.order.clearPrompntOne' }), [
                  { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                  { text: formatMessage({ id: 'common.sure' }), onPress: () => userCancelOrder() }
                ])
              }
            >
              {formatMessage({ id: 'otc.order.clear' })}
            </div>
            <div className={styles.WaitForTheRelease} onClick={() => userFinihPayment()}>
              {formatMessage({ id: 'otc.order.statecomplete' })}
            </div>
          </div>
        );
        break;
      case 1:
        text = (
          <div className={styles.footerBtn}>
            <Button
              disabled={orderInfo.complained === true || responseTime > orderInfo.appealableTime ? false : true}
              className={classNames([styles.appealFooterBtn, responseTime > orderInfo.appealableTime && styles.clearAppealBtn])}
              onClick={() => router.push(`/otc/appeal?id=${orderInfo.id}&type=${orderInfo.complained}`)}
            >
              {formatMessage({ id: 'otc.order.appeal' })}
            </Button>
            {orderInfo.tradeType === 0 ? (
              <div
                className={styles.awaitRelease}
                onClick={() =>
                  alert(formatMessage({ id: 'otc.order.clear' }), formatMessage({ id: 'otc.order.clearPrompntOne' }), [
                    { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                    { text: formatMessage({ id: 'common.sure' }), onPress: () => userCancelOrder() }
                  ])
                }
              >
                {formatMessage({ id: 'otc.order.clear' })}
              </div>
            ) : (
              <div
                className={styles.awaitRelease}
                onClick={() =>
                  alert(formatMessage({ id: 'mc_otc_trading_completed_ask_ok' }), formatMessage({ id: 'mc_otc_trading_completed_ask' }), [
                    { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                    { text: formatMessage({ id: 'common.sure' }), onPress: () => userSellConfirmReceipt(orderInfo.id) }
                  ])
                }
              >
                {formatMessage({ id: 'mc_otc_trading_completed_ask_ok' })}
              </div>
            )}
          </div>
        );
        break;
      case 2:
        text = (
          <div className={styles.footerBtn}>
            <div
              className={styles.sellClearBtn}
              onClick={() =>
                alert(formatMessage({ id: 'otc.order.clear' }), formatMessage({ id: 'otc.order.clearPrompntOne' }), [
                  { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                  { text: formatMessage({ id: 'common.sure' }), onPress: () => userCancelOrder() }
                ])
              }
            >
              {formatMessage({ id: 'otc.order.clear' })}
            </div>
          </div>
        );
        break;
      default:
        text = '';
    }
    return text;
  };
  if (!orderInfo) {
    return '';
  }

  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.orderState.payment' })}</TopBar>
      <div className={styles.orderContent}>
        <div className={styles.orderHeader}>
          <div className={styles.headerLeft}>
            <span>{orderInfo.tradeType === 1 && orderInfo.state === 1 ? fiatOrderType(13) : fiatOrderType(orderInfo.state)}</span>

            <span className={styles.headerTime}>
              {orderInfo.state === 0 || orderInfo.state === 2 || orderInfo.state === 3 ? (
                <CountDown
                  timeDiff={tradingTimeout}
                  stateText={''}
                  endTime={orderInfo.expirationTime}
                  callBack={() => {
                    setTimeVisible(false);
                  }}
                />
              ) : (
                ''
              )}
              {orderInfo.tradeType === 0 && orderInfo.state === 1 && timeVisible == true ? (
                <CountDown
                  timeDiff={tradingTimeout}
                  stateText={''}
                  endTime={orderInfo.appealableTime}
                  callBack={() => {
                    setTimeVisible(false);
                  }}
                />
              ) : (
                ''
              )}
            </span>
            {orderInfo.tradeType === 1 && orderInfo.state === 1 && responseTime < orderInfo.appealableTime ? (
              <p className={styles.timeColor}>
                {formatMessage({ id: 'mc_otc_appeal_predict' })}
                <span className={styles.time}>
                  <CountDown timeDiff={tradingTimeout} stateText={''} endTime={orderInfo.appealableTime} />
                </span>
                {formatMessage({ id: 'mc_otc_appeal_assets' })}
              </p>
            ) : (
              ''
            )}
            {orderInfo.state === 1 && responseTime > orderInfo.expirationTime && (
              <p className={styles.appealPrompnt}>{formatMessage({ id: 'mc_otc_trading_notcoin' })}</p>
            )}
            <></>
          </div>
          <div className={styles.headerRight}>
            {orderInfo && orderInfo.merchantInfo.mobile && (
              <span>
                <a href={`tel:${orderInfo.merchantInfo.mobile}`}>
                  <img src={phone} />
                </a>
              </span>
            )}
            <span
              onClick={() => {
                router.push(`/otc/chat?id=${id}`);
              }}
            >
              <a>
                <img src={msg} />
              </a>
            </span>
          </div>
        </div>
        {orderInfo.state === 0 ? <div className={styles.headerPrompnt}>{formatMessage({ id: 'otc.orderState.timeout' })}</div> : ''}

        <div className={styles.headerTopContent}>
          <div className={styles.headerTradingInfo}>
            <span>{formatMessage({ id: 'otc.quick.sum' })}</span>
            <span>{formatMessage({ id: 'container.Theunit.price' })}</span>
            <span>{formatMessage({ id: 'otc.quick.tradingNumber' })}</span>
          </div>
          <div className={styles.headerRightTradingInfo}>
            <span>
              {orderInfo.amount} {orderInfo.currency}
            </span>
            <span>
              {orderInfo.price} {orderInfo.currency}
            </span>
            <span>
              {orderInfo.quantity} {orderInfo.coinName}
            </span>
          </div>
        </div>
        {orderInfo.state === 0 || orderInfo.state === 1 || orderInfo.state === 2 || orderInfo.state === 3 ? (
          <>
            <div className={styles.orderPaymentUserName}>
              <div className={styles.orderPaymentTitle}>{formatMessage({ id: 'otc.order.payment' })}</div>
              <div className={styles.orderPaymentUser}>
                <p>
                  {formatMessage({ id: 'otc.order.paymentPrompntuser' })}
                  <span className={styles.userColor}>({otcuser.realName})</span>

                  {formatMessage({ id: 'otc.order.paymentPrompnt' })}
                </p>
              </div>
            </div>
            <div className={styles.orderPaymentContent}>{paymentList(orderInfo.paymentInfo)}</div>
            <div className={styles.transferPrompt}>{formatMessage({ id: 'otc.order.bankPrompnt' })}</div>
            <BankList orderInfo={orderInfo} paymentInfo={paymentInfo} />
          </>
        ) : (
          ''
        )}
        <div className={styles.footerBtnContent}>{tradingTypeBtn(orderInfo.state)}</div>
        <div style={{ height: 50 }}></div>
      </div>

      <UserFinihPaymentModel
        orderInfo={orderInfo}
        setCurrencyVisible={setCurrencyVisible}
        currencyVisible={currencyVisible}
        paymentId={paymentId}
        setPaymentId={setPaymentId}
        payment={payment}
        setPayment={setPayment}
        userOrderInfo={userOrderInfo}
      />
      {/* {orderInfo.state !== 0 && orderInfo.state !== 1 && orderInfo.state !== 2 && orderInfo.state !== 3 && (
        <div
          className={styles.appealBtn}
          onClick={() => {
            router.push(`/otc/appeal?id=${orderInfo.id}&type=${orderInfo.complained}`);
          }}
        >
          <div> {formatMessage({ id: 'otc.order.appeal' })}</div>
        </div>
      )} */}
      {(orderInfo.state === 4 && orderInfo.complained === true) ||
      orderInfo.state === 5 ||
      orderInfo.state === 8 ||
      orderInfo.state === 7 ||
      orderInfo.state === 6 ? (
        <div
          className={styles.appealBtn}
          onClick={() => {
            router.push(`/otc/appeal?id=${orderInfo.id}&type=${orderInfo.complained}`);
          }}
        >
          <div> {formatMessage({ id: 'otc.order.appeal' })}</div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  allPaymentList: otc.allPaymentList,
  otcuser: otc.otcuser
}))(PlaceTheOrder);
