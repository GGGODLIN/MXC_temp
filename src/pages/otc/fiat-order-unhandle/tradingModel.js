import React, { useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import styles from './trading.less';
import { Button, Modal, Checkbox } from 'antd-mobile';
const CheckboxItem = Checkbox.CheckboxItem;
function TradingModel(props) {
  const [selected, setSelected] = useState(true);
  const onChange = v => {
    setSelected(v.target.checked);
  };
  return (
    <div>
      <Modal popup animationType="slide-up" visible={props.tradingShowtwo}>
        <div className={styles.trading}>
          <div className={styles.title}>{formatMessage({ id: 'otcfiat.Trading.remind' })}</div>
          <div className={styles.tradingLIst}>
            <p>{formatMessage({ id: 'otcfiat.remind.one' })}；</p>
            <p>{formatMessage({ id: 'otcfiat.remind.two' })}；</p>
            <p>{formatMessage({ id: 'otcfiat.remind.three' })}</p>
            <p>{formatMessage({ id: 'otcfiat.remind.three' })}</p>
            <p>{formatMessage({ id: 'otcfiat.remind.five' })}</p>
          </div>
          <div className={styles.btnModelShow}>
            <CheckboxItem key="1" data-seed="logId" defaultChecked multipleLine onChange={v => onChange(v)}>
              {formatMessage({ id: 'otcfiat.remind.rules' })}
            </CheckboxItem>
            <Button
              type="primary"
              disabled={!selected}
              className={styles.btnok}
              inline
              size="small"
              onClick={() => props.settradingShowtwo(false)}
            >
              OK
            </Button>
          </div>
          <div></div>
        </div>
      </Modal>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(TradingModel);
