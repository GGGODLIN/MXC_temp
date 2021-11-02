import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import { formatMessage } from 'umi-plugin-locale';
import { Toast, ListView, PullToRefresh } from 'antd-mobile';
import { newmarginRepayList } from '@/services/api';

import styles from './index.less';
import CommonRecord from './recordItem';

function CustomBody(props) {
  return <section className={styles['custom-body']}>{props.children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

function BackRecord({ active }) {
  const [currentParams, setCurrentParams] = useState({ pageNum: 1, pageSize: 10, accountType: 'STEP' });

  useEffect(() => {
    if (active) {
      getOrderList({ ...currentParams });
    }
  }, [active]);

  const [orderList, setOrderList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getOrderList = useCallback(
    (params = currentParams, type) => {
      newmarginRepayList(params).then(result => {
        if (result && result.code === 200) {
          // 转换数值
          const transformationData = result.data.resultList;

          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setOrderList([...transformationData]);
          } else {
            setOrderList([...orderList, ...transformationData]);
          }

          if (params.pageNum < result.data.totalPage) {
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
    getOrderList({ ...currentParams, pageNum: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }

    getOrderList();
  }, [loaded, currentParams]);

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
      renderRow={item => <CommonRecord item={item} type="back" />}
      onEndReached={onEndReached}
      onEndReachedThreshold={10}
      scrollRenderAheadDistance={300}
      pageSize={10}
      pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(withRouter(BackRecord));
