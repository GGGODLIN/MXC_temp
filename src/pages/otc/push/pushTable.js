import React, { useState, useMemo, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import { InputItem, Button, Toast, Modal } from 'antd-mobile';
import { Picker, List } from 'antd-mobile';
import { WingBlank } from 'antd-mobile';
import styles from './pushTable.less';
import router from 'umi/router';
import Slider from 'rc-slider';
import { getCnyPrice, getMainBalance, putmakeBidOrder } from '@/services/api';
import { numberToString } from '@/utils';
import { getCookie, cutFloatDecimal } from '@/utils';
const RcSlider = Slider.createSliderWithTooltip(Slider);
const alert = Modal.alert;
// 选择币种价格
const currencyPrices = async (
  val,
  setmoneyPrices,
  setTrading,
  setassets,
  pushInfo,
  setpoundage,
  setselectCurrency,
  setcurrencyNumber,
  setTotalAmount,
  setTotalAmountMoney
) => {
  const res = await getCnyPrice(val);
  const resMoney = await getMainBalance(val);

  setTrading(val);
  setselectCurrency();
  setcurrencyNumber();
  setTotalAmount();
  setTotalAmountMoney();
  if (res.code === 0) {
    setmoneyPrices(res.data);
  }
  if (resMoney.code === 0) {
    setassets(resMoney.balances[val].available);
  }
  const CurrencyType = pushInfo.find(m => m.market === val[0]);
  setpoundage(CurrencyType);
};

const releasePush = async (
  pushInfo,
  trading,
  selectCurrency,
  currencyNumber,
  setselectCurrency,
  setcurrencyNumber,
  setassets,
  setTotalAmount,
  pushList,
  setTotalAmountMoney
) => {
  let scale = Number(selectCurrency) / pushList.price;
  if (scale >= 1.2) {
    alert(
      <p className={styles.num} dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'push.marker.prompt' }, { name: '20%' }) }} />,
      formatMessage({ id: 'push.marker.read' }),
      [
        { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
        {
          text: formatMessage({ id: 'common.yes' }),
          onPress: async () => {
            let params = {
              currency: pushInfo[0].currency,
              market: trading[0],
              price: selectCurrency,
              quantity: currencyNumber,
              tradeType: 'BUY'
            };
            const res = await putmakeBidOrder(params);
            if (res.code === 0) {
              Toast.success(formatMessage({ id: 'trade.entrust.place_success' }), 3);
              setselectCurrency('');
              setcurrencyNumber('');
              getUserAssets(trading, setassets);
              setTotalAmount('');
              setTotalAmountMoney('');
            }
          }
        }
      ]
    );
  } else {
    let params = {
      currency: pushInfo[0].currency,
      market: trading[0],
      price: selectCurrency,
      quantity: currencyNumber,
      tradeType: 'BUY'
    };
    const res = await putmakeBidOrder(params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'trade.entrust.place_success' }), 3);
      setselectCurrency('');
      setcurrencyNumber('');
      getUserAssets(trading, setassets);
      setTotalAmount('');
      setTotalAmountMoney('');
    }
  }
};

const getUserAssets = async (trading, setassets) => {
  const resMoney = await getMainBalance(trading);
  if (resMoney.code === 0) {
    setassets(resMoney.balances[trading].available);
  }
};
function PushTable(props) {
  const [trading, setTrading] = useState('');
  const [moneyPrices, setmoneyPrices] = useState('');
  const [rmbPrices, setrmbPrices] = useState(0);
  const [selectCurrency, setselectCurrency] = useState(); //币种单价
  const [totalAmount, setTotalAmount] = useState(); //币种数量
  const [totalAmountMoney, setTotalAmountMoney] = useState(); //币种总金额
  const [assets, setassets] = useState(''); //用户资产
  const [poundage, setpoundage] = useState(''); //手续费
  const [currencyNumber, setcurrencyNumber] = useState(); //购买币种数量
  const [sliderValue, setSliderValue] = useState(0); //进度条进度
  const [precision, setPrecision] = useState(); //用户精度
  const SelectionList = props.selectlist;
  const pushInfo = props.pushInfo; //当前选择tab币种信息
  const { user, pushList } = props;
  // console.log(pushInfo)
  const cookieUid = getCookie('u_id');
  if (SelectionList.length === 0) {
    return '';
  }
  useEffect(() => {
    if (user.uid || cookieUid) {
      if (pushInfo.length > 0) {
        initialAssets(pushInfo[0].market, setmoneyPrices, setTrading, setassets, pushInfo, setpoundage);
        setPrecision(pushInfo);
      }
    } else {
      router.push(`/auth/signin`);
    }
  }, [pushInfo]);

  const initialAssets = async (val, setmoneyPrices, setTrading, setassets, pushInfo, setpoundage) => {
    const res = await getCnyPrice(val);
    const resMoney = await getMainBalance(val);
    let arrayTrading = [val];
    setTrading(arrayTrading);
    if (res.code === 0) {
      setmoneyPrices(res.data);
    }
    if (resMoney.code === 0) {
      setassets(resMoney.balances[val].available);
    }
    const CurrencyType = pushInfo.find(m => m.market === val);
    setpoundage(CurrencyType);
  };
  // 输入价格
  const moneyPrice = (
    val,
    trading,
    moneyPrices,
    setrmbPrices,
    setselectCurrency,
    setcurrencyNumber,
    setSliderValue,
    setTotalAmount,
    setTotalAmountMoney
  ) => {
    if (!trading) {
      Toast.info(formatMessage({ id: 'otcpush.select.currency' }), 2);
    } else {
      let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + precision[0].priceScale + '})?$');
      if (re.test(val.toString()) || val === '') {
        let valuation = Math.round(Number(val) * Number(moneyPrices) * 10) / 10;
        setrmbPrices(valuation);
        setSliderValue(0);
        setTotalAmount();
        setTotalAmountMoney();
        setcurrencyNumber();
        return setselectCurrency(val);
      } else {
        return selectCurrency;
      }
    }
  };
  // 输入数量
  const coinNumber = (
    val,
    setSliderValue,
    setcurrencyNumber,
    selectCurrency,
    assets,
    poundage,
    setTotalAmount,
    setselectCurrency,
    moneyPrices,
    setTotalAmountMoney
  ) => {
    if (!selectCurrency) {
      Toast.info(formatMessage({ id: 'otcpush.select.pice' }), 2);
      return;
    }
    let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + precision[0].quantityScale + '})?$');
    if (re.test(val.toString()) || val === '') {
      const thePercentage = (100 * Number(selectCurrency) * val) / (assets * (1 - Number(poundage.buyFeeRate)));
      const amount = Number(selectCurrency) * Number(val);
      const amountMoney = Number(selectCurrency) * Number(val) * Number(moneyPrices);
      let totalAmount = cutFloatDecimal(amount, precision[0].priceScale);
      let totalAmountMoney = cutFloatDecimal(amountMoney, precision[0].priceScale);
      setTotalAmount(totalAmount);
      setTotalAmountMoney(totalAmountMoney);
      setSliderValue(thePercentage);
      return setcurrencyNumber(val);
    } else {
      return selectCurrency;
    }
  };
  // all
  const allCurrency = (
    val,
    setSliderValue,
    assets,
    poundage,
    selectCurrency,
    setcurrencyNumber,
    trading,
    setTotalAmount,
    setTotalAmountMoney,
    moneyPrices
  ) => {
    if (!selectCurrency) {
      Toast.info(formatMessage({ id: 'otcpush.select.pice' }), 2);
      return;
    }
    let currerynumber = (assets * (1 - poundage.buyFeeRate)) / selectCurrency;
    const amount = Number(selectCurrency) * Number(currerynumber);
    const amountMoney = Number(amount) * Number(moneyPrices);
    setTotalAmountMoney(amountMoney.toFixed(2));
    let totalAmount = cutFloatDecimal(amount, precision[0].quantityScale);
    setTotalAmount(totalAmount);
    setSliderValue(100);

    let allQuantity = cutFloatDecimal(currerynumber, precision[0].quantityScale);
    setcurrencyNumber(allQuantity);
  };
  // sliding
  const slidingAssets = (
    val,
    setSliderValue,
    assets,
    poundage,
    selectCurrency,
    setcurrencyNumber,
    trading,
    setselectCurrency,
    moneyPrices,
    setTotalAmount,
    setTotalAmountMoney,
    rmbPrices
  ) => {
    const currencyNumber = (assets * (1 - poundage.buyFeeRate) * val) / 100 / selectCurrency;
    const amountMoney = Number(currencyNumber) * Number(rmbPrices);
    const amount = Number(currencyNumber) * Number(selectCurrency);
    if (!trading) {
      Toast.info(formatMessage({ id: 'otcpush.select.currency' }), 2);
    } else if (!selectCurrency) {
      Toast.info(formatMessage({ id: 'otcpush.select.pice' }), 2);
    } else {
      let totalAmount = cutFloatDecimal(amount, poundage.quantityScale);
      setTotalAmount(totalAmount);
      setSliderValue(val);
      let totalAmountNumber = cutFloatDecimal(currencyNumber, precision[0].quantityScale);
      setcurrencyNumber(totalAmountNumber);
      let totalAmountMoney = cutFloatDecimal(amountMoney, precision[0].quantityScale);
      setTotalAmountMoney(totalAmountMoney);
    }
  };
  return (
    <div className={styles.pushTableContent}>
      <div className={styles.pushContent}>
        {/* <div className={styles.pushTitle}>{formatMessage({ id: 'looking.for.currency' })} </div> */}
        <div className={styles.pushSelect}>
          <Picker
            extra={formatMessage({ id: 'common.select' })}
            okText={formatMessage({ id: 'common.sure' })}
            dismissText={formatMessage({ id: 'common.cancel' })}
            data={SelectionList}
            cols={1}
            value={trading}
            onChange={val =>
              currencyPrices(
                val,
                setmoneyPrices,
                setTrading,
                setassets,
                pushInfo,
                setpoundage,
                setselectCurrency,
                setcurrencyNumber,
                setTotalAmount,
                setTotalAmountMoney
              )
            }
          >
            <List.Item arrow="horizontal">{formatMessage({ id: 'otcpush.select.tradingon' })}</List.Item>
          </Picker>
        </div>
        <div className={styles.pushMoney}>
          <span>{/* {formatMessage({ id: 'otcpush.closed.money' })}≈{moneyPrices} CNY */}</span>
        </div>
        <div className={styles.pushInfoList}>
          <List>
            <InputItem
              placeholder={formatMessage({ id: 'otcpush.closed.buymoney' })}
              extra={trading}
              value={selectCurrency}
              clear={true}
              onChange={val =>
                moneyPrice(
                  val,
                  trading,
                  moneyPrices,
                  setrmbPrices,
                  setselectCurrency,
                  setcurrencyNumber,
                  setSliderValue,
                  setTotalAmount,
                  setTotalAmountMoney
                )
              }
            ></InputItem>
          </List>
          <div className={styles.pushMoney}>{/* <span>≈{rmbPrices} CNY</span> */}</div>
        </div>
        <div className={styles.pushInfoList}>
          <List>
            <InputItem
              placeholder={formatMessage({ id: 'otcpush.closed.buynumber' })}
              value={currencyNumber}
              extra={formatMessage({ id: 'fin.common.all' })}
              onExtraClick={val =>
                allCurrency(
                  val,
                  setSliderValue,
                  assets,
                  poundage,
                  selectCurrency,
                  setcurrencyNumber,
                  trading,
                  setTotalAmount,
                  setTotalAmountMoney,
                  moneyPrices
                )
              }
              clear={true}
              onChange={val =>
                coinNumber(
                  val,
                  setSliderValue,
                  setcurrencyNumber,
                  selectCurrency,
                  assets,
                  poundage,
                  setTotalAmount,
                  setselectCurrency,
                  moneyPrices,
                  setTotalAmountMoney
                )
              }
            ></InputItem>
          </List>
        </div>
        <div className={styles.pushRange}>
          <WingBlank size="lg">
            <RcSlider
              value={sliderValue}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
              onChange={val =>
                slidingAssets(
                  val,
                  setSliderValue,
                  assets,
                  poundage,
                  selectCurrency,
                  setcurrencyNumber,
                  trading,
                  setselectCurrency,
                  moneyPrices,
                  setTotalAmount,
                  setTotalAmountMoney,
                  rmbPrices
                )
              }
            />
          </WingBlank>
        </div>

        <div className={styles.pushfooter}>
          <div className={styles.footerTitle}>{formatMessage({ id: 'otcpush.amount.buymoney' })}</div>
          <div className={styles.moneyValuation}>
            <span>
              {totalAmount}
              {trading}
            </span>
            {/* <span>≈{totalAmountMoney}CNY</span> */}
          </div>

          {/* <div className={styles.valuation}>
            <span>
              {totalAmount}
              {trading}
            </span>
            <span>≈{totalAmountMoney}CNY</span>
          </div> */}
          <div className={styles.pushMoney}>
            <span>
              {formatMessage({ id: 'assets.balances.Useable' })}:{assets ? numberToString(assets) : '--'} {trading}
            </span>
            {trading ? (
              <span onClick={() => router.push(`/uassets/deposit?currency=${trading}`)}>
                {formatMessage({ id: 'assets.balances.recharge' })}
              </span>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className={styles.pushBtnOK}>
          <Button
            type="primary"
            disabled={trading && selectCurrency && currencyNumber ? false : true}
            onClick={() => {
              releasePush(
                pushInfo,
                trading,
                selectCurrency,
                currencyNumber,
                setselectCurrency,
                setcurrencyNumber,
                setassets,
                setTotalAmount,
                pushList,
                setTotalAmountMoney
              );
            }}
          >
            {formatMessage({ id: 'otcpush.order.Release' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default connect(({ auth, otc }) => ({
  user: auth.user,
  pushList: otc.pushList
}))(PushTable);
