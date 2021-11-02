import { useEffect, useState } from 'react';
import { getTopStart } from '@/services/api';
import { formatMessage } from 'umi-plugin-locale';
import { Tabs } from 'antd-mobile';
import MarketItem from '@/components/MarketItem';
import styles from './Market.less';
import cs from 'classnames';
const tabs = [
  {
    title: formatMessage({ id: 'home.title.week_Star' }),
    sub: '3'
  },
  { title: formatMessage({ id: 'home.title.gainers' }), sub: '1' },
  {
    title: formatMessage({ id: 'home.title.losers' }),
    sub: '2'
  }
];

const Market = ({ allMarket }) => {
  const [active, setActive] = useState('3');
  const upList = allMarket.filter(i => i.rate > 0 && i.status !== 4).sort((a, b) => b.rate - a.rate);
  const downList = allMarket.filter(i => i.rate < 0 && i.status !== 4).sort((a, b) => a.rate - b.rate);
  upList.length = 10;
  downList.length = 10;
  const [start, setStart] = useState([]);
  useEffect(() => {
    const getStart = () => {
      getTopStart().then(res => {
        if (res.code === 0) {
          let data = res.data
            .filter(i => i.status !== 4)
            .map(item => {
              return {
                ...item,
                currency: item.vcoinNameEn,
                market: item.marketName,
                q: item.sumTradePrice,
                c: item.latestTradePrice,
                rate: item.upOrDownRateValue,
                a: item.totalAmount
              };
            });
          data.length = 10;
          setStart(data);
        }
      });
    };
    getStart();
    const timer = setInterval(() => {
      getStart();
    }, 30000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const toggleTab = tab => {
    setActive(tab);
  };

  return (
    <div className={styles.market}>
      <div className={styles.tabs}>
        {tabs.map((v, index) => (
          <span
            key={index}
            className={cs([active === v.sub ? styles.active : '', v.sub === '2' ? styles.down : ''])}
            onClick={() => toggleTab(v.sub)}
          >
            {v.title}
          </span>
        ))}
      </div>
      <div className={styles.tableHeader}>
        <span className={styles.currency}>{formatMessage({ id: 'index.trans.viconto' })}</span>
        <span className={styles.price}>{formatMessage({ id: 'swap.typeTitle.newsPrice' })}</span>
        <span className={styles.rate}>{formatMessage({ id: 'home.title.rate' })}</span>
      </div>
      {active === '1' && (
        <div>
          {upList.map(item => (
            <MarketItem key={`${item.currency}_${item.market}`} item={item} show={true}></MarketItem>
          ))}
        </div>
      )}
      {active === '2' && (
        <div>
          {downList.map(item => (
            <MarketItem key={`${item.currency}_${item.market}`} item={item} show={true}></MarketItem>
          ))}
        </div>
      )}
      {active === '3' && (
        <div>
          {start.map(item => (
            <MarketItem key={item.vcoinId} item={item} show={true}></MarketItem>
          ))}
        </div>
      )}
    </div>
  );
};

export default Market;
