import React, { useEffect } from 'react';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getServerTime } from '@/services/api';

import updatingEn from '@/assets/img/maintain/arrow_en.png';
import updatingCn from '@/assets/img/maintain/arrow_cn.png';

import styles from './index.less';

const lang = getLocale();
let timer;

export default ({ location }) => {
  // console.log('url ', location.query, decodeURIComponent(location.query.announcement));
  const url = decodeURIComponent(location.query.announcement);
  const redirect = decodeURIComponent(location.query.redirect);
  const updating = lang.indexOf('zh') >= 0 ? updatingCn : updatingEn;

  useEffect(() => {
    if (MXC_DEPLOY === 'prod') {
      timer = setInterval(() => {
        getServerTime().then(res => {
          if (res.code === 0) {
            clearInterval(timer);
            window.location.href = location.query.redirect ? redirect : '/';
          }
        });
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.maintain}>
      <div className={styles.updating}>
        <img src={updating} alt="MEXC交易所" />
        <div>
          <p>{formatMessage({ id: 'maintain.title' })}</p>
          <p>
            <a className={styles.linkBtn} href={url} target="_blank" rel="noopener noreferrer">
              {formatMessage({ id: 'maintain.announcement' })}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
