import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from '../profile/index.less';
import { List, WingBlank } from 'antd-mobile';
import SecureCheckPre from '@/components/SecureCheckPre';
import { getSecureCheckList } from '@/services/api';

const { Item } = List;

function Security({ loginMember, phishingCode, dispatch }) {
  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }

    if (!phishingCode) {
      dispatch({ type: 'auth/getPhishingCode' });
    }
  }, []);

  const [securityLevel, setSecurityLevel] = useState(0);
  useEffect(() => {
    getSecureCheckList().then(result => {
      if (result && result.code === 0) {
        let safetyLevel = Object.keys(result.data).filter(key => {
          return result.data[key];
        }).length;

        setSecurityLevel(safetyLevel);
      }
    });
  }, []);

  const [secureCheckPreVisible, setSecureCheckPreVisible] = useState(false);
  const jumpHandle = url => {
    if (securityLevel < 2 && loginMember?.email) {
      setSecureCheckPreVisible(true);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'header.security_setting' })}</TopBar>
      <WingBlank className={styles.features}>
        <List>
          <Item
            arrow="horizontal"
            extra={loginMember?.email ?? formatMessage({ id: 'ucenter.index.features.mobile_bind' })}
            onClick={() => jumpHandle('/ucenter/email-bind')}
          >
            {formatMessage({ id: 'securecheck.bind.email' })}
          </Item>

          <Item
            arrow={'horizontal'}
            extra={loginMember?.mobile ?? formatMessage({ id: 'ucenter.index.features.mobile_bind' })}
            onClick={() => jumpHandle('/ucenter/phone-bind')}
          >
            {formatMessage({ id: 'securecheck.bind.phone' })}
          </Item>

          <Item
            arrow="horizontal"
            extra={
              loginMember && loginMember.secondAuthType !== 2
                ? formatMessage({ id: 'ucenter.index.features.google_closed' })
                : formatMessage({ id: 'ucenter.index.features.google_opened' })
            }
            onClick={() =>
              router.push(loginMember && loginMember.secondAuthType !== 2 ? '/ucenter/google-auth-bind' : '/ucenter/google-auth-unbind')
            }
          >
            {formatMessage({ id: 'ucenter.index.features.google_auth' })}
          </Item>

          <Item arrow="horizontal" onClick={() => router.push('/ucenter/frozen')}>
            {formatMessage({ id: 'ucenter.features.frozen' })}
          </Item>

          <Item arrow="horizontal" extra={phishingCode} onClick={() => router.push(phishingCode ? 'phishing-set' : '/ucenter/phishing')}>
            {formatMessage({ id: 'ucenter.features.phishing' })}
          </Item>
        </List>
      </WingBlank>
      <SecureCheckPre visible={secureCheckPreVisible} closeHandle={() => setSecureCheckPreVisible(false)} />
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  loginMember: auth.loginMember,
  phishingCode: auth.phishingCode
}))(Security);
