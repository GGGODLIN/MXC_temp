import { useState } from 'react';
import CountDown from '../components/CountDown';
import { connect } from 'dva';
import { Button, WhiteSpace, Modal } from 'antd-mobile';
import { gotoLogin } from '@/utils';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-locale';
import { getLabsLotNumber, getMdayLotNumber } from '@/services/api';
import styles from './DrawInfo.less';

import Ticket from './Ticket';

const CountDownText = [
  formatMessage({ id: 'labs.title.start_of_countdown' }),
  formatMessage({ id: 'labs.title.end_of_countdown' }),
  formatMessage({ id: 'labs.title.ended' })
];

const DrawBtn = (info, state, switchVisible) => {
  const btnInfo = [
    { text: 'labs.title.unstart', disabled: true },
    { text: 'labs.title.regist_now', disabled: false },
    { text: 'labs.title.ended', disabled: true }
  ];

  let text = btnInfo[state].text;
  let disable = btnInfo[state].disabled;

  if (info.draws && info.draws.length >= 1 && state === 1) {
    text = 'labs.title.draws_state_2';
    disable = true;
  }
  /**
    if (state === 1 && info.type !== 'NOW_DRAW' && info.limitMax <= 0 && !info.hasApply) {
      disable = true;
      text = 'labs.title.lottery_qualification';
    }
*/
  if (state === 1 && !!info.expandTradeVO && !info.draws) {
    disable = false;
    text = 'labs.title.regist_now';
  }
  return (
    <Button type="primary" disabled={disable} onClick={switchVisible}>
      {formatMessage({ id: text })}
    </Button>
  );
};

const DrawInfo = ({ info, state, user, getDetail }) => {
  const [visible, setVisible] = useState(false);
  const time = state === 0 ? info.startTime : info.endTime;

  const getLot = () => {
    if (info.type === 'NOW_DRAW') {
      getMdayLotNumber(info.pid).then(res => {
        if (res.code === 0) {
          getDetail();
          switchVisible();
        }
      });
    } else {
      getLabsLotNumber(info.pid).then(res => {
        if (res.code === 0) {
          getDetail();
          switchVisible();
        }
      });
    }
  };

  const switchVisible = e => {
    setVisible(!visible);
  };

  return (
    <div>
      <CountDown endTime={time} stateText={CountDownText[state]} callBack={getDetail}></CountDown>
      {info.draws && info.draws.length > 0 && (
        <>
          <div className={styles.drawItem}>
            <span>{formatMessage({ id: 'labs.title.has_tickets' })}</span>
            <b className={styles.allTic}>
              <i className="iconfont iconic_tickets"></i> {info.draws.length} tickets
            </b>
          </div>
          <div className={styles.drawItem}>
            <span>{formatMessage({ id: 'labs.title.shoot_tickets' })}</span>
            <b className={styles.wonTic}>
              <i className="iconfont iconic_win"></i> {info.draws.filter(l => l.won === 1).length} tickets
            </b>
          </div>
          <div className={styles.tickets}>
            {info.draws.map(item => (
              <Ticket key={item.drawNum} item={item}></Ticket>
            ))}
            {info.draws.length % 3 === 2 && <div className={styles.emptyTic}> </div>}
          </div>
        </>
      )}

      {!user.id && (
        <Button type="primary" onClick={() => gotoLogin()}>
          {formatMessage({ id: 'auth.to.signIn' })}
        </Button>
      )}
      {user.id && DrawBtn(info, state, switchVisible)}

      <WhiteSpace />
      <p className={styles.link}>
        {user.id && (
          <Link to={`/halving/record?zone=${info.zone}`}>
            <i className={'iconfont iconjilu'}></i> {formatMessage({ id: 'labs.title.my_record' })}
          </Link>
        )}
      </p>
      <Modal
        visible={visible}
        transparent
        maskClosable={false}
        onClose={() => {}}
        footer={[
          { text: formatMessage({ id: 'mday.submit.tips.cancel' }), onPress: () => switchVisible() },
          { text: formatMessage({ id: 'mday.submit.tips.confirm' }), onPress: () => getLot() }
        ]}
      >
        <div>
          <p>{formatMessage({ id: 'mday.submit.tips.text' })}</p>
        </div>
      </Modal>
    </div>
  );
};

export default connect(({ auth, global }) => ({
  user: auth.user
}))(DrawInfo);
