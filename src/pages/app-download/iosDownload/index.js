import { useEffect, useState } from 'react';
import styles from './index.less';
import { getAppUrl } from '@/services/api';
import { browserPlatform } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import router from 'umi/router';

import StickyBar from '@/components/StickyBar';
import logo from '@/assets/img/download/logo.png';
import img1 from '@/assets/img/download/ios-img-1.png';
import img1en from '@/assets/img/download/ios-img-1en.png';
import img2 from '@/assets/img/download/ios-img-2.png';
import img2en from '@/assets/img/download/ios-img-2en.png';
import android1 from '@/assets/img/download/android1.png';
import android1en from '@/assets/img/download/android1en.png';
import android2 from '@/assets/img/download/android2.png';
import android2en from '@/assets/img/download/android2en.png';
import android3 from '@/assets/img/download/android3.png';
import android3en from '@/assets/img/download/android3en.png';
import arrow from '@/assets/img/download/arrow.png';
const platform = browserPlatform();
const lang = getLocale();

const switchImg = (zh, en) => {
  return lang.startsWith('zh') ? zh : en;
};

const IosDownload = () => {
  const [config, setConfig] = useState([]);
  useEffect(() => {
    const getConfig = async () => {
      const res = await getAppUrl();
      const { code, data } = res;
      if (code === 0) {
        setConfig(
          (platform.isIOS ? data.ios.filter(item => item.type === 'company') : data.android)
            .filter(item => item.screen == 2 && item.show)
            .sort((a, b) => Number(a.sort) - Number(b.sort))
        );
      }
    };
    getConfig();
  }, []);
  const android = (
    <>
      <div className={styles.logo}>
        <img src={logo} alt="" />
        <h2>MEXC Pro App</h2>
        {config.length > 0 && config.map(item => <a href={item.url}>{lang.startsWith('zh') ? item.title_cn : item.title_en}</a>)}
      </div>
      <div className={`${styles.tutorial} ${styles.android}`}>
        <h2>{formatMessage({ id: 'download.title.how_download_ios' })}</h2>
        <p>{formatMessage({ id: 'download.title.android_title_1' })}</p>
        <div className={styles.androidArrow}>{formatMessage({ id: 'download.title.android_title_2' })}</div>
        <p>{formatMessage({ id: 'download.title.android_method_1' })}</p>

        <p className={styles.text}>1.{formatMessage({ id: 'download.title.android_1' })}</p>
        <img src={switchImg(android1, android1en)} alt="" />
        <p className={styles.text}>2.{formatMessage({ id: 'download.title.android_method_2' })}</p>
        <img src={switchImg(android2, android2en)} alt="" />
        <p className={styles.text}>3.{formatMessage({ id: 'download.title.android_method_3' })}</p>
        <img src={switchImg(android3, android3en)} alt="" />
        <p className={styles.text}>{formatMessage({ id: 'download.title.complete' })}</p>
      </div>
    </>
  );

  const ios = (
    <>
      <div className={styles.logo}>
        <img src={logo} alt="" />
        <h2>MEXC Pro App</h2>
      </div>
      <div className={styles.entBtn}>
        {config.length > 0 && config.map(item => <a href={item.url}>{lang.startsWith('zh') ? item.title_cn : item.title_en}</a>)}
      </div>
      <a id="ios_btn_3" className={styles.link}>
        <i className={`iconfont icontishi`}></i>
        {formatMessage({ id: 'download.title.super_version_tourtis' })}
      </a>
      <div className={styles.tutorial}>
        {/* <p>{formatMessage({ id: 'download.title.other_down' })}</p> */}

        <p>{formatMessage({ id: 'download.title.ios_1' })}</p>
        <div className={styles.guideLine}>
          <span>[{formatMessage({ id: 'common.set' })}]</span>
          <img src={arrow} alt="" />
          <span>[{formatMessage({ id: 'download.title.ios_3' })}]</span>
          <img src={arrow} alt="" />
          <span>[{formatMessage({ id: 'download.title.ios_4' })}]</span>
        </div>
        <img src={switchImg(img1, img1en)} alt="" />
        <p className={styles.text}>{formatMessage({ id: 'download.title.ios_5' })}</p>
        <img src={switchImg(img2, img2en)} alt="" />
        <p className={styles.text}>{formatMessage({ id: 'download.title.complete' })}</p>
      </div>
    </>
  );
  return (
    <div className={styles.download}>
      <StickyBar gotoPath={'/mobileApp/download'} transparent={true}></StickyBar>
      {platform.isIOS ? ios : android}
    </div>
  );
};

export default IosDownload;
