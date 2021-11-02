import React, { useCallback, useState, useEffect } from 'react';
import cs from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, timeToString } from '@/utils';

import styles from './index.less';

const stateMap = {
  1: formatMessage({ id: 'order.table.status.unfilled' }),
  2: formatMessage({ id: 'order.table.status.deal_done' }),
  3: formatMessage({ id: 'order.table.status.partial_deal' }),
  4: formatMessage({ id: 'otcfiat.Its.withdrawn' }),
  5: formatMessage({ id: 'order.table.status.partial_cancel' }),
  NEW: formatMessage({ id: 'order.table.status.unfilled' }),
  CANCELED: formatMessage({ id: 'otcfiat.Its.withdrawn' }),
  EXECUTED: formatMessage({ id: 'order.table.status.executed' })
};

const ComOrder = ({ order, mode, onCancel }) => {
  const isSell = order.tradeType.toString() === '2' || order.tradeType === 'SELL';
  const isCancellable = mode === 'trigger' ? order.state === 'NEW' : [1, 3].includes(order.status);
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
              onCancel && onCancel(order.id);
            }}
          >
            {formatMessage({ id: 'order.table.action.cancel' })}
          </div>
        ) : (
          <div className={cs(styles.statusText)}>{stateMap[order.state || order.status]}</div>
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
              <div>{order.dealAmountString}</div>
            </div>
          </div>
          <div className={styles.orderCol2}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.price' })}(${order.market})`}</div>
              <div>{order.priceString}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.average_price' })}(${order.market})`}</div>
              <div>{order.avgPriceString}</div>
            </div>
          </div>
          <div className={styles.orderCol3}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.amount_of_commission' })}(${order.currency})`}</div>
              <div>{order.quantityString}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.total_of_commission' })}(${order.market})`}</div>
              <div>{order.amountString}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.orderInfo}>
          <div className={styles.orderCol1}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{formatMessage({ id: 'act.invite_datatime' })}</div>
              <div>{timeToString(order.createTime)}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{formatMessage({ id: 'trade.list.trigger_type' })}</div>
              <div>{order.triggerType}</div>
            </div>
          </div>
          <div className={styles.orderCol2}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.price' })}(${order.market})`}</div>
              <div>{order.priceString}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'order.table.status.trigger.price' })}(${order.market})`}</div>
              <div>{order.triggerPriceString}</div>
            </div>
          </div>
          <div className={styles.orderCol3}>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.amount_of_commission' })}(${order.currency})`}</div>
              <div>{order.quantityString}</div>
            </div>
            <div className={styles.orderInfoCell}>
              <div className={'color-light'}>{`${formatMessage({ id: 'trade.list.total_of_commission' })}(${order.market})`}</div>
              <div>{order.amountString}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComOrder;
