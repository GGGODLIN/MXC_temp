import { useState, useEffect } from 'react';
import moment from 'moment';
import { Button, Checkbox, Modal } from 'antd-mobile';
import { formatMessage } from 'umi/locale';

import styles from './RiskModal.less';

const storageKey = 'launchpad.risk.timestamp';

export default function Container() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timestamp = window.localStorage.getItem(storageKey);
    const day = moment(Number(timestamp)).get('date');

    if (!timestamp || day !== moment().get('date')) {
      setVisible(true);
    }
  }, []);

  const changeHandle = e => {
    const checked = e.target.checked;

    if (checked) {
      const timestamp = moment().format('x');

      window.localStorage.setItem(storageKey, timestamp);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  };

  const footer = (
    <div className={styles.footer}>
      <Checkbox onChange={changeHandle}>{formatMessage({ id: 'labs.risk.check_text' })}</Checkbox>
      <Button type="primary" onClick={() => setVisible(false)}>
        {formatMessage({ id: 'layout.top.title.i_know' })}
      </Button>
    </div>
  );

  return (
    <Modal
      title={<div className={styles.title}>{formatMessage({ id: 'ucenter.api.info.reminder' })} </div>}
      visible={visible}
      closable={false}
      transparent
      footer={[]}
      className={styles.riskModal}
    >
      <div style={{ height: 360, overflowY: 'auto', textAlign: 'left' }}>
        <p>{formatMessage({ id: 'labs.risk.tips1' })}</p>
        <p style={{ marginBottom: 0 }}>{formatMessage({ id: 'swap.submitEntrust.riskWarning' })}</p>
        <p>{formatMessage({ id: 'labs.risk.tips3' })}</p>
      </div>
      {footer}
    </Modal>
  );
}
