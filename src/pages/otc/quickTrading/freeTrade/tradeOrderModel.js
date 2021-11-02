import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './tradeOrderModel.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { Modal, InputItem, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import { getSubSite, numberFormat, numbervalAccuracy, multiply, cutFloatDecimal } from '@/utils';
import { List, Toast } from 'antd-mobile';
import router from 'umi/router';
import { postPlaceTheOrder, getMethodOfPayment } from '@/services/api';
const Item = List.Item;
const Brief = Item.Brief;
const language = getLocale();
function TradeOrderModel(props) {
  const {
    advertisingInfo,
    payPrecision,
    currency,
    userAsstes,
    coinActive,
    tabActiveType,
    tradingOffer,
    coinPrecision,
    allPaymentList
  } = props;
  const { getFieldProps } = props.form;
  const { tradeOrderVisible, setTradeOrderVisible } = props;
  const [tabActive, setTabActive] = useState(1);
  const [tradingAmount, setTradingAmount] = useState('');
  const [tradingQuantity, setTradingQuantity] = useState('');
  const [buyTradingVisible, setBuyTradingVisible] = useState('block');
  const [sellTradingVisible, setSellTradingVisible] = useState('none');
  const [paymetnIconType, setPaymetnIconType] = useState();
  const [sellPaymetnAccount, setSellPaymetnAccount] = useState();
  const [sellPaymetnId, setSellPaymetnId] = useState();

  const [userPayment, setUserPayment] = useState([]); //支付方式
  useEffect(() => {
    if (advertisingInfo.id) {
      userPaymentList();
    }
  }, [advertisingInfo]);
  // user payment
  const userPaymentList = async () => {
    const res = await getMethodOfPayment();
    let merchantPayment = [];
    let data = [];
    if (res.code === 0) {
      let paymentInfo = advertisingInfo.payMethod;
      merchantPayment = paymentInfo.split(',');

      res.data.forEach(element => {
        merchantPayment.forEach(item => {
          if (element.payMethod == item && element.state === 1) {
            data.push(element);
          }
        });
      });
      setUserPayment(data);
    }
  };
  const amountOnChange = e => {
    let re = new RegExp('^(0|[1-9][0-9]*)(\\.[0-9]{0,' + payPrecision.scale + '})?$');
    if (re.test(e.toString()) || e === '') {
      setTradingAmount(e);
      // setTradingQuantity(e);
      // let buyQuantity = advertisingInfo.price * e;

      let buyQuantity = multiply(e, 1 / advertisingInfo.price);
      console.log('获取', buyQuantity, advertisingInfo.price, e);
      let data = cutFloatDecimal(buyQuantity, coinPrecision.quantityScale);

      setTradingQuantity(data);
    }
  };

  const amountAllOnChange = e => {
    let re = new RegExp('^(0|[1-9][0-9]*)(\\.[0-9]{0,' + payPrecision.scale + '})?$');
    if (re.test(e.toString()) || e === '') {
      // setTradingAmount(e);
      let buyQuantity = advertisingInfo.price * e;
      // let buyQuantity = multiply(e, 1 / advertisingInfo.price);
      let data = cutFloatDecimal(buyQuantity, coinPrecision.quantityScale);
      setTradingQuantity(e);
      setTradingAmount(data);
    }
  };
  const buyAmountOnChange = e => {
    if (e < advertisingInfo.availableQuantity) {
      let assets = cutFloatDecimal(e, 2);
      let money = Number(assets) * Number(advertisingInfo.price);
      let allmoney = cutFloatDecimal(money, 2);
      setTradingAmount(allmoney);
      setTradingQuantity(assets);
    } else {
      let assets = cutFloatDecimal(advertisingInfo.availableQuantity, 2);
      let money = Number(assets) * Number(advertisingInfo.price);
      let allmoney = cutFloatDecimal(money, 2);
      setTradingAmount(allmoney);
      setTradingQuantity(assets);
    }
  };

  const quantityOnChange = e => {
    let re = new RegExp('^(0|[1-9][0-9]*)(\\.[0-9]{0,' + coinPrecision.quantityScale + '})?$');
    if (re.test(e.toString()) || e === '') {
      setTradingQuantity(e);
    }
    let buyAmount = multiply(e, advertisingInfo.price);
    let data = cutFloatDecimal(buyAmount, payPrecision.scale);
    setTradingAmount(data);
  };
  const sellQuantityOnChange = e => {
    setTradingQuantity(e);
    let buyAmount = multiply(e, advertisingInfo.price);
    let data = cutFloatDecimal(buyAmount, payPrecision.scale);
    setTradingAmount(data);
  };
  const placeTheOrderBtn = async () => {
    let params = {
      orderId: advertisingInfo.id,
      amount: tabActive === 1 ? tradingAmount : undefined,
      quantity: tabActive === 2 ? tradingQuantity : undefined,
      userConfirmPaymentId: sellPaymetnId
    };
    if (tabActiveType === 'SELL' && !sellPaymetnId) {
      Toast.info(formatMessage({ id: 'otc.pleace.checkPayment' }), 2, null, false);
      return;
    }
    const res = await postPlaceTheOrder(params);
    if (res.code === 0) {
      router.push({
        pathname: `/otc/placeTheOrder/${res.data}`
      });
      // router.push(`/otc/placeTheOrder/${res.data}`);
    } else {
      setTradingAmount('');
      setTradingQuantity('');
    }
  };
  const paymentTooltip = pay => {
    let payIcon = allPaymentList.find(item => item.id === pay);
    console.log(payIcon);
    return (
      <>
        <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
        <span className={styles.paymentName}>{language.startsWith('zh') ? payIcon.nameCn : payIcon.nameEn}</span>
      </>
    );
  };
  const fundCalculation = (m, p) => {
    let money = Number(m) * Number(p);
    let data = cutFloatDecimal(money, payPrecision?.scale || 2);
    return data;
  };
  const userPaymentClick = item => {
    setBuyTradingVisible('block');
    setSellTradingVisible('none');
    setPaymetnIconType(item.payMethod);
    setSellPaymetnAccount(item.account);
    setSellPaymetnId(item.id);
  };
  return (
    <div>
      <Modal
        popup
        animationType="slide-up"
        visible={tradeOrderVisible}
        onClose={() => {
          setTradeOrderVisible(false);
          setTradingAmount('');
          setTradingQuantity('');
          setPaymetnIconType('');
          setSellPaymetnAccount('');
          setSellTradingVisible('none');
          setBuyTradingVisible('block');
          setSellPaymetnId('');
        }}
      >
        <div className={styles.ModelContent}>
          <div className={styles.TradeOrderModelContent} style={{ display: buyTradingVisible }}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <span className={styles.title}>
                  {tabActiveType === 'BUY' ? formatMessage({ id: 'assets.discount.wraning.buy' }) : formatMessage({ id: 'otc.quick.sell' })}
                </span>
                <span className={styles.titleCoine}>{coinActive}</span>
                <p>
                  <span className={styles.titlePrice}>{formatMessage({ id: 'container.Theunit.price' })}：</span>
                  <span className={styles.titlePriceNumber}>
                    {numbervalAccuracy(advertisingInfo.price, payPrecision?.scale || 2)}
                    <span>{currency}</span>
                  </span>
                </p>
              </div>
              <div
                className={styles.headerRight}
                onClick={() => {
                  setTradeOrderVisible(false);
                  setTradingAmount('');
                  setTradingQuantity('');
                  setPaymetnIconType('');
                  setSellPaymetnAccount('');
                  setSellTradingVisible('none');
                  setBuyTradingVisible('block');
                  setSellPaymetnId('');
                }}
              >
                {formatMessage({ id: 'common.cancel' })}
              </div>
            </div>
            {tabActiveType === 'BUY' && <div className={styles.Placeprompnt}>{formatMessage({ id: 'mc_otc_trading_Prompt' })}</div>}

            <div className={styles.valuation}>
              <p>{formatMessage({ id: 'common.balance' })}</p>
              <div className={styles.valuationNumber}>
                <div className={styles.forecastMoney}>
                  <span className={styles.balanceColor}>
                    {`
                   ${cutFloatDecimal(userAsstes.availableBalance, coinPrecision.quantityScale || 2)}
                   ${coinActive}
                  `}
                  </span>

                  <span>
                    ≈{fundCalculation(userAsstes.availableBalance, tradingOffer.buy)}
                    {currency}
                  </span>
                </div>
                <div
                  className={styles.transfer}
                  onClick={() => {
                    router.push(`/uassets/transfer?type=otc`);
                  }}
                >
                  {formatMessage({ id: 'assets.transfer' })}
                </div>
                <div></div>
              </div>
            </div>

            <div className={styles.muaContent}>
              <div className={styles.titleBtn}>
                <span
                  className={classNames([tabActive === 1 ? styles.tabActive : ''])}
                  onClick={() => {
                    setTabActive(1);
                    setTradingAmount('');
                    setTradingQuantity('');
                  }}
                >
                  {tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.money' }) : formatMessage({ id: 'otc.title.sellAmount' })}
                </span>
                <span
                  className={classNames([tabActive === 2 ? styles.tabActive : ''])}
                  onClick={() => {
                    setTradingAmount('');
                    setTradingQuantity('');
                    setTabActive(2);
                  }}
                >
                  {tabActiveType === 'BUY'
                    ? formatMessage({ id: 'otcfiat.buy.quantity' })
                    : formatMessage({ id: 'otc.title.sellQuantity' })}
                </span>
              </div>
              {/* <div className={styles.titleBtn}>
                <span
                  className={classNames([tabActive === 1 ? styles.tabActive : ''])}
                  onClick={() => {
                    setTabActive(1);
                    setTradingAmount('');
                    setTradingQuantity('');
                  }}
                >
                  {tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.quantity' }) : formatMessage({ id: 'otc.title.sellQuantity' })}
                </span>
                <span
                  className={classNames([tabActive === 2 ? styles.tabActive : ''])}
                  onClick={() => {
                    setTradingAmount('');
                    setTradingQuantity('');
                    setTabActive(2);
                  }}
                >
                  {tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.money' }) : formatMessage({ id: 'otc.title.sellAmount' })}
                </span>
              </div>
             */}

              <div className={styles.valuationInput}>
                <List className="my-list">
                  {tabActive === 1 ? (
                    <InputItem
                      {...getFieldProps('preice')}
                      placeholder={
                        tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.mount' }) : formatMessage({ id: 'otc.quick.sellmoney' })
                      }
                      // placeholder={
                      //   tabActiveType === 'BUY'
                      //     ? formatMessage({ id: 'otc.quick.buyquantity' })
                      //     : formatMessage({ id: 'otc.quick.sellquantity' })
                      // }
                      clear={true}
                      value={tradingAmount}
                      extra={
                        <div className={styles.valuationALL}>
                          <span>{currency}</span>
                          <span>|</span>
                          {tabActiveType === 'BUY' ? (
                            <span
                              onClick={() => {
                                amountAllOnChange(advertisingInfo.availableQuantity);
                              }}
                            >
                              {formatMessage({ id: 'fin.common.all' })}
                            </span>
                          ) : (
                            <span
                              onClick={() => {
                                buyAmountOnChange(userAsstes.availableBalance);
                              }}
                            >
                              {formatMessage({ id: 'fin.common.all' })}
                            </span>
                          )}
                        </div>
                      }
                      onChange={e => {
                        amountOnChange(e);
                      }}
                    ></InputItem>
                  ) : (
                    <InputItem
                      {...getFieldProps('preice')}
                      placeholder={
                        tabActiveType === 'BUY'
                          ? formatMessage({ id: 'otc.quick.buyquantity' })
                          : formatMessage({ id: 'otc.quick.sellquantity' })
                      }
                      // placeholder={
                      //   tabActiveType === 'BUY' ? formatMessage({ id: 'otcfiat.buy.mount' }) : formatMessage({ id: 'otc.quick.sellmoney' })
                      // }
                      clear={true}
                      value={tradingQuantity}
                      extra={
                        <div className={styles.valuationALL}>
                          <span>{coinActive}</span>
                          <span>|</span>
                          {tabActiveType === 'BUY' ? (
                            <span
                              onClick={() => {
                                quantityOnChange(advertisingInfo.availableQuantity);
                              }}
                            >
                              {formatMessage({ id: 'fin.common.all' })}
                            </span>
                          ) : (
                            <span
                              onClick={() => {
                                sellQuantityOnChange(userAsstes.availableBalance);
                              }}
                            >
                              {formatMessage({ id: 'fin.common.all' })}
                            </span>
                          )}
                        </div>
                      }
                      onChange={e => {
                        quantityOnChange(e);
                      }}
                    ></InputItem>
                  )}
                </List>
                <div className={styles.valuationPrompnt}>
                  {formatMessage({ id: 'otc.order.limited' })}
                  <span>{numberFormat(advertisingInfo.minTradeLimit)}</span>
                  <span>-</span>
                  <span>{numberFormat(advertisingInfo.maxTradeLimit)}</span>
                  {currency}
                </div>
              </div>
              <div className={styles.footerNumber}>
                <div className={styles.orderMoney}>
                  <div>
                    {tabActiveType === 'SELL'
                      ? formatMessage({ id: 'mc_otc_trading_getAmount' })
                      : formatMessage({ id: 'otc.quick.needPayment' })}
                  </div>
                  <div className={styles.footerQuanting}>
                    {formatMessage({ id: 'otc.quick.tradingNumber' })}
                    <span>
                      {tradingQuantity ? tradingQuantity : '--'} {coinActive}
                    </span>
                  </div>
                </div>
                {tabActiveType === 'SELL' ? (
                  <div className={styles.selectPayment}>
                    <div>{formatMessage({ id: 'otc.order.checkPayment' })}</div>
                    <div
                      className={styles.footerQuanting}
                      onClick={() => {
                        setBuyTradingVisible('none');

                        setSellTradingVisible('block');
                      }}
                    >
                      <span>
                        {paymetnIconType && paymentTooltip(paymetnIconType)}
                        {sellPaymetnAccount ? sellPaymetnAccount : formatMessage({ id: 'otc.order.checkPayment' })}
                        <i className="iconfont iconjinru"></i>
                      </span>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className={styles.footer}>
              <div>
                {currency === 'CNY' ? '￥' : ''}
                <span>{tradingAmount ? tradingAmount : '- -'}</span>
              </div>
              <div>
                {tabActiveType === 'BUY' ? (
                  <Button
                    type="primary"
                    inline
                    className={classNames(['am-button-circle', styles.tradingBtn])}
                    onClick={() => placeTheOrderBtn()}
                  >
                    <span>{formatMessage({ id: 'assets.discount.wraning.buy' })}</span>
                  </Button>
                ) : (
                  <Button
                    type="warning"
                    inline
                    className={classNames(['am-button-circle', styles.tradingBtn])}
                    onClick={() => placeTheOrderBtn()}
                  >
                    <span>{formatMessage({ id: 'otc.quick.sell' })}</span>
                  </Button>
                )}
              </div>
            </div>
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
              {userPayment.map(item => {
                return (
                  <List className="my-list" key={item.id}>
                    <Item
                      arrow="horizontal"
                      extra={<div>{item.account}</div>}
                      onClick={() => {
                        userPaymentClick(item);
                      }}
                    >
                      <span className={styles.ListContentName}>{paymentTooltip(item.payMethod)}</span>
                    </Item>
                  </List>
                );
              })}
              <List className="my-list">
                <Item
                  arrow="horizontal"
                  onClick={() => {
                    router.push(`/otc/paymentMethods`);
                  }}
                >
                  {formatMessage({ id: 'otc.pleace.checksetPayment' })}
                </Item>
              </List>
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
  coinPrecision: otc.precision
}))(createForm()(TradeOrderModel));
