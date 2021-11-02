import React, { useEffect, useState, useReducer, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import ThemeOnly from '@/components/ThemeOnly';
import cn from 'classnames';
import { sunshineRecord } from '@/services/api';
import Empty from '@/components/Empty';
import { formatMessage } from 'umi/locale';
import { ListView, PullToRefresh } from 'antd-mobile';
import styles from './record.less';
import TimeFilter from '@/components/TimeFilter';
import { timeToString } from '@/utils';

function Container() {
  const [currentParams, dispatchCurrentParams] = useReducer(reducer, { page: 1, pageSize: 10, startTime: null, endTime: null });
  const [dataList, setDataList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDataList();
  }, [currentParams.startTime, currentParams.endTime]);

  const fromBrowser = window.localStorage.getItem('mxc.view.from') !== 'app';
  const getDataList = useCallback(
    (params = currentParams, type) => {
      sunshineRecord(params).then(result => {
        if (result && result.code === 0) {
          result.data &&
            result.data.resultList.sort((a, b) => {
              return b.lockTime - a.lockTime;
            });
          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setDataList(result.data.resultList);
          } else if (type === 'onload') {
            setDataList([...dataList, ...result.data.resultList]);
          } else {
            setDataList(result.data.resultList);
          }

          if (result.data.resultList.length < params.pageSize) {
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

  const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2
  });

  function reducer(state, action) {
    return {
      ...state,
      ...action.payload
    };
  }

  const filterSearch = e => {
    dispatchCurrentParams({ payload: { page: 1, startTime: (e && e[0]) || null, endTime: (e && e[1]) || null } });
  };
  const renderList = item => {
    return (
      <section className={styles.Listcontent}>
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <h4 className={styles.listCurrency}>{item.profitCurrency}</h4>
          </div>
          <div className={styles.listItem}>
            <div className={styles.itemInfo}>
              <div className={styles.itemInfoGroup}>
                <div className={styles.itemKeyValue}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_sun_list_record_lable2' })}</span>
                  <span className={styles.itemValue}>
                    {item.quantity} {item.currency}
                  </span>
                </div>
                {/* 奖励发放时间 */}
                <div className={styles.itemKeyValue}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_sun_list_record_lable5' })}</span>
                  <span className={styles.itemValue}>{item.grantTime ? timeToString(item.grantTime, 'MM-DD HH:mm') : '--'}</span>
                </div>
              </div>
              {/* 锁仓时间 */}
              <div className={styles.itemInfoGroup}>
                <div className={styles.itemKeyValue}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_sun_list_record_lable3' })}</span>
                  <span className={styles.itemValue}>{item.lockTime ? timeToString(item.lockTime, 'MM-DD HH:mm') : '--'}</span>
                </div>
                {/* 发放数量 */}
                <div className={styles.itemKeyValue}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_sun_list_record_lable6' })}</span>
                  <span className={styles.itemValue}>{item.profit ? `${item.profit} ${item.profitCurrency}` : '--'}</span>
                </div>
              </div>
              {/* 解锁时间 */}
              <div className={styles.itemInfoGroup}>
                <div className={cn(styles.itemKeyValue, styles.textRight)}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_sun_list_record_lable4' })}</span>
                  <span className={styles.itemValue}>{item.unlockTime ? timeToString(item.unlockTime, 'MM-DD HH:mm') : '--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchCurrentParams({ payload: { page: 1 } });
    getDataList({ ...currentParams, page: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }
    getDataList({ ...currentParams }, 'onload');
  }, [loaded, currentParams]);

  const CustomBody = useCallback(props => {
    return <section className={styles['custom-body']}>{props.children}</section>;
  }, []);
  return (
    <ThemeOnly theme="light">
      <div className={styles.wrapper}>
        <TopBar>{formatMessage({ id: 'voting.index.mine_voting.btn' })}</TopBar>
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{formatMessage({ id: 'act.Commission.record' })}</h3>
            <div className={styles.rightIcon}>
              <div className={styles.btnInner}>
                <TimeFilter color="#555b63" handel={e => filterSearch(e)}></TimeFilter>
              </div>
              <span onClick={onRefresh} className={styles.btnInner}>
                <i className={cn('iconfont iconrefresh_icon', styles.refreshBtn)}></i>
              </span>
            </div>
          </div>
        </section>
        <section className={cn(styles.content, styles.position)}>
          <ListView
            className={cn(styles.list, styles['marginBottom24'])}
            dataSource={dataSource.cloneWithRows(dataList)}
            renderFooter={() => (
              // <div className={styles.loading}>
              //   {!loaded ? <Empty initialTheme="light" /> : formatMessage({ id: 'invite.posters.endloading' })}
              // </div>
              <div>{dataList && dataList.length === 0 && <Empty initialTheme="light" />}</div>
            )}
            renderBodyComponent={() => <CustomBody />}
            renderRow={renderList}
            onEndReached={onEndReached}
            onEndReachedThreshold={10}
            scrollRenderAheadDistance={500}
            pageSize={5}
            // useBodyScroll
            pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
            style={{ height: fromBrowser ? 'calc(100vh - 44px)' : '100vh' }}
          />
        </section>
      </div>
    </ThemeOnly>
  );
}

export default Container;
