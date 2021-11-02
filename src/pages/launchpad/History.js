import { formatMessage, getLocale } from 'umi/locale';
import { getSubSite, timeToString } from '@/utils';
import router from 'umi/router';
import Empty from '@/components/Empty';

import styles from './History.less';

const locale = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

export default function Container({ data }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <div>{formatMessage({ id: 'mc_launchpads_history_text' })}</div>
        <a onClick={e => router.push(`/launchpad/record`)}>{formatMessage({ id: 'labs.title.my_record' })}</a>
      </div>
      {data.length > 0 ? (
        data.map(item => (
          <div className={styles.item} key={item.pid} onClick={e => router.push(`/launchpad/detail/${item.pid}`)}>
            <div className={styles.pic}>
              <img src={`${MAIN_SITE_API_PATH}/file/download/${item.projectUrl}`} alt="" />
            </div>
            <div className={styles.title}>
              <h3>{locale === 'zh-CN' ? item.pname : item.pnameEn}</h3>
              <div>
                <span>{formatMessage({ id: 'labs.title.ended' })}</span>
              </div>
            </div>
            <div className={styles.sku}>
              <span>{formatMessage({ id: 'labs.title.issue_num' })}</span>
              <span>
                {item.issueNum ? item.issueNum : '--'} {item.issueCurrency}
              </span>
            </div>
            <div className={styles.sku}>
              <span>{formatMessage({ id: 'fin.common.start_time' })}</span>
              <span>{timeToString(item.startTime)}</span>
            </div>
          </div>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
}
