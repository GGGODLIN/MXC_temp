import React, { useState, useMemo, useReducer, createContext, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { Progress, Button, Modal, Checkbox, Picker, List } from 'antd-mobile';
import styles from './sendpush.less';
import { getPushBids, getCnyPrice } from '@/services/api';
import { PullToRefresh, ListView } from 'antd-mobile';
import Empty from '@/components/Empty';
import { getCookie, cutFloatDecimal } from '@/utils';
import otc from '../../../models/otc';
function Body({ children }) {
  return <section className={styles.items}>{children}</section>;
}
const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
});
const initialState = {
  list: dataSource.cloneWithRows([]),
  more: true,
  page_size: 10, //单次渲染条数
  page: 1,
  pushCoinName: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}
const AgreeItem = Checkbox.AgreeItem;
const sendPush = item => {
  const cookieUid = getCookie('u_id');
  if (cookieUid) {
    router.push(`/otc/push-bid?id=${item.id}&market=${item.market}`);
  } else {
    router.push(`/auth/signin`);
  }
};

function SendPush(props) {
  const { pushPrecision, dispatch } = props;
  const [modal3Visible, setModal3Visible] = useState(false);
  const [sendPushList, setsendPushList] = useState([]);
  const [selectValue, setselectValue] = useState('');
  const [currencyRate, setCurrencyRate] = useState('');
  const [state, setState] = useReducer(reducer, initialState);
  let { list, more, page, page_size, height, pushCoinName } = state;
  const SelectionList = props.selectlist;
  const activeTab = props.activeTab;
  const pushselcetInfo = props.pushInfo;
  const onRefresh = e => {
    setState({ page: 1, more: true });
    getList(pushselcetInfo, setselectValue, 'refresh');
  };

  const onEndReached = async e => {
    console.log('执行了');
    console.log(more);
    if (more) {
      setState({ page: page + 1 });
      getList(pushselcetInfo, setselectValue, 'false');
    }
  };
  const getList = async (pushselcet, setselectValue, tradingType) => {
    if (pushselcet.length > 0) {
      let currency = `${pushselcet[0].currency}_${pushselcet[0].market}`;
      let pages = page;
      let pageSize = 10;
      const res = await getPushBids(currency, pages, pageSize);
      if (res.code === 0) {
        const data = res.data || [];
        setsendPushList(res.data);
        let arrayTrading = [pushselcet[0].market];
        setselectValue(arrayTrading);
        if (data.length > 0) {
          if (page === 1) {
            dispatch({
              type: 'otc/changePushList',
              payload: res.data[0]
            });
          }
          console.log(tradingType);
          if (tradingType === 'refresh') {
            setState({ list: dataSource.cloneWithRows(data) });
          } else {
            setState({ list: dataSource.cloneWithRows(list._dataBlob.s1.concat(data)) });
          }
        } else {
          setState({ more: false });
        }
      }
    }
  };
  useEffect(() => {
    setState({ list: dataSource.cloneWithRows([]) });
  }, [activeTab]);
  useEffect(() => {
    getList(pushselcetInfo, setselectValue, 'refresh');
  }, [pushselcetInfo, page]);
  useEffect(() => {
    if (SelectionList.length > 0) {
      setState({ pushCoinName: SelectionList[0].value });
    }
  }, [SelectionList]);

  useEffect(() => {
    if (pushCoinName) {
      getCoinNamePrice();
    }
  }, [pushCoinName]);
  const row = item => {
    const percentage = (Number(item.dealQuantity) * 100) / Number(item.quantity);
    const money = Number(item.price);
    let progress = percentage.toFixed(2);
    let price = money.toFixed(5);
    const valuationCNY = Number(currencyRate * price);
    let referencePrice = cutFloatDecimal(valuationCNY, 2);
    // console.log(pushPrecision)
    return (
      <div className={styles.sendPushList} key={item.id} onClick={() => sendPush(item)}>
        <div className={styles.listTitle}>
          <div>
            <span className={styles.currencyColor}>{item.currency}</span>
            <span>/{item.market}</span>
          </div>
          <div>
            <span>{formatMessage({ id: 'container.Theunit.price' })}</span>
            <span>
              {price}
              {item.market}
            </span>
            {/* <p>≈{referencePrice} CNY</p> */}
          </div>
        </div>
        <div className={styles.listInfo}>
          <div>
            <span>{formatMessage({ id: 'Theproject.schedule' })}</span>
            <span>{progress}%</span>
            <div>
              <Progress percent={progress} position="normal" className={styles.listBar} />
            </div>
          </div>
          <div>
            {/* <span>{formatMessage({ id: 'assets.treaty.history.number' })}</span> */}
            {/* <p>{item.quantity}</p> */}
          </div>
          <div className={styles.pushBtnColor}>
            <span>PUSH</span>
          </div>
        </div>
      </div>
    );
  };
  const getCoinNamePrice = async () => {
    const res = await getCnyPrice(pushCoinName);
    // console.log(res)
    if (res.code === 0) {
      setCurrencyRate(res.data);
    }
  };

  const selectCurrency = async (val, activeTab, setsendPushList, setselectValue, setCurrencyRate, setState) => {
    let currency = `${activeTab}_${val[0]}`;
    let page = 1;
    let pageSize = 80;
    setselectValue(val);
    const res = await getPushBids(currency, page, pageSize);
    const getCurrencyRate = await getCnyPrice(val);
    if (res.code === 0) {
      setsendPushList(res.data);
      setState({ list: dataSource.cloneWithRows(res.data) });
    }
    if (getCurrencyRate.code === 0) {
      setCurrencyRate(getCurrencyRate.data);
    }
  };
  return (
    <div>
      <div className={styles.pushSelect}>
        <Picker
          extra={formatMessage({ id: 'common.select' })}
          okText={formatMessage({ id: 'common.sure' })}
          dismissText={formatMessage({ id: 'common.cancel' })}
          data={SelectionList}
          cols={1}
          value={selectValue}
          onChange={val => selectCurrency(val, activeTab.title, setsendPushList, setselectValue, setCurrencyRate, setState)}
        >
          <List.Item arrow="horizontal">{formatMessage({ id: 'otcpush.select.tradingon' })}</List.Item>
        </Picker>
      </div>
      <ListView
        style={{
          height: 'calc(100vh - 260px)',
          overflow: 'auto'
        }}
        dataSource={list}
        renderBodyComponent={() => <Body />}
        renderFooter={() => <div style={{ textAlign: 'center' }}>{!more && formatMessage({ id: 'common.no.data_more' })}</div>}
        renderRow={row}
        pullToRefresh={<PullToRefresh onRefresh={onRefresh} />}
        pageSize={page_size}
        onEndReached={onEndReached}
        onEndReachedThreshold={10}
      />

      <div>
        <Modal popup animationType="slide-up" visible={modal3Visible} onClose={() => setModal3Visible(false)}>
          <div className={styles.sendModelContent}>
            <div className={styles.sendModelTitle}>
              <i className="iconfont icontishi" style={{ paddingLeft: 5 }}></i>
              <span>{formatMessage({ id: 'otcpush.order.Please' })}</span>
            </div>
            <div className={styles.sendModelPrompt}>{formatMessage({ id: 'otcpush.order.prompt' })}</div>
            <div>
              <div className={styles.sendModelFooter}>
                <AgreeItem data-seed="logId" onChange={e => console.log('checkbox', e)}>
                  <span className={styles.sendModelPrompt}>{formatMessage({ id: 'ucenter.frozen.reason.affirm' })}</span>
                </AgreeItem>
              </div>
              <div className={styles.sendModelBtn}>
                <Button type="primary" inline className={'am-button-circle'} onClick={() => setModal3Visible(false)}>
                  OK
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default connect(({ auth, otc }) => ({
  user: auth.user,
  pushPrecision: otc.pushPrecision
}))(SendPush);
