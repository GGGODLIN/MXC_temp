import { useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { WhiteSpace, InputItem, Checkbox, Button, Toast } from 'antd-mobile';
import { getLabsDetail, bindingLabs } from '@/services/api';
import { geetestCaptcha, registerGeetestScenario } from '@/utils/captcha';

import TopBar from '@/components/TopBar';
import styles from './index.less';
import BiddingProgress from '../components/BiddingProgress';
const AgreeItem = Checkbox.AgreeItem;

const Action = ({ match, user, timeDiff }) => {
  const [info, setInfo] = useState({});
  const [status, setStatus] = useState(0);
  const [buynumber, setBuynumber] = useState(0);
  const [buyComfirm, setBuyComfirm] = useState(false);

  const pid = match.params.id;
  const getDetail = () => {
    getLabsDetail(pid).then(res => {
      if (res && res.code === 0) {
        const { startTime, endTime, type } = res.data;

        const currentTime = new Date().getTime() + timeDiff;
        // status  0 未开始 1 进行中 2 已结束 3 已达成（已登记）
        let status = currentTime < startTime ? 0 : currentTime < endTime ? 1 : 2;

        setInfo({ ...res.data, timeDiff });
        setStatus(status);
      }
    });
  };

  const bugHandel = () => {
    geetestCaptcha('LABS', async data => {
      const res = await bindingLabs({
        pid: info.pid,
        amount: buynumber,
        ...data
      });
      if (res.code === 0) {
        Toast.success(formatMessage({ id: 'trade.entrust.place_success' }), 1.5, () => router.push(`/halving/detail/${pid}/index`));
      }
      getDetail();
    });
  };

  const putAll = () => {
    const balanceLimit = info.limitMax - info.applyQuantity > 0 ? info.limitMax - info.applyQuantity : 0;
    const ALL = Math.min(info.limitMax, balanceLimit);
    setBuynumber(ALL);
  };

  useEffect(() => {
    registerGeetestScenario(['LABS']);
    getDetail();
  }, []);

  const ProgressProps = {
    info,
    state: status,
    getDetail
  };
  return (
    <div className={styles.detail}>
      <TopBar>{formatMessage({ id: 'home.title.halve' })}</TopBar>
      <div className={styles.boxWrap}>
        <BiddingProgress {...ProgressProps}></BiddingProgress>
      </div>
      <div className={`${styles.boxWrap} ${styles.optionBox}`}>
        <div className={styles.available}>
          <b> {formatMessage({ id: 'labs.title.account_available' })}</b>
          <p>
            {info.limitMax - info.applyQuantity} {formatMessage({ id: 'labs.title.share' })}
          </p>
        </div>
        <WhiteSpace />
        <InputItem
          className="am-search-input"
          extra={
            <a className={styles.all} onClick={() => putAll()}>
              {formatMessage({ id: 'fin.common.all' })}
            </a>
          }
          value={buynumber}
          placeholder="search"
          clear
        ></InputItem>
        <div className={styles.button}>
          <p>
            <AgreeItem data-seed="logId" checked={buyComfirm} onChange={() => setBuyComfirm(!buyComfirm)}>
              {formatMessage({ id: 'labs.title.bought_ask' })}
            </AgreeItem>
          </p>
          <Button type="primary" disabled={!buyComfirm || buynumber <= 0} onClick={() => bugHandel()}>
            {formatMessage({ id: 'labs.title.bought_now' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default connect(({ auth, global }) => ({
  user: auth.user,
  timeDiff: global.serverClientTimeDiff
}))(Action);
