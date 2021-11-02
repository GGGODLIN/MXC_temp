import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import { formatMessage } from 'umi-plugin-locale';
import { Toast, ListView, PullToRefresh } from 'antd-mobile';
import { cutFloatDecimal } from '@/utils';
import { getUserOrders, cancelLimitOrder } from '@/services/api';
import Order from '../order';

import styles from './index.less';

function CustomBody(props) {
  return <section className={styles['custom-body']}>{props.children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

function Current({ location, filterParams }) {
  const [currentParams, setCurrentParams] = useState({ page: 1 });

  useEffect(() => {
    if (filterParams) {
      getOrderList({ ...currentParams, ...filterParams, page: 1 }, 'refresh');
    }
  }, [filterParams]);

  useEffect(() => {
    const trade = location.hash.replace('#', '');
    const currency = trade ? trade.split('_')[0] : '';
    const market = trade ? trade.split('_')[1] : '';
    const params = {};

    if (currency) {
      params.currency = currency;
    }

    if (market) {
      params.market = market;
    }

    setCurrentParams({ ...currentParams, ...params });
    getOrderList({ ...currentParams, ...params });
  }, []);

  const [orderList, setOrderList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getOrderList = useCallback(
    (params = currentParams, type) => {
      getUserOrders(params).then(result => {
        if (result && result.code === 0) {
          // 转换数值
          const transformationData = result.list.map(item => {
            return {
              ...item,
              dealAmountString: item.dealAmount,
              priceString: item.price,
              avgPriceString: item.avgPrice || 0,
              quantityString: cutFloatDecimal(item.quantity),
              amountString: cutFloatDecimal(item.amount)
            };
          });

          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setOrderList([...transformationData]);
          } else {
            setOrderList([...orderList, ...transformationData]);
          }

          if (params.page < result.totalPage) {
            setCurrentParams({ ...params, page: params.page + 1 });
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }
      });
    },
    [currentParams]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentParams({ ...currentParams, page: 1 });
    getOrderList({ ...currentParams, page: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }

    getOrderList();
  }, [loaded, currentParams]);

  const onCancel = async orderId => {
    let result = await cancelLimitOrder({ id: orderId });

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'order.table.action.cancel.success' }), 2);
      // 撤单成功后，改变当前order状态
      const tempOrderList = orderList.map(order => {
        if (order.id === orderId) {
          order.status = 4;
        }

        return order;
      });

      setOrderList(tempOrderList);
    }
  };

  return (
    <ListView
      className={styles.content}
      dataSource={dataSource.cloneWithRows(orderList)}
      renderFooter={() => (
        <div className={styles.loading}>
          {!loaded ? formatMessage({ id: 'invite.posters.loading' }) : formatMessage({ id: 'invite.posters.endloading' })}
        </div>
      )}
      renderBodyComponent={() => <CustomBody />}
      renderRow={item => <Order order={item} onCancel={onCancel} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={10}
      scrollRenderAheadDistance={500}
      pageSize={5}
      pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(withRouter(Current));
