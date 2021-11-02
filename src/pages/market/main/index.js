import { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { WingBlank } from 'antd-mobile';
import { flattenDepth, groupBy, cloneDeep } from 'lodash';
import { deleteFavorite, addFavorite } from '@/services/api';
import { conmpareName } from '@/utils';

import MarketItem from '@/components/MarketItem';
import TopBar from '@/components/TopBar';
import SortBar from './SortBar';
import styles from './index.less';
import Empty from '@/components/Empty';
const tabs = [
  { title: <i className="iconfont iconzixuan-unselected"></i>, sub: 'fav' },
  { title: 'USDT', sub: 'USDT' },
  { title: 'ETH', sub: 'ETH' },
  { title: 'BTC', sub: 'BTC' },
  { title: 'ETF', sub: 'ETF' },
  { title: formatMessage({ id: 'market.new' }), sub: 'market.new' },
  { title: formatMessage({ id: 'market.assess' }), sub: 'market.assess' }
];

const newSort = ['MX', 'USDT', 'ETH', 'BTC', 'EOS', 'TRX'];

const Market = ({ markets, user, dispatch, theme }) => {
  const [active, setActive] = useState('USDT');
  const [sortTab, setSortTab] = useState('');
  const [upDown, setUpDown] = useState('none');

  useEffect(() => {
    // const _history = sessionStorage.getItem('mxc.market.active');
    // if (user.id) {
    //   toggleTab('fav');
    // } else {
    //   _history ? toggleTab(_history) : toggleTab('fav');
    // }
    const favLen = dealMarkets().find(v => v.marketName === 'fav').list.length;
    if (favLen) toggleTab('fav');
  }, []);

  const dealMarkets = () => {
    const allMarket = flattenDepth(
      markets.map(item => item.list),
      1
    );

    const newMarkets = cloneDeep(markets);
    newMarkets.map(item => {
      if ((item.marketName === 'market.new' || item.marketName === 'market.assess') && active !== 'fav') {
        item.list = Object.entries(groupBy(markets.find(m => m.marketName === active).list, a => a.market)).sort(
          (a, b) => newSort.findIndex(i => i === a[0]) - newSort.findIndex(i => i === b[0])
        );
      }
    });
    newMarkets.push({
      marketName: 'fav',
      list: allMarket.filter(item => !!item.favorite)
    });

    return newMarkets;
  };
  const sortMarkets = list => {
    let _list = list;

    switch (upDown) {
      case 'up':
        if (sortTab !== 'currency') {
          _list.sort((a, b) => b[sortTab] - a[sortTab]);
        } else {
          _list.sort((a, b) => a[sortTab].localeCompare(b[sortTab]));
        }
        break;
      case 'down':
        if (sortTab !== 'currency') {
          _list.sort((a, b) => a[sortTab] - b[sortTab]);
        } else {
          _list.sort((a, b) => b[sortTab].localeCompare(a[sortTab]));
        }
        break;
      case 'none':
      default:
        _list.sort((a, b) => {
          return a.sort - b.sort * 1 || conmpareName(a.currency, b.currency);
        });
        break;
    }
    return _list.filter(item => item.status !== 4);
  };

  const toggleTab = tab => {
    setActive(tab);
    sessionStorage.setItem('mxc.market.active', tab);
    setSortTab('');
    setUpDown('none');
  };

  const sortOptions = {
    styles,
    sortTab,
    setSortTab,
    upDown,
    setUpDown
  };

  const handleStarClick = item => {
    const { currency, market, favorite } = item;
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

  return (
    <>
      <TopBar goback={false} extra={<i className="iconfont iconsousuo" onClick={() => router.push('/market/search')}></i>}>
        <span className="f-16">{formatMessage({ id: 'trade.title.market' })}</span>
      </TopBar>
      <div className={styles.marketMain}>
        <div className={styles.tabs}>
          <ul>
            {tabs.map(tab => (
              <li key={tab.sub} className={active === tab.sub ? styles.active : ''} onClick={() => toggleTab(tab.sub)}>
                {tab.title}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.marketItem}>
          <SortBar {...sortOptions}></SortBar>
          {('market.new' === active || 'market.assess' === active) &&
            dealMarkets()
              .find(i => i.marketName === active)
              .list.map(items => (
                <div key={items[0]}>
                  <div className={styles.newTab}>{items[0]}</div>
                  <WingBlank>
                    {sortMarkets(items[1]).map(item => (
                      <MarketItem
                        key={`${item.currency}_${item.market}`}
                        item={item}
                        hasFav={true}
                        startClick={handleStarClick}
                      ></MarketItem>
                    ))}
                  </WingBlank>
                </div>
              ))}

          {'market.new' !== active && 'market.assess' !== active && (
            <WingBlank>
              {sortMarkets(dealMarkets().find(i => i.marketName === active).list) &&
                sortMarkets(dealMarkets().find(i => i.marketName === active).list).map(items => (
                  <MarketItem
                    key={`${items.currency}_${items.market}`}
                    item={items}
                    hasFav={true}
                    startClick={handleStarClick}
                  ></MarketItem>
                ))}
            </WingBlank>
          )}
        </div>
      </div>
    </>
  );
};

export default connect(({ auth, trading, setting }) => ({
  user: auth.user,
  markets: trading.markets,
  theme: setting.theme
}))(Market);
