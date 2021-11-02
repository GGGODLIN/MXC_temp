import { useState, useEffect } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import PopularCurrency from '../popularCurrency';
import classNames from 'classnames';
// import ThemeOnly from '@/components/ThemeOnly';
import { getZones, getZonesInfo } from '@/services/api';

const Deif = ({ markets }) => {
  const [introduceType, setIntroduceType] = useState(false);
  const [zones, setZones] = useState({});
  const [zonesCoinList, setZonesCoinList] = useState([]);
  const [introduction, setIntroduction] = useState();

  useEffect(() => {
    getPartition();
    getInfo();
  }, []);

  useEffect(() => {
    if (markets.length > 0) {
      marketsFilter();
    }
  }, [markets, zones]);

  const marketsFilter = () => {
    let filterList = intersection(markets, zones?.entryKey);
    setZonesCoinList(filterList);
  };
  const intersection = (nums1, nums2) => {
    return [
      ...new Set(
        nums1.filter(item => {
          return item.conceptPlate.includes(nums2);
        })
      )
    ];
  };
  const getPartition = async () => {
    const res = await getZones();
    if (res.code === 200) {
      const bscData = res.data.find(item => item.entryKey === 'mc-trade-zone-bsc');
      setZones(bscData);
    }
  };
  const getInfo = async () => {
    let params = {
      plateKey: 'mc-trade-zone-bsc'
    };
    const res = await getZonesInfo(params);
    if (res.code === 200) {
      setIntroduction(res.data.introduce);
    }
  };
  return (
    <>
      <div className={styles.ecologyContent}>
        <TopBar>{formatMessage({ id: 'mc_defi_bsc_title' })}</TopBar>
        <div className={styles.headerBg}>
          <div className={styles.title}>{formatMessage({ id: 'mc_defi_bsc_title' })}</div>
        </div>
        <div className={styles.content}>
          <div className={styles.infoContent}>
            <div className={styles.introduction}>
              <div className={classNames(introduceType === true ? styles.infoOpen : styles.info)}>{introduction}</div>
            </div>
          </div>
          <PopularCurrency title={formatMessage({ id: 'ecology.etfZone.hot' })} type="polka" list={zonesCoinList} />
        </div>
      </div>
    </>
  );
};

export default connect(({ auth, trading, etfIndex, defi }) => ({
  user: auth.user,
  markets: trading.originMarkets,
  netValues: etfIndex.netValues,
  coinList: etfIndex.coinList,
  storageCurrency: defi.storageCurrency,
  defiCurrency: defi.defiCurrency,
  bscCurrency: defi.bscCurrency,
  LayerEtfCurrency: defi.LayerEtfCurrency
}))(Deif);
