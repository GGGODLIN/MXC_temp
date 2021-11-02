import React, { useCallback, useState, useEffect } from 'react';
import cs from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, timeToString } from '@/utils';

import styles from './index.less';

const _orderStatuMap = {
  NEW: formatMessage({ id: 'order.table.status.unfilled' }),
  FILLED: formatMessage({ id: 'order.table.status.deal_done' }),
  PARTIALLY_FILLED: formatMessage({ id: 'order.table.status.partial_deal' }),
  CANCELED: formatMessage({ id: 'otcfiat.Its.withdrawn' }),
  PARTIALLY_CANCELED: formatMessage({ id: 'order.table.status.partial_cancel' }),
  PENDING_SUBMIT: formatMessage({ id: 'margin.title.state.pushing' }),
  PENDING_CANCEL: formatMessage({ id: 'margin.title.state.canceling' })
};

const ComOrder = ({ order, mode, onCancel }) => {
  const isSell = order.tradeType.toString() === '2' || order.tradeType === 'SELL';
  const isCancellable = mode === 'trigger' ? order.state === 'NEW' : ['NEW', 'PARTIALLY_FILLED'].includes(order.status);
  return (
    <div className={cs(styles.orderContainer, isSell && styles.sellOrderContaner)} key={order.id}>
      <div className={styles.orderActionLine}>
        <div>
          <i className={cs('iconfont', 'icondingdan-mairu')}></i>
          <span className="m-l-5 f-16">{`${order.currency}/${order.market}`}</span>
        </div>
        {isCancellable ? (
          <div
            className={styles.orderCancel}
            onClick={() => {
              onCancel && onCancel(order.orderNo);
            }}
          >
            {formatMessage({ id: 'order.table.action.cancel' })}
          </div>
        ) : (
          <div className={cs(styles.statusText)}>{_orderStatuMap[order.state || order.status]}</div>
        )}
      </div>
      <div className={styles.orderProcess}>
        <div className={styles.orderProcessBar} style={{ width: `${order.percent || 0}%` }}></div>
      </div>
      {mode !== 'trigger' ? (
        <div className={styles.orderInfo}>
          <div className={styles.orderCol1}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{formatMessage({ id: 'act.invite_datatime' })}</div>
              <div>{timeToString(order.createTime)}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'otcpush.deal.mount' })}(${order.market})`}</div>
              <div>{order.dealAmount}</div>
            </div>
          </div>
          <div className={styles.orderCol2}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.price' })}(${order.market})`}</div>
              <div>{order.price}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.average_price' })}(${order.market})`}</div>
              <div>{isNaN(order.dealAmount / order.dealQuantity) ? '--' : order.dealAmount / order.dealQuantity}</div>
            </div>
          </div>
          <div className={styles.orderCol3}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.amount_of_commission' })}(${order.currency})`}</div>
              <div>{order.quantity}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.total_of_commission' })}(${order.market})`}</div>
              <div>{order.amount}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.orderInfo}>
          <div className={styles.orderCol1}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{formatMessage({ id: 'act.invite_datatime' })}</div>
              <div>{timeToString(order.createTime * 1)}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'order.table.status.trigger.price' })}(${order.market})`}</div>
              <div>{order.triggerPrice}</div>
            </div>
          </div>
          <div className={styles.orderCol2}></div>
          <div className={styles.orderCol3}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.amount_of_commission' })}(${order.currency})`}</div>
              <div>{order.quantity}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.price' })}(${order.market})`}</div>
              <div>{order.price}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComOrder;
