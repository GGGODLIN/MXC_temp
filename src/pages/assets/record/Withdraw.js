import React, { useReducer, useEffect } from 'react';
import router from 'umi/router';
import classNames from 'classnames';
import { PullToRefresh, ListView, Button } from 'antd-mobile';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import Empty from '@/components/Empty';
import { getWithdrawRecords, cancelWithdraw } from '@/services/api';
import styles from './index.less';

const stateMap = {
  APPLY: formatMessage({ id: 'assets.cash.state.waitSure' }),
  AUDITING: formatMessage({ id: 'assets.cash.state.loading' }),
  WAIT: formatMessage({ id: 'assets.cash.state.loading' }),
  PROCESSING: formatMessage({ id: 'assets.cash.state.loading' }),
  FAILED: formatMessage({ id: 'assets.cash.state.loading' }),
  WAIT_CONFIRM: formatMessage({ id: 'assets.cash.state.waitqk' }),
  WAIT_PACKAGING: formatMessage({ id: 'assets.cash.state.waitqk' }),
  SUCCESS: formatMessage({ id: 'assets.cash.state.success' }),
  CANCEL: formatMessage({ id: 'assets.cash.state.cancel' }),
  MANUAL: formatMessage({ id: 'assets.cash.state.loading' })
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

const Withdraw = ({ type }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  useEffect(() => {
    if (type === 'withdraw') {
      getList(page, page_size);
    }
  }, [type]);

  const getList = async (page, pageSize, type) => {
    const params = {
      page,
      page_size: pageSize || page_size
    };
    const res = await getWithdrawRecords(params);

    if (res.code === 0) {
      const data = res.cash || [];

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

  const cancelWithdrawHandle = async (e, item) => {
    e.stopPropagation();

    const params = {
      withdrawId: item.id,
      memberId: item.memberId
    };
    const res = await cancelWithdraw(params);
    if (res.code === 0) {
      getList(1, page_size, 'refresh');
    }
  };
  const toDetail = item => {
    router.push(`/uassets/record-detail?id=${item.id}`);
  };

  const toServices = e => {
    e.stopPropagation();
    router.push(`/event/customer-service`);
  };

  const row = item => {
    return (
      <div className={classNames(styles.item)} key={item.id} onClick={() => toDetail(item)}>
        <div className={styles.box}>
          <div className={styles.left}>
            <label htmlFor="" className={styles.time}>
              {moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </label>
            <p className={styles.currency}>{item.currency}</p>
          </div>
          <div className={styles.right}>
            <span className={styles.status}>{stateMap[item.state]}</span>
            <p>
              <label htmlFor="">{formatMessage({ id: 'assets.treaty.history.number' })}：</label>
              <span>{item.amount}</span>
            </p>
            <p>
              <label htmlFor=""> {formatMessage({ id: 'assets.balances.cash.fee' })}：</label>
              <span>{item.fee}</span>
            </p>
          </div>
        </div>
        <div className={styles.block}>
          {(item.state === 'APPLY' || item.state === 'AUDITING' || item.state === 'WAIT') && (
            <Button type="ghost" size="small" inline onClick={e => cancelWithdrawHandle(e, item)}>
              {formatMessage({ id: 'assets.cash.cancel' })}
            </Button>
          )}
          <p className="notDelete"></p>
          <span>
            {formatMessage({ id: 'assets.to.detail' })}
            <i className="iconfont iconsanjiaoxing-bian"></i>
          </span>
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

export default Withdraw;
