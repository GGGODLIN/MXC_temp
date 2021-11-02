import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { InputItem, Flex, WingBlank, Button, Modal, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import { codeCaptchaReg } from '@/utils/regExp';
import { getSecureCheckList, sendUcenterSMSCode, sendUcenterEmailCode } from '@/services/api';

import styles from './index.less';
import commonStyles from '../../pages/ucenter/common.less';

const Index = ({
  title,
  showSecureCheckModal,
  handleHideSecureCheckModal,
  handleSubmitAfter,
  emailParams,
  smsParams,
  form: { getFieldProps, getFieldError, resetFields, validateFields, isFieldTouched }
}) => {
  const [email, setEmail] = useState();
  const [mobile, setMobile] = useState();

  // 初始化，只执行一次
  useEffect(() => {
    async function fetchData() {
      const result = await getSecureCheckList();

      if (result && result.code === 0) {
        if (result.data.email && result.data.mobile) {
          setMobile(result.data.mobile);
        } else {
          setEmail(result.data.email);
        }

        validateFields();
      }
    }

    fetchData();
  }, []);

  // 邮箱验证码倒计时
  const [sendEmailCodeLoading, setSendEmailCodeLoading] = useState(false);
  const [mailCountdownText, setMailCountdownText] = useState('');
  let emailTimer;
  const sendEmailCodeHandle = async () => {
    if (sendEmailCodeLoading) {
      return;
    }

    const result = await sendUcenterEmailCode({ ...emailParams });
    let countdownTime = 60;

    if (result && result.code === 0) {
      Toast.success(formatMessage({ id: 'common.validate.auth.get.success' }), 2);

      setSendEmailCodeLoading(true);
      setMailCountdownText(`${countdownTime}`);

      emailTimer = setInterval(() => {
        if (countdownTime === 1) {
          clearInterval(emailTimer);
          setSendEmailCodeLoading(false);
          setMailCountdownText(``);

          return;
        }

        countdownTime--;

        setMailCountdownText(`${countdownTime}`);
      }, 1000);
    }
  };

  // 手机验证码倒计时
  const [sendSmsCodeLoading, setSendSmsCodeLoading] = useState(false);
  const [smsCountdownText, setSmsCountdownText] = useState('');
  let smsTimer;
  const sendSmsCodeHandle = async () => {
    if (sendSmsCodeLoading) {
      return;
    }

    const result = await sendUcenterSMSCode({ ...smsParams });
    let countdownTime = 60;

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

  // 清除定时器
  const clearTimer = function() {
    if (smsTimer) {
      clearInterval(smsTimer);
      setSendSmsCodeLoading(false);
      setSmsCountdownText(``);
    }

    if (emailTimer) {
      clearInterval(emailTimer);
      setSendEmailCodeLoading(false);
      setMailCountdownText(``);
    }
  };
  useEffect(() => {
    return clearTimer;
  });

  const submitHandle = () => {
    validateFields((err, values) => {
      if (!err) {
        if (typeof handleSubmitAfter === 'function') {
          handleSubmitAfter({
            smsCode: values.smsCode,
            emailCode: values.emailCode,
            googleAuthCode: values.googleAuthCode
          });
        }
      }
    });
  };

  const afterCloseHandle = () => {
    clearTimer();
    resetFields();
    validateFields();
  };

  const emailCodeError = getFieldError('emailCode');
  const smsCodeError = getFieldError('smsCode');

  return (
    <Modal popup animationType="slide-up" visible={showSecureCheckModal} onClose={handleHideSecureCheckModal} afterClose={afterCloseHandle}>
      <section className={styles['header-wrapper']}>
        <WingBlank>
          <Flex className={styles.header} justify="between">
            <Flex.Item>
              <h1>{title || formatMessage({ id: 'securecheck' })}</h1>
            </Flex.Item>
            <span onClick={handleHideSecureCheckModal}>{formatMessage({ id: 'common.cancel' })}</span>
          </Flex>
        </WingBlank>
      </section>

      <WingBlank className={styles.content}>
        {email && (
          <div>
            <p>
              {formatMessage({ id: 'common.validate.auth.email' })}：{email}
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
                <span className={classNames(styles.get, { [styles.loading]: sendEmailCodeLoading })} onClick={sendEmailCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {mailCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('emailCode') && isFieldTouched('emailCode') ? getFieldError('emailCode').join(',') : ''}
            </p>
          </div>
        )}

        {mobile && (
          <div>
            <p>
              {formatMessage({ id: 'common.validate.auth.mobile' })}：{mobile}
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
                <span className={classNames(styles.get, { [styles.loading]: sendSmsCodeLoading })} onClick={sendSmsCodeHandle}>
                  {formatMessage({ id: 'common.validate.auth.get' })}
                  {smsCountdownText}
                </span>
              }
            />
            <p className={commonStyles.error}>
              {getFieldError('smsCode') && isFieldTouched('smsCode') ? getFieldError('smsCode').join(',') : ''}
            </p>
          </div>
        )}

        <Button type="primary" disabled={emailCodeError || smsCodeError} onClick={submitHandle}>
          {formatMessage({ id: 'common.yes' })}
        </Button>

        <p className={styles.help}>
          {formatMessage({ id: 'securecheck.email_tip1' })}
          <a href={`${HC_PATH}/hc/zh-cn/articles/360029387992`} target="_blank" rel="noopener noreferrer">
            {formatMessage({ id: 'securecheck.email_tip2' })}
          </a>
        </p>
      </WingBlank>
    </Modal>
  );
};

export default createForm()(Index);
