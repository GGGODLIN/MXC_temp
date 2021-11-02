import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import withRouter from 'umi/withRouter';
import { Button, InputItem, Flex, Toast, Checkbox } from 'antd-mobile';
import { emailReg, mobileReg, codeCaptchaReg } from '@/utils/regExp';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { registerGeetestScenario } from '@/utils/captcha';
import router from 'umi/router';
import { geetestCaptcha } from '@/utils/captcha';
import classNames from 'classnames';
import CountrySelect from '@/components/CountrySelect';
import { sendUcenterSMSCode, sendUcenterEmailCode, getForbidMailSuffix } from '@/services/api';
import styles from './Form.less';

const language = getLocale();

const baseNums = 60;
let timer = null;

const Form = ({ form, type, dispatch, registerInfo, location }) => {
  const { getFieldProps, validateFields, isFieldTouched, getFieldError } = form;
  const [nums, setNums] = useState(baseNums);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  // const [currentCountry, setCurrentCountry] = useState({ cn: '中国', code: 'CN', en: 'China', mobileCode: '86' });
  const [currentCountry, setCurrentCountry] = useState();
  const { inviteCode } = location.query; //url邀请码
  const [forbidMailSuffix, setForbidMailSuffix] = useState([]);

  useEffect(() => {
    getForbidMailSuffix().then(result => {
      if (result?.code === 0) {
        setForbidMailSuffix(result.data);
      }
    });
    registerGeetestScenario(['REGISTER_PHONE', 'REGISTER_EMAIL']);
    validateFields();
  }, []);

  const afterCloseHandle = country => {
    if (country.code) {
      setCurrentCountry(country);
    }

    setCountrySelectOpen(false);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (type === 'mobile' && !currentCountry) {
      Toast.fail(formatMessage({ id: 'mc_common_country_select_please' }));
      return;
    }

    validateFields((err, values) => {
      if (!err) {
        const registerInfo = {
          ...values,
          type,
          country: type === 'mobile' ? currentCountry.mobileCode : undefined
        };

        dispatch({
          type: 'login/save',
          payload: {
            registerInfo
          }
        });

        sessionStorage.setItem('registerInfo', JSON.stringify(registerInfo));
        router.push('/auth/signup-password');
      }
    });
  };

  const getCaptcha = e => {
    validateFields([type], (err, values) => {
      if (!err) {
        if (type === 'mobile') {
          if (!currentCountry) {
            Toast.fail(formatMessage({ id: 'mc_common_country_select_please' }));
            return;
          }
          geetestCaptcha('REGISTER_PHONE', async data => {
            const params = {
              country: currentCountry.mobileCode,
              mobile: values.mobile,
              type: 'REGISTER',
              language: language === 'zh-CN' ? 'CN' : 'EN',
              ...data
            };
            const res = await sendUcenterSMSCode(params);
            if (res.code === 0) {
              Interval();
              Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
            }
          });
        } else if (type === 'email') {
          geetestCaptcha('REGISTER_EMAIL', async data => {
            const params = {
              email: values.email,
              type: 'REGISTER',
              language: language === 'zh-CN' ? 'CN' : 'EN',
              ...data
            };
            const res = await sendUcenterEmailCode(params);
            if (res.code === 0) {
              Interval();
              Toast.success(formatMessage({ id: 'auth.send.code.ok' }));
            }
          });
        }
      }
    });
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

  const mobileError = getFieldError('mobile');
  const emailError = getFieldError('email');
  const codeError = getFieldError('code');
  const rememberError = getFieldError('remember');

  return (
    <div className={styles.wrap}>
      {type === 'mobile' && (
        <div className={styles.item}>
          <div className={styles.main}>
            <div className={styles.inputWrap}>
              <InputItem
                {...getFieldProps('mobile', {
                  initialValue: registerInfo.mobile,
                  rules: [
                    { required: true, message: formatMessage({ id: 'auth.validate.phone.require' }) },
                    { pattern: mobileReg, message: formatMessage({ id: 'common.validate.auth.mobile.error' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'auth.validate.phone.require' })}
              >
                <Flex onClick={() => setCountrySelectOpen(true)} className={styles.country}>
                  {currentCountry ? <>+ {currentCountry.mobileCode}</> : formatMessage({ id: 'common.select' })}
                  <i className={classNames('iconfont', 'icondrop')}></i>
                </Flex>
                <CountrySelect businessType="REGISTER" open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />
              </InputItem>
            </div>
          </div>
          <p className={styles.error}>{mobileError && isFieldTouched('mobile') ? mobileError.join(',') : ''}</p>
        </div>
      )}
      {type === 'email' && (
        <div className={styles.item}>
          <div className={styles.main}>
            <div className={styles.inputWrap}>
              <InputItem
                {...getFieldProps('email', {
                  initialValue: registerInfo.email,
                  validateFirst: true,
                  rules: [
                    { required: true, message: formatMessage({ id: 'auth.validate.email.require' }) },
                    { pattern: emailReg, message: formatMessage({ id: 'auth.validate.email.reg' }) },
                    {
                      validator: (rule, value, callback) => {
                        if (value) {
                          const suffix = value.match(/@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/)[0];
                          if (forbidMailSuffix.includes(suffix.substring(1))) {
                            callback(formatMessage({ id: 'mc_auth_register_email_forbid_tip' }));
                          }
                        }
                        callback();
                      }
                    }
                  ]
                })}
                placeholder={formatMessage({ id: 'auth.validate.email.require' })}
              />
            </div>
          </div>
          <p className={styles.error}>{emailError && isFieldTouched('email') ? emailError.join(',') : ''}</p>
        </div>
      )}
      {type === 'email' ? (
        <div className={styles.item}>
          <div className={styles.main}>
            <div className={styles.inputWrap}>
              <InputItem
                {...getFieldProps('code', {
                  initialValue: registerInfo.code,
                  rules: [
                    { required: true, message: formatMessage({ id: 'common.validate.captcha.email.require' }) },
                    { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.email.error' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'common.validate.captcha.email.require' })}
              />
            </div>
            <div className={styles.extra}>
              {nums === baseNums ? (
                <Button type="primary" onClick={getCaptcha} disabled={emailError}>
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
      ) : (
        <div className={styles.item}>
          <div className={styles.main}>
            <div className={styles.inputWrap}>
              <InputItem
                {...getFieldProps('code', {
                  initialValue: registerInfo.code,
                  rules: [
                    { required: true, message: formatMessage({ id: 'common.validate.captcha.mobile.require' }) },
                    { pattern: codeCaptchaReg, message: formatMessage({ id: 'common.validate.captcha.mobile.error' }) }
                  ]
                })}
                placeholder={formatMessage({ id: 'common.validate.captcha.mobile.require' })}
              />
            </div>
            <div className={styles.extra}>
              {nums === baseNums ? (
                <Button type="primary" onClick={getCaptcha} disabled={mobileError}>
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
      <div className={styles.item}>
        <div className={styles.main}>
          <div className={styles.inputWrap}>
            <InputItem
              {...getFieldProps('recommender', {
                initialValue: registerInfo.recommender ? registerInfo.recommender : inviteCode || ''
              })}
              disabled={!!inviteCode}
              placeholder={formatMessage({ id: 'auth.register.inviter' })}
            ></InputItem>
          </div>
        </div>
      </div>
      <div className={styles.item}>
        <div className={styles.main}>
          <div className={styles.inputWrap}>
            <Checkbox
              {...getFieldProps('remember', {
                rules: [
                  {
                    required: true,
                    type: 'boolean',
                    transform: value => value || undefined,
                    message: formatMessage({ id: 'auth.signup.service_term.checked.require' })
                  }
                ]
              })}
              placeholder={formatMessage({ id: 'auth.register.inviter' })}
            >
              {formatMessage({ id: 'auth.agree' })}
              <a
                target="__blank"
                href={
                  language.startsWith('zh')
                    ? `${HC_PATH}/hc/zh-cn/articles/360031501631`
                    : `${HC_PATH}/hc/en-001/articles/360031146452-User-Agreement-and-Privacy-Policy`
                }
              >
                {formatMessage({ id: 'auth.signup.service_term.title' })}
              </a>
            </Checkbox>
          </div>
        </div>
        <p className={styles.error}>{rememberError && isFieldTouched('remember') ? rememberError.join(',') : ''}</p>
      </div>
      {type === 'email' ? (
        <Button type="primary" onClick={handleSubmit} disabled={emailError || codeError || rememberError}>
          {formatMessage({ id: 'common.next' })}
        </Button>
      ) : (
        <Button type="primary" onClick={handleSubmit} disabled={emailError || codeError || mobileError || rememberError}>
          {formatMessage({ id: 'common.next' })}
        </Button>
      )}
    </div>
  );
};

export default withRouter(connect(({ login }) => ({ ...login }))(createForm()(Form)));
