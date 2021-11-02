import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import router from 'umi/router';
import { Button, InputItem, Toast } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import classNames from 'classnames';
import md5 from 'js-md5';
import { userRegister } from '@/services/api';
import { passwordReg } from '@/utils/regExp';
import TopBar from '@/components/TopBar';
import PasswordLevel from '@/components/PasswordLevel';
import styles from './index.less';

const language = getLocale();

const RegisterPassword = ({ form, registerInfo }) => {
  const { getFieldProps, validateFields, isFieldTouched, getFieldError, getFieldValue } = form;
  const [pwdVisible, setPwdVisible] = useState(false);
  const [confirmPwdVisible, setConfirmPwdVisible] = useState(false);
  const _local = sessionStorage.getItem('registerInfo') ? JSON.parse(sessionStorage.getItem('registerInfo')) : {};
  const { email, recommender, remember, mobile, code, country, type } = Object.keys(_local).length ? _local : registerInfo;

  useEffect(() => {
    validateFields();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();

    validateFields(async (err, values) => {
      if (!err) {
        let params = {
          email,
          inviteCode: recommender,
          remember,
          hexPassword: md5(values.password)
        };

        if (type === 'mobile') {
          params.mobile = mobile;
          params.smsCode = code;
          params.country = country;
        } else if (type === 'email') {
          params.emailCode = code;
        }

        const res = await userRegister(params);
        if (res.code === 0) {
          toSignin();
          sessionStorage.removeItem('registerInfo');
        }
      }
    });
  };

  const toSignin = () => {
    Toast.success(formatMessage({ id: 'auth.register.ok' }), 1.5, () => {
      router.push('/auth/signin');
    });
  };

  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== getFieldValue('password')) {
      callback(formatMessage({ id: 'common.validate.pwd.no_match' }));
    } else {
      callback();
    }
  };

  const validateToNextPassword = (rule, value, callback) => {
    if (value) {
      validateFields(['password2'], { force: true });
    }
    callback();
  };

  const passwordError = getFieldError('password');
  const password2Error = getFieldError('password2');

  return (
    <>
      <TopBar gotoPath={'/auth/signup'}>{formatMessage({ id: 'auth.set.password' })}</TopBar>
      <div className={styles.wrap}>
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('password', {
              validateFirst: true,
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
                { validator: validateToNextPassword }
              ]
            })}
            extra={
              <i
                className={classNames('iconfont', [pwdVisible ? 'iconkejian' : 'iconbukejian'])}
                onClick={() => setPwdVisible(!pwdVisible)}
              />
            }
            placeholder={formatMessage({ id: 'auth.password' })}
            type={pwdVisible ? 'text' : 'password'}
          />
          {isFieldTouched('password') && <PasswordLevel value={getFieldValue('password')} />}
          <p className={styles.error}>{passwordError && isFieldTouched('password') ? passwordError.join(',') : ''}</p>
        </div>
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('password2', {
              rules: [
                { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
                { validator: compareToFirstPassword }
              ]
            })}
            extra={
              <i
                className={classNames('iconfont', [confirmPwdVisible ? 'iconkejian' : 'iconbukejian'])}
                onClick={() => setConfirmPwdVisible(!confirmPwdVisible)}
              />
            }
            placeholder={formatMessage({ id: 'auth.confirm.password' })}
            type={confirmPwdVisible ? 'text' : 'password'}
          />
          <p className={styles.error}>{password2Error && isFieldTouched('password') ? password2Error.join(',') : ''}</p>
        </div>
        <Button type="primary" onClick={handleSubmit} disabled={passwordError || password2Error}>
          {formatMessage({ id: 'auth.signUp' })}
        </Button>
      </div>
    </>
  );
};

export default connect(({ login }) => ({ ...login }))(createForm()(RegisterPassword));
