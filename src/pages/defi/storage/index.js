import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import styles from './index.less';
import { getZones, getZonesInfo } from '@/services/api';
import PopularCurrency from '../popularCurrency';
import classNames from 'classnames';
const Deif = ({ markets }) => {
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
        if (etfCurrency === item.currency) {
          list.push(c);
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
      const bscData = res.data.find(item => item.entryKey === 'mc-trade-zone-storage');
      setZones(bscData);
    }
  };
  const getInfo = async () => {
    let params = {
      plateKey: 'mc-trade-zone-storage'
    };
    const res = await getZonesInfo(params);
    if (res.code === 200) {
      setIntroduction(res.data.introduce);
    }
  };
  return (
    <div className={styles.ecologyContent}>
      <TopBar>{formatMessage({ id: 'ecology.storage.title' })}</TopBar>
      <div className={styles.headerBg}>
        <div className={styles.title}> {formatMessage({ id: 'ecology.storage.title' })}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.infoContent}>
          <div className={styles.introduction}>
            <div className={classNames(introduceType === true ? styles.infoOpen : styles.info)}>
              {introduction}
              <div
                className={classNames(introduceType === true ? styles.closeBtn : styles.openBtn)}
                onClick={() => {
                  setIntroduceType(!introduceType);
                }}
              >
                {introduceType === true ? (
                  <div>
                    <span>
                      {' '}
                      {formatMessage({ id: 'ecology.function.PackUp' })}
                      <div className={styles.close}></div>
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className={styles.point}>...</span>
                    <span>
                      {formatMessage({ id: 'ecology.function.open' })}
                      <div className={styles.open}></div>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <PopularCurrency title={formatMessage({ id: 'ecology.etfZone.hot' })} type="storage" list={zonesCoinList} />
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
  polkaCurrency: defi.polkaCurrency,
  storageCurrency: defi.storageCurrency
}))(Deif);
