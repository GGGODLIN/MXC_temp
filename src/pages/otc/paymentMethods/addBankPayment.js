import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './addAilPayment.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { List, InputItem, ImagePicker, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import { putPaymentMethod, putPayInfo } from '@/services/api';
import router from 'umi/router';
const Item = List.Item;
const Brief = Item.Brief;
function AddAilPayment(props) {
  const { otcuser } = props;
  let { id } = props.location.query;
  const { getFieldProps } = props.form;
  const [files, setFiles] = useState([]);
  const [account, setAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  useEffect(() => {
    if (id) {
      getPaymentInfo();
    }
  }, [id]);

  const getPaymentInfo = async () => {
    const res = await putPayInfo(id);
    console.log(res);
    if (res.code === 0) {
      setAccount(res.data.account);
      setBankName(res.data.bankName);
      setBankAddress(res.data.bankAddress);
    }
  };
  const addPaymentBtn = async () => {
    let params = {
      id: id,
      payMethod: 1,
      bankName: bankName,
      account: account,
      bankAddress: bankAddress,
      payee: '',
      qrCode: ''
    };
    let type = id ? 'PUT' : 'POST';
    const res = await putPaymentMethod(type, params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'Add.a.success' }), 1);
      router.goBack();
    }
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.payment.addBankAccount' })}</TopBar>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'ucenter.kyc.name' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('name')}
            value={otcuser.realName}
            disabled
            clear
            placeholder={formatMessage({ id: 'ucenter.kyc.name.require' })}
          ></InputItem>
        </div>
      </div>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'otc.payment.bankAccount' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('account')}
            value={account}
            onChange={e => {
              setAccount(e);
            }}
            clear
            placeholder={formatMessage({ id: 'otc.payment.PleaseBankVal' })}
          ></InputItem>
        </div>
      </div>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'Please.enter.bank' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('bankName')}
            value={bankName}
            onChange={e => {
              setBankName(e);
            }}
            clear
            placeholder={formatMessage({ id: 'otc.payment.openeBankVal' })}
          ></InputItem>
        </div>
      </div>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'otc.order.payee' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('bankAddress')}
            value={bankAddress}
            onChange={e => {
              setBankAddress(e);
            }}
            clear
            placeholder={formatMessage({ id: 'otc.please.payee' })}
          ></InputItem>
        </div>
      </div>
      <div className={styles.addBtn} onClick={() => addPaymentBtn()}>
        {' '}
        {id ? formatMessage({ id: 'otc.payment.alter' }) : formatMessage({ id: 'otc.payment.add' })}
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  otcuser: otc.otcuser
}))(createForm()(AddAilPayment));
