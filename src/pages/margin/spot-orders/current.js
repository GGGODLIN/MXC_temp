import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import { formatMessage } from 'umi-plugin-locale';
import { Toast, ListView, PullToRefresh } from 'antd-mobile';
import { cutFloatDecimal, sub } from '@/utils';
import { newMarginOrder, newCancelMarginOrder } from '@/services/api';
import Order from '../order';

import styles from './index.less';

function CustomBody(props) {
  return <section className={styles['custom-body']}>{props.children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

function Current({ location, filterParams, ...p }) {
  const [currentParams, setCurrentParams] = useState({ pageNum: 1, accountType: 'STEP' });

  useEffect(() => {
    if (filterParams) {
      getOrderList({ ...currentParams, ...filterParams, pageNum: 1 }, 'refresh');
    }
  }, [filterParams]);

  useEffect(() => {
    const trade = location.hash.replace('#', '');
    const currency = trade ? trade.split('_')[0] : '';
    const market = trade ? trade.split('_')[1] : '';
    const params = { pageSize: 5 };

    if (currency && market) {
      params.symbol = currency + '_' + market;
    }

    setCurrentParams({ ...currentParams, ...params });
    getOrderList({ ...currentParams, ...params });
  }, []);

  const [orderList, setOrderList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getOrderList = useCallback(
    (params = currentParams, type) => {
      newMarginOrder(params).then(result => {
        if (result && result.code === 200) {
          // 转换数值
          const transformationData = result.data.resultList.map(item => {
            const pair = item.symbol.split('_');
            return {
              currency: pair[0],
              market: pair[1],
              ...item
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

          if (params.pageNum < Number(result.data.totalPage)) {
            setCurrentParams({ ...params, pageNum: params.pageNum + 1 });
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
    setCurrentParams({ ...currentParams, pageNum: 1 });
    getOrderList({ ...currentParams, ...filterParams, pageNum: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }
    console.log(currentParams);

    getOrderList();
  }, [loaded, currentParams]);

  const onCancel = async orderId => {
    let result = await newCancelMarginOrder(orderId);

    if (result && result.code === 200) {
      Toast.success(formatMessage({ id: 'order.table.action.cancel.success' }), 2);
      // 撤单成功后，改变当前order状态
      onRefresh();
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
      renderRow={item => <Order order={item} mode={'limit'} onCancel={onCancel} />}
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
