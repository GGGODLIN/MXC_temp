import { useState } from 'react';
import { connect } from 'dva';
import StickyBar from '@/components/StickyBar';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-locale';

import styles from './index.less';
import logo from '@/assets/img/logo-main-dark.png';

const weeks = moment.weekdays();

const Activity = ({ location }) => {
  const [info, setinfo] = useState(location.state);

  return (
    <div className={styles.warp}>
      <StickyBar transparent={true}></StickyBar>
      <h2>{formatMessage({ id: 'home.title.news' })}</h2>
      <div className={styles.infoBox}>
        <div className={styles.logoInfo}>
          <img src={logo} alt="" />
          <div>
            <h3>{moment(info.createTime).format('YYYY.MM.DD')}</h3>
            <p>
              {weeks[moment(info.createTime).day()]} &nbsp;&nbsp;{moment(info.createTime).format('HH:mm')}
            </p>
          </div>
        </div>
        <div className={styles.content}>
          <h3>{info.title}</h3>
          <p>{info.content}</p>
          <b>{formatMessage({ id: 'mxc.news.detail.more' })}</b>
        </div>
        <div className={styles.greenbar}></div>
      </div>
      <p className={styles.footer}>
        <span>https://www.mexc.com</span>
        <span>https://www.mexc.co</span>
      </p>
    </div>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(Activity);
