import { getLocale, formatMessage } from 'umi-plugin-locale';
import { timeToString, numberFormat, getSubSite } from '@/utils';

import styles from './TopInfo.less';
import Status from '../components/Status';

const locale = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const amountText = {
  DRAW: 'labs.title.current_drawNum',
  NOW_DRAW: 'labs.title.current_drawNum',
  GRAB: 'labs.title.current_purchaseNum',
  BIDDING: 'labs.title.current_BiddingNum',
  APPLY: 'labs.title.current_BiddingNum',
  APPLY_SNAP: 'labs.title.current_BiddingNum'
};

const priceText = {
  DRAW: 'labs.title.exchange_price',
  NOW_DRAW: 'labs.title.exchange_price',
  GRAB: 'labs.title.bought_price',
  BIDDING: 'labs.title.subscription_price',
  APPLY: 'labs.title.subscription_price',
  APPLY_SNAP: 'labs.title.subscription_price'
};

const TopInfo = ({ info }) => {
  const time =
    info.type === 'GRAB' || info.type === 'BIDDING' ? (
      <>
        <div className={styles.timeItem}>
          <span>{formatMessage({ id: 'fin.common.start_time' })}</span>
          <b>{timeToString(info.startTime)}</b>
        </div>
        <div className={styles.timeItem}>
          <span>{formatMessage({ id: 'fin.common.end_time' })}</span>
          <b>{timeToString(info.endTime)}</b>
        </div>
      </>
    ) : (
      <div className={styles.timeItem}>
        <span>{formatMessage({ id: 'labs.title.regist_time' })}</span>
        <b>
          {timeToString(info.startTime)} - {timeToString(info.endTime)}
        </b>
      </div>
    );
  const lottoTime =
    info.type === 'DRAW' || info.type === 'NOW_DRAW' ? (
      <>
        <div className={styles.timeItem}>
          <span>{formatMessage({ id: 'labs.title.draws_time' })}</span>
          <b>{info.expandInfo && timeToString(info.expandInfo.drawTime)}</b>
        </div>
        <div className={styles.timeItem}>
          <span>{formatMessage({ id: 'labs.title.settle_time' })}</span>
          <b>{info.expandInfo && timeToString(info.expandInfo.settleTime)}</b>
        </div>
        {info.zone !== 'MDAY' && (
          <div className={styles.timeItem}>
            <span>{formatMessage({ id: 'labs.title.forzen_time' })}</span>
            <b>{info.expandInfo && timeToString(info.expandInfo.unfrozenTime)}</b>
          </div>
        )}
      </>
    ) : (
      <></>
    );
  const BiddingInfo =
    info.type === 'BIDDING' ? (
      <>
        <div className={styles.timeItem}>
          <span>{formatMessage({ id: 'labs.title.round_will_amount' })}</span>
          <b>
            {numberFormat(info.purchaseNum)} {formatMessage({ id: 'labs.title.share' })}
          </b>
        </div>
      </>
    ) : (
      <></>
    );
  return (
    <div className={styles.listItem}>
      <div className={styles.listImg} style={{ backgroundImage: `url(${MAIN_SITE_API_PATH}/file/download/${info.projectUrl})` }}></div>
      <div className={styles.bottom}>
        <div className={styles.bottomText}>
          <h4>{locale === 'zh-CN' ? info.pname : info.pnameEn}</h4>
        </div>
        <div>
          {info.zone !== 'MDAY' && (
            <div className={styles.timeItem}>
              <span>{info.type && formatMessage({ id: priceText[info.type] })}</span>
              <b>{info.price ? `${info.price} ${info.settleCurrency}` : formatMessage({ id: 'labs.title.to_wait' })}</b>
            </div>
          )}
          <div className={styles.timeItem}>
            <span>{formatMessage({ id: 'labs.title.issue_num' })}</span>
            <b>
              {info.issueNum ? numberFormat(info.issueNum) : '--'} {info.issueCurrency}
            </b>
          </div>
          {time}
          {lottoTime}
          {BiddingInfo}
        </div>
      </div>
      <div className={styles.itemStatus}>
        <Status info={info}></Status>
      </div>
    </div>
  );
};

export default TopInfo;
