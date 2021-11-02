import { useReducer, useEffect } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import { PullToRefresh, ListView, Toast, Modal } from 'antd-mobile';
import moment from 'moment';
import Empty from '@/components/Empty';
import cs from 'classnames';
import TopBar from '@/components/TopBar';
import { getLockRecordDetail, getHoldPoolRecordDetail } from '@/services/api';
import styles from './index.less';
import { getClientHeight } from '@/utils';

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: getClientHeight() - 44,
  list: dataSource.cloneWithRows([]),
  more: true,
  pageSize: 20, //单次渲染条数
  pageNo: 1,
  currency: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}
function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}
const detail = ({ match }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, pageNo, pageSize, height, currency } = state;
  const isHold = match.path.indexOf('record-hold-detail') > 0;
  useEffect(() => {
    getList(pageNo, pageSize);
  }, []);

  const getList = async (pageNo = 1, pageSize = 20, type) => {
    const req = isHold ? getHoldPoolRecordDetail : getLockRecordDetail;
    const params = {
      pageNo,
      pageSize: pageSize,
      [isHold ? 'poolId' : 'lockId']: match.params.id
    };

    const res = await req(params);

    if (res.code === 0) {
      const data = res.data || [];
      if (data.length > 0) {
        setState({ currency: data[0].currency });
      }
      if (list._dataBlob.s1.length !== res.total) {
        if (type === 'refresh') {
          setState({ list: dataSource.cloneWithRows(data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
          setState({ more: true });
        }
      } else {
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
  const row = item => {
    return isHold ? (
      <div className={styles.item} key={item.logId}>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'assets.margin.capital.title' })}</b>
            <p>
              {item.position || 0}
              {item.currency}
            </p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.record.pool_amouunt' })}</b>
            <p>
              {item.amount || 0}
              {item.profitCurrency}
            </p>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'fin.title.rate' })}</b>
            <p>{(item.profitRate * 100).toFixed(2)}%</p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.profit_time' })}</b>
            <p>{item.createTime ? moment(item.createTime).format('MM-DD HH:mm:ss') : '--'}</p>
          </div>
        </div>
      </div>
    ) : (
      <div className={styles.item} key={item.logId}>
        <div className={styles.itemRow}>
          <div>
            <b>{formatMessage({ id: 'pos.title.detail.lock_num' })}</b>
            <p>
              {item.amount || 0}
              {item.currency}
            </p>
          </div>
          <div>
            <b>{formatMessage({ id: 'assets.record.pool_amouunt' })}</b>
            <p>
              {item.profit || 0}
              {item.profitCurrency}
            </p>
          </div>
          <div>
            <b>{formatMessage({ id: 'pos.title.record.profit_time' })}</b>
            <p>{item.createTime ? moment(item.createTime).format('MM-DD HH:mm:ss') : '--'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <TopBar gotoPath={'/pos/record'}>{formatMessage({ id: 'pos.title.record.profit_detail' })}</TopBar>
      {currency && <h2 className={styles.title}>{currency}</h2>}
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
            return <Empty />;
          }
        }}
        renderRow={row}
        pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
        pageSize={pageSize}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
        initialListSize={20}
      />
    </div>
  );
};

export default detail;
