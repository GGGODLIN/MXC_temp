import { useState, useEffect } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { getAssetBalance, setPoolLock } from '@/services/api';
import { cutFloatDecimal, numberToString } from '@/utils';
import { Toast, InputItem, WhiteSpace, Checkbox, Button } from 'antd-mobile';
import { createForm } from 'rc-form';

const AgreeItem = Checkbox.AgreeItem;

const LockInfo = ({ info, styles, form }) => {
  const [balance, setBalance] = useState(0);
  const [buyComfirm, setBuyComfirm] = useState(false);
  const [hasAddition, setHasAddition] = useState(false);
  const { getFieldProps, setFieldsValue, getFieldValue } = form;

  useEffect(() => {
    const getBalance = async () => {
      const res = await getAssetBalance({ currency: `${info.currency},${info.additionCurrency}` });
      const balances = res.balances[info.currency];

      if (res && res.code === 0 && balances) {
        setBalance(balances.available);

        if (!!info.additionCurrency) {
          setHasAddition(res.balances[info.additionCurrency].total >= info.additionHold);
        } else {
          setHasAddition(true);
        }
      }
    };
    getBalance();
  }, []);

  const numerChange = e => {
    const value = e;
    const maxValue = balance;

    if (/^(0|[1-9][0-9]*)(\.[0-9]{0,8})?$/.test(value.toString()) || value === '') {
      setFieldsValue({ lockNum: value < maxValue ? value : maxValue });
    }
  };

  const handelOk = () => {
    form.validateFields(async (error, value) => {
      if (!!info.additionCurrency && !hasAddition) return Toast.info(formatMessage({ id: 'pos.title.detail.MX_addition_tip' }));
      if (value.lockNum < info.limitMin || !value.lockNum) return Toast.info(formatMessage({ id: 'pos.title.detail.lock_tip_1' }));

      const res = await setPoolLock({
        poolId: info.id,
        amount: value.lockNum
      });

      if (res.code === 0) {
        Toast.info(formatMessage({ id: 'pos.title.detail.lock_tip_2' }), 1.5, () => {
          router.push('/pos/list');
        });
      }
    });
  };
  return (
    <>
      <div className={styles.optBox}>
        <div>
          <p>
            {formatMessage({ id: 'assets.balances.Useable' })} {numberToString(balance)} {info.currency}
          </p>
          <InputItem
            className="am-search-input"
            type="digit"
            extra={
              <a className={styles.all} onClick={() => setFieldsValue({ lockNum: balance })}>
                {formatMessage({ id: 'fin.common.all' })}
              </a>
            }
            {...getFieldProps('lockNum')}
            placeholder={formatMessage({ id: 'fin.title.input_lock_number' })}
            onChange={e => numerChange(e)}
            clear
          ></InputItem>
          <p className={styles.incomming}>
            {formatMessage({ id: 'pos.title.detail.prefit_mun' }, { day: info.minLockDays })}{' '}
            <b>
              {getFieldValue('lockNum')
                ? cutFloatDecimal(cutFloatDecimal(info.profitRate / 365, 8) * info.minLockDays * getFieldValue('lockNum'), 8)
                : '--'}{' '}
              {info.currency}
            </b>
          </p>
        </div>
        <WhiteSpace />
        <div className={styles.rules}>
          <p>
            {formatMessage(
              { id: 'pos.title.detail.MX_addition_1' },
              {
                additionHold: info.additionHold
              }
            )}
          </p>
          <p>
            {formatMessage(
              { id: 'pos.title.detail.MX_addition_2' },
              {
                additionHold: info.additionHold
              }
            )}
          </p>
          <p>
            {formatMessage(
              { id: 'pos.title.detail.MX_addition_3' },
              {
                min: info.limitMin,
                curreny: info.currency,
                minday: info.minLockDays
              }
            )}
          </p>
          <p>{formatMessage({ id: 'pos.title.detail.MX_addition_4' })}</p>
          <p>
            (5){' '}
            {info.autoUnlock === 'FALSE'
              ? formatMessage({ id: 'pos.title.detail.lock_rule_4' })
              : formatMessage({ id: 'pos.title.detail.MX_addition_5' })}
          </p>
          <p>
            {formatMessage(
              { id: 'pos.title.detail.MX_addition_6' },
              {
                unlockDays: info.unlockDays
              }
            )}
          </p>
          <p>{formatMessage({ id: 'pos.title.detail.MX_addition_7' })}</p>
        </div>
        <div className={styles.button}>
          <div>
            <AgreeItem data-seed="logId" checked={buyComfirm} onChange={() => setBuyComfirm(!buyComfirm)}>
              {formatMessage({ id: 'labs.title.bought_ask' })}{' '}
              <Link className={styles.link} to={'/info/risk'}>{`<<${formatMessage({ id: 'info.title.risk.title' })}>>`}</Link>
            </AgreeItem>
          </div>
          <Button type="primary" disabled={!buyComfirm || info.status === 'UN_LINE'} onClick={() => handelOk()}>
            {formatMessage({
              id: info.status === 'UN_LINE' ? 'pos.title.detail.off_line' : info.hasPool ? 'pos.title.list.toQuit' : 'labs.title.bought_now'
            })}
          </Button>
        </div>
      </div>
    </>
  );
};

export default createForm()(LockInfo);
