import { useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import classNames from 'classnames';
import { Modal } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import Form from './Form';
import langMap from '@/utils/lang';
import SettinigLanguage from '@/pages/ucenter/setting-language';
import styles from './index.less';

const lang = getLocale();

const Register = ({ theme }) => {
  const [tabKey, setTabKey] = useState(window.localStorage.getItem('loginTabKey') || 'email');
  const [openLanguage, setOpenLanguage] = useState(false);

  const onChangeTab = tabKey => {
    window.localStorage.setItem('loginTabKey', tabKey);

    setTabKey(tabKey);
  };

  const switchLanguage = e => {
    setOpenLanguage(!openLanguage);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.language}>
        <i className="iconfont iconyuyanx"></i>
        <span onClick={switchLanguage}>{langMap[lang].label}</span>
      </div>
      <div className={styles.head}>
        <h1>{formatMessage({ id: 'auth.register.title' })}</h1>
        <p>{formatMessage({ id: 'auth.register.slogan' })}</p>
      </div>
      <div className={styles.tabs}>
        <div className={classNames(styles.bar, { [styles.active]: tabKey === 'email' })} onClick={() => onChangeTab('email')}>
          {formatMessage({ id: 'auth.register.email' })}
        </div>
        <div className={classNames(styles.bar, { [styles.active]: tabKey === 'mobile' })} onClick={() => onChangeTab('mobile')}>
          {formatMessage({ id: 'auth.register.mobile' })}
        </div>
      </div>
      {tabKey === 'email' && <Form type={tabKey} />}
      {tabKey === 'mobile' && <Form type={tabKey} />}
      <div className={styles.footer}>
        {formatMessage({ id: 'auth.register.has_account' })}
        <Link to="/auth/signin">{formatMessage({ id: 'auth.to.signIn' })}</Link>
      </div>
      <Modal className="am-modal-popup-slide-left" transitionName="am-slide-left" popup visible={openLanguage} onClose={switchLanguage}>
        <SettinigLanguage />
      </Modal>
    </div>
  );
};

export default connect(({ setting }) => ({
  theme: setting.theme
}))(Register);
