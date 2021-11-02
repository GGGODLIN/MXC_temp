import { useEffect } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import cn from 'classnames';
import { connect } from 'dva';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import styles from '../index.less';
import mexc from '@/assets/img/download/mexc.png';
import appStoreIcon from '@/assets/img/download/appstore-icon.png';

const Accounts = ({ dispatch, appUrl }) => {
  useEffect(() => {
    dispatch({ type: 'global/getAppUrl' });
  }, []);
  return (
    <div>
      <TopBar gotoPath={'/mobileApp/appStore'}>{formatMessage({ id: 'mc_download_appstore' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <img src={mexc} alt="" />
          <h2>{formatMessage({ id: 'mc_download_accounts_title' })}</h2>
          <p>{formatMessage({ id: 'mc_download_appstore_title_desc' })}</p>
        </div>
        <div className={styles.block}>
          <h3>{formatMessage({ id: 'mc_download_accounts_step_1' })}</h3>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: a08lc0ivig@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: adpwk5bf5f@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: abm75a99pk@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: abg7frg0ao@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: arzlxhh4nd@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: ai1g5p6tzf@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: aai2eybulk@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: anqrrf3npy@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: a02bjp1eee@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: a72qn2iexr@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: awwje1sh3m@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: af8g0cgtfo@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: a4maff31bu@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: anhifzyic4@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: azu0yj62fq@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: alvnrf9ane@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: abefvrpnqi@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: agfuq4wv20@icloud.com</p>
          <p>{formatMessage({ id: 'otcfiat.order.account' })}: ajgikzacy9@icloud.com</p>
          <h3>{formatMessage({ id: 'mc_download_accounts_step_3' })}: Mxcapple1024</h3>
          <span className={cn(styles.tip, styles.divider)}>{formatMessage({ id: 'mc_download_accounts_step_4' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_5' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_6' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_7' })}</span>
          <span className={cn(styles.tip, styles.mt30)}>{formatMessage({ id: 'mc_download_accounts_step_8' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_9' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_10' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_11' })}</span>
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_accounts_step_12' })}</span>
          <span className={cn(styles.tip, styles.mb30)}>{formatMessage({ id: 'mc_download_accounts_step_13' })}</span>
        </div>
        <div className={styles.fixedWrapper}>
          <a id="ios_btn_1" href={appUrl.ios.ios1} className={styles.btnBlock}>
            <img src={appStoreIcon} alt="" />
            {formatMessage({ id: 'mc_download_appstore_btn' })}
          </a>
        </div>
      </div>
    </div>
  );
};

export default connect(({ global }) => ({
  appUrl: global.appUrl
}))(Accounts);
