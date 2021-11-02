import React, { useState, useMemo, useReducer, createContext, useEffect } from 'react';
import { connect } from 'dva';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { List, InputItem, Button, WingBlank, Toast } from 'antd-mobile';
import styles from './index.less';
import router from 'umi/router';
import { getPushInfo, getMainBalance, getCnyPrice, putdoPush } from '@/services/api';
import Slider from 'rc-slider';
import { getCookie } from '@/utils';
const RcSlider = Slider.createSliderWithTooltip(Slider);

const allNumber = (orderInfo, setCurrencyNumber, setSliderValue, setMoneyval, enough) => {
  const piceVal = Number(orderInfo.quantity) - Number(orderInfo.dealQuantity);
  let available = enough.available;
  if (Number(piceVal) > Number(available)) {
    const valuation = available * orderInfo.price;

    setCurrencyNumber(available);
    setMoneyval(valuation.toFixed(5));
  } else {
    setCurrencyNumber(piceVal);
    const valuation = piceVal * orderInfo.price;
    setMoneyval(valuation.toFixed(5));
  }
  setSliderValue(100);
};
const doPush = async (orderInfo, currencyNumber, setCurrencyNumber, setSliderValue, setMoneyval, pushInfo, setEnough) => {
  let params = {
    orderId: orderInfo.id,
    quantity: currencyNumber
  };
  const res = await putdoPush(params);
  if (res.code === 0) {
    Toast.success(formatMessage({ id: 'PUSH.success' }), 3);
    setCurrencyNumber();
    setSliderValue(0);
    setMoneyval(0);
    pushInfo();
    const res = await getMainBalance(orderInfo.currency);
    if (res.code === 0) {
      setEnough(res.balances[orderInfo.currency]);
    }
  }
};
function PushBid(props) {
  const { pushPrecision } = props;
  const { id } = props.location.query;
  const { market } = props.location.query;
  const [sliderValue, setSliderValue] = useState(0);
  const [orderInfo, setOrderInfo] = useState({});
  const [currencyNumber, setCurrencyNumber] = useState();
  const [moneyval, setMoneyval] = useState(0);
  const [assets, setassets] = useState(''); //用户资产
  const [exchangeRate, setExchangeRate] = useState('');
  const [enough, setEnough] = useState('');
  const cnyValuation = Number(exchangeRate * moneyval).toFixed(5);
  const valuationCNY = Number(exchangeRate * orderInfo.price).toFixed(5);
  const { user } = props;
  const cookieUid = getCookie('u_id');
  const pushInfo = async () => {
    const res = await getPushInfo(id);
    if (res.code === 0) {
      setOrderInfo(res.data);
    }
  };
  const resMoney = async () => {
    const res = await getMainBalance(market);
    if (res.code === 0) {
      setassets(res.balances[market].available);
    }
  };
  const exchangerate = async () => {
    const res = await getCnyPrice(market);

    if (res.code === 0) {
      setExchangeRate(res.data);
    }
  };
  useEffect(() => {
    if (user.uid || cookieUid) {
      pushInfo();
      resMoney();
      exchangerate();
    } else {
      router.push(`/auth/signin`);
      // router.go(-1);
    }
  }, []);
  useEffect(() => {
    const resMoney = async () => {
      const res = await getMainBalance(orderInfo.currency);
      if (res.code === 0) {
        setEnough(res.balances[orderInfo.currency]);
      }
    };
    resMoney();
  }, [orderInfo.currency]);

  const coinNumber = (val, setSliderValue, setCurrencyNumber, orderInfo, setMoneyval, enough) => {
    const number = Number(orderInfo.quantity) - Number(orderInfo.dealQuantity);
    // let available = enough.available;
    // let sliderVal = (available * val) / 100;
    // if (available > number) {
    //   sliderVal = (number * val) / 100;
    // }
    const sliderVal = (val / number) * 100;
    const pushAmount = val * orderInfo.price;
    const pushAmountBeyond = number * orderInfo.price;

    let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + pushPrecision.quantityScale + '})?$');

    if (re.test(val.toString()) || val === '') {
      if (val < number) {
        setCurrencyNumber(val);
        setSliderValue(sliderVal);
        setMoneyval(pushAmount.toFixed(5));
      } else {
        setCurrencyNumber(number);
        setSliderValue(100);
        setMoneyval(pushAmountBeyond.toFixed(5));
      }
      // return
    }
  };
  // silding
  const slidingAssets = (val, setSliderValue, orderInfo, setCurrencyNumber, setMoneyval) => {
    let available = enough.available;
    const number = Number(orderInfo.quantity) - Number(orderInfo.dealQuantity);
    let sliderVal = (available * val) / 100;
    if (available > number) {
      sliderVal = (number * val) / 100;
    }
    // const sliderVal = (available * val) / 100;
    const valuation = sliderVal * orderInfo.price;
    setMoneyval(valuation.toFixed(5));
    setCurrencyNumber(sliderVal);
    setSliderValue(val);
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'otcpush.order.confirm' })}</TopBar>
      <div className={styles.orderContent}>
        <div className={styles.orderTitele}>
          {/* <span>{formatMessage({ id: 'looking.for.currency' })}</span> */}
          <div>{orderInfo.currency}</div>
        </div>
        <div className={styles.orderMoney}>
          <span>{formatMessage({ id: 'container.Theunit.price' })}</span>
          <span>
            {orderInfo.price} {orderInfo.market}
          </span>
          {/* <p>≈{valuationCNY} CNY</p> */}
        </div>
        <span className={styles.pushsurplustitle}>
          {formatMessage({ id: 'pushable.quantity' })}:{orderInfo.remainQuantity} {orderInfo.currency}
        </span>
        <div className={styles.orderNumber}>
          <List>
            <InputItem
              placeholder={formatMessage({ id: 'otcpush.Quantity.sold' })}
              value={currencyNumber}
              extra={formatMessage({ id: 'fin.common.all' })}
              clear={true}
              onExtraClick={e => {
                allNumber(orderInfo, setCurrencyNumber, setSliderValue, setMoneyval, enough);
              }}
              onChange={val => coinNumber(val, setSliderValue, setCurrencyNumber, orderInfo, setMoneyval, enough)}
            ></InputItem>
          </List>
        </div>
        <div className={styles.sliderContent}>
          <WingBlank size="lg">
            <RcSlider
              value={sliderValue}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
              onChange={val => slidingAssets(val, setSliderValue, orderInfo, setCurrencyNumber, setMoneyval)}
            />
          </WingBlank>
        </div>
        <div className={styles.moneyInfo}>
          <span>{formatMessage({ id: 'otcpush.amount.buymoney' })}</span>
          <div className={styles.line}></div>
          <div className={styles.moneyValuation}>
            <span>
              {moneyval} {orderInfo.market}
            </span>
            {/* <span>≈{cnyValuation} CNY</span> */}
          </div>
        </div>
        <div className={styles.moneyBalance}>
          <span>
            {formatMessage({ id: 'assets.balances.Useable' })}:{enough ? enough.available : '---'} {orderInfo.currency}
          </span>
          {localStorage.getItem('mxc.view.from') !== 'app' ? (
            <span onClick={() => router.push(`/uassets/deposit?currency=${orderInfo.currency}`)}>
              {formatMessage({ id: 'assets.balances.recharge' })}
            </span>
          ) : (
            ''
          )}
        </div>
        <div className={styles.pushBtn}>
          <Button
            type="primary"
            disabled={currencyNumber ? false : true}
            className={styles.buybtnmoney}
            onClick={() => doPush(orderInfo, currencyNumber, setCurrencyNumber, setSliderValue, setMoneyval, pushInfo, setEnough)}
          >
            PUSH
          </Button>
        </div>
      </div>
    </div>
  );
}

export default connect(({ auth, otc }) => ({
  user: auth.user,
  pushPrecision: otc.pushPrecision
}))(PushBid);
