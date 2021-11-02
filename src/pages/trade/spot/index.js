import React, { useCallback, useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import cs from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, toFixedPro, timeToString } from '@/utils';
import memoize from 'memoize-one';
import { Button, Modal, Toast, InputItem } from 'antd-mobile';
import Slider from 'rc-slider';
import groupBy from 'lodash/groupBy';
import PricePercent from '@/components/PricePercent';
import Fiat from '@/components/Fiat';
import Empty from '@/components/Empty';
import Order from '../order';
import { cancelLimitOrder, cancelTriggerOrder, makeLimitOrder, makeTriggerOrder, deleteFavorite, addFavorite } from '@/services/api';
import Pairs from '../pairs';
import useCountDown from '@/components/CountDown/useCountDown.js';
import Tip from './Tip';

import styles from './index.less';
import iconMarketBidAsk from '@/assets/img/market-all.png';
import iconMarketBid from '@/assets/img/market-bids.png';
import iconMarketAsk from '@/assets/img/market-asks.png';

const toGroupPrice = (value, dec, dir) => {
  if (dec >= 0) {
    if (dir === 'bid') {
      return cutFloatDecimal(value, dec);
    } else {
      return cutFloatDecimal(Math.pow(10, -1 * dec) + value, dec);
    }
  } else {
    const pow = Math.pow(10, -1 * dec);
    if (dir === 'bid') {
      return Math.floor(value / pow) * pow;
    } else {
      return Math.ceil(value / pow) * pow;
    }
  }
};

const marketLength = 6;

const RcSlider = Slider.createSliderWithTooltip(Slider);

const getDecOptions = memoize(priceScale => {
  const decLength = priceScale >= 6 ? 6 : 4;
  const decOptions = new Array(decLength).fill(0).map((i, idx) => {
    const dec = priceScale - idx;
    const str =
      dec > 0
        ? formatMessage({ id: 'trade.markets.title.decimal' }, { dec })
        : formatMessage({ id: 'trade.markets.title.integer' }, { int: Math.abs(dec) + 1 });
    return {
      label: str,
      value: dec
    };
  });
  return decOptions;
});

const orderModes = [
  {
    label: formatMessage({ id: 'trade.box.limit_trade' }),
    value: 1
  },
  {
    label: formatMessage({ id: 'trade.entrust.title' }),
    value: 2
  }
];

const marketModes = [
  {
    label: formatMessage({ id: 'trade.spot.mode.all' }),
    value: 'askbid'
  },
  {
    label: formatMessage({ id: 'trade.spot.mode.ask' }),
    value: 'ask'
  },
  {
    label: formatMessage({ id: 'trade.spot.mode.bid' }),
    value: 'bid'
  }
];

function dealGroup(list, group, quantityScale, dir) {
  const map = groupBy(list, a => toGroupPrice(a.p, group, dir));
  const groupedList = Object.keys(map).map(k => {
    const g = map[k];
    let calcQuan = 0;
    for (let i = 0; i < g.length; i++) {
      calcQuan += g[i].q;
    }
    const price = group > 0 ? cutFloatDecimal(k, group) : k;
    return {
      p: +price,
      priceString: price,
      q: calcQuan,
      quanString: cutFloatDecimal(calcQuan, quantityScale)
    };
  });
  const sorted = groupedList.sort((a, b) => b.p - a.p);
  return sorted;
}

function calcBarLength(a, maxQuan) {
  a.barBgRight = ((maxQuan - a.q) / maxQuan) * 100 + '%';
}

function reducer(state, action) {
  return { ...state, ...action };
}

const Spot = ({
  dispatch,
  user,
  serverClientTimeDiff,
  currentPair,
  currentPairBalance,
  orders,
  triggerOrders,
  asks,
  bids,
  margins,
  location,
  theme,
  connectState
}) => {
  const symbol = `${currentPair.currency}_${currentPair.market}`;

  const _dir = location.state && location.state.dir ? location.state.dir : 'bid';
  const [direction, setDirection] = useState(_dir);

  const [pairsModalVisible, setPairsModalVisible] = useState(false);

  const [orderMode, setOrderMode] = useState(orderModes[0]);
  const [orderModeModalVisible, setOrderModeModalVisible] = useState(false);

  const [orderListMode, setOrderListMode] = useState(1);
  const [countdown] = useCountDown(currentPair.assessEndTime);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  // console.log(location, location.state, _dir);

  useEffect(() => {
    let interval;
    const [currency, market] = symbol.split('_');
    if (user.token && currency && market && connectState === 'ok') {
      dispatch({
        type: 'assets/getAssetBalance',
        payload: {
          currency: `${currency},${market}`,
          showProgress: false
        }
      });

      interval = window.setInterval(() => {
        dispatch({
          type: 'assets/getAssetBalance',
          payload: {
            currency: `${currency},${market}`,
            showProgress: false
          }
        });
      }, 30000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
    };
  }, [user.token, symbol, orders.length]);

  const [isPresale, setIsPresale] = useState(false);

  useEffect(() => {
    let interval;
    const { presaleEnable, openTime } = currentPair;
    if (presaleEnable === 1 && Date.now() + serverClientTimeDiff < openTime) {
      setIsPresale(true);
      interval = window.setInterval(() => {
        if (Date.now() + serverClientTimeDiff >= openTime) {
          window.clearInterval(interval);
          interval = null;
          setIsPresale(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
    };
  }, [symbol, currentPair.presaleEnable, currentPair.openTime, serverClientTimeDiff]);

  const [group, setGroup] = useState({
    label: formatMessage({ id: 'trade.markets.title.decimal' }, { dec: 8 }),
    value: 8
  });
  const [groupModalVisible, setGroupModalVisible] = useState(false);

  const decOptions = getDecOptions(currentPair.priceScale);
  useEffect(() => {
    setGroup(decOptions[0]);
  }, [symbol]);
  const shoudGroup = group.value !== decOptions[0].value && group.value <= currentPair.priceScale;

  const [marketMode, setMarketMode] = useState(marketModes[0]);
  const [marketModeModalVisible, setMarketModeModalVisible] = useState(false);

  let renderAsks = asks;
  let renderBids = bids;
  if (shoudGroup) {
    renderAsks = dealGroup(asks, group.value, currentPair.quantityScale, 'ask');
    renderBids = dealGroup(bids, group.value, currentPair.quantityScale, 'bid');
  }

  let maxQuan = 0;
  let sellReduceQuan = 0;
  let buyReduceQuan = 0;
  for (let j = renderAsks.length - 1; j >= 0; j--) {
    const a = renderAsks[j];
    if (maxQuan < a.q) {
      maxQuan = a.q;
    }
    sellReduceQuan += a.q;
    a.reduceQuan = sellReduceQuan;
    a.reduceQuanString = cutFloatDecimal(sellReduceQuan, currentPair.quantityScale);
  }
  for (let i = 0; i < renderBids.length; i++) {
    const b = renderBids[i];
    if (maxQuan < b.q) {
      maxQuan = b.q;
    }
    buyReduceQuan += b.q;
    b.reduceQuan = buyReduceQuan;
    b.reduceQuanString = cutFloatDecimal(buyReduceQuan, currentPair.quantityScale);
  }

  let askStop = '';
  for (let j = renderAsks.length - 1; j >= 0; j--) {
    let a = renderAsks[j];
    a.matchUserOrder = false;
    calcBarLength(a, maxQuan);
    if (!askStop) {
      askStop = a.priceString;
      a.shallowPrice = '';
      a.solidPrice = a.priceString;
    } else {
      const cs = askStop.substr(0, askStop.length - 2);
      const ns = a.priceString.substr(0, a.priceString.length - 2);
      if (cs === ns && ns) {
        a.shallowPrice = ns;
        a.solidPrice = a.priceString.substr(-2);
      } else {
        askStop = a.priceString;
        a.shallowPrice = '';
        a.solidPrice = a.priceString;
      }
    }
  }

  let bidStop = '';
  for (let i = 0; i < renderBids.length; i++) {
    let b = renderBids[i];
    b.matchUserOrder = false;
    calcBarLength(b, maxQuan);
    if (!bidStop) {
      bidStop = b.priceString;
      b.shallowPrice = '';
      b.solidPrice = b.priceString;
    } else {
      const cs = bidStop.substr(0, bidStop.length - 2);
      const ns = b.priceString.substr(0, b.priceString.length - 2);
      if (cs === ns && ns) {
        b.shallowPrice = ns;
        b.solidPrice = b.priceString.substr(-2);
      } else {
        bidStop = b.priceString;
        b.shallowPrice = '';
        b.solidPrice = b.priceString;
      }
    }
  }

  if (user.token && orders.length) {
    for (let i = 0; i < orders.length; i++) {
      const o = orders[i];
      o.currency = currentPair.currency;
      o.market = currentPair.market;
      if (orderListMode === 1) {
        o.percent = (100 * (o.quantity - o.remainQuantity)) / o.quantity;
        o.dealAmount = o.amount - o.remainAmount;
        o.dealAmountString = cutFloatDecimal(o.dealAmount, currentPair.priceScale);
        const p = o.dealAmount / (o.quantity - o.remainQuantity);
        o.avgPrice = p || 0;
        o.avgPriceString = cutFloatDecimal(o.avgPrice, currentPair.priceScale);
      }
      if (o.tradeType.toString() === '1') {
        for (let j = 0; j < renderBids.length; j++) {
          const b = renderBids[j];
          const nextB = renderBids[j + 1];
          if (o.price <= b.p && (!nextB || o.price > nextB.p)) {
            b.matchUserOrder = true;
            break;
          }
        }
      } else {
        for (let j = renderAsks.length - 1; j >= 0; j--) {
          const a = renderAsks[j];
          const nextA = renderAsks[j - 1];
          if (o.price >= a.p && (!nextA || o.price < nextA.p)) {
            a.matchUserOrder = true;
            break;
          }
        }
      }
    }
  }

  // 剪裁或填充列表
  if (marketMode.value === 'askbid') {
    renderAsks =
      renderAsks.length > marketLength
        ? renderAsks.slice(-1 * marketLength)
        : renderAsks.length < marketLength
        ? new Array(marketLength - renderAsks.length)
            .fill(0)
            .map(() => ({}))
            .concat(renderAsks)
        : renderAsks;
    renderBids =
      renderBids.length > marketLength
        ? renderBids.slice(0, marketLength)
        : renderBids.length < marketLength
        ? renderBids.concat(new Array(marketLength - renderBids.length).fill(0).map(() => ({})))
        : renderBids;
  } else if (marketMode.value === 'ask') {
    renderAsks =
      renderAsks.length > marketLength * 2
        ? renderAsks.slice(-1 * 2 * marketLength)
        : renderAsks.length < 2 * marketLength
        ? new Array(2 * marketLength - renderAsks.length)
            .fill(0)
            .map(() => ({}))
            .concat(renderAsks)
        : renderAsks;
  } else {
    renderBids =
      renderBids.length > marketLength * 2
        ? renderBids.slice(0, 2 * marketLength)
        : renderBids.length < 2 * marketLength
        ? renderBids.concat(new Array(2 * marketLength - renderBids.length).fill(0).map(() => ({})))
        : renderBids;
  }

  const newPrice = currentPair.c || 0;
  const rate = currentPair.rate || 0;
  const newPriceString = cutFloatDecimal(newPrice, currentPair.priceScale);

  const iconMarketSrc = marketMode.value === 'bid' ? iconMarketBid : marketMode.value === 'ask' ? iconMarketAsk : iconMarketBidAsk;

  const [inputState, dispatchInput] = useReducer(reducer, {
    priceInput: newPriceString,
    triggerPriceInput: newPriceString,
    quanInput: null,
    sliderValue: 0
  });

  let marketBalance = {};
  let currencyBalance = {};
  if (currentPairBalance.balances && currentPairBalance.balances[currentPair.market]) {
    marketBalance = currentPairBalance.balances[currentPair.market];
  }
  if (currentPairBalance.balances && currentPairBalance.balances[currentPair.currency]) {
    currencyBalance = currentPairBalance.balances[currentPair.currency];
  }

  useEffect(() => {
    const p = cutFloatDecimal(currentPair.c || 0, currentPair.priceScale);
    dispatchInput({
      priceInput: p,
      triggerPriceInput: p,
      quanInput: null,
      sliderValue: 0
    });
  }, [symbol]);

  const onBtnPriceChange = dir => {
    const { priceScale } = currentPair;
    const min = dir * Math.pow(10, -1 * priceScale);
    setChangeValue(toFixedPro((Number(inputState.priceInput) || 0) + min, priceScale), inputState.quanInput);
  };

  const onBtnQuanChange = dir => {
    const { quantityScale } = currentPair;
    const min = dir * Math.pow(10, -1 * quantityScale);
    setChangeValue(inputState.priceInput, toFixedPro((Number(inputState.quanInput) || 0) + min, quantityScale));
  };

  const onQuantityChange = value => {
    setChangeValue(inputState.priceInput, value, false);
  };

  const onPriceChange = value => {
    setChangeValue(value, inputState.quanInput || 0);
  };

  const onTriggerPriceChange = value => {
    dispatchInput({
      triggerPriceInput: value
    });
  };

  const onBtnTriggerPriceChange = dir => {
    const { priceScale } = currentPair;
    const min = dir * Math.pow(10, -1 * priceScale);
    dispatchInput({
      triggerPriceInput: cutFloatDecimal(toFixedPro((Number(inputState.triggerPriceInput) || 0) + min, priceScale), priceScale)
    });
  };

  const onSliderChange = val => {
    const { buyFeeRate } = currentPair;
    const { priceInput, quanInput } = inputState;
    const mb = marketBalance.available || 0;
    const cb = currencyBalance.available || 0;
    const p = Number(priceInput);
    let q = 0;
    if (!p) {
      return;
    }
    if (direction === 'bid') {
      q = (mb * (1 - buyFeeRate) * val) / 100 / p;
    } else {
      q = (cb * val) / 100;
    }
    setChangeValue(p, q);
  };

  const setChangeValue = (_p, _q, shouldCutQuan = true) => {
    const { buyFeeRate, quantityScale, priceScale } = currentPair;
    const mb = marketBalance.available || 0;
    const cb = currencyBalance.available || 0;
    let p = _p && isNaN(Number(_p)) ? 0 : _p;
    let q = _q && isNaN(Number(_q)) ? 0 : _q;
    let s = 0;
    if (direction === 'bid') {
      if (p * q > mb * (1 - buyFeeRate)) {
        q = (mb * (1 - buyFeeRate)) / p;
      }
      s = (100 * p * q) / (mb * (1 - buyFeeRate));
    } else {
      if (q - cb > 0) {
        q = cb;
      }
      s = (100 * q) / cb;
    }
    const shouldCutPrice = p.toString().indexOf('.') > -1 && p.toString().length - p.toString().indexOf('.') - 1 > priceScale;
    const shouldCutQuantity = q.toString().indexOf('.') > -1 && q.toString().length - q.toString().indexOf('.') - 1 > quantityScale;
    dispatchInput({
      priceInput: shouldCutPrice ? cutFloatDecimal(p, priceScale) : p,
      quanInput: shouldCutQuantity || shouldCutQuan ? cutFloatDecimal(q, quantityScale) : q,
      sliderValue: s
    });
  };

  const handleSelect = (dir, item) => {
    if (!user.token) {
      return;
    }
    if (direction === dir) {
      setChangeValue(item.priceString, item.reduceQuanString);
    } else {
      onPriceChange(item.priceString);
    }
  };

  const cancelOrder = id => {
    cancelLimitOrder({ id }).then(res => {
      if (res.code === 0 || res.code === 200) {
        Toast.success(formatMessage({ id: 'trade.entrust.cancel_success' }));
      }
    });
  };

  const cancelOpenTriggerOrder = id => {
    const { currency, market } = currentPair;
    cancelTriggerOrder({ id, market: `${currency}_${market}` }).then(res => {
      if (res.code === 0 || res.code === 200) {
        Toast.success(formatMessage({ id: 'trade.entrust.cancel_success' }));
      }
    });
  };

  const placeTriggerOrder = dir => {
    const { currency, market, c } = currentPair;
    const { priceInput, quanInput, triggerPriceInput } = inputState;
    const tradeType = dir === 'bid' ? 'BUY' : 'SELL';

    if (!(Number(priceInput) > 0) || !(Number(triggerPriceInput) > 0) || triggerPriceInput - c === 0) {
      Toast.fail(formatMessage({ id: 'trade.trade.invalid_price' }));
      return;
    }
    if (!(Number(quanInput) > 0)) {
      Toast.fail(formatMessage({ id: 'trade.trade.invalid_quantity' }));
      return;
    }

    const triggerDirection = triggerPriceInput - c > 0 ? 'GE' : 'LE';
    const params = {
      market: `${currency}_${market}`,
      triggerType: triggerDirection,
      triggerPrice: triggerPriceInput,
      tradeType,
      price: priceInput,
      quantity: quanInput
    };
    doPlaceTriggerOrder(params);
  };

  const doPlaceTriggerOrder = params => {
    setCreateOrderLoading(true);
    makeTriggerOrder(params).then(res => {
      if (res.code === 0 || res.code === 200) {
        Toast.success(formatMessage({ id: 'trade.entrust.place_success' }));
        dispatchInput({
          quanInput: 0,
          sliderValue: 0
        });
      }

      setCreateOrderLoading(false);
    });
  };

  const placeOrder = dir => {
    const { buyFeeRate, currency, market, c, priceScale } = currentPair;
    const { priceInput, quanInput } = inputState;
    const tradeType = dir === 'bid' ? 'BUY' : 'SELL';
    if (!(Number(priceInput) > 0)) {
      Toast.fail(formatMessage({ id: 'trade.trade.invalid_price' }));
      return;
    }
    if (!(Number(quanInput) > 0)) {
      Toast.fail(formatMessage({ id: 'trade.trade.invalid_quantity' }));
      return;
    }
    if (dir === 'bid' && priceInput * quanInput > marketBalance.available * (1 - buyFeeRate)) {
      Toast.fail(formatMessage({ id: 'trade.trade.invalid_quantity' }));
      return;
    }

    const params = {
      symbol: `${currency}_${market}`,
      tradeType,
      price: priceInput,
      quantity: quanInput
    };
    const diff = dir === 'bid' ? (priceInput - c) / c : (c - priceInput) / c;
    if (c && diff > 0.2) {
      const newPriceString = cutFloatDecimal(c, priceScale);
      const tip =
        dir === 'bid'
          ? formatMessage(
              {
                id: 'trade.modal.abnormal.buy_price'
              },
              {
                price: priceInput,
                newPriceString,
                market
              }
            )
          : formatMessage(
              {
                id: 'trade.modal.abnormal.sell_price'
              },
              {
                price: priceInput,
                newPriceString,
                market
              }
            );
      Modal.alert(formatMessage({ id: 'trade.modal.abnormal.title' }), tip, [
        {
          text: formatMessage({ id: 'common.cancel' }),
          onPress: () => console.log('cancel')
        },
        {
          text: formatMessage({ id: 'common.yes' }),
          onPress: () => {
            // console.log('ok');
            doPlaceLimitOrder(params);
          }
        }
      ]);
    } else {
      doPlaceLimitOrder(params);
    }
  };

  const showAssessModal = () => {
    Modal.alert(
      formatMessage({ id: 'market.assess.tip.title' }),
      <div style={{ textAlign: 'left' }}>
        <p>{formatMessage({ id: 'market.assess.tip.detail_1' })}</p>
        <p>{formatMessage({ id: 'market.assess.tip.detail_2' })}</p>
        <p>{formatMessage({ id: 'market.assess.tip.detail_3' })}</p>
        <p>{formatMessage({ id: 'market.assess.tip.detail_4' })}</p>
      </div>
    );
  };

  const doPlaceLimitOrder = params => {
    setCreateOrderLoading(true);
    makeLimitOrder(params).then(res => {
      if (res.code === 0 || res.code === 200) {
        Toast.success(formatMessage({ id: 'trade.entrust.place_success' }));
        dispatchInput({
          quanInput: 0,
          sliderValue: 0
        });
      }

      setCreateOrderLoading(false);
    });
  };

  const handleStarClick = () => {
    const { currency, market, favorite } = currentPair;
    const symbol = `${currency}_${market}`;
    if (favorite) {
      deleteFavorite({ symbol }, user.token).then(res => {
        dispatch({
          type: 'trading/getUserFavorites'
        });
      });
    } else {
      addFavorite({ symbol }, user.token).then(res => {
        dispatch({
          type: 'trading/getUserFavorites'
        });
      });
    }
  };

  const presaleLimitBuy = isPresale && currentPair.beforeOrderSide !== 'buy';
  const presaleLimitSell = isPresale && currentPair.beforeOrderSide !== 'sell' && currentPair.presaleMemberId !== user.id;

  const isAssess = currentPair.type === 'ASSESS';
  return (
    <>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.title}>
            <div className={styles.active}>{formatMessage({ id: 'header.trade_center' })}</div>
            <div onClick={() => router.push('/margin/spot')}>{formatMessage({ id: 'margin.title.margin' })}</div>
            <div onClick={() => router.push('/otc/quickTrading')}>{formatMessage({ id: 'download.title.fiat' })}</div>
          </div>
        </div>
        <div className={styles.pairWrapper}>
          <div className={styles.pairInner}>
            <span onClick={() => setPairsModalVisible(true)}>
              <i className="iconfont iconliebiaoxiangyou m-r-10"></i>
              <span>{currentPair.currency}</span>
              <span style={{ color: 'var(--main-text-1)' }}>/{currentPair.market}</span>
            </span>
            <Tip currentPair={currentPair} />
          </div>
          <div>
            <i
              className="iconfont iconhangqingx f-18 m-r-20"
              style={{ color: 'var(--main-text-1)' }}
              // onClick={() => router.push('/trade/spot-kline')}
              onClick={() => {
                router.push({
                  pathname: `/trade/spot-kline`,
                  hash: `#${currentPair.currency}_${currentPair.market}`
                });
              }}
            />
            <span onClick={handleStarClick}>
              {currentPair.favorite ? (
                <i className="iconfont iconzixuan-unselected f-18" style={{ color: 'var(--up-color)' }}></i>
              ) : (
                <i className="iconfont iconxingxing f-18" style={{ color: 'var(--main-text-1)' }}></i>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.assessWrapper}>
        {isAssess && (
          <div className={styles.assessCountDown} onClick={showAssessModal}>
            {formatMessage({ id: 'market.assess.countdown' })}:
            <span>
              {countdown.d} {formatMessage({ id: 'common.day' })} {countdown.h} {formatMessage({ id: 'common.hour' })} {countdown.m}{' '}
              {formatMessage({ id: 'common.min' })} {countdown.s} {formatMessage({ id: 'common.sen' })}
            </span>
          </div>
        )}
      </div>
      <div className={styles.middleWrapper}>
        <div className={styles.actionWrapper}>
          <div className={styles.actionHeader}>
            <div className={cs(styles.directionTitle, direction === 'bid' && styles.directionBid)} onClick={() => setDirection('bid')}>
              {formatMessage({ id: 'trade.box.buy' })}
            </div>
            <div className={cs(styles.directionTitle, direction === 'ask' && styles.directionAsk)} onClick={() => setDirection('ask')}>
              {formatMessage({ id: 'trade.box.sell' })}
            </div>
          </div>
          <div className={styles.modePicker} onClick={() => setOrderModeModalVisible(true)}>
            <span>{orderMode.label}</span>
            <i className="iconfont icondropdown m-l-5 f-12"></i>
          </div>
          {orderMode.value === 2 && (
            <div className="m-b-10">
              <InputItem
                type="digit"
                className="price-input"
                placeholder={formatMessage({ id: 'order.table.status.trigger.price' })}
                value={inputState.triggerPriceInput}
                onChange={val => onTriggerPriceChange(val)}
                extra={
                  <span style={{ color: '#00D38B' }} onClick={() => onBtnTriggerPriceChange(1)}>
                    +
                  </span>
                }
              >
                <span onClick={() => onBtnTriggerPriceChange(-1)}>-</span>
              </InputItem>
            </div>
          )}
          <div>
            <InputItem
              type="digit"
              className="price-input"
              placeholder={formatMessage({ id: 'trade.list.price' })}
              value={inputState.priceInput}
              onChange={val => onPriceChange(val)}
              extra={
                <span style={{ color: '#00D38B' }} onClick={() => onBtnPriceChange(1)}>
                  +
                </span>
              }
            >
              <span onClick={() => onBtnPriceChange(-1)}>-</span>
            </InputItem>
          </div>
          <div className="f-12 m-t-5 m-b-5">
            <span className="m-r-5" style={{ color: 'var(--main-text-1)' }}>
              {'≈'}
            </span>
            <span>
              <Fiat value={inputState.priceInput} market={currentPair.market} dec={2} />
            </span>
          </div>
          <div>
            <InputItem
              type="digit"
              className="price-input"
              placeholder={`${formatMessage({ id: 'assets.treaty.history.number' })}(${currentPair.currency})`}
              value={inputState.quanInput}
              onChange={val => onQuantityChange(val)}
              extra={
                <span style={{ color: '#00D38B' }} onClick={() => onBtnQuanChange(1)}>
                  +
                </span>
              }
            >
              <span onClick={() => onBtnQuanChange(-1)}>-</span>
            </InputItem>
          </div>
          <div className={styles.sliderWrapper}>
            <RcSlider
              className={cs(direction === 'ask' && 'ask-slider', theme === 'light' && 'light-slider')}
              value={inputState.sliderValue}
              onChange={val => onSliderChange(val)}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
            />
          </div>
          <div>
            <div className={cs(styles.amountWrapper, direction === 'ask' && styles.askAmount)}>
              <span>{`${formatMessage({ id: 'depths.list.amount' })}(${currentPair.market}): `}</span>
              <span>{cutFloatDecimal(inputState.priceInput * inputState.quanInput, currentPair.priceScale)}</span>
            </div>
          </div>
          <div className="m-t-15">
            {direction === 'bid' ? (
              <Button
                disabled={!user.id || presaleLimitBuy || createOrderLoading}
                className={'f-14'}
                type="primary"
                onClick={() => {
                  if (orderMode.value === 1) {
                    placeOrder('bid');
                  } else {
                    placeTriggerOrder('bid');
                  }
                }}
              >
                {formatMessage({ id: 'trade.box.buy' })}
              </Button>
            ) : (
              <Button
                disabled={!user.id || presaleLimitSell || createOrderLoading}
                className={'f-14'}
                type="warning"
                onClick={() => {
                  if (orderMode.value === 1) {
                    placeOrder('ask');
                  } else {
                    placeTriggerOrder('ask');
                  }
                }}
              >
                {formatMessage({ id: 'trade.box.sell' })}
              </Button>
            )}
          </div>
          <div className="m-t-15">
            {direction === 'bid' ? (
              <>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'trade.spot.action.available' })}</span>
                  <span>{`${cutFloatDecimal(marketBalance.available, currentPair.priceScale)} ${currentPair.market}`}</span>
                </div>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'trade.spot.action.frozen' })}</span>
                  <span>{`${cutFloatDecimal(marketBalance.frozen, currentPair.priceScale)} ${currentPair.market}`}</span>
                </div>
                <div className={styles.balanceSpliter}></div>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'assets.total.balances' })}</span>
                  <span>{`${cutFloatDecimal(marketBalance.total, currentPair.priceScale)} ${currentPair.market}`}</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'trade.spot.action.available' })}</span>
                  <span>{`${cutFloatDecimal(currencyBalance.available, currentPair.quantityScale)} ${currentPair.currency}`}</span>
                </div>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'trade.spot.action.frozen' })}</span>
                  <span>{`${cutFloatDecimal(currencyBalance.frozen, currentPair.quantityScale)} ${currentPair.currency}`}</span>
                </div>
                <div className={styles.balanceSpliter}></div>
                <div className={styles.balanceItem}>
                  <span>{formatMessage({ id: 'assets.total.balances' })}</span>
                  <span>{`${cutFloatDecimal(currencyBalance.total, currentPair.quantityScale)} ${currentPair.currency}`}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.marketsWrapper}>
          <div className={cs(styles.tableRow, styles.tableHeader)}>
            <div>{`${formatMessage({ id: 'trade.list.price' })}(${currentPair.market})`}</div>
            <div>{`${formatMessage({ id: 'assets.treaty.history.number' })}(${currentPair.currency})`}</div>
          </div>
          {marketMode.value !== 'bid' && (
            <div>
              {renderAsks.map((t, idx) => (
                <div
                  className={cs(styles.tableRow, orderMode.value === 2 && styles.triggerRow)}
                  key={t.priceString || idx}
                  onClick={e => handleSelect('bid', t)}
                >
                  {t.barBgRight && (
                    <div
                      style={{
                        transform: `translateX(${t.barBgRight})`
                      }}
                      className={cs(styles.bar, styles.askBar)}
                    ></div>
                  )}
                  {t.matchUserOrder && <div className={cs(styles.orderIndicator, styles.askIndicator)}></div>}
                  <div className={cs(styles.price, styles.sell)}>
                    {!t.priceString ? (
                      '--'
                    ) : (
                      <span>
                        <span className={styles.shallowPrice}>{t.shallowPrice}</span>
                        <span>{t.solidPrice}</span>
                      </span>
                    )}
                  </div>
                  <div className={cs(styles.vol)}>{t.quanString || '--'}</div>
                </div>
              ))}
            </div>
          )}
          <div className={styles.currentWrapper}>
            <div className={cs(styles.current, rate > 0 && styles.buy, rate < 0 && styles.sell)}>
              <span className="f-14">{newPriceString}</span>
              <span>{typeof rate !== 'number' ? '--' : <PricePercent value={rate}></PricePercent>}</span>
            </div>
            <div className="color-middle">
              <span className={styles.fiatPrice}>
                <Fiat value={newPrice} market={currentPair.market} dec={2} />
              </span>
            </div>
          </div>
          {marketMode.value !== 'ask' && (
            <div>
              {renderBids.map((t, idx) => (
                <div
                  className={cs(styles.tableRow, orderMode.value === 2 && styles.triggerRow)}
                  key={t.priceString || idx}
                  onClick={e => handleSelect('ask', t)}
                >
                  {t.barBgRight && (
                    <div
                      style={{
                        transform: `translateX(${t.barBgRight})`
                      }}
                      className={cs(styles.bar, styles.bidBar)}
                    ></div>
                  )}
                  {t.matchUserOrder && <div className={cs(styles.orderIndicator, styles.bidIndicator)}></div>}
                  <div className={cs(styles.price, styles.buy)}>
                    {!t.priceString ? (
                      '--'
                    ) : (
                      <span>
                        <span className={styles.shallowPrice}>{t.shallowPrice}</span>
                        <span>{t.solidPrice}</span>
                      </span>
                    )}
                  </div>
                  <div className={cs(styles.vol)}>{t.quanString || '--'}</div>
                </div>
              ))}
            </div>
          )}
          <div className={styles.optionWrapper}>
            <div className={styles.decimalWrapper} onClick={() => setGroupModalVisible(true)}>
              <span>{group.label}</span>
              <span className={styles.caret}></span>
            </div>
            <div className={styles.bidAskWrapper} onClick={() => setMarketModeModalVisible(true)}>
              <img src={iconMarketSrc} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className={'m-t-10'}>
        <div className={styles.orderHeader}>
          <div className={styles.orderNav}>
            <div className="f-16">{formatMessage({ id: 'trade.spot.title.new_order' })}</div>
            <div
              className="color-middle f-12"
              onClick={() => router.push({ pathname: '/trade/spot-orders', hash: `#${currentPair.currency}_${currentPair.market}` })}
            >
              <i className="iconfont iconjilu f-12 m-r-5"></i>
              <span>{formatMessage({ id: 'header.order.history_entrust' })}</span>
            </div>
          </div>
          <div className={styles.orderTabs}>
            <div
              className={cs(styles.orderTab, 'm-r-20', orderListMode === 1 && styles.orderTabActive)}
              onClick={() => setOrderListMode(1)}
            >
              {formatMessage({ id: 'trade.box.limit_trade' })}
            </div>
            <div className={cs(styles.orderTab, orderListMode === 2 && styles.orderTabActive)} onClick={() => setOrderListMode(2)}>
              {formatMessage({ id: 'trade.entrust.title' })}
            </div>
          </div>
        </div>
        <div className={styles.orderList}>
          {orderListMode === 1 &&
            (orders.length > 0 ? orders.map(order => <Order order={order} key={order.id} onCancel={id => cancelOrder(id)} />) : <Empty />)}
          {orderListMode === 2 &&
            (triggerOrders.length > 0 ? (
              triggerOrders
                .sort((a, b) => b.createTime - a.createTime)
                .map(order => <Order mode={'trigger'} order={order} key={order.id} onCancel={id => cancelOpenTriggerOrder(id)} />)
            ) : (
              <Empty />
            ))}
        </div>
      </div>
      <Modal popup animationType="slide-up" visible={orderModeModalVisible} onClose={() => setOrderModeModalVisible(false)}>
        <div className={styles.singleSelect}>
          {orderModes.map(d => (
            <div
              className={styles.singleSelectOption}
              key={d.value}
              onClick={() => {
                setOrderMode(d);
                setOrderModeModalVisible(false);
              }}
            >
              {d.label}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setOrderModeModalVisible(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </div>
        </div>
      </Modal>
      <Modal popup animationType="slide-up" visible={groupModalVisible} onClose={() => setGroupModalVisible(false)}>
        <div className={styles.singleSelect}>
          {decOptions.map(d => (
            <div
              className={styles.singleSelectOption}
              key={d.value}
              onClick={() => {
                setGroup(d);
                setGroupModalVisible(false);
              }}
            >
              {d.label}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setGroupModalVisible(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </div>
        </div>
      </Modal>
      <Modal popup animationType="slide-up" visible={marketModeModalVisible} onClose={() => setMarketModeModalVisible(false)}>
        <div className={styles.singleSelect}>
          {marketModes.map(d => (
            <div
              className={styles.singleSelectOption}
              key={d.value}
              onClick={() => {
                setMarketMode(d);
                setMarketModeModalVisible(false);
              }}
            >
              {d.label}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setMarketModeModalVisible(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </div>
        </div>
      </Modal>
      <Pairs visible={pairsModalVisible} onClose={() => setPairsModalVisible(false)} />
    </>
  );
};

export default connect(({ trading, auth, assets, setting, wsStatus }) => ({
  user: auth.user,
  serverClientTimeDiff: global.serverClientTimeDiff,
  theme: setting.theme,
  currentPair: trading.currentPair,
  currentPairBalance: assets.currentPairBalance,
  orders: trading.orders,
  triggerOrders: trading.triggerOrders,
  asks: trading.asks,
  bids: trading.bids,
  margins: trading.margins,
  connectState: wsStatus.connectState
}))(Spot);
