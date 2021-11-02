import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { WingBlank, WhiteSpace, Button } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import exampleImg from '@/assets/img/ucenter/phishing_example.png';

import styles from './index.less';

function Phishing() {
  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.phishing.title' })}</TopBar>
      <WhiteSpace size="xl" />
      <WingBlank>
        <section className={styles.tip}>
          <h3>{formatMessage({ id: 'ucenter.phishing.warning' })}</h3>
          <p className={styles.warning}>{formatMessage({ id: 'ucenter.phishing.tip' })}</p>
        </section>
        <section className={styles.tip}>
          <h3>{formatMessage({ id: 'ucenter.phishing.question1' })}</h3>
          <p>{formatMessage({ id: 'ucenter.phishing.answer1' })}</p>
        </section>
        <section className={styles.tip}>
          <h3>{formatMessage({ id: 'ucenter.phishing.question2' })}</h3>
          <p dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'ucenter.phishing.answer2' }) }}></p>
        </section>
        <section className={styles.example}>
          <p>*{formatMessage({ id: 'ucenter.phishing.example_title' })}</p>
          <div className={styles.bg}>
            <div className={styles.tip}>
              {formatMessage({ id: 'ucenter.features.phishing' })}
              <span>Example1239280488</span>
            </div>
          </div>
        </section>
        <section className={styles.go}>
          <Button type="primary" onClick={() => router.push('/ucenter/phishing-set')}>
            {formatMessage({ id: 'ucenter.phishing.set' })}
          </Button>
        </section>
      </WingBlank>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Phishing);
