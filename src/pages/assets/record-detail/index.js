import { useState, useEffect } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';
import { getWithdrawDetail, getDepositDetail } from '@/services/api';
import styles from './index.less';

const rechargeStateMap = {
  PENDING: formatMessage({ id: 'assets.recharge.pengding' }),
  SUCCESS: formatMessage({ id: 'assets.recharge.success' })
};

const withdrawStateMap = {
  APPLY: formatMessage({ id: 'assets.cash.state.waitSure' }),
  AUDITING: formatMessage({ id: 'assets.cash.state.loading' }),
  WAIT: formatMessage({ id: 'assets.cash.state.loading' }),
  PROCESSING: formatMessage({ id: 'assets.cash.state.loading' }),
  FAILED: formatMessage({ id: 'assets.cash.state.loading' }),
  WAIT_CONFIRM: formatMessage({ id: 'assets.cash.state.waitqk' }),
  WAIT_PACKAGING: formatMessage({ id: 'assets.cash.state.waitqk' }),
  SUCCESS: formatMessage({ id: 'assets.cash.state.success' }),
  CANCEL: formatMessage({ id: 'assets.cash.state.cancel' }),
  MANUAL: formatMessage({ id: 'assets.cash.state.loading' })
};

//充值记录没有ID字段
const RecordDetail = ({ location }) => {
  const { query } = location;
  const [info, setInfo] = useState({});

  useEffect(() => {
    if (query.id) {
      getWithdrawInfo();
    } else {
      getDepositInfo();
    }
  }, []);

  const getDepositInfo = async () => {
    const res = await getDepositDetail(query);

    if (res.code === 0) {
      setInfo(res.data);
    }
  };

  const getWithdrawInfo = async () => {
    const res = await getWithdrawDetail(query);

    if (res.code === 0) {
      setInfo(res.data);
    }
  };

  return (
    <>
      <TopBar>{info.id ? formatMessage({ id: 'assets.withdraw.detail' }) : formatMessage({ id: 'assets.recharge.detail' })}</TopBar>
      {info.id ? (
        <div className={styles.items}>
          <div className={styles.item}>
            <span>-{info.actualAmount}</span>
            <p>{info.currency}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.treaty.history.type' })}</span>
            <p>{formatMessage({ id: 'assets.withdraw.type' })}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.balances.cash.addr' })}</span>
            <p>{info.address}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.recharge.status' })}</span>
            <p>{withdrawStateMap[info.state]}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'act.invite_datatime' })}</span>
            <p>{moment(info.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.find.blockchain' })}</span>
            <div>
              {info.explorerUrl ? (
                <a href={info.explorerUrl} rel="noopener noreferrer" target="_blank">
                  {formatMessage({ id: 'assets.blockchain.browser' })}
                  <i className="iconfont iconsanjiaoxing-bian"></i>
                </a>
              ) : (
                <p>
                  {formatMessage({ id: 'assets.blockchain.browser' })}
                  <i className="iconfont iconsanjiaoxing-bian"></i>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.items}>
          <div className={styles.item}>
            <span>+{info.rechargeValue}</span>
            <p>{info.vcoinNameEN}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.treaty.history.type' })}</span>
            <p>{formatMessage({ id: 'assets.withdraw.type' })}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.recharge.status' })}</span>
            <p>{rechargeStateMap[info.status]}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'act.invite_datatime' })}</span>
            <p>{moment(info.receiptTime).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div className={styles.item}>
            <span>{formatMessage({ id: 'assets.find.blockchain' })}</span>
            <div>
              {info.explorerUrl ? (
                <a href={info.explorerUrl} rel="noopener noreferrer" target="_blank">
                  {formatMessage({ id: 'assets.blockchain.browser' })}
                  <i className="iconfont iconsanjiaoxing-bian"></i>
                </a>
              ) : (
                <p>
                  {formatMessage({ id: 'assets.blockchain.browser' })}
                  <i className="iconfont iconsanjiaoxing-bian"></i>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default connect()(RecordDetail);
