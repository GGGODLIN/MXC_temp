import React, { useState } from 'react';
import { connect } from 'dva';
import { Modal, Button, Flex } from 'antd-mobile';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import Subscribe from './Subscribe';
import Redemption from './Redemption';
import styles from './index.less';

const _orderStatuMap = {
  CREATE: formatMessage({ id: 'etfIndex.orders.status.CREATE' }),
  PROCESSING: formatMessage({ id: 'etfIndex.orders.status.PROCESSING' }),
  FAIL: formatMessage({ id: 'etfIndex.orders.status.FAIL' }),
  CANCEL: formatMessage({ id: 'etfIndex.orders.status.CANCEL' }),
  DONE: formatMessage({ id: 'order.table.status.deal_done' })
};

const lang = getLocale();

const Record = ({ dispatch, location, symbols }) => {
  const [type, setType] = useState(location.query.tabKey || 'subscribe');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currency, setCurrency] = useState('');
  const [status, setStatus] = useState('');

  const reset = e => {
    setCurrency('');
    setStatus('');
  };

  const switchFilterOpen = e => {
    setFilterOpen(!filterOpen);
  };

  const props = {
    dispatch,
    currency,
    status
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'etfIndex.orders.title' })}</TopBar>
      <div className={styles.header}>
        <span className={classNames({ [styles.active]: type === 'subscribe' })} onClick={() => setType('subscribe')}>
          {formatMessage({ id: 'etfIndex.order.bid.tab' })}
        </span>
        <span className={classNames({ [styles.active]: type === 'redemption' })} onClick={() => setType('redemption')}>
          {formatMessage({ id: 'etfIndex.order.ask.tab' })}
        </span>
        <div className={styles.filterBtn} onClick={switchFilterOpen}>
          <i className="iconfont iconshaixuan"></i>
        </div>
      </div>
      {type === 'subscribe' ? <Subscribe {...props} /> : <Redemption {...props} />}
      <Modal className="am-modal-popup-slide-left" transitionName="am-slide-left" popup visible={filterOpen} onClose={switchFilterOpen}>
        <div className={styles.filter}>
          <div>
            <Flex justify="between" className={styles['filter-title']}>
              <h3>{formatMessage({ id: 'otcfiat.Order.screening' })}</h3>
            </Flex>
            <div className={styles['filter-section']}>
              <h4>{formatMessage({ id: 'etfIndex.order.bid.title1' })}</h4>
              <Flex justify="between" wrap="wrap">
                {symbols.map(el => (
                  <span
                    onClick={e => setCurrency(el.symbol)}
                    className={classNames(styles['filter-btn'], { [styles.current]: currency === el.symbol })}
                  >
                    {lang.startsWith('zh') ? el.name : el.nameEn}
                    <svg aria-hidden="true">
                      <use xlinkHref="#icongouxuan"></use>
                    </svg>
                  </span>
                ))}
              </Flex>
            </div>
            <div className={styles['filter-section']}>
              <h4>{formatMessage({ id: 'assets.recharge.status' })}</h4>
              <Flex justify="between" wrap="wrap">
                {Object.keys(_orderStatuMap).map(el => (
                  <span onClick={e => setStatus(el)} className={classNames(styles['filter-btn'], { [styles.current]: status === el })}>
                    {_orderStatuMap[el]}
                    <svg aria-hidden="true">
                      <use xlinkHref="#icongouxuan"></use>
                    </svg>
                  </span>
                ))}
              </Flex>
            </div>
          </div>
          <div className={styles['filter-handle']}>
            <Button inline type="ghost" onClick={reset}>
              {formatMessage({ id: 'otcfiat.Its.reset' })}
            </Button>
            <Button inline type="primary" onClick={switchFilterOpen}>
              {formatMessage({ id: 'common.sure' })}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default connect(({ auth, etfIndex }) => ({
  user: auth.user,
  ...etfIndex
}))(Record);
