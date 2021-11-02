import React, { useEffect } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { Toast, InputItem, WhiteSpace, WingBlank, Button } from 'antd-mobile';
import { geetestCaptcha, registerGeetestScenario } from '@/utils/captcha';
import { resetPasswordCheck } from '@/services/api';
import styles from './index.less';

import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';

const ForgetPassword = ({ form }) => {
  const { getFieldProps, validateFields, getFieldError, isFieldTouched } = form;

  useEffect(() => {
    validateFields();
    registerGeetestScenario(['FORGET_PASSWORD']);
  }, []);

  const checkAccount = () => {
    validateFields((error, values) => {
      if (!error) {
        geetestCaptcha('FORGET_PASSWORD', async data => {
          values.type = 'FORGET_PASSWORD';
          const params = {
            ...values,
            ...data
          };

          const res = await resetPasswordCheck(params);

          if (res.code === 0) {
            router.push({
              pathname: '/auth/forget-password-2nd',
              state: {
                ...res.data
              }
            });
          }
        });
      }
    });
    // router.push('/auth/forget-password-2nd');
  };

  const accountError = getFieldError('account');

  return (
    <div>
      <TopBar>{formatMessage({ id: 'auth.forgetPwd' })}</TopBar>
      <WingBlank style={{ marginTop: 30 }}>
        <InputItem
          className="am-search-input"
          type="text"
          {...getFieldProps('account', {
            rules: [
              { required: true, message: formatMessage({ id: 'mc_auth_reset_pwd_account_placeholder' }) },
              {
                pattern: /^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$|^\d{4,18}$/,
                message: formatMessage({ id: 'mc_auth_reset_pwd_account_error' })
              }
            ]
          })}
          placeholder={formatMessage({ id: 'mc_auth_reset_pwd_account_placeholder' })}
          clear
        ></InputItem>
        <p className={styles.error}>{accountError && isFieldTouched('account') ? accountError.join(',') : ''}</p>
        <WhiteSpace />
        <Button type="primary" onClick={() => checkAccount()} style={{ marginTop: 30 }} disabled={accountError}>
          {formatMessage({ id: 'common.yes' })}
        </Button>
      </WingBlank>
    </div>
  );
};

export default createForm()(ForgetPassword);
