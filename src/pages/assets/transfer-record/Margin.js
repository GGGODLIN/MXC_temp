import React, { useReducer, useEffect } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { PullToRefresh, ListView } from 'antd-mobile';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { transferHistory } from '@/services/api';
import { getSubSite } from '@/utils';
import Empty from '@/components/Empty';

import styles from './List.less';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

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
  page_size: 10, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Margin = () => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  useEffect(() => {
    getList(page, page_size);
  }, []);

  const getList = async (page, pageSize, type) => {
    const params = {
      page,
      sys: 'MARGIN_V2',
      page_size: pageSize || page_size
    };
    const res = await transferHistory(params);

    if (res.code === 0) {
      const data = res.data || [];

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

  const row = item => {
    return (
      <div className={classNames(styles.item)} key={item.id}>
        <div className={styles.box}>
          <img src={`${MAIN_SITE_API_PATH}/file/download/${item.icon}`} alt="" />
          <div className={styles.coin}>
            <strong>{item.currency}</strong>
          </div>
          <p>{item.amount}</p>
        </div>
        <div className={styles.status}>
          {item.fromSys === 'MAIN' ? (
            <p style={{ color: 'var(--up-color)' }}>{formatMessage({ id: 'assets.treaty.transfer_in' })}</p>
          ) : (
            <p style={{ color: 'var(--down-color)' }}>{formatMessage({ id: 'assets.treaty.transfer_out' })}</p>
          )}
          <span>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
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

export default Margin;
