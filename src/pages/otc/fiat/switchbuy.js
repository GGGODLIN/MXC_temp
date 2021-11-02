import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { List, InputItem, WhiteSpace, Button, Toast } from 'antd-mobile';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { createForm } from 'rc-form';
import router from 'umi/router';
import styles from './switch.less';
import Fiatorder from '../fiat-orders/index';
import { postAddOrder, getBlance } from '@/services/api';
import { getCookie } from '@/utils';
import { Picker } from 'antd-mobile';
import { getOTCPrice } from '@/services/api';
const language = getLocale();

const initialState = {
  moneyBlance: [],
  stateType: true,
  vndType: true,
  statName: formatMessage({ id: 'otcfiat.buy.quantity' }),
  sellNumber: '',
  buyvalue: formatMessage({ id: 'otcfiat.buy.mount' }),
  buyunit: 'CNY',
  vndBuyunit: 'VND',
  buyNumber: '',
  sellOrderid: 0,
  valuationCNY: 0,
  moneyvalue: formatMessage({ id: 'otcfiat.buy.bought_placeHold' }),
  userid: {}
};
function reducer(state, action) {
  switch (action.type) {
    case true:
      return {
        ...state,
        stateType: true,
        vndType: true,
        statName: formatMessage({ id: 'otcfiat.buy.quantity' }),
        buyvalue: formatMessage({ id: 'otcfiat.buy.mount' }),
        buyNumber: '',
        buyunit: 'CNY',
        vndBuyunit: 'VND'
      };
    case false:
      return {
        ...state,
        stateType: false,
        vndType: false,
        statName: formatMessage({ id: 'otcfiat.buy.money' }),
        buyvalue: formatMessage({ id: 'otcfiat.buy.bought_placeHold' }),
        buyNumber: '',
        buyunit: 'USDT',
        vndBuyunit: 'USDT'
      };
    case 'allmoney':
      return {
        ...state,
        moneyBlance: action.moneyBlance
      };
    case 'sell':
      return {
        ...state,
        valuationCNY: Number(action.pice) * Number(state.moneyBlance[0].available),
        sellNumber: state.moneyBlance[0].available
      };
    case 'buyMoney':
      return {
        ...state,
        buyNumber: action.buyNumber
      };
    case 'buyVND':
      return {
        ...state,
        buyNumber: action.buyNumber
      };

    case 'sellMoney':
      return {
        ...state,
        valuationCNY: Number(action.pice) * Number(action.sellNumber),
        sellNumber: action.sellNumber
      };
    case 'sellOrder':
      return {
        ...state,
        sellOrderid: state.sellOrderid + 1
      };

    default:
      throw new Error();
  }
}

const submit = async (value, state, setstate, trading, currencyRate) => {
  const cookieUid = getCookie('u_id');

  if (!cookieUid) {
    router.push(`/auth/signin`);
    return;
  }
  console.log(state.stateType);
  if (state.stateType === true) {
    let buyNumber = Number(state.buyNumber);
    let priceVal = buyNumber / currencyRate.buy;
    let params = {
      amount: value.tradeType == 0 ? priceVal : state.sellNumber,
      tradeType: value.tradeType,
      coinType: 'USDT',
      currency: trading === 1 ? 'VND' : 'CNY'
    };
    const res = await postAddOrder(params);
    if (res.code === '0') {
      setstate({ type: !state.stateType });
      if (value.tradeType === 0) {
        router.push(`/otc/fiat-order-unhandle?id=${res.result.tradeNo}`);
      } else {
        setstate({ type: 'sellOrder' });
      }
    } else {
      Toast.offline(res.desc);
    }
  } else {
    let params = {
      amount: value.tradeType == 0 ? state.buyNumber : state.sellNumber,
      tradeType: value.tradeType,
      coinType: 'USDT',
      currency: trading === 1 ? 'VND' : 'CNY'
    };
    const res = await postAddOrder(params);
    if (res.code === '0') {
      setstate({ type: !state.stateType });
      if (value.tradeType === 0) {
        router.push(`/otc/fiat-order-unhandle?id=${res.result.tradeNo}`);
      } else {
        setstate({ type: 'sellOrder' });
      }
    } else {
      Toast.offline(res.desc);
    }
  }
};
const colors = [
  {
    label: (
      <div>
        <svg aria-hidden="true" className={styles.selecticon}>
          <use xlinkHref="#iconic_CNY"></use>
        </svg>
        <span className={styles.selectintroduce}>{formatMessage({ id: 'otcfait.selcet.currencyname' })} (CNY)</span>
      </div>
    ),
    value: 0
  },
  {
    label: (
      <div>
        <svg aria-hidden="true" className={styles.selecticon}>
          <use xlinkHref="#iconic_vietnam"></use>
        </svg>
        <span className={styles.selectintroduce}>
          {formatMessage({ id: 'otcfait.selcet.currencyvnd' })}
          (VND)
        </span>
      </div>
    ),
    value: 1
  }
];

function SwitchDealHook({ value, dispatch, idenAuth, loginMember }) {
  const [state, setstate] = useReducer(reducer, initialState);
  const [trading, setTrading] = useState(0);
  const [currency, setCurrency] = useState(0);
  const [currencyRate, setCurrencyRate] = useState({});
  const [languageCurrency, setLanguageCurrency] = useState('CNY');
  const { user } = value;
  const cookieUid = getCookie('u_id');
  let conversion = state.valuationCNY;
  const usdtRate = async data => {
    const res = await getOTCPrice('USDT', data);
    if (res.code === '0') {
      setCurrencyRate(res.result);
    }
  };
  useEffect(() => {
    const usdtBlance = async () => {
      const res = await getBlance('USDT');
      if (res.code === '0') {
        if (res.result[0]) {
          setstate({ type: 'allmoney', moneyBlance: res.result });
        }
      }
    };
    if (cookieUid) {
      usdtBlance();
    }
    if (language === 'vi-VN') {
      setTrading(1);
      setLanguageCurrency('VND');
      usdtRate('VND');
    } else {
      setTrading(0);
      setLanguageCurrency('CNY');
      usdtRate('CNY');
    }
  }, []);
  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, [loginMember]);
  useEffect(() => {
    setstate({ type: 'sellMoney', sellNumber: state.sellNumber, pice: currencyRate.sell });
  }, [currencyRate]);
  const currencyPrices = async (val, setTrading) => {
    setTrading(val[0]);
    if (val[0] === 1) {
      setLanguageCurrency('VND');
      usdtRate('VND');
    } else {
      setLanguageCurrency('CNY');
      usdtRate('CNY');
    }
  };
  const allCurrency = v => {
    console.log(state.moneyBlance);
    if (state.moneyBlance.length > 0) {
      if (user || cookieUid) {
        setstate({ type: 'sell', pice: currencyRate.sell, userid: user });
      } else {
        Toast.offline(formatMessage({ id: 'act.btn.loginname' }));
      }
    } else {
      router.push('/uassets/overview');
    }
  };
  const banksHandle = () => {
    if (loginMember && (!idenAuth || loginMember.authLevel < '2')) {
      Toast.fail(formatMessage({ id: 'ucenter.setting.banks.tip' }));
    } else {
      router.push('/ucenter/banks');
    }
  };
  return (
    <div className={styles.centernswitch}>
      <div className={styles.moneyrate}>
        <div className={styles.vntselect}>
          <span>{formatMessage({ id: 'otcfait.select.currency' })}</span>
        </div>
        <div className={styles.addback} onClick={banksHandle}>
          <i className="iconfont iconjiaoyi-fabijiaoyi-yinhangka" style={{ paddingLeft: 5, fontSize: '12px', paddingRight: 5 }}></i>
          {formatMessage({ id: 'otcfiat.bank.add' })}
        </div>
      </div>

      <div className={styles.currencyContetnt}>
        <Picker
          extra=" "
          okText={formatMessage({ id: 'common.sure' })}
          dismissText={formatMessage({ id: 'common.cancel' })}
          data={colors}
          cols={1}
          onChange={val => currencyPrices(val, setTrading)}
        >
          <List.Item arrow="horizontal">
            {trading === 1 ? (
              <div>
                <svg aria-hidden="true" className={classNames([styles.currencyincon])}>
                  <use xlinkHref="#iconic_vietnam"></use>
                </svg>
                <span className={styles.currencyselect}> {formatMessage({ id: 'otcfait.selcet.currencyvnd' })} (VND)</span>
              </div>
            ) : (
              <div>
                <svg aria-hidden="true" className={classNames([styles.currencyincon])}>
                  <use xlinkHref="#iconic_CNY"></use>
                </svg>
                <span className={styles.currencyselect}> {formatMessage({ id: 'otcfait.selcet.currencyname' })} (CNY)</span>
              </div>
            )}
          </List.Item>
        </Picker>
      </div>
      <div>
        1 {currencyRate.coinType} ≈{' '}
        <span>
          {value.buyshow === true ? currencyRate.buy : currencyRate.sell}
          <i>{trading === 1 ? 'VND' : 'CNY'}</i>
        </span>
      </div>
      <div className={styles.buyValueContent}>
        {value.buyshow === true ? (
          trading === 1 ? (
            <List>
              <InputItem
                placeholder={state.buyvalue}
                value={state.buyNumber}
                extra={state.vndBuyunit}
                onChange={v => {
                  setstate({ type: 'buyVND', buyNumber: v });
                }}
                type="number"
                clear={true}
              ></InputItem>
            </List>
          ) : (
            <List>
              <InputItem
                placeholder={state.buyvalue}
                value={state.buyNumber}
                extra={state.buyunit}
                onChange={v => {
                  setstate({ type: 'buyMoney', buyNumber: v });
                }}
                type="number"
                clear={true}
              ></InputItem>
            </List>
          )
        ) : (
          <List>
            <InputItem
              placeholder={state.moneyvalue}
              value={state.sellNumber}
              extra={`USDT | ${formatMessage({ id: 'fin.common.all' })}`}
              onChange={v => {
                setstate({ type: 'sellMoney', sellNumber: v, pice: currencyRate.sell });
              }}
              onExtraClick={e => {
                allCurrency();
              }}
              type="number"
              clear={true}
            ></InputItem>
          </List>
        )}
        {value.buyshow === true ? (
          trading === 1 ? (
            <div className={styles.moneyicon} onClick={() => setstate({ type: !state.vndType })}>
              <span>{state.statName}</span>
            </div>
          ) : (
            <div className={styles.moneyicon} onClick={() => setstate({ type: !state.stateType })}>
              <span>{state.statName}</span>
            </div>
          )
        ) : (
          <div>
            <div className={styles.money}>
              <span>
                {' '}
                <span className={styles.currencyluation}>≈{conversion.toFixed(2)}</span>
                {trading === 1 ? 'VND' : 'CNY'}
              </span>
            </div>
            <div className={styles.moneyBalance}>
              <span>{formatMessage({ id: 'otcfiat.account.alance' })}:</span>
              <span>{state.moneyBlance.length > 0 ? state.moneyBlance[0].available : ''}</span>
              <span>{state.moneyBlance.length > 0 ? state.moneyBlance[0].coinType : ''}</span>
              <span onClick={() => router.push('/uassets/overview')}>{formatMessage({ id: 'assets.transfer' })}</span>
            </div>
          </div>
        )}
        {value.buyshow === true ? (
          <Button
            type="primary"
            disabled={state.buyNumber.length < 1 ? true : false}
            className={styles.buybtnmoney}
            onClick={() => submit(value, state, setstate, trading, currencyRate)}
          >
            {formatMessage({ id: 'otcfiat.trading.buy' })}
          </Button>
        ) : (
          <Button
            type={value.buyshow === true ? 'primary' : 'warning'}
            disabled={state.sellNumber.length < 1 ? true : false}
            className={styles.buybtnmoney}
            onClick={() => submit(value, state, setstate, trading, currencyRate)}
          >
            {formatMessage({ id: 'otcfiat.trading.sell' })}
          </Button>
        )}
        <WhiteSpace />
        <Fiatorder tradeType={value.tradeType} sellOrder={state.sellOrderid} />
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  idenAuth: auth.idenAuth,
  loginMember: auth.loginMember
}))(createForm()(SwitchDealHook));
// export default createForm()(SwitchDealHook);
