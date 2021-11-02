import { useState, useEffect } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getAssetBalance, setPoolLock } from '@/services/api';
import { cutFloatDecimal, numberToString } from '@/utils';
import { Toast, InputItem, WhiteSpace, Checkbox, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';
import styles from './index.less';
const AgreeItem = Checkbox.AgreeItem;
const language = getLocale();

const LockInfo = ({ info, styles, form }) => {
  const [balance, setBalance] = useState(0);
  const [buyComfirm, setBuyComfirm] = useState(false);
  const { getFieldProps, setFieldsValue, getFieldValue } = form;
  useEffect(() => {
    const getBalance = async () => {
      const res = await getAssetBalance({ currency: info.currency });
      if (res && res.code === 0 && res.balances[info.currency]) {
        setBalance(res.balances[info.currency].available);
      }
    };
    if (info) {
      getBalance();
    }
  }, [info]);

  const numerChange = e => {
    const value = e;
    if (/^(0|[1-9][0-9]*)(\.[0-9]{0,8})?$/.test(value.toString()) || value === '') {
      setFieldsValue({ lockNum: value < balance ? value : balance });
    }
  };

  const handelOk = () => {
    form.validateFields(async (error, value) => {
      if (value.lockNum < info.limitMin || !value.lockNum) return Toast.info(formatMessage({ id: 'pos.title.detail.lock_tip_1' }));
      const res = await setPoolLock({
        poolId: info.id,
        amount: value.lockNum
      });

      if (res.code === 0) {
        Toast.info(formatMessage({ id: 'pos.title.detail.lock_tip_2' }), 1.5, () => {
          router.push('/mx-defi/list');
        });
      }
    });
  };

  const allBalance = () => {
    let maxValue = balance;

    setFieldsValue({ lockNum: cutFloatDecimal(maxValue, 8) });
  };

  const dealText = () => {
    let _text = '';
    if (info) {
      _text = language.startsWith('zh') ? info.ruleDescription : info.ruleDescriptionEn || '';
      _text = _text ? _text.split('\n').map(i => <p>{i}</p>) : '';
    }
    return _text;
  };
  return (
    <div className={styles.bg}>
      <div className={styles.optBox}>
        <div className={styles.input}>
          <InputItem
            className="am-search-input"
            type="digit"
            placeholder={`${formatMessage({ id: 'finance.title.min_pawn' })} ${info.limitMin || ''} ${info.currency || ''}`}
            extra={
              <a className={styles.all} onClick={() => allBalance()}>
                {formatMessage({ id: 'fin.common.all' })}
              </a>
            }
            {...getFieldProps('lockNum')}
            onChange={e => numerChange(e)}
            clear
          ></InputItem>
          <p className={styles.incomming}>
            {formatMessage({ id: 'trade.spot.action.available' })}
            <b>{` ${numberToString(balance)} ${info.currency || ''}`}</b>
          </p>
        </div>
        <WhiteSpace />
        <div className={styles.rules}>
          <p>{formatMessage({ id: 'finance.title.pawn_rules' })}</p>
          {dealText()}
        </div>
        <div className={styles.button}>
          <Button
            type="primary"
            disabled={!getFieldValue('lockNum') || getFieldValue('lockNum') < info.limitMin}
            onClick={() => handelOk()}
          >
            {formatMessage({ id: 'finance.title.to_stake' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default createForm()(LockInfo);
