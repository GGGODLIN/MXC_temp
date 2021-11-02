import { useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getPoolLockList, getPoolHoldList, getPoolDetail } from '@/services/api';
import { getSubSite } from '@/utils';
import { PullToRefresh } from 'antd-mobile';
import styles from './index.less';
import StickyBar from '@/components/StickyBar';
import { gotoCrossPlatformUrl } from '@/utils';
const language = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;
const List = ({ coinList, user }) => {
  const [active, setActive] = useState('LOCK');
  const [lockList, setLockList] = useState([]);
  useEffect(() => {
    getLock();
  }, []);
  const getLock = () => {
    getPoolLockList().then(res => {
      if (res.code === 0) {
        let dataList = res.allPools.filter(item => item.tag);
        setLockList(dataList);
      }
    });
  };
  const listMaps = {
    LOCK: lockList
  };
  const refresh = () => {
    const _maps = {
      LOCK: getLock
    };
    _maps[active]();
  };
  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
  const list = listMaps[active];
  return (
    <div className={styles.posList}>
      <StickyBar transparent={true}>{formatMessage({ id: 'pos.title.nav' })}</StickyBar>
      <div className={styles.banner}>
        <h1>{formatMessage({ id: 'pos.defi.title' })}</h1>
      </div>
      <div className={styles.listBox}>
        <div className={styles.head}>
          <h2>{formatMessage({ id: 'pos.defi.type' })}</h2>
          {user.id && (
            <Link className={styles.link} to={'/pos/record'}>
              <i className="iconfont iconic_indicator"></i> {formatMessage({ id: 'pos.title.my_pos_record' })}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.listSwarp}>
        {active === 'LOCK' && (
          <PullToRefresh
            onRefresh={() => {
              refresh();
            }}
            className={`${styles.list} ${styles[isApp]}`}
            damping={60}
            distanceToRefresh={50}
          >
            {list.map(item => (
              <div
                className={styles.coins}
                key={item.id}
                onClick={() => {
                  router.push({
                    pathname: `/pos/detail/${item.id}`
                  });
                }}
              >
                <img
                  src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === item.currency) &&
                    coinList.find(coin => coin.vcoinName === item.currency).icon}`}
                  alt=""
                />
                <div className={styles.currency}>
                  <b>
                    <div>
                      <div className={styles.coinNameColor}>{item.currency}</div>
                      {item.tag && (
                        <div className={styles.tag}>{language.startsWith('zh') ? item.tag.split('__')[0] : item.tag.split('__')[1]}</div>
                      )}
                    </div>
                    <span>
                      {formatMessage({ id: 'pos.title.list.min_hold' })} {item.minLockDays}
                    </span>
                  </b>
                </div>
                <div className={styles.rate}>
                  {item.totalLimit ? (
                    <b>{((Number(item.totalRemain) / Number(item.totalLimit)) * 100).toFixed(2)}%</b>
                  ) : (
                    <b>{formatMessage({ id: 'pos.title.list.unlimited' })}</b>
                  )}

                  <span> {formatMessage({ id: 'pos.title.remain_rate' })}</span>
                </div>
              </div>
            ))}
          </PullToRefresh>
        )}
      </div>
    </div>
  );
};

export default connect(({ auth, global }) => ({
  user: auth.user,
  coinList: global.coinList
}))(List);
