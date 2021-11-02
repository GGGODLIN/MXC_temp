import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { SwipeAction, List, Card } from 'antd-mobile';
import { Button, Toast } from 'antd-mobile';
import styles from './bankList.less';
import { getBankLists, putRmBank } from '@/services/api';
import Empty from '@/components/Empty';
import { getCookie } from '@/utils';
const bank = (bankList, setbankList) => {
  return bankList.map(item => {
    return (
      <div className={styles.listContent} key={item.id}>
        <List>
          <SwipeAction
            autoClose
            right={[
              {
                text: <i className="iconfont iconic_copy"></i>,
                onPress: () => delectBank(item.id, setbankList),
                style: { width: '80px', color: '#FC4A5B', fontSize: '36px' }
              }
            ]}
          >
            <div className={styles.banklist}>
              <div className={styles.bankIcon}>
                <i className="iconfont iconic_bank"></i>
                <span>{item.bank}</span>
              </div>
              <div className={styles.bankName}>{item.owner}</div>
              <div className={styles.bankNumber}>{item.number}</div>
            </div>
          </SwipeAction>
        </List>
      </div>
    );
  });
};

const delectBank = async (item, setbankList) => {
  const res = await putRmBank(item);
  if (res.code === '0') {
    userBankList(setbankList);
  }
};
const userBankList = async setbankList => {
  const res = await getBankLists(1);
  if (res.code === '0') {
    setbankList(res.result);
  }
};
function BankList(props) {
  const [bankList, setbankList] = useState([]);
  const { user } = props;
  const cookieUid = getCookie('u_id');
  useEffect(() => {
    if (user.uid || cookieUid) {
      userBankList(setbankList);
    }
  }, []);
  return (
    <>
      {bankList.length >= 1 ? (
        <div className={styles.bankListContent}>{bank(bankList, setbankList)}</div>
      ) : (
        <Card>
          <div>
            <Empty />
          </div>
        </Card>
      )}
      <div className={styles.btnadd}>
        <Button disabled={bankList.length >= 1 ? true : false} type="primary" onClick={() => router.push('/ucenter/bank-add')}>
          {formatMessage({ id: 'assets.title.index.withdraw_manage_add' })}
        </Button>
      </div>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(BankList);
