import TopBar from '@/components/TopBar';
import { connect } from 'dva';
import styles from './index.less';
import { Modal } from 'antd-mobile';
import { useState, useEffect } from 'react';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { gotoCrossPlatformUrl } from '@/utils';
import { getEtfRankList, getEtfRankInfo } from '@/services/api';
import ShareImg from './shareImg';
import Rank1 from '@/assets/img/contract/rank_1.png';
import Rank2 from '@/assets/img/contract/rank_2.png';
import Rank3 from '@/assets/img/contract/rank_3.png';
import cs from 'classnames';

const rankImage = [null, <img src={Rank1} />, <img src={Rank2} />, <img src={Rank3} />];
const rankTabInfo = {
  TODAY: formatMessage({ id: 'etf.rank.today_my_highest' }),
  BEFORE_WEEK: formatMessage({ id: 'etf.rank.7_day_my_highest' }),
  HISTORY: formatMessage({ id: 'etf.rank.history_my_highest' })
};

const initInfo = {
  currency: '',
  incomeAmount: 0
};
const EtfRank = ({ token }) => {
  const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';
  const [shareVisible, setShareVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('TODAY');
  const [rankList, setRankList] = useState([]);
  const [rankItemInfo, setRankItemInfo] = useState({ ...initInfo });
  const [selfInfo, setSelfInfo] = useState({});
  const [todayCurrency, setTodayCurrency] = useState('--');
  const [modalVisible, setModalVisible] = useState(false);
  const getRankList = () => {
    setRankList([]);
    setRankItemInfo({ ...initInfo });
    getEtfRankList({ type: activeTab }).then(res => {
      if (res.code === 200) {
        const { rankingList, incomeAmount, currency } = res.data;
        setRankList(rankingList);
        setRankItemInfo({ incomeAmount, currency });
        if (activeTab === 'TODAY') {
          setTodayCurrency(currency);
        }
      }
    });
  };
  const getRankInfo = () => {
    getEtfRankInfo().then(res => {
      if (res.code === 200) {
        let { incomeRate, rank, incomeAmount } = res.data;
        incomeRate = incomeRate > 10 ? 0 : incomeRate;
        rank = incomeRate > 10 ? '500+' : rank;
        setSelfInfo({ incomeRate, rank, incomeAmount, ...selfInfo });
      }
    });
  };
  useEffect(() => {
    getRankInfo();
  }, []);

  useEffect(() => {
    getRankList();
  }, [activeTab]);

  const toShare = () => {
    if (fromApp) {
      gotoCrossPlatformUrl(
        `callEtfShare?incomeRate=${selfInfo.incomeRate || 0}&rank=${(selfInfo.rank > 500 ? '500%2b' : encodeURIComponent(selfInfo.rank)) ||
          '--'}&currency=${todayCurrency}`
      );
    } else {
      setShareVisible(true);
    }
  };

  return (
    <div>
      <TopBar gotoPath={'/'}>{formatMessage({ id: 'etf.rank' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.rankTitle}>{formatMessage({ id: 'etf.rank.title' })}</p>
          <p className={styles.introduce}>{formatMessage({ id: 'etf.rank.introduce' })}</p>
          {fromApp && (
            <span onClick={() => gotoCrossPlatformUrl('personal_center')} className={styles.nickNameSet}>
              {formatMessage({ id: 'swap.rank.nickNameSetting' })}
            </span>
          )}
        </div>
        <div className={styles.etfRankInfo}>
          <div className={styles.infoRow}>
            <div>
              <b className={cs([selfInfo.incomeRate > 0 ? styles.up : '', selfInfo.incomeRate < 0 ? styles.down : ''])}>
                {selfInfo.incomeRate > 0 && '+'}
                {((selfInfo.incomeRate || 0) * 100).toFixed(2)}%
              </b>
              <span>{formatMessage({ id: 'etf.rank.my_today_rate' })}</span>
            </div>
            <div>
              <b>{selfInfo.rank > 500 ? '500+' : selfInfo.rank}</b>
              <span>{formatMessage({ id: 'etf.rank.my_today_rate_rank' })}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div>
              <b className={cs([selfInfo.incomeAmount > 0 ? styles.up : '', selfInfo.incomeAmount < 0 ? styles.down : ''])}>
                {selfInfo.incomeAmount > 0 && '+'}
                {(selfInfo.incomeAmount || 0).toFixed(2)}&nbsp;
              </b>
              <span>{formatMessage({ id: 'etf.rank.my_today_amount' })}(USDT)</span>
            </div>
            <div className={styles.btns}>
              <span onClick={() => setModalVisible(true)}>{formatMessage({ id: 'swap.rank.explain' })}</span>
              <span onClick={toShare}>
                <i className="iconfont iconshare1"></i> {formatMessage({ id: 'swap.rank.share' })}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.tabs}>
          <span onClick={() => setActiveTab('TODAY')} className={activeTab === 'TODAY' ? styles.active : ''}>
            {formatMessage({ id: 'etf.rank.today_highest' })}
          </span>
          <span onClick={() => setActiveTab('BEFORE_WEEK')} className={activeTab === 'BEFORE_WEEK' ? styles.active : ''}>
            {formatMessage({ id: 'etf.rank.7_day_highest' })}
          </span>
          <span onClick={() => setActiveTab('HISTORY')} className={activeTab === 'HISTORY' ? styles.active : ''}>
            {formatMessage({ id: 'etf.rank.history_highest' })}
          </span>
        </div>
        <div className={styles.rankList}>
          <div className={styles.myRankInfo}>
            <span>
              {rankTabInfo[activeTab]}({rankItemInfo.currency || '--'})
            </span>
            <b className={cs([rankItemInfo.incomeAmount > 0 ? styles.up : '', rankItemInfo.incomeAmount < 0 ? styles.down : ''])}>
              {rankItemInfo.incomeAmount > 0 && '+'}
              {(rankItemInfo.incomeAmount || 0).toFixed(2)}&nbsp;USDT
            </b>
          </div>
          {rankList.map((item, index) => {
            const rank = index + 1;
            return (
              <div key={index} className={styles.rankItem}>
                <span className={styles.left}>{rank < 4 ? rankImage[rank] : rank}</span>
                <span className={styles.mid}>
                  <span>{item.nickname ? item.nickname : '****'}</span>
                  <span>{item.uid ? item.uid : '****'}</span>
                </span>

                <span className={styles.right}>
                  <span className={cs([styles.right, item.incomeAmount > 0 ? styles.up : '', item.incomeAmount < 0 ? styles.down : ''])}>
                    {item.incomeAmount > 0 && '+'}
                    {item.incomeAmount && item.incomeAmount.toFixed(2)}&nbsp;USDT
                  </span>
                  <span className={styles.symbol}>{item.currency}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        transparent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={formatMessage({ id: 'swap.rank.explain' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setModalVisible(false) }]}
      >
        <div className={styles.modalContent}>
          <div>{formatMessage({ id: 'etf.rank.explain1' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain2' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain3' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain4' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain5' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain6' })}</div>
          <div>{formatMessage({ id: 'etf.rank.explain7' })}</div>
        </div>
      </Modal>

      <ShareImg visible={shareVisible} setVisible={setShareVisible} info={selfInfo} />
    </div>
  );
};

export default connect(({ auth }) => ({
  token: auth.user.token
}))(EtfRank);
