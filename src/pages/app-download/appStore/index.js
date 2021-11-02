import { useEffect } from 'react';
import { formatMessage, FormattedHTMLMessage } from 'umi-plugin-locale';
import { connect } from 'dva';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import mexc from '@/assets/img/download/mexc.png';
import appStore from '@/assets/img/download/appstore.png';
import appStore1 from '@/assets/img/download/appstore-1.png';
import appStore2 from '@/assets/img/download/appstore-2.png';
import appStore3 from '@/assets/img/download/appstore-3.png';
import appStore4 from '@/assets/img/download/appstore-4.png';
import appStoreIcon from '@/assets/img/download/appstore-icon.png';

const AppStore = ({ dispatch, appUrl }) => {
  useEffect(() => {
    dispatch({ type: 'global/getAppUrl' });
  }, []);
  return (
    <div>
      <TopBar gotoPath={'/mobileApp/download'}>{formatMessage({ id: 'mc_download_appstore' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <img src={mexc} alt="" />
          <h2>{formatMessage({ id: 'mc_download_appstore_title' })}</h2>
          <p>{formatMessage({ id: 'mc_download_appstore_title_desc' })}</p>
        </div>
        <div className={styles.block}>
          <h3>{formatMessage({ id: 'mc_download_appstore_step_1' })}</h3>
          <p>{formatMessage({ id: 'mc_download_appstore_step_1_text_1' })}</p>
          <div className={styles.btnWrapper}>
            {formatMessage({ id: 'mc_download_appstore_step_1_text_2' })}
            <span className={styles.check} onClick={() => router.push('/mobileApp/appStore/accounts')}>
              {formatMessage({ id: 'ucenter.api.notice.2.2' })}
            </span>
          </div>
          <div className={styles.btnWrapper}>
            {formatMessage({ id: 'mc_download_appstore_step_1_text_3' })}
            <span className={styles.register} onClick={() => router.push('/mobileApp/appStore/register')}>
              {formatMessage({ id: 'mc_download_appstore_step_1_btn_2' })}
            </span>
          </div>
        </div>
        <div className={styles.block}>
          <h3>{formatMessage({ id: 'mc_download_appstore_step_2' })}</h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_appstore_step_2_text_1'} />
          </p>
          <img src={appStore} alt="" />
          <p>{formatMessage({ id: 'mc_download_appstore_step_2_text_2' })}</p>
          <img src={appStore1} alt="" />
          <img src={appStore2} alt="" />
          <span className={styles.tip}>{formatMessage({ id: 'mc_download_appstore_step_2_text_3' })}</span>
        </div>
        <div className={styles.block}>
          <h3>{formatMessage({ id: 'mc_download_appstore_step_3' })}</h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_appstore_step_3_text_1'} />
          </p>
          <img src={appStore3} alt="" />
          <p>{formatMessage({ id: 'mc_download_appstore_step_3_text_2' })}</p>
          <img src={appStore4} alt="" />
        </div>
        <div className={styles.fixedWrapper}>
          {appUrl && (
            <a className={styles.btnBlock} id="ios_btn_1" href={appUrl.ios.ios1}>
              <img src={appStoreIcon} alt="" />
              {formatMessage({ id: 'mc_download_appstore_btn' })}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(({ global }) => ({
  appUrl: global.appUrl
}))(AppStore);
