import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { timeToString } from '@/utils';
import { Toast, Tabs } from 'antd-mobile';
import styles from './index.less';
import { PullToRefresh, ListView } from 'antd-mobile';
import { getOrderHistory, putCancelPushBid } from '@/services/api';
import Content from './content';
import List from './list';
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
function PushRecord() {
  const [state, setState] = useReducer(reducer, initialState);
  const [tradingType, settradingType] = useState('SELL');
  const [tradingPage, settradingPage] = useState(1);
  const [tradingPageSize, settradingPageSize] = useState(10);
  const [tradingList, settradingList] = useState([]);
  const [activeId, setactiveId] = useState(0);
  let { list, more, page, page_size, height } = state;
  useEffect(() => {}, []);
  const pushTypeSwitch = (settradingType, type, setactiveId, id, tradingPage, tradingPageSize, settradingList) => {
    settradingType(type);
    setactiveId(id);
  };
  return (
    <div>
      <TopBar>
        <div className={styles.pushOrderHerder}>
          <div
            onClick={() => pushTypeSwitch(settradingType, 'SELL', setactiveId, 0, tradingPage, tradingPageSize, settradingList)}
            className={classNames(tradingType === 'SELL' && styles.tabActive)}
          >
            {formatMessage({ id: 'container.Send.a.PUSH' })}
          </div>
          <div
            onClick={() => pushTypeSwitch(settradingType, 'BUY', setactiveId, 1, tradingPage, tradingPageSize, settradingList)}
            className={classNames(tradingType === 'BUY' && styles.tabActive)}
          >
            {formatMessage({ id: 'otcpush.switch.closed' })}
          </div>
        </div>
      </TopBar>
      {localStorage.getItem('mxc.view.from') !== 'app' ? (
        ''
      ) : (
        <div className={styles.pushOrderHerder}>
          <div
            onClick={() => pushTypeSwitch(settradingType, 'SELL', setactiveId, 0, tradingPage, tradingPageSize, settradingList)}
            className={classNames(tradingType === 'SELL' && styles.tabActive)}
          >
            {formatMessage({ id: 'container.Send.a.PUSH' })}
          </div>
          <div
            onClick={() => pushTypeSwitch(settradingType, 'BUY', setactiveId, 1, tradingPage, tradingPageSize, settradingList)}
            className={classNames(tradingType === 'BUY' && styles.tabActive)}
          >
            {formatMessage({ id: 'otcpush.switch.closed' })}
          </div>
        </div>
      )}

      <div>{tradingType === 'SELL' ? <Content type={'SELL'} /> : <List type={'BUY'} />}</div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(PushRecord);
