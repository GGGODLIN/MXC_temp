import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { WingBlank, Toast } from 'antd-mobile';
import { flattenDepth } from 'lodash';

import styles from './index.less';
import Banner from './Banner';
import EnterBanner from './EnterBanner';
import Message from './Message';
import FraudModal from '@/components/Temporary/FraudModal';

import enter1 from '@/assets/img/home/margin.png';
import enter2 from '@/assets/img/home/otc.png';
import money from '@/assets/img/home/money.png';
import clock from '@/assets/img/home/clock.png';
import Market from './Market';
import Fiat from '@/components/Fiat';
import ConvenientEntrance from './ConvenientEntrance.js';
import DeskGuide from './DeskGuide';
const PairItem = ({ item }) => {
  return (
    <div className={styles.topPair} onClick={() => router.push(`/trade/spot#${item.currency}_${item.market}`)}>
      <p>
        {`${item.currency}/${item.market}`}
        <span style={{ color: item.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }} className={styles.rate}>
          {item.rate >= 0 && '+'}
          {(item.rate * 100).toFixed(2)}%
        </span>
      </p>
      <div style={{ color: item.rate >= 0 ? 'var(--up-color)' : 'var(--down-color)' }}>
        <b>{`${item.c}`}</b>
        <i className={styles.fiat}>
          <Fiat value={item.c} market={item.market}></Fiat>
        </i>
      </div>
    </div>
  );
};

const TopPair = [
  { currency: 'BTC', market: 'USDT' },
  { currency: 'ETH', market: 'USDT' },
  { currency: 'MX', market: 'USDT' }
];

class Home extends React.Component {
  componentDidMount() {}
  getPart = (a, b) => {
    const { markets, firstMarkets } = this.props;
    const allMarket = flattenDepth(
      (markets || firstMarkets).map(item => item.list),
      1
    );
    return allMarket.find(item => item.market === b && item.currency === a);
  };

  render() {
    const { markets, firstMarkets, homeModalList } = this.props;
    const allMarket = flattenDepth(
      (markets || firstMarkets).map(item => item.list),
      1
    );

    return (
      <>
        <Banner></Banner>
        <Message></Message>
        <div className={styles.topPairs}>
          {TopPair.map(
            item =>
              this.getPart(item.currency, item.market) &&
              this.getPart(item.currency, item.market).status !== 4 && (
                <PairItem key={item.currency} item={this.getPart(item.currency, item.market)}></PairItem>
              )
          )}
        </div>
        {/* <div className={styles.enters}> */}
        {/* <div onClick={() => router.push('/event/activity')}>
              {formatMessage({ id: 'home.title.discover' })}
              <p>{formatMessage({ id: 'home.title.news_sub' })}</p>
            </div> */}
        {/* <div className={styles.left} onClick={() => router.push('/pos/list')}>
              <div>
                <b>{formatMessage({ id: 'home.title.ybb' })}</b>
                <p>{formatMessage({ id: 'home.title.ybb_desc' })}</p>
              </div>
              <img src={money} alt="pos" />
            </div>
            <div className={styles.right}> */}
        {/* <div onClick={() => router.push('/margin/spot')}>
                <img src={enter1} style={{ bottom: '8px' }} alt="card" />
                {formatMessage({ id: 'margin.title.margin' })}
              </div> */}
        {/* <div onClick={() => router.push('/otc/quickTrading')}>
                <img src={enter2} style={{ bottom: '8px' }} alt="card" />
                {formatMessage({ id: 'home.title.fiat' })}
              </div> */}
        {/*合约还未上线，暂时将合约交易换为投票上币*/}
        {/*<div onClick={() => Toast.info(formatMessage({ id: 'home.title.swap_tip' }), 1)}>*/}
        {/*  {formatMessage({ id: 'header.title.swap' })}*/}
        {/*  <img src={enter2} style={{ bottom: '8px' }} alt="card" />*/}
        {/*</div>*/}
        {/* <div onClick={() => router.push('/voting/index')}>
              {formatMessage({ id: 'voting.index.nav' })}
              <img src={enter2} style={{ bottom: '8px' }} alt="card" />
            </div> */}
        {/* </div>
          </div>

          <div className={styles.halve}>
            <div className={styles.clock}>
              <img src={clock} alt="card" />
            </div>
            <div>{formatMessage({ id: 'home.activity.title' })}</div>
            <span onClick={() => router.push('/halving/list')}>{formatMessage({ id: 'ucenter.api.notice.2.2' })}</span>
          </div> */}
        <EnterBanner></EnterBanner>
        <ConvenientEntrance />
        <Market allMarket={allMarket}></Market>
        {homeModalList[0] === 1 && <FraudModal />}
        <DeskGuide />
      </>
    );
  }
}

export default connect(({ auth, trading, global }) => ({
  user: auth.user,
  markets: trading.markets,
  firstMarkets: trading.firstLoadedMarkets,
  homeModalList: global.homeModalList
}))(Home);
