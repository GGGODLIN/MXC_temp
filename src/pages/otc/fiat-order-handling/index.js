import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import { Button, Toast } from 'antd-mobile';
import Timeout from '../fiat-orders/timeout';
import { getc2cOrderDetail, getChatid } from '@/services/api';
import { timeToString } from '@/utils';

const orderType = status => {
  let txt = '';
  switch (status) {
    case 'created':
      txt = formatMessage({ id: 'container.obligation' });
      break;
    case 'confirmed':
      txt = `${formatMessage({ id: 'header.order' })}${formatMessage({ id: 'container.obligation' })}`;

      break;
    case 'done':
      txt = `${formatMessage({ id: 'header.order' })}${formatMessage({ id: 'header.complete' })}`;

      break;
    case 'timeout':
      txt = `${formatMessage({ id: 'header.order' })}${formatMessage({ id: 'container.timeout' })}`;

      break;
    case 'cancelled':
      txt = `${formatMessage({ id: 'header.order' })}${formatMessage({ id: 'Order.the.single' })}`;
      break;
    case 'accepted':
      txt = <span className={styles.orderMerchants}></span>;

      break;
    case 'invalid':
      txt = `${formatMessage({ id: 'header.order' })}${formatMessage({ id: 'Order.The.cancellation' })}`;
      break;
    default:
      break;
  }
  return txt;
};

function FiatOrderHanding(props) {
  const { id } = props.location.query;
  const [oderInfo, setoderInfo] = useState({});
  const [chatid, setchatid] = useState('');
  const [chatName, setchatName] = useState('');
  const userToken = props.user.token;
  window.easemobim = window.easemobim || {};
  const getOrderDetail = async () => {
    const res = await getc2cOrderDetail(id);
    if (res.code === '0') {
      setoderInfo({ oderInfo: res.result });
    } else if (res.code === '1') {
      Toast.offline(res.desc);
      router.goBack();
    }
  };
  const geteasemobid = async () => {
    const res = await getChatid(id);
    console.log(res);
    if (res.code === '0') {
      if (res.result) {
        // let  data="3de75a51-d783-4d1e-8d71-26e8f991d84b:z383018641@126.com"
        let information = res.result.trim().split(':');
        setchatid(information[0]);
        setchatName(information[1]);
      }
    }
  };
  const chatMerchants = () => {
    if (!chatid) {
      Toast.offline(formatMessage({ id: 'otcfiat.Its.contact' }));
    } else {
      chatInit();
      window.easemobim.bind({
        configId: chatid,
        agentName: chatName,
        user: {
          username: userToken,
          password: 'mxctothemoon'
        }
      });
    }
  };

  const chatInit = () => {
    window.easemobim = window.easemobim || {};
    window.easemobim.config = {
      hide: true,
      autoConnect: true,
      visitor: {
        trueName: oderInfo.userKycName,
        qq: oderInfo.userAccount,
        phone: oderInfo.userMobile,
        companyName: '',
        userNickname: oderInfo.userKycName,
        email: oderInfo.userAccount
      }
    };
  };
  useEffect(() => {
    getOrderDetail();
    geteasemobid();
  }, []);
  const orderDetail = oderInfo.oderInfo;

  if (!orderDetail) {
    return '';
  }
  return (
    <div>
      <TopBar>
        {/* {formatMessage({ id: 'header.order' })} */}
        {orderType(orderDetail.status)}
      </TopBar>
      <div className={styles.staycomplete}>
        {orderDetail.status === 'created' ? (
          <div>
            <div className={styles.toptimeout}>
              <span className={styles.progres}></span>
              <span>
                <Timeout endTime={900000} />
              </span>
            </div>
            <div className={styles.tradingprompt}>{formatMessage({ id: 'otcfiat.order.merchants' })}</div>
          </div>
        ) : (
          ''
        )}

        <div className={styles.inOrder}>
          <span>{formatMessage({ id: 'otcfiat.order.info' })}</span>
          <div className={styles.inOrderTime}>
            <span> {timeToString(Number(orderDetail.created), 'YYYY-MM-DD HH:mm:ss')}</span>
            <span>
              {formatMessage({ id: 'otc.order.orderid' })}：{orderDetail.tradeNo}
            </span>
          </div>
        </div>
        <div className={styles.orderListContent}>
          <div className={styles.orderList}>
            <div>{formatMessage({ id: 'otcfiat.order.account' })}:</div>
            <div>{orderDetail.userAccount}</div>
          </div>
          <div className={styles.orderList}>
            <div>{formatMessage({ id: 'container.Theunit.price' })}:</div>
            <div>
              <span className={styles.currencySymbol}>{orderDetail.currency === 'VND' ? '₫' : '￥'}</span>
              {orderDetail.coinPrice}
            </div>
          </div>
          <div className={styles.orderList}>
            <div>{formatMessage({ id: 'assets.treaty.history.number' })}:</div>
            <div>{orderDetail.coinAmount}</div>
          </div>
          <div className={styles.orderListPay}>
            <div>
              {orderDetail.status === 'done'
                ? formatMessage({ id: 'container.Payment.has.been' })
                : formatMessage({ id: 'otcfiat.order.paid' })}{' '}
              :
            </div>
            <div>
              <span>
                <span className={styles.currencySymbol}>{orderDetail.currency === 'VND' ? '₫' : '￥'}</span>
                {orderDetail.cash}
              </span>
            </div>
          </div>
        </div>

        {orderDetail.status === 'created' ? (
          <div>
            <div className={styles.contact} onClick={() => chatMerchants()}>
              <Button type="primary">{formatMessage({ id: 'container.Contact.the.merchant' })}</Button>
            </div>
            <div className={styles.footerPrompt}>
              <span>
                <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
              </span>
              <span>{formatMessage({ id: 'otcfiat.ontact.merchants' })}</span>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(FiatOrderHanding);
