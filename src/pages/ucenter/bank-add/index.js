import React, { useState, useMemo, useReducer, createContext, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Toast, InputItem, Button, Picker, List } from 'antd-mobile';
import { createForm } from 'rc-form';
import styles from './index.less';
import { getALLBank, putBankList } from '@/services/api';
import { passwordReg, emailReg, mobileReg } from '@/utils/regExp';
const submit = (props, bankName) => {
  props.form.validateFields(async (error, value) => {
    if (!error) {
      if (value.number === value.numbertwo) {
        let params = {
          address: value.address,
          bankId: bankName[0],
          number: value.number,
          owner: value.owner
        };
        const res = await putBankList(params);
        if (res.code === '0') {
          Toast.success(formatMessage({ id: 'Add.a.success' }), 2);
          router.go(-1);
        } else {
          Toast.success(res.desc);
        }
      } else {
        Toast.success(formatMessage({ id: 'mxc.otc.addbank' }), 2);
      }
    }
  });
};
const allBankList = item => {
  let coins = [];
  item.forEach(item => {
    coins.push({
      label: item.name,
      value: item.id,
      currency: item.currency
    });
  });
  return coins;
};
function AddBank(props) {
  const [bankList, setbankList] = useState();
  const [bankName, setbankName] = useState('');
  const [bank, setbank] = useState('');
  const { getFieldProps, validateFields, isFieldTouched, getFieldError, getFieldValue } = props.form;
  const language = getLocale();
  useEffect(() => {
    const allBank = async () => {
      const res = await getALLBank();
      if (res.code === '0') {
        setbankList(res.result);
      }
    };
    allBank();
  }, []);

  if (!bankList) {
    return '';
  }
  const accountError = getFieldError('owner');
  const addressError = getFieldError('address');
  const numberError = getFieldError('number');
  const numbertwoError = getFieldError('numbertwo');
  let getFieldValueName = getFieldValue('owner');
  let getFieldValueaddress = getFieldValue('address');
  let getFieldValuenumber = getFieldValue('number');
  let getFieldValuenumbertwo = getFieldValue('numbertwo');
  const selctList = val => {
    setbankName(val);
    const data = bankList.find(post => {
      return post.id === val[0];
    });
    setbank(data.name);
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'header.management' })}</TopBar>
      <div className={styles.bankAddContent}>
        <div className={styles.listInterval}>
          <p className={styles.bankInputTitle}>{formatMessage({ id: 'ucenter.kyc.name' })}</p>
          <InputItem
            className={styles.inputList}
            {...getFieldProps('owner', {
              rules: [{ required: true, message: formatMessage({ id: 'ucenter.kyc.name.require' }) }]
            })}
            placeholder={formatMessage({ id: 'ucenter.kyc.name.require' })}
            clear
          ></InputItem>
          <p className={styles.error}>{accountError && isFieldTouched('owner') ? accountError.join(',') : ''}</p>
        </div>
        <div className={styles.listInterval}>
          <p className={styles.bankInputTitle}>{formatMessage({ id: 'Please.enter.bank' })}</p>
          <div className={styles.selectVal}>
            <Picker
              title=""
              data={allBankList(bankList)}
              cols={1}
              value={bankName}
              onChange={val => {
                selctList(val);
              }}
            >
              <List.Item arrow="horizontal">{bankName ? '' : formatMessage({ id: 'otcbank.add.list' })} </List.Item>
            </Picker>
          </div>
        </div>
        <div className={styles.listInterval}>
          <p className={styles.bankInputTitle}>{formatMessage({ id: 'container.Where.it.is' })}</p>
          <InputItem
            className={styles.inputList}
            {...getFieldProps('address', {
              rules: [{ required: true, message: formatMessage({ id: 'otcbank.add.bankaddress' }) }]
            })}
            placeholder={formatMessage({ id: 'otcbank.add.bankaddress' })}
            clear
          ></InputItem>
          <p className={styles.error}>{addressError && isFieldTouched('address') ? addressError.join(',') : ''}</p>
        </div>
        <div className={styles.listInterval}>
          <p className={styles.bankInputTitle}>{formatMessage({ id: 'container.Bank.card.number' })}</p>
          <InputItem
            className={styles.inputList}
            type="digit"
            {...getFieldProps('number', {
              rules: [{ required: true, message: formatMessage({ id: 'Please.bank.card.number' }) }]
            })}
            placeholder={formatMessage({ id: 'Please.bank.card.number' })}
            clear
          ></InputItem>
          <p className={styles.error}>{numberError && isFieldTouched('number') ? numberError.join(',') : ''}</p>
        </div>
        <div className={styles.listInterval}>
          <p className={styles.bankInputTitle}>{formatMessage({ id: 'Repeat.the.card.number' })}</p>
          <InputItem
            className={styles.inputList}
            type="digit"
            {...getFieldProps('numbertwo', {
              rules: [{ required: true, message: formatMessage({ id: 'Please.bank.card.number' }) }]
            })}
            placeholder={formatMessage({ id: 'Repeat.the.card.number' })}
            clear
          ></InputItem>
          <p className={styles.error}>{numbertwoError && isFieldTouched('numbertwo') ? numbertwoError.join(',') : ''}</p>
        </div>
        <div className={styles.bankPrompt}>
          <div>
            <i className="iconfont iconguanyux"></i>
          </div>
          <div>
            <p>
              1.
              {language === 'vi-VN' ? formatMessage({ id: 'prompt.Bank.listVND' }) : formatMessage({ id: 'prompt.Bank.list' })}
            </p>
            <p>
              2.
              {formatMessage({ id: 'prompt.Bank.card' })}
            </p>
            <p>
              3.
              {formatMessage({ id: 'not.be.separated.by.Spaces' })}
            </p>
          </div>
        </div>
        <Button
          className={styles.fromSubmit}
          type="primary"
          onClick={() => submit(props, bankName)}
          disabled={bankName && getFieldValueName && getFieldValueaddress && getFieldValuenumber && getFieldValuenumbertwo ? false : true}
        >
          {formatMessage({ id: 'common.save' })}
        </Button>
      </div>
    </div>
  );
}

export default createForm()(AddBank);
