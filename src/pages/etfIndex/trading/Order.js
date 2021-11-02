import { useEffect } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import router from 'umi/router';
import { timeToString, cutFloatDecimal } from '@/utils';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { cancelEtfIndexOrder } from '@/services/api';
import Empty from '@/components/Empty';
import classNames from 'classnames';

import styles from './Order.less';

const lang = getLocale();

const _orderStatuMap = {
  CREATE: formatMessage({ id: 'etfIndex.orders.status.CREATE' }),
  PROCESSING: formatMessage({ id: 'etfIndex.orders.status.PROCESSING' }),
  FAIL: formatMessage({ id: 'etfIndex.orders.status.FAIL' }),
  CANCEL: formatMessage({ id: 'etfIndex.orders.status.CANCEL' }),
  DONE: formatMessage({ id: 'order.table.status.deal_done' })
};

const Order = ({ etfItem, orderType, orders, dispatch, user }) => {
  useEffect(() => {
    if (user.id) {
      getCurrentOrder(orderType);
    }
  }, [user]);

  const getCurrentOrder = (type = 'subscribe') => {
    if (!user.id) return false;
    const currency = etfItem.symbol ? etfItem.symbol.split('_')[0] : '';

    dispatch({
      type: 'etfIndex/getEtfOrderList',
      payload: {
        tradeType: type,
        pageSize: 10,
        pageNum: 1,
        currency
      }
    });

    dispatch({
      type: 'etfIndex/save',
      payload: {
        orderType: type
      }
    });
  };

  const cellFieldRender = (item, scale = 4, field, unit) => {
    if (item.status !== 'DONE') {
      if (item.tradeType === 'subscribe' && field === 'amount') {
        return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
      } else if (item.tradeType === 'redemption' && field === 'quantity') {
        return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
      } else {
        return '--';
      }
    } else {
      return `${Number(cutFloatDecimal(item[field], scale))} ${unit ? unit : ''}`;
    }
  };

  const refresh = e => {
    if (!user.id) return false;
    const currency = etfItem.symbol ? etfItem.symbol.split('_')[0] : '';

    getCurrentOrder(orderType);
    dispatch({
      type: 'assets/getAssetBalance',
      payload: {
        currency: `USDT,${currency}`
      }
    });
  };

  const onTabChange = type => {
    dispatch({
      type: 'etfIndex/save',
      payload: {
        orderType: type
      }
    });
    getCurrentOrder(type);
  };

  const handleCancel = async orderId => {
    const res = await cancelEtfIndexOrder({ orderId });

    if (res.code === 200) {
      Toast.success(formatMessage({ id: 'order.table.action.cancel.success' }));
      getCurrentOrder(orderType);
    }
  };

  return (
    <>
      <div className={styles.head}>
        <label htmlFor="">{formatMessage({ id: 'swap.newsDeal.entrustList' })}</label>
        <div>
          {user.id && <span onClick={refresh}>{formatMessage({ id: 'etfIndex.order.refresh' })}</span>}
          <i className="iconfont iconfile-order" onClick={e => router.push('/etfIndex/order')}></i>
        </div>
      </div>
      <div className={styles.tab}>
        <span className={classNames(orderType === 'subscribe' && styles.active)} onClick={e => onTabChange('subscribe')}>
          {formatMessage({ id: 'etfIndex.order.bid.tab' })}
        </span>
        <span className={classNames(orderType === 'redemption' && styles.active)} onClick={e => onTabChange('redemption')}>
          {formatMessage({ id: 'etfIndex.order.ask.tab' })}
        </span>
      </div>
      {orders.length ? (
        orders.map(o => (
          <div className={styles.item}>
            <div className={styles.title}>
              <label htmlFor="">{lang.startsWith('zh') ? o.name : o.nameEn}</label>
              {o.tradeType === 'subscribe' ? (
                <span className={styles.bids}>{formatMessage({ id: 'etfIndex.bid.title' })}</span>
              ) : (
                <span className={styles.asks}>{formatMessage({ id: 'etfIndex.ask.title' })}</span>
              )}
            </div>
            <div className={styles.field}>
              <div>
                <label htmlFor="">{formatMessage({ id: 'act.invite_datatime' })}</label>
                <p>{timeToString(o.createTime)}</p>
              </div>
              <div>
                <label htmlFor="">
                  {o.tradeType === 'subscribe'
                    ? formatMessage({ id: 'etfIndex.bid.price' })
                    : formatMessage({ id: 'etfIndex.order.ask.title1' })}
                </label>
                <p>{cellFieldRender(o, 4, 'amount', 'USDT')}</p>
              </div>
              <div>
                <label htmlFor="">
                  {o.tradeType === 'subscribe'
                    ? formatMessage({ id: 'etfIndex.order.bid.title3' })
                    : formatMessage({ id: 'etfIndex.order.ask.title2' })}
                </label>
                <p>{cellFieldRender(o, 4, 'quantity')}</p>
              </div>
            </div>
            <div className={styles.field}>
              <div>
                <label htmlFor="">
                  {o.tradeType === 'subscribe'
                    ? formatMessage({ id: 'etfIndex.order.bid.title4' })
                    : formatMessage({ id: 'etfIndex.order.ask.title3' })}
                </label>
                <p>{cellFieldRender(o, 4, 'fee', 'USDT')}</p>
              </div>
              <div>
                <label htmlFor="">{formatMessage({ id: 'etfIndex.order.bid.title5' })}</label>
                <p>{cellFieldRender(o, 4, 'price', 'USDT')}</p>
              </div>
              <div>
                <label htmlFor="">{formatMessage({ id: 'assets.recharge.status' })}</label>
                <p>{_orderStatuMap[o.status]}</p>
              </div>
            </div>
            {o.status === 'CREATE' && (
              <div className={styles.handle}>
                <span className={styles.btn} onClick={e => handleCancel(o.orderId)}>
                  {formatMessage({ id: 'order.table.action.cancel' })}
                </span>
              </div>
            )}
          </div>
        ))
      ) : (
        <Empty />
      )}
    </>
  );
};

export default connect(({ etfIndex, auth }) => ({
  ...etfIndex,
  user: auth.user
}))(Order);
