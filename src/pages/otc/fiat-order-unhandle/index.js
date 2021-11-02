import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import { Button } from 'antd-mobile';
import TradingModel from './tradingModel';
import Timeout from '../fiat-orders/timeout';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Toast } from 'antd-mobile';
import { getc2cOrderDetail, getDealerMobile, putuserSetConfirm } from '@/services/api';
import { timeToString } from '@/utils';
import SectorTime from '../fiat-orders/svgTime';
function FiatOrderUnhanding(props) {
  const [tradingShow, settradingShow] = useState(false);
  const [oderInfo, setoderInfo] = useState({});
  const [mobile, setmobile] = useState(' ');
  const { id } = props.location.query;
  const getOrderDetail = async () => {
    const res = await getc2cOrderDetail(id);
    if (res.code === '0') {
      setoderInfo({ oderInfo: res.result });
    }
  };
  const getMobile = async () => {
    let params = {
      tradeNo: id
    };
    const res = await getDealerMobile(params);
    if (res.code === '0') {
      setmobile({ mobile: res.result });
    }
  };
  const confirmPayment = async () => {
    const res = await putuserSetConfirm(id);
    if (res.code === '0') {
      Toast.success(res.result);
      router.push(`/otc/fiat-order-handling?id=${id}`);
    }
  };

  useEffect(() => {
    getOrderDetail();
    getMobile();
  }, []);
  const orderDetail = oderInfo.oderInfo;
  const Phone = mobile.mobile;
  if (!orderDetail) {
    return '';
  }

  return (
    <div>
      <TopBar>{formatMessage({ id: 'otcfiat.orderto.paid' })}</TopBar>
      <div className={styles.staycomplete}>
        <div className={styles.toptimeout}>
          <span className={styles.progres}>
            <SectorTime orderDetail={orderDetail} />
          </span>

          <span>
            <Timeout endTime={orderDetail.remainingTime} />
          </span>
        </div>
        <div className={styles.tradingprompt}>
          {formatMessage({ id: 'otcfiat.OrderUnhandle.timeout' }, { name: Math.floor(orderDetail.totalTime / 60000) })}
        </div>
        <div className={styles.orderInfo}>
          <div className={styles.infoTitle}>
            <span>{formatMessage({ id: 'otcfiat.order.info' })}</span>
            <p>{timeToString(Number(orderDetail.created), 'YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div className={styles.orderList}>
            <div>{formatMessage({ id: 'otcfiat.order.account' })}:</div>
            <div>{orderDetail.userAccount}</div>
          </div>
          <div className={styles.orderList}>
            <div>{formatMessage({ id: 'container.Theunit.price' })}:</div>
            <div>
              <span className={styles.piceSymbol}>{orderDetail.currency === 'VND' ? '₫' : '￥'}</span>

              {orderDetail.coinPrice}
            </div>
          </div>
          <div className={styles.orderListnumber}>
            <div>{formatMessage({ id: 'assets.treaty.history.number' })}:</div>
            <div>{orderDetail.coinAmount}</div>
          </div>
          <div className={styles.orderListPay}>
            <div>{formatMessage({ id: 'otcfiat.order.paid' })}:</div>
            <div>
              <span>
                <span>{orderDetail.currency === 'VND' ? '₫' : '￥'}</span>

                {orderDetail.cash}
              </span>
              <CopyToClipboard text={orderDetail.cash} onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}>
                <span className={styles.copy}>{formatMessage({ id: 'common.copy' })}</span>
              </CopyToClipboard>
            </div>
          </div>

          <div>
            <div className={styles.merchantsInfo}>
              <span>{formatMessage({ id: 'container.Business.information' })}</span>
            </div>
            <div className={styles.merchantsListName}>
              <div>{formatMessage({ id: 'ucenter.kyc.name' })}:</div>
              <div>
                <span>{orderDetail.dealerPayment.owner}</span>
                <CopyToClipboard
                  text={orderDetail.dealerPayment.owner}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <span className={styles.copy}>{formatMessage({ id: 'common.copy' })}</span>
                </CopyToClipboard>
              </div>
            </div>

            <div className={styles.merchantsListName}>
              <div>{formatMessage({ id: 'container.The.phone' })}:</div>
              <div>
                <span>{Phone}</span>
                <span className={styles.copy}>
                  <a href={`tel:${Phone}`}>{formatMessage({ id: 'otcfiat.phone.call' })}</a>
                </span>
              </div>
            </div>
            <div className={styles.merchantsListName}>
              <div>{formatMessage({ id: 'Please.enter.bank' })}:</div>
              <div>
                <span>{orderDetail.dealerPayment.bank}</span>
              </div>
            </div>
            <div className={styles.merchantsListBack}>
              <div>{formatMessage({ id: 'container.Bank.card.number' })}：</div>
              <div>
                <span>{orderDetail.dealerPayment.number}</span>
                <CopyToClipboard
                  text={orderDetail.dealerPayment.number}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <span className={styles.copy}>{formatMessage({ id: 'common.copy' })}</span>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div>{formatMessage({ id: 'otcfiat.payment.btn' })}</div>
          <Button type="primary" className={styles.paymentbtn} onClick={() => confirmPayment()}>
            {formatMessage({ id: 'otcfiat.ok.payment' })}
          </Button>
          <div className={styles.tradingPrompt} onClick={() => settradingShow(true)}>
            <i className="iconfont icontishi" style={{ paddingRight: 5 }}></i>
            <span>{formatMessage({ id: 'otcfiat.Trading.remind' })}</span>
          </div>
        </div>
      </div>

      <TradingModel settradingShowtwo={() => settradingShow()} tradingShowtwo={tradingShow} />
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(FiatOrderUnhanding);
