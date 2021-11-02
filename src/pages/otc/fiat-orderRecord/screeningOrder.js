import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './screeningOrder.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Modal, List } from 'antd-mobile';
import { getorderHistory } from '@/services/api';

function QuickTrading(props) {
  const {
    drawerOpen,
    setDrawerOpen,
    screeningClick,
    orderType,
    setOrderType,
    orderState,
    setOrderState,
    orderTradingType,
    setState
  } = props;

  const generalTradingClick = () => {
    setState({
      orderTradingType: 0,
      page: 1
    });
    setOrderType('BUY');
    setOrderState('');
  };
  const entrustTradingClick = () => {
    setState({
      orderTradingType: 1,
      page: 1
    });
    setOrderType('SELL');
    setOrderState('PROCESSING');
    setOrderState('');
  };
  console.log(orderTradingType);
  return (
    <div>
      <Modal
        className="am-modal-popup-slide-left"
        transitionName="am-slide-left"
        popup
        visible={drawerOpen}
        // visible={true}
        onClose={() => setDrawerOpen(false)}
      >
        <div className={styles.modelContent}>
          <div className={styles.headerTop}>
            <div className={styles.headerColor}>{formatMessage({ id: 'otcfiat.Order.screening' })}</div>
            <div onClick={() => setDrawerOpen(false)}>{formatMessage({ id: 'common.cancel' })}</div>
          </div>
          <div className={styles.OrderType}>
            <div className={styles.title}>{formatMessage({ id: 'otc.trading.title' })}</div>
            <div className={styles.typeContent}>
              <div className={orderTradingType === 0 ? styles.orderTypeActive : ''} onClick={() => generalTradingClick()}>
                {formatMessage({ id: 'otc.trading.general' })}
              </div>
              <div className={orderTradingType === 1 ? styles.orderTypeActive : ''} onClick={() => entrustTradingClick()}>
                {formatMessage({ id: 'otc.trading.entrust' })}
              </div>
            </div>
          </div>
          <div className={styles.OrderType}>
            <div className={styles.title}>{formatMessage({ id: 'otcfiat.Order.type' })}</div>
            <div className={styles.typeContent}>
              <div
                className={classNames(orderType === 'BUY' ? styles.orderTypeActive : '', orderTradingType === 1 ? styles.disable : '')}
                onClick={() => setOrderType('BUY')}
              >
                {formatMessage({ id: 'assets.discount.wraning.buy' })}
              </div>
              <div className={orderType === 'SELL' ? styles.orderTypeActive : ''} onClick={() => setOrderType('SELL')}>
                {formatMessage({ id: 'otc.quick.sell' })}
              </div>
            </div>
          </div>
          <div className={styles.OrderState}>
            <div className={styles.title}>{formatMessage({ id: 'container.Business.order.status' })}</div>
            {orderTradingType === 0 ? (
              <div className={styles.typeContent}>
                <div
                  className={classNames(orderState === 'PROCESSING' ? styles.orderTypeActive : '')}
                  onClick={() => setOrderState('PROCESSING')}
                >
                  {formatMessage({ id: 'otc.order.timeout' })}
                </div>
                <div
                  className={classNames(orderState === 'TIMEOUT' ? styles.orderTypeActive : '')}
                  onClick={() => setOrderState('TIMEOUT')}
                >
                  {formatMessage({ id: 'otc.order.overtime' })}
                </div>
                <div className={classNames(orderState === 'CANCEL' ? styles.orderTypeActive : '')} onClick={() => setOrderState('CANCEL')}>
                  {formatMessage({ id: 'otcfiat.Its.withdrawn' })}
                </div>
                <div className={classNames(orderState === 'DONE' ? styles.orderTypeActive : '')} onClick={() => setOrderState('DONE')}>
                  {formatMessage({ id: 'header.complete' })}
                </div>
              </div>
            ) : (
              <div className={styles.typeContent}>
                <div className={classNames(orderState === 'OPEN' ? styles.orderTypeActive : '')} onClick={() => setOrderState('OPEN')}>
                  {formatMessage({ id: 'otc.entrust.hangTheOrderIng' })}
                </div>
                <div className={classNames(orderState === 'DELETE' ? styles.orderTypeActive : '')} onClick={() => setOrderState('DELETE')}>
                  {formatMessage({ id: 'otcfiat.Its.withdrawn' })}
                </div>
                <div className={classNames(orderState === 'DONE' ? styles.orderTypeActive : '')} onClick={() => setOrderState('DONE')}>
                  {formatMessage({ id: 'otc.entrust.order' })}
                </div>
                <div
                  className={classNames(orderState === 'TIMEOUT' ? styles.orderTypeActive : '')}
                  onClick={() => setOrderState('TIMEOUT')}
                >
                  {formatMessage({ id: 'otc.creditCard.expired' })}
                </div>
              </div>
            )}
          </div>
          <div className={styles.footerBtn}>
            <div onClick={() => setDrawerOpen(false)}>{formatMessage({ id: 'common.cancel' })}</div>
            <div onClick={() => screeningClick()}>{formatMessage({ id: 'common.sure' })}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(QuickTrading);
