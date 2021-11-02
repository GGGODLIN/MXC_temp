import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
function QuickTrading(props) {
  const [bankVisible, setBankVisible] = useState(true);
  useEffect(() => {}, []);

  return (
    <div>
      <div className={styles.headerTab}></div>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(QuickTrading);
