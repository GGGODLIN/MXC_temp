import styles from './Status.less';
import { formatMessage } from 'umi-plugin-locale';

const Status = ({ info }) => {
  let status;

  if (info) {
    const { startTime, endTime, timeDiff } = info;
    const currentTime = new Date().getTime() + timeDiff;
    // status  0 未开始 1 进行中 2 已结束
    status = currentTime < startTime ? 0 : currentTime < endTime ? 1 : 2;
  }
  let color = 'green',
    text = '';
  switch (status) {
    case 0:
      color = 'red';
      text = (
        <>
          <i className={'iconfont iconic_hot'}></i>
          {formatMessage({ id: 'labs.title.unstart' })}
        </>
      );
      break;
    case 1:
      color = 'green';
      text = formatMessage({ id: 'otc.order.timeout' });
      break;
    case 2:
      color = 'yellow';
      text = formatMessage({ id: 'labs.title.ended' });
      break;
    default:
      break;
  }

  return <div className={`${styles.status} ${styles[color]}`}>{text}</div>;
};

export default Status;
