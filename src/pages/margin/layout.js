import React, { useCallback, useState, useEffect, useReducer } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { findRealPair } from '@/utils';
import { getMarketSymbol, getMarketDeals } from '@/services/api';
import { mainSocketSend } from '@/services/main-socket';
import { sendMessage } from '@/services/margin-socket';
import FraudModal from '@/components/Temporary/FraudModal';

const symbolMatchHash = (currency, market) => {
  const pathname = window.location.pathname;
  const hash = window.location.hash.substr(1);
  const symbol = `${currency}_${market}`;
  const isMatch = currency && market && currency !== 'undefined' && market !== 'undefined' && (!hash || hash.toUpperCase() === symbol);
  if (isMatch && !hash && pathname !== '/margin/loan' && pathname !== '/margin/back') {
    window.location.hash = symbol;
  }
  return isMatch;
};

const findSymbol = () => {
  let symbol;
  if (window.location.hash) {
    symbol = window.location.hash.substr(1).split('_');
  } else {
    symbol = ['MX', 'USDT'];
  }
  return symbol;
};

const Trade = ({ dispatch, user, currentPair, firstLoadedMarkets, children, location }) => {
  const symbol = `${currentPair.currency}_${currentPair.market}`;

  useEffect(() => {
    if (location.pathname === '/margin/step-margin') {
      router.push(`/info/margin-step${location.search}`);
    }
  }, [location]);

  const changePair = pair => {
    let newPair = findRealPair(pair, firstLoadedMarkets);
    if (newPair) {
      const newSymbol = `${newPair.currency}_${newPair.market}`;
      if (symbol !== newSymbol) {
        window.location.hash = newSymbol;
        dispatch({
          type: 'trading/setCurrentPair',
          payload: newPair
        });
        dispatch({
          type: 'margin/setCurrentPair',
          payload: newPair
        });
      }
    }
  };

  useEffect(() => {
    const [currency, market] = symbol.split('_');
    const isSymbolValid = symbolMatchHash(currency, market);
    if (user.token && isSymbolValid) {
      mainSocketSend({
        channel: 'get.orders',
        message: {
          symbol: symbol,
          token: user.token
        }
      });
      mainSocketSend({
        channel: 'get.trigger.orders',
        message: {
          symbol: symbol,
          token: user.token
        }
      });
    } else {
      dispatch({
        type: 'margin/setOrders',
        payload: {
          data: []
        }
      });
      dispatch({
        type: 'margin/setTriggerOrders',
        payload: {
          data: []
        }
      });
    }

    if (isSymbolValid) {
      getMarketSymbol(symbol).then(res => {
        if (res.code === 200) {
          dispatch({
            type: 'trading/setCurrentPairValue',
            payload: res.data
          });
        }
      });
      getMarketDeals(symbol).then(res => {
        if (res.code === 200) {
          dispatch({
            type: 'trading/setFullTrades',
            payload: res.data
          });
        }
      });

      mainSocketSend({
        channel: 'get.depth',
        message: {
          symbol: symbol
        }
      });
    } else {
      changePair(findSymbol());
    }
  }, [user.token, symbol, currentPair.type, firstLoadedMarkets]);

  useEffect(() => {
    const [currency, market] = symbol.split('_');
    const isSymbolValid = symbolMatchHash(currency, market);
    // hack fix the bug: previous unmount cleanup be called behind the next mount inital render
    window.setTimeout(() => {
      console.log('render: ', symbol);
      if (user.token) {
        sendMessage({
          op: 'sub.personal',
          token: user.token
        });
        sendMessage({
          op: 'sub.margin.step.risk',
          token: user.token,
          symbol: symbol
        });

        sendMessage({
          op: 'sub.margin.personal.trigger.order.v2',
          token: user.token
        });
      }
      if (isSymbolValid) {
        mainSocketSend({
          channel: 'sub.symbol',
          message: {
            symbol: symbol
          }
        });
      }
    }, 300);
    return () => {
      console.log('clean: ', symbol);
      if (user.token) {
        mainSocketSend({
          channel: 'unsub.personal',
          message: {
            token: user.token
          },
          shouldCache: false
        });
      }
      if (isSymbolValid) {
        mainSocketSend({
          channel: 'unsub.symbol',
          message: {
            symbol: symbol
          },
          shouldCache: false
        });
      }
    };
  }, [user.token, symbol]);

  return (
    <>
      {children}
      <FraudModal />
    </>
  );
};

export default connect(({ trading, auth, margin }) => ({
  user: auth.user,
  currentPair: margin.currentPair,
  firstLoadedMarkets: trading.firstLoadedMarkets
}))(Trade);
