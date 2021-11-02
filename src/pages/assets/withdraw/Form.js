import { useReducer, useEffect } from 'react';
import { Toast, InputItem, Button, Checkbox, Modal } from 'antd-mobile';
import { createForm } from 'rc-form';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal } from '@/utils';
import { doWithdraw, getWithdrawAddresses, checkAddress, checkAmount } from '@/services/api';
import SecureCheck from '@/components/SecureCheck';
import SuccessModal from './SuccessModal';
import classNames from 'classnames';
import styles from './Form.less';

const AgreeItem = Checkbox.AgreeItem;

const initialState = {
  memoCheck: false, //memo状态
  secureVisible: false, //三选二弹窗
  variableFee: '--', //手续费
  emailParams: {}, //三选二发送邮箱验证码参数
  smsParams: {}, //三选二发送手机验证码参数
  actualAmount: '--', //实际到账
  addrAllList: [],
  successModalVisible: false,
  withdrawId: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Form = ({ form, detail, chainItem = {}, dispatch, user, withdrawFormValues }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { getFieldProps, getFieldError, validateFields, setFields, getFieldsValue, getFieldValue } = form;

  useEffect(() => {
    const fetch = async () => {
      const res = await getWithdrawAddresses({ currency: detail.currency });
      if (res.code === 0) {
        const addrList = res.data;

        setState({ addrAllList: addrList });
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    checkFee();
  }, []);

  const submit = () => {
    validateFields((err, values) => {
      if (!err) {
        const { amount, memo, address } = values;
        const addressVal = memo ? `${address}:${memo}` : address;
        const payload = `${detail.currency}__${amount}__${addressVal}`;

        const emailParams = {
          email: user.account,
          type: 'ASSET_CASH',
          payload
        };
        const smsParams = {
          mobile: user.mobile,
          type: 'ASSET_CASH',
          country: user.country,
          payload
        };

        setState({ emailParams, smsParams, addressVal });
        checkAddressHandle();
      }
    });
  };

  const checkFee = () => {
    const { amount } = getFieldsValue();
    setState({ variableFee: chainItem.withdrawFee, actualAmount: getActualAmount(amount, chainItem.withdrawFee) });
  };

  const getActualAmount = (amount, fee) => {
    if (amount) {
      return cutFloatDecimal(amount - Number(fee), 6);
    } else {
      return '--';
    }
  };

  const cashAll = () => {
    const amount = detail.available;

    setFields({
      amount: {
        value: amount
      }
    });

    checkFee();
  };

  const onChangeAddres = address => {
    checkFee(address);
  };

  const switchMemo = e => {
    const { checked } = e.target;

    setState({ memoCheck: checked });

    if (checked) {
      setFields({
        memo: {
          value: ''
        }
      });
    } else {
      setFields({
        memo: {
          value: '',
          errors: [
            {
              message: formatMessage({ id: 'assets.title.address.ph_memo' })
            }
          ]
        }
      });
    }
  };

  const sendWithdraw = async data => {
    const { amount, remark } = getFieldsValue();

    const params = {
      amount,
      remark,
      address: state.addressVal,
      currency: detail.currency,
      chain: chainItem.chainName,
      smsCode: data.smsCode || undefined,
      emailCode: data.emailCode || undefined,
      google_auth_code: data.googleAuthCode || undefined
    };

    const res = await doWithdraw(params);

    if (res.code === 0) {
      switchSecureCheckModal();
      setState({ successModalVisible: true, withdrawId: res.data });
      Toast.success(formatMessage({ id: 'assets.cash.state.request.success' }));
    }
  };

  const switchSecureCheckModal = e => {
    setState({ visible: !state.visible });
  };

  const toAddress = e => {
    const formValues = getFieldsValue();

    dispatch({
      type: 'assets/save',
      payload: {
        withdrawFormValues: {
          ...formValues,
          variableFee: chainItem.variableFee,
          actualAmount: state.actualAmount
        }
      }
    });

    router.push(`/uassets/withdraw-address?currency=${detail.currency}&chain=${chainItem.currency}`);
  };

  const validCashFn = (rule, value, callback) => {
    if (!/^([1-9]\d{0,9}|0)([.]?|(\.\d{1,})?)$/.test(value)) {
      setState({ amount: '--', actualAmount: '--' });
      callback(formatMessage({ id: 'assets.withdraw.mount.reg' }));
    } else if (Number(value) > chainItem.maximumWithdraw) {
      setState({ amount: '--', actualAmount: '--' });
      callback(formatMessage({ id: 'assets.withdraw.mount.max' }, { max: chainItem.maximumWithdraw }));
    } else if (Number(value) < chainItem.minimumWithdraw) {
      setState({ amount: '--', actualAmount: '--' });
      callback(formatMessage({ id: 'assets.withdraw.mount.min' }, { min: chainItem.minimumWithdraw }));
    } else if (Number(value) < chainItem.withdrawFee) {
      setState({ amount: '--', actualAmount: '--' });
      callback(formatMessage({ id: 'assets.withdraw.mount.less.fee' }));
    } else if (Number(value) > detail.available) {
      setState({ amount: '--', actualAmount: '--' });
      callback(formatMessage({ id: 'assets.withdraw.mount.balance.max' }));
    } else {
      checkFee();
    }

    callback();
  };

  const checkAddressHandle = async e => {
    const { address, memo } = getFieldsValue();
    const params = {
      currency: chainItem.currency,
      address: memo ? `${address}:${memo}` : address,
      chain: chainItem.chainName
    };

    const res = await checkAddress(params);

    if (res.code === 0) {
      checkAmountHandle();
    }
  };

  const checkAmountHandle = async e => {
    const { memo, address, amount, remark } = getFieldsValue();
    const addressVal = memo ? `${address}:${memo}` : address;
    const params = {
      amount: amount,
      remark: remark,
      address: addressVal,
      chain: chainItem.chainName,
      currency: detail.currency
    };

    const res = await checkAmount(params);

    if (res.code === 0) {
      switchSecureCheckModal();
    } else {
      showWithdrawErrorMsg(res);
    }
  };

  const showWithdrawErrorMsg = ({ code, handledMsg }) => {
    const okText = code === 200001 || code === 200002 ? formatMessage({ id: 'otc.order.autonym' }) : formatMessage({ id: 'common.yes' });

    Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), handledMsg, [
      { text: formatMessage({ id: 'common.cancel' }), style: 'default' },
      {
        text: okText,
        onPress: () => {
          if (code === 200001 || code === 200002) {
            router.push('/ucenter/id-auth');
          }
        }
      }
    ]);
  };

  const amountError = getFieldError('amount');
  const addressError = getFieldError('address');
  const remarkError = getFieldError('remark');
  const memoError = getFieldError('memo');

  const successModalProps = {
    setState,
    withdrawId: state.withdrawId,
    coin: detail.currency,
    address: getFieldValue('address'),
    memo: getFieldValue('memo'),
    successModalVisible: state.successModalVisible,
    amount: getFieldValue('amount'),
    addrList: state.addrAllList
  };

  return (
    <>
      <div className={styles.wrap}>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('amount', {
              initialValue: withdrawFormValues.amount,
              rules: [{ validator: validCashFn }]
            })}
            placeholder={formatMessage({ id: 'assets.withdraw.amount.placeholder' })}
            extra={
              <span className={styles.extra} onClick={cashAll}>
                {formatMessage({ id: 'fin.common.all' })}
              </span>
            }
          ></InputItem>
          <div className={styles.fee}>
            <span>
              {formatMessage({ id: 'assets.balances.cash.fee' })}：{Number(chainItem.withdrawFee)}
            </span>
            <span>
              {formatMessage({ id: 'assets.balances.cash.amount' })}：{state.actualAmount}
            </span>
          </div>
          <p className={styles.error}>{amountError ? amountError.join(',') : ''}</p>
        </section>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('address', {
              initialValue: withdrawFormValues.address,
              onChange: val => onChangeAddres(val),
              rules: [{ required: true, message: formatMessage({ id: 'assets.balances.cash.requrie' }) }]
            })}
            placeholder={formatMessage({ id: 'assets.withdraw.address.placeholder' })}
            extra={<i className="iconfont icontianjiadizhi" onClick={toAddress}></i>}
          ></InputItem>
          <p className={styles.error}>{addressError ? addressError.join(',') : ''}</p>
        </section>
        <section className={styles.item}>
          <InputItem
            {...getFieldProps('remark', {
              initialValue: withdrawFormValues.remark,
              rules: [{ max: 200, message: formatMessage({ id: 'assets.withdraw.remark.max' }) }]
            })}
            placeholder={formatMessage({ id: 'assets.withdraw.remark.placeholder' })}
          ></InputItem>
          <p className={styles.error}>{remarkError ? remarkError.join(',') : ''}</p>
        </section>
        {chainItem.supportMemo && (
          <section className={classNames(styles.item, styles.memo)}>
            <InputItem
              {...getFieldProps('memo', {
                initialValue: withdrawFormValues.memo,
                rules: [{ required: !state.memoCheck, message: formatMessage({ id: 'assets.title.address.ph_memo' }) }]
              })}
              extra={<span>Memo</span>}
            ></InputItem>
            <p className={styles.error}>{memoError ? memoError.join(',') : ''}</p>
            <div className={styles.desc}>
              <i className="iconfont icontishi"></i>
              {formatMessage({ id: 'assets.withdraw.memo.tips' })}
            </div>
            <AgreeItem onChange={switchMemo} checked={state.memoCheck}>
              <div dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'assets.withdraw.no_memo.tips' }) }}></div>
            </AgreeItem>
          </section>
        )}
        {detail.currency === 'USDT' && <div className={styles.tips}>{formatMessage({ id: 'assets.withdraw.usdt_tips' })}</div>}
        <div className={styles.tips}>{formatMessage({ id: 'assets.withdraw.security.tips' })}</div>
        <Button type="primary" onClick={submit}>
          {formatMessage({ id: 'common.yes' })}
        </Button>
      </div>
      <SecureCheck
        title={formatMessage({ id: 'assets.secure.check.modal.title' })}
        showSecureCheckModal={state.visible}
        handleHideSecureCheckModal={switchSecureCheckModal}
        handleSubmitAfter={sendWithdraw}
        emailParams={state.emailParams}
        smsParams={state.smsParams}
      />
      {state.successModalVisible && <SuccessModal {...successModalProps} />}
    </>
  );
};

export default createForm()(Form);
