import { useCountDown } from './count-down';
import cn from 'classnames';
import styles from './index.less';

export default function Countdown({ timeStamp, size, timeoutCallback, serverClientTimeDiff }) {
  const time = useCountDown(timeStamp - serverClientTimeDiff, timeoutCallback);

  return (
    <div className={cn(styles.wrap, styles[size])}>
      <div className={styles.box}>
        <div className={styles.num}>{time.allHours}</div>
        <label>HOURS</label>
      </div>
      <div className={styles.colon}>:</div>
      <div className={styles.box}>
        <div className={styles.num}>{time.m}</div>
        <label>MINS</label>
      </div>
      <div className={styles.colon}>:</div>
      <div className={styles.box}>
        <div className={styles.num}>{time.s}</div>
        <label>SECS</label>
      </div>
    </div>
  );
}
