import React, { useReducer, useEffect, useState } from 'react';
import router from 'umi/router';
import classNames from 'classnames';
import { PullToRefresh, ListView } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { deleteAddOrder, getC2cQueryOrder } from '@/services/api';
import styles from './orderlist.less';
import Timeout from './timeout';
import { timeToString } from '@/utils';
import TopBar from '@/components/TopBar';
import Empty from '@/components/Empty';
import { Modal, Button, Toast } from 'antd-mobile';
import { getCookie } from '@/utils';
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

function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});

const initialState = {
  height: document.documentElement.clientHeight,
  list: dataSource.cloneWithRows([]),
  more: true,
  page_size: 10, //单次渲染条数
  page: 1
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const OrderListHook = ({ dispatch }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [buytype, setbuytype] = useState('');
  const [orderInfo, setorderInfo] = useState('');
  const [ordertype, setOrdertype] = useState('');
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height } = state;

  const cookieUid = getCookie('u_id');
  useEffect(() => {
    if (cookieUid) {
      getList(page, page_size);
    } else {
      router.push('/auth/signin');
    }
  }, []);
  const getList = async (page, pageSize, type, buytype, status) => {
    const params = {
      page,
      page_size: pageSize || page_size,
      tradeType: buytype,
      status
    };
    const res = await getC2cQueryOrder(params);

    if (res.code === '0') {
      setDrawerOpen(false);
      const data = res.result || [];
      if (data.length) {
        if (type === 'refresh') {
          setState({ list: dataSource.cloneWithRows(data) });
        } else {
          setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
        }
      } else {
        setState({ list: dataSource.cloneWithRows(data) });
        setState({ more: false });
      }
    }
  };

  const onRefresh = e => {
    if (buytype === 0 || buytype === 1) {
      getList(1, page_size, 'refresh', buytype, orderInfo);
    } else {
      setState({ page: 1, more: true });
      getList(1, page_size, 'refresh');
    }
  };

  const onEndReached = async e => {
    if (more) {
      setState({ page: page + 1 });
      getList(page + 1);
    }
  };
  // 筛选
  const determine = async (buytype, ordertype, setState) => {
    let status = '';
    switch (ordertype) {
      case 1:
        status = 'created|timeout';
        break;
      case 2:
        status = 'accepted|confirmed';
        break;
      case 3:
        status = 'invalid|cancelled';
        break;
      case 4:
        status = 'done';
        break;
      default:
        break;
    }
    setorderInfo(status);
    getList(1, page_size, 'refresh', buytype, status);
  };
  const sellOrderType = item => {
    if (item.tradeType === 0 && (item.status === 'created' || item.status === 'timeout')) {
      router.push(`/otc/fiat-order-unhandle?id=${item.tradeNo}`);
    } else if (item.tradeType === 1 && (item.status === 'created' || item.status === 'timeout')) {
      router.push(`/otc/fiat-order-complete?id=${item.tradeNo}`);
    } else {
      router.push(`/otc/fiat-order-handling?id=${item.tradeNo}`);
    }
  };
  const cancellations = async (e, id) => {
    e.stopPropagation();
    const res = await deleteAddOrder(id);
    if (res.code === '0') {
      Toast.success(formatMessage({ id: 'otcfiat.Its.success' }));
      getList(1, page_size, 'refresh');
    }
  };
  const reset = (setbuytype, setOrdertype) => {
    setOrdertype('');
    setbuytype('');
  };
  const row = item => {
    return (
      <div className={styles.orderlist} key={item.tradeNo} onClick={() => sellOrderType(item)}>
        <div className={styles.orderheader}>
          <div className={styles.ordertime}>
            {item.status === 'created' && item.tradeType === 0 ? (
              <span>
                <Timeout endTime={item.remainingTime} timeOver={() => getList(1, page_size, 'refresh')} />
              </span>
            ) : (
              ''
            )}
            <span className={styles.timeover}>{timeToString(Number(item.created), 'YYYY-MM-DD HH:mm:ss')}</span>
          </div>
          {item.status === 'created' ? (
            <div className={styles.cancellations} onClick={e => cancellations(e, item.tradeNo)}>
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
            <span> {formatMessage({ id: 'container.Theunit.price' })}：</span>
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
            <span>
              {item.status === 'done' ? formatMessage({ id: 'container.Payment.has.been' }) : formatMessage({ id: 'container.obligation' })}
              :
            </span>
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
  };

  return (
    <div className={styles.orderlistContent}>
      <TopBar>
        <div onClick={() => setDrawerOpen(true)} className={styles.orderfiltericon}>
          <i className="iconfont iconshaixuan"></i>
        </div>
        {formatMessage({ id: 'otcfiat.Order.record' })}
      </TopBar>

      <Modal
        className="am-modal-popup-slide-left"
        transitionName="am-slide-left"
        popup
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div>
          <div className={styles.filterorder}>
            <div>{formatMessage({ id: 'otcfiat.Order.screening' })}</div>
            <div onClick={() => setDrawerOpen(false)}>
              <i className="iconfont iconjinru"></i>
            </div>
          </div>
          <div className={styles.filterbuysell}>
            <p>{formatMessage({ id: 'otcfiat.Order.type' })}</p>

            <div className={classNames([styles.ordertypebg, buytype === 0 ? styles.ordertypeactive : ''])} onClick={() => setbuytype(0)}>
              {formatMessage({ id: 'trade.box.buy' })}
              <i className={classNames([styles.buyicon, buytype === 0 ? 'iconfont icongouxuan' : ''])}></i>
            </div>

            <div className={classNames([styles.ordertypebg, buytype === 1 ? styles.ordertypeactive : ''])} onClick={() => setbuytype(1)}>
              {formatMessage({ id: 'trade.box.sell' })}
              <i className={classNames([styles.buyicon, buytype === 1 ? 'iconfont icongouxuan' : ''])}></i>
            </div>
          </div>
          <div className={styles.filtertype}>
            <p>{formatMessage({ id: 'container.Business.order.status' })}</p>
            <div
              className={classNames([styles.ordertypebg, ordertype === 1 ? styles.ordertypeactive : ''])}
              onClick={() => setOrdertype(1)}
            >
              {formatMessage({ id: 'container.Tobe.processed' })}

              <i className={classNames([styles.buyicon, ordertype === 1 ? 'iconfont icongouxuan' : ''])}></i>
            </div>
            <div
              className={classNames([styles.ordertypebg, ordertype === 2 ? styles.ordertypeactive : ''])}
              onClick={() => setOrdertype(2)}
            >
              {formatMessage({ id: 'assets.cash.state.loading' })}

              <i className={classNames([styles.buyicon, ordertype === 2 ? 'iconfont icongouxuan' : ''])}></i>
            </div>
            <div
              className={classNames([styles.ordertypebg, ordertype === 3 ? styles.ordertypeactive : ''])}
              onClick={() => setOrdertype(3)}
            >
              {formatMessage({ id: 'otcfiat.Its.withdrawn' })}

              <i className={classNames([styles.buyicon, ordertype === 3 ? 'iconfont icongouxuan' : ''])}></i>
            </div>
            <div
              className={classNames([styles.ordertypebg, ordertype === 4 ? styles.ordertypeactive : ''])}
              onClick={() => setOrdertype(4)}
            >
              {formatMessage({ id: 'header.complete' })}

              <i className={classNames([styles.buyicon, ordertype === 4 ? 'iconfont icongouxuan' : ''])}></i>
            </div>
          </div>
          <div className={styles.footbtn}>
            <Button type="ghost" inline onClick={() => reset(setbuytype, setOrdertype)}>
              {formatMessage({ id: 'otcfiat.Its.reset' })}
            </Button>
            <Button type="primary" inline className={styles.footerbtntwo} onClick={() => determine(buytype, ordertype, setState)}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
      <ListView
        style={{
          height,
          overflow: 'auto'
        }}
        dataSource={list}
        renderBodyComponent={() => <Body />}
        renderFooter={() => {
          if (list._dataBlob.s1.length) {
            if (!more) {
              return <div style={{ textAlign: 'center' }}>{formatMessage({ id: 'common.no.data_more' })}</div>;
            }
          } else {
            if (!more) {
              return <Empty />;
            }
          }
        }}
        renderRow={row}
        pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
        pageSize={page_size}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
      />
    </div>
  );
};

export default OrderListHook;
