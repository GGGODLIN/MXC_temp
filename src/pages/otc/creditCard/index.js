import React, { useState, createContext, useCallback, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import router from 'umi/router';
import { List, InputItem, WhiteSpace, Button, Modal, Picker, SearchBar, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import ServiceProviders from './serviceProviders';
import CreditCardModel from './creditCardModel';
import debounce from 'lodash/debounce';
import { cutFloatDecimal, getMainSite, multiply } from '@/utils';
import {
  getCreditCardCoins,
  getCreditCardCurrencies,
  getSupplier,
  getrdPartPrice,
  getPayPrecision,
  getPracticalPrice,
  getCoinAdress,
  getCreditCardLimit,
  getCreditCardSlect,
  getCurrencyPrecision
} from '@/services/api';
import classNames from 'classnames';
function reducer(state, action) {
  return { ...state, ...action };
}
const initialState = {
  coineActive: '',
  currenciesActive: '',
  serverActive: '',
  payCoineActive: '',
  layerType: 1,
  currenciesList: '',
  layerTypeBlock: 'none',
  layerServer: 'none',
  promptMode: 'none',
  coineList: [],
  checkedId: '',
  currencyPrice: '',
  coinePrecision: '',
  orderTypeId: '',
  currenciesPrecision: 2,
  paymentId: '',
  serverOrderInfo: {},
  coinRechargeAddress: '',
  placeTheOrder: {},
  serviceProvidersList: [],
  selectCoin: [],
  paymentorderLImit: {},
  amountminerr: false,
  amountmaxerr: false,
  loadingState: 'none',
  loadingVal: true,
  loadingMVal: true,
  selectFiatCoin: [],
  creditCardCoinList: [],
  creditCardCoinActive: '',
  quantityerr: false
};

function fuzzyQuery(list, keyWord) {
  var reg = new RegExp(keyWord, 'i');
  var arr = [];
  for (var i = 0; i < list.length; i++) {
    if (reg.test(list[i])) {
      arr.push(list[i]);
    }
  }
  return arr;
}
function fiatFuzzyQuery(list, keyWord) {
  var reg = new RegExp(keyWord, 'i');
  var arr = [];
  for (var i = 0; i < list.length; i++) {
    if (reg.test(list[i].currencyName)) {
      arr.push(list[i]);
    }
  }
  return arr;
}
function QuickTrading({ form, otcuser, theme }) {
  const { getFieldProps, validateFields, getFieldError, getFieldValue, setFieldsValue, resetFields } = form;
  const [state, setState] = useReducer(reducer, initialState);
  const {
    coineActive,
    payCoineActive,
    currenciesActive,
    currenciesList,
    layerTypeBlock,
    coineList,
    layerType,
    selectCoin,
    checkedId,
    serviceProvidersList,
    layerServer,
    coinePrecision,
    currenciesPrecision,
    orderTypeId,
    serverOrderInfo,
    coinRechargeAddress,
    promptMode,
    paymentId,
    placeTheOrder,
    amountminerr,
    amountmaxerr,
    quantityerr,
    loadingState,
    loadingVal,
    loadingMVal,
    selectFiatCoin,
    creditCardCoinList,
    creditCardCoinActive,
    paymentorderLImit,
    currencyPrice
  } = state;
  let buyAmount = getFieldValue('amount');
  let buyQuantity = getFieldValue('quantity');
  const delayedQuery = useCallback(
    debounce(
      (currenciesActive, coineActive, amount, quantity, coinePrecision, paymentorderLImit) =>
        getCurrenciesPrice(currenciesActive, coineActive, amount, quantity, coinePrecision, paymentorderLImit),
      500
    ),
    []
  );
  const orderInformation = useCallback(
    debounce((c, m, id, a, q, t) => orderInfoMoneyInitial(c, m, id, a, q, t), 200),
    []
  );
  useEffect(() => {
    if (otcuser.account) {
      acceptanceCoins();
    }
  }, [otcuser.account]);
  useEffect(() => {
    if (currenciesActive && coineActive) {
      getServiceProviders();
      getCoinePrecision();
      getCurrenciesPrecision();
      // resetFields()
    }
  }, [currenciesActive, coineActive]);

  useEffect(() => {
    setState({
      paymentId: ''
    });
    if (currenciesActive && coineActive && checkedId && orderTypeId && buyAmount && buyQuantity) {
      orderInformation(currenciesActive, coineActive, checkedId, buyAmount, buyQuantity, orderTypeId);
    }
  }, [currenciesActive, coineActive, buyAmount, buyQuantity, checkedId]);
  useEffect(() => {
    if (currenciesActive && coineActive) {
      orderLimit();
    }
  }, [currenciesActive, coineActive]);
  useEffect(() => {
    if (coineActive && checkedId) {
      getCoinAddress();
    }
  }, [coineActive, checkedId]);
  const checkAccount = () => {
    validateFields(async (error, values) => {
      if (!error) {
        let info = {
          currency: currenciesActive,
          coinName: coineActive,
          acceptance: checkedId,
          paymentMethodId: paymentId,
          amount: orderTypeId === 1 ? values.amount : undefined,
          quantity: orderTypeId === 2 ? values.quantity : undefined
        };
        console.log(info);
        setState({
          placeTheOrder: info,
          promptMode: 'block'
        });
      }
    });
  };
  const orderLimit = async () => {
    let data = {
      currency: currenciesActive
    };
    const res = await getCreditCardLimit(data);
    if (res.code === 0) {
      setState({
        paymentorderLImit: res.data
      });
    }
  };
  //获取当前币种所支持的服务商
  const getServiceProviders = async () => {
    let data = {
      currency: currenciesActive,
      coinName: coineActive
    };
    const res = await getSupplier(data);
    if (res.code === 0) {
      if (res.data.length === 1) {
        setState({
          checkedId: res.data[0]
        });
      } else {
        setState({
          checkedId: res.data[0]
        });
      }
      setState({
        serviceProvidersList: res.data,
        serverActive: res.data[0]
      });
    }
  };
  const openFaitCoin = () => {
    setState({
      layerType: 1,
      layerTypeBlock: 'block',
      selectCoin: creditCardCoinList[creditCardCoinActive].coinNames
    });
  };
  const openPayCoin = () => {
    setState({
      layerType: 2,
      layerTypeBlock: 'block',
      selectFiatCoin: creditCardCoinList
    });
  };
  const faitcoinClick = item => {
    if (layerType === 1) {
      setState({
        coineActive: item,
        layerTypeBlock: 'none'
      });
    } else {
      setState({
        currenciesActive: item,
        layerTypeBlock: 'none'
      });
    }
    if (coineActive != item) {
      setFieldsValue({
        quantity: '',
        amount: ''
      });
      setState({
        serverOrderInfo: {}
      });
    }
  };
  const filterCoin = () => {
    return selectCoin.map(item => {
      return (
        <div
          className={styles.coinList}
          onClick={() => {
            faitcoinClick(item);
          }}
          key={item}
        >
          {item}
        </div>
      );
    });
  };
  const filterFiatCoin = () => {
    return selectFiatCoin.map((item, index) => {
      return (
        <div
          className={styles.coinList}
          onClick={() => {
            setState({
              creditCardCoinActive: index,
              coineActive: item.coinNames[0]
            });
            faitcoinClick(item.currencyName);
          }}
          key={item.currencyName}
        >
          {item.currencyName}
        </div>
      );
    });
  };
  const searchCoin = e => {
    if (layerType === 1) {
      setState({
        selectCoin: fuzzyQuery(creditCardCoinList[creditCardCoinActive].coinNames, e)
      });
    } else {
      setState({
        selectFiatCoin: fiatFuzzyQuery(creditCardCoinList, e)
      });
    }
  };

  const getCoinAddress = async () => {
    const res = await getCoinAdress(coineActive, checkedId);
    if (res.code === 0) {
      setState({
        coinRechargeAddress: res.data
      });
    }
  };
  // 获取服务商单价
  const getCurrenciesPrice = async (currency, coinName, amount, quantity, decimal, paymentorderLImit) => {
    let data = {
      currency,
      coinName,
      amount,
      quantity
    };
    setState({
      loadingState: 'block',
      loadingVal: false,
      loadingMVal: false
    });
    const res = await getrdPartPrice(data);
    if (res.code === 0) {
      if (amount || quantity) {
        if (quantity) {
          let buyMoney = multiply(quantity, res.data);
          let data = cutFloatDecimal(buyMoney, decimal);
          setFieldsValue({ amount: data });
          let numberminLimit = multiply(paymentorderLImit.min, 1 / res.data);
          let mindata = cutFloatDecimal(numberminLimit, decimal);
          let numbermaxLimit = multiply(paymentorderLImit.max, 1 / res.data);
          let maxdata = cutFloatDecimal(numbermaxLimit, decimal);
          if (Number(quantity) < Number(mindata)) {
            setState({
              amountminerr: true
            });
          } else if (Number(quantity) > Number(maxdata)) {
            setState({
              amountmaxerr: true
            });
          } else {
            setState({
              amountminerr: false,
              amountmaxerr: false
            });
          }
        }
        if (amount) {
          let buyQuantity = multiply(amount, 1 / res.data);
          let data = cutFloatDecimal(buyQuantity, decimal);
          setFieldsValue({ quantity: data });

          if (Number(amount) < Number(paymentorderLImit.min)) {
            setState({
              amountminerr: true
            });
          } else if (Number(amount) > Number(paymentorderLImit.max)) {
            setState({
              amountmaxerr: true
            });
          } else {
            setState({
              amountminerr: false,
              amountmaxerr: false
            });
          }
        }
      } else {
        setState({
          amountminerr: false,
          amountmaxerr: false,
          serverOrderInfo: {}
        });
        setFieldsValue({
          quantity: '',
          amount: ''
        });
      }
      setState({
        currencyPrice: res.data
      });
      setState({
        loadingState: 'none',
        loadingVal: true,
        loadingMVal: true
      });
    } else {
    }
  };
  //获取当前-数量/金额 小数点限制
  const getCoinePrecision = async () => {
    const res = await getCurrencyPrecision(coineActive);
    if (res.code === 0) {
      setState({
        coinePrecision: res.data.quantityScale
      });
    }
  };
  const getCurrenciesPrecision = async () => {
    const res = await getPayPrecision(currenciesActive);
    if (res.code === 0) {
      if (res.data) {
        setState({
          currenciesPrecision: res.data.scale
        });
      }
    }
  };
  // 输入验证
  const amountValidationFun = values => {
    let re = new RegExp('^[0-9]+([.]{1}[0-9]{0,' + currenciesPrecision + '}){0,1}$');
    if (re.test(values.toString()) || values === '') {
      if (values !== '0.' && values !== '0' && values) {
        setState({
          orderTypeId: 1
        });

        delayedQuery(currenciesActive, coineActive, values, '', coinePrecision, paymentorderLImit);
        setState({
          loadingState: 'block'
        });
      } else {
        setState({
          amountminerr: false,
          amountmaxerr: false
        });
        delayedQuery(currenciesActive, coineActive, '', '', coinePrecision, paymentorderLImit);
      }
      setFieldsValue({ amount: values });
      return;
    } else {
      return getFieldValue('amount');
    }
  };
  const quantityValidationFun = values => {
    let re = new RegExp('^[0-9]+([.]{1}[0-9]{0,' + coinePrecision + '}){0,1}$');
    if (re.test(values.toString()) || values === '') {
      if (values !== '0.' && values !== '0' && values) {
        setState({
          orderTypeId: 2
        });
        delayedQuery(currenciesActive, coineActive, '', values, currenciesPrecision, paymentorderLImit);
      } else {
        delayedQuery(currenciesActive, coineActive, '', '', currenciesPrecision, paymentorderLImit);
      }
      setFieldsValue({ quantity: values });
      return;
    } else {
      return getFieldValue('quantity');
    }
  };
  //当前服务商所支持的图标
  const serverIcon = item => {
    let icon = '';
    if (item === 'moonpay') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmoonpay"></use>
        </svg>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmercuryo"></use>
        </svg>
      );
    }
    if (item === 'banxa') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconsanjiaoxing1"></use>
        </svg>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmercuryo"></use>
        </svg>
      );
    }
    if (item === 'simplex') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconsimplex"></use>
        </svg>
      );
    }
    if (item === 'menapay') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconMenapay"></use>
        </svg>
      );
    }
    return icon;
  };
  const serverSupportIcon = item => {
    let icon = '';
    if (item === 'moonpay') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconsamsung"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}

          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'banxa') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
        </>
      );
    }
    if (item === 'simplex') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'menapay') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>

          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    return icon;
  };
  //用户下单获取服务商信息
  const orderInfoMoneyInitial = async (c, m, id, a, q, t) => {
    let data = {
      currency: c,
      coinName: m,
      amount: t === 1 ? a : undefined,
      quantity: t === 2 ? q : undefined,
      acceptance: id
    };
    const res = await getPracticalPrice(data);
    if (res.code === 0) {
      setState({
        paymentId: res.data[0].acceptancePaymentMethod.id,
        serverOrderInfo: res.data[0]
      });
    }
  };
  const acceptanceCoins = async () => {
    const res = await getCreditCardSlect();
    if (res.code === 0) {
      setState({
        creditCardCoinList: res.data,
        currenciesActive: res.data[0].currencyName,
        creditCardCoinActive: 0,
        coineActive: res.data[0].coinNames[0]
      });
    }
  };

  return (
    <div>
      <TopBar>{formatMessage({ id: 'mc_creditCard_title' })}</TopBar>
      <div className={styles.creditCardContent}>
        <div className={styles.headerTitle}>
          <div className={styles.title}> {formatMessage({ id: 'mc_creditCard_title' })}</div>
          <div
            className={styles.order}
            onClick={() => {
              router.push(`/otc/creditCardOrder`);
            }}
          >
            <i className="iconfont iconh5_order"></i>
            {formatMessage({ id: 'swap.order.tab.orderHistory' })}
          </div>
        </div>
        <div className={styles.currencyPrice}>
          <div className={styles.price}>
            {currencyPrice && (
              <>
                {coineActive} {formatMessage({ id: 'mc_creditCard_price' })}
                <span className={styles.coin}>
                  {currencyPrice}
                  <span className={styles.coin}>
                    {currenciesActive}/{coineActive}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
        <div className={styles.creditCardVal}>
          <div className={styles.creditCardList}>
            <div className={styles.listTitle}> {formatMessage({ id: 'mc_creditCard_pay' })}</div>
            <InputItem
              className={styles.input}
              type="text"
              {...getFieldProps('amount', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'auth.captcha.require' })
                  }
                ]
              })}
              placeholder={formatMessage({ id: 'mc_creditCard_pay_placeholder' })}
              editable={loadingMVal}
              onChange={e => {
                amountValidationFun(e);
              }}
              extra={
                <div className={styles.extraContent} onClick={openPayCoin}>
                  {currenciesActive}
                  <span className={styles.coinIcon}>
                    <i className="iconfont icondrop"></i>
                  </span>
                </div>
              }
            ></InputItem>
          </div>

          <p className={styles.err}>
            {amountminerr && (
              <span>
                {formatMessage({ id: 'mc_otc_creditCard_minMoneyPrompnt' }, { name: paymentorderLImit.min })}
                {currenciesActive}
              </span>
            )}
            {amountmaxerr && (
              <span>
                {formatMessage({ id: 'mc_otc_creditCard_maxMoneyPrompnt' }, { name: paymentorderLImit.max })}
                {currenciesActive}
              </span>
            )}
          </p>
          <div className={styles.creditCardList}>
            <div className={styles.listTitle}>{formatMessage({ id: 'mc_creditCard_get' })}≈</div>
            <InputItem
              className={styles.input}
              type="text"
              {...getFieldProps('quantity', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'auth.captcha.require' })
                  }
                ]
              })}
              placeholder={formatMessage({ id: 'otcfiat.buy.bought_placeHold' })}
              onChange={e => {
                quantityValidationFun(e);
              }}
              editable={loadingVal}
              extra={
                <div className={styles.extraContent} onClick={openFaitCoin}>
                  {coineActive}
                  <span className={styles.coinIcon}>
                    <i className="iconfont icondrop"></i>
                  </span>
                </div>
              }
            ></InputItem>
          </div>
          <div className={styles.serverContent}>
            <div className={styles.serverTitle}>{formatMessage({ id: 'mc_creditCard_server' })}</div>
            <div
              className={styles.serverList}
              onClick={() => {
                setState({
                  layerServer: 'block'
                });
              }}
            >
              <div className={styles.headerContent}>
                {serverIcon(checkedId)}
                <div className={styles.serverName}>{checkedId}</div>
                <div className={styles.serverSelectIcon}>
                  <i className="iconfont icondrop"></i>
                </div>
              </div>
              <div className={classNames([styles.serverIconList, styles.flexWrap])}>{serverSupportIcon(checkedId)}</div>
            </div>
          </div>

          <div className={styles.coinMoney}>
            <span>
              {formatMessage({ id: 'mc_creditCard_getCoin' })}:
              <span className={styles.coin}>{serverOrderInfo.amount ? serverOrderInfo.amount : '--'}</span>
            </span>
            <span className={styles.coin}>{currenciesActive}</span>
            <br />
            <span>
              {formatMessage({ id: 'mc_creditCard_all' })}:
              <span className={styles.coin}>{serverOrderInfo.quantity ? serverOrderInfo.quantity : '--'}</span>
            </span>
            <span className={styles.coin}>{coineActive}</span>
          </div>
          <div className={styles.creditTips}>{formatMessage({ id: 'mc_credit_buy_tips' })}</div>
          <div className={styles.coinAddresss}>
            <p>{formatMessage({ id: 'mc_creditCard_assets' })}</p>
            <span>{coinRechargeAddress}</span>
          </div>

          <Button
            type="primary"
            disabled={buyQuantity && !amountminerr && !amountmaxerr && paymentId ? false : true}
            onClick={() => checkAccount()}
            style={{ marginTop: 30 }}
          >
            {formatMessage({ id: 'common.yes' })}
          </Button>
        </div>
      </div>

      <div style={{ display: layerTypeBlock }} className={styles.coinModel}>
        <div className={styles.layer}></div>
        <div className={styles.creditCardCoin}>
          <div className={styles.headerCoin}>
            <div className={styles.filterTitle}>{formatMessage({ id: 'assets.selected.coin' })}</div>
            <div
              onClick={() => {
                setState({
                  layerTypeBlock: 'none'
                });
              }}
            >
              <i className="iconfont iconquxiao1"></i>
            </div>
          </div>
          <div className={styles.creditCoin}>
            <SearchBar
              placeholder={formatMessage({ id: 'common.search' })}
              showCancelButton={false}
              cancelText={formatMessage({ id: 'common.cancel' })}
              onChange={e => {
                searchCoin(e);
              }}
            />
            <div className={styles.filterList}>
              {
                // selectCoin && filterCoin()
              }
              {layerType === 2 ? filterFiatCoin() : filterCoin()}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.loading} style={{ display: loadingState }}>
        <Icon type="loading" />
      </div>
      <ServiceProviders serviceProvidersList={serviceProvidersList} checkedId={checkedId} setState={setState} layerServer={layerServer} />
      <CreditCardModel checkedId={checkedId} promptMode={promptMode} placeTheOrder={placeTheOrder} setState={setState} />
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  otcuser: otc.otcuser
}))(createForm()(QuickTrading));
