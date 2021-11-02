import { useEffect, useState, useReducer } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { Toast, InputItem, WhiteSpace, WingBlank, Button } from 'antd-mobile';
import { codeCaptchaReg } from '@/utils/regExp';
import { sendUcenterSMSCode, sendUcenterEmailCode, resetPasswordAuth } from '@/services/api';
import CustomerService from '@/pages/event/customer-service';

import styles from './index.less';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { connect } from 'dva';

const baseNums = 120;
let smsTimer = null;
let emailTimer = null;

const initialState = {
  smsNums: baseNums,
  emailNums: baseNums
};

const reducer = (state, payload) => {
  return { ...state, ...payload };
};

const ForgetPassword2nd = ({ form, location, loginMember }) => {
  const { getFieldProps, validateFields, getFieldError } = form;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [first, setfirst] = useState({});

  useEffect(() => {
    setfirst(location.state);
  }, [location]);

  useEffect(() => {
    return () => {
      if (smsTimer) {
        clearInterval(smsTimer);
      }
      if (emailTimer) {
        clearInterval(emailTimer);
      }
    };
  }, []);

  const checkAccount = () => {
    validateFields(async (error, values) => {
      if (!error) {
        values.resetPwdToken = first.resetPwdToken;
        const res = await resetPasswordAuth(values);
        if (res.code === 0) {
          //替换第一步token
          router.push({
            pathname: '/auth/forget-password-reset',
            state: res.data
          });
        }
      }
    });
  };

  const getCaptcha = async type => {
    const params = {
      type: 'FORGET_PASSWORD',
      resetPwdToken: first.resetPwdToken
    };

    if (type === 'mobile') {
      if (smsTimer) return false;

      const res = await sendUcenterSMSCode(params);
      if (res.code === 0) {
        IntervalSms();
        Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
      }
    } else if (type === 'email') {
      if (emailTimer) return false;

      const res = await sendUcenterEmailCode(params);
      if (res.code === 0) {
        IntervalEmail();
        Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
      }
    }
  };

  const IntervalSms = () => {
    //60秒倒计时...
    let i = state.smsNums;

    dispatch({
      smsNums: i--
    });
    smsTimer = window.setInterval(() => {
      dispatch({
        smsNums: i--
      });
      if (i < 0) {
        dispatch({
          smsNums: baseNums
        });
        window.clearInterval(smsTimer);
        smsTimer = null;
      }
    }, 1000);
  };

  const IntervalEmail = () => {
    //60秒倒计时...
    let i = state.emailNums;

    dispatch({
      emailNums: i--
    });
    emailTimer = window.setInterval(() => {
      dispatch({
        emailNums: i--
      });
      if (i < 0) {
        dispatch({
          emailNums: baseNums
        });
        window.clearInterval(emailTimer);
        emailTimer = null;
      }
    }, 1000);
  };

  const emailCodeError = getFieldError('emailCode');
  const smsCodeError = getFieldError('smsCode');
  const googleAuthCodeError = getFieldError('google_auth_code');

  return (
    <div>
      <TopBar>{formatMessage({ id: 'auth.forgetPwd' })}</TopBar>
      <WingBlank style={{ marginTop: 30 }}>
        {first.email && (
          <>
            <div className={styles.formItem}>
              <InputItem
                className={styles.input}
                type="text"
                {...getFieldProps('emailCode', {
                  rules: [
                    { required: true, message: formatMessage({ id: 'auth.captcha.require' }) },
                    { pattern: codeCaptchaReg, message: formatMessage({ id: 'auth.captcha.reg' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'common.validate.captcha.email.require' })}
                clear
              ></InputItem>
              {state.emailNums === baseNums ? (
                <Button type="primary" inline onClick={() => getCaptcha('email')}>
                  {formatMessage({ id: 'auth.send.sms.code' })}
                </Button>
              ) : (
                <Button type="primary" inline disabled>
                  {formatMessage(
                    {
                      id: 'auth.send.sms.code.again'
                    },
                    {
                      nums: state.emailNums
                    }
                  )}
                </Button>
              )}
            </div>
            <p className={styles.error}>{emailCodeError ? emailCodeError.join(',') : ''}</p>
            <p className={styles.label}>{formatMessage({ id: 'mc_auth_reset_pwd_code_tip' }, { account: first?.email })}</p>
          </>
        )}

        {first.mobile && (!first.email || !first.needGoogleAuth) && (
          <>
            <div className={styles.formItem}>
              <InputItem
                className={styles.input}
                type="text"
                {...getFieldProps('smsCode', {
                  rules: [
                    { required: true, message: formatMessage({ id: 'auth.captcha.require' }) },
                    { pattern: codeCaptchaReg, message: formatMessage({ id: 'auth.captcha.reg' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'common.validate.captcha.mobile.require' })}
                clear
              ></InputItem>
              {state.smsNums === baseNums ? (
                <Button type="primary" inline onClick={() => getCaptcha('mobile')}>
                  {formatMessage({ id: 'auth.send.sms.code' })}
                </Button>
              ) : (
                <Button type="primary" inline disabled>
                  {formatMessage(
                    {
                      id: 'auth.send.sms.code.again'
                    },
                    {
                      nums: state.smsNums
                    }
                  )}
                </Button>
              )}
            </div>
            <p className={styles.error}>{smsCodeError ? smsCodeError.join(',') : ''}</p>
            <p className={styles.label}>{formatMessage({ id: 'mc_auth_reset_pwd_code_tip' }, { account: first?.mobile })}</p>
          </>
        )}
        {first.needGoogleAuth && (
          <>
            <InputItem
              type="text"
              {...getFieldProps('google_auth_code', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.google.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.google.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.google.require' })}
              clear
            ></InputItem>
            <p className={styles.error}>{googleAuthCodeError ? googleAuthCodeError.join(',') : ''}</p>
          </>
        )}
        <WhiteSpace />
        <Button type="primary" onClick={() => checkAccount()} style={{ marginTop: 30 }}>
          {formatMessage({ id: 'common.yes' })}
        </Button>
        <p className={styles.verificationTip}>{formatMessage({ id: 'mc_auth_reset_pwd_verification_tip' })}</p>
      </WingBlank>
      <CustomerService />
    </div>
  );
};

export default connect(({ auth }) => ({
  loginMember: auth.loginMember
}))(createForm()(ForgetPassword2nd));
