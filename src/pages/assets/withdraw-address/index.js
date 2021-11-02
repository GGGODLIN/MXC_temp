import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import { Button } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import List from './List';
import styles from './index.less';

const WithdrawAddress = ({ list, location, withdrawFormValues, dispatch }) => {
  const { currency, chain } = location.query;
  const assetItem = list.find(el => el.vcoinNameEn === currency) || {};

  const add = e => {
    router.push(`/uassets/withdraw-address-new?currency=${currency}&chain=${chain}`);
  };

  return (
    <>
      <TopBar>
        <div className={styles.title}>
          {assetItem.vcoinNameEn} {formatMessage({ id: 'assets.withdraw.title' })}
        </div>
      </TopBar>
      <List currency={currency} chain={chain} dispatch={dispatch} withdrawFormValues={withdrawFormValues} />
      <div className={styles.fixed}>
        <Button type="primary" onClick={add}>
          {formatMessage({ id: 'assets.title.index.withdraw_manage_add' })}
        </Button>
      </div>
    </>
  );
};

export default connect(({ assets }) => ({
  list: assets.list,
  withdrawFormValues: assets.withdrawFormValues
}))(WithdrawAddress);
