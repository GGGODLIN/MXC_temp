import React, { useCallback, useEffect, useState } from 'react';
import styles from './Register.less';
import { Button, Flex, Modal, Checkbox, InputItem, Toast } from 'antd-mobile';
import classNames from 'classnames';
import { createForm } from 'rc-form';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { passwordReg, emailReg, codeCaptchaReg } from '@/utils/regExp';
import { userRegister, sendUcenterSMSCode, receiveRedPacketRegister } from '@/services/api';
import { registerGeetestScenario } from '@/utils/captcha';
import { geetestCaptcha } from '@/utils/captcha';
import md5 from 'js-md5';
import PasswordLevel from '@/components/PasswordLevel';

const language = getLocale();

function Container({
  redPacketId,
  setPage,
  redPacketInfo,
  currentCountry,
  mobile,
  setReceiveResult,
  form: { getFieldProps, getFieldError, getFieldValue, validateFields, isFieldTouched }
}) {
  useEffect(() => {
    registerGeetestScenario(['REGISTER_PHONE']);
    validateFields();
  }, []);

  const [modalVisible, setModalVisible] = useState(true);
  const visibleHandle = useCallback(() => {
    setModalVisible(false);
    setPage(2);
  }, []);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [newLook, setNewLook] = useState(false);
  const [confirmLook, setConfirmLook] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (!err) {
        let params = {
          mobile: mobile,
          email: values.email,
          smsCode: values.smsCode,
          country: currentCountry.mobileCode,
          hexPassword: md5(values.password),
          type: 'REGISTER',
          source: 'RED_PACKET_RECEIVE'
        };

        if (values.inviteCode) {
          params.inviteCode = redPacketInfo?.inviteCode;
        }

        setSubmitLoading(true);
        const res = await userRegister(params);
        if (res.code === 0) {
          receiveRedPacketRegister({
            mobile: mobile,
            packetId: redPacketId
          }).then(result => {
            setSubmitLoading(false);
            if (result && result.code === 0) {
              Toast.success(formatMessage({ id: 'redPacket.result.success' }));
              setReceiveResult({
                quantity: result.quantity,
                currency: result.currency
              });
              visibleHandle();
            }
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  };

  const passwordHandle = (rule, value, callback, source, options) => {
    const newPasswordConfirm = getFieldValue('confirmPassword');

    if (newPasswordConfirm) {
      validateFields(['confirmPassword']);
    }

    callback();
  };

  const confirmNewPasswordHandle = (rule, value, callback, source, options) => {
    if (value && value !== getFieldValue('password')) {
      callback(formatMessage({ id: 'common.validate.pwd.no_match' }));
    }

    callback();
  };

  // 手机验证码倒计时
  const [sendSmsCodeLoading, setSendSmsCodeLoading] = useState(false);
  const [smsCountdownText, setSmsCountdownText] = useState('');
  let smsTimer;
  const sendSmsCodeHandle = async () => {
    if (sendSmsCodeLoading) {
      return;
    }

    validateFields(['mobile'], async (err, values) => {
      if (getFieldError('mobile')) {
        Toast.info(getFieldError('mobile')[0]);
        return;
      }

      geetestCaptcha('REGISTER_PHONE', async data => {
        const params = {
          mobile: mobile,
          country: currentCountry.mobileCode,
          type: 'REGISTER',
          language: language === 'zh-CN' ? 'CN' : 'EN',
          ...data
        };
        const result = await sendUcenterSMSCode(params);
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
      });
    });
  };

  // 清除定时器
  useEffect(() => {
    return function() {
      if (smsTimer) {
        clearInterval(smsTimer);
        setSendSmsCodeLoading(false);
        setSmsCountdownText(``);
      }
    };
  });

  const closeModalHandle = useCallback(() => {
    Modal.alert(formatMessage({ id: 'redPacket.register.close.tip1' }), formatMessage({ id: 'redPacket.register.close.tip2' }), [
      {
        text: formatMessage({ id: 'redPacket.register.close.action1' }),
        onPress: () => {
          setModalVisible(false);
        },
        style: { fontSize: 16, color: '#9EA1C0', fontWeight: 'bold' }
      },
      {
        text: formatMessage({ id: 'redPacket.register.close.action2' }),
        onPress: () => {},
        style: { fontSize: 16, color: '#DF384E', fontWeight: 'bold' }
      }
    ]);
  }, []);

  let emailErrors = getFieldError('email'),
    smsCodeErrors = getFieldError('smsCode'),
    passwordErrors = getFieldError('password'),
    confirmErrors = getFieldError('confirmPassword');

  return (
    <Modal
      wrapClassName={styles['modal-wrapper']}
      popup
      animationType="slide-up"
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
    >
      <div className={styles.wrapper}>
        <Flex justify="between" className={styles.title}>
          <h3>{formatMessage({ id: 'redPacket.page.title' })}</h3>
          <i className={classNames('iconfont', 'iconquxiao1')} onClick={closeModalHandle}></i>
        </Flex>

        <section className={styles.invite}>
          <Checkbox
            {...getFieldProps('inviteCode', {
              valuePropName: 'checked',
              initialValue: true
            })}
          >
            {formatMessage({ id: 'redPacket.register.invite.code' }, { code: redPacketInfo?.inviteCode })}
          </Checkbox>
        </section>

        <section className={styles.mobile}>
          {formatMessage({ id: 'redPacket.register.mobile' })}+{currentCountry.mobileCode} {mobile}
        </section>

        <div>
          <section className={styles.item}>
            {/*<label className={styles.label}>{formatMessage({ id: 'common.validate.auth.email' })}</label>*/}
            <InputItem
              type="digit"
              {...getFieldProps('smsCode', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.captcha.mobile.require' }) },
                  { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.captcha.mobile.require' })}
              extra={
                <span className={classNames(styles.get, { [styles.loading]: sendSmsCodeLoading })} onClick={sendSmsCodeHandle}>
                  {sendSmsCodeLoading ? `${smsCountdownText}s` : formatMessage({ id: 'redPacket.receive.captcha.get' })}
                </span>
              }
            />

            <p className={styles.error}>{smsCodeErrors && isFieldTouched('smsCode') ? smsCodeErrors.join(',') : ''}</p>
          </section>

          <section className={styles.item}>
            <label className={styles.label}>{formatMessage({ id: 'common.validate.auth.email' })}</label>
            <InputItem
              {...getFieldProps('email', {
                rules: [
                  { required: true, message: formatMessage({ id: 'auth.validate.email.require' }) },
                  { pattern: emailReg, message: formatMessage({ id: 'auth.validate.email.reg' }) }
                ]
              })}
              placeholder={formatMessage({ id: 'auth.validate.email.require' })}
              clear={true}
            />

            <p className={styles.error}>{emailErrors && isFieldTouched('email') ? emailErrors.join(',') : ''}</p>
          </section>

          <section className={styles.item}>
            <label className={styles.label}>{formatMessage({ id: 'auth.set.password' })}</label>
            <InputItem
              {...getFieldProps('password', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
                  { pattern: passwordReg.base, message: formatMessage({ id: 'mc_common_password_format' }) },
                  {
                    validator: (rule, value, callback) => {
                      if (!passwordReg.length.test(value) || !passwordReg.strong.test(value) || !passwordReg.strong2.test(value)) {
                        callback(
                          [
                            formatMessage({ id: 'mc_common_password_length_tip' }),
                            formatMessage({ id: 'mc_common_password_strong_tip' }),
                            formatMessage({ id: 'mc_common_password_strong2_tip' })
                          ].join(language.startsWith('zh-') ? '，' : ',')
                        );
                      }

                      callback();
                    }
                  },
                  { validator: passwordHandle }
                ]
              })}
              placeholder={formatMessage({ id: 'common.validate.pwd.require' })}
              extra={
                <i className={classNames('iconfont', [newLook ? 'iconkejian' : 'iconbukejian'])} onClick={() => setNewLook(!newLook)}></i>
              }
              type={newLook ? 'text' : 'password'}
              clear={true}
            />

            {isFieldTouched('password') && <PasswordLevel value={getFieldValue('password')} />}
            <p className={styles.error}>{passwordErrors && isFieldTouched('password') ? passwordErrors : ''}</p>
          </section>

          <section className={styles.item}>
            <label className={styles.label}>{formatMessage({ id: 'auth.confirm.password' })}</label>
            <InputItem
              {...getFieldProps('confirmPassword', {
                rules: [
                  { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
                  { validator: confirmNewPasswordHandle }
                ]
              })}
              placeholder={formatMessage({ id: 'auth.confirm.password' })}
              extra={
                <i
                  className={classNames('iconfont', [confirmLook ? 'iconkejian' : 'iconbukejian'])}
                  onClick={() => setConfirmLook(!confirmLook)}
                ></i>
              }
              type={confirmLook ? 'text' : 'password'}
              clear={true}
            />

            <p className={styles.error}>{confirmErrors && isFieldTouched('confirmPassword') ? confirmErrors.join(',') : ''}</p>
          </section>

          <section className={classNames(styles.item, styles.submit)}>
            <Button
              type="primary"
              disabled={getFieldError('email') || getFieldError('password') || getFieldError('confirmPassword') || submitLoading}
              // loading={submitLoading}
              onClick={handleSubmit}
            >
              {formatMessage({ id: 'redPacket.page.title' })}
            </Button>
          </section>
        </div>
      </div>
    </Modal>
  );
}

export default createForm()(Container);
