import { useState, useEffect, useReducer, useCallback } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import router from 'umi/router';
import styles from './index.less';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { List, InputItem, WhiteSpace, Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import { divide, numberAccuracy, multiply, cutFloatDecimal, getMainSite, getSubSite } from '@/utils';
import { Picker } from 'antd-mobile';
import debounce from 'lodash/debounce';
import { getEntrustLimit, getMethodOfPayment, userMakerOrder, getOtcAssets, getQuickOrderInfo } from '@/services/api';
const initialState = {
  limit: {},
  price: '',
  limitMoney: {},
  paymentList: [],
  paymentActive: '',
  timeList: [
    {
      label: <div>{formatMessage({ id: 'otc.entrust.time-two' }, { name: 1 })}</div>,
      value: 1
    },
    {
      label: <div>{formatMessage({ id: 'otc.entrust.time-two' }, { name: 15 })}</div>,
      value: 15
    },
    {
      label: <div>{formatMessage({ id: 'otc.entrust.time-two' }, { name: 20 })}</div>,
      value: 20
    },
    {
      label: <div>{formatMessage({ id: 'otc.entrust.time-two' }, { name: 60 })}</div>,
      value: 60
    }
  ]
};
function reducer(state, action) {
  return { ...state, ...action };
}
const PendingOrder = props => {
  const { referencePrice, coinNameBalances, payPrecision, coinPrecision, dispatch } = props;
  const [state, setstate] = useReducer(reducer, initialState);
  const { getFieldProps, validateFields, getFieldError, setFieldsValue, getFieldValue, onValuesChange } = props.form;
  let priceVal = getFieldValue('price');
  let quantityVal = getFieldValue('quantity');
  let amountVal = getFieldValue('amount');

  const calculatingAdvertising = useCallback(
    debounce((priceVal, quantityVal, amountVal) => calculation(priceVal, quantityVal, amountVal), 1000),
    []
  );
  let { timeList, paymentList, paymentActive, limitMoney } = state;
  const getMarketPriceInfo = async () => {
    let params = {
      currency: 'CNY',
      coinName: 'USDT'
    };
    const res = await getQuickOrderInfo(params);
    if (res.code === 0) {
      // setTradingOffer(res.data.m);

      dispatch({
        type: 'otc/changeReferencePrice',
        payload: res.data.m
      });
    }
  };
  useEffect(() => {
    validateFields();
    userPaymentList();
    getEntrustMoneyLimit();
    getAsstes();
    getMarketPriceInfo();
    dispatch({
      type: 'otc/currencyPrecision',
      payload: {
        Currency: 'USDT'
      }
    });
    dispatch({
      type: 'otc/paycurrencyPrecision',
      payload: {
        Currency: 'CNY'
      }
    });
  }, []);
  const getEntrustMoneyLimit = async () => {
    const res = await getEntrustLimit();
    if (res.code === 0) {
      setstate({ limitMoney: res.data });
    }
  };
  const getAsstes = async () => {
    const res = await getOtcAssets('USDT');
    if (res.code === 0) {
      if (res.data) {
        dispatch({
          type: 'otc/getCoinNameBalances',
          payload: res.data
        });
      }
    }
  };
  const userPaymentList = async () => {
    const res = await getMethodOfPayment();
    if (res.code === 0) {
      let dataList = [];
      let data = [];
      res.data.forEach(data => {
        if (data.state === 1) {
          dataList.push(data);
        }
      });
      if (dataList.length > 0) {
        setstate({
          paymentList: dataList || [],
          paymentActive: dataList[0].id || ''
        });
      }
      dataList.forEach(item => {
        data.push({
          label: (
            <div className={styles.paymentContent}>
              <span>{paymentTooltip(item.payMethod)}</span>
              <span>{item.account}</span>
            </div>
          ),
          value: item.id
        });
      });
      setstate({
        paymentList: data
      });
    }
  };
  const allBalance = () => {
    let sellQuantity = cutFloatDecimal(coinNameBalances.availableBalance, coinPrecision.quantityScale);
    calculation(priceVal, sellQuantity, '');
    setFieldsValue({ quantity: sellQuantity });
  };
  const paymentTooltip = item => {
    const paymentMaps = {
      1: <span className={styles.bankColor}> {formatMessage({ id: 'otc.order.bank' })}</span>,
      2: <span className={styles.alipayColor}>{formatMessage({ id: 'otc.order.Alipay' })}</span>
    };
    return paymentMaps[item];
  };
  const submit = () => {
    validateFields((err, values) => {
      if (!err) {
        console.log('====');
        console.log(values);

        publishCommissioned(values);
      } else {
      }
      console.log(err);
    });
  };
  const publishCommissioned = async values => {
    let params = {
      quantity: values.quantity,
      price: values.price,
      currency: 'CNY',
      coinName: 'USDT',
      deadLine: values.time[0],
      paymentId: values.paymentId[0]
    };
    const res = await userMakerOrder(params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'otc.entrust.releaseSuccess' }), 2);
      router.push('/otc/fiatorderRecord?type=1');
    }
  };
  const calculation = (priceVal, quantityVal, amountVal) => {
    if (priceVal && quantityVal) {
      let Amount = multiply(Number(priceVal), Number(quantityVal));
      let CountAmount = cutFloatDecimal(Amount, payPrecision.scale);
      setFieldsValue({ amount: CountAmount });
    } else if (priceVal && amountVal) {
      let quantity = multiply(Number(amountVal), 1 / Number(priceVal));
      let CountAmount;
      if (quantity > coinNameBalances.availableBalance) {
        CountAmount = cutFloatDecimal(coinNameBalances.availableBalance, coinPrecision.quantityScale);
        let Amount = multiply(Number(priceVal), Number(CountAmount));
        setFieldsValue({ amount: Amount });
      } else {
        CountAmount = cutFloatDecimal(quantity, coinPrecision.quantityScale);
      }
      setFieldsValue({ quantity: CountAmount });
    } else if (quantityVal && amountVal) {
      let price = divide(Number(amountVal), Number(quantityVal));
      let CountPrice = cutFloatDecimal(price, coinPrecision.scale);
      setFieldsValue({ price: CountPrice });
    }
  };
  const priceChange = e => {
    if (e) {
      calculatingAdvertising(e, quantityVal, amountVal);
    } else {
      calculatingAdvertising(e, '', '');
      setFieldsValue({
        amount: '',
        quantity: '',
        price: ''
      });
    }
  };
  const quantityChange = e => {
    if (e) {
      calculatingAdvertising(priceVal, e, '');
    } else {
      calculatingAdvertising(priceVal, '', '');
      setFieldsValue({
        amount: '',
        quantity: ''
      });
    }
  };
  const amountChange = e => {
    if (e) {
      calculatingAdvertising(priceVal, '', e);
    } else {
      calculatingAdvertising(priceVal, '', '');
      setFieldsValue({
        amount: '',
        quantity: ''
      });
    }
  };
  const buyPrice = e => {
    let values = e;
    const reg = /^(0|\d*)(\.\d{0,2})?$/;
    // let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + payPrecision.scale + '})?$');
    if (reg.test(values.toString()) || values === '') {
      return values;
    } else {
      return getFieldValue('price');
    }
  };
  const buyQuantityFun = e => {
    let values = e;
    const re = /^(0|\d*)(\.\d{0,2})?$/;
    // let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + coinPrecision.quantityScale + '})?$');

    if (re.test(values.toString()) || values === '') {
      if (values > coinNameBalances.availableBalance) {
        return coinNameBalances.availableBalance;
      }
      return values;
    } else {
      return getFieldValue('quantity');
    }
  };
  const buyAmountFun = e => {
    let values = e;
    const re = /^(0|\d*)(\.\d{0,2})?$/;
    // let re = new RegExp('^(0|[1-9][0-9]*)(.[0-9]{0,' + payPrecision.scale + '})?$');
    if (re.test(values.toString()) || values === '') {
      return values;
    } else {
      return getFieldValue('amount');
    }
  };
  const priceError = getFieldError('price');
  const quantityError = getFieldError('quantity');
  const amountError = getFieldError('amount');
  const timeError = getFieldError('time');
  console.log(priceError);
  console.log(quantityError);

  console.log(amountError);

  console.log(timeError);

  return (
    <div>
      <TopBar>
        {formatMessage({ id: 'otc.trading.entrust' })}- {formatMessage({ id: 'otc.quick.sell' })}USDT
      </TopBar>
      <div className={styles.entrustContent}>
        <div className={styles.listContent}>
          <p>{formatMessage({ id: 'otc.entrust.price' })}</p>
          <InputItem
            {...getFieldProps('price', {
              onChange: priceChange,
              // onVirtualKeyboardConfirm:limitInput,
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'otc.entrust.pricePrompt' })
                }
              ],
              getValueFromEvent: e => {
                return buyPrice(e);
              }
            })}
            placeholder={formatMessage({ id: 'otc.entrust.priceVal' })}
            extra={'CNY'}
          ></InputItem>
          <p className={styles.referencePrice}>
            {formatMessage({ id: 'otc.entrust.referencePrice' })} 1USDT≈￥{referencePrice.sell}
          </p>
        </div>
        <div className={styles.listContent}>
          <p>{formatMessage({ id: 'otc.entrust.sellQuantity' })}</p>
          <InputItem
            {...getFieldProps('quantity', {
              onChange: quantityChange,
              rules: [{ required: true, message: formatMessage({ id: 'swap.handle.valPlaceholder' }) }],
              getValueFromEvent: e => {
                return buyQuantityFun(e);
              }
            })}
            placeholder={formatMessage({ id: 'otc.entrust.quantityVal' })}
            extra={
              <div className={styles.quantityAll}>
                <span>USDT</span>|<span onClick={allBalance}>{formatMessage({ id: 'fin.common.all' })}</span>
              </div>
            }
          ></InputItem>
          <p className={styles.price}>
            {formatMessage({ id: 'otcfiat.account.alance' })} {cutFloatDecimal(coinNameBalances.availableBalance, 2)}{' '}
            {coinNameBalances.coinName}
          </p>
        </div>
        <div className={styles.listContent}>
          <p>{formatMessage({ id: 'depths.list.amount' })}</p>
          <InputItem
            {...getFieldProps('amount', {
              onChange: amountChange,
              rules: [{ required: true, message: formatMessage({ id: 'depths.list.amount' }) }],
              getValueFromEvent: e => {
                return buyAmountFun(e);
              }
            })}
            placeholder={formatMessage({ id: 'otc.entrust.moneyVal' })}
            extra={'CNY'}
          ></InputItem>
          <p className={styles.price}>
            {formatMessage({ id: 'otc.entrust.limit' })}
            {limitMoney.minSell}-{limitMoney.maxSell}CNY
          </p>
        </div>
        <div className={styles.listContent}>
          <p>{formatMessage({ id: 'otc.order.Payment' })}</p>
          <div className={styles.setBorder}>
            <Picker
              {...getFieldProps('paymentId', {
                rules: [{ required: true, message: '' }]
              })}
              data={paymentList}
              cols={1}
            >
              <List.Item arrow="horizontal">{} </List.Item>
            </Picker>
          </div>
        </div>
        <div className={styles.listContent}>
          <p>{formatMessage({ id: 'swap.submitEntrust.onTime' })}</p>
          <div className={styles.setBorder}>
            <Picker
              {...getFieldProps('time', {
                rules: [{ required: true, message: '' }]
              })}
              data={timeList}
              cols={1}
              okText={formatMessage({ id: 'common.sure' })}
              dismissText={formatMessage({ id: 'common.cancel' })}
            >
              <List.Item arrow="horizontal">{} </List.Item>
            </Picker>
          </div>
        </div>
        <div className={styles.prpmpt}>
          <p> {formatMessage({ id: 'swap.submitEntrust.onTime' })}:</p>
          <p>{formatMessage({ id: 'otc.entrust.one' })}</p>
          <p>{formatMessage({ id: 'otc.entrust.two' })}</p>
        </div>
        <div className={styles.footerBtn}>
          <Button type="warning" onClick={submit} disabled={priceError || quantityError || amountError || timeError}>
            {formatMessage({ id: 'otc.entrust.release' })}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  referencePrice: otc.referencePrice,
  coinNameBalances: otc.coinNameBalances,
  payPrecision: otc.payPrecision,
  coinPrecision: otc.precision
}))(createForm()(PendingOrder));
