import React, { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import ThemeOnly from '@/components/ThemeOnly';
import cn from 'classnames';
import { getVoteRecordList } from '@/services/api';
import Empty from '@/components/Empty';
import { formatMessage } from 'umi/locale';

import styles from './record.less';

const renderStatus = status => {
  switch (status) {
    case 'ING':
      return formatMessage({ id: 'voting.record.table.status.ing' });
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

function Container() {
  const [recordList, setRecordList] = useState();
  useEffect(() => {
    getVoteRecordList({ voteType: 'KSM_SLOT' }).then(result => {
      // 按期数排序，倒序
      let data = result.data.sort((a, b) => b.phase - a.phase);
      setRecordList(data);
    });
  }, []);

  return (
    <ThemeOnly theme="light">
      <div className={styles.wrapper}>
        <TopBar>{formatMessage({ id: 'voting.index.mine_voting.btn' })}</TopBar>
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{formatMessage({ id: 'voting.index.mine_voting.btn' })}</h3>
          </div>
        </section>
        <section className={styles.content}>
          {recordList &&
            recordList.length > 0 &&
            recordList.map((item, index) => (
              <div className={styles.list} key={index}>
                <div className={styles.listHeader}>
                  <h4 className={styles.listCurrency}>{item.currency}</h4>
                  <span className={styles.listPhase}>{formatMessage({ id: 'mc_slot_assessment_times' }, { time: item.title })}</span>
                </div>

                <div className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemInfoGroup}>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'voting.record.table.number' })}</span>
                        <span className={styles.itemValue}>
                          {item.voteNum} {item.voteCurrency}
                        </span>
                      </div>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'assets.recharge.status' })}</span>
                        <span className={styles.itemValue}>{renderStatus(item.status)}</span>
                      </div>
                    </div>
                    <div className={styles.itemInfoGroup}>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'voting.record.table.return' })}</span>
                        <span className={styles.itemValue}>
                          {item.returnNum} {item.voteCurrency}
                        </span>
                      </div>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'assets.pos.operating' })}</span>
                        <span className={styles.itemValue}>--</span>
                      </div>
                    </div>
                    <div className={styles.itemInfoGroup}>
                      <div className={cn(styles.itemKeyValue, styles.textRight)}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'assets.balances.cash.fee' })}</span>
                        <span className={styles.itemValue}>
                          {item.fee} {item.voteCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {recordList && recordList.length === 0 && <Empty className={styles.empty} initialTheme="light" />}
        </section>
      </div>
    </ThemeOnly>
  );
}

export default Container;
