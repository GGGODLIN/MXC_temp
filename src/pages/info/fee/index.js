import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { WingBlank, WhiteSpace, Flex } from 'antd-mobile';

import styles from './index.less';

function Fee() {
  return (
    <>
      <TopBar>{formatMessage({ id: 'footer.rate' })}</TopBar>
      <WhiteSpace size="xl" />
      <WingBlank>
        <h3 className={styles.title}>{formatMessage({ id: 'info.fee.title' })}</h3>
        <Flex className={styles.fee}>
          <div>
            <p>{formatMessage({ id: 'info.fee.maker' })}</p>
            <p>0.2%</p>
          </div>
          <div>
            <p>{formatMessage({ id: 'info.fee.taker' })}</p>
            <p>0.2%</p>
          </div>
        </Flex>
        <h3 className={styles.title}>{formatMessage({ id: 'footer.rate' })}</h3>
        <section className={styles.content}>
          <p>{formatMessage({ id: 'info.fee.text1' })}</p>
          <p>{formatMessage({ id: 'info.fee.text2' })}</p>
          <p>{formatMessage({ id: 'info.fee.text3' })}</p>
          <p>{formatMessage({ id: 'info.fee.text4' })}</p>
          <p>{formatMessage({ id: 'info.fee.text5' })}</p>
          <p>{formatMessage({ id: 'info.fee.text6' })}</p>
          <p>{formatMessage({ id: 'info.fee.text7' })}</p>
          <p>{formatMessage({ id: 'info.fee.text8' })}</p>
        </section>
      </WingBlank>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Fee);
