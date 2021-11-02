import { useState, useEffect } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { Button, Modal } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import classNames from 'classnames';
import OriginalKline from './OriginalKline';
import SymbolsPopup from '../components/SymbolsPopup';

import styles from './index.less';

const lang = getLocale();

let timer = null;

const Spot = ({ netValues, etfItem, symbols, dispatch }) => {
  const [symbolsPopupVisible, setSymbolsPopupVisible] = useState(false);
  const [introduceVisible, setIntroduceVisible] = useState(false);

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
      return <i>+{(val * 100).toFixed(2)}%</i>;
    } else {
      return <i>{(val * 100).toFixed(2)}%</i>;
    }
  };

  const switchSymbolsPopupOpen = e => {
    setSymbolsPopupVisible(!symbolsPopupVisible);
  };

  const switchIntroduceVisible = e => {
    setIntroduceVisible(!introduceVisible);
  };

  return (
    <>
      <TopBar gotoPath="/">{formatMessage({ id: 'etfIndex.header.title' })}</TopBar>
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.name}>
            <i className="iconfont iconliebiaoxiangyou" onClick={switchSymbolsPopupOpen}></i>
            <span onClick={switchSymbolsPopupOpen}>{lang.startsWith('zh') ? etfItem.name : etfItem.nameEn}</span>
            <i className="iconfont iconquestion-circle" onClick={switchIntroduceVisible}></i>
          </div>
          <div className={classNames(styles.price, netValues.rangeRate < 0 && styles.down)}>
            <span>{netValues.netValue || '--'}</span>
            {clacRangeRate(netValues.rangeRate)}
          </div>
        </div>
        <div className={styles.right}>
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
      <OriginalKline />
      <div className={styles.btnWrap}>
        <div>
          <Button type="primary" onClick={e => router.push(`/etfIndex/trading?type=bids#${etfItem.symbol}`)}>
            {formatMessage({ id: 'etfIndex.bid.title' })}
          </Button>
        </div>
        <div>
          <Button type="warning" onClick={e => router.push(`/etfIndex/trading?type=asks#${etfItem.symbol}`)}>
            {formatMessage({ id: 'etfIndex.ask.title' })}
          </Button>
        </div>
      </div>
      <SymbolsPopup visible={symbolsPopupVisible} onClose={switchSymbolsPopupOpen} />
      <Modal
        transparent
        visible={introduceVisible}
        title={formatMessage({ id: 'etfIndex.index.desc.title' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: switchIntroduceVisible }]}
      >
        <div className={styles.desc}>
          <p>{formatMessage({ id: 'etfIndex.index.desc.text1' })}</p>
          <p>{formatMessage({ id: 'etfIndex.index.desc.text2' })}</p>
          <a href={lang.startsWith('zh') ? `${HC_PATH}/hc/zh-cn/articles/360043486692` : `${HC_PATH}/hc/en-001/articles/360043929051`}>
            {formatMessage({ id: 'etfIndex.index.desc.link' })}
          </a>
        </div>
      </Modal>
    </>
  );
};

export default connect(({ etfIndex }) => ({
  ...etfIndex
}))(Spot);
