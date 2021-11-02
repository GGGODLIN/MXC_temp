import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import { getC2cQueryOrder } from '@/services/api';
import NewOrderList from './newOrderList';
import { getCookie } from '@/utils';
const getC2cyOrder = async (setState, tradeType) => {
  let params = {
    pageSize: 10,
    pageNum: 1,
    tradeType: tradeType,
    status: 'created|accepted|confirmed|timeout'
  };
  const res = await getC2cQueryOrder(params);
  if (res.code === '0') {
    setState(res.result);
  }
};

function FiatOrdersHook(props) {
  const [state, setState] = useState([]);
  const { user } = props;
  const cookieUid = getCookie('u_id');
  useEffect(() => {
    if (user.uid || cookieUid) {
      getC2cyOrder(setState, props.tradeType);
    }
  }, [props.tradeType, props.sellOrder]);

  return (
    <div className={styles.fiatorderContent}>
      <div className={styles.fiatordertitle}>
        <div>{formatMessage({ id: 'trade.spot.title.new_order' })}</div>
        <div onClick={() => router.push('/otc/fiat-orders')}>{formatMessage({ id: 'otcfiat.Order.record' })}</div>
      </div>
      <div className={styles.line}></div>
      <NewOrderList value={state} tradeType={props.tradeType} getorder={() => getC2cyOrder(setState, props.tradeType)} />
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(FiatOrdersHook);
