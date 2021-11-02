import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import Timeout from './timeout';
import { timeToString } from '@/utils';
import { Toast } from 'antd-mobile';
import { deleteAddOrder } from '@/services/api';
import Empty from '@/components/Empty';
const orderType = status => {
  let txt = '';
  switch (status) {
    case 'created':
      txt = (
        <span className={styles.orderListactive}>
          {formatMessage({ id: 'container.obligation' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );
      break;
    case 'confirmed':
      txt = (
        <span>
          {formatMessage({ id: 'assets.cash.state.loading' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    case 'done':
      txt = (
        <span>
          {formatMessage({ id: 'header.complete' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    case 'timeout':
      txt = (
        <span>
          {formatMessage({ id: 'container.timeout' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    case 'cancelled':
      txt = (
        <span>
          {formatMessage({ id: 'Order.the.single' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    case 'accepted':
      txt = (
        <span className={styles.orderMerchants}>
          {formatMessage({ id: 'Order.Merchant.processing' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    case 'invalid':
      txt = (
        <span>
          {formatMessage({ id: 'Order.The.cancellation' })}
          <i className="iconfont iconsanjiaoxing-bian" style={{ fontSize: 10, marginLeft: 5 }}></i>
        </span>
      );

      break;
    default:
      break;
  }
  return txt;
};

const sellOrderType = (e, item, props) => {
  e.stopPropagation();
  props.dispatch({
    type: 'otc/putOrderInfo',
    data: {
      ...item
    }
  });

  if (item.status === 'created' && 'timeout' && item.tradeType === 0) {
    router.push(`/otc/fiat-order-unhandle?id=${item.tradeNo}`);
  } else if (item.tradeType === 1 && (item.status === 'created' || item.status === 'timeout')) {
    router.push(`/otc/fiat-order-complete?id=${item.tradeNo}`);
  } else {
    router.push(`/otc/fiat-order-handling?id=${item.tradeNo}`);
  }
};
const cancellations = async (e, id, props) => {
  e.stopPropagation();
  const res = await deleteAddOrder(id);
  if (res.code === '0') {
    Toast.success(formatMessage({ id: 'otcfiat.Its.success' }));
    props.getorder();
  }
};
const orderList = props => {
  return props.value.map((item, key, index) => {
    return (
      <div className={styles.orderlist} key={item.tradeNo} onClick={e => sellOrderType(e, item, props)}>
        <div className={styles.orderheader}>
          <div className={styles.ordertime}>
            {item.status === 'created' && item.tradeType === 0 ? (
              <span>
                <Timeout endTime={item.remainingTime} timeOver={() => props.getorder()} />
              </span>
            ) : (
              ''
            )}
            <span className={styles.timeover}>{timeToString(Number(item.created), 'YYYY-MM-DD HH:mm:ss')}</span>
          </div>
          {item.status === 'created' ? (
            <div className={styles.cancellations} onClick={e => cancellations(e, item.tradeNo, props)}>
              {formatMessage({ id: 'order.table.action.cancel' })}
            </div>
          ) : (
            ''
          )}
        </div>
        <div className={styles.orderinfo}>
          <div>
            <span>{item.tradeType === 0 ? formatMessage({ id: 'trade.box.buy' }) : formatMessage({ id: 'trade.box.sell' })}</span>
            <span>{item.coinType}</span>
          </div>
          <div>
            <span>{formatMessage({ id: 'order.table.action.cancel' })}：</span>
            <span>
              <span className={styles.currencySymbol}>{item.currency === 'VND' ? '₫' : '￥'}</span>
              {item.coinPrice}
            </span>
          </div>
          <div>
            <span>{formatMessage({ id: 'assets.treaty.history.number' })}：</span>
            <span>{item.coinAmount}</span>
          </div>
        </div>
        <div className={styles.topayfor}>
          <div className={styles.paymoneyval}>
            <span>{formatMessage({ id: 'container.obligation' })}：</span>
            <span>
              <span className={styles.currencySymbol}>{item.currency === 'VND' ? '₫' : '￥'}</span>
              {item.cash}
            </span>
          </div>
          <div>
            <span> {orderType(item.status)}</span>
          </div>
        </div>
      </div>
    );
  });
};

function NewOrderListHook(props) {
  return (
    <div className={styles.orderlistfooter} style={{ marginTop: 34 }}>
      {props.value.length === 0 ? <Empty /> : orderList(props)}
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(NewOrderListHook);
