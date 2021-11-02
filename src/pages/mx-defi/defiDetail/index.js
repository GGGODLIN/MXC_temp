import { useState, useEffect } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-locale';
import { getPoolDetail } from '@/services/api';
import { getSubSite } from '@/utils';
import { PullToRefresh } from 'antd-mobile';
import TopBar from '@/components/TopBar';
// import ThemeOnly from '@/components/ThemeOnly';

import styles from './index.less';
import LockInfo from './LockInfo';
import bannerImg from '@/assets/img/mxDefi/banner.png';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const Detail = ({ match, coinList, theme, user }) => {
  const [info, setinfo] = useState({});
  const getDetail = async () => {
    const res = await getPoolDetail(match.params.id);
    if (res.code === 0) {
      const icon = coinList.find(i => i.vcoinName === res.data.currency) && coinList.find(i => i.vcoinName === res.data.currency).icon;
      setinfo({ ...res.data, icon, hasPool: res.isHold });
    }
  };
  useEffect(() => {
    if (user.id) getDetail();
  }, [user.id]);

  return (
    <div className={styles.wrapper}>
      <TopBar gotoPath={'/mx-defi/list'}>{formatMessage({ id: 'finance.title.nav' })}</TopBar>
      <div>
        <div className={styles.banner}>
          <h1>{formatMessage({ id: 'finance.title.banner_text_1' })}</h1>
          <h2>{formatMessage({ id: 'finance.title.banner_text_2' })}</h2>
          <img src={bannerImg} className={styles.bannerImg} />
          {user.id && (
            <Link className={styles.link} to={'/mx-defi/record'}>
              {formatMessage({ id: 'pos.title.my_pos_record' })}
            </Link>
          )}
        </div>
        <LockInfo info={info} styles={styles} theme={theme}></LockInfo>
      </div>
    </div>
  );
};

export default connect(({ auth, global, setting }) => ({
  user: auth.user,
  coinList: global.coinList,
  theme: setting.theme
}))(Detail);
