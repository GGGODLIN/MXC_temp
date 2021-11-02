import React, { useReducer, useEffect, useState } from 'react';
import { PullToRefresh, ListView, Toast } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { getLabsRecord } from '@/services/api';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import Empty from '@/components/Empty';
import TimeFilter from '@/components/TimeFilter';
import moment from 'moment';
import styles from './index.less';

const status = {
  LOCKING: formatMessage({ id: 'pos.title.record.lock_status_LOCKING' }),
  WAIT_GRANT: formatMessage({ id: 'pos.title.record.lock_status_WAIT_GRANT' }),
  FINISHED: formatMessage({ id: 'pos.title.record.lock_status_FINISHED' })
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
  pageSize: 6, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Record = ({ coinList, location }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, pageSize, height } = state;
  const [filter, setFilter] = useState([null, null]);
  const [zone, setZone] = useState(location.query.zone || 'HALVE');

  useEffect(() => {
    getList(page, pageSize);
  }, [zone]);

  const getList = async (pageNo = 1, pageSize = 6, type) => {
    const params = {
      type: '',
      page,
      pageSize: pageSize || pageSize,
      start: filter[0],
      end: filter[1],
      zone
    };
    const res = await getLabsRecord(params);

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
    getList(1, pageSize, 'refresh');
  };

  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 });
      getList(page + 1);
    }
  };

  const filterSearch = e => {
    setFilter(e);
  };

  useEffect(() => {
    onRefresh();
  }, [filter]);

  const row = item => {
    return (
      <div className={styles.item} key={item.logId}>
        <div className={styles.itemImg}>
          <div>
            <b>{item.pname}</b>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'trade.list.price' })}</b>
            <p>{item.price}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.treaty.history.number' })}</b>
            <p>{item.quantity}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'depths.list.amount' })}</b>
            <p>{item.amount}</p>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'fin.common.start_time' })}</b>
            <p>{moment(item.startTime).format('YYYY/MM/DD')}</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'fin.common.end_time' })}</b>
            <p>{moment(item.endTime).format('YYYY/MM/DD')}</p>
          </div>
          <div></div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <TopBar extra={<TimeFilter handel={e => filterSearch(e)}></TimeFilter>}>
        <div className={styles.title}>
          <span className={classNames({ [styles.active]: zone === 'HALVE' })} onClick={() => setZone('HALVE')}>
            SpaceM
          </span>
          <span className={classNames({ [styles.active]: zone === 'MDAY' })} onClick={() => setZone('MDAY')}>
            M-Day
          </span>
        </div>
      </TopBar>
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
        pageSize={pageSize}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
      />
    </div>
  );
};

export default Record;
