import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './userFinihPaymentModel.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { getPayMoney } from '@/services/api';
import { Modal, InputItem, Button } from 'antd-mobile';
import { List, Radio, Flex, Toast } from 'antd-mobile';
import { putPaymentType } from '@/services/api';
import { getSubSite } from '@/utils';
const RadioItem = Radio.RadioItem;
function UserFinihPaymentModel(props) {
  const { orderInfo, paymentId, setPaymentId, allPaymentList, setPayment, currencyVisible, setCurrencyVisible, userOrderInfo } = props;
  useEffect(() => {}, []);
  const paymentBtn = async () => {
    let params = {
      id: orderInfo.id,
      paymentId: paymentId
    };
    const res = await putPaymentType(params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'otc.complaint.awaitCurrency' }), 1);
      userOrderInfo();
      setCurrencyVisible(false);
    }
  };

  const paymentTooltip = pay => {
    let payIcon = allPaymentList.find(item => item.id === pay);
    return (
      <>
        <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
      </>
    );
  };
  return (
    <div>
      <Modal popup animationType="slide-up" visible={currencyVisible} onClose={() => setCurrencyVisible(false)}>
        <div className={styles.modelContent}>
          <div className={styles.paymentModelTitle}>
            {formatMessage({ id: 'otc.order.transferTitle' })}
            <span className={styles.clear} onClick={() => setCurrencyVisible(false)}>
              {formatMessage({ id: 'common.cancel' })}
            </span>
          </div>
          <div className={styles.paymentMoneyInfo}>
            <div>
              {formatMessage({ id: 'depths.list.amount' })}:
              <span className={styles.currencyColor}>{`${orderInfo.amount} ${orderInfo.currency}`}</span>
            </div>
            <div>
              {formatMessage({ id: 'assets.treaty.history.number' })}:
              <span className={styles.currencyColor}>{`${orderInfo.quantity} ${orderInfo.coinName}`}</span>
            </div>
          </div>
          <div className={styles.paymentMoneyList}>
            <List
              renderHeader={() => {
                formatMessage({ id: 'otc.order.transferPrompnt' });
              }}
            >
              {orderInfo.paymentInfo.map(i => (
                <RadioItem
                  key={i.id}
                  checked={paymentId === i.id}
                  onChange={() => {
                    console.log(i);
                    setPayment(i.id);
                    setPaymentId(i.id);
                  }}
                >
                  <span>{paymentTooltip(i.payMethod)}</span>
                  <span className={styles.bankName}>{i.bankName}</span>
                  <span className={styles.paymentName}>{i.account}</span>
                </RadioItem>
              ))}
            </List>
          </div>
          <div className={styles.footerBtn}>
            <Button type="primary" onClick={() => paymentBtn()}>
              {formatMessage({ id: 'otc.order.transferBtn' })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  allPaymentList: otc.allPaymentList,
  user: auth.user
}))(UserFinihPaymentModel);
