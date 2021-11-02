import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import ScreeningOrder from './screeningOrder';
import { getFiatorderHistory, getMeMakerOrder, putMeMakerOrder } from '@/services/api';
import { timeToString } from '@/utils';
import router from 'umi/router';
import Empty from '@/components/Empty';
import { Card } from 'antd-mobile';
import { parse } from 'query-string';
import { PullToRefresh, ListView, Modal } from 'antd-mobile';
const alert = Modal.alert;
function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: document.documentElement.clientHeight,
  list: dataSource.cloneWithRows([]),
  more: false,
  orderTradingType: 0,
  page_size: 10, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}
function QuickTrading(props) {
  const querys = parse(window.location.search);
  console.log(querys);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderType, setOrderType] = useState('BUY');
  const [orderState, setOrderState] = useState('');
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height, orderTradingType } = state;
  useEffect(() => {
    let data = {
      page,
      page_size: page_size,
      orderDealStates: orderState,
      tradeType: ''
    };
  }, []);
  useEffect(() => {
    if (querys.type === '1') {
      setOrderType('SELL');
      setState({
        orderTradingType: 1
      });
      getList('', 'refresh', 1);
    } else {
      setState({
        orderTradingType: 0
      });
      let data = {
        page,
        page_size: page_size,
        orderDealStates: orderState,
        tradeType: ''
      };
      getList(data, 'refresh', orderTradingType);
    }
  }, [querys.type]);

  const onRefresh = e => {
    setState({ page: 1, more: false });
    let data = {
      page,
      page_size: page_size,
      orderDealStates: orderState,
      tradeType: orderType
    };
    getList(data, 'refresh', orderTradingType);
  };

  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 });
      let data = {
        page: page + 1,
        page_size: page_size,
        orderDealStates: orderState,
        tradeType: orderType
      };
      getList(data, '', orderTradingType);
    }
  };
  const getList = async (data, tradingType, type) => {
    console.log('type' + type);
    if (type === 0) {
      generalTrading(data, tradingType);
    } else {
      entrustTrading(tradingType);
    }
  };
  const generalTrading = async (data, tradingType) => {
    const res = await getFiatorderHistory(data);
    if (res.code === 0) {
      const data = res.data || [];
      setDrawerOpen(false);
      if (tradingType === 'refresh') {
        setState({ list: dataSource.cloneWithRows([...data]) });
      } else {
        setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat([...data])) });
      }
      if (res.data) {
        setState({ more: true });
      } else {
        setState({ more: false });
      }
    }
  };
  const entrustTrading = async tradingType => {
    let params = {
      page: 1,
      pageSize: 10,
      coinName: 'USDT',
      currency: 'CNY',
      orderState: orderState
    };
    const res = await getMeMakerOrder(params);
    if (res.code === 0) {
      const data = res.data || [];
      setDrawerOpen(false);

      if (tradingType === 'refresh') {
        setState({ list: dataSource.cloneWithRows([...data]) });
      } else {
        setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat([...data])) });
      }
      if (res.data) {
        setState({ more: true });
      } else {
        setState({ more: false });
      }
    }
  };

  const screeningClick = () => {
    let data = {
      page,
      page_size: page_size,
      orderDealStates: orderState,
      tradeType: orderType
    };

    getList(data, 'refresh', orderTradingType);
  };

  const fiatOrderType = val => {
    const orderTypeMaps = {
      0: formatMessage({ id: 'otc.orderState.ten' }),
      1: formatMessage({ id: 'otc.orderState.one' }),
      2: formatMessage({ id: 'otc.orderState.two' }),
      3: formatMessage({ id: 'otc.orderState.three' }),
      4: formatMessage({ id: 'otc.orderState.four' }),
      5: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      6: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      7: formatMessage({ id: 'fork.conversion.record.order.cancel' }),
      8: formatMessage({ id: 'otc.orderState.eight' }),
      9: formatMessage({ id: 'otc.orderState.eight' }),
      13: formatMessage({ id: 'mc_otc_trading_paymentFinish_prompnt' })
    };
    return orderTypeMaps[val];
  };

  const entrustType = val => {
    const orderTypeMaps = {
      1: formatMessage({ id: 'otcfiat.Its.withdrawn' }),
      2: formatMessage({ id: 'otc.entrust.order' }),
      3: formatMessage({ id: 'otc.creditCard.expired' })
    };
    return orderTypeMaps[val];
  };
  const orderInfoClick = id => {
    router.push({
      pathname: `/otc/placeTheOrder/${id}`
    });
  };
  const revocationMaker = async id => {
    let data = {
      orderId: id
    };
    const res = await putMeMakerOrder(data);
    if (res.code === 0) {
      getList(data, 'refresh', orderTradingType);
      {
        formatMessage({ id: 'order.table.action.cancel.success' });
      }
    }
  };
  const row = item => {
    return (
      <div className={styles.orderContent} key={item.id}>
        <div
          className={styles.orderList}
          onClick={() => {
            orderTradingType === 0 ? orderInfoClick(item.id) : console.log('委托');
          }}
        >
          <div className={styles.orderTitle}>
            <div className={styles.orderTitleLeft}>
              <span className={classNames([item.tradeType === 0 ? styles.buyColor : styles.SellColor])}>
                {item.tradeType === 0 ? formatMessage({ id: 'assets.discount.wraning.buy' }) : formatMessage({ id: 'otc.quick.sell' })}
              </span>
              <span>{item.coinName}</span>
              <span>{item.createTime ? timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm:ss') : '--'}</span>
            </div>
            {orderTradingType != 0 && item.state === 0 && (
              <div
                className={styles.orderTitleRight}
                onClick={e => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  alert(formatMessage({ id: 'otc.trading.entrust' }), formatMessage({ id: 'otc.entrust.Revoke' }), [
                    { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                    { text: formatMessage({ id: 'common.yes' }), onPress: () => revocationMaker(item.id) }
                  ]);
                }}
              >
                {formatMessage({ id: 'order.table.action.cancel' })}
              </div>
            )}

            <div className={styles.orderTitleRight}>
              {orderTradingType === 0
                ? item.tradeType === 1 && item.state === 1
                  ? fiatOrderType(13)
                  : fiatOrderType(item.state)
                : entrustType(item.state)}
            </div>
          </div>
          <div className={styles.orderInfo}>
            <div>
              <p>
                {formatMessage({ id: 'container.Theunit.price' })}({item.currency})
              </p>
              <span>{item.price}</span>
            </div>
            <div>
              <p>
                {formatMessage({ id: 'assets.treaty.history.number' })}({item.coinName})
              </p>
              <span>{item.quantity}</span>
            </div>
            <div>
              <p>
                {formatMessage({ id: 'otc.quick.rental' })}({item.currency})
              </p>
              <span>
                {item.amount} {item.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
  return (
    <div>
      <TopBar
        extra={
          <div className={styles.headerColor}>
            <i
              className="iconfont iconshaixuan"
              onClick={() => {
                setDrawerOpen(true);
              }}
            ></i>
          </div>
        }
      >
        {formatMessage({ id: 'otcfiat.Order.record' })}
      </TopBar>
      {isApp === 'app' && (
        <div className={styles.isAppHeader}>
          <div className={styles.headerColor}>
            <i
              className="iconfont iconshaixuan"
              onClick={() => {
                setDrawerOpen(true);
              }}
            ></i>
          </div>
        </div>
      )}

      <ListView
        style={{
          height,
          overflow: 'auto'
        }}
        dataSource={list}
        renderBodyComponent={() => <Body />}
        renderFooter={() => <div style={{ textAlign: 'center' }}>{!more && <Empty />}</div>}
        renderRow={row}
        pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
        pageSize={page_size}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
      />
      <ScreeningOrder
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        screeningClick={screeningClick}
        orderType={orderType}
        setOrderType={setOrderType}
        orderState={orderState}
        setOrderState={setOrderState}
        orderTradingType={orderTradingType}
        setState={setState}
      />
      <div style={{ height: 50 }}></div>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(QuickTrading);
