import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import { getPoolDetail } from '@/services/api';
import { getSubSite } from '@/utils';

import Step from './Step';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import LockInfo from './LockInfo';
import HoldInfo from './HoldInfo';
import MarginInfo from './MarginInfo';

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
    <div>
      <TopBar>
        {info.currency}{' '}
        {info.type === 'LOCK' || info.type === 'MARGIN'
          ? formatMessage({ id: 'pos.title.detail.header_lock' }, { min: info.minLockDays })
          : formatMessage({ id: 'pos.title.pos_class_hold' })}
      </TopBar>
      <div>
        <div className={styles.head}>
          <div className={styles.coinInfo}>
            <div className={styles.name}>
              <img
                src={`${MAIN_SITE_API_PATH}/file/download/${coinList.find(coin => coin.vcoinName === info.currency) &&
                  coinList.find(coin => coin.vcoinName === info.currency).icon}`}
                alt=""
              />
              <h2>{info.currency}</h2>
            </div>
            <div className={styles.rate}>
              <b>
                {Boolean(info.profitRangeEnd * 1) && Boolean(info.profitRangeStart * 1) ? (
                  <>
                    {(info.profitRangeStart * 100).toFixed(2)}
                    <i>%</i>-{(info.profitRangeEnd * 100).toFixed(2)}
                    <i>%</i>
                  </>
                ) : (
                  <>
                    {(info.profitRate * 100).toFixed(2)}
                    <i>%</i>
                  </>
                )}
                {Boolean(info.additionProfitRate * 1) && (
                  <span className={styles.addition}>
                    +{(info.additionProfitRate * 100).toFixed(2)}
                    <i>%</i>
                  </span>
                )}
              </b>
              <span>{formatMessage({ id: 'assets.pool.modal.profit_rate' })}</span>
            </div>
          </div>
          <Step info={info}></Step>
        </div>
        {info.type === 'LOCK' && <LockInfo info={info} styles={styles} theme={theme}></LockInfo>}
        {info.type === 'HOLD' && <HoldInfo info={info} styles={styles} theme={theme}></HoldInfo>}
        {info.type === 'MARGIN' && <LockInfo info={info} styles={styles} theme={theme}></LockInfo>}
      </div>
    </div>
  );
};

export default connect(({ auth, global, setting }) => ({
  user: auth.user,
  coinList: global.coinList,
  theme: setting.theme
}))(Detail);
