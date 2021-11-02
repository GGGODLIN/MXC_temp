import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { Flex, Tabs } from 'antd-mobile';
import TopBar from '@/components/TopBar';

import styles from './index.less';
import Invite from './invite';
import Rebate from './rebate';

const tabs = [{ title: formatMessage({ id: 'act.Invited.Torecord' }) }, { title: formatMessage({ id: 'act.Commission.record' }) }];
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function RebateRecord() {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  return (
    <>
      <TopBar>
        <Flex className={styles.tab} justify="center">
          <div onClick={() => setCurrentTabIndex(0)} className={classNames({ [styles.active]: currentTabIndex === 0 })}>
            {formatMessage({ id: 'act.Invited.Torecord' })}
          </div>

          <div onClick={() => setCurrentTabIndex(1)} className={classNames({ [styles.active]: currentTabIndex === 1 })}>
            {formatMessage({ id: 'act.Commission.record' })}
          </div>
        </Flex>
      </TopBar>

      <div className={classNames(styles.wrapper, isApp && styles.appWrapper)}>
        {isApp && (
          <Flex className={styles.contentTab} justify="center">
            <div onClick={() => setCurrentTabIndex(0)} className={classNames({ [styles.active]: currentTabIndex === 0 })}>
              {formatMessage({ id: 'act.Invited.Torecord' })}
            </div>

            <div onClick={() => setCurrentTabIndex(1)} className={classNames({ [styles.active]: currentTabIndex === 1 })}>
              {formatMessage({ id: 'act.Commission.record' })}
            </div>
          </Flex>
        )}

        <Tabs
          tabs={tabs}
          page={currentTabIndex}
          onChange={(tab, index) => {
            setCurrentTabIndex(index);
          }}
          tabBarPosition="top"
        >
          <div className={styles['content-wrapper']}>
            <Invite />
          </div>
          <div className={styles['content-wrapper']}>
            <Rebate />
          </div>
        </Tabs>
      </div>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(RebateRecord);
