import React, { useReducer, useEffect } from 'react';
import router from 'umi/router';
import classNames from 'classnames';
import { PullToRefresh, ListView, Modal, Toast, SwipeAction } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import Empty from '@/components/Empty';
import { getWithdrawAddresses, deleteWithdrawAddress } from '@/services/api';
import styles from './List.less';

const alert = Modal.alert;

function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: document.documentElement.clientHeight,
  list: dataSource.cloneWithRows([]),
  active: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const List = ({ dispatch, currency, chain, withdrawFormValues }) => {
  const [state, setState] = useReducer(reducer, initialState);
  let { list, height, active } = state;

  useEffect(() => {
    getList();
  }, []);

  const getList = async type => {
    const res = await getWithdrawAddresses({ currency: chain });

    if (res.code === 0) {
      const data = res.data || [];

      if (data.length) {
        if (type === 'refresh') {
          setState({ list: dataSource.cloneWithRows(data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
        }
      } else {
        setState({ list: dataSource.cloneWithRows(data) });
      }
    }
  };

  const onRefresh = e => {
    setState({ page: 1, more: true });
    getList('refresh');
  };

  const toWithdraw = item => {
    //拆分memo地址
    const addrs = item.address.split(':');
    const address = addrs[0];
    const memo = addrs[1];

    dispatch({
      type: 'assets/save',
      payload: {
        withdrawFormValues: {
          ...withdrawFormValues,
          address,
          memo,
          remark: item.remark
        }
      }
    });
    router.push(`/uassets/withdraw?currency=${currency}&chain=${chain}`);
  };

  const extraHandle = markId => {
    active === markId ? setState({ active: '' }) : setState({ active: markId });
  };

  const onDelete = markId => {
    alert('Delete', formatMessage({ id: 'assets.modal.address.del_address_confirm' }), [
      { text: formatMessage({ id: 'common.cancel' }) },
      {
        text: formatMessage({ id: 'common.yes' }),
        onPress: async () => {
          const res = await deleteWithdrawAddress({ markId });

          if (res.code === 0) {
            Toast.success(formatMessage({ id: 'assets.msg.address.del_address_success' }));
            getList('refresh');
          }
        }
      }
    ]);
  };

  const row = item => {
    return (
      <SwipeAction
        autoClose
        right={[
          {
            text: (
              <div className={styles.delete}>
                <i className="iconfont iconic_copy"></i>
              </div>
            ),
            onPress: () => onDelete(item.markId)
          }
        ]}
      >
        <div className={classNames(styles.item)} key={item.markId}>
          <div className={styles.box} onClick={() => toWithdraw(item)}>
            <div className={styles.left}>
              <span className={styles.remark}>{item.remark}</span>
              <p className={styles.address}>{item.address}</p>
            </div>
            <div className={styles.right}>
              <i className="iconfont iconziyuan" onClick={() => extraHandle(item.markId)}></i>
            </div>
          </div>
        </div>
      </SwipeAction>
    );
  };

  return (
    <ListView
      style={{
        height,
        overflow: 'auto'
      }}
      className={styles.listView}
      dataSource={list}
      renderFooter={() => list._dataBlob.s1.length === 0 && <Empty />}
      renderBodyComponent={() => <Body />}
      renderRow={row}
      pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
      onEndReachedThreshold={10}
    />
  );
};

export default List;
