import styles from './Step.less';

import { formatMessage } from 'umi-plugin-locale';
import moment from 'moment';

const Step = ({ info }) => {
  const stepInfo = {
    HOLD: [
      {
        title: formatMessage({ id: 'assets.pool.modal.start_time' }),
        subtitle: moment().format('YYYY-MM-DD')
      },
      {
        title: formatMessage({ id: 'assets.pool.modal.income_time' }),
        subtitle:
          info &&
          moment()
            .add(info.confirmTime + 1, 'days')
            .format('YYYY-MM-DD')
      },
      {
        title: formatMessage({ id: 'assets.pool.modal.end_time' }),
        subtitle: formatMessage({ id: 'assets.pool.modal.infinite' })
      }
    ],
    LOCK: [
      {
        title: formatMessage({ id: 'pos.title.detail.lock_starttime' }),
        subtitle: moment().format('YYYY-MM-DD')
      },
      {
        title: formatMessage({ id: 'pos.title.detail.lock_unlocktime' }),
        subtitle:
          info &&
          moment()
            .add(info.minLockDays + 1, 'days')
            .format('YYYY-MM-DD')
      },
      {
        title: info && formatMessage({ id: 'pos.title.detail.lock_step3_1' }, { day: info.unlockDays }),
        subtitle: formatMessage({ id: info.grantCycle === 'EVERYDAY' ? 'pos.title.detail.lock_step3_4' : 'pos.title.detail.lock_step3_2' })
      }
    ],
    MARGIN: [
      {
        title: formatMessage({ id: 'pos.title.detail.lock_starttime' }),
        subtitle: moment().format('YYYY-MM-DD')
      },
      {
        title: formatMessage({ id: 'pos.title.detail.lock_unlocktime' }),
        subtitle:
          info &&
          moment()
            .add(info.minLockDays + 1, 'days')
            .format('YYYY-MM-DD')
      },
      {
        title: info && formatMessage({ id: 'pos.title.detail.lock_step3_1' }, { day: info.unlockDays }),
        subtitle: formatMessage({ id: info.grantCycle === 'EVERYDAY' ? 'pos.title.detail.lock_step3_4' : 'pos.title.detail.lock_step3_2' })
      }
    ]
  };
  const type = info && info.type;

  return info.type ? (
    <div className={styles.step}>
      <div className={styles.items}>
        <div>
          <span>{stepInfo[type][0].title}</span>
          <div className={styles.doit}></div>
          <b>{stepInfo[type][0].subtitle}</b>
        </div>
        <div>
          <span>{stepInfo[type][1].title}</span>
          <div className={styles.doit}></div>
          <b>{stepInfo[type][1].subtitle}</b>
        </div>
        <div>
          <span>{stepInfo[type][2].title}</span>
          <div className={styles.doit}></div>
          <b>{stepInfo[type][2].subtitle}</b>
        </div>
      </div>
      <div className={styles.bar}></div>
    </div>
  ) : (
    <></>
  );
};

export default Step;
