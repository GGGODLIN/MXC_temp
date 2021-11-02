import React, { useCallback, useEffect, useState } from 'react';
import { Button, Flex, InputItem, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { mobileReg, codeCaptchaReg } from '@/utils/regExp';
import CountrySelect from '@/components/CountrySelect';
import Marquee from './Marquee';
import { sendUcenterSMSCode, receiveRedPacket } from '@/services/api';
import Register from './Register';
import styles from './Receive.less';
import countryStyles from '@/components/CountrySelect/index.less';

const language = getLocale();

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
const avatarNum = getRandomInt(9);

function Container({
  redPacketId,
  setPage,
  redPacketInfo,
  setReceiveResult,
  form: { getFieldProps, getFieldError, getFieldsValue, validateFields, getFieldValue }
}) {
  const visibleHandle = useCallback(() => {
    setPage(2);
  }, []);

  // 国家选择
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  // const [currentCountry, setCurrentCountry] = useState({ cn: '中国', code: 'CN', en: 'China', mobileCode: '86' });
  const [currentCountry, setCurrentCountry] = useState({ code: 'VN', en: 'Vietnam', cn: '越南', mobileCode: '84' });
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
    if (sendSmsCodeLoading) {
      return;
    }

    validateFields(async (err, values) => {
      if (getFieldError('mobile')) {
        Toast.info(getFieldError('mobile')[0]);
        return;
      }

      const result = await sendUcenterSMSCode({
        mobile: getFieldsValue(['mobile']).mobile,
        country: currentCountry.mobileCode,
        type: 'RED_PACKET_RECEIVE'
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

  const [submitLoading, setSubmitLoading] = useState(false);
  // 注册弹窗
  const [registerModal, setRegisterModal] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (getFieldError('mobile')) {
        Toast.info(getFieldError('mobile')[0]);
        return;
      }

      if (getFieldError('smsCode')) {
        Toast.info(getFieldError('smsCode')[0]);
        return;
      }

      if (!err) {
        window.localStorage.setItem('mxc.redPacket.mobile', values.mobile);
        setSubmitLoading(true);

        receiveRedPacket({
          mobile: values.mobile,
          packetId: redPacketId,
          smsCode: values.smsCode,
          type: 'RED_PACKET_RECEIVE'
        }).then(result => {
          if (result) {
            if (result.code === 0) {
              setReceiveResult({
                quantity: result.quantity,
                currency: result.currency
              });
              visibleHandle();
            } else if (result.code === 120016) {
              setRegisterModal(true);
            }
          }

          setSubmitLoading(false);
        });
      }
    });
  };

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>{formatMessage({ id: 'redPacket.page.title' })}</h3>

      <div className={styles.content}>
        {/*弹幕*/}
        <Marquee redPacketId={redPacketId} />

        <section className={styles.receive}>
          <div className={classNames(styles[`avatar${avatarNum}`], styles.avatar)}></div>
          <p className={styles.info}>{formatMessage({ id: 'redPacket.receive.sender' }, { account: redPacketInfo?.account })}</p>
          <p className={styles.info}>
            {formatMessage({ id: 'redPacket.receive.amount' }, { amount: redPacketInfo?.totalQuantity, currency: redPacketInfo?.currency })}
          </p>

          <div className={styles.form}>
            <div className={styles.country} onClick={() => setCountrySelectOpen(true)}>
              <span
                className={classNames(
                  styles.flag,
                  countryStyles['country-select-flag'],
                  countryStyles[`country-select-flag-${currentCountry.code.toLowerCase()}`]
                )}
              />
              <span className={styles.name}>{language.startsWith('zh') ? currentCountry.cn : currentCountry.en}</span>
              <i className={classNames('iconfont', 'iconxiasanjiaoxing')}></i>
            </div>
            <section className={styles.item}>
              <InputItem
                type="digit"
                {...getFieldProps('mobile', {
                  initialValue: window.localStorage.getItem('mxc.redPacket.mobile') || undefined,
                  rules: [
                    { required: true, message: formatMessage({ id: 'common.validate.auth.mobile.require' }) },
                    { pattern: mobileReg, message: formatMessage({ id: 'common.validate.auth.mobile.error' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'redPacket.receive.placeholder' })}
              >
                <Flex onClick={() => setCountrySelectOpen(true)}>
                  +{currentCountry.mobileCode}
                  <i className={classNames('iconfont', 'iconxiasanjiaoxing')}></i>
                </Flex>
              </InputItem>
            </section>

            <section className={styles.item}>
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
            </section>

            <section className={styles.item}>
              <Button type="primary" disabled={submitLoading} onClick={handleSubmit}>
                {formatMessage({ id: 'common.sure' })}
              </Button>
            </section>
          </div>
        </section>

        <section className={styles.rules}>
          <p>{formatMessage({ id: 'redPacket.receive.rules' })}</p>
          <p>{formatMessage({ id: 'redPacket.receive.rules.1' })}</p>
          <p>{formatMessage({ id: 'redPacket.receive.rules.2' }, { duration: redPacketInfo?.duration })}</p>
          <p>{formatMessage({ id: 'redPacket.receive.rules.3' })}</p>
        </section>

        <div className={styles.logo}></div>
      </div>

      {/*国家选择*/}
      <CountrySelect open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />

      {/*注册*/}
      {registerModal && (
        <Register
          redPacketId={redPacketId}
          redPacketInfo={redPacketInfo}
          currentCountry={currentCountry}
          mobile={getFieldValue('mobile')}
          setPage={setPage}
          setReceiveResult={setReceiveResult}
        />
      )}
    </section>
  );
}

export default createForm()(Container);
