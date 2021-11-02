import React from 'react';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import TopBar from '@/components/TopBar';

const Terms = () => {
  return (
    <>
      <TopBar>{formatMessage({ id: 'info.title.risk.title' })}</TopBar>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.segment}>
            <div className={styles.secondTitle}>{formatMessage({ id: 'info.title.risk.line_1' })}</div>
            <p>{formatMessage({ id: 'info.title.risk.line_2' })}</p>
          </div>

          <div className={styles.segment}>
            <div className={styles.secondTitle}>{formatMessage({ id: 'info.title.risk.line_3' })}</div>
            <p>{formatMessage({ id: 'mc_terms_risk_statement_4' })}</p>
            <p>{formatMessage({ id: 'info.title.risk.line_5' })}</p>
            <p>{formatMessage({ id: 'info.title.risk.line_6' })}</p>
            <p>{formatMessage({ id: 'info.title.risk.line_7' })}</p>
            <div className={styles.secondSegment}>
              <p>{formatMessage({ id: 'info.title.risk.line_8' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_9' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_10' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_11' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_12' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_13' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_14' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_15' })}</p>
              <p>{formatMessage({ id: 'info.title.risk.line_16' })}</p>
            </div>
          </div>

          <div className={styles.segment}>
            <div className={styles.secondTitle}>{formatMessage({ id: 'info.title.risk.line_17' })}</div>
            <p>{formatMessage({ id: 'info.title.risk.line_18' })}</p>
            <p>{formatMessage({ id: 'info.title.risk.line_19' })}</p>
            <p>{formatMessage({ id: 'info.title.risk.line_20' })}</p>
          </div>

          <div className={styles.segment}>
            <div className={styles.secondTitle}>{formatMessage({ id: 'info.title.risk.line_21' })}</div>
            <p>{formatMessage({ id: 'info.title.risk.line_22' })}</p>
          </div>

          <div className={styles.segment}>
            <div className={styles.secondTitle}>{formatMessage({ id: 'info.title.risk.line_23' })}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
