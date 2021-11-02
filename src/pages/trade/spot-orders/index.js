import React, { useCallback, useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Flex, Button, Modal, Tabs, InputItem } from 'antd-mobile';

import All from './all';
import Current from './current';

import styles from './index.less';

const tabs = [{ title: formatMessage({ id: 'trade.spot_order.my' }) }, { title: formatMessage({ id: 'trade.spot_order.all' }) }];

function Orders({ location }) {
  const trade = location.hash.replace('#', '');
  const currency = trade ? trade.split('_')[0] : '';
  const market = trade ? trade.split('_')[1] : '';
  const hideCurrent = !currency || !market;
  // 没有传交易对进来时，默认就是全部订单
  const [currentTabIndex, setCurrentTabIndex] = useState(hideCurrent ? 1 : 0);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOrderType, setFilterOrderType] = useState(null);
  const [filterOrderStatus, setFilterOrderStatus] = useState(null);
  const [filterOrderCurrency, setFilterOrderCurrency] = useState(null);
  const [filterOrderMarket, setFilterOrderMarket] = useState(null);
  const [chooseMarketModal, setChooseMarketModal] = useState(false);

  const [currentFilterParams, setCurrentFilterParams] = useState(null);
  const [allFilterParams, setAllFilterParams] = useState(null);

  const filterSubmit = () => {
    const params = {};

    if (filterOrderType) {
      params.tradeType = filterOrderType;
    }

    if (filterOrderStatus) {
      params.states = filterOrderStatus;
    }

    if (filterOrderCurrency) {
      params.currency = filterOrderCurrency;
    }

    if (filterOrderMarket) {
      params.market = filterOrderMarket;
    }

    if (currentTabIndex === 0) {
      setCurrentFilterParams(params);
    }

    if (currentTabIndex === 1) {
      setAllFilterParams(params);
    }

    setFilterOpen(false);
  };

  const filterReset = () => {
    setFilterOrderType(null);
    setFilterOrderStatus(null);
    setFilterOrderCurrency(null);
    setFilterOrderMarket(null);
  };

  const switchTab = useCallback(
    index => {
      setCurrentTabIndex(index);
      // 将筛选重置为对应tab的筛选项
      if (index === 0) {
        setFilterOrderType(currentFilterParams ? currentFilterParams.tradeType : null);
        setFilterOrderStatus(currentFilterParams ? currentFilterParams.states : null);
        setFilterOrderCurrency(currentFilterParams ? currentFilterParams.currency : null);
        setFilterOrderMarket(currentFilterParams ? currentFilterParams.market : null);
      }

      if (index === 1) {
        setFilterOrderType(allFilterParams ? allFilterParams.tradeType : null);
        setFilterOrderStatus(allFilterParams ? allFilterParams.states : null);
        setFilterOrderCurrency(allFilterParams ? allFilterParams.currency : null);
        setFilterOrderMarket(allFilterParams ? allFilterParams.market : null);
      }
    },
    [currentFilterParams, allFilterParams]
  );

  return (
    <>
      <TopBar extra={<i className="iconfont iconshaixuan" onClick={() => setFilterOpen(true)}></i>}>
        <Flex className={styles.tab}>
          {currency && market && (
            <div onClick={() => switchTab(0)} className={classNames({ [styles.active]: currentTabIndex === 0 })}>
              {formatMessage({ id: 'trade.spot_order.my' })}
            </div>
          )}

          <div onClick={() => switchTab(1)} className={classNames({ [styles.active]: currentTabIndex === 1 && !hideCurrent })}>
            {formatMessage({ id: 'trade.spot_order.all' })}
          </div>
        </Flex>
      </TopBar>
      <div className={styles.wrapper}>
        {!hideCurrent && (
          <Tabs
            tabs={tabs}
            page={currentTabIndex}
            onChange={(tab, index) => {
              setCurrentTabIndex(index);
            }}
            tabBarPosition="top"
            distanceToChangeTab={0.5}
          >
            <Current filterParams={currentFilterParams} />
            <All filterParams={allFilterParams} />
          </Tabs>
        )}
        {hideCurrent && <All filterParams={allFilterParams} />}
      </div>

      <Modal
        className="am-modal-popup-slide-left"
        transitionName="am-slide-left"
        popup
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <div className={styles.filter}>
          <div>
            <Flex justify="between" className={styles['filter-title']}>
              <h3>{formatMessage({ id: 'otcfiat.Order.screening' })}</h3>
              <div onClick={() => setFilterOpen(false)}>
                <i className="iconfont iconjinru" />
              </div>
            </Flex>
            {currentTabIndex !== 0 && (
              <div className={styles['filter-section']}>
                <h4>{formatMessage({ id: 'index.trans.viconto' })}</h4>
                <Flex className={styles['filter-trade']}>
                  <InputItem
                    onChange={value => setFilterOrderCurrency(value)}
                    value={filterOrderCurrency}
                    className="am-input-small"
                    placeholder={formatMessage({ id: 'trade.spot_order.filter.trade' })}
                  />
                  <span>/</span>
                  <div onClick={() => setChooseMarketModal(true)}>
                    <InputItem
                      editable={false}
                      value={filterOrderMarket}
                      extra={<i className="iconfont icondrop" />}
                      className="am-input-small"
                      placeholder={formatMessage({ id: 'trade.spot_order.filter.market' })}
                    />
                  </div>
                </Flex>
              </div>
            )}
            <div className={styles['filter-section']}>
              <h4>{formatMessage({ id: 'otcfiat.Order.type' })}</h4>
              <Flex justify="between">
                <span
                  onClick={() => setFilterOrderType(1)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderType === 1 })}
                >
                  {formatMessage({ id: 'trade.box.buy' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span
                  onClick={() => setFilterOrderType(2)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderType === 2 })}
                >
                  {formatMessage({ id: 'trade.box.sell' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
              </Flex>
            </div>
            <div className={styles['filter-section']}>
              <h4>{formatMessage({ id: 'container.Business.order.status' })}</h4>
              <Flex justify="between" wrap="wrap">
                <span
                  onClick={() => setFilterOrderStatus(1)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderStatus === 1 })}
                >
                  {formatMessage({ id: 'order.table.status.unfilled' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span
                  onClick={() => setFilterOrderStatus(2)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderStatus === 2 })}
                >
                  {formatMessage({ id: 'order.table.status.deal_done' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span
                  onClick={() => setFilterOrderStatus(3)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderStatus === 3 })}
                >
                  {formatMessage({ id: 'order.table.status.partial_deal' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span
                  onClick={() => setFilterOrderStatus(4)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderStatus === 4 })}
                >
                  {formatMessage({ id: 'otcfiat.Its.withdrawn' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span
                  onClick={() => setFilterOrderStatus(5)}
                  className={classNames(styles['filter-btn'], { [styles.current]: filterOrderStatus === 5 })}
                >
                  {formatMessage({ id: 'order.table.status.partial_cancel' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
              </Flex>
            </div>
          </div>

          <div className={styles['filter-handle']}>
            <Button inline type="ghost" onClick={filterReset}>
              {formatMessage({ id: 'otcfiat.Its.reset' })}
            </Button>
            <Button inline type="primary" onClick={filterSubmit}>
              {formatMessage({ id: 'common.sure' })}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal popup animationType="slide-up" visible={chooseMarketModal} onClose={() => setChooseMarketModal(false)}>
        <div className={styles['choose-market']}>
          <p
            onClick={() => {
              setFilterOrderMarket('USDT');
              setChooseMarketModal(false);
            }}
          >
            USDT
          </p>
          <p
            onClick={() => {
              setFilterOrderMarket('ETH');
              setChooseMarketModal(false);
            }}
          >
            ETH
          </p>
          <p
            onClick={() => {
              setFilterOrderMarket('BTC');
              setChooseMarketModal(false);
            }}
          >
            BTC
          </p>
          <p
            onClick={() => {
              setFilterOrderMarket('MX');
              setChooseMarketModal(false);
            }}
          >
            MX
          </p>
          <p
            onClick={() => {
              setFilterOrderMarket('EOS');
              setChooseMarketModal(false);
            }}
          >
            EOS
          </p>
        </div>
      </Modal>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Orders);
