import { useState } from 'react';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-locale';
import { setPoolIn, setPoolOut } from '@/services/api';
import { cutFloatDecimal } from '@/utils';
import { Checkbox, Button, Toast, Modal } from 'antd-mobile';

import RateChart from './RateChart';

const alert = Modal.alert;
const AgreeItem = Checkbox.AgreeItem;

const HoldInfo = ({ info, styles, theme }) => {
  const [buyComfirm, setBuyComfirm] = useState(false);
  const [hasPool, setHasPool] = useState(info.hasPool);
  const req = !hasPool ? setPoolIn : setPoolOut;
  const oktext = !hasPool ? formatMessage({ id: 'pos.title.detail.lock_btn' }) : formatMessage({ id: 'assets.pool.title.pos_out' });
  const okProps = !hasPool ? 'primary' : 'warning';
  const handelOk = async () => {
    const res = await req({ poolId: info.id });
    if (res.code === 0) {
      setHasPool(!hasPool);
      if (!hasPool) {
        Toast.success(formatMessage({ id: 'pos.title.record.lock_status_WAIT_GRANT' }), 1.5, () => {
          router.push('/pos/list');
        });
      }
    }
  };
  return (
    <>
      <RateChart theme={theme} info={info}></RateChart>
      <div className={styles.optBox}>
        <div className={styles.button}>
          {!hasPool ? (
            <>
              <AgreeItem data-seed="logId" checked={buyComfirm} onChange={() => setBuyComfirm(!buyComfirm)}>
                {formatMessage({ id: 'labs.title.bought_ask' })}{' '}
                <Link className={styles.link} to={'/info/risk'}>{`<<${formatMessage({ id: 'info.title.risk.title' })}>>`}</Link>
              </AgreeItem>

              <Button type={okProps} disabled={!buyComfirm} onClick={() => handelOk()}>
                {oktext}
              </Button>
            </>
          ) : (
            <Button
              type={okProps}
              onClick={() =>
                alert(formatMessage({ id: 'pos.title.list.toQuit' }), '', [
                  { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                  {
                    text: formatMessage({ id: 'assets.pool.title.pos_out' }),
                    onPress: () => handelOk()
                  }
                ])
              }
            >
              {oktext}
            </Button>
          )}
        </div>
        <div className={styles.rules}>
          <p style={{ color: 'var(--down-color)' }}>{formatMessage({ id: 'pos.title.detail.lock_rule' })}</p>
          <p>
            (1){' '}
            {formatMessage(
              { id: 'assets.pool.modal.rule_1' },
              {
                start: info.limitMin || 0,
                currency: info.currency,
                profitRate: (info.profitRate * 100).toFixed(2)
              }
            )}
          </p>
          <p>(2) {formatMessage({ id: 'assets.pool.modal.rule_2' })}</p>
          <p>(3) {formatMessage({ id: 'assets.pool.modal.rule_3' }, { dalyTime: info.confirmTime })}</p>
          <p>(4) {formatMessage({ id: 'assets.pool.modal.rule_4' })}</p>
          <p>(5) {formatMessage({ id: 'assets.pool.modal.rule_5' })}</p>
          <p>(6) {formatMessage({ id: 'assets.pool.modal.rule_6' })}</p>
        </div>
      </div>
    </>
  );
};

export default HoldInfo;
