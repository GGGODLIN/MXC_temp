import React, { useReducer, useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import cs from 'classnames';
import { PullToRefresh, ListView, Toast, Modal } from 'antd-mobile';
import moment from 'moment';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getHoldPoolRecord, setPoolOut } from '@/services/api';
import Empty from '@/components/Empty';
import styles from './index.less';
import { getClientHeight } from '@/utils';

const status = {
  NORMAL: formatMessage({ id: 'pos.title.record.state_holding' }),
  INVALID: formatMessage({ id: 'pos.title.record.state_finished' })
};

function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: getClientHeight() - 44,
  list: dataSource.cloneWithRows([]),
  more: false,
  pageSize: 6, //单次渲染条数
  pageNo: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const HoldRecord = ({ tabKey, zone }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, pageNo, pageSize, height } = state;
  useEffect(() => {
    if (tabKey === zone) {
      getList(pageNo, pageSize, 'refresh');
    }
  }, [zone]);

  const getList = async (pageNo, pageSize, type) => {
    const params = {
      pageNo,
      pageSize
    };
    const res = await getHoldPoolRecord(params);

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
      getList(pageNo + 1, pageSize);
    }
  };

  const toServices = e => {
    e.stopPropagation();
    router.push(`/event/customer-service`);
  };
  const unLock = async id => {
    const res = await setPoolOut({ poolId: id });
    if (res.code === 0) {
      getList(pageNo, pageSize, 'refresh');
    }
  };
  const toPos = id => {
    return router.push({
      pathname: `/pos/detail/${id}`
    });
  };

  const toDetail = id => {
    router.push(`/pos/record-hold-detail/${id}`);
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
            <b>{formatMessage({ id: 'pos.title.record.join_time' })}</b>
            <p>{item.joinTime ? moment(item.joinTime).format('YY-MM-DD HH:mm:ss') : '--'}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.out_time' })}</b>
            <p>{item.quitTime ? moment(item.quitTime).format('YY-MM-DD HH:mm:ss') : '--'}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.margin.capital.title' })}</b>
            <p>
              {item.currencyAmount || 0}
              <sub>{item.currency}</sub>
            </p>
          </div>
        </div>
        <div className={styles.itemRow} style={{ justifyContent: 'flex-start' }}>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.new_profit_rate' })}</b>
            <p>{(item.profitRate * 100).toFixed(2)} %</p>
          </div>

          <div>
            <b>{formatMessage({ id: 'pos.title.record.total_profit' })}</b>
            <p>
              {`${Number(item.totalProfit) || 0} `}
              <sub>{item.profitCurrency}</sub>
            </p>
          </div>
        </div>
        <div className={cs(styles.itemRow, styles.btns)}>
          <span onClick={() => toDetail(item.poolId)} className={cs(styles.Button, styles.blue)}>
            {formatMessage({ id: 'pos.title.record.profit_detail' })}
          </span>
          {item.status === 'NORMAL' ? (
            <span
              onClick={() => {
                Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'pos.title.unlock_tip' }), [
                  { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel'), style: 'default' },
                  { text: formatMessage({ id: 'common.yes' }), onPress: () => unLock(item.poolId) }
                ]);
              }}
              className={cs(styles.Button, styles.green)}
              style={{ marginLeft: 10 }}
            >
              {formatMessage({ id: 'pos.title.list.toQuit' })}
            </span>
          ) : (
            <span
              size="small"
              type="primary"
              className={cs(styles.Button, styles.green)}
              style={{ marginLeft: 10 }}
              onClick={() => toPos(item.poolId)}
            >
              {formatMessage({ id: 'assets.pos.go_pos' })}
            </span>
          )}
        </div>
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
  );
};

export default HoldRecord;
