import { useEffect, useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';

const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;
const minute = 60 * 1000;
const second = 1000;

const digit = currentDigit => {
  return Math.abs(currentDigit) < 10 ? `0${Math.abs(currentDigit)}` : Math.abs(currentDigit);
};
const CountDown = ({ endTime, timeDiff, stateText, callBack }) => {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime() + timeDiff;
      let _diff = endTime - now;
      if (_diff >= 0) {
        clearInterval(timer);
        _diff = _diff++;
        if (callBack && typeof callBack === 'function') {
          callBack();
        }
      }

      setDiff(_diff);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [endTime, timeDiff]);

  return (
    <div className={styles.countdown}>
      {stateText && <b>{stateText}</b>}
      <span className={styles.minutesContent}>{digit(parseInt((diff % hour) / minute))}</span>
      <span className={styles.segmentation}>:</span>
      <span className={styles.minutesContent}>{digit(Math.floor((diff % minute) / second))}</span>
    </div>
  );
};

export default connect(({ global }) => ({
  // timeDiff: global.serverClientTimeDiff
}))(CountDown);
