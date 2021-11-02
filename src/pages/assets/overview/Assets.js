import { Button } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';

import styles from './Assets.less';

const Assets = ({ label, balance, assess, eyes, type }) => {
  const toTransfer = e => {
    router.push(`/uassets/transfer?type=${type}`);
  };

  return (
    <div className={styles.assets}>
      <div className={styles.exhibit}>
        <div>
          <p>{label}</p>
          <label>{eyes ? balance : '*****'}</label>
          <p>≈ {eyes ? assess : '*****'}</p>
        </div>
        <Button type="ghost" size="small" className={'am-button-circle'} onClick={toTransfer}>
          {formatMessage({ id: 'assets.transfer' })}
        </Button>
      </div>
    </div>
  );
};

export default Assets;
