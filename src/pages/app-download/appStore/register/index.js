import { formatHTMLMessage, FormattedHTMLMessage } from 'umi-plugin-locale';
import cn from 'classnames';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import styles from '../index.less';
import account from '@/assets/img/download/account.png';
import account1 from '@/assets/img/download/account-1.png';
import account2 from '@/assets/img/download/account-2.png';
import account3 from '@/assets/img/download/account-3.png';
import account4 from '@/assets/img/download/account-4.png';
import appStoreIcon from '@/assets/img/download/appstore-icon.png';

const Register = () => {
  return (
    <div>
      <TopBar gotoPath={'/mobileApp/appStore'}>{formatHTMLMessage({ id: 'mc_download_appstore' })}</TopBar>
      <div className={cn(styles.wrapper, styles.mountain)}>
        <div className={styles.logo}>
          <h2>{formatHTMLMessage({ id: 'mc_download_register' })}</h2>
          <p>{formatHTMLMessage({ id: 'mc_download_register_desc' })}</p>
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_1'} />
          </h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_1_text_1'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_1_text_2'} />
          </p>
          <p>{formatHTMLMessage({ id: 'mc_download_register_step_1_text_3' })}</p>
          <img src={account} alt="" />
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_1_text_4'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_1_text_5'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_1_text_6'} />
          </p>
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_2_text_1'} />
          </h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_2_text_2'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_2_text_3'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_2_text_4'} />
          </p>
          <img src={account1} alt="" />
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_3_text_1'} />
          </h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_3_text_2'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_3_text_3'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_3_text_4'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_3_text_5'} />
          </p>
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_4_text_1'} />
          </h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_4_text_2'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_4_text_3'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_4_text_4'} />
          </p>
          <img src={account2} alt="" />
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_5_text_1'} />
          </h3>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_5_text_2'} />
          </p>
          <p>
            <FormattedHTMLMessage id={'mc_download_register_step_5_text_3'} />
          </p>
          <img src={account3} alt="" />
        </div>
        <div className={styles.block}>
          <h3>
            <FormattedHTMLMessage id={'mc_download_register_step_6_text_1'} />
          </h3>
          <p>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_2' })}</p>
          <p>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_3' })}</p>
          <p>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_4' })}</p>
          <p>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_5' })}</p>
          <img src={account4} alt="" />
          <span className={styles.tip}>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_6' })}</span>
          <span className={styles.tip}>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_7' })}</span>
          <span className={styles.tip}>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_8' })}</span>
          <span className={styles.tip}>{formatHTMLMessage({ id: 'mc_download_register_step_6_text_9' })}</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
