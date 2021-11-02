import React, { useCallback, useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import { findRealPair } from '@/utils';
import { getMarketSymbol, getMarketDeals } from '@/services/api';
import { mainSocketSend } from '@/services/main-socket';
import FraudModal from '@/components/Temporary/FraudModal';

const symbolMatchHash = (currency, market) => {
  const hash = window.location.hash.substr(1);
  const symbol = `${currency}_${market}`;
  const isMatch = currency && market && currency !== 'undefined' && market !== 'undefined' && (!hash || hash.toUpperCase() === symbol);
  if (isMatch && !hash) {
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

const Trade = ({ dispatch, user, currentPair, firstLoadedMarkets, children }) => {
  const symbol = `${currentPair.currency}_${currentPair.market}`;

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
      }
    }
  };

  useEffect(() => {
    getMarketDeals(symbol).then(res => {
      if (res.code === 200) {
        dispatch({
          type: 'trading/setFullTrades',
          payload: res.data
        });
      }
    });
  }, [symbol]);

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
        type: 'trading/setOrders',
        payload: {
          data: []
        }
      });
      dispatch({
        type: 'trading/setTriggerOrders',
        payload: {
          data: []
        }
      });
    }

    if (isSymbolValid) {
      getMarketSymbol(symbol).then(res => {
        if (res.code === 200) {
          dispatch({
            type: 'trading/setCurrentPair',
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
        mainSocketSend({
          channel: 'sub.personal',
          message: {
            token: user.token
          }
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

export default connect(({ trading, auth }) => ({
  user: auth.user,
  currentPair: trading.currentPair,
  firstLoadedMarkets: trading.firstLoadedMarkets
}))(Trade);
