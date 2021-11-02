import React, { useEffect, useState } from 'react';
import { browserPlatform } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import StickyBar from '@/components/StickyBar';
import { getAppUrl } from '@/services/api';
import router from 'umi/router';
import cn from 'classnames';

import styles from './index.less';

import logo from '@/assets/img/download/logo.png';
import info21 from '@/assets/img/download/info-2-1.png';
import info22 from '@/assets/img/download/info-2-2.png';
import info23 from '@/assets/img/download/info-2-3.png';
import bottomLogo from '@/assets/img/logo-main-dark.png';

const platform = browserPlatform();
const lang = getLocale();
const APPDownload = () => {
  const [config, setConfig] = useState([]);
  useEffect(() => {
    const getConfig = async () => {
      const res = await getAppUrl();
      const { code, data } = res;
      if (code === 0) {
        setConfig(
          (platform.isIOS ? data.ios : data.android)
            .filter(item => item.screen == 1 && item.show)
            .sort((a, b) => Number(a.sort) - Number(b.sort))
        );
      }
    };
    getConfig();
  }, []);

  const AppInfo = (
    <div className={cn(styles.appInfo, lang.startsWith('zh') ? styles.cn : styles.en)}>
      <div className={`${styles.info} ${styles.info1}`}>
        <div className={styles.info1Box}>
          <img src={logo} alt="" />
          <h2>{formatMessage({ id: 'home.title.mxc_slogen' })}</h2>
          <div className={styles.slogen}>
            <h3>{formatMessage({ id: 'download.title.slogen-1' })}</h3>
            <b></b>
            <h3>{formatMessage({ id: 'download.title.slogen-2' })}</h3>
            <b></b>
            <h3>{formatMessage({ id: 'download.title.slogen-3' })}</h3>
          </div>
        </div>
      </div>
      <div className={`${styles.info} ${styles.info2}`}>
        <div className={styles.info2Box}>
          <h3>{formatMessage({ id: 'home.title.mxc_desc_info_title' })}</h3>
          <p className={styles.textarea}>{formatMessage({ id: 'home.title.mxc_desc_info_1' })}</p>
          <div>
            <img src={info21} alt="" />
            <h3>{formatMessage({ id: 'home.title.mxc_desc_info_item_1' })}</h3>
            <p>{formatMessage({ id: 'home.title.mxc_desc_info_item_1_text' })}</p>
          </div>
          <div>
            <img src={info22} alt="" />
            <h3>{formatMessage({ id: 'home.title.mxc_desc_info_item_2' })}</h3>
            <p>{formatMessage({ id: 'home.title.mxc_desc_info_item_2_text' })}</p>
          </div>
          <div>
            <img src={info23} alt="" />
            <h3>{formatMessage({ id: 'home.title.mxc_desc_info_item_3' })}</h3>
            <p>{formatMessage({ id: 'home.title.mxc_desc_info_item_3_text' })}</p>
          </div>
        </div>
      </div>
      <div className={cn(styles.info, styles.info3, styles[lang])} style={{ paddingTop: lang.startsWith('zh') ? '35px' : '0' }}>
        <div className={styles.info3Box}>
          <h3>{formatMessage({ id: 'download.title.global' })}</h3>
          <p className={styles.textarea}>{formatMessage({ id: 'download.title.global_text' })}</p>
        </div>
      </div>
      <div className={cn(styles.info, styles.info4, styles[lang])}>
        <div className={styles.info4Box}>
          <h3>{formatMessage({ id: 'download.title.fiat' })}</h3>
          <p className={styles.textarea}>{formatMessage({ id: 'download.title.fiat_text' })}</p>
        </div>
      </div>
      <div className={cn(styles.info, styles.info5, styles[lang])}>
        <div className={styles.info4Box}>
          <h3>{formatMessage({ id: 'download.title.ex' })}</h3>
          <p className={styles.textarea}>{formatMessage({ id: 'download.title.ex_text' })}</p>
        </div>
      </div>
      <div className={`${styles.info6}`}>
        <img src={bottomLogo} alt="" />
        <p>© 2021 MEXC Global Ltd.</p>
      </div>
    </div>
  );

  return (
    <>
      <StickyBar gotoPath={'/home'} transparent={true}></StickyBar>
      <div className={styles.downloadPage}>
        {AppInfo}
        <div className={styles.downloadBtn}>
          <div className={styles.downloadBtns}>
            {config.map(item => {
              if (Number(item.url_type) === 1) {
                return (
                  <a rel="noopener noreferrer" className={styles.btn2} target="_blank" href={item.url}>
                    <span>{lang.startsWith('zh') ? item.title_cn : item.title_en}</span>
                  </a>
                );
              } else {
                return (
                  <a rel="noopener noreferrer" className={styles.btn2} onClick={() => router.push(item.url)}>
                    <span>{lang.startsWith('zh') ? item.title_cn : item.title_en}</span>
                  </a>
                );
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default APPDownload;
