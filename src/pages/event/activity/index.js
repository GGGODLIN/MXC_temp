import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import moment from 'moment';
import { WingBlank, PullToRefresh } from 'antd-mobile';
import { getSubSite } from '@/utils';
import { getNews, getMainBanners } from '@/services/api';

import styles from './index.less';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const Activities = () => {
  const [active, setactive] = useState(1);
  const [news, setNews] = useState([]);
  const [banner, setBanner] = useState([]);
  useEffect(() => {
    _getNews();
    getBanner();
  }, []);

  const _getNews = () => {
    getNews().then(res => {
      if (res.code === 0) {
        setNews(res.msg);
      }
    });
  };

  const getBanner = () => {
    const lang = getLocale();
    getMainBanners({
      type: 's',
      via: 'web',
      limit: 5,
      lang: lang
    }).then(res => {
      if (res.code === 0) {
        setBanner(res.msg);
      }
    });
  };

  const refresh = () => {
    active === 1 ? _getNews() : getBanner();
  };

  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
  return (
    <div>
      <TopBar>
        <div className={`${styles.bar} ${active === 1 && styles.active}`} onClick={() => setactive(1)}>
          {formatMessage({ id: 'home.title.news' })}
        </div>
        <div className={`${styles.bar} ${active === 2 && styles.active}`} onClick={() => setactive(2)}>
          {formatMessage({ id: 'event.title.name' })}
        </div>
        <div
          className={`${styles.bar} ${active === 3 && styles.active}`}
          onClick={() => {
            setactive(3);
            router.push('/event/chatroom');
          }}
        >
          {formatMessage({ id: 'layout.service.title.chatroom' })}
        </div>
      </TopBar>
      <div>
        <PullToRefresh
          onRefresh={() => {
            refresh();
          }}
          className={`${styles.scroll} ${styles[isApp]}`}
          damping={100}
          distanceToRefresh={50}
        >
          {active === 1 && (
            <div className={styles.wrap}>
              {news.map(item => (
                <div
                  className={styles.newItem}
                  key={item.newsId}
                  onClick={() =>
                    router.push({
                      pathname: '/event/activity-detail',
                      state: item
                    })
                  }
                >
                  <h3>{item.title}</h3>
                  <span>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                  <p>{item.briefContent}</p>
                </div>
              ))}
            </div>
          )}
          {active === 2 && (
            <div className={styles.wrap}>
              {banner.map(item => (
                <div className={styles.activeItem} key={item.imageUrl}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`${MAIN_SITE_API_PATH}/file/download/${item.imageUrl}`}
                      alt=""
                      style={{ width: '100%', verticalAlign: 'top' }}
                    />
                  </a>
                </div>
              ))}
            </div>
          )}
        </PullToRefresh>
      </div>
    </div>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(Activities);
