import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';
import { InputItem, Toast, WingBlank, Button } from 'antd-mobile';
import { getGoogleAuthInfo } from '@/services/api';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import GoogleAuthToggle from '../google-auth-toggle';
import QRCode from 'qrcode.react';
import styles from './index.less';
import commonStyles from '../common.less';

function GoogleAuthBind({ user }) {
  const [step, setStep] = useState(2);

  const [googleAuthInfo, setGoogleAuthInfo] = useState();
  useEffect(() => {
    getGoogleAuthInfo().then(result => {
      if (result && result.code === 0) {
        setGoogleAuthInfo(result.data);
      }
    });
  }, []);

  const onCopy = (text, result) => {
    if (result) {
      Toast.success(formatMessage({ id: 'common.copy_success' }), 2);
    }
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.index.features.google_open' })}</TopBar>
      {step === 1 && (
        <>
          <section className={styles.step1}>
            <div className={styles.app}>
              <svg aria-hidden="true">
                <use xlinkHref="#icongugeyanzhengqi"></use>
              </svg>
            </div>

            <h3>{formatMessage({ id: 'ucenter.index.features.google_first' })}</h3>
            <p>(Google Authenticator)</p>
          </section>

          <section className={commonStyles['bottom-btn']}>
            <WingBlank>
              <Button type="primary" onClick={() => setStep(2)}>
                {formatMessage({ id: 'common.next' })}
              </Button>
            </WingBlank>
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <section className={styles.step2}>
            <h3>{formatMessage({ id: 'ucenter.index.features.google_save' })}</h3>

            <div className={styles.content}>
              <div className={styles.qrcode}>
                {googleAuthInfo && (
                  <QRCode
                    value={`otpauth://totp/${user.account}@mexc.com?secret=${googleAuthInfo.secret}`}
                    includeMargin={true}
                    size={150}
                  />
                )}
              </div>

              <h3>{formatMessage({ id: 'common.save.album' })}</h3>
              <p>{formatMessage({ id: 'ucenter.index.features.google_copy_tip' })}</p>

              <InputItem
                value={googleAuthInfo && googleAuthInfo.secret}
                extra={
                  <CopyToClipboard text={googleAuthInfo && googleAuthInfo.secret} onCopy={onCopy}>
                    <a className={styles.copy}>{formatMessage({ id: 'common.copy' })}</a>
                  </CopyToClipboard>
                }
              />
            </div>
          </section>

          <section className={commonStyles['bottom-btn']}>
            <WingBlank>
              <Button type="primary" onClick={() => setStep(3)}>
                {formatMessage({ id: 'common.next' })}
              </Button>
            </WingBlank>
          </section>
        </>
      )}

      {step === 3 && <GoogleAuthToggle type="bind" />}
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(GoogleAuthBind);
