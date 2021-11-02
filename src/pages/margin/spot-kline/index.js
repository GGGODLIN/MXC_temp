import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import cs from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, timeToString } from '@/utils';
import { Button, Modal } from 'antd-mobile';
import PricePercent from '@/components/PricePercent';
import Fiat from '@/components/Fiat';
import { deleteFavorite, addFavorite, getCurrencyInfo } from '@/services/api';
import TopBar from '@/components/TopBar';
import { supportedResolutions } from '@/utils/kline';
import Pairs from '../pairs';
import OriginalKline from '../../trade/spot-kline/OriginalKline';

import styles from './index.less';
import arrowUp from '@/assets/img/arrow-up.png';
import arrowDown from '@/assets/img/arrow-down.png';
import logo from '@/assets/img/logo-main.png';

const locale = getLocale();

const defaultRanges = [
  { label: '5min', value: '5' },
  { label: '15min', value: '15' },
  { label: '1hour', value: '60' },
  { label: '8hour', value: '480' },
  { label: '1day', value: '1D' }
];

const Info = ({ dispatch, currency }) => {
  const [info, setInfo] = useState({});
  useEffect(() => {
    getCurrencyInfo(currency).then(res => {
      setInfo(res.data || {});
    });
  }, [currency]);

  const intro = locale.startsWith('zh') ? info.introduceCn : info.introduceEn;

  return (
    <div className={styles.currencyWrapper}>
      <div className="f-14 m-t-20 m-b-10">
        {info.mameCn}({info.nameEn})
      </div>
      <div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'trans.title.cur_issue_time' })}</div>
          <div className={styles.infoContent}>{info.issueTime || '--'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'trans.title.cur_issue_am' })}</div>
          <div className={styles.infoContent}>{info.issueAmount || '--'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'trans.title.cur_issue_alam' })}</div>
          <div className={styles.infoContent}>{info.circulationAmount || '--'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'trans.title.cur_issue_pr' })}</div>
          <div className={styles.infoContent}>{info.issuePrice || '--'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'header.whitepaper' })}</div>
          <div>
            <a className={styles.infoContent} href={info.whiteBookUrl || ''}>
              {info.whiteBookUrl || '--'}
            </a>
          </div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'voting.detail.website' })}</div>
          <div>
            <a className={styles.infoContent} href={info.website || ''}>
              {info.website || '--'}
            </a>
          </div>
        </div>
        <div className={styles.infoItem}>
          <div className="color-middle">{formatMessage({ id: 'assets.blockchain.browser' })}</div>
          <a className={styles.infoContent} href={info.explorerUrl || ''}>
            {info.explorerUrl || '--'}
          </a>
        </div>
      </div>
      <div className={styles.intro}>{intro || '--'}</div>
    </div>
  );
};

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;
const timerangeHeight = 28;

function calcBarLength(a, maxQuan) {
  a.barBgRight = ((maxQuan - a.q) / maxQuan) * 100 + '%';
}

const KlineTrade = ({ dispatch, user, currentPair, theme, asks, bids, trades }) => {
  const [pairsModalVisible, setPairsModalVisible] = useState(false);
  const [tvInterval, setTvInterval] = useState(window.localStorage.getItem('mxc.kline.interval') || '15');

  const { market, currency, quantityScale, priceScale, c, rate = 0, favorite, h, l, q } = currentPair;

  const themeColor = theme === 'dark' ? '#3e3f4d' : '#ffffff';

  const handleStarClick = () => {
    const { currency, market, favorite } = currentPair;
    const symbol = `${currency}_${market}`;
    if (favorite) {
      deleteFavorite({ symbol }, user.token).then(res => {
        dispatch({
          type: 'trading/getUserFavorites'
        });
      });
    } else {
      addFavorite({ symbol }, user.token).then(res => {
        dispatch({
          type: 'trading/getUserFavorites'
        });
      });
    }
  };

  const newPrice = c || 0;
  const newPriceString = cutFloatDecimal(newPrice, priceScale);

  const setResolution = interval => {
    setTvInterval(interval);
    window.localStorage.setItem('mxc.kline.interval', interval);
  };

  const [intervalModalVisible, setIntervalModalVisible] = useState(false);

  const [actionTab, setActionTab] = useState(1);

  const marketLength = 50;
  let renderAsks = [...asks];
  let renderBids = bids;

  let maxQuan = 0;
  for (let j = renderAsks.length - 1; j >= 0; j--) {
    const a = renderAsks[j];
    if (maxQuan < a.q) {
      maxQuan = a.q;
    }
  }
  for (let i = 0; i < renderBids.length; i++) {
    const b = renderBids[i];
    if (maxQuan < b.q) {
      maxQuan = b.q;
    }
  }

  for (let j = renderAsks.length - 1; j >= 0; j--) {
    let a = renderAsks[j];
    calcBarLength(a, maxQuan);
  }

  for (let i = 0; i < renderBids.length; i++) {
    let b = renderBids[i];
    calcBarLength(b, maxQuan);
  }

  // console.log(asks, bids);
  renderAsks = renderAsks.length > marketLength ? renderAsks.slice(-1 * marketLength) : renderAsks;
  renderBids = renderBids.length > marketLength ? renderBids.slice(0, marketLength) : renderBids;
  renderAsks = renderAsks.reverse();

  let renderTrades = trades instanceof Array ? trades : [];

  const [viewport, setViewport] = useState('portrait');
  const wrapperStyles =
    viewport === 'portrait'
      ? {
          position: 'relative'
        }
      : {
          position: 'fixed',
          zIndex: 4,
          top: 0,
          left: 0,
          width: height,
          height: width,
          transform: `rotate(90deg)`,
          transformOrigin: `${width / 2}px center`,
          backgroundColor: themeColor
        };

  const isInDefault = defaultRanges.find(r => r.value === tvInterval);
  let moreString = formatMessage({ id: 'common.more' });
  if (!isInDefault) {
    Object.entries(supportedResolutions).forEach(([v, k]) => {
      if (k === tvInterval) {
        moreString = v;
      }
    });
  }

  return (
    <>
      <TopBar
        gotoPath={`/margin/spot#${currency}_${market}`}
        extra={
          <span onClick={handleStarClick}>
            {favorite ? (
              <i className="iconfont iconzixuan-unselected f-18" style={{ color: '#faad14' }}></i>
            ) : (
              <i className="iconfont iconxingxing f-18" style={{ color: 'var(--main-text-1)' }}></i>
            )}
          </span>
        }
      >
        <div className={styles.topBar}>
          <div className={styles.topInner} onClick={() => setPairsModalVisible(true)}>
            <i className="iconfont iconliebiaoxiangyou m-r-10"></i>
            <span>
              <span>{currency}</span>
              <span style={{ color: 'var(--main-text-1)' }}>/{market}</span>
            </span>
          </div>
        </div>
      </TopBar>
      <div>
        <div className={styles.header}>
          <div>
            <div className={styles.currentWrapper}>
              <span className={cs(styles.bigFont, rate > 0 && styles.buy, rate < 0 && styles.sell)}>{newPriceString}</span>
              {rate !== 0 && <img src={rate > 0 ? arrowUp : arrowDown} alt="" />}
            </div>
            <div className="f-12">
              <span className={styles.fiatPrice}>
                <Fiat value={newPrice} market={market} dec={2} />
              </span>
              <span className="m-l-15">{typeof rate !== 'number' ? '--' : <PricePercent value={rate}></PricePercent>}</span>
            </div>
          </div>
          <div className={styles.infoWrapper}>
            <div className="color-middle">
              <div>{formatMessage({ id: 'headline.24hmax' })}</div>
              <div>{formatMessage({ id: 'headline.24hmin' })}</div>
              <div>{formatMessage({ id: 'headline.trade_volume' })}</div>
            </div>
            <div className={styles.infoValue}>
              <div>{cutFloatDecimal(h, priceScale)}</div>
              <div>{cutFloatDecimal(l, priceScale)}</div>
              <div>{cutFloatDecimal(q, quantityScale)}</div>
            </div>
          </div>
        </div>
        <div className={styles.klineAction}>
          <div className={styles.klineActionRange}>
            {defaultRanges.map(r => (
              <div
                key={r.value}
                className={cs(styles.klineActionsInterval, tvInterval === r.value && styles.activeInterval)}
                onClick={() => setResolution(r.value)}
              >
                <span>{r.label}</span>
              </div>
            ))}
            <div
              className={cs(styles.klineActionsInterval, styles.withTriangle, !isInDefault && styles.activeInterval)}
              onClick={() => setIntervalModalVisible(true)}
            >
              <span>{moreString}</span>
              <span className={styles.triangle}></span>
            </div>
          </div>
          <div onClick={() => setViewport('landscape')}>
            <i className="iconfont iconhangqing-zhankai f-12"></i>
          </div>
        </div>
        <div style={wrapperStyles}>
          {viewport === 'landscape' && (
            <div style={{ height: timerangeHeight }} className={styles.landscapeTop}>
              <div>
                <span>{currency}</span>
                <span className="m-r-10 color-middle">/{market}</span>
                <span className={cs(rate > 0 && styles.buy, rate < 0 && styles.sell)}>{newPriceString}</span>
                {rate !== 0 && <img src={rate > 0 ? arrowUp : arrowDown} alt="" style={{ width: 10, marginLeft: 2 }} />}
                <span className="m-l-10">{typeof rate !== 'number' ? '--' : <PricePercent value={rate}></PricePercent>}</span>
              </div>
              <div className={styles.klineActionRange}>
                {Object.keys(supportedResolutions).map((k, i) => (
                  <div
                    className={cs(
                      styles.klineActionsInterval,
                      tvInterval === supportedResolutions[k] && styles.activeInterval,
                      viewport === 'landscape' && styles.smallGap
                    )}
                    key={k}
                    onClick={() => {
                      setResolution(supportedResolutions[k]);
                    }}
                  >
                    {k}
                  </div>
                ))}
                <div onClick={() => setViewport('portrait')}>
                  <i className="iconfont iconhangqing-zhankai f-12"></i>
                </div>
              </div>
            </div>
          )}
          <div
            className={styles.tvChartContainer}
            style={viewport === 'landscape' ? { width: height, height: width - timerangeHeight } : {}}
          >
            <OriginalKline interval={tvInterval}></OriginalKline>
          </div>
          <img alt="mxc" className={styles.watermark} src={logo} />
        </div>
        <div className={styles.actionTabs}>
          <div className={cs(styles.actionTab, actionTab === 1 && styles.activeAction)} onClick={() => setActionTab(1)}>
            <span>{formatMessage({ id: 'trade.spot.title.order_book' })}</span>
          </div>
          <div className={cs(styles.actionTab, actionTab === 2 && styles.activeAction)} onClick={() => setActionTab(2)}>
            <span>{formatMessage({ id: 'trade.trades.title' })}</span>
          </div>
          <div className={cs(styles.actionTab, actionTab === 3 && styles.activeAction)} onClick={() => setActionTab(3)}>
            <span>{formatMessage({ id: 'common.title.project_detail' })}</span>
          </div>
        </div>
        <div className={styles.tabsWrapper}>
          {actionTab === 1 && (
            <div className={styles.marketsWrapper}>
              <div className={styles.sideWrapper}>
                <div className={styles.marketTitle}>{formatMessage({ id: 'trade.box.buy' })}</div>
                {renderBids.map((t, idx) => (
                  <div className={cs(styles.tableRow)} key={t.priceString || idx}>
                    {t.barBgRight && (
                      <div
                        style={{
                          transform: `translateX(${t.barBgRight})`
                        }}
                        className={cs(styles.bar, styles.bidBar)}
                      ></div>
                    )}
                    <div className={cs(styles.vol)}>{t.quanString || '--'}</div>
                    <div className={cs(styles.price, styles.buy)}>{t.priceString || '--'}</div>
                  </div>
                ))}
              </div>
              <div className={styles.sideWrapper}>
                <div className={styles.marketTitle}>{formatMessage({ id: 'trade.box.sell' })}</div>
                {renderAsks.map((t, idx) => (
                  <div className={cs(styles.tableRow)} key={t.priceString || idx}>
                    {t.barBgRight && (
                      <div
                        style={{
                          transform: `translateX(-${t.barBgRight})`
                        }}
                        className={cs(styles.bar, styles.askBar)}
                      ></div>
                    )}
                    <div className={cs(styles.price, styles.sell)}>{t.priceString || '--'}</div>
                    <div className={cs(styles.vol)}>{t.quanString || '--'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {actionTab === 2 && (
            <div className={styles.tradesWrapper}>
              {renderTrades.map(t => (
                <div className={cs(styles.tableRow)} key={t.id}>
                  <div
                    className={cs(styles.price, {
                      [styles.buy]: t.T === 1,
                      [styles.sell]: t.T === 2
                    })}
                  >
                    {cutFloatDecimal(t.p, priceScale) || '--'}
                  </div>
                  <div style={{ color: 'var(--main-text-1)' }} className={styles.vol}>
                    {cutFloatDecimal(t.q, quantityScale) || '--'}
                  </div>
                  <div className="color-middle">{t.t ? timeToString(t.t, 'HH:mm:ss') : '--'}</div>
                </div>
              ))}
            </div>
          )}
          {actionTab === 3 && <Info currency={currency} />}
        </div>
      </div>
      <div className={styles.bottomAction}>
        <div className={styles.bottomInner}>
          <Button
            inline
            className={cs(styles.bottomBtn, 'f-14 m-r-5')}
            type="primary"
            onClick={() => {
              router.push({
                pathname: `/margin/spot`,
                hash: `#${currency}_${market}`,
                state: {
                  dir: 'bid'
                }
              });
            }}
          >
            {formatMessage({ id: 'trade.box.buy' })}
          </Button>
          <Button
            inline
            className={cs(styles.bottomBtn, 'f-14')}
            type="warning"
            onClick={() => {
              router.push({
                pathname: `/margin/spot`,
                hash: `#${currency}_${market}`,
                state: {
                  dir: 'ask'
                }
              });
            }}
          >
            {formatMessage({ id: 'trade.box.sell' })}
          </Button>
        </div>
      </div>
      <Modal popup animationType="slide-up" visible={intervalModalVisible} onClose={() => setIntervalModalVisible(false)}>
        <div className={styles.singleSelect}>
          {Object.keys(supportedResolutions).map((k, i) => (
            <div
              className={cs(styles.singleSelectOption, tvInterval === supportedResolutions[k] && styles.activeOption)}
              key={k}
              onClick={() => {
                setResolution(supportedResolutions[k]);
                setIntervalModalVisible(false);
              }}
            >
              {k}
            </div>
          ))}
          <div className={cs(styles.singleSelectOption, styles.singleSelectCancel)} onClick={() => setIntervalModalVisible(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </div>
        </div>
      </Modal>
      <Pairs visible={pairsModalVisible} onClose={() => setPairsModalVisible(false)} />
    </>
  );
};

export default connect(({ trading, auth, setting }) => ({
  user: auth.user,
  currentPair: trading.currentPair,
  asks: trading.asks,
  bids: trading.bids,
  trades: trading.trades,
  theme: setting.theme
}))(KlineTrade);
