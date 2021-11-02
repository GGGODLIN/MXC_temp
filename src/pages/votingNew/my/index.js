import React, { useCallback, useEffect, useState } from 'react';
import StickyBar from '@/components/StickyBar';
import { getVoteRecordList, unlockVote } from '@/services/api';
import { getLocale, formatMessage } from 'umi/locale';
import numberToChinese from '../numberToChinese';
import Empty from '@/components/Empty';
import { cutFloatDecimal } from '@/utils';
import classNames from 'classnames';
import { Button, Modal, Checkbox, InputItem, Toast } from 'antd-mobile';

import styles from './index.less';
const language = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

const renderStatus = status => {
  switch (status) {
    case 'ING':
      return formatMessage({ id: 'otc.order.timeout' });
    case 'RETURNED':
      return formatMessage({ id: 'voting.record.table.status.returned' });
    case 'RETURNED_FAIL':
      return formatMessage({ id: 'voting.record.table.status.returned_fail' });
    case 'SETTLED':
      return formatMessage({ id: 'voting.record.table.status.settled' });
    case 'SETTLED_ERROR':
      return formatMessage({ id: 'voting.record.table.status.settled_error' });
    default:
      return '';
  }
};

function My() {
  const [recordList, setRecordList] = useState(null);
  const [refreshMark, setRefreshMark] = useState(0);
  useEffect(() => {
    getVoteRecordList({ voteType: 'ASSESS' }).then(result => {
      // 按期数排序，倒序
      let data = result.data.sort((a, b) => b.phase - a.phase);
      // 排除掉前十期项目
      data = data.filter(item => item.phase > 10);
      setRecordList(data);
    });
  }, [refreshMark]);

  const [currentData, setCurrentData] = useState(null);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [inputNum, setInputNum] = useState(undefined);
  // 手动输入
  const numInputChange = useCallback(
    value => {
      if (value) {
        setInputNum(Math.min(value, currentData.voteNum - currentData.returnNum));
      } else {
        setInputNum('');
      }
    },
    [currentData]
  );

  const handleVoteSelectAll = useCallback(() => {
    setInputNum(currentData.voteNum - currentData.returnNum);
  }, [currentData]);

  const [unlockConfirm, setUnlockConfirm] = useState(false);

  const showUnlockModal = useCallback(currentData => {
    setCurrentData(currentData);
    setUnlockModalVisible(true);
  }, []);

  const hideUnlockModal = useCallback(() => {
    setUnlockModalVisible(false);
  }, []);

  const unlockHandle = useCallback(() => {
    if (!unlockConfirm) {
      Toast.info(formatMessage({ id: 'votingNew.record.unlock.confirm.tip' }), 1.5);
      return;
    }

    if (!inputNum) {
      Toast.info(formatMessage({ id: 'votingNew.record.unlock.num.please' }), 1.5);
      return;
    }

    const loading = Toast.loading('', 0);

    unlockVote({
      logId: currentData.logId,
      returnVoteNum: inputNum
    }).then(result => {
      if (result && result.code === 0) {
        Toast.info(formatMessage({ id: 'votingNew.record.unlock.success' }), 1.5);
        setUnlockModalVisible(false);
        setRefreshMark(refreshMark + 1);
      } else {
        loading.hide();
      }
    });
  }, [currentData, unlockConfirm, refreshMark, inputNum]);

  return (
    <div className={classNames(styles.wrapper, { [styles['app']]: isApp })}>
      <StickyBar>{formatMessage({ id: 'voting.index.mine_voting.btn' })}</StickyBar>
      {recordList && recordList.length > 0 && (
        <div className={styles.list}>
          {recordList.map((item, index) => {
            return (
              <div className={styles.item} key={index}>
                <div className={styles.top}>
                  <div className={styles.left}>
                    <span className={styles.coin}>{item.currency}</span>
                    <span className={styles.phase}>
                      {language === 'zh-CN' ? `第${numberToChinese(item.title - 10)}期` : `Phase ${item.title - 10}`}
                    </span>
                  </div>

                  <div className={classNames(styles.right, { [styles.active]: item.status === 'ING' })}>
                    <span>{renderStatus(item.status)}</span>
                  </div>
                </div>

                <div className={styles.bottom}>
                  <p>
                    <span className={styles.key}>{formatMessage({ id: 'voting.record.table.number' })}</span>
                    <span className={styles.value}>{item.voteNum}MX</span>
                  </p>
                  <p>
                    <span className={styles.key}>{formatMessage({ id: 'voting.record.table.return' })}</span>
                    <span className={styles.value}>{`${Number(cutFloatDecimal(item.returnNum - item.fee, 2))} MX`}</span>
                  </p>
                  <p>
                    <span className={styles.key}>{formatMessage({ id: 'assets.balances.cash.fee' })}</span>
                    <span className={styles.value}>{`${item.fee} MX`}</span>
                  </p>
                </div>

                <div className={styles.handle}>
                  <Button
                    disabled={item.status !== 'ING' || item.returnNum >= item.voteNum}
                    className={styles.unlock}
                    type="primary"
                    size="small"
                    onClick={() => showUnlockModal(item)}
                  >
                    {formatMessage({ id: 'votingNew.record.unlock' })}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recordList && recordList.length === 0 && <Empty />}

      <Modal
        title={formatMessage({ id: 'votingNew.record.unlock' })}
        visible={unlockModalVisible}
        transparent
        className={styles.modal}
        afterClose={() => {
          setCurrentData(null);
          setUnlockConfirm(false);
          setInputNum(undefined);
        }}
        footer={[
          { text: formatMessage({ id: 'common.cancel' }), onPress: hideUnlockModal },
          { text: formatMessage({ id: 'common.sure' }), onPress: unlockHandle }
        ]}
      >
        <p className={styles.label}>
          {formatMessage({ id: 'votingNew.record.unlock.num' }, { num: currentData ? currentData.voteNum - currentData.returnNum : 0 })}
        </p>
        <InputItem
          type="number"
          value={inputNum}
          placeholder={formatMessage({ id: 'votingNew.record.unlock.num.please' })}
          onChange={numInputChange}
          extra={
            <span className={styles.all} onClick={handleVoteSelectAll}>
              {formatMessage({ id: 'fin.common.all' })}
            </span>
          }
        />

        <p className={styles.tip}>{formatMessage({ id: 'votingNew.record.unlock.tip' })}</p>

        <div className={styles.checkbox}>
          <Checkbox onChange={e => setUnlockConfirm(e.target.checked)}>{formatMessage({ id: 'votingNew.record.unlock.confirm' })}</Checkbox>
        </div>
      </Modal>
    </div>
  );
}

export default My;
