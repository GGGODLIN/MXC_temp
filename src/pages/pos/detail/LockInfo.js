import { useState, useEffect } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getAssetBalance, setPoolLock } from '@/services/api';
import { cutFloatDecimal, numberToString } from '@/utils';
import { Toast, InputItem, WhiteSpace, Checkbox, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';
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
    let maxValue = info.memberRemain ? Math.min(balance, info.memberRemain) : balance;
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

  const allBalance = () => {
    let maxValue = balance;

    if (!!info.totalRemain) {
      maxValue = Math.min(info.totalRemain, balance);
    }
    if (!!info.limitMax) {
      maxValue = Math.min(maxValue, info.memberRemain);
    }
    setFieldsValue({ lockNum: cutFloatDecimal(maxValue, 8) });
  };
  return (
    <>
      <div className={styles.optBox}>
        <div>
          <p className={styles.headerPrompnt}>
            <div>
              {formatMessage({ id: 'assets.balances.Useable' })} {numberToString(balance)} {info.currency}
            </div>
            {info.totalRemain && (
              <div>
                {formatMessage({ id: 'pos.defi.remainingTitle' })} {info.totalRemain} {info.currency}
              </div>
            )}
          </p>
          <InputItem
            className="am-search-input"
            type="digit"
            extra={
              <a className={styles.all} onClick={() => allBalance()}>
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
              {getFieldValue('lockNum') && !!info.profitRate
                ? cutFloatDecimal(
                    cutFloatDecimal((info.additionProfitRate ? info.profitRate + info.additionProfitRate : info.profitRate) / 365, 8) *
                      info.minLockDays *
                      getFieldValue('lockNum'),
                    8
                  )
                : '--'}
              {info.profitCurrency}
            </b>
          </p>
          {/* <p className={styles.incomming}>
            {formatMessage({ id: 'pos.title.max_quantity' })}
            <b>{` ${!!info.limitMax ? info.memberRemain : formatMessage({ id: 'pos.title.list.unlimited' })}  ${info.currency}`}</b>
          </p> */}
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
        <div className={styles.rules}>
          <p style={{ color: 'var(--down-color)' }}>{formatMessage({ id: 'pos.title.detail.lock_rule' })}</p>
          {!!info.additionProfitRate ? (
            <ol>
              <li>
                {formatMessage(
                  { id: 'pos.title.detail.MX_addition_1' },
                  {
                    additionHold: info.additionHold
                  }
                )}
              </li>
              <li>
                {formatMessage(
                  { id: 'pos.title.detail.MX_addition_2' },
                  {
                    additionHold: info.additionHold
                  }
                )}
              </li>
              <li>
                {formatMessage(
                  { id: 'pos.title.detail.MX_addition_3' },
                  {
                    min: info.limitMin,
                    curreny: info.currency,
                    minday: info.minLockDays
                  }
                )}
              </li>
              <li>{formatMessage({ id: 'pos.title.detail.MX_addition_4' })}</li>
              <li>
                {info.autoUnlock === 'FALSE'
                  ? formatMessage({ id: 'pos.title.detail.lock_rule_4' })
                  : formatMessage({ id: 'pos.title.detail.MX_addition_5' })}
              </li>
              <li>
                {formatMessage({ id: 'pos.title.detail.lock_step3_1' }, { day: info.unlockDays })}
                {formatMessage({
                  id: info.grantCycle === 'EVERYDAY' ? 'pos.title.detail.lock_step3_3' : 'pos.title.detail.lock_step3_2'
                })}
              </li>
              <li>{formatMessage({ id: 'pos.title.detail.MX_addition_7' })}</li>
            </ol>
          ) : (
            <ol>
              <li>
                {formatMessage(
                  { id: 'pos.title.detail.lock_rule_1' },
                  {
                    min: info.limitMin,
                    curreny: info.currency,
                    minday: info.minLockDays
                  }
                )}
              </li>
              <li>
                {formatMessage(
                  { id: 'pos.title.detail.lock_rule_2' },
                  {
                    time: moment(
                      new Date().getTime() < info.interestTime ? info.interestTime : new Date().getTime() + 24 * 60 * 60 * 1000
                    ).format('YYYY-MM-DD')
                  }
                )}
              </li>
              <li>{formatMessage({ id: 'pos.title.detail.lock_rule_3' })}</li>
              <li>
                {info.autoUnlock === 'FALSE'
                  ? formatMessage({ id: 'pos.title.detail.lock_rule_4' })
                  : formatMessage({ id: 'pos.title.detail.MX_addition_5' })}
              </li>
              {info.currency !== 'MASS' && (
                <li>
                  {formatMessage({ id: 'pos.title.detail.lock_step3_1' }, { day: info.unlockDays })}
                  {formatMessage({
                    id: info.grantCycle === 'EVERYDAY' ? 'pos.title.detail.lock_step3_3' : 'pos.title.detail.lock_step3_2'
                  })}
                </li>
              )}
              {info.type === 'MARGIN' && <li>{formatMessage({ id: 'pos.title.detail.MX_addition_7' })}</li>}
            </ol>
          )}
          {/* <p>
            {formatMessage(
              { id: 'pos.title.detail.lock_rule_1' },
              {
                min: info.limitMin,
                curreny: info.currency,
                minday: info.minLockDays
              }
            )}
          </p>
          <p>
            {formatMessage(
              { id: 'pos.title.detail.lock_rule_2' },
              {
                time: moment(
                  new Date().getTime() < info.interestTime ? info.interestTime : new Date().getTime() + 24 * 60 * 60 * 1000
                ).format('YYYY-MM-DD')
              }
            )}
          </p>
          <p>{formatMessage({ id: 'pos.title.detail.lock_rule_3' })}</p>
          <p>
            {info.autoUnlock === 'FALSE'
              ? formatMessage({ id: 'pos.title.detail.lock_rule_4' })
              : formatMessage({ id: 'pos.title.detail.MX_addition_5' })}
          </p>
          {info.currency !== 'MASS' && (
            <p>
              (5) {formatMessage({ id: 'pos.title.detail.lock_step3_1' }, { day: info.unlockDays })}
              {formatMessage({
                id: info.grantCycle === 'EVERYDAY' ? 'pos.title.detail.lock_step3_3' : 'pos.title.detail.lock_step3_2'
              })}
            </p>
          )}
          {info.type === 'MARGIN' && <p>{formatMessage({ id: 'pos.title.detail.lock_rule_6' })}</p>} */}
        </div>
      </div>
    </>
  );
};

export default createForm()(LockInfo);
