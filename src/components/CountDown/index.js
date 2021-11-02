import { useEffect, useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import classNames from 'classnames';
const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;
const minute = 60 * 1000;
const second = 1000;

const digit = currentDigit => {
  return currentDigit < 10 ? `0${currentDigit}` : currentDigit;
};

const CountDown = ({ endTime, timeDiff, stateText, callBack }) => {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime() + timeDiff;
      let _diff = endTime - now;
      if (_diff <= 0) {
        clearInterval(timer);
        _diff = 0;
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
    <div className={classNames(styles.countdown, 'countdownAppeal')}>
      {stateText && <b>{stateText}</b>}

      <span className={styles.minutesContent}>{digit(Math.floor((diff % hour) / minute))}</span>
      {/* <span>{formatMessage({ id: 'common.min' })}</span> */}
      <span className={styles.segmentation}>:</span>
      <span className={styles.minutesContent}>{digit(Math.floor((diff % minute) / second))}</span>
      {/* <span>{digit(Math.floor((diff % minute) / second))}</span> */}
      {/* <span>{formatMessage({ id: 'common.sen' })}</span> */}
    </div>
  );
};

export default connect(({ global }) => ({
  // timeDiff: global.serverClientTimeDiff
}))(CountDown);
