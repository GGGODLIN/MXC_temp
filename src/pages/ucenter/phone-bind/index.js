import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { InputItem, Toast, WhiteSpace, WingBlank, Flex, Button } from 'antd-mobile';
import { mobileReg, codeCaptchaReg } from '@/utils/regExp';
import { sendUcenterSMSCode, mobileBind, sendUcenterEmailCode, mobileModify } from '@/services/api';
import CountrySelect from '@/components/CountrySelect';

import styles from './index.less';
import commonStyles from '../common.less';

function PhoneBind({ dispatch, loginMember, form: { getFieldProps, getFieldError, isFieldTouched, getFieldsValue, validateFields } }) {
  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
    validateFields();
  }, []);

  // 国家选择
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  // const [currentCountry, setCurrentCountry] = useState({ cn: '中国', code: 'CN', en: 'China', mobileCode: '86' });
  const [currentCountry, setCurrentCountry] = useState();
  const afterCloseHandle = country => {
    if (country.code) {
      setCurrentCountry(country);
    }

    setCountrySelectOpen(false);
  };

  // 手机验证码倒计时
  const [sendSmsCodeLoading, setSendSmsCodeLoading] = useState(false);
  const [smsCountdownText, setSmsCountdownText] = useState('');
  let smsTimer;
  const sendSmsCodeHandle = async () => {
    if (!currentCountry) {
      Toast.fail(formatMessage({ id: 'mc_common_country_select_please' }));
      return;
    }

    if (sendSmsCodeLoading || getFieldError('mobile')) {
      return;
    }

    const result = await sendUcenterSMSCode({
      mobile: getFieldsValue(['mobile']).mobile,
      country: currentCountry.mobileCode,
      type: 'BINDINGPHONE'
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

  // 旧手机验证码倒计时
  const [sendOldSmsCodeLoading, setSendOldSmsCodeLoading] = useState(false);
  const [oldSmsCountdownText, setOldSmsCountdownText] = useState('');
  let oldSmsTimer;
  const sendOldSmsCodeHandle = async () => {
    if (sendOldSmsCodeLoading) {
      return;
    }

    const result = await sendUcenterSMSCode({
      type: 'MODIFY_PHONE'
    });
    let countdownTime = 120;

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendOldSmsCodeLoading(true);
      setOldSmsCountdownText(`${countdownTime}`);

      oldSmsTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(smsTimer);
          setSendOldSmsCodeLoading(false);
          setOldSmsCountdownText(``);

          return;
        }

        countdownTime--;

        setOldSmsCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 邮箱验证码倒计时
  const [sendEmailCodeLoading, setSendEmailCodeLoading] = useState(false);
  const [emailCountdownText, setEmailCountdownText] = useState('');
  let emailTimer;
  const sendEmailCodeHandle = async () => {
    if (sendEmailCodeLoading || getFieldError('mobile')) {
      return;
    }

    const result = await sendUcenterEmailCode({
      type: 'BINDINGPHONE'
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

  // 清除定时器
  useEffect(() => {
    return function() {
      if (smsTimer) {
        clearInterval(smsTimer);
        setSendSmsCodeLoading(false);
        setSmsCountdownText(``);
      }
      if (oldSmsTimer) {
        clearInterval(oldSmsTimer);
        setSendOldSmsCodeLoading(false);
        setOldSmsCountdownText(``);
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

    if (!currentCountry) {
      Toast.fail(formatMessage({ id: 'mc_common_country_select_please' }));
      return;
    }

    validateFields(async (err, values) => {
      if (!err) {
        const params = {};

        if (currentCountry) {
          params.country = currentCountry.mobileCode || undefined;
        }

        if (values.google_auth_code) {
          params.google_auth_code = values.google_auth_code;
        }

        if (values.emailCode) {
          params.emailCode = values.emailCode;
        }

        setSubmitLoading(true);
        let result;
        if (loginMember?.mobile) {
          params.newMobile = values.mobile;
          params.newSmsCode = values.smsCode;
          params.smsCode = values.oldSmsCode;
          result = await mobileModify(params);
        } else {
          params.mobile = values.mobile;
          params.smsCode = values.smsCode;
          result = await mobileBind(params);
        }

        if (result && result.code === 0) {
          Toast.success(
            formatMessage({ id: loginMember?.mobile ? 'ucenter.change_password.success' : 'ucenter.google_auth.open.success' }),
            2,
            () => {
              setSubmitLoading(false);
              router.replace('/ucenter/profile');
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
      <TopBar>{formatMessage({ id: loginMember?.mobile ? 'mc_safety_mobile_modify' : 'ucenter.index.features.mobile' })}</TopBar>
      <WhiteSpace size="xl" />
      <WingBlank>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('mobile', {
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: loginMember?.mobile ? 'mc_safety_mobile_number_new_placeholder' : 'common.validate.auth.mobile.require'
                  })
                },
                { pattern: mobileReg, message: formatMessage({ id: 'common.validate.auth.mobile.error' }) }
              ]
            })}
            placeholder={formatMessage({
              id: loginMember?.mobile ? 'mc_safety_mobile_number_new_placeholder' : 'common.validate.auth.mobile.require'
            })}
          >
            <Flex onClick={() => setCountrySelectOpen(true)}>
              {currentCountry ? <>+ {currentCountry.mobileCode}</> : formatMessage({ id: 'common.select' })}
              <i className={classNames('iconfont', 'icondrop')} />
            </Flex>
          </InputItem>

          <p className={commonStyles.error}>
            {getFieldError('mobile') && isFieldTouched('mobile') ? getFieldError('mobile').join(',') : ''}
          </p>
        </section>

        <section className={styles.item}>
          <InputItem
            {...getFieldProps('smsCode', {
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: loginMember?.mobile ? 'mc_safety_mobile_new_code_placeholder' : 'common.validate.captcha.mobile.require'
                  })
                },
                { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
              ]
            })}
            placeholder={formatMessage({
              id: loginMember?.mobile ? 'mc_safety_mobile_new_code_placeholder' : 'common.validate.captcha.mobile.require'
            })}
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

        {loginMember?.mobile && (
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('oldSmsCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'mc_safety_mobile_old_code_placeholder' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'mc_safety_mobile_old_code_placeholder' })}
              extra={
                <span className={classNames(styles.get, { [styles.loading]: sendOldSmsCodeLoading })} onClick={sendOldSmsCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {oldSmsCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('oldSmsCode') && isFieldTouched('oldSmsCode') ? getFieldError('oldSmsCode').join(',') : ''}
            </p>
          </section>
        )}

        {loginMember && loginMember.secondAuthType === 2 ? (
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
        ) : (
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('emailCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.email.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.email.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.email.require' })}
              extra={
                <span
                  className={classNames(styles.get, { [styles.loading]: sendEmailCodeLoading || getFieldError('mobile') })}
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

      {/*国家选择*/}
      <CountrySelect businessType="BINDING_PHONE" open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  loginMember: auth.loginMember
}))(createForm()(PhoneBind));
