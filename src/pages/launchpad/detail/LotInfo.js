import { useState } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Modal } from 'antd-mobile';
import { getLabsLotNumber } from '@/services/api';
import styles from './LotInfo.less';
import Hold from './Hold';
import TimeBox from '../TimeBox';
import { gotoLogin } from '@/utils';

const DrawBtn = (info, state, switchVisible) => {
  const btnInfo = [
    { text: 'labs.title.unstart', disabled: true },
    { text: 'mc_launchpads_detail_join', disabled: false },
    { text: 'labs.title.ended', disabled: true }
  ];

  let text = btnInfo[state].text;
  let disable = btnInfo[state].disabled;

  if (info.hasApply && state === 1) {
    text = 'labs.title.draws_state_2';
    disable = true;
  }

  return (
    <Button type="primary" disabled={disable} onClick={switchVisible}>
      {formatMessage({ id: text })}
    </Button>
  );
};

export default function Container({ info, timeDiff, getDetail, user, status }) {
  const [visible, setVisible] = useState(false);

  const getLot = async () => {
    const res = await getLabsLotNumber(info.pid);

    if (res.code === 0) {
      getDetail();
      switchVisible();
    }
  };

  const switchVisible = e => {
    setVisible(!visible);
  };

  return (
    <>
      {status === 0 ? (
        <TimeBox info={info} status={status} serverClientTimeDiff={timeDiff} timeoutCallback={getDetail} size="small" type="detail" />
      ) : (
        <>
          {user.id ? (
            <>
              <Hold info={info} />
              <div className={styles.btn}>{DrawBtn(info, status, switchVisible)}</div>
            </>
          ) : (
            <div className={styles.login} onClick={() => gotoLogin()}>
              <div>{formatMessage({ id: 'mc_launchpads_detail_login' })}</div>
              <div className={styles.wrap}>
                <Button type="primary">{formatMessage({ id: 'auth.signIn' })}</Button>
              </div>
            </div>
          )}
        </>
      )}
      <Modal
        visible={visible}
        transparent
        maskClosable={false}
        onClose={() => {}}
        footer={[
          { text: formatMessage({ id: 'common.cancel' }), onPress: () => switchVisible() },
          { text: formatMessage({ id: 'mday.submit.tips.confirm' }), onPress: () => getLot() }
        ]}
      >
        <div>
          <p>{formatMessage({ id: 'mc_launchpads_modal_confirm' })}</p>
        </div>
      </Modal>
    </>
  );
}
