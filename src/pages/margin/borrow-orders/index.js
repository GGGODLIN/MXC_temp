import { useReducer, useEffect } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import { Tabs } from 'antd-mobile';

import TopBar from '@/components/TopBar';
import styles from './index.less';
import BackRecord from './back';
import LoanRecord from './loan';

const initialState = {
  orderType: 'loan',
  currentTabIndex: 0
};

const reducer = (state, payload) => {
  return { ...state, ...payload };
};

const tabs = [{ title: formatMessage({ id: 'margin.title.record.loan' }) }, { title: formatMessage({ id: 'margin.title.record.back' }) }];

const BorrowOrders = ({ location }) => {
  const [state, setState] = useReducer(reducer, initialState);
  useEffect(() => {
    switchOrderType(location.query.type === 'loan' ? 0 : 1);
  }, []);
  useEffect(() => {}, [state.orderType]);
  const switchOrderType = index => {
    setState({
      orderType: index === 0 ? 'loan' : 'back',
      currentTabIndex: index
    });
  };

  return (
    <div>
      <TopBar>
        <div className={styles.title}>
          <div className={state.orderType === 'loan' ? styles.active : ''} onClick={() => switchOrderType(0)}>
            {formatMessage({ id: 'margin.title.record.loan' })}
          </div>
          <div className={state.orderType === 'back' ? styles.active : ''} onClick={() => switchOrderType(1)}>
            {formatMessage({ id: 'margin.title.record.back' })}
          </div>
        </div>
      </TopBar>
      <div className={styles.wrapper}>
        <Tabs
          tabs={tabs}
          page={state.currentTabIndex}
          onChange={(tab, index) => {
            switchOrderType(index);
          }}
          tabBarPosition="top"
        >
          <LoanRecord active={state.currentTabIndex === 0} />
          <BackRecord active={state.currentTabIndex === 1} />
        </Tabs>
      </div>
    </div>
  );
};

export default BorrowOrders;
