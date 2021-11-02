import { useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { PullToRefresh } from 'antd-mobile';
import { getPoolLockList, getPoolHoldList, getPoolMarginList } from '@/services/api';
import { getSubSite } from '@/utils';
import styles from './index.less';
import StickyBar from '@/components/StickyBar';
import mxcpalen from '@/assets/img/pos/mxc_pal_en.png';
import mxcpalcn from '@/assets/img/pos/mxc_pal_cn.png';
const language = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;
const List = ({ coinList, user }) => {
  const [active, setActive] = useState('LOCK');
  const [lockList, setLockList] = useState([]);
  const [holdList, setHoldList] = useState([]);
  const [marginList, setMarginList] = useState([]);

  useEffect(() => {
    const _active = sessionStorage.getItem('mxc.pos.actice');
    getLock();
    getHold();
    getMargin();
    _active && setActive(_active);
  }, []);

  const toDetail = item => {
    sessionStorage.setItem('mxc.pos.actice', active);
    return router.push({
      pathname: `/pos/detail/${item.id}`
    });
  };

  const getLock = () => {
    getPoolLockList().then(res => {
      let ls = [];

      if (res.code === 0) {
        ls = res.allPools.filter(i => !!i);
      }
      setLockList(ls);
    });
  };

  const getHold = () => {
    getPoolHoldList().then(res => {
      let ls = [];
      if (res.code === 0) {
        const holds = res.allPools;
        if (res.memberPools) {
          holds.forEach(element => {
            element.hasPool = res.memberPools.some(item => item === element.id);
          });
        }
        ls = holds.filter(i => !!i);
      }
      setHoldList(ls);
    });
  };

  const getMargin = () => {
    getPoolMarginList().then(res => {
      if (res.code === 0) {
        const allPools = res.allPools.filter(i => !!i);

        setMarginList(allPools);
      }
    });
  };

  const refresh = () => {
    const _maps = {
      LOCK: getLock,
      HOLD: getHold,
      MARGIN: getMargin
    };

    _maps[active]();
  };

  const activeHandle = type => {
    setActive(type);
    sessionStorage.setItem('mxc.pos.actice', type);
  };

  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';

  const listMaps = {
    LOCK: lockList,
    HOLD: holdList,
    MARGIN: marginList
  };

  const list = listMaps[active];
  return (
    <div className={styles.posList}>
      <StickyBar gotoPath={'/home'} transparent={true} isSticky={true}>
        <div>{formatMessage({ id: 'pos.title.nav' })}</div>
      </StickyBar>
      <div className={styles.banner}>
        <h1>{formatMessage({ id: 'pos.title.banner_title_1' })}</h1>
        <h2>{formatMessage({ id: 'pos.title.banner_title_2' })}</h2>
      </div>
      <div className={styles.listBox}>
        <div className={styles.head}>
          <h2>{formatMessage({ id: 'pos.title.pos_class' })}</h2>
          {user.id && (
            <Link className={styles.link} to={'/pos/record'}>
              <i className="iconfont iconic_indicator"></i> {formatMessage({ id: 'pos.title.my_pos_record' })}
            </Link>
          )}
        </div>
        <div className={styles.class}>
          {/* <span className={active === 'MARGIN' ? styles.active : ''} onClick={() => activeHandle('MARGIN')}>
            {formatMessage({ id: 'pos.title.pos_class_margin' })}
          </span> */}
          <span className={active === 'LOCK' ? styles.active : ''} onClick={() => activeHandle('LOCK')}>
            {formatMessage({ id: 'pos.title.pos_class_lock' })}
          </span>
          <span className={active === 'HOLD' ? styles.active : ''} onClick={() => activeHandle('HOLD')}>
            {formatMessage({ id: 'pos.title.pos_class_hold' })}
          </span>
        </div>
      </div>
      <div className={styles.listSwarp}>
        {active === 'MARGIN' && (
          <PullToRefresh
            onRefresh={() => {
              refresh();
            }}
            className={`${styles.list} ${styles[isApp]}`}
            damping={60}
            distanceToRefresh={50}
          >
            {list.map(item => (
              <div className={styles.coins} key={item.id} onClick={() => toDetail(item)}>
                <img
                  src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === item.currency) &&
                    coinList.find(coin => coin.vcoinName === item.currency).icon}`}
                  alt=""
                />
                <div className={styles.currency}>
                  <b>
                    {item.currency} &nbsp;
                    <span>
                      {formatMessage({ id: 'pos.title.list.min_hold' })} {item.minLockDays}
                    </span>
                  </b>
                </div>
                <div className={styles.rate}>
                  <b>
                    {Boolean(item.profitRangeEnd * 1) && Boolean(item.profitRangeStart * 1)
                      ? `${(item.profitRangeStart * 100).toFixed(2)}%-${(item.profitRangeEnd * 100).toFixed(2)}%`
                      : (item.profitRate * 100).toFixed(2) + '%'}
                    {Boolean(item.additionProfitRate * 1) && (
                      <span className={styles.addition}>
                        +{(item.additionProfitRate * 100).toFixed(2)}
                        <i>%</i>
                      </span>
                    )}
                  </b>
                  <span>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</span>
                </div>
                {!!item.additionCurrency && item.additionCurrency === 'MX' && (
                  <div className={styles.tag}>
                    {item.additionCurrency}
                    {formatMessage({ id: 'pos.title.pos_opecial_field' })}
                  </div>
                )}
                {!!item.tag && (
                  <div className={styles.tag}>{language.startsWith('zh') ? item.tag.split('__')[0] : item.tag.split('__')[1]}</div>
                )}
              </div>
            ))}
          </PullToRefresh>
        )}
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
              <div className={styles.coins} key={item.id} onClick={() => toDetail(item)}>
                <img
                  src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === item.currency) &&
                    coinList.find(coin => coin.vcoinName === item.currency).icon}`}
                  alt=""
                />
                <div className={styles.currency}>
                  <b>
                    {item.currency} &nbsp;
                    <span>
                      {formatMessage({ id: 'pos.title.list.min_hold' })} {item.minLockDays}
                    </span>
                  </b>
                </div>
                <div className={styles.rate}>
                  <b>
                    {Boolean(item.profitRangeEnd * 1) && Boolean(item.profitRangeStart * 1)
                      ? `${(item.profitRangeStart * 100).toFixed(2)}%-${(item.profitRangeEnd * 100).toFixed(2)}%`
                      : (item.profitRate * 100).toFixed(2) + '%'}
                  </b>
                  <span>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</span>
                </div>
                {!!item.tag && (
                  <div className={styles.tag}>{language.startsWith('zh') ? item.tag.split('__')[0] : item.tag.split('__')[1]}</div>
                )}
              </div>
            ))}
          </PullToRefresh>
        )}
        {active === 'HOLD' && (
          <PullToRefresh
            onRefresh={() => {
              refresh();
            }}
            className={`${styles.list} ${styles[isApp]}`}
            damping={60}
            distanceToRefresh={50}
          >
            {list.map(item => (
              <div className={styles.coins} key={item.id} onClick={() => toDetail(item)}>
                <img
                  src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === item.currency) &&
                    coinList.find(coin => coin.vcoinName === item.currency).icon}`}
                  alt=""
                />
                <div className={styles.currency}>
                  <b>
                    {item.currency}
                    {item.currency === 'USDT' && (
                      <img className={styles.mxcPal} src={language.toLowerCase().startsWith('zh') ? mxcpalcn : mxcpalen} alt="" />
                    )}
                    {item.hasPool && <span className={styles.hold}>{formatMessage({ id: 'pos.title.pos_class_hold' })}</span>}
                  </b>
                </div>
                <div className={styles.rate}>
                  <b>{(item.profitRate * 100).toFixed(2)}%</b>
                  <span>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</span>
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
