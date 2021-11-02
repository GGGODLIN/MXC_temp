import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import coming from '@/assets/img/mxDefi/coming.png';

const ComingSoon = () => {
  return (
    <div className={styles.coming}>
      <img src={coming} alt="MEXC交易所" />
      <p>{formatMessage({ id: 'home.title.swap_tip' })}</p>
    </div>
  );
};

export default ComingSoon;
