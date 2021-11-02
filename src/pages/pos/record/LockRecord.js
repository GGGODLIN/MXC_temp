import React, { useReducer, useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import cs from 'classnames';
import { PullToRefresh, ListView, Toast, Modal } from 'antd-mobile';
import moment from 'moment';
import Empty from '@/components/Empty';
import RangeTimeSelect from '@/components/RangeTimeSelect';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { setPoolUnLock, getLockPoolRecord } from '@/services/api';
import { getSubSite, getClientHeight, multiply, sub } from '@/utils';
import styles from './index.less';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const status = {
  LOCKING: formatMessage({ id: 'pos.title.record.lock_status_LOCKING' }),
  WAIT_GRANT: formatMessage({ id: 'pos.title.record.state_wait' }),
  FINISHED: formatMessage({ id: 'pos.title.record.state_finished' })
};

const defaultTime = [null, null];

function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: getClientHeight() - 44 - 40,
  list: dataSource.cloneWithRows([]),
  more: false,
  pageSize: 6, //单次渲染条数
  pageNo: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const LockRecord = ({ tabKey, zone }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, pageNo, pageSize, height } = state;
  const [filter, setFilter] = useState([defaultTime[0], defaultTime[1]]);
  const filterSearch = test => {
    const time = [];
    time[0] = test[0] ? moment(moment(test[0]).format('YYYY-MM-DD 00:00:00')).format('x') : null;
    time[1] = test[1] ? moment(moment(test[1]).format('YYYY-MM-DD 23:59:59')).format('x') : null;
    setFilter(time);
  };
  useEffect(() => {
    if (tabKey === zone) {
      getList(pageNo, pageSize, 'refresh');
    }
  }, [zone, filter]);

  const getList = async (pageNo = 1, pageSize = 6, type) => {
    const params = {
      pageNo,
      pageSize: pageSize,
      startTime: filter[0],
      endTime: filter[1],
      zone: zone
    };
    const res = await getLockPoolRecord(params);

    if (res.code === 0) {
      const data = res.data || [];

      if (type === 'refresh') {
        setState({ list: dataSource.cloneWithRows(data) });
      } else {
        setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
      }
      if (pageNo === Math.round(res.total / pageSize)) {
        setState({ more: false });
      }
    }
  };

  const onRefresh = e => {
    setState({ pageNo: 1, more: true });
    getList(1, pageSize, 'refresh');
  };

  const onEndReached = async e => {
    if (more) {
      setState({ pageNo: pageNo + 1 });
      getList(pageNo + 1);
    }
  };

  const unLock = async item => {
    if (!(item.currentLockDays >= item.minLockDays && item.status === 'LOCKING')) {
      return Toast.info(formatMessage({ id: 'pos.title.record.not_unlock' }));
    }
    const res = await setPoolUnLock({ logId: item.logId });
    if (res.code === 0) {
      onRefresh();
    }
  };

  const toDetail = id => {
    router.push(`/pos/record-detail/${id}`);
  };

  const row = item => {
    return (
      <div className={styles.item} key={item.logId}>
        <div className={styles.itemImg}>
          {/* <img
              src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === item.currency) &&
                coinList.find(coin => coin.vcoinName === item.currency).icon}`}
              alt=""
            /> */}
          <b>{item.currency}</b>

          <i>{status[item.status]}</i>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'pos.title.detail.lock_starttime' })}</b>
            <p>{moment(item.createTime).format('MM-DD HH:mm:ss')}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.start_unlock_time' })}</b>
            <p>{item.unlockTime ? moment(item.unlockTime).format('MM-DD HH:mm:ss') : '--'}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.start_release_time' })}</b>
            <p>{item.releaseTime ? moment(item.releaseTime).format('MM-DD HH:mm:ss') : '--'}</p>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b
              onClick={() => {
                Modal.alert(formatMessage({ id: 'fin.title.progress' }), formatMessage({ id: 'mc_pos_count_progress_2' }));
              }}
            >
              {formatMessage({ id: 'fin.title.progress' })} <i className="iconfont iconquestion-circle"></i>
            </b>
            <p>{`${item.currentLockDays}${formatMessage({ id: 'common.day' })} / ${item.minLockDays}${formatMessage({
              id: 'common.day'
            })}`}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.detail.lock_num' })}</b>
            <p>
              {`${Number(item.amount || 0)} `}
              <sub>{item.currency}</sub>
            </p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</b>
            <p>
              {item.realProfitRate - item.profitRate > 0 ? (
                <>
                  {Boolean(item.profitRangeEnd) && Boolean(item.profitRangeStart)
                    ? `${(item.profitRangeStart * 100).toFixed(2)}%-${(item.profitRangeEnd * 100).toFixed(2)}%`
                    : (item.profitRate * 100).toFixed(2) + '%'}
                  <span className={styles.greenRate}>+{multiply(sub(item.realProfitRate, item.profitRate), 100)}%</span>
                </>
              ) : Boolean(item.profitRangeEnd) && Boolean(item.profitRangeStart) ? (
                `${(item.profitRangeStart * 100).toFixed(2)}%-${(item.profitRangeEnd * 100).toFixed(2)}%`
              ) : (
                (item.profitRate * 100).toFixed(2) + '%'
              )}
            </p>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.current_lock_incoming' })}</b>
            <p>
              {Number(item.currentProfit) || '--'} <sub>{item.profitCurrency}</sub>
            </p>
          </div>
        </div>
        <div className={cs(styles.itemRow, styles.btns)}>
          <span style={{ marginLeft: 10 }} onClick={() => toDetail(item.logId)} className={cs(styles.Button, styles.blue)}>
            {formatMessage({ id: 'pos.title.record.profit_detail' })}
          </span>
          <span
            onClick={() => {
              if (!(item.currentLockDays >= item.minLockDays && item.status === 'LOCKING')) {
                return Toast.info(formatMessage({ id: 'pos.title.record.not_unlock' }));
              }
              Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'pos.title.unlock_tip' }), [
                { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel'), style: 'default' },
                { text: formatMessage({ id: 'common.yes' }), onPress: () => unLock(item) }
              ]);
            }}
            style={{ marginLeft: 10 }}
            className={cs(styles.Button, item.currentLockDays >= item.minLockDays && item.status === 'LOCKING' && styles.green)}
          >
            {formatMessage({ id: 'pos.title.record.unlock' })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <RangeTimeSelect handle={filterSearch}></RangeTimeSelect>
      <ListView
        style={{
          height,
          overflow: 'auto'
        }}
        dataSource={list}
        renderBodyComponent={() => <Body />}
        renderFooter={() => {
          if (list._dataBlob.s1.length) {
            return <div style={{ textAlign: 'center' }}>{formatMessage({ id: 'common.no.data_more' })}</div>;
          } else {
            return <Empty />;
          }
        }}
        renderRow={row}
        pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
        pageSize={pageSize}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
      />
    </div>
  );
};

export default LockRecord;
