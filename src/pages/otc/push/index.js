import React, { useState, useMemo, useReducer, createContext } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import Tab from './tab';
function Push() {
  const [pushType, setpushType] = useState(false);
  console.log(localStorage.getItem('mxc.view.from'));
  return (
    <div className={styles.pushContent}>
      <TopBar extra={<i className="iconfont iconjilux" onClick={() => router.push('/otc/push-record')}></i>}>
        {formatMessage({ id: 'container.Internal.trade' })}
      </TopBar>
      <div className={styles.pushSwitch}>
        <div className={classNames([pushType === false ? styles.switchactive : ''])} onClick={() => setpushType(false)}>
          {formatMessage({ id: 'container.Send.a.PUSH' })}
        </div>
        <div className={classNames([pushType === true ? styles.switchactive : ''])} onClick={() => setpushType(true)}>
          {formatMessage({ id: 'otcpush.switch.closed' })}
        </div>
        {localStorage.getItem('mxc.view.from') !== 'app' ? (
          ''
        ) : (
          <div className={styles.recordIcon} onClick={() => router.push('/otc/push-record')}>
            <i className="iconfont iconjilux"></i>
          </div>
        )}
      </div>
      <div>
        <Tab pushType={pushType} />
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Push);
