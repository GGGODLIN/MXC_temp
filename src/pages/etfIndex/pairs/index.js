import { useEffect } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import styles from './index.less';

const lang = getLocale();
let timer = null;

const Record = ({ etfItem, coinList, dispatch }) => {
  const renderList = coinList.sort((a, b) => b.etfRate - a.etfRate);

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

  return (
    <>
      <TopBar>{formatMessage({ id: 'etfIndex.pairs.weight' })}</TopBar>
      <div className={styles.head}>{lang.startsWith('zh') ? etfItem.name : etfItem.nameEn}</div>
      <div className={styles.table}>
        <div className={styles.thead}>
          <label htmlFor="">{formatMessage({ id: 'etfIndex.index.component' })}</label>
          <label htmlFor="">{formatMessage({ id: 'etfIndex.hold.ratio' })}</label>
          <label htmlFor="">{formatMessage({ id: 'trade.list.price' })}</label>
        </div>
        <div className={styles.tbody}>
          {renderList.map(item => (
            <div className={styles.td}>
              <span>{item.coin}</span>
              <span>{(item.etfRate * 100).toFixed(2)}%</span>
              <span>{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default connect(({ auth, etfIndex }) => ({
  user: auth.user,
  ...etfIndex
}))(Record);
