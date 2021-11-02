import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd-mobile';
import PushTable from './pushTable';
import SendPush from './sendPush';
import styles from './tab.less';
import { getpush } from '@/services/api';
import Empty from '@/components/Empty';
/*
 *循环当前所有的push列表
 */
const Tabactive = list => {
  let coins = [];
  Object.keys(list).forEach(item => {
    const tabName = list[item];
    for (let i = 0; i < tabName.length; i++) {
      const currencyName = tabName[i];

      const currencList = coins.find(c => c.title === currencyName.currency);

      if (!currencList) {
        coins.push({
          title: currencyName.currency,
          sub: currencyName.currency,
          pushselect: [
            {
              label: currencyName.market,
              value: currencyName.market
            }
          ],
          markets: [
            {
              buyFeeRate: currencyName.buyFeeRate, //买手续费
              currency: currencyName.currency,
              market: currencyName.market,
              minQuantity: currencyName.minQuantity,
              priceScale: currencyName.priceScale,
              quantityScale: currencyName.quantityScale,
              sellFeeRate: currencyName.sellFeeRate,
              sort: currencyName.sort
            }
          ]
        });
      } else {
        const CurrencyType = currencList.markets.find(m => m.market === currencyName.market);
        if (!CurrencyType) {
          currencList.markets.push({
            buyFeeRate: currencyName.buyFeeRate, //买手续费
            currency: currencyName.currency,
            market: currencyName.market,
            minQuantity: currencyName.minQuantity,
            priceScale: currencyName.priceScale,
            quantityScale: currencyName.quantityScale,
            sellFeeRate: currencyName.sellFeeRate,
            sort: currencyName.sort
          });
          currencList.pushselect.push({
            label: currencyName.market,
            value: currencyName.market
          });
        }
      }
    }
  });

  return coins;
};

function PushTableHeader(props) {
  const { dispatch } = props;
  const [pushlist, setpushlist] = useState({});
  const [list, setList] = useState([]);

  const [pid, setpid] = useState(1);
  const [selectlist, setselectlist] = useState([
    {
      label: '',
      value: ''
    }
  ]);
  const [pushInfo, setpushInfo] = useState([]);
  const [activeTab, setactiveTab] = useState([]);
  const pushType = props.pushType;
  useEffect(() => {
    const pushList = async () => {
      const res = await getpush();
      if (res.code === 0) {
        var arr = Object.keys(res.data);
        if (arr.length > 0) {
          setpushlist(res.data);
          setList(arr);
          const selectList = Tabactive(res.data);
          setselectlist(selectList[0].pushselect);
          setpushInfo(selectList[0].markets);
          setactiveTab(selectList[0]);
          dispatch({
            type: 'otc/changePushPrecision',
            payload: selectList[0].markets[0]
          });
          let marketsStringify = JSON.stringify(selectList[0].markets[0]);
          sessionStorage.setItem('pushAccuracy', marketsStringify);
        }
      }
    };
    pushList();
  }, []);
  const theCurrentTab = (tab, index, setselectlist, setpushInfo, setactiveTab) => {
    setselectlist(tab.pushselect);
    setpushInfo(tab.markets);
    setactiveTab(tab);
    dispatch({
      type: 'otc/changePushPrecision',
      payload: tab.markets[0]
    });
    let marketsStringify = JSON.stringify(tab.markets[0]);
    sessionStorage.setItem('pushAccuracy', marketsStringify);
  };
  return (
    <div className={styles.pushTabHeader}>
      {list.length > 0 ? (
        <Tabs
          tabs={Tabactive(pushlist)}
          tabBarBackgroundColor={'transparent'}
          swipeable={false}
          onChange={(tab, index) => theCurrentTab(tab, index, setselectlist, setpushInfo, setactiveTab)}
        >
          {pushType === true ? (
            <PushTable pushInfo={pushInfo} selectlist={selectlist} />
          ) : (
            <div className={styles.pushSendContentTab}>
              <SendPush pushInfo={pushInfo} selectlist={selectlist} activeTab={activeTab} pid={pid} />
            </div>
          )}
        </Tabs>
      ) : (
        <Empty />
      )}
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(PushTableHeader);
