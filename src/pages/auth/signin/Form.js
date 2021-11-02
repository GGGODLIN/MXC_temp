import { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { Button, InputItem, Flex, Toast } from 'antd-mobile';
import { passwordReg, emailReg, mobileReg } from '@/utils/regExp';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { registerGeetestScenario } from '@/utils/captcha';
import md5 from 'js-md5';
import router from 'umi/router';
import { geetestCaptcha } from '@/utils/captcha';
import { userLogin } from '@/services/api';
import classNames from 'classnames';
import CountrySelect from '@/components/CountrySelect';
import styles from './Form.less';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

const language = getLocale();

const Form = ({ form, type, dispatch }) => {
  const { getFieldProps, validateFields, isFieldTouched, getFieldError } = form;
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  // const [currentCountry, setCurrentCountry] = useState({ cn: '中国', code: 'CN', en: 'China', mobileCode: '86' });
  const [currentCountry, setCurrentCountry] = useState();
  const [pwdVisible, setPwdVisible] = useState(false);

  useEffect(() => {
    registerGeetestScenario(['LOGIN']);
    validateFields();
  }, []);

  const afterCloseHandle = country => {
    if (country.code) {
      setCurrentCountry(country);
    }

    setCountrySelectOpen(false);
  };

  const fingerprintRemain = useRef(2);
  // 获取设备指纹
  const getFingerprint = () => {
    if (fingerprintRemain.current > 0) {
      fingerprintRemain.current--;
      FingerprintJS.load({ token: MXC_DEPLOY === 'prod' ? 'CM35GvBhGxNX5vPGwAA3' : 'XfbDJBGpwAHbO32mr2Io' })
        .then(fp => fp.get({ extendedResult: true }))
        .then(result => {
          if (result) {
            dispatch({
              type: 'login/save',
              payload: {
                fingerprint: result
              }
            });
            fingerprintRemain.current = 2;
          } else {
            getFingerprint();
          }
        });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (type === 'mobile' && !currentCountry) {
      Toast.fail(formatMessage({ id: 'mc_common_country_select_please' }));
      return;
    }

    validateFields((err, values) => {
      if (!err) {
        // 输入账号密码后，点击登录时上报设备指纹
        getFingerprint();
        // const lang = getLocale();
        geetestCaptcha('LOGIN', data => {
          let params = {
            account: values.account,
            password: md5(values.password),
            language: language === 'zh-CN' ? 'CN' : 'EN',
            via: 'h5',
            ...data
          };

          if (type === 'mobile') {
            params.country = currentCountry.mobileCode;
          }

          signin(params);
        });
      }
    });
  };

  const signin = async params => {
    const res = await userLogin(params);

    if (res.code === 0) {
      dispatch({
        type: 'login/save',
        payload: {
          loginInfo: res.data
        }
      });

      sessionStorage.setItem('loginInfo', JSON.stringify(res.data));
      router.push(`/auth/signin-2nd${window.location.search}`);
    }
  };

  const accountError = getFieldError('account');
  const passwordError = getFieldError('password');

  return (
    <div className={styles.wrap}>
      {type === 'email' ? (
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('account', {
              rules: [
                { required: true, message: formatMessage({ id: 'auth.validate.email.require' }) },
                { pattern: emailReg, message: formatMessage({ id: 'auth.validate.email.reg' }) }
              ]
            })}
            extra={<i className="iconfont iconic_email" style={{ fontSize: 12 }}></i>}
            placeholder={formatMessage({ id: 'auth.validate.email.require' })}
          ></InputItem>
          <p className={styles.error}>{accountError && isFieldTouched('account') ? accountError.join(',') : ''}</p>
        </div>
      ) : (
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('account', {
              rules: [
                { required: true, message: formatMessage({ id: 'auth.validate.phone.require' }) },
                { pattern: mobileReg, message: formatMessage({ id: 'common.validate.auth.mobile.error' }) }
              ]
            })}
            extra={<i className="iconfont iconic_account" style={{ fontSize: 12 }}></i>}
            type="tel"
            placeholder={formatMessage({ id: 'auth.validate.phone.require' })}
          >
            <Flex onClick={() => setCountrySelectOpen(true)} className={styles.country}>
              {currentCountry ? <>+ {currentCountry.mobileCode}</> : formatMessage({ id: 'common.select' })}
              <i className={classNames('iconfont', 'icondrop')}></i>
            </Flex>
            <CountrySelect businessType="LOGIN" open={countrySelectOpen} afterCloseHandle={afterCloseHandle} />
          </InputItem>
          <p className={styles.error}>{accountError && isFieldTouched('account') ? accountError.join(',') : ''}</p>
        </div>
      )}
      <div className={styles.item}>
        <InputItem
          {...getFieldProps('password', {
            rules: [{ required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) }]
          })}
          extra={
            <i
              className={classNames('iconfont', [pwdVisible ? 'iconkejian' : 'iconbukejian'])}
              onClick={() => setPwdVisible(!pwdVisible)}
            ></i>
          }
          placeholder={formatMessage({ id: 'auth.password' })}
          type={pwdVisible ? 'text' : 'password'}
        ></InputItem>
        <p className={styles.error}>{passwordError && isFieldTouched('password') ? passwordError.join(',') : ''}</p>
      </div>
      <Button type="primary" onClick={handleSubmit} disabled={accountError || passwordError}>
        {formatMessage({ id: 'auth.signIn' })}
      </Button>
    </div>
  );
};

export default connect(({ login }) => ({ ...login }))(createForm()(Form));
