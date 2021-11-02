import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import styles from './index.less';
import PopularCurrency from '../webCurrency';
import classNames from 'classnames';
import { getZones, getZonesInfo } from '@/services/api';
const Deif = ({ solanaZoneCurrency, solanaZoneEtfCurrency, markets }) => {
  const [introduceType, setIntroduceType] = useState(false);
  const [zones, setZones] = useState({});
  const [zonesCoinList, setZonesCoinList] = useState();
  const [zonesEtfCoinList, setZonesEtfCoinList] = useState();
  const [etfList, setEtfList] = useState([]);
  const [introduction, setIntroduction] = useState();
  useEffect(() => {
    getPartition();
    getInfo();
  }, []);

  useEffect(() => {
    if (markets.length > 0 && zones) {
      marketsFilter();
    }
  }, [markets, zones]);

  useEffect(() => {
    if (zonesEtfCoinList && zonesCoinList) {
      marketEtf();
    }
  }, [zonesEtfCoinList, zonesCoinList]);

  const marketsFilter = () => {
    let filterList = intersectionCoin(markets, zones.entryKey);
    const zonesEtf = markets.filter(item => item.etf === true);
    setZonesEtfCoinList(zonesEtf);
    setZonesCoinList(filterList);
  };

  const marketEtf = () => {
    let list = [];
    zonesCoinList.forEach(item => {
      zonesEtfCoinList.forEach(c => {
        const etfCurrency = c.currency.slice(0, -2);
        let p = c.currency.substr(-1);
        if (etfCurrency === item.currency) {
          if (p === 'S') {
            list.push(c);
          } else {
            list.unshift(c);
          }
        }
      });
    });
    setEtfList(list);
  };
  const intersectionCoin = (nums1, nums2) => {
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
      const bscData = res.data.find(item => item.entryKey === 'mc-trade-zone-SOL');
      setZones(bscData);
    }
  };
  const getInfo = async () => {
    let params = {
      plateKey: 'mc-trade-zone-SOL'
    };
    const res = await getZonesInfo(params);
    if (res.code === 200) {
      setIntroduction(res.data.introduce);
    }
  };

  return (
    <div className={styles.ecologyContent}>
      <TopBar>{formatMessage({ id: 'mc_defi_solana_title' })}</TopBar>
      <div className={styles.headerBg}>
        <div className={styles.title}>{formatMessage({ id: 'mc_defi_solana_title' })}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.infoContent}>
          <div className={styles.introduction}>
            <div className={classNames(introduceType === true ? styles.infoOpen : styles.info)}>{introduction}</div>
          </div>
          <PopularCurrency title={formatMessage({ id: 'mc_defi_solana_projects' })} type="polkaETF" list={etfList} />
        </div>
        <PopularCurrency title={formatMessage({ id: 'ecology.etfZone.hot' })} type="polka" list={zonesCoinList} />
      </div>
    </div>
  );
};

export default connect(({ auth, trading, etfIndex, defi }) => ({
  user: auth.user,
  markets: trading.originMarkets,
  netValues: etfIndex.netValues,
  coinList: etfIndex.coinList,
  defiCurrency: defi.defiCurrency,
  solanaZoneCurrency: defi.solanaZoneCurrency,
  solanaZoneEtfCurrency: defi.solanaZoneEtfCurrency
}))(Deif);