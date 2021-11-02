import React, { useState, createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import CoinTab from './coinTab/index';
import Quick from './quick/index';
import FreeTrade from './freeTrade/index';
import { Modal, List } from 'antd-mobile';
import { getPayMoney, getMarketList, getPayList } from '@/services/api';
import router from 'umi/router';
// import { PullToRefresh, Button } from 'antd-mobile';
import { PullToRefresh, ListView } from 'antd-mobile';
const Item = List.Item;
const language = getLocale();
function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: document.documentElement.clientHeight,
  list: dataSource.cloneWithRows([]),
  more: true,
  page_size: 10, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}
function QuickTrading(props) {
  const { dispatch, otcuser } = props;
  const [tabActive, setTabActive] = useState('BUY');
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [currencyActive, setCurrencyActive] = useState('');
  const [currency, setCurrency] = useState('');
  const [coinActive, setCoinActive] = useState('');
  const [userAsstes, setUserAsstes] = useState({});
  const [tradingOffer, setTradingOffer] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;
  const [advertising, setAdvertising] = useState([]);
  const messagesEndRef = useRef();
  const marketInfo = async adlist => {
    let params = {
      currency: currency,
      tradeType: tabActive === 'BUY' ? 'SELL' : 'BUY',
      coinName: coinActive,
      payMethod: '', //支付方式待定
      page: page
    };
    const res = await getMarketList(params);
    if (res.code === 0) {
      if (res.data && res.data.length > 0) {
        setRefreshing(false);
        setAdvertising([...adlist, ...res.data]);
      }
      setLoading(false);
    }
  };
  const refreshMarketInfo = async () => {
    let params = {
      currency: currency,
      tradeType: tabActive === 'BUY' ? 'SELL' : 'BUY',
      coinName: coinActive,
      payMethod: '', //支付方式待定
      page: 1
    };
    const res = await getMarketList(params);
    if (res.code === 0) {
      if (res.data && res.data.length > 0) {
        setRefreshing(false);
      }
      setRefresh(false);
      setAdvertising(res.data);
      setLoading(false);
    }
  };
  let countriesCurrency = localStorage.getItem('countriesCurrency');
  useEffect(() => {
    if (!countriesCurrency) {
    }
    getCurrency();
    allBankList();
  }, []);
  useEffect(() => {
    if (refresh === true) {
      refreshMarketInfo();
    }
  }, [refresh]);

  useEffect(() => {
    if (otcuser.recentTradeSymbol && currencyList.length > 0) {
      let result = otcuser.recentTradeSymbol.split('_');

      setCurrency(result[1]);
      let fiat = currencyList.filter(item => item.currency === result[1]);
      if (fiat.length > 0) {
        let name = language.startsWith('zh') ? fiat[0].nameCn : fiat[0].nameEn;
        let data = fiat[0].currency;
        let active = `${name} (${data})`;
        localStorage.setItem('countriesCurrency', active);
        setCurrencyActive(active);
      }
    }
  }, [otcuser.account, currencyList]);
  useEffect(() => {
    if (currency && tabActive && coinActive) {
      setState({ page: 1 });
      clearMarketInfo();
    }
  }, [currency, tabActive, coinActive]);
  const clearMarketInfo = async () => {
    setAdvertising([]);
    marketInfo([]);
  };
  useEffect(() => {
    if (currency && tabActive && coinActive) {
      marketInfo(advertising);
    }
  }, [page]);
  useEffect(() => {
    if (currency) {
      dispatch({
        type: 'otc/paycurrencyPrecision',
        payload: {
          Currency: currency
        }
      });
      dispatch({
        type: 'otc/putCurrency',
        payload: currency
      });
      sessionStorage.setItem('currencyactive', currency);
    }
  }, [currency]);
  useEffect(() => {
    if (coinActive.length > 0) {
      dispatch({
        type: 'otc/currencyPrecision',
        payload: {
          Currency: coinActive
        }
      });
    }
  }, [coinActive]);
  const allBankList = async () => {
    const res = await getPayList();
    if (res.code === 0) {
      sessionStorage.setItem('mxc_allPayment', JSON.stringify(res.data));
      dispatch({
        type: 'otc/changeAllPaymentList',
        payload: res.data
      });
    }
  };

  const getCurrency = async () => {
    const res = await getPayMoney();
    if (res.code === 0) {
      setCurrencyList(res.data || []);
      let name = language.startsWith('zh') ? res.data[0].nameCn : res.data[0].nameEn;
      let data = res.data[0].currency;
      let active = `${name} (${data})`;

      let countriesCurrency = localStorage.getItem('countriesCurrency');
      if (countriesCurrency) {
        setCurrencyActive(countriesCurrency);
      } else {
        setCurrency(data);
        setCurrencyActive(active);
      }
    }
  };
  const currencyClick = item => {
    let name = language.startsWith('zh') ? item.nameCn : item.nameEn;
    let data = item.currency;
    let active = `${name} (${data})`;
    let countriesCurrency = localStorage.getItem('countriesCurrency');
    setCurrency(data);
    setCurrencyVisible(false);
    setCurrencyActive(active);
    localStorage.setItem('countriesCurrency', active);
  };
  const modelCurrencyList = () => {
    return currencyList.map(item => {
      return (
        <List className={styles.currencyList} key={item.id}>
          <Item
            onClick={() => {
              currencyClick(item);
            }}
          >
            {language.startsWith('zh') ? item.nameCn : item.nameEn}({item.currency})
          </Item>
        </List>
      );
    });
  };
  const handleScroll = e => {
    let handleHight = messagesEndRef.current.clientHeight + e.target.scrollTop;
    if (refreshing === true) {
      return;
    }
    if (handleHight + 50 > e.target.scrollHeight) {
      if (refreshing === false) {
        setState({ page: page + 1 });
        setRefreshing(true);
        return;
      } else {
      }
    } else {
      return;
    }
  };
  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
  return (
    <div className={styles.quickContent}>
      <TopBar
        extra={
          otcuser.account ? (
            <div className={styles.headerColor}>
              <i className="iconfont iconic_History_"></i>
              <span className={styles.headerBtn} onClick={() => router.push('/otc/fiatorderRecord')}>
                {formatMessage({ id: 'header.order' })}
              </span>
            </div>
          ) : (
            ''
          )
        }
      ></TopBar>

      <div className={styles.headerFix}>
        {isApp === 'app' && (
          <div className={styles.fiatOrader}>
            <div className={styles.headerColor}>
              <i className="iconfont iconic_History_"></i>
              <span className={styles.headerBtn} onClick={() => router.push('/otc/fiatorderRecord')}>
                {formatMessage({ id: 'header.order' })}
              </span>
            </div>
          </div>
        )}

        <div className={styles.headerTab}>
          <div className={styles.headerLeft}>
            <span className={classNames([tabActive === 'BUY' ? styles.tabActive : ''])} onClick={() => setTabActive('BUY')}>
              {formatMessage({ id: 'otc.title.buy' })}
            </span>
            <span className={classNames([tabActive === 'SELL' ? styles.tabActive : ''])} onClick={() => setTabActive('SELL')}>
              {formatMessage({ id: 'otc.title.sell' })}
            </span>
          </div>
          <div className={styles.headerRight} onClick={() => setCurrencyVisible(true)}>
            <span>{currencyActive}</span>
            <i className="iconfont iconxiasanjiaoxing"></i>
          </div>
        </div>
        <div>
          <CoinTab setCoinActive={setCoinActive} coinActive={coinActive} />
        </div>
        <Modal popup animationType="slide-up" visible={currencyVisible} onClose={() => setCurrencyVisible(false)}>
          <div className={styles.currencyContent}>{modelCurrencyList()}</div>
        </Modal>
      </div>

      <div
        className={classNames([styles.outerScroller])}
        ref={messagesEndRef}
        onScroll={e => {
          handleScroll(e);
        }}
      >
        <PullToRefresh
          damping={60}
          style={{
            height: document.documentElement.clientHeight,
            overflow: 'auto'
          }}
          direction={'down'}
          refreshing={loading}
          onRefresh={() => {
            setAdvertising([]);
            setRefresh(true);
            // setState({ page: 1 });
          }}
        >
          {isApp === 'h5' && <div style={{ height: 10 }}></div>}

          <div className={styles.QuickContent}>
            <Quick
              tabActiveType={tabActive}
              currency={currency}
              coinActive={coinActive}
              setUserAsstes={setUserAsstes}
              userAsstes={userAsstes}
              setTradingOffer={setTradingOffer}
              tradingOffer={tradingOffer}
            />
            <FreeTrade
              currency={currency}
              coinActive={coinActive}
              tabActiveType={tabActive}
              userAsstes={userAsstes}
              tradingOffer={tradingOffer}
              advertising={advertising}
            />
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}
export default connect(({ auth, otc }) => ({
  user: auth.user,
  otcuser: otc.otcuser
}))(QuickTrading);
