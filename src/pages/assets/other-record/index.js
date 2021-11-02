import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import List from './List';

const OtherRecord = () => {
  return (
    <>
      <TopBar>{formatMessage({ id: 'assets.transfer.record' })}</TopBar>
      <List />
    </>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(OtherRecord);
