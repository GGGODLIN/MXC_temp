import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import BankList from './bankList';
import { Button, Toast } from 'antd-mobile';
import styles from './index.less';
function AddBank() {
  return (
    <div className={styles.bankContent}>
      <TopBar>{formatMessage({ id: 'header.management' })}</TopBar>
      <BankList />
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(AddBank);
