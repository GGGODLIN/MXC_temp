import React, { useReducer, useEffect } from 'react';
import router from 'umi/router';
import classNames from 'classnames';
import { PullToRefresh, ListView } from 'antd-mobile';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { getDepositRecords } from '@/services/api';
import Empty from '@/components/Empty';
import styles from './index.less';

const stateMap = {
  PENDING: formatMessage({ id: 'assets.recharge.pengding' }),
  SUCCESS: formatMessage({ id: 'assets.recharge.success' })
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

const Recharge = ({ type }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  useEffect(() => {
    if (type === 'recharge') {
      getList(page, page_size);
    }
  }, [type]);

  const getList = async (page, pageSize, type) => {
    const params = {
      page,
      page_size: pageSize || page_size
    };
    const res = await getDepositRecords(params);

    if (res.code === 0) {
      const data = res.recharge || [];

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

  const toDetail = item => {
    router.push(`/uassets/record-detail?txId=${item.txHash}`);
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
              {moment(item.receiptTime).format('YYYY-MM-DD HH:mm:ss')}
            </label>
            <p className={styles.currency}>{item.vcoinNameEN}</p>
          </div>
          <div className={styles.right}>
            <span className={styles.status}>{stateMap[item.status]}</span>
            <p>
              <label htmlFor="">{formatMessage({ id: 'assets.treaty.history.number' })}：</label>
              <span>{item.rechargeValue}</span>
            </p>
          </div>
        </div>
        <div className={styles.block}>
          <p className="notDelete">
            {formatMessage({ id: 'assets.recharge.blockchain' })}：{item.confirmations}/{item.requireConfirmations}
          </p>
          {item.state === 'CANCEL' ? (
            <span onClick={toServices}>
              {formatMessage({ id: 'maintain.support' })}
              <i className="iconfont iconsanjiaoxing-bian"></i>
            </span>
          ) : (
            <span>
              {formatMessage({ id: 'assets.to.detail' })}
              <i className="iconfont iconsanjiaoxing-bian"></i>
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

export default Recharge;
