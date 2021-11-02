import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import { timeToString } from '@/utils';
import { Toast, Tabs } from 'antd-mobile';
import styles from './index.less';
import { PullToRefresh, ListView } from 'antd-mobile';
import { getOrderHistory, putCancelPushBid } from '@/services/api';
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

const orderType = status => {
  let txt = '';
  switch (status) {
    case 1:
      txt = <span>{formatMessage({ id: 'order.table.status.unfilled' })}</span>;
      break;
    case 2:
      txt = formatMessage({ id: 'fin.common.all.clinch.adeal' });

      break;
    case 3:
      txt = formatMessage({ id: 'order.table.status.partial_deal' });

      break;
    case 4:
      txt = formatMessage({ id: 'fin.common.all.cancellations' });

      break;
    case 5:
      txt = formatMessage({ id: 'container.Partof.its' });
      break;

    default:
      break;
  }
  return txt;
};
const pushList = async (tradingType, tradingPage, tradingPageSize, settradingList) => {
  const res = await getOrderHistory(tradingType, tradingPage, tradingPageSize);
  if (res.code === 0) {
    settradingList(res.data);
  }
};

const Revoke = async (item, tradingType, tradingPage, tradingPageSize, settradingList) => {
  const res = await putCancelPushBid(item.id);
  if (res.code === 0) {
    Toast.success(formatMessage({ id: 'order.table.action.cancel.success' }), 3);
  } else {
    Toast.success(res.msg, 3);
  }
};

const tradingOrder = tradingList => {
  return tradingList.map(item => {
    let amount = item.amount;
    let money = item.price * item.quantity;
    let percentage = item.price * item.quantity;
    return (
      <div className={styles.pushList} key={item.id}>
        <div className={styles.listTop}>
          <div>
            {item.currency}/{item.market}
          </div>
          <div>{item.tradeType === 'BUY' ? formatMessage({ id: 'header.complete' }) : ''}</div>
        </div>
        <div className={styles.orderProcess}>
          <div className={styles.orderProcessBar} style={{ width: `100%` }}></div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'act.invite_datatime' })}</p>
            <span>{timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm')}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Buy.the.price' })}({item.market})
            </p>
            <span>{item.price}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.PUSHthe.number' })}({item.market})
            </p>
            <span>{item.amount}</span>
          </div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'otcpush.deal.mount' })}</p>
            <span>{item.amount}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Cost.amount' })}({item.market})
            </p>
            <span>{item.price}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'product.list.trade_volume' })}({item.market})
            </p>
            <span>{item.dealQuantity ? item.dealQuantity : '--'}</span>
          </div>
        </div>
      </div>
    );
  });
};

const buyOrder = (tradingList, tradingType, tradingPage, tradingPageSize, settradingList) => {
  return tradingList.map(item => {
    let amount = item.amount;
    let money = item.price * item.quantity;
    let percentage = (item.dealQuantity / item.quantity) * 100;
    return (
      <div className={styles.pushList} key={item.id}>
        <div className={styles.listTop}>
          <div>
            {item.currency}/{item.market}
          </div>
          <div className={styles.typeBtn}>
            {item.state === 1 ? (
              <span
                className={styles.cancellations}
                onClick={() => Revoke(item, tradingType, tradingPage, tradingPageSize, settradingList)}
              >
                {formatMessage({ id: 'order.table.action.cancel' })}
              </span>
            ) : (
              ''
            )}

            <span> {orderType(item.state)}</span>
          </div>
        </div>
        <div className={styles.orderProcess}>
          <div className={styles.orderProcessBar} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'act.invite_datatime' })}</p>
            <span>{timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm')}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Theunit.price' })}({item.market})
            </p>
            <span>{item.price}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'assets.treaty.history.number' })}({item.market})
            </p>
            <span>{item.quantity}</span>
          </div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'otcpush.deal.total' })}</p>
            <span>{item.dealQuantity}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Cost.amount' })}({item.market})
            </p>
            <span>{item.price * item.dealQuantity}</span>
          </div>
          <div>
            <p>{formatMessage({ id: 'otcpush.remaining.number' })}</p>
            <span>{item.remainQuantity}</span>
          </div>
        </div>
      </div>
    );
  });
};

function PushRecord(props) {
  const [state, setState] = useReducer(reducer, initialState);
  const [tradingType, settradingType] = useState('SELL');
  const [tradingPage, settradingPage] = useState(1);
  const [tradingPageSize, settradingPageSize] = useState(10);
  const [tradingList, settradingList] = useState([]);
  const [activeId, setactiveId] = useState(0);
  const headerTop = localStorage.getItem('mxc.view.from') === 'app' ? '74px' : '49px';
  const type = props.type;
  let { list, more, page, page_size, height } = state;
  useEffect(() => {
    getList(1, page_size, type, 'refresh');
  }, [type]);
  const tabs2 = [
    { title: 'SELL', sub: 'SELL' },
    { title: 'BUY', sub: 'BUY' }
  ];
  const getList = async (page, pageSize, type, tradingType) => {
    const params = {
      page,
      page_size: pageSize || page_size
    };
    const res = await getOrderHistory(type, page, pageSize);
    if (res.code === 0) {
      const data = res.data || [];
      if (data.length) {
        if (tradingType === 'refresh') {
          setState({ list: dataSource.cloneWithRows(data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
        }
      } else {
        setState({ more: false });
      }
    }
  };
  const pushTypeSwitch = (settradingType, type, setactiveId, id, tradingPage, tradingPageSize, settradingList) => {
    settradingType(type);
    setactiveId(id);
    getList(1, page_size, type, 'refresh');
  };
  const onRefresh = e => {
    setState({ page: 1, more: true });
    getList(1, page_size, tradingType, 'refresh');
  };

  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 });
      getList(page + 1, page_size, tradingType);
    }
  };
  const row = item => {
    let amount = item.amount;
    let money = item.price * item.quantity;
    let percentage = item.price * item.quantity;
    return (
      <div className={styles.pushList} key={item.id}>
        <div className={styles.listTop}>
          <div>
            {item.currency}/{item.market}
          </div>
          <div>{item.tradeType === 'BUY' ? formatMessage({ id: 'header.complete' }) : ''}</div>
        </div>
        <div className={styles.orderProcess}>
          <div className={styles.orderProcessBar} style={{ width: `100%` }}></div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'act.invite_datatime' })}</p>
            <span>{timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm')}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Buy.the.price' })}({item.market})
            </p>
            <span>{item.price}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.PUSHthe.number' })}({item.market})
            </p>
            <span>{item.quantity}</span>
          </div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'otcpush.deal.mount' })}</p>
            <span>--</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Cost.amount' })}({item.market})
            </p>
            <span>{item.amount}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'product.list.trade_volume' })}({item.market})
            </p>
            <span>{item.dealQuantity ? item.dealQuantity : '--'}</span>
          </div>
        </div>
      </div>
    );
  };

  const rowtwo = item => {
    let amount = item.amount;
    let money = item.price * item.quantity;
    let percentage = (item.dealQuantity / item.quantity) * 100;
    return (
      <div className={styles.pushList} key={item.id}>
        <div className={styles.listTop}>
          <div>
            {item.currency}/{item.market}
          </div>
          <div className={styles.typeBtn}>
            {item.state === 1 ? (
              <span
                className={styles.cancellations}
                onClick={() => Revoke(item, tradingType, tradingPage, tradingPageSize, settradingList)}
              >
                {formatMessage({ id: 'order.table.action.cancel' })}
              </span>
            ) : (
              ''
            )}

            <span> {orderType(item.state)}</span>
          </div>
        </div>
        <div className={styles.orderProcess}>
          <div className={styles.orderProcessBar} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'act.invite_datatime' })}</p>
            <span>{timeToString(Number(item.createTime), 'YYYY-MM-DD HH:mm')}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Theunit.price' })}({item.market})
            </p>
            <span>{item.price}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'assets.treaty.history.number' })}({item.market})
            </p>
            <span>{item.quantity}</span>
          </div>
        </div>
        <div className={styles.listpice}>
          <div>
            <p>{formatMessage({ id: 'otcpush.deal.total' })}</p>
            <span>{item.dealQuantity}</span>
          </div>
          <div>
            <p>
              {formatMessage({ id: 'container.Cost.amount' })}({item.market})
            </p>
            <span>{item.price * item.dealQuantity}</span>
          </div>
          <div>
            <p>{formatMessage({ id: 'otcpush.remaining.number' })}</p>
            <span>{item.remainQuantity}</span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div>
      <div className={styles.pushOrderContent}>
        <Tabs tabs={tabs2} page={activeId} swipeable={false}>
          <div>
            <ListView
              style={{
                height: `calc(100vh - ${headerTop})`,
                overflow: 'auto'
              }}
              dataSource={list}
              renderBodyComponent={() => <Body />}
              renderFooter={() => <div style={{ textAlign: 'center' }}>{!more && formatMessage({ id: 'common.nodata' })}</div>}
              renderRow={row}
              pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
              pageSize={page_size}
              onEndReached={onEndReached}
              onEndReachedThreshold={10}
            />
          </div>
          <div></div>
        </Tabs>
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(PushRecord);
