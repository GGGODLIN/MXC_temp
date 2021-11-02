import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { WingBlank, ListView, PullToRefresh, Flex, Toast } from 'antd-mobile';
import { timeToString, add } from '@/utils';
import { getInviteRebateMembers } from '@/services/api';

import styles from './index.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function CustomBody(props) {
  return <section className={styles['custom-body']}>{props.children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

function reducer(state, action) {
  return {
    ...state,
    ...action.payload
  };
}

function Invite({ filterParams }) {
  const [currentParams, dispatchCurrentParams] = useReducer(reducer, { page: 1, pageSize: 10 });

  useEffect(() => {
    getInviteRebateList({ ...currentParams });
  }, []);

  const [inviteRebateList, setInviteRebateList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const getInviteRebateList = useCallback(
    (params = currentParams, type) => {
      getInviteRebateMembers(params).then(result => {
        if (result && result.code === 0) {
          if (type === 'refresh') {
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
            setInviteRebateList([...result.invites]);
            // setInviteRebateList([{memberId: '2abbb58584ec4bb3acb4b03384b3518f',
            //   account:'zen***@gmail.com',
            //   regTime:1566800551000,
            //   totalCommission:9.95}]);
          } else {
            setInviteRebateList([...inviteRebateList, ...result.invites]);
            // setInviteRebateList([{memberId: '2abbb58584ec4bb3acb4b03384b3518f',
            //   account:'zen***@gmail.com',
            //   regTime:1566800551000,
            //   totalCommission:9.95}]);
          }

          if (result.invites.length === currentParams.pageSize) {
            dispatchCurrentParams({ payload: { page: params.page + 1 } });
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }
      });
    },
    [currentParams]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchCurrentParams({ payload: { page: 1 } });
    getInviteRebateList({ ...currentParams, page: 1 }, 'refresh');
  }, [currentParams]);

  const onEndReached = useCallback(() => {
    if (loaded) {
      return;
    }

    getInviteRebateList();
  }, [loaded, currentParams]);

  const renderRow = item => {
    return (
      <section className={styles['table-item']}>
        <Flex align="center" justify="between" className={styles.tableHeader}>
          <span className={styles.tableHeaderValue}>
            {formatMessage({ id: 'mc_invite_table_invitee_time' })}
            &nbsp;
            {timeToString(item.regTime, 'YYYY-MM-DD HH:mm')}
          </span>
          <div>
            <span className={styles.tableHeaderLabel}>{formatMessage({ id: 'mc_invite_table_rebate_unit' })}</span>
            &nbsp;
            <span className={styles.tableHeaderValue}>USDT</span>
          </div>
        </Flex>
        <Flex align="center" justify="between">
          <div>
            <span className={styles.tableItemLabel}>{formatMessage({ id: 'act.invited_munber' })}</span>
            <div className={styles.tableItemValue}>{item.account}</div>
            <span className={styles.tableItemLabel}>{formatMessage({ id: 'invite.title.spot' })}</span>
            <div className={styles.tableItemValue}>{item.exchange}</div>
          </div>
          <div>
            <span className={styles.tableItemLabel}>
              {formatMessage({ id: 'mc_invite_table_invitee_uid' })}
              <CopyToClipboard text={item.uid} onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 2)}>
                <i className="iconfont iconcopy" />
              </CopyToClipboard>
            </span>
            <div className={styles.tableItemValue}>{item.uid}</div>
            <span className={styles.tableItemLabel}>{formatMessage({ id: 'invite.title.futures' })}</span>
            <div className={styles.tableItemValue}>{item.contract}</div>
          </div>
          <div className={styles.textRight}>
            <span className={styles.tableItemLabel}>{formatMessage({ id: 'act.cumulative_rebate' })}</span>
            <div className={styles.tableItemValue}>{add(add(item.exchange, item.margin), item.contract)}</div>
            <span className={styles.tableItemLabel}>{formatMessage({ id: 'invite.title.margin' })}</span>
            <div className={styles.tableItemValue}>{item.margin}</div>
          </div>
        </Flex>
      </section>
    );
  };

  return (
    <>
      <ListView
        className={styles.content}
        dataSource={dataSource.cloneWithRows(inviteRebateList)}
        renderFooter={() => (
          <div className={styles.loading}>
            {!loaded ? formatMessage({ id: 'invite.posters.loading' }) : formatMessage({ id: 'invite.posters.endloading' })}
          </div>
        )}
        renderBodyComponent={() => <CustomBody />}
        renderRow={renderRow}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
        scrollRenderAheadDistance={500}
        pageSize={5}
        pullToRefresh={<PullToRefresh refreshing={refreshing} onRefresh={onRefresh} />}
        // useBodyScroll={true}
      />
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(withRouter(Invite));
