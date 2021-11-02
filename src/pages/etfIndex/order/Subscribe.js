import React, { useReducer, useEffect } from 'react';
import { PullToRefresh, ListView, Toast } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { timeToString, cutFloatDecimal } from '@/utils';
import { getETFIndexOrderList, cancelEtfIndexOrder } from '@/services/api';
import Empty from '@/components/Empty';

import styles from './index.less';

const lang = getLocale();

const _orderStatuMap = {
  CREATE: formatMessage({ id: 'etfIndex.orders.status.CREATE' }),
  PROCESSING: formatMessage({ id: 'etfIndex.orders.status.PROCESSING' }),
  FAIL: formatMessage({ id: 'etfIndex.orders.status.FAIL' }),
  CANCEL: formatMessage({ id: 'etfIndex.orders.status.CANCEL' }),
  DONE: formatMessage({ id: 'order.table.status.deal_done' })
};

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
  page_size: 6, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Subscribe = ({ currency, status }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  useEffect(() => {
    getList(page, page_size);
  }, []);

  useEffect(() => {
    getList(1, page_size, 'refresh');
  }, [currency, status]);

  const getList = async (page, pageSize, type) => {
    const params = {
      pageNum: page,
      pageSize: pageSize || page_size,
      tradeType: 'subscribe',
      currency: currency ? currency.split('_')[0] : ''
    };

    if (status) {
      params.status = status;
    }

    const res = await getETFIndexOrderList(params);

    if (res.code === 200) {
      const data = res.data.resultList || [];

      if ((params.currency || params.status) && !data.length) {
        setState({ list: dataSource.cloneWithRows(data) });
        return false;
      }

      if (data.length) {
        if (type === 'refresh') {
          setState({ list: dataSource.cloneWithRows(data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
        }
      } else {
        setState({ more: false });
      }
    }
  };

  const onRefresh = e => {
    setState({ page: 1, more: true });
    getList(1, page_size, 'refresh');
  };

  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 });
      getList(page + 1);
    }
  };

  const cellFieldRender = (item, scale = 4, field, unit) => {
    if (item.status !== 'DONE') {
      if (item.tradeType === 'subscribe' && field === 'amount') {
        return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
      } else if (item.tradeType === 'redemption' && field === 'quantity') {
        return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
      } else {
        return '--';
      }
    } else {
      return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
    }
  };

  const handleCancel = async orderId => {
    const res = await cancelEtfIndexOrder({ orderId });

    if (res.code === 200) {
      Toast.success(formatMessage({ id: 'order.table.action.cancel.success' }));
      onRefresh();
    }
  };

  const row = item => {
    return (
      <div className={styles.item}>
        <div className={styles.title}>
          <label htmlFor="">{lang.startsWith('zh') ? item.name : item.nameEn}</label>
          {item.tradeType === 'subscribe' ? (
            <span className={styles.bids}>{formatMessage({ id: 'etfIndex.bid.title' })}</span>
          ) : (
            <span className={styles.asks}>{formatMessage({ id: 'etfIndex.ask.title' })}</span>
          )}
        </div>
        <div className={styles.field}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'act.invite_datatime' })}</label>
            <p>{timeToString(item.createTime)}</p>
          </div>
          <div>
            <label htmlFor="">
              {item.tradeType === 'subscribe'
                ? formatMessage({ id: 'etfIndex.bid.price' })
                : formatMessage({ id: 'etfIndex.order.ask.title1' })}
            </label>
            <p>{cellFieldRender(item, 4, 'amount', 'USDT')}</p>
          </div>
          <div>
            <label htmlFor="">
              {item.tradeType === 'subscribe'
                ? formatMessage({ id: 'etfIndex.order.bid.title3' })
                : formatMessage({ id: 'etfIndex.order.ask.title2' })}
            </label>
            <p>{cellFieldRender(item, 4, 'quantity')}</p>
          </div>
        </div>
        <div className={styles.field}>
          <div>
            <label htmlFor="">
              {item.tradeType === 'subscribe'
                ? formatMessage({ id: 'etfIndex.order.bid.title4' })
                : formatMessage({ id: 'etfIndex.order.ask.title3' })}
            </label>
            <p>{cellFieldRender(item, 4, 'fee', 'USDT')}</p>
          </div>
          <div>
            <label htmlFor="">{formatMessage({ id: 'etfIndex.order.bid.title5' })}</label>
            <p>{cellFieldRender(item, 4, 'price', 'USDT')}</p>
          </div>
          <div>
            <label htmlFor="">{formatMessage({ id: 'assets.recharge.status' })}</label>
            <p>{_orderStatuMap[item.status]}</p>
          </div>
        </div>
        {item.status === 'CREATE' && (
          <div className={styles.handle}>
            <span className={styles.btn} onClick={e => handleCancel(item.orderId)}>
              {formatMessage({ id: 'order.table.action.cancel' })}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
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
  );
};

export default Subscribe;
