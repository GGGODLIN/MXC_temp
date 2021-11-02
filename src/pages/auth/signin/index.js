import { useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import Form from './Form';
import styles from './index.less';

import LogoDark from '@/assets/img/auth/logo_dark@2x.png';
import LogoLight from '@/assets/img/auth/logo_light@2x.png';

const Login = ({ theme, location }) => {
  const [tabKey, setTabKey] = useState(window.localStorage.getItem('loginTabKey') || 'email');

  const onChangeTab = tabKey => {
    window.localStorage.setItem('loginTabKey', tabKey);

    setTabKey(tabKey);
  };

  const cancel = e => {
    router.push('/');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.cancel}>
        <span onClick={cancel}>{formatMessage({ id: 'common.cancel' })}</span>
      </div>
      <div className={styles.logo} onClick={cancel}>
        {theme === 'dark' ? <img src={LogoDark} alt="" /> : <img src={LogoLight} alt="" />}
      </div>
      <div className={styles.tabs}>
        <div className={classNames(styles.bar, { [styles.active]: tabKey === 'email' })} onClick={() => onChangeTab('email')}>
          {formatMessage({ id: 'auth.login.email' })}
        </div>
        <div className={classNames(styles.bar, { [styles.active]: tabKey === 'mobile' })} onClick={() => onChangeTab('mobile')}>
          {formatMessage({ id: 'auth.login.phone' })}
        </div>
      </div>
      {tabKey === 'email' && <Form type={tabKey} />}
      {tabKey === 'mobile' && <Form type={tabKey} />}
      <div className={styles.footer}>
        <Link to="/auth/forget-password" className={styles.forget}>
          {formatMessage({ id: 'auth.forgetPwd' })}
        </Link>
        <p>
          {formatMessage({ id: 'auth.not.register' })}
          <Link to="/auth/signup">{formatMessage({ id: 'auth.signUpForNew' })}</Link>
        </p>
      </div>
    </div>
  );
};

export default connect(({ setting }) => ({
  theme: setting.theme
}))(Login);
