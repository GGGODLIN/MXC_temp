import React, { useReducer, useEffect } from 'react';
import router from 'umi/router';
import cs from 'classnames';
import { PullToRefresh, ListView } from 'antd-mobile';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { getOtherRecord } from '@/services/api';
import Empty from '@/components/Empty';
import styles from './index.less';

const optionMap = [
  {
    value: 'SUGAR',
    name: formatMessage({ id: 'assets.title.airdrop.record' })
  },
  {
    value: 'AMPL_REBASE',
    name: formatMessage({ id: 'assets.title.rebase' })
  },
  {
    value: 'TRADE_ROLLBACK',
    name: formatMessage({ id: 'common.other' })
  }
];
const typeMap = {
  '66': formatMessage({ id: 'common.other' }),
  '6': formatMessage({ id: 'assets.title.airdrop.record' }),
  '402': formatMessage({ id: 'assets.title.airdrop.record' }),
  '404': formatMessage({ id: 'assets.title.rebase' })
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
  page: 1,
  assetLogType: []
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Recharge = ({ filterType, type }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  useEffect(() => {
    if (type === 'other') {
      getList(page, page_size, 'refresh');
    }
  }, [filterType, type]);

  const getList = async (page, pageSize, type) => {
    const types = optionMap.map(item => item.value).join(',');
    const params = {
      pageNo: page,
      pageSize: pageSize || page_size,
      assetLogType: filterType === 4 ? types : optionMap[filterType].value
    };
    const res = await getOtherRecord(params);

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
      <div className={styles.otherItem} key={item.transTime}>
        <div className={styles.itemRow}>
          <div className={styles.title}>{item.vcoinName}</div>
          <div></div>
          <div>
            {formatMessage({ id: 'assets.treaty.history.type' })}: {typeMap[item.type]}
          </div>
        </div>
        <div className={styles.itemRow}>
          <div style={{ width: '40%', flex: 'auto' }}>
            <b>{formatMessage({ id: 'act.invite_datatime' })}</b>
            <p>{item.transTime ? moment(item.transTime).format('YYYY.MM.DD HH:mm') : '--'}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.treaty.history.number' })}</b>
            <p>{item.amount || 0}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.recharge.status' })}</b>
            <p>{formatMessage({ id: 'header.complete' })}</p>
          </div>
        </div>
        {item.transNote && (
          <div>
            {formatMessage({ id: 'ucenter.api.memo' })}: {item.transNote}
          </div>
        )}
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
