import { useEffect, useState } from 'react';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { numberToString } from '@/utils';
import { getHoldCurrency, getAssetBalance, queryTradeAmount } from '@/services/api';

import styles from './Qualified.less';

const lang = getLocale();

const Qualified = ({ info }) => {
  const { pid, expandInfo = {}, expandTradeVO = {} } = info;
  const currency = expandInfo.holdCurrency || '';
  const [mainData, setMainData] = useState(0);
  const [levelNum, setLevelNum] = useState(0);
  const [tradeAmount, setTradeAmount] = useState({});
  const limitJson = expandInfo.addLimitJson ? JSON.parse(expandInfo.addLimitJson) : [];
  const holdDays = expandInfo.addHoldDays !== null ? expandInfo.addHoldDays : 3;

  useEffect(() => {
    if (currency) {
      if (info.zone === 'MDAY') {
        getMx();
      }
      getMain(currency);
      getTradeAmount(pid);
    }
  }, [currency]);

  const getMain = async currency => {
    const res = await getAssetBalance({ currency });
    const { balances, code } = res;

    if (code === 0) {
      setMainData(numberToString(balances[currency].available));
    }
  };

  const getTradeAmount = async pid => {
    const res = await queryTradeAmount({ pid });
    const { data, code } = res;

    if (code === 0) {
      setTradeAmount(data);
    }
  };

  const getMx = async () => {
    const res = await getHoldCurrency({ currency: 'MX', holdDays });
    const { data, code } = res;

    if (code === 0) {
      const minHold = data.length ? Math.min(...data.map(item => item.holdAmount)) : 0;
      let num = 0;

      limitJson.forEach((item, index) => {
        if (minHold < item.start && item.limit === 1) {
          num = 0;
        } else if (!item.end && minHold >= item.start) {
          num = item.limit;
        } else if (minHold >= item.start && minHold < item.end) {
          num = item.limit;
        }
      });

      setLevelNum(num);
    }
  };

  return (
    <div className={styles.listItem}>
      <h1>{formatMessage({ id: 'mday.qualified.title' })}</h1>
      {/* {info.zone === 'MDAY' && (
        <div className={styles.item}>
          <div>MX{formatMessage({ id: 'mday.mx.level' })}</div>
          <div>LV{levelNum}</div>
        </div>
      )} */}
      {info.expandTradeVO ? (
        <>
          {expandTradeVO.tradeType === 1 && (
            <div className={styles.item}>
              <div>
                {formatMessage({ id: 'ucenter.api.type.normal' })}
                {lang.startsWith('zh') ? '' : ' '}
                {formatMessage({ id: 'mday.qualified.trade.text' })}
              </div>
              <div>{tradeAmount.spotTradeAmount} USDT</div>
            </div>
          )}
          {expandTradeVO.tradeType === 2 && (
            <div className={styles.item}>
              <div>
                {formatMessage({ id: 'ucenter.api.type.margin' })}
                {lang.startsWith('zh') ? '' : ' '}
                {formatMessage({ id: 'mday.qualified.trade.text' })}
              </div>
              <div>{tradeAmount.marginTradeAmount} USDT</div>
            </div>
          )}
          {expandTradeVO.tradeType === 3 && (
            <>
              <div className={styles.item}>
                <div>
                  {formatMessage({ id: 'ucenter.api.type.normal' })}
                  {lang.startsWith('zh') ? '' : ' '}
                  {formatMessage({ id: 'mday.qualified.trade.text' })}
                </div>
                <div>{tradeAmount.spotTradeAmount} USDT</div>
              </div>
              <div className={styles.item}>
                <div>
                  {formatMessage({ id: 'ucenter.api.type.margin' })}
                  {lang.startsWith('zh') ? '' : ' '}
                  {formatMessage({ id: 'mday.qualified.trade.text' })}
                </div>
                <div>{tradeAmount.marginTradeAmount} USDT</div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {info.zone === 'MDAY' ? (
            <div className={styles.item}>
              <div>{formatMessage({ id: 'otcfiat.Available.credit' })}</div>
              <div>
                {mainData} {currency}
              </div>
            </div>
          ) : (
            info.limitJson &&
            JSON.parse(info.limitJson).length &&
            info.snapPosition > 0 && (
              <div className={styles.item}>
                <div>{formatMessage({ id: 'mday.qualified.head.title' })}</div>
                <div>
                  {info.snapPosition} {currency}
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Qualified;
