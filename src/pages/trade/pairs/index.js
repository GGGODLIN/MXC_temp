import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import cs from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { findRealPair, conmpareName, marketOrder, cutFloatDecimal } from '@/utils';
import memoize from 'memoize-one';
import { Modal, InputItem, Tabs } from 'antd-mobile';
import groupBy from 'lodash/groupBy';

import styles from './index.less';

const symbolMatchHash = (currency, market) => {
  const hash = window.location.hash.substr(1);
  const symbol = `${currency}_${market}`;
  const isMatch = currency && market && currency !== 'undefined' && market !== 'undefined' && (!hash || hash.toUpperCase() === symbol);
  if (isMatch && !hash) {
    window.location.hash = symbol;
  }
  return isMatch;
};

const getFavorites = memoize(markets => {
  let favorites = [];
  markets.forEach(m => {
    favorites = favorites.concat(m.list.filter(i => i.favorite));
  });
  return favorites;
});

const getRenderMarkets = memoize(markets => {
  return [{ marketName: 'market.favorites', list: getFavorites(markets) }, ...markets];
});

const Pairs = ({ dispatch, user, currentPair, firstLoadedMarkets, markets, visible, onClose }) => {
  const symbol = `${currentPair.currency}_${currentPair.market}`;
  const initMarket = currentPair.market ? (marketOrder.includes(currentPair.market) ? currentPair.market : 'market.new') : 'USDT';
  const [activeMarket, setActiveMarket] = useState(initMarket);

  const switchTab = (currency, market, type) => {
    const favorites = getFavorites(firstLoadedMarkets);
    const isFav = favorites.find(f => f.currency === currency && f.market === market);
    if (!!isFav && activeMarket === 'market.favorites') {
      return;
    }
    if (type === 'NEW') {
      if (activeMarket !== 'market.new') {
        setActiveMarket('market.new');
      }
    } else if (activeMarket !== market) {
      setActiveMarket(market);
    }
  };

  const changePair = pair => {
    let newPair = findRealPair(pair, firstLoadedMarkets);
    if (newPair) {
      const newSymbol = `${newPair.currency}_${newPair.market}`;
      if (symbol !== newSymbol) {
        window.location.hash = newSymbol;
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
        dispatch({
          type: 'trading/setCurrentPair',
          payload: newPair
        });
      }
    }
  };

  useEffect(() => {
    const [currency, market] = symbol.split('_');
    const isSymbolValid = symbolMatchHash(currency, market);
    if (isSymbolValid) {
      switchTab(currency, market, currentPair.type);
    }
  }, [user.token, symbol, currentPair.type, firstLoadedMarkets]);

  const renderMarkets = getRenderMarkets(markets);
  const _activeMarket = renderMarkets.find(m => m.marketName === activeMarket);
  let renderList = _activeMarket ? _activeMarket['list'] : [];
  renderList = renderList.sort((a, b) => a.sort - b.sort || conmpareName(a.currency, b.currency));
  let limitList = [];
  if (activeMarket === 'market.new' || activeMarket === 'market.assess') {
    const limits = markets.find(i => i.marketName === activeMarket);
    if (limits) {
      limitList = Object.entries(groupBy(limits.list, item => item.market)).map(([marketName, list]) => ({
        marketName,
        list: list.sort((a, b) => a.sort - b.sort || conmpareName(a.currency, b.currency))
      }));
      const order = [...marketOrder, 'EOS', 'TRX'];
      limitList = limitList.sort((a, b) => {
        const aI = order.indexOf(a.marketName);
        const bI = order.indexOf(b.marketName);
        return aI - bI;
      });
    }
  }

  const handleChangePair = pair => {
    changePair(pair);
    onClose && onClose();
  };

  const handleChangeTab = tab => {
    if (tab.sub !== activeMarket) {
      setActiveMarket(tab.sub);
    }
  };

  const marketTabs = renderMarkets.map((m, idx) => ({
    title:
      m.marketName !== 'market.favorites' ? (
        <span className={cs(styles.cutTab, 'ellipsis')}>
          {m.marketName === 'market.new' || m.marketName === 'market.assess' ? formatMessage({ id: m.marketName }) : m.marketName}
        </span>
      ) : (
        <i className="iconfont iconzixuan-unselected"></i>
      ),
    sub: m.marketName
  }));

  const [searchText, setSearchText] = useState(null);
  return (
    <>
      <Modal
        className="am-modal-popup-slide-right"
        transitionName="am-slide-right"
        popup
        visible={visible}
        onClose={() => {
          onClose && onClose();
        }}
      >
        <div className={styles.searchWrapper}>
          <InputItem
            className="am-search-input am-input-small"
            placeholder="search"
            clear
            defaultValue={searchText}
            onChange={val => setSearchText(val)}
          >
            <i className={cs('iconfont', 'iconsousuo')}></i>
          </InputItem>
        </div>
        <div className={styles.marketTabsWrap}>
          <div className={styles.marketTabs}>
            {marketTabs.map(m => (
              <span className={m.sub === activeMarket ? styles.active : ''} onClick={() => handleChangeTab(m)} key={m.sub}>
                {m.title}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.pairsWrapper}>
          {activeMarket !== 'market.new' && activeMarket !== 'market.assess'
            ? renderList
                .filter(i => {
                  const matched = searchText && i.currency.includes(searchText.toUpperCase());
                  return (!searchText && i.status !== 4) || matched;
                })
                .map(item => (
                  <div
                    key={item.currency + item.market}
                    className={cs(
                      styles.row,
                      item.currency === currentPair.currency && item.market === currentPair.market && styles.rowActive
                    )}
                    onClick={() => handleChangePair([item.currency, item.market])}
                  >
                    <div>
                      <span>
                        <span style={{ color: 'var(--main-text-1)' }}>{item.currency}</span>
                        <span style={{ color: 'var(--main-text-3)' }} className="f-12">
                          /{item.market}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className={cs(item.rate > 0 && styles.buy, item.rate < 0 && styles.sell)}>
                        {cutFloatDecimal(item.c, item.priceScale)}
                      </span>
                    </div>
                  </div>
                ))
            : limitList.map(limitMarket => (
                <div key={limitMarket.marketName}>
                  <div className={cs(styles.rowHead, styles.row, styles.subRowHead)}>
                    {limitMarket.marketName}&nbsp;
                    {formatMessage({ id: 'index.trans.market' })}
                  </div>
                  {limitMarket.list
                    .filter(i => {
                      const matched = !searchText || i.currency.includes(searchText.toUpperCase());
                      return i.status !== 4 && matched;
                    })
                    .map(item => (
                      <div
                        key={item.currency + item.market}
                        className={cs(
                          styles.row,
                          item.currency === currentPair.currency && item.market === currentPair.market && styles.rowActive
                        )}
                        onClick={() => handleChangePair([item.currency, item.market])}
                      >
                        <div>
                          <span>
                            <span style={{ color: 'var(--main-text-1)' }}>{item.currency}</span>
                            <span className="f-12">/{item.market}</span>
                          </span>
                        </div>
                        <div>
                          <span className={cs(item.rate > 0 && styles.buy, item.rate < 0 && styles.sell)}>
                            {cutFloatDecimal(item.c, item.priceScale)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
        </div>
      </Modal>
    </>
  );
};

export default connect(({ trading, auth }) => ({
  user: auth.user,
  currentPair: trading.currentPair,
  firstLoadedMarkets: trading.firstLoadedMarkets,
  markets: trading.markets
}))(Pairs);
