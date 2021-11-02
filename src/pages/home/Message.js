import { useEffect, useState } from 'react';
import { NoticeBar, Carousel } from 'antd-mobile';
import { getAnnouncements } from '@/services/api';
import { getLocale } from 'umi-plugin-locale';
import { connect } from 'dva';
import notificationIconL from '@/assets/img/home/notification_l.png';
import notificationIconD from '@/assets/img/home/notification_d.png';
import styles from './Message.less';
const Message = ({ theme }) => {
  const [msg, setMsg] = useState([]);
  useEffect(() => {
    const lang = getLocale();
    getAnnouncements({
      lang: lang.startsWith('zh') ? 'cn' : 'en'
    }).then(res => {
      if (res.code === 0) {
        setMsg(res.msg);
      }
    });
  }, []);

  return (
    <div className={styles.messageWrapper}>
      <div className={styles.notificationWrapper}>
        <img src={theme === 'dark' ? notificationIconD : notificationIconL} />
        {msg.length && (
          <Carousel className={styles.carouselWrapper} vertical dots={false} autoplay infinite>
            {msg.map(item => (
              <a
                key={item.id}
                href={item.html_url}
                className={styles.msg}
                style={{ color: 'var(--main-text-1)' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            ))}
          </Carousel>
        )}
      </div>
      <a href={getLocale().startsWith('zh') ? `${HC_PATH}/hc/zh-cn` : `${HC_PATH}/hc/en-001`} className="iconfont iconlist-center"></a>
    </div>
  );
};

export default connect(({ setting }) => ({
  theme: setting.theme
}))(Message);
