import { useEffect, useState } from 'react';
import styles from './index.less';
import { getAppUrl } from '@/services/api';
import { formatMessage, getLocale } from 'umi-plugin-locale';

import StickyBar from '@/components/StickyBar';
import Logo from '@/assets/img/download/logo.png';
import testFlightLogo from '@/assets/img/download/testflightLog.png';
import testFlight1 from '@/assets/img/download/testFlight1.png';
import testFlight2 from '@/assets/img/download/testFlight2.png';
import testFlight3 from '@/assets/img/download/testFlight3.png';
import wifi from '@/assets/img/download/wifi.png';

const lang = getLocale();

const TestFlight = ({ dispatch, appUrl }) => {
  const [config, setConfig] = useState([]);
  const [ShowModal, setShowModal] = useState(false);
  useEffect(() => {
    const getConfig = async () => {
      const res = await getAppUrl();
      const { code, data } = res;
      if (code === 0) {
        setConfig(
          data.ios
            .filter(item => item.type === 'testflight')
            .filter(item => item.screen == 2 && item.show)
            .sort((a, b) => Number(a.sort) - Number(b.sort))
        );
      }
    };
    getConfig();
  }, []);

  return (
    <div className={styles.download}>
      <StickyBar gotoPath={'/mobileApp/download'} transparent={true}></StickyBar>
      <div className={styles.container}>
        <h2>{formatMessage({ id: 'download.title.testflight.head' })}</h2>
        <div>
          <img className={styles.smallLogo} src={testFlightLogo} alt="MEXC交易所" />
          <h3>{formatMessage({ id: 'download.title.testflight.step_1' })}</h3>
          <p>{formatMessage({ id: 'download.title.testflight.step_1_desc' })}</p>
          <a href="https://apps.apple.com/cn/app/testflight/id899247664" className={styles.primaryBtn}>
            {formatMessage({ id: 'download.title.testflight.step_1_btn' })}
          </a>
        </div>
        <div className={styles.flexBetween}>
          {formatMessage({ id: 'download.title.testflight.step_2' })}
          <a className={styles.ghostBtn} onClick={() => setShowModal(true)}>
            {formatMessage({ id: 'download.title.testflight.step_2_btn' })}
          </a>
        </div>
        <div>
          <img className={styles.smallLogo} src={Logo} alt="MEXC交易所" />
          <h3>{formatMessage({ id: 'download.title.testflight.step_3' })}</h3>
          <p>{formatMessage({ id: 'download.title.testflight.step_3_desc_1' })}</p>
          <p>{formatMessage({ id: 'download.title.testflight.step_3_desc_2' })}</p>
          {config.map(item => (
            <a href={item.url} className={styles.primaryBtn}>
              {lang.startsWith('zh') ? item.title_cn : item.title_en}
            </a>
          ))}
        </div>
        <div>
          <div className={styles.step3Logo}>
            <img className={styles.bigLogo} src={Logo} alt="MEXC交易所" />
            <div>
              <p>MEXC Pro</p>
              <span className={styles.btn}>{formatMessage({ id: 'download.title.testflight.step_4_btn' })}</span>
            </div>
          </div>
          <h3>{formatMessage({ id: 'download.title.testflight.step_4' })}</h3>
          <p style={{ textAlign: 'center' }}>{formatMessage({ id: 'download.title.testflight.step_4_desc' })}</p>
        </div>
        <p style={{ color: '#fff' }}>{formatMessage({ id: 'download.title.testflight.step_5' })}</p>
      </div>
      {ShowModal && (
        <div className={styles.helpModal}>
          <div className={styles.helpContent}>
            <i onClick={() => setShowModal(false)} className={`iconfont iconquxiao1 ${styles.cancel}`}></i>
            <div className={styles.wifi}>
              <img src={wifi} alt="MEXC交易所" />
              <span>{formatMessage({ id: 'download.title.wifi_tip' })}</span>
            </div>
            <p style={{ width: '50%' }}>{formatMessage({ id: 'download.title.testflight.help_1' })}</p>
            <img src={testFlight1} alt="MEXC交易所" />
            <p>{formatMessage({ id: 'download.title.testflight.help_2' })}</p>
            <img src={testFlight2} alt="MEXC交易所" />
            <p style={{ width: '80%' }}>{formatMessage({ id: 'download.title.testflight.help_3' })}</p>
            <img src={testFlight3} alt="MEXC交易所" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestFlight;
