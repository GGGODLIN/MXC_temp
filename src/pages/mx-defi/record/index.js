import { useState } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd-mobile';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import Defi from './Defi';
import Finance from './Finance';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';

const tab = [
  { title: formatMessage({ id: 'finance.title.launchpool' }), sub: 'FINANCE' },
  { title: formatMessage({ id: 'pos.title.pos_class_defi_mining' }), sub: 'DEFI' }
];

const Record = ({ user }) => {
  const [active, setActive] = useState('FINANCE');

  const toRecord = () => {
    const fromApp = window.localStorage.getItem('mxc.view.from') === 'app';
    if (fromApp) {
      window.location.href = 'mxcappscheme://airdrop_record';
    } else {
      router.push('/uassets/record?tabKey=other');
    }
  };

  return (
    <div>
      <TopBar gotoPath={'/mx-defi/list'}>{formatMessage({ id: 'finance.title.nav' })}</TopBar>
      <Tabs
        tabs={tab}
        initialPage={'FINANCE'}
        onChange={tab => {
          setActive(tab.sub);
        }}
        tabBarBackgroundColor={'transparent'}
      >
        <div>{user.id && <Finance active={active} />}</div>
        <div>{user.id && <Defi active={active} />}</div>
      </Tabs>
      {active === 'DEFI' && (
        <a className={styles.airdrop} onClick={toRecord}>
          {formatMessage({ id: 'assets.title.airdrop.record' })}
        </a>
      )}
    </div>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(Record);
