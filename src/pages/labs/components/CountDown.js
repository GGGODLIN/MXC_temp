import { useEffect, useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import styles from './CountDown.less';

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
  }, [endTime]);

  return (
    <div className={styles.countdown}>
      {stateText && <b>{stateText}</b>}
      <div>
        <span>{digit(Math.floor(diff / day))}</span>
        <i></i>
        <span>{digit(Math.floor((diff % day) / hour))}</span>
        <i></i>
        <span>{digit(Math.floor((diff % hour) / minute))}</span>
        <i></i>
        <span>{digit(Math.floor((diff % minute) / second))}</span>
      </div>
      <p>
        <span>{formatMessage({ id: 'common.day' })}</span>
        <span>{formatMessage({ id: 'common.hour' })}</span>
        <span>{formatMessage({ id: 'common.min' })}</span>
        <span>{formatMessage({ id: 'common.sen' })}</span>
      </p>
    </div>
  );
};

export default connect(({ global }) => ({
  timeDiff: global.serverClientTimeDiff
}))(CountDown);
