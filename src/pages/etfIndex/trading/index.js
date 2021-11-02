import { useState, useEffect } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { Popover } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import SymbolsPopup from '../components/SymbolsPopup';
import Action from './Action';
import Order from './Order';

import styles from './index.less';

const Item = Popover.Item;

const lang = getLocale();

let timer = null;

const Index = ({ etfItem, netValues, location, dispatch }) => {
  const [symbolsPopupVisible, setSymbolsPopupVisible] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const actionType = location.query.type || 'bids';

  useEffect(() => {
    if (etfItem.symbol) {
      const strs = etfItem.symbol.split('_');

      dispatch({ type: 'etfIndex/getEtfNetValue', payload: strs[0] });

      timer = window.setInterval(() => {
        dispatch({ type: 'etfIndex/getEtfNetValue', payload: strs[0] });
      }, 5000);
    }

    return () => {
      window.clearInterval(timer);
    };
  }, [etfItem]);

  const clacRangeRate = val => {
    if (!val) return '0.00%';

    if (val > 0) {
      return <span style={{ color: 'var(--up-color)' }}>+{(val * 100).toFixed(2)}%</span>;
    } else {
      return <span style={{ color: 'var(--down-color)' }}>{(val * 100).toFixed(2)}%</span>;
    }
  };

  const switchSymbolsPopupOpen = e => {
    setSymbolsPopupVisible(!symbolsPopupVisible);
  };

  const switchShowMore = e => {
    setShowMore(!showMore);
  };

  return (
    <>
      <TopBar gotoPath={`/etfIndex/spot#${etfItem.symbol}`}>
        {formatMessage({ id: 'etfIndex.bid.title' })}
        {formatMessage({ id: 'etfIndex.ask.title' })}
      </TopBar>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.name}>
            <i className="iconfont iconliebiaoxiangyou" onClick={switchSymbolsPopupOpen}></i>
            <label onClick={switchSymbolsPopupOpen}>{lang.startsWith('zh') ? etfItem.name : etfItem.nameEn}</label>
            <span className={styles.tag}>Index</span>
            {clacRangeRate(netValues.rangeRate)}
          </div>
          <div className={styles.handle}>
            <i className="iconfont iconMarginTrade" onClick={e => router.push(`/etfIndex/spot#${etfItem.symbol}`)}></i>
            <Popover
              visible={showMore}
              overlayClassName={styles.popover}
              onVisibleChange={switchShowMore}
              overlay={[
                <Item>
                  <span onClick={e => router.push(`/etfIndex/pairs#${etfItem.symbol}`)}>
                    {formatMessage({ id: 'etfIndex.pairs.weight' })}
                  </span>
                </Item>,
                <Item>
                  <a
                    style={{ color: 'var(--main-text-1)' }}
                    href={
                      lang.startsWith('zh') ? `${HC_PATH}/hc/zh-cn/articles/360043486692` : `${HC_PATH}/hc/en-001/articles/360043929051`
                    }
                  >
                    {formatMessage({ id: 'etfIndex.product.desc' })}
                  </a>
                </Item>
              ]}
            >
              <i className="iconfont iconellipsis"></i>
            </Popover>
          </div>
        </div>
        <div className={styles.price}>
          <div>
            <label>{formatMessage({ id: 'etfIndex.new.net_value' })}</label>
            <span>{netValues.netValue || '--'}</span>
          </div>
          <div>
            <label>{formatMessage({ id: 'etfIndex.high.price' })}</label>
            <span>{netValues.maxValue || '--'}</span>
          </div>
          <div>
            <label>{formatMessage({ id: 'etfIndex.low.price' })}</label>
            <span>{netValues.minValue || '--'}</span>
          </div>
        </div>
      </div>
      <Action actionType={actionType} />
      <Order />
      <SymbolsPopup visible={symbolsPopupVisible} onClose={switchSymbolsPopupOpen} />
    </>
  );
};

export default connect(({ etfIndex }) => ({
  ...etfIndex
}))(Index);
