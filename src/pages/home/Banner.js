import { useEffect, useState } from 'react';
import { Carousel, Button, Modal } from 'antd-mobile';
import { getMainBanners } from '@/services/api';
import router from 'umi/router';
import { getLocale } from 'umi-plugin-locale';
import { replaceProductionUrl, getSubSite } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';
// getMainBanners
import styles from './index.less';
import headerLogo from '@/assets/img/home/header_logo.png';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const Banner = () => {
  const [banner, setBanner] = useState(['1', '2', '3', '4', '5']);
  const [download, setDownload] = useState(true);
  useEffect(() => {
    const time = localStorage.getItem('mxc.home.checkTip');
    let download = false;
    if (!time) {
      download = true;
    } else if (time == 1) {
      download = false;
    } else {
      const timeDiff = new Date().getTime() - time;
      download = timeDiff > 604800000;
    }
    setDownload(localStorage.getItem('mxc.view.from') !== 'mock' && download);
    const lang = getLocale();
    if (download) {
      localStorage.setItem('mxc.home.checkTip', new Date().getTime());
      setTimeout(() => {
        setDownload(false);
      }, 5000);
    }
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
  }, []);

  const ToDownload = () => {
    localStorage.setItem('mxc.home.checkTip', '1');
    router.push('/mobileApp');
  };

  const cancel = () => {
    Modal.alert(
      formatMessage({ id: 'ucenter.phishing.warning' }),
      <div className={styles.checkBox}>
        <p>{formatMessage({ id: 'layout.top.title.never_display' })}?</p>
      </div>,
      [
        { text: formatMessage({ id: 'common.cancel' }), onPress: () => setDownload(false) },
        {
          text: formatMessage({ id: 'common.yes' }),
          onPress: () => {
            localStorage.setItem('mxc.home.checkTip', '1');
            setDownload(false);
          }
        }
      ]
    );
  };

  return (
    <>
      <div className={styles.header}>
        <i className="iconfont iconavatar" onClick={() => router.push('/ucenter/profile')}></i>
        <div className={styles.searchEntry} onClick={() => router.push('/market/search')}>
          <i className="iconfont iconsousuo"></i>
          <span>{formatMessage({ id: 'assets.list.search' })}</span>
        </div>
        {download && (
          <div className={styles.downloadBanner}>
            <div className={styles.inner}>
              <div className={styles.slogen}>
                <b>{formatMessage({ id: 'common.site_title' })}</b>
                <p>{formatMessage({ id: 'home.title.mxc_slogen' })}</p>
              </div>
              <Button className={styles.btn} onClick={ToDownload} inline size="small" type="primary">
                {formatMessage({ id: 'download.title.page_title' })}
              </Button>
              <i className={`iconfont iconquxiao ${styles.cancel}`} onClick={cancel}></i>
            </div>
          </div>
        )}
      </div>
      <div className={styles.banner}>
        <Carousel
          autoplay={true}
          cellSpacing={20}
          autoplayInterval={3000}
          infinite={true}
          frameOverflow={{ height: '140px' }}
          dotStyle={{
            borderRadius: '0',
            width: '15px',
            height: '2px',
            background: '#888'
          }}
          dotActiveStyle={{
            borderRadius: '0',
            width: '20px',
            height: '2px',
            background: '#ccc'
          }}
        >
          {banner.map(item =>
            typeof item !== 'string' ? (
              <a
                key={item.imageUrl}
                href={replaceProductionUrl(item.url)}
                style={{ display: 'inline-block', width: '100%', height: '140px' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${MAIN_SITE_API_PATH}/file/download/${item.imageUrl}`}
                  alt=""
                  style={{ width: '100%', height: '140px', verticalAlign: 'top' }}
                />
              </a>
            ) : (
              <div key={item} style={{ height: 140 }}></div>
            )
          )}
        </Carousel>
      </div>
    </>
  );
};

export default Banner;
