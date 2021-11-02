import React, { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './creditCardOrder.less';
import { List, Picker } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { PullToRefresh, ListView } from 'antd-mobile';
import { getSupplier, getCreditCardOrderList } from '@/services/api';
import Empty from '@/components/Empty';
import { timeToString } from '@/utils';
function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});
const initialState = {
  height: document.documentElement.clientHeight - 100,
  list: dataSource.cloneWithRows([]),
  more: true,
  page_size: 10, //单次渲染条数
  page: 1,
  totalPage: '',
  refresh: false,
  serviceProvidersList: [],
  serverActive: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

function CreditCardOrder(props) {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height, refresh, serviceProvidersList, serverActive, totalPage } = state;
  useEffect(() => {
    if (serverActive) {
      getOrderList();
    }
  }, [more, page, serverActive]);
  useEffect(() => {
    getServiceProviders();
  }, []);
  const onRefresh = e => {
    setState({ page: 1, more: true });
  };
  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 >= totalPage ? totalPage : page + 1 });
    }
  };
  const getServiceProviders = async () => {
    const res = await getSupplier();
    if (res.code === 0) {
      let list = [];
      res.data.forEach(item => {
        list.push({
          label: item,
          value: item
        });
      });
      console.log(list);
      console.log(res);
      setState({
        serverActive: [res.data[0]],
        serviceProvidersList: list
      });
    }
  };

  const getOrderList = async () => {
    let data = {
      page: page,
      pageSize: 10,
      acceptance: serverActive
    };
    const res = await getCreditCardOrderList(data);
    console.log(res);
    if (res.code === 0) {
      if (res.data.length > 0) {
        setState({
          totalPage: res?.page.totalPage
        });
        if (refresh === true) {
          setState({ list: dataSource.cloneWithRows(res.data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(res.data)) });
        }
      } else {
        setState({ list: dataSource.cloneWithRows([]) });
        setState({
          more: false
        });
      }
    }
  };
  const fiatOrderType = val => {
    const orderTypeMaps = {
      1: formatMessage({ id: 'otc.orderState.ten' }),
      2: formatMessage({ id: 'container.Payment.has.been' }),
      3: formatMessage({ id: 'assets.cash.state.loading' }),
      4: formatMessage({ id: 'etfIndex.orders.status.PROCESSING' }),
      5: formatMessage({ id: 'header.complete' }),
      6: formatMessage({ id: 'mc_otc_search_six' }),
      7: formatMessage({ id: 'mc_otc_creditCard_rejected' }),
      8: formatMessage({ id: 'otc.creditCard.expired' }),
      0: formatMessage({ id: 'mc_otc_creditCard_new' })
    };
    return orderTypeMaps[val];
  };
  const row = item => {
    return (
      <div className={styles.orderList}>
        <div className={styles.title}>
          <div className={styles.trading}>
            <span>
              {formatMessage({ id: 'trade.box.buy' })}

              {item.coinName}
            </span>
            <span>{item.createTime ? timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm:ss') : '--'}</span>
          </div>
          <div className={styles.orderState}>{fiatOrderType(item.state)}</div>
        </div>
        <div className={styles.orderInfo}>
          <div>
            <p>{formatMessage({ id: 'assets.treaty.history.number' })}</p>
            <span>
              {item.quantity}
              {item.coinName}{' '}
            </span>
          </div>
          <div>
            <p>{formatMessage({ id: 'mc_creditCard_order_amount' })}</p>
            <span>
              {item.amount}
              {item.currency}
            </span>
          </div>
          <div>
            <p>{formatMessage({ id: 'mc_creditCard_order_payment' })}</p>
            <span>{item.payment ? item.payment : '--'}</span>
          </div>
        </div>
      </div>
    );
  };
  const serverSelect = e => {
    console.log(e);
    setState({
      serverActive: e
    });
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'mc_creditCard_header_title' })}</TopBar>
      <div className={styles.orderContetn}>
        <div className={styles.header}>
          <div className={styles.title}>{formatMessage({ id: 'swap.order.tab.orderHistory' })}</div>
          <div className={styles.allOrder}>
            <Picker
              data={serviceProvidersList}
              value={serverActive}
              cols={1}
              onChange={e => {
                console.log(e);
                serverSelect(e);
              }}
              okText={formatMessage({ id: 'common.sure' })}
              dismissText={formatMessage({ id: 'common.cancel' })}
              extra={''}
            >
              <List.Item extra={''}>
                {serverActive} <i className="iconfont icondrop"></i>{' '}
              </List.Item>
            </Picker>
          </div>
        </div>
        <div className={styles.orderListContent}>
          <ListView
            style={{
              height,
              overflow: 'auto'
            }}
            dataSource={list}
            renderBodyComponent={() => <Body />}
            renderFooter={() => {
              if (list._dataBlob.s1.length) {
                if (!more) {
                  return <div style={{ textAlign: 'center' }}>{formatMessage({ id: 'common.no.data_more' })}</div>;
                }
              } else {
                if (!more) {
                  return <Empty />;
                }
              }
            }}
            renderRow={row}
            pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
            pageSize={page_size}
            onEndReached={onEndReached}
            onEndReachedThreshold={10}
          />
        </div>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  otcuser: otc.otcuser
}))(CreditCardOrder);
