import React, { useEffect, useReducer } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import Switchtype from './switch';
import { getUcenterIndexInfo, getOTCTradeInfo } from '@/services/api';
import { getCookie } from '@/utils';
const initialState = {
  userInfo: {
    loginMember: {},
    idenAuth: {}
  },
  moneyLines: {}
};
function reducer(state, action) {
  return { ...state, ...action };
}
function FiatHook(props) {
  const [state, setstate] = useReducer(reducer, initialState);
  const { user } = props;
  const cookieUid = getCookie('u_id');
  useEffect(() => {
    const userInfo = async () => {
      const res = await getUcenterIndexInfo();
      if (res.code === 0) {
        setstate({ userInfo: { loginMember: res.data } });
      }
    };
    const getMoneyLines = async () => {
      const res = await getOTCTradeInfo();
      if (res.code === '0') {
        setstate({ moneyLines: res.result });
      }
    };
    if (user.uid || cookieUid) {
      userInfo();
      getMoneyLines();
    }
  }, []);
  const usertype = state => {
    let text = '';
    if (state.userInfo.loginMember.authLevel >= '2') {
      text = (
        <span style={{ color: '#00D38B' }}>
          <i className="iconfont iconconfirm" style={{ paddingRight: 10, color: '#00D38B' }}></i>
          {formatMessage({ id: 'container.primary.kyc' })}
        </span>
      );
      if (state.userInfo.idenAuth) {
        if (state.userInfo.idenAuth.status === 0) {
          text = formatMessage({ id: 'ucenter.index.features.kyc_ing' });
        } else if (state.userInfo.idenAuth.status === 2) {
          // text = formatMessage({ id: 'container.primary.rejected' });
        }
      }
    } else {
      text = (
        <span>
          {formatMessage({ id: 'container.primary.for.kyc' })}
          <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
        </span>
      );
    }

    return text;
  };
  const seniorType = state => {
    let text = '';
    if (state.userInfo.loginMember.authLevel >= '3') {
      text = (
        <span style={{ color: '#00D38B' }}>
          <i className="iconfont iconconfirm" style={{ paddingRight: 10, color: '#00D38B' }}></i>
          {formatMessage({ id: 'container.senior.kyc' })}
        </span>
      );
      if (state.userInfo.idenAuth) {
        if (state.userInfo.idenAuth.status === 0) {
          text = formatMessage({ id: 'ucenter.index.features.kyc_ing' });
        } else if (state.userInfo.idenAuth.status === 2) {
          text = formatMessage({ id: 'container.primary.rejected' });
        }
      }
    } else if (state.userInfo.loginMember.authLevel >= '2') {
      text = (
        <span style={{ color: '#00D38B' }}>
          <i className="iconfont iconconfirm" style={{ paddingRight: 10, color: '#00D38B' }}></i>
          {formatMessage({ id: 'container.primary.kyc' })}
        </span>
      );
      if (state.userInfo.idenAuth) {
        if (state.userInfo.idenAuth.status === 0) {
          text = formatMessage({ id: 'ucenter.index.features.kyc_ing' });
        } else if (state.userInfo.idenAuth.status === 2) {
          text = <span style={{ color: '#00D38B' }}>{formatMessage({ id: 'container.primary.rejected' })}</span>;
        }
      }
    } else {
      text = (
        <span>
          {formatMessage({ id: 'container.senior.for.kyc' })}
          <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
        </span>
      );
    }

    return text;
  };
  const certificationType = state => {
    let text = '';
    if (state.userInfo.loginMember.authLevel >= '2') {
      text = (
        <span style={{ color: '#00D38B' }} onClick={() => router.push('/ucenter/id-auth-result')}>
          {/* {formatMessage({ id: 'container.senior.for.kyc' })} */}
        </span>
      );
      if (state.userInfo.idenAuth) {
        if (state.userInfo.idenAuth.status === 0) {
          text = (
            <span style={{ color: '#00D38B' }} onClick={() => router.push('/ucenter/id-auth')}>
              {formatMessage({ id: 'ucenter.index.features.kyc_ing' })}
            </span>
          );
        } else if (state.userInfo.idenAuth.status === 2) {
          text = (
            <span style={{ color: '#00D38B' }} onClick={() => router.push('/ucenter/id-auth-result')}>
              {formatMessage({ id: 'container.primary.rejected' })}
            </span>
          );
        }
      }
    } else if (state.userInfo.loginMember.authLevel >= '1') {
      if (state.userInfo.loginMember.authLevel >= '2') {
        text = (
          <span onClick={() => router.push('/ucenter/id-auth')}>
            {formatMessage({ id: 'ucenter.index.verified' })}
            <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
          </span>
        );
      }

      if (state.userInfo.loginMember.authLevel === '1' && state.userInfo.idenAuth && state.userInfo.idenAuth.status === 2) {
        text = (
          <span onClick={() => router.push('/ucenter/id-auth')}>
            {formatMessage({ id: 'ucenter.index.features.kyc_reject' })}
            <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
          </span>
        );
      }

      if (state.userInfo.loginMember.authLevel === '1' && state.userInfo.idenAuth && state.userInfo.idenAuth.status === 0) {
        text = (
          <span onClick={() => router.push('/ucenter/id-auth')}>
            {formatMessage({ id: 'ucenter.index.features.kyc_ing' })}
            <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
          </span>
        );
      }
    } else {
      text = (
        <span style={{ color: '#00D38B' }} onClick={() => router.push('/ucenter/id-auth')}>
          {formatMessage({ id: 'container.primary.for.kyc' })}
        </span>
      );
    }

    return text;
  };
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.spot} onClick={() => router.push('/trade/spot')}>
            {formatMessage({ id: 'header.trade_center' })}
          </div>
          <div className={styles.otc}>{formatMessage({ id: 'download.title.fiat' })}</div>
        </div>
      </div>

      <div className={styles.fiatContent}>
        <div className={styles.fiatTop}>
          {usertype(state)}
          <div className={styles.centerContent}>
            <span className={styles.topPoint}></span>
            <span className={styles.topPoint}></span>
            <span className={styles.topPoint}></span>
          </div>

          <span className={styles.rightCertification}>{seniorType(state)}</span>
        </div>
        <div className={styles.linesContent}>
          <div>
            {formatMessage({ id: 'otcfiat.Available.credit' })}:
            {state.moneyLines.buyAvailable === -1 ? (
              <div>
                <span className={styles.lineesmoney}>{formatMessage({ id: 'otcfiat.lines.unlimited' })}</span>
              </div>
            ) : (
              <div>
                <span className={styles.lineesmoney}>{state.moneyLines.buyAvailable}</span>
                <span className={styles.lineesmoney}>USDT</span>
              </div>
            )}
          </div>
          <div>{certificationType(state)}</div>
        </div>
      </div>
      <Switchtype />
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(FiatHook);
