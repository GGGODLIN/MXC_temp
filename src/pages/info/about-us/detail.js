import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { WingBlank, WhiteSpace } from 'antd-mobile';

import styles from './index.less';

function Detail() {
  return (
    <>
      <TopBar>{formatMessage({ id: 'info.about.title' })}</TopBar>
      <WhiteSpace size="xl" />
      <WingBlank className={styles.contact}>
        <p>{formatMessage({ id: 'info.about.detail' })}</p>
      </WingBlank>
    </>
  );
}

export default Detail;
