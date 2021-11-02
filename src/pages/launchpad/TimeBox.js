import CountDown from './CountDown/index';
import { formatMessage } from 'umi/locale';
import styles from './TimeBox.less';

const TimeBox = ({ info, status, size, serverClientTimeDiff, timeoutCallback, type }) => {
  let text = '',
    time = '';
  switch (status) {
    case 0:
      text = formatMessage({ id: 'mc_launchpads_start_time' });
      time = info.startTime;
      break;
    case 1:
      text = formatMessage({ id: 'mc_launchpads_start_time_end' });
      time = info.endTime;
      break;
    case 2:
      text = formatMessage({ id: 'labs.title.ended' });
      time = info.endTime;
      break;
    default:
      text = formatMessage({ id: 'labs.title.ended' });
      time = info.endTime;
      break;
  }

  return (
    <div className={styles[type]}>
      <small>{text}</small>
      <div>
        <CountDown
          timeStamp={time}
          size={size}
          serverClientTimeDiff={serverClientTimeDiff}
          timeoutCallback={status !== 2 ? timeoutCallback : null}
        />
      </div>
    </div>
  );
};

export default TimeBox;
