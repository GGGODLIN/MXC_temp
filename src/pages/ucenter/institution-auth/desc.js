import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { Flex, Tabs } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import styles from './desc.less';

const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Desc() {
  return (
    <>
      <TopBar>{formatMessage({ id: 'mc_institution_auth' })}</TopBar>
      <div className={classNames(styles.wrapper, isApp && styles.appWrapper)}>
        <div className={styles.content}>
          <div className={styles.item}>
            <h4 className={styles.title}>1、{formatMessage({ id: 'mc_institution_auth_step1_title' })}</h4>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc1' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc2' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc3' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc4' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc5' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc6' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc7' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_step1_desc8' })}</p>
          </div>
          <div className={styles.item}>
            <h4 className={styles.title}>2、{formatMessage({ id: 'mc_institution_auth_guide_title' })}</h4>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_guide_tip1' })}</p>
            <p className={styles.desc}>{formatMessage({ id: 'mc_institution_auth_guide_tip2' })}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Desc;
