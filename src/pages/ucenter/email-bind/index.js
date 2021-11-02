import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { InputItem, Toast, WhiteSpace, WingBlank, Button } from 'antd-mobile';
import { codeCaptchaReg, emailReg } from '@/utils/regExp';
import { sendUcenterSMSCode, emailModify, emailBind, sendUcenterEmailCode } from '@/services/api';

import styles from './index.less';
import commonStyles from '../common.less';

function PhoneBind({ dispatch, loginMember, form: { getFieldProps, getFieldError, isFieldTouched, validateFields, getFieldValue } }) {
  useEffect(() => {
    validateFields();
  }, []);

  // 手机验证码倒计时
  const [sendSmsCodeLoading, setSendSmsCodeLoading] = useState(false);
  const [smsCountdownText, setSmsCountdownText] = useState('');
  let smsTimer;
  const sendSmsCodeHandle = async () => {
    if (sendSmsCodeLoading) {
      return;
    }

    const result = await sendUcenterSMSCode({
      type: loginMember?.email ? 'MODIFY_EMAIL' : 'BIND_EMAIL'
    });
    let countdownTime = 120;

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendSmsCodeLoading(true);
      setSmsCountdownText(`${countdownTime}`);

      smsTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(smsTimer);
          setSendSmsCodeLoading(false);
          setSmsCountdownText(``);

          return;
        }

        countdownTime--;

        setSmsCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 邮箱验证码倒计时
  const [sendEmailCodeLoading, setSendEmailCodeLoading] = useState(false);
  const [emailCountdownText, setEmailCountdownText] = useState('');
  let emailTimer;
  const sendEmailCodeHandle = async () => {
    if (sendEmailCodeLoading || getFieldError('email')) {
      return;
    }

    const result = await sendUcenterEmailCode({
      type: 'BIND_EMAIL',
      email: getFieldValue('email')
    });
    let countdownTime = 120;

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendEmailCodeLoading(true);
      setEmailCountdownText(`${countdownTime}`);

      emailTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(emailTimer);
          setSendEmailCodeLoading(false);
          setEmailCountdownText(``);

          return;
        }

        countdownTime--;

        setEmailCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 旧邮箱验证码倒计时
  const [sendOldEmailCodeLoading, setSendOldEmailCodeLoading] = useState(false);
  const [oldEmailCountdownText, setOldEmailCountdownText] = useState('');
  let oldEmailTimer;
  const sendOldEmailCodeHandle = async () => {
    if (sendOldEmailCodeLoading) {
      return;
    }

    const result = await sendUcenterEmailCode({
      type: 'MODIFY_EMAIL'
    });
    let countdownTime = 120;

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendOldEmailCodeLoading(true);
      setOldEmailCountdownText(`${countdownTime}`);

      oldEmailTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(oldEmailTimer);
          setSendOldEmailCodeLoading(false);
          setOldEmailCountdownText(``);

          return;
        }

        countdownTime--;

        setOldEmailCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 清除定时器
  useEffect(() => {
    return function() {
      if (smsTimer) {
        clearInterval(smsTimer);
        setSendSmsCodeLoading(false);
        setSmsCountdownText(``);
      }
      if (emailTimer) {
        clearInterval(emailTimer);
        setSendEmailCodeLoading(false);
        setEmailCountdownText(``);
      }
    };
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (!err) {
        const params = {
          google_auth_code: values.google_auth_code,
          smsCode: values.smsCode
        };
        setSubmitLoading(true);
        let result;
        if (loginMember?.email) {
          params.newEmail = values.email;
          params.newEmailCode = values.emailCode;
          params.emailCode = values.oldEmailCode;
          result = await emailModify(params);
        } else {
          params.email = values.email;
          params.emailCode = values.emailCode;
          result = await emailBind(params);
        }

        if (result && result.code === 0) {
          Toast.success(
            formatMessage({ id: loginMember?.email ? 'ucenter.change_password.success' : 'ucenter.google_auth.open.success' }),
            2,
            () => {
              setSubmitLoading(false);
              router.replace('/ucenter/security');
              dispatch({ type: 'auth/getUcenterIndexInfo' });
            }
          );
        } else {
          setSubmitLoading(false);
        }
      }
    });
  };

  return (
    <>
      <TopBar>{formatMessage({ id: loginMember?.email ? 'mc_common_email_modify' : 'securecheck.bind.email' })}</TopBar>
      {loginMember?.email && (
        <section className={commonStyles['tip-wrapper']}>
          <p className={commonStyles.tip}>{formatMessage({ id: 'mc_common_email_modify_warning' })}</p>
        </section>
      )}
      <WhiteSpace size="xl" />
      <WingBlank>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('email', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: loginMember?.email ? 'mc_common_email_new' : 'auth.validate.email.require' })
                },
                { pattern: emailReg, message: formatMessage({ id: 'auth.validate.email.reg' }) }
              ]
            })}
            placeholder={formatMessage({ id: loginMember?.email ? 'mc_common_email_new_placeholder' : 'auth.validate.email.require' })}
          />

          <p className={commonStyles.error}>{getFieldError('email') && isFieldTouched('email') ? getFieldError('email').join(',') : ''}</p>
        </section>

        <section className={styles.item}>
          <InputItem
            {...getFieldProps('emailCode', {
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: loginMember?.email ? 'mc_common_email_new_captcha_placeholder' : 'common.validate.captcha.email.require'
                  })
                },
                { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.email.error' }) }
              ]
            })}
            placeholder={formatMessage({
              id: loginMember?.email ? 'mc_common_email_new_captcha_placeholder' : 'common.validate.captcha.email.require'
            })}
            extra={
              <span
                className={classNames(styles.get, { [styles.loading]: sendEmailCodeLoading || getFieldError('email') })}
                onClick={sendEmailCodeHandle}
              >
                {formatMessage({ id: 'common.validate.auth.get' })}
                {emailCountdownText}
              </span>
            }
          />
          <p className={commonStyles.error}>
            {getFieldError('emailCode') && isFieldTouched('emailCode') ? getFieldError('emailCode').join(',') : ''}
          </p>
        </section>

        {loginMember?.email && (
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('oldEmailCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'mc_common_email_old_captcha_placeholder' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.email.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'mc_common_email_old_captcha_placeholder' })}
              extra={
                <span className={classNames(styles.get, { [styles.loading]: sendOldEmailCodeLoading })} onClick={sendOldEmailCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {oldEmailCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('oldEmailCode') && isFieldTouched('oldEmailCode') ? getFieldError('oldEmailCode').join(',') : ''}
            </p>
          </section>
        )}

        {loginMember && loginMember.mobile && (!loginMember.email || loginMember.secondAuthType !== 2) && (
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('smsCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.mobile.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.mobile.require' })}
              extra={
                <span
                  className={classNames(styles.get, { [styles.loading]: sendSmsCodeLoading || getFieldError('mobile') })}
                  onClick={sendSmsCodeHandle}
                >
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {smsCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('smsCode') && isFieldTouched('smsCode') ? getFieldError('smsCode').join(',') : ''}
            </p>
          </section>
        )}

        {loginMember && loginMember.secondAuthType === 2 && (
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('google_auth_code', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.google.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.google.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.google.require' })}
            />
            <p className={commonStyles.error}>
              {getFieldError('google_auth_code') && isFieldTouched('google_auth_code') ? getFieldError('google_auth_code').join(',') : ''}
            </p>
          </section>
        )}
      </WingBlank>

      <section className={commonStyles['bottom-btn']}>
        <WingBlank>
          <Button
            type="primary"
            disabled={getFieldError('smsCode') || getFieldError('mobile')}
            loading={submitLoading}
            onClick={handleSubmit}
          >
            {formatMessage({ id: 'common.yes' })}
          </Button>
        </WingBlank>
      </section>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  loginMember: auth.loginMember
}))(createForm()(PhoneBind));
