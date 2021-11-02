import { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { Button, InputItem, Toast } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import classNames from 'classnames';
import { secondAuth, sendUcenterSMSCode, sendUcenterEmailCode, loginFingerprint } from '@/services/api';
import { codeCaptchaReg } from '@/utils/regExp';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

const baseNums = 60;
let timer = null;

const Login2ndAuth = ({ form, loginInfo, dispatch, fingerprint }) => {
  const [nums, setNums] = useState(baseNums);
  const { getFieldProps, validateFields, isFieldTouched, getFieldError } = form;
  const _local = sessionStorage.getItem('loginInfo') ? JSON.parse(sessionStorage.getItem('loginInfo')) : {};
  const { secondAuthToken, secondAuthType } = Object.keys(_local).length ? _local : loginInfo;

  useEffect(() => {
    validateFields();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (!err) {
        const params = {
          code: values.code,
          via: 'h5',
          secondAuthToken,
          // 上报设备指纹
          requestId: fingerprint ? fingerprint.requestId : undefined,
          deviceId: fingerprint && fingerprint.visitorId ? fingerprint.visitorId : 'unknowndeviceid'
        };

        const res = await secondAuth(params);
        if (res.code === 0) {
          dispatch({ type: 'auth/putLoginByUcenter', payload: { ucenterToken: res.data.token } }).then(loginRes => {
            if (loginRes.code === 0) {
              localStorage.setItem('mxc.market.active', '');
              sessionStorage.removeItem('loginInfo');
              dispatch({
                type: 'auth/fetchCurrent'
              });
            }
          });
        }
      }
    });
  };

  const getCaptcha = async e => {
    if (timer) return false;

    const params = {
      secondAuthToken,
      type: 'LOGIN_SECOND_AUTH'
    };

    if (secondAuthType === 1) {
      const res = await sendUcenterSMSCode(params);
      if (res.code === 0) {
        Interval();
        Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
      }
    } else if (secondAuthType === 0) {
      const res = await sendUcenterEmailCode(params);
      if (res.code === 0) {
        Interval();
        Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
      }
    }
  };

  const Interval = () => {
    //60秒倒计时...
    let i = nums;

    setNums(i--);
    timer = window.setInterval(() => {
      setNums(i--);
      if (i < 0) {
        setNums(baseNums);
        window.clearInterval(timer);
        timer = null;
      }
    }, 1000);
  };

  const codeError = getFieldError('code');

  return (
    <>
      <TopBar>
        {secondAuthType === 2 && formatMessage({ id: 'auth.google' })}
        {secondAuthType === 1 && formatMessage({ id: 'common.validate.captcha.mobile' })}
        {secondAuthType === 0 && formatMessage({ id: 'common.validate.captcha.email' })}
      </TopBar>
      <div className={styles.wrap}>
        {secondAuthType === 2 && (
          <div className={styles.item}>
            <div className={styles.main}>
              <div className={styles.inputWrap}>
                <InputItem
                  {...getFieldProps('code', {
                    rules: [
                      { required: true, message: formatMessage({ id: 'auth.google.require' }) },
                      { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.google.error' }) }
                    ]
                  })}
                  autoFocus
                  placeholder={formatMessage({ id: 'auth.google.require' })}
                  type="tel"
                ></InputItem>
              </div>
            </div>
            <p className={styles.error}>{codeError && isFieldTouched('code') ? codeError.join(',') : ''}</p>
          </div>
        )}
        {(secondAuthType === 1 || secondAuthType === 0) && (
          <div className={styles.item}>
            <div className={styles.main}>
              <div className={styles.inputWrap}>
                <InputItem
                  {...getFieldProps('code', {
                    rules: [
                      { required: true, message: formatMessage({ id: 'auth.captcha.require' }) },
                      { pattern: codeCaptchaReg, message: formatMessage({ id: 'auth.captcha.reg' }) }
                    ]
                  })}
                  autoFocus
                  placeholder={formatMessage({ id: 'auth.captcha.require' })}
                  type="tel"
                ></InputItem>
              </div>
              <div className={styles.extra}>
                {nums === baseNums ? (
                  <Button type="primary" onClick={getCaptcha}>
                    {formatMessage({ id: 'auth.send.sms.code' })}
                  </Button>
                ) : (
                  <Button type="primary" disabled>
                    {formatMessage(
                      {
                        id: 'auth.send.sms.code.again'
                      },
                      {
                        nums
                      }
                    )}
                  </Button>
                )}
              </div>
            </div>
            <p className={styles.error}>{codeError && isFieldTouched('code') ? codeError.join(',') : ''}</p>
          </div>
        )}
        <Button type="primary" onClick={handleSubmit} disabled={codeError}>
          {formatMessage({ id: 'auth.signIn' })}
        </Button>
        {loginInfo.phishingCode ? (
          <div className={styles.phishing}>
            <div className={classNames(styles.head, styles.green)}>
              <i className="iconfont iconsafety-certificate"></i>
              <span>{loginInfo.phishingCode}</span>
            </div>
            <p>{formatMessage({ id: 'auth.login.phishing.tips1' })}</p>
          </div>
        ) : (
          <div className={styles.phishing}>
            <div className={classNames(styles.head, styles.yellow)}>
              <i className="iconfont iconinfo-circle1"></i>
              <span>{formatMessage({ id: 'safe.modal.unbind_anti' })}</span>
            </div>
            <p>{formatMessage({ id: 'auth.login.phishing.tips2' })}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default connect(({ login }) => ({ ...login }))(createForm()(Login2ndAuth));
