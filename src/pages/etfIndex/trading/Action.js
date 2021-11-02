import { useEffect, useReducer } from 'react';
import { connect } from 'dva';
import Slider from 'rc-slider';
import { Button, InputItem, Toast, Modal } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { getETFIndexConfigLimit, postETFIndexOrder } from '@/services/api';
import { cutFloatDecimal, toFixedPro, gotoLogin } from '@/utils';
import classNames from 'classnames';

import styles from './Action.less';

const lang = getLocale();

const RcSlider = Slider.createSliderWithTooltip(Slider);

const initialState = {
  tradeLimit: {},
  tabKey: 'bids',
  bidAmount: '',
  askAmount: '',
  bidSliderVal: 0,
  askSliderVal: 0,
  tipsVisible: false,
  flag: true
};

const reducer = (state, payload) => {
  return { ...state, ...payload };
};

const Action = ({ etfItem, netValues, theme, balances = {}, dispatch, user, actionType }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { tradeLimit, tabKey, bidAmount, askAmount, bidSliderVal, askSliderVal, tipsVisible, flag } = state;
  const _etfCurr = etfItem.symbol ? etfItem.symbol.split('_')[0] : '';
  const bidsBalance = balances['USDT'] ? Number(cutFloatDecimal(balances['USDT'].available, 4)) : 0;
  const asksBalance = balances[_etfCurr] ? Number(cutFloatDecimal(balances[_etfCurr].available, 4)) : 0;

  useEffect(() => {
    setState({ tabKey: actionType });
  }, [actionType]);

  useEffect(() => {
    if (etfItem.symbol) {
      getLimit(etfItem.symbol);

      if (user.id) {
        getAssets(_etfCurr);
      }
    }
  }, [etfItem, user]);

  const getAssets = async curr => {
    dispatch({
      type: 'assets/getAssetBalance',
      payload: {
        currency: `USDT,${curr}`
      }
    });
  };

  const getLimit = async curr => {
    const { code, data } = await getETFIndexConfigLimit(curr);

    if (code === 200 && data) {
      setState({ tradeLimit: data });
    }
  };

  const sliderChange = (val, type) => {
    if (!user.id) return false;

    if (type === 'bids') {
      const q = Number(cutFloatDecimal((bidsBalance * val) / 100, 4));

      setState({
        bidSliderVal: val,
        bidAmount: q
      });
    } else {
      const q = Number(cutFloatDecimal((asksBalance * val) / 100, 4));

      setState({
        askSliderVal: val,
        askAmount: q
      });
    }
  };

  const validPrice = (val, priceScale) => {
    const reg = new RegExp(`^(0|[1-9][0-9]*)(\\.[0-9]{0,${priceScale}})?$`);

    if (val === '') {
      return true;
    }
    return reg.test(val);
  };

  const onFieldChange = (value, field) => {
    if (!user.id) return false;
    if (!validPrice(value, 4)) return false;

    const p = field === 'bidAmount' ? cutFloatDecimal(bidsBalance, 4) : cutFloatDecimal(asksBalance, 4);
    const val = Number(value);
    const q = val > p ? p : val;
    const valKey = field === 'bidAmount' ? 'bidSliderVal' : 'askSliderVal';

    setState({
      [valKey]: Math.ceil((100 * q) / p),
      [field]: value
    });
  };

  const onBtnPriceChange = dir => {
    if (!user.id) return false;

    const scale = 4;
    const _dir = dir < 0 ? 1 : -1;
    const baseNum = _dir * Math.pow(10, -1 * scale);

    if (tabKey === 'bids') {
      const value = toFixedPro(bidAmount - baseNum, scale);

      setState({ bidAmount: value <= 0 ? 0 : value });
    } else {
      const value = toFixedPro(askAmount - baseNum, scale);

      setState({ askAmount: value <= 0 ? 0 : value });
    }
  };

  const validSubmitAmount = e => {
    if (tabKey === 'bids') {
      if (bidAmount > bidsBalance) {
        Toast.fail(formatMessage({ id: 'etfIndex.bids.limit.max' }));
      } else if (bidAmount < Number(tradeLimit.subscribeMin)) {
        Toast.fail(
          `${formatMessage({ id: 'etfIndex.action.limit.min' })}${formatMessage({ id: 'etfIndex.bid.price' })}${tradeLimit.subscribeMin}`
        );
      } else if (bidAmount > Number(tradeLimit.subscribeMax)) {
        Toast.fail(
          `${formatMessage({ id: 'etfIndex.action.limit.max' })}${formatMessage({ id: 'etfIndex.bid.price' })}${tradeLimit.subscribeMax}`
        );
      } else {
        switchTipsVisble();
      }
    } else {
      if (askAmount > asksBalance) {
        Toast.fail(formatMessage({ id: 'etfIndex.asks.limit.max' }));
      } else if (askAmount < Number(tradeLimit.redemptionMin)) {
        Toast.fail(
          `${formatMessage({ id: 'etfIndex.action.limit.min' })}${formatMessage({ id: 'etfIndex.ask.price' })}${tradeLimit.redemptionMin}`
        );
      } else if (askAmount > Number(tradeLimit.redemptionMax)) {
        Toast.fail(
          `${formatMessage({ id: 'etfIndex.action.limit.max' })}${formatMessage({ id: 'etfIndex.ask.price' })}${tradeLimit.redemptionMax}`
        );
      } else {
        switchTipsVisble();
      }
    }
  };

  const switchTipsVisble = e => {
    setState({ tipsVisible: !tipsVisible });
  };

  const submitHandle = async e => {
    if (!flag) return false;
    setState({ flag: false });

    const type = tabKey === 'bids' ? 'subscribe' : 'redemption';
    const params = {
      orderSource: 'APP',
      price: netValues.netValue || 0,
      symbol: etfItem.symbol,
      tradeType: type
    };

    if (type === 'subscribe') {
      params.amount = bidAmount;
    } else {
      params.quantity = askAmount;
    }

    const { code } = await postETFIndexOrder(params);

    if (code === 200) {
      Toast.success(formatMessage({ id: 'trade.entrust.place_success' }));
      setState({ flag: true });

      getAssets(_etfCurr);
      dispatch({
        type: 'etfIndex/getEtfOrderList',
        payload: {
          currency: _etfCurr,
          tradeType: type,
          pageSize: 10,
          pageNum: 1
        }
      });
      dispatch({
        type: 'etfIndex/save',
        payload: {
          orderType: type
        }
      });

      if (type === 'subscribe') {
        setState({
          bidSliderVal: 0,
          bidAmount: ''
        });
      } else {
        setState({
          askSliderVal: 0,
          askAmount: ''
        });
      }
      switchTipsVisble();
    }
  };

  return (
    <>
      <div className={styles.tab}>
        <div className={classNames(tabKey === 'bids' && styles.bids)} onClick={e => setState({ tabKey: 'bids' })}>
          {formatMessage({ id: 'etfIndex.bid.title' })}
        </div>
        <div className={classNames(tabKey === 'asks' && styles.asks)} onClick={e => setState({ tabKey: 'asks' })}>
          {formatMessage({ id: 'etfIndex.ask.title' })}
        </div>
      </div>
      {tabKey === 'bids' ? (
        <div className={styles.content}>
          <div className={styles.price}>
            <div>
              <label htmlFor="">{formatMessage({ id: 'common.balance' })}</label>
              <span>{bidsBalance ? cutFloatDecimal(bidsBalance, 4) : '--'} USDT</span>
            </div>
            <div>
              <label>
                {formatMessage({ id: 'etfIndex.action.limit.min' })}
                {formatMessage({ id: 'etfIndex.bid.price' })}
              </label>
              <span>{tradeLimit.subscribeMin || '--'} USDT</span>
            </div>
            <div>
              <label>
                {formatMessage({ id: 'etfIndex.action.limit.max' })}
                {formatMessage({ id: 'etfIndex.bid.price' })}
              </label>
              <span>{tradeLimit.subscribeMax || '--'} USDT</span>
            </div>
            <div>
              <label>{formatMessage({ id: 'etfIndex.bid.fee' })}</label>
              <span>{tradeLimit.subscribeRate ? `${(Number(tradeLimit.subscribeRate) * 100).toFixed(2)}%` : '--'}</span>
            </div>
          </div>
          <div className={styles.inputWrap}>
            <InputItem
              className="price-input"
              value={bidAmount}
              placeholder={`${formatMessage({ id: 'etfIndex.bid.price' })}(USDT)`}
              extra={
                <span style={{ color: 'var(--up-color)', fontSize: 20 }} onClick={e => onBtnPriceChange(1)}>
                  +
                </span>
              }
              onChange={e => onFieldChange(e, 'bidAmount')}
            >
              <span style={{ fontSize: 20 }} onClick={e => onBtnPriceChange(-1)}>
                -
              </span>
            </InputItem>
          </div>
          <div className={styles.slider}>
            <RcSlider
              value={bidSliderVal}
              onChange={e => sliderChange(e, 'bids')}
              className={classNames(theme === 'light' && 'light-slider')}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
            />
          </div>
          <div className={styles.btnWrap}>
            {user.id ? (
              <Button type="primary" disabled={!bidsBalance} onClick={validSubmitAmount}>
                {formatMessage({ id: 'etfIndex.bid.submit' })}
              </Button>
            ) : (
              <Button type="primary" onClick={gotoLogin}>
                {formatMessage({ id: 'auth.to.signIn' })}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.price}>
            <div>
              <label htmlFor="">{formatMessage({ id: 'etfIndex.ask.share' })}</label>
              <span>
                {asksBalance ? cutFloatDecimal(asksBalance, 4) : '--'} {formatMessage({ id: 'labs.title.share' })}
              </span>
            </div>
            <div>
              <label>
                {formatMessage({ id: 'etfIndex.action.limit.min' })}
                {formatMessage({ id: 'etfIndex.ask.price' })}
              </label>
              <span>
                {tradeLimit.redemptionMin || '--'} {formatMessage({ id: 'labs.title.share' })}
              </span>
            </div>
            <div>
              <label>
                {formatMessage({ id: 'etfIndex.action.limit.max' })}
                {formatMessage({ id: 'etfIndex.ask.price' })}
              </label>
              <span>
                {tradeLimit.redemptionMax || '--'} {formatMessage({ id: 'labs.title.share' })}
              </span>
            </div>
            <div>
              <label>{formatMessage({ id: 'etfIndex.ask.fee' })}</label>
              <span>{tradeLimit.redemptionRate ? `${(Number(tradeLimit.redemptionRate) * 100).toFixed(2)}%` : '--'}</span>
            </div>
          </div>
          <div className={styles.inputWrap}>
            <InputItem
              className="price-input"
              value={askAmount}
              placeholder={`${formatMessage({ id: 'etfIndex.ask.price' })}(${formatMessage({ id: 'labs.title.share' })})`}
              extra={
                <span style={{ color: 'var(--up-color)', fontSize: 20 }} onClick={e => onBtnPriceChange(1)}>
                  +
                </span>
              }
              onChange={e => onFieldChange(e, 'askAmount')}
            >
              <span style={{ fontSize: 20 }} onClick={e => onBtnPriceChange(-1)}>
                -
              </span>
            </InputItem>
          </div>
          <div className={styles.slider}>
            <RcSlider
              value={askSliderVal}
              onChange={e => sliderChange(e, 'asks')}
              className={classNames(tabKey === 'asks' && 'ask-slider', theme === 'light' && 'light-slider')}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
            />
          </div>
          <div className={styles.btnWrap}>
            {user.id ? (
              <Button type="warning" disabled={!asksBalance} onClick={validSubmitAmount}>
                {formatMessage({ id: 'etfIndex.ask.submit' })}
              </Button>
            ) : (
              <Button type="warning" onClick={gotoLogin}>
                {formatMessage({ id: 'auth.to.signIn' })}
              </Button>
            )}
          </div>
        </div>
      )}
      <Modal
        transparent
        visible={tipsVisible}
        title={formatMessage({ id: 'ucenter.api.info.reminder' })}
        footer={[
          { text: formatMessage({ id: 'common.cancel' }), onPress: switchTipsVisble },
          { text: formatMessage({ id: 'common.yes' }), onPress: submitHandle }
        ]}
      >
        <div className={styles.desc}>
          <p>{formatMessage({ id: 'etfIndex.submit.confirm.text1' })}</p>
          <p>{formatMessage({ id: 'etfIndex.submit.confirm.text2' })}</p>
          <p>{formatMessage({ id: 'etfIndex.submit.confirm.text3' })}</p>
        </div>
      </Modal>
    </>
  );
};

export default connect(({ etfIndex, setting, auth, assets }) => ({
  ...etfIndex,
  theme: setting.theme,
  user: auth.user,
  balances: assets.currentPairBalance.balances
}))(Action);
