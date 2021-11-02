import { useState } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import TimeFilter from '@/components/TimeFilter';
import LockRecord from './LockRecord';
import HoldRecord from './HoldRecord';
import { formatMessage } from 'umi-plugin-locale';
import moment from 'moment';

const tab = [
  { title: formatMessage({ id: 'pos.title.pos_class_margin' }), sub: 'MARGIN' },
  { title: formatMessage({ id: 'pos.title.pos_class_lock' }), sub: 'LOCK' },
  { title: formatMessage({ id: 'pos.title.pos_class_hold' }), sub: 'HOLD' }
];

const Record = ({ coinList, user }) => {
  const [active, setActive] = useState('MARGIN');

  return (
    <div>
      <TopBar gotoPath={'/pos/list'}>MEXC PoS</TopBar>
      <Tabs
        tabs={tab}
        initialPage={'MARGIN'}
        onChange={tab => {
          setActive(tab.sub);
        }}
        tabBarBackgroundColor={'transparent'}
      >
        <div>{user.id && <LockRecord tabKey={'MARGIN'} zone={active}></LockRecord>}</div>
        <div>{user.id && <LockRecord tabKey={'LOCK'} zone={active}></LockRecord>}</div>
        <div>{user.id && <HoldRecord tabKey={'HOLD'} zone={active}></HoldRecord>}</div>
      </Tabs>
    </div>
  );
};

export default connect(({ auth, global }) => ({
  user: auth.user
}))(Record);
