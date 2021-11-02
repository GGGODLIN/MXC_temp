import { useReducer, useEffect } from 'react';
import router from 'umi/router';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { Toast, InputItem, WhiteSpace, WingBlank, Button } from 'antd-mobile';
import { passwordReg } from '@/utils/regExp';
import classNames from 'classnames';
import PasswordLevel from '@/components/PasswordLevel';

import styles from './index.less';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import md5 from 'js-md5';
import { resetPassword } from '@/services/api';

const initialState = { dirty: false, second: null, pwdVisible: false };
const language = getLocale();

function reducer(state, action) {
  return { ...state, ...action };
}
const ForgetPasswordReset = ({ form, location }) => {
  const { getFieldProps, validateFields, getFieldValue, getFieldError, isFieldTouched } = form;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    validateFields();
  }, []);

  useEffect(() => {
    dispatch({
      second: location.state
    });
  }, [location]);

  const checkAccount = () => {
    validateFields(async (error, values) => {
      if (!error) {
        const params = {
          newPwd: md5(values.regPassword),
          resetPwdToken: state.second
        };

        const res = await resetPassword(params);
        if (res.code === 0) {
          Toast.success(formatMessage({ id: 'auth.reset.password.success' }), 1, () => {
            router.push('/auth/signin');
          });
        }
      }
    });
  };

  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== getFieldValue('regPassword')) {
      callback(formatMessage({ id: 'common.validate.pwd.no_match' }));
    } else {
      callback();
    }
  };

  const validateToNextPassword = (rule, value, callback) => {
    if (value && state.dirty) {
      validateFields(['regPassword2'], { force: true });
    }
    callback();
  };

  const regPasswordError = getFieldError('regPassword');
  const regPassword2Error = getFieldError('regPassword2');

  return (
    <div>
      <TopBar>{formatMessage({ id: 'auth.forgetPwd' })}</TopBar>
      <WingBlank style={{ marginTop: 30 }}>
        <InputItem
          className="am-search-input"
          type={state.pwdVisible ? 'text' : 'password'}
          {...getFieldProps('regPassword', {
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
              className={classNames('iconfont', [state.pwdVisible ? 'iconkejian' : 'iconbukejian'])}
              onClick={() => dispatch({ pwdVisible: !state.pwdVisible })}
            />
          }
          placeholder={formatMessage({ id: 'common.validate.pwd.require' })}
          clear
        />
        {isFieldTouched('regPassword') && <PasswordLevel value={getFieldValue('regPassword')} />}
        <p className={styles.error}>{regPasswordError && isFieldTouched('regPassword') ? regPasswordError.join(',') : ''}</p>
        <WhiteSpace size="lg" />
        <InputItem
          className="am-search-input"
          type={state.pwdVisible ? 'text' : 'password'}
          {...getFieldProps('regPassword2', {
            rules: [
              { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
              { validator: compareToFirstPassword }
            ]
          })}
          extra={
            <i
              className={classNames('iconfont', [state.pwdVisible ? 'iconkejian' : 'iconbukejian'])}
              onClick={() => dispatch({ pwdVisible: !state.pwdVisible })}
            />
          }
          placeholder={formatMessage({ id: 'auth.confirm.password' })}
          clear
        />
        <p className={styles.error}>{regPassword2Error && isFieldTouched('regPassword2') ? regPassword2Error.join(',') : ''}</p>
        <WhiteSpace />
        <Button type="primary" onClick={() => checkAccount()} style={{ marginTop: 30 }} disabled={regPasswordError || regPassword2Error}>
          {formatMessage({ id: 'common.yes' })}
        </Button>
      </WingBlank>
    </div>
  );
};

export default createForm()(ForgetPasswordReset);
