import TopBar from '@/components/TopBar';
import styles from './index.less';
import { Modal } from 'antd-mobile';
import { useState, useEffect } from 'react';
import Rank1 from '@/assets/img/contract/rank_1.png';
import Rank2 from '@/assets/img/contract/rank_2.png';
import Rank3 from '@/assets/img/contract/rank_3.png';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { connect } from 'dva';
import { getRankList, getRankSelf } from '@/services/contractapi';
import cs from 'classnames';
const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';
const ContractRank = ({ token }) => {
  const [activeTab, setActiveTab] = useState('2');
  const [rankList, setRankList] = useState([]);
  const [selfRate, setSelfRate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    getRankListFun();
    if (token) {
      getRankSelfFun();
    }
  }, [activeTab, token]);
  const getRankListFun = () => {
    getRankList(activeTab).then(res => {
      if (res.code === 0) {
        setRankList(res.data);
      }
    });
  };
  const getRankSelfFun = () => {
    getRankSelf(activeTab).then(res => {
      if (res.code === 0) {
        let data = res.data;
        if ((activeTab == '2' && data.profitRate > 700) || (activeTab == '1' && data.profitRate > 100)) {
          data.profitRate = '--';
        }
        setSelfRate(data);
      }
    });
  };
  const rankImage = {
    '1': <img src={Rank1} />,
    '2': <img src={Rank2} />,
    '3': <img src={Rank3} />
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'swap.rank.title' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.rankTitle}>{formatMessage({ id: 'swap.rank.title' })}</p>
          <p className={styles.introduce}>{formatMessage({ id: 'swap.rank.introduce' })}</p>
          {isApp && (
            <a href={isApp ? 'mxcappscheme://personal_center' : ''} className={styles.nickNameSetting}>
              {formatMessage({ id: 'swap.rank.nickNameSetting' })}
            </a>
          )}
        </div>
        <div className={styles.tabs}>
          <span onClick={() => setActiveTab('2')} className={activeTab === '2' ? styles.active : ''}>
            {formatMessage({ id: 'swap.rank.weekRank' })}
          </span>
          <span onClick={() => setActiveTab('1')} className={activeTab === '1' ? styles.active : ''}>
            {formatMessage({ id: 'swap.rank.dayRank' })}
          </span>
        </div>
        <div className={styles.myRate}>
          <div className={styles.left}>
            <span>{formatMessage({ id: activeTab === '2' ? 'swap.rank.weekRate' : 'swap.rank.dayRate' })}</span>
            <span className={selfRate.profitRate >= 0 ? styles.up : styles.down}>
              {selfRate.profitRate >= 0 && '+'}
              {!isNaN((selfRate.profitRate * 100).toFixed(2)) ? (selfRate.profitRate * 100).toFixed(2) + '%' : '--'}
            </span>
          </div>
          <div className={styles.right}>
            <span onClick={() => setModalVisible(true)}>{formatMessage({ id: 'swap.rank.explain' })}</span>
            <a href="appShare://callNativeShare">{formatMessage({ id: 'swap.rank.share' })}</a>
          </div>
        </div>
        <div className={styles.rankList}>
          {rankList.map((item, index) => (
            <div key={index} className={styles.rankItem}>
              <span className={styles.left}>{item.ranking < 4 ? rankImage[item.ranking] : item.ranking}</span>
              <span className={styles.mid}>
                <span>{item.nickName ? item.nickName : '****'}</span>
                <span>{item.digitalId ? item.digitalId : item.account}</span>
              </span>
              <span className={cs([styles.right, styles.up])}>
                {item.profitRate >= 0 && '+'}
                {(item.profitRate * 100).toFixed(2) + '%'}
              </span>
            </div>
          ))}
        </div>
        {/* <div className={styles.tips}>
            <p>说明</p>
            <p>
                1、如需以昵称方式在排行榜中显示，您可进入<a>个人中心</a>
        ，在个人中心左上角查看个人昵称并设置。如未进行昵称设置，排名榜将对您的账号进行脱敏显示
      </p>
            <p>
                2、周收益率：【所有交易对初始日期24点-结束日期24点的已实现盈亏求和+结束日期24点的未实现盈亏】/(初始日期24点账户权益+初始日期24点到结束日期24点期间净转入）(初始日期=结束日期往前推7天，折算成USDT)
      </p>
            <p>
                3、日收益率：【所有交易对初始时点-结束时点的已实现盈亏求和+结束时点的未实现盈亏】/(初始时点账户权益+初始时点到结束时点期间净转入）(初始时点=结束时点往前推24小时，折算成USDT)
      </p>
        </div> */}
      </div>
      <Modal
        transparent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={formatMessage({ id: 'swap.rank.explain' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setModalVisible(false) }]}
      >
        <div className={styles.modalContent}>
          <div>
            {formatMessage({ id: 'swap.rank.explain1-1' })}
            <a href={isApp ? 'mxcappscheme://personal_center' : ''}>{formatMessage({ id: 'swap.rank.explain1-2' })}</a>
            {formatMessage({ id: 'swap.rank.explain1-3' })}
          </div>
          <div>{formatMessage({ id: 'swap.rank.explain2' })}</div>
          <div>{formatMessage({ id: 'swap.rank.explain3' })}</div>
        </div>
      </Modal>
    </div>
  );
};

export default connect(({ auth }) => ({
  token: auth.user.token
}))(ContractRank);
