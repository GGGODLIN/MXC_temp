import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { Button, InputItem, Modal } from 'antd-mobile';
import { createForm } from 'rc-form';
import { getQuickOrderInfo, getOtcAssets, putQuickOrder, postQuickOrder, getMethodOfPayment } from '@/services/api';
import { getSubSite, numberFormat, numbervalAccuracy, multiply, cutFloatDecimal } from '@/utils';
import { List, Toast } from 'antd-mobile';
import router from 'umi/router';
const Item = List.Item;
const language = getLocale();
function Quick(props) {
  const {
    userAsstes,
    setUserAsstes,
    tradingOffer,
    setTradingOffer,
    payPrecision,
    coinPrecision,
    otcuser,
    user,
    dispatch,
    allPaymentList
  } = props;
  const { getFieldProps } = props.form;
  const { tabActiveType, coinActive, currency } = props;
  const [tradingType, setTradingType] = useState(1);
  // const [tradingOffer, setTradingOffer] = useState({});
  const [tradingAmount, setTradingAmount] = useState('');
  const [tradingQuantity, setTradingQuantity] = useState('');
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [quickTrading, setQuickTrading] = useState([]);
  const [userPayment, setUserPayment] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState();
  const [buyTradingVisible, setBuyTradingVisible] = useState('block');
  const [sellTradingVisible, setSellTradingVisible] = useState('none');
  useEffect(() => {
    if (coinActive && currency) {
      getMarketPriceInfo();
    }
  }, [coinActive, currency]);
  useEffect(() => {
    if (otcuser.uid && coinActive) {
      getAsstes();
    }
  }, [coinActive, otcuser.uid]);

  const userPaymentList = async advertisingInfo => {
    const res = await getMethodOfPayment();
    let data = [];
    if (res.code === 0) {
      res.data.forEach(element => {
        advertisingInfo.forEach(item => {
          if (element.payMethod == item.payMethod.id && element.state === 1) {
            data.push({
              id: element.id,
              payMethod: item.payMethod,
              account: element.account,
              orderId: item.orderId,
              price: item.price,
              quantity: item.quantity,
              amount: item.amount
            });
          }
        });
      });
      setUserPayment(data);
    }
  };
  const getMarketPriceInfo = async () => {
    let params = {
      currency: currency,
      coinName: coinActive
    };
    const res = await getQuickOrderInfo(params);
    if (res.code === 0) {
      setTradingOffer(res.data.m);

      dispatch({
        type: 'otc/changeReferencePrice',
        payload: res.data.m
      });
    }
  };
  const getAsstes = async () => {
    const res = await getOtcAssets(coinActive);
    if (res.code === 0) {
      if (res.data) {
        setUserAsstes(res.data);
        dispatch({
          type: 'otc/getCoinNameBalances',
          payload: res.data
        });
      }
    }
  };
  const amountOnChange = e => {
    let re = new RegExp('^(0|[1-9][0-9]*)(\\.[0-9]{0,' + payPrecision.scale + '})?$');
    if (re.test(e.toString()) || e === '') {
      setTradingAmount(e);
    }
  };

  const quantityOnChange = e => {
    let re = new RegExp('^(0|[1-9][0-9]*)(\\.[0-9]{0,' + coinPrecision.quantityScale + '})?$');
    if (re.test(e.toString()) || e === '') {
      setTradingQuantity(e);
    }
  };
  const placeTheOrder = async () => {
    if (otcuser.kycLevel < 1) {
      Toast.info(formatMessage({ id: 'ucenter.setting.banks.tip' }), 2);
      router.push(`/ucenter/id-auth`);
      return;
    }
    if (otcuser.setPaymentInfo === false) {
      Toast.info(formatMessage({ id: 'otc.pleace.checksetPayment' }), 2);
      router.push(`/otc/paymentMethods`);
      return;
    }
    let params = {
      amount: tradingAmount,
      quantity: tradingQuantity,
      currency: currency,
      coinName: coinActive,
      tradeType: tabActiveType
    };
    const res = await putQuickOrder(params);
    if (res.code === 0) {
      setQuickTrading(res.data);
      userPaymentList(res.data);
      setCurrencyVisible(true);
    }
  };
  const quickTradingOnchange = async item => {
    let params = {
      orderId: item.orderId,
      amount: tradingType === 1 ? item.amount : undefined,
      quantity: tradingType === 2 ? item.quantity : undefined,
      userConfirmPaymentId: paymentInfo ? paymentInfo.id : ''
    };
    const res = await postQuickOrder(params);
    if (res.code === 0) {
      router.push({
        pathname: `/otc/placeTheOrder/${res.data}`
      });
    }
  };
  const PaymentListClick = item => {
    setPaymentInfo(item);
    setSellTradingVisible('block');
    setBuyTradingVisible('none');
  };
  const sellAllMoneyClick = () => {
    let money = userAsstes.availableBalance * tradingOffer.sell;
    setTradingAmount(money);
  };
  const sellAllClick = () => {
    if (userAsstes.availableBalance) {
      setTradingQuantity(userAsstes.availableBalance);
    }
  };
  const quickPaymentList = () => {
    return quickTrading.map(item => {
      return (
        <List className="my-list" key={item.orderId}>
          <Item
            arrow="horizontal"
            extra={
              <div className={classNames([item.isBestPrice ? styles.tradingOptimal : ''])}>
                {item.amount} {currency}
              </div>
            }
            onClick={() => {
              quickTradingOnchange(item);
            }}
          >
            <span className={styles.ListContentName}>
              {language.startsWith('zh') ? item.payMethod.nameCn : item.payMethod.nameEn}
              {item.isBestPrice ? <div className={styles.tradingOptimalPrice}> {formatMessage({ id: 'mc_otc_trading_price' })}</div> : ''}
            </span>
          </Item>
        </List>
      );
    });
  };
  const sellQuickPaymentList = () => {
    return userPayment.map(item => {
      return (
        <List className="my-list" key={item.id}>
          <Item
            arrow="horizontal"
            extra={<div className={classNames([item.isBestPrice ? styles.tradingOptimal : ''])}>{item.account}</div>}
            onClick={() => {
              PaymentListClick(item);
            }}
          >
            <span className={styles.ListContentName}>{fiatPaymentType(item.payMethod.id)}</span>
          </Item>
        </List>
      );
    });
  };
  const fiatPaymentType = pay => {
    let iconUrl = '';
    let payIcon = allPaymentList.find(item => item.id == pay);
    if (payIcon) {
      iconUrl = (
        <>
          <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
          <span className={styles.paymentName}>{language.startsWith('zh') ? payIcon.nameCn : payIcon.nameEn}</span>
        </>
      );
    }
    return iconUrl;
  };

  const paymentTooltip = item => {
    const paymentMaps = {
      1: (
        <span>
          <i className="iconfont iconPX-yinhang"></i>
          <span>{formatMessage({ id: 'otc.order.bank' })}</span>
        </span>
      ),
      2: (
        <span>
          <i className="iconfont iconPX-zhifubao"></i>
          {formatMessage({ id: 'otc.order.Alipay' })}
        </span>
      ),
      3: (
        <span>
          <i className="iconfont iconPX-weixin"></i>
          {formatMessage({ id: 'otc.order.wechat' })}
        </span>
      )
    };
    return paymentMaps[item];
  };
  return (
    <div>
      <div className={styles.quickContent}>
        <div className={styles.quickHeaderTab}>
          <span
            className={classNames([tradingType === 1 ? styles.tabActive : ''])}
            onClick={() => {
              setTradingType(1);
              setTradingAmount('');
              setTradingQuantity('');
            }}
          >
            {tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.money' }) : formatMessage({ id: 'otc.title.sellAmount' })}
          </span>
          <span
            className={classNames([tradingType === 2 ? styles.tabActive : ''])}
            onClick={() => {
              setTradingAmount('');
              setTradingQuantity('');
              setTradingType(2);
            }}
          >
            {tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.quantity' }) : formatMessage({ id: 'otc.title.sellQuantity' })}
          </span>
        </div>
        <div className={styles.quickPrice}>
          <div>{formatMessage({ id: 'otc.title.price' })}</div>
          {tabActiveType === 'BUY' ? (
            <div>
              {tradingOffer.buy} {currency}
            </div>
          ) : (
            <div>
              {tradingOffer.sell} {currency}
            </div>
          )}
        </div>
        <div className={styles.quickImport}>
          <List className="my-list">
            {tradingType === 1 ? (
              <InputItem
                {...getFieldProps('preice')}
                placeholder={
                  tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.mount' }) : formatMessage({ id: 'otc.quick.sellmoney' })
                }
                clear={true}
                value={tradingAmount}
                extra={
                  <div className={styles.valuationALL}>
                    <span>{currency}</span>
                    {tabActiveType === 'SELL' ? (
                      <>
                        <span className={styles.line}>|</span>
                        <span
                          className={styles.allQuantity}
                          onClick={() => {
                            sellAllMoneyClick();
                          }}
                        >
                          {formatMessage({ id: 'fin.common.all' })}
                        </span>
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                }
                onChange={e => {
                  amountOnChange(e);
                }}
              ></InputItem>
            ) : (
              <InputItem
                {...getFieldProps('quantity')}
                placeholder={
                  tabActiveType === 'BUY' ? formatMessage({ id: 'otc.quick.buyquantity' }) : formatMessage({ id: 'otc.quick.sellquantity' })
                }
                clear={true}
                value={tradingQuantity}
                extra={
                  <div className={styles.valuationALL}>
                    <span>{coinActive}</span>
                    {tabActiveType === 'SELL' ? (
                      <>
                        <span className={styles.line}>|</span>
                        <span
                          className={styles.allQuantity}
                          onClick={() => {
                            sellAllClick();
                          }}
                        >
                          {formatMessage({ id: 'fin.common.all' })}
                        </span>
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                }
                onChange={e => {
                  quantityOnChange(e);
                }}
              ></InputItem>
            )}
          </List>
        </div>
        <div className={styles.quickBalance}>
          <div>
            <span>{formatMessage({ id: 'otcfiat.account.alance' })}</span>
            <span>
              {userAsstes.availableBalance ? cutFloatDecimal(userAsstes.availableBalance, 2) : '---'} {coinActive}
            </span>
            <span
              onClick={() => {
                router.push(`/uassets/transfer?type=otc`);
              }}
            >
              {formatMessage({ id: 'assets.transfer' })}
            </span>
          </div>
        </div>
        <div className={styles.quickBtn}>
          {tabActiveType === 'SELL' ? (
            <Button
              type="warning"
              disabled={tradingQuantity || tradingAmount ? false : true}
              onClick={() => {
                placeTheOrder();
              }}
            >
              {formatMessage({ id: 'otc.quick.sellBtn' })}
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={tradingQuantity || tradingAmount ? false : true}
              onClick={() => {
                placeTheOrder();
              }}
            >
              {formatMessage({ id: 'otc.quick.buyBtn' })}
            </Button>
          )}
        </div>
      </div>
      <Modal
        popup
        animationType="slide-up"
        visible={currencyVisible}
        onClose={() => {
          setSellTradingVisible('none');
          setBuyTradingVisible('block');
          setCurrencyVisible(false);
        }}
      >
        <div className={styles.modelContent} style={{ display: buyTradingVisible }}>
          <div className={styles.paymentModelTitle}>{formatMessage({ id: 'otc.order.Method' })}</div>
          {tabActiveType === 'SELL' ? (
            <div className={styles.ListContent}>{sellQuickPaymentList()}</div>
          ) : (
            <div className={styles.ListContent}>{quickPaymentList()}</div>
          )}
        </div>
        <div className={styles.sellSelctPaymentContent} style={{ display: sellTradingVisible }}>
          <div className={styles.buySellHeader}>
            <div
              onClick={() => {
                setSellTradingVisible('none');
                setBuyTradingVisible('block');
              }}
            >
              <i className="iconfont iconfanhui"></i>
              <span className={styles.headerPrompnt}>{formatMessage({ id: 'otc.order.checkPayment' })}</span>
            </div>
            <div>{/* 关闭 */}</div>
          </div>
          <div className={styles.listContent}>
            <List className="my-list">
              <Item
                extra={
                  <div>{paymentInfo ? (language.startsWith('zh') ? paymentInfo.payMethod.nameCn : paymentInfo.payMethod.nameEn) : ''}</div>
                }
                onClick={() => {}}
              >
                <span className={styles.ListContentName}>{formatMessage({ id: 'otc.order.Payment' })}</span>
              </Item>
            </List>
            <List className="my-list">
              <Item extra={<div>{`${paymentInfo ? paymentInfo.price : ''} ${currency}/${coinActive}`}</div>} onClick={() => {}}>
                <span className={styles.ListContentName}>{formatMessage({ id: 'otc.order.dealPrice' })}</span>
              </Item>
            </List>
            <List className="my-list">
              <Item extra={<div>{`${paymentInfo ? paymentInfo.quantity : ''} ${coinActive}`}</div>} onClick={() => {}}>
                <span className={styles.ListContentName}>{formatMessage({ id: 'otc.order.dealNumber' })}</span>
              </Item>
            </List>
            <List className="my-list">
              <Item extra={`${paymentInfo ? paymentInfo.amount : ''} ${currency}`} onClick={() => {}}>
                <span className={styles.ListContentName}>{formatMessage({ id: 'otc.order.dealMoney' })}</span>
              </Item>
            </List>
            <div className={styles.footerBtn}>
              <Button
                type="primary"
                onClick={() => {
                  quickTradingOnchange(paymentInfo);
                }}
              >
                {formatMessage({ id: 'otc.order.dealsellBtn' })}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  allPaymentList: otc.allPaymentList,
  payPrecision: otc.payPrecision,
  coinPrecision: otc.precision,
  otcuser: otc.otcuser
}))(createForm()(Quick));
