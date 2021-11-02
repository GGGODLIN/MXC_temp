import { useState, useEffect } from 'react';
import { createForm } from 'rc-form';
import { Button, InputItem, Icon, Picker } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { cloneDeep } from 'lodash';
import classNames from 'classnames';
import { getSubSite } from '@/utils';
import { assetTransfer } from '@/services/api';

import styles from './index.less';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const Form = ({ transferItem, form, submitCallback, transferData, setState, onCoinChange, amount, transferType }) => {
  const [visible, setVisible] = useState(false);
  const { getFieldProps, validateFields, getFieldError, isFieldTouched, setFieldsValue } = form;
  const coinData = transferData.map(item => ({ value: item.currency, label: item.currency }));
  const [currency, market] = transferItem.currency.split('/');

  useEffect(() => {
    validateFields();
  }, []);

  useEffect(() => {
    setFieldsValue({ amount });
  }, [amount]);

  const TransferExtra = e => {
    return (
      <div className={styles.extra}>
        <span className={styles.split}>| </span>
        <span className={styles.all} onClick={setAll}>
          {formatMessage({ id: 'fin.common.all' })}
        </span>
      </div>
    );
  };

  const checkAmountMax = (rule, value, callback) => {
    if (Number(value) > transferItem.pair.from.value) {
      callback(formatMessage({ id: 'assets.transfer.amount.max' }));
    }
    callback();
  };

  const submitHandle = () => {
    validateFields(async (error, values) => {
      if (!error) {
        const params = {
          from: transferItem.pair.from.key,
          to: transferItem.pair.to.key,
          amount: values.amount
        };

        if (params.from === 'MARGIN_V2' || params.to === 'MARGIN_V2') {
          params.currency = `${transferItem.pair.from.currency}@${transferItem.currency.replace('/', '_')}`;
        } else {
          params.currency = transferItem.currency;
        }

        const res = await assetTransfer(params);

        if (res.code === 0) {
          setTimeout(() => {
            setFieldsValue({ amount: '' });

            typeof submitCallback === 'function' && submitCallback(transferItem, 'submit');
          }, 200);
        }
      }
    });
  };

  const switchVisile = e => {
    setVisible(!visible);
  };

  const changeHandle = amount => {
    setState({ amount });
  };

  const changeCoinHandle = keys => {
    changeHandle('');

    typeof submitCallback === 'function' && onCoinChange(keys);
  };

  const setAll = e => {
    setFieldsValue({ amount: transferItem.pair.from.value });
    changeHandle(transferItem.pair.from.value);
  };

  const changeCurrency = curr => {
    const tempObj = cloneDeep(transferItem);
    const { from, to } = transferItem.pair;

    tempObj.pair.from.currency = curr;
    if (from.asset) {
      tempObj.pair.from.value = from.asset[curr];
    }

    tempObj.pair.to.currency = curr;
    if (to.asset) {
      tempObj.pair.to.value = to.asset[curr];
    }

    setState({ transferItem: tempObj });
  };

  const amountError = getFieldError('amount');

  return (
    <>
      <div className={styles.assets}>
        <div className={styles.coinBar}>
          <div>
            <span>{transferItem.currency}</span>
          </div>
          {transferData.length > 1 && (
            <div onClick={switchVisile}>
              <label htmlFor="">{formatMessage({ id: 'assets.selected.coin' })}</label>
              <Icon type="down" />
            </div>
          )}
        </div>
        {transferType === 'margin' && (
          <div className={styles.tabs}>
            <div
              className={classNames(styles.tab, transferItem.pair.from.currency === market && styles.active)}
              onClick={e => changeCurrency(market)}
            >
              {market}
            </div>
            <div
              className={classNames(styles.tab, transferItem.pair.from.currency === currency && styles.active)}
              onClick={e => changeCurrency(currency)}
            >
              {currency}
            </div>
          </div>
        )}
        <div className={styles.transfer}>
          <InputItem
            placeholder={formatMessage({ id: 'assets.transfer.placeholder' })}
            extra={<TransferExtra />}
            {...getFieldProps('amount', {
              initialValue: amount,
              onChange: changeHandle,
              rules: [
                { required: true, message: formatMessage({ id: 'assets.transfer.amount.requrie' }) },
                { pattern: /^\+?(?!0+(\.0{1,8}?)?$)\d+(\.\d{1,8}?)?$/, message: formatMessage({ id: 'assets.transfer.amount.reg' }) },
                { validator: checkAmountMax }
              ]
            })}
          />
          <p className={styles.error}>{amountError && isFieldTouched('amount') ? amountError.join(',') : ''}</p>
        </div>
      </div>
      <div className={styles.btnWrap}>
        <Button type="primary" onClick={submitHandle} disabled={amountError}>
          {formatMessage({ id: 'assets.transfer.right.now' })}
        </Button>
      </div>
      <Picker
        data={coinData}
        visible={visible}
        cols={1}
        onVisibleChange={switchVisile}
        onChange={changeCoinHandle}
        value={[transferItem.currency]}
      />
    </>
  );
};

export default createForm()(Form);
