import React, { useCallback, useEffect, useReducer, useState } from 'react';
import ThemeOnly from '@/components/ThemeOnly';
import { timeToString, numberToString } from '@/utils';
import { formatMessage } from 'umi/locale';
import { forkConversionRecord } from '@/services/api';
import TopBar from '@/components/TopBar';
import { ListView, PullToRefresh } from 'antd-mobile';
import cs from 'classnames';

import styles from './record.less';

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});
function reducer(state, action) {
  return {
    ...state,
    ...action.payload
  };
}

const fromBrowser = window.localStorage.getItem('mxc.view.from') !== 'app';

function Container() {
  useEffect(() => {
    getDataList();
  }, []);

  const [currentParams, dispatchCurrentParams] = useReducer(reducer, { page: 1, pageSize: 10, forkCurrency: 'ETH' });
  const [dataList, setDataList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getDataList = useCallback(
    (params = currentParams, type) => {
      forkConversionRecord(params).then(result => {
        if (result && result.code === 0) {
          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setDataList([...result.list]);
          } else {
            setDataList([...dataList, ...result.list]);
          }

          if (result.list.length < params.pageSize) {
            setLoaded(true);
          } else {
            dispatchCurrentParams({ payload: { page: params.page + 1 } });
            setLoaded(false);
          }
        }
      });
    },
    [currentParams]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchCurrentParams({ payload: { page: 1 } });
    getDataList({ ...currentParams, page: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }

    getDataList();
  }, [loaded, currentParams]);

  const CustomBody = useCallback(props => {
    return <section className={styles['custom-body']}>{props.children}</section>;
  }, []);

  const renderRow = item => {
    return (
      <section className={styles.item}>
        <div className={styles['value-wrapper']}>
          <div>
            <p>{formatMessage({ id: 'order.table.date' })}</p>
            <p>{timeToString(item.createTime)}</p>
          </div>
          <div className={styles['text-right']}>
            <p>{formatMessage({ id: 'assets.treaty.history.type' })}</p>
            <p>{formatMessage({ id: 'staking.staking.title' })}</p>
          </div>
        </div>

        <div className={styles['value-wrapper']}>
          <div>
            <p>{formatMessage({ id: 'staking.record.eth.num' })}</p>
            <p>{numberToString(-item.amount)}</p>
          </div>

          <div className={styles['text-right']}>
            <p>{formatMessage({ id: 'staking.record.beth.num' })}</p>
            <p>{numberToString(item.amount)}</p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <ThemeOnly theme="light">
      <TopBar>{formatMessage({ id: 'staking.staking.record' })}</TopBar>

      <div className={styles.wrapper}>
        {!fromBrowser && <h3 className={styles.title}>{formatMessage({ id: 'staking.staking.record' })}</h3>}

        {/*<WingBlank>*/}
        <ListView
          className={cs(styles.list, styles['marginBottom24'])}
          dataSource={dataSource.cloneWithRows(dataList)}
          renderFooter={() => (
            <div className={styles.loading}>
              {!loaded ? formatMessage({ id: 'invite.posters.loading' }) : formatMessage({ id: 'invite.posters.endloading' })}
            </div>
          )}
          renderBodyComponent={() => <CustomBody />}
          renderRow={renderRow}
          onEndReached={onEndReached}
          onEndReachedThreshold={10}
          scrollRenderAheadDistance={500}
          pageSize={5}
          // useBodyScroll
          pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
          style={{ height: fromBrowser ? 'calc(100vh - 44px)' : '100vh' }}
        />
        {/*</WingBlank>*/}
      </div>
    </ThemeOnly>
  );
}

export default Container;
