import React, { useEffect, useState } from 'react';
import StickyBar from '@/components/StickyBar';
import { getVoteRecordList } from '@/services/api';
import { getLocale, formatMessage } from 'umi/locale';
import numberToChinese from '../numberToChinese';
import Empty from '@/components/Empty';
import classNames from 'classnames';

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

  useEffect(() => {
    getVoteRecordList().then(result => {
      // 按期数排序，倒序
      result.data.sort((a, b) => b.phase - a.phase);
      setRecordList(result.data);
    });
  }, []);

  return (
    <div className={classNames(styles.wrapper, { [styles['app']]: isApp })}>
      <StickyBar>{formatMessage({ id: 'voting.index.mine_voting.btn' })}</StickyBar>
      {recordList && recordList.length > 0 && (
        <div className={styles.list}>
          {recordList.map((item, index) => {
            return (
              <div className={styles.item} key={index}>
                <p>
                  <span className={styles.key}>{formatMessage({ id: 'voting.record.table.phase' })}</span>
                  <span>{language === 'zh-CN' ? `第${numberToChinese(item.phase)}期` : `Phase ${item.phase}`}</span>
                  <span className={styles.key}>{formatMessage({ id: 'voting.record.table.number' })}</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatMessage({ id: 'voting.coin_item.number_html' }, { num: item.voteNum })
                    }}
                  />
                </p>
                <p>
                  <span className={styles.key}>{formatMessage({ id: 'voting.record.table.project' })}</span>
                  <span>{item.currency}</span>
                  <span className={styles.key}>{formatMessage({ id: 'voting.record.table.reward' })}</span>
                  <span>
                    {item.reward} {item.currency}
                  </span>
                </p>
                <p>
                  <span className={styles.key}>{formatMessage({ id: 'voting.record.table.return' })}</span>
                  <span>{item.returnNum ? item.returnNum + ' MX' : '--'}</span>
                  <span className={styles.key}>{formatMessage({ id: 'assets.recharge.status' })}</span>
                  <span>{renderStatus(item.status)}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {recordList && recordList.length === 0 && <Empty />}
    </div>
  );
}

export default My;
