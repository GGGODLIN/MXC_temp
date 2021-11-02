import { useEffect, useState, useCallback } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { Progress, Button } from 'antd-mobile';
import { getPoolDefiList, getPoolFinanceList } from '@/services/api';
import { getSubSite, cutFloatDecimal, gotoLogin, sub } from '@/utils';
import styles from './index.less';
import { flattenDepth } from 'lodash';
import TopBar from '@/components/TopBar';
// import ThemeOnly from '@/components/ThemeOnly';
import ComingSoon from './comingSoon';

import bannerImg from '@/assets/img/mxDefi/banner.png';
import hamerImg from '@/assets/img/mxDefi/icon.png';

const language = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const List = ({ coinList, user, markets }) => {
  const [active, setActive] = useState('MXDEFI');
  const [lockList, setLockList] = useState([]);
  const [financialList, setFinancialList] = useState([]);

  useEffect(() => {
    getLock();
    getFinance();
    const timer = setInterval(getFinance, 30000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const toDetail = item => {
    sessionStorage.setItem('mxc.pos.actice', active);
    return router.push({
      pathname: `/mx-defi/detail/${item.id}`
    });
  };

  const getLock = () => {
    getPoolDefiList().then(res => {
      let ls = [];

      if (res.code === 0) {
        ls = res.allPools;
      }
      setLockList(ls);
    });
  };

  const getFinance = () => {
    getPoolFinanceList().then(res => {
      if (res.code === 0) {
        setFinancialList(res.finances || []);
      }
    });
  };

  const refresh = () => {
    const _maps = {
      LOCK: getLock,
      MXDEFI: getFinance
    };

    _maps[active]();
  };

  useEffect(() => {
    refresh();
  }, [active]);

  const activeHandle = type => {
    setActive(type);
    sessionStorage.setItem('mxc.pos.actice', type);
  };

  const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

  const listMaps = {
    LOCK: lockList,
    MXDEFI: financialList
  };

  const list = listMaps[active];

  const getUSDTMarket = useCallback(
    profitCurrency => {
      const USDTLIST =
        flattenDepth(
          markets.map(i => i.list),
          1
        ).filter(i => i.market === 'USDT') || [];
      return USDTLIST && USDTLIST.find(i => i.currency === profitCurrency) ? USDTLIST.find(i => i.currency === profitCurrency).c : '--';
    },
    [markets]
  );

  return (
    <>
      <div className={styles.posList}>
        <TopBar gotoPath={'/home'} extra={<i className="iconfont icon-shuaxin"></i>}>
          {formatMessage({ id: 'finance.title.nav' })}
        </TopBar>

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
        <div className={styles.Wrapper}>
          <div className={styles.listBox}>
            <div className={styles.head}>
              <span className={active === 'MXDEFI' ? styles.active : ''} onClick={() => activeHandle('MXDEFI')}>
                {formatMessage({ id: 'finance.title.launchpool' })}
              </span>
              <span className={active === 'LOCK' ? styles.active : ''} onClick={() => activeHandle('LOCK')}>
                {formatMessage({ id: 'pos.defi.title' })}
              </span>
            </div>
          </div>
          <div className={styles.listSwarp}>
            {active === 'MXDEFI' &&
              (list.length > 0 ? (
                list.map(item => {
                  const { profitCurrency, minerQuantity, totalSupply, lockTotal, list } = item;
                  return (
                    <div className={styles.mxDefiItem} key={item.id}>
                      <h3>
                        <div className={styles.icon}>
                          <i className={'iconfont iconVector'}></i>
                        </div>
                        {formatMessage({ id: 'finance.title.get_currency' }, { currency: profitCurrency })}
                      </h3>
                      <div className={styles.pawnItems}>
                        <div className={styles.pawnItem}>
                          <div>
                            {minerQuantity}
                            <span className={styles.pawnItemTitle}>
                              {formatMessage({ id: 'finance.title.today_pool' })}({profitCurrency})
                            </span>
                          </div>
                        </div>
                        <div className={styles.pawnItem}>
                          <div>
                            {getUSDTMarket(profitCurrency)}
                            <span className={styles.pawnItemTitle}>
                              {formatMessage({ id: 'swap.typeTitle.newsPrice' })}({profitCurrency}/USDT)
                            </span>
                          </div>
                        </div>
                        <div className={styles.pawnItem}>
                          <div>
                            {totalSupply}
                            <span className={styles.pawnItemTitle}>
                              {formatMessage({ id: 'finance.title.amount' })}({profitCurrency})
                            </span>
                          </div>
                        </div>
                        <div className={styles.pawnItem}>
                          <div>
                            {cutFloatDecimal(lockTotal, 0)}
                            <span className={styles.pawnItemTitle}>{formatMessage({ id: 'finance.title.amount_price' })}(USDT)</span>
                          </div>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                      </div>

                      <div className={styles.finacialList}>
                        <div>
                          {list.map(i => {
                            const coinItem = coinList.find(c => c && c.vcoinName === i.currency) || {};
                            return (
                              <div className={styles.minerItem}>
                                {i.tag && (
                                  <div className={styles.tag}>
                                    {language.startsWith('zh') ? i.tag.split('__')[0] : i.tag.split('__')[1]}
                                  </div>
                                )}
                                <div className={styles.icon}>
                                  {coinItem && coinItem.icon && (
                                    <img src={`${MAIN_SITE_API_PATH}/file/download/${coinItem && coinItem.icon}`} alt="" />
                                  )}
                                  <span>{i.currency}</span>
                                </div>
                                <p>
                                  <span>{(i.profitRate * 100).toFixed(2) + '%'}</span>{' '}
                                  {formatMessage({ id: 'assets.pool.modal.profit_rate' })}
                                </p>
                                {i.status === 'UN_LINE' ? (
                                  <Button type="ghost" disabled>
                                    {formatMessage({ id: 'labs.title.ended' })}
                                  </Button>
                                ) : (
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      if (!user.id) {
                                        return gotoLogin();
                                      }
                                      router.push({
                                        pathname: `/mx-defi/mxdetail/${i.id}`
                                      });
                                    }}
                                  >
                                    {formatMessage({ id: 'finance.title.to_stake' })}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <ComingSoon />
              ))}
            {active === 'LOCK' &&
              (list.length > 0 ? (
                list.map(item => {
                  const coinItem = coinList.find(coin => coin.vcoinName === item.currency) || {};
                  const {
                    tag,
                    currency,
                    profitRangeEnd,
                    profitRangeStart,
                    profitRate,
                    minLockDays,
                    totalLimit,
                    totalRemain,
                    status
                  } = item;
                  return (
                    <div className={styles.defiItem}>
                      {tag && (
                        <span className={styles.defiLogo}>{language.startsWith('zh') ? tag.split('__')[0] : tag.split('__')[1]}</span>
                      )}
                      <div className={styles.coinImg}>
                        {coinItem && coinItem.icon && (
                          <img src={`${MAIN_SITE_API_PATH}/file/download/${coinItem && coinItem.icon}`} alt="MEXC交易所" />
                        )}
                        <b>{currency}</b> <span>{coinItem.vcoinNameFull}</span>
                      </div>
                      <div className={styles.miningInfo}>
                        <div className={styles.textinfo}>
                          <div>
                            <b>
                              {Boolean(profitRangeEnd * 1) && Boolean(profitRangeStart * 1)
                                ? `${(profitRangeStart * 100).toFixed(2)}%-${(profitRangeEnd * 100).toFixed(2)}%`
                                : (profitRate * 100).toFixed(2) + '%'}{' '}
                            </b>
                            <p>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</p>
                          </div>
                          <div>
                            <b className={styles.black}>
                              {minLockDays}
                              {formatMessage({ id: 'common.day' })}
                            </b>
                            <p>{formatMessage({ id: 'pos.title.list.min_hold' })}</p>
                          </div>
                        </div>
                        {!!totalLimit ? (
                          <>
                            <div className={styles.progressOuter}>
                              <div
                                style={{
                                  width: `${totalLimit ? ((totalLimit - totalRemain) / totalLimit) * 100 : 100}%`
                                }}
                                className={styles.progressInner}
                              >
                                <span>{`${totalLimit ? ((totalLimit - totalRemain) / totalLimit).toFixed(2) * 100 : 100}%`}</span>
                              </div>
                            </div>
                            <div className={`${styles.textinfo} ${styles.flexStart}`}>
                              <b>
                                {sub(totalLimit, totalRemain)} {currency} /
                              </b>
                              {`${totalLimit} ${currency}`}
                            </div>
                          </>
                        ) : (
                          <div className={`${styles.textinfo} ${styles.flexStart}`}>
                            <p>{formatMessage({ id: 'mc_pos_staking_amount' })}:</p>
                            <b>{formatMessage({ id: 'pos.title.list.unlimited' })}</b>
                          </div>
                        )}
                      </div>
                      {status === 'UN_LINE' || (totalLimit && totalRemain === 0) ? (
                        <Button type="ghost" disabled block>
                          {formatMessage({ id: 'labs.title.ended' })}
                        </Button>
                      ) : (
                        <Button type="primary" block onClick={() => toDetail(item)}>
                          {formatMessage({ id: 'finance.title.to_stake' })}
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <ComingSoon />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(({ auth, global, trading }) => ({
  user: auth.user,
  coinList: global.coinList,
  markets: trading.markets
}))(List);
