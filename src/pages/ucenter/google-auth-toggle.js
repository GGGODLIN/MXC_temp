import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { InputItem, Flex, Toast, WingBlank, WhiteSpace, Button } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { codeCaptchaReg } from '@/utils/regExp';
import { googleAuthBindToggle, getGoogleAuthCheck, sendUcenterEmailCode, sendUcenterSMSCode } from '@/services/api';
import md5 from 'js-md5';

import styles from './google-auth-toggle.less';
import commonStyles from './common.less';

function GoogleAuthToggle({ type, dispatch, form: { getFieldProps, isFieldTouched, getFieldError, validateFields } }) {
  // 密码可见
  const [passportLook, setPassportLook] = useState(false);

  // 获取验证方式，短信验证码或者邮箱验证码
  const [checkType, setCheckType] = useState(null);
  const [checkTypeValue, setCheckTypeValue] = useState('');
  useEffect(() => {
    validateFields();

    (async function() {
      let result = await getGoogleAuthCheck();

      if (result && result.code === 0) {
        setCheckType(result.data.type);
        setCheckTypeValue(result.data.value);
      }
    })();
  }, []);

  // 手机验证码倒计时或者邮箱验证码
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [codeCountdownText, setCodeCountdownText] = useState('');
  let codeTimer;
  const sendCodeHandle = async () => {
    if (sendCodeLoading) {
      return;
    }

    let result,
      codeType = type === 'unbind' ? 'UNBIND_GOOGLE_AUTH' : 'BIND_GOOGLE_AUTH';

    switch (checkType) {
      case 0:
        result = await sendUcenterEmailCode({ type: codeType });
        break;
      case 1:
        result = await sendUcenterSMSCode({ type: codeType });
        break;
      default:
        result = null;
    }

    let countdownTime = 120;
    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendCodeLoading(true);
      setCodeCountdownText(`${countdownTime}`);

      codeTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(codeTimer);
          setSendCodeLoading(false);
          setCodeCountdownText(``);

          return;
        }

        countdownTime--;

        setCodeCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 清除定时器
  useEffect(() => {
    return function() {
      if (codeTimer) {
        clearInterval(codeTimer);
        setSendCodeLoading(false);
        setCodeCountdownText(``);
      }
    };
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const submitHandle = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (!err) {
        setSubmitLoading(true);

        let params = {
          validationCode: values.googleAuthCode,
          password: md5(values.password)
        };

        if (checkType === 0) {
          params.smsCode = values.emailCode;
        }

        if (checkType === 1) {
          params.smsCode = values.smsCode;
        }

        const result = await googleAuthBindToggle(type, params);

        if (result && result.code === 0) {
          dispatch({ type: 'auth/getUcenterIndexInfo' });

          Toast.success(
            type === 'bind'
              ? formatMessage({ id: 'ucenter.google_auth.open.success' })
              : formatMessage({ id: 'ucenter.google_auth.close.success' }),
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
    <div>
      <TopBar>
        {type === 'bind'
          ? formatMessage({ id: 'ucenter.index.features.google_open' })
          : formatMessage({ id: 'ucenter.index.features.google_close' })}
      </TopBar>

      {type === 'unbind' && (
        <section className={commonStyles['tip-wrapper']}>
          <p className={commonStyles.tip}>{formatMessage({ id: 'ucenter.close.google_auth.tip' })}</p>
        </section>
      )}

      <WhiteSpace size="xl" />
      <WingBlank>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('password', {
              rules: [{ required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) }]
            })}
            placeholder={formatMessage({ id: 'common.validate.pwd.require' })}
            extra={
              <i
                className={classNames('iconfont', [passportLook ? 'iconkejian' : 'iconbukejian'])}
                onClick={() => setPassportLook(!passportLook)}
              ></i>
            }
            type={passportLook ? 'text' : 'password'}
          />

          <p className={commonStyles.error}>
            {getFieldError('password') && isFieldTouched('password') ? getFieldError('password').join(',') : ''}
          </p>
        </section>

        {checkType === 0 && (
          <section>
            <p>
              {formatMessage({ id: 'common.validate.auth.email' })}：{checkTypeValue}
            </p>
            <InputItem
              {...getFieldProps('emailCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.email.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.email.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.email.require' })}
              extra={
                <span className={classNames(styles.get, { [styles.loading]: sendCodeLoading })} onClick={sendCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {codeCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('emailCode') && isFieldTouched('emailCode') ? getFieldError('emailCode').join(',') : ''}
            </p>
          </section>
        )}

        {checkType === 1 && (
          <section>
            <p>
              {formatMessage({ id: 'common.validate.auth.mobile' })}：{checkTypeValue}
            </p>
            <InputItem
              {...getFieldProps('smsCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.mobile.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.mobile.require' })}
              extra={
                <span className={classNames(styles.get, { [styles.loading]: sendCodeLoading })} onClick={sendCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {codeCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('smsCode') && isFieldTouched('smsCode') ? getFieldError('smsCode').join(',') : ''}
            </p>
          </section>
        )}

        <section>
          <p>{formatMessage({ id: 'common.validate.captcha.google' })}</p>
          <InputItem
            {...getFieldProps('googleAuthCode', {
              rules: [
                { required: true, message: formatMessage({ id: 'common.validate.captcha.google.require' }) },
                { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.google.error' }) }
              ]
            })}
            placeholder={formatMessage({ id: 'common.validate.captcha.google.require' })}
          />
          <p className={commonStyles.error}>
            {getFieldError('googleAuthCode') && isFieldTouched('googleAuthCode') ? getFieldError('googleAuthCode').join(',') : ''}
          </p>
        </section>

        {/*<p className={styles.tip}>{formatMessage({ id: 'ucenter.index.features.google_close.tip' })}</p>*/}
      </WingBlank>

      <section className={commonStyles['bottom-btn']}>
        <WingBlank>
          <Button
            type="primary"
            disabled={
              getFieldError('password') || getFieldError('emailCode') || getFieldError('smsCode') || getFieldError('googleAuthCode')
            }
            loading={submitLoading}
            onClick={submitHandle}
          >
            {formatMessage({ id: 'common.yes' })}
          </Button>
        </WingBlank>
      </section>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(createForm()(GoogleAuthToggle));
