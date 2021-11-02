import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { List, WingBlank, Toast, Button } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { userLogout, userCenterLogout, getSecureCheckList } from '@/services/api';
import { getCookie } from '@/utils';
import SecureCheckPre from '@/components/SecureCheckPre';

import styles from './index.less';
import commonStyles from '../common.less';

const { Item } = List;

// const origins = ['mxc.com', 'mxc.co', 'mxc.ceo'].map(o => ({
//   label: <div>{o}</div>,
//   value: `https://${o}`
// }));

// const currentOrigin = window.location.origin;

function Setting({ dispatch, authStatus: { juniorSuccess, seniorSuccess }, loginMember, user }) {
  useEffect(() => {
    if (user.id && !loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, [user.id, loginMember]);

  const signOut = useCallback(() => {
    userCenterLogout().then(res => {
      if (Number(res.code) !== 0) {
        return;
      }
      userLogout().then(result => {
        if (result.code === 0) {
          dispatch({
            type: 'auth/saveCurrentUser',
            payload: {}
          });

          dispatch({
            type: 'auth/resetUserInfo',
            payload: {
              kycInfo: {}, // 实名认证信息
              authStatus: {}, // 实名认证状态
              vipLevel: null, // vip提现额
              logList: null, // 登录历史
              loginMember: null, // 用户信息
              phishingCode: null // 防钓鱼码
            }
          });
          router.push('/');
          window.location.reload();
        }
      });
    });
  }, []);

  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const cookieUid = getCookie('u_id');
    const uid = user.id;

    setIsLogin(cookieUid || uid);
  }, [user.id]);

  const banksHandle = useCallback(() => {
    const isKycSuccess = juniorSuccess || seniorSuccess;
    if (loginMember && !isKycSuccess) {
      Toast.fail(formatMessage({ id: 'ucenter.setting.banks.tip' }));
    } else {
      router.push('/otc/paymentMethods');
    }
  }, [loginMember]);

  // const [originModalVisible, setOriginModalVisible] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  useEffect(() => {
    if (user.id && loginMember) {
      getSecureCheckList().then(result => {
        if (result && result.code === 0) {
          let safetyLevel = Object.keys(result.data).filter(key => {
            return result.data[key];
          }).length;

          setSecurityLevel(safetyLevel);
        }
      });
    }
  }, [user.id, loginMember]);

  const [secureCheckPreVisible, setSecureCheckPreVisible] = useState(false);
  const jumpHandle = url => {
    if (securityLevel < 2) {
      setSecureCheckPreVisible(true);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'common.set' })}</TopBar>
      <WingBlank className={styles.wrapper}>
        <List>
          <Item arrow="horizontal" onClick={() => jumpHandle('/ucenter/change-password')}>
            {formatMessage({ id: 'ucenter.change_password.title' })}
          </Item>
          <Item arrow="horizontal" onClick={banksHandle}>
            {formatMessage({ id: 'ucenter.setting.banks.set' })}
          </Item>
          <Item arrow="horizontal" onClick={() => router.push('/uassets/search?type=address')}>
            {formatMessage({ id: 'assets.title.index.withdraw_manage' })}
          </Item>
          <Item arrow="horizontal" onClick={() => router.push('/ucenter/openapi')}>
            {formatMessage({ id: 'ucenter.api.title' })}
          </Item>
          <Item arrow="horizontal" onClick={() => router.push('/info/fee')}>
            {formatMessage({ id: 'footer.rate' })}
          </Item>
          <Item arrow="horizontal" onClick={() => router.push('/info/about-us')}>
            {formatMessage({ id: 'footer.about' })}
          </Item>
          {/* <Item arrow="horizontal" onClick={() => setOriginModalVisible(true)}>
            {'服务器切换'}
          </Item> */}
        </List>
      </WingBlank>

      {isLogin && (
        <section className={commonStyles['bottom-btn']}>
          <WingBlank>
            <Button type="primary" onClick={signOut}>
              {formatMessage({ id: 'ucenter.setting.logout' })}
            </Button>
          </WingBlank>
        </section>
      )}

      {/* <Modal popup animationType="slide-up" visible={originModalVisible} onClose={() => setOriginModalVisible(false)}>
        <div className={styles.singleSelect}>
          {origins.map(d => (
            <div
              className={cs(styles.singleSelectOption, currentOrigin === d.value && styles.activeOption)}
              key={d.value}
              onClick={() => {
                if (d.value !== currentOrigin) {
                  window.location.href = d.value;
                }
              }}
            >
              {d.label}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setOriginModalVisible(false)}>
            {'取消'}
          </div>
        </div>
      </Modal> */}
      {user?.id && loginMember && <SecureCheckPre visible={secureCheckPreVisible} closeHandle={() => setSecureCheckPreVisible(false)} />}
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  authStatus: auth.authStatus,
  loginMember: auth.loginMember
}))(Setting);
