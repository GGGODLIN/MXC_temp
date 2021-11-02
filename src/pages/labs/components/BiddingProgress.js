import styles from './BiddingProgress.less';
import { numberFormat } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';

import Progress from './Progress';
import CountDown from './CountDown';

const CountDownText = [
  formatMessage({ id: 'labs.title.start_of_countdown' }),
  formatMessage({ id: 'labs.title.end_of_countdown' }),
  formatMessage({ id: 'labs.title.ended' })
];

const BiddingProgress = ({ info, state, getDetail }) => {
  const time = state === 0 ? info.startTime : info.endTime;
  return (
    <>
      <CountDown endTime={time} stateText={CountDownText[state]} callBack={getDetail}></CountDown>
      <div className={styles.binddingItem}>
        <p>
          <span>{formatMessage({ id: 'Theproject.schedule' })}</span>
          <span>
            {' '}
            {formatMessage({ id: 'labs.title.round_true_amount' })} ：{numberFormat(info.boughtQuantities)}{' '}
            {formatMessage({ id: 'labs.title.share' })}
          </span>
        </p>
        <Progress rate={(info.boughtQuantities / info.purchaseNum) * 100}></Progress>
      </div>
    </>
  );
};

export default BiddingProgress;
