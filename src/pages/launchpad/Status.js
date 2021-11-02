import { formatMessage } from 'umi/locale';
import styles from './Status.less';

export default function Container({ status }) {
  let text = '';

  switch (status) {
    case 0:
      text = formatMessage({ id: 'labs.title.unstart' });
      break;
    case 1:
      text = formatMessage({ id: 'otc.order.timeout' });
      break;
    case 2:
      text = formatMessage({ id: 'labs.title.ended' });
      break;
    default:
      break;
  }

  return status === 2 ? (
    <span className={styles.ended}>{text}</span>
  ) : (
    <div className={styles.tag}>
      <i></i>
      <span>{text}</span>
    </div>
  );
}
