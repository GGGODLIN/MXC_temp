import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { Button, InputItem, Toast, Picker, List } from 'antd-mobile';
import router from 'umi/router';
import { addWithdrawAddress, getNewAssetDetail } from '@/services/api';
import SecureCheck from '@/components/SecureCheck';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import styles from './index.less';

const initialState = {
  countrySelectOpen: false,
  emailParams: {},
  smsParams: {},
  assetItem: {},
  chains: [],
  chain: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const WithdrawAddressNew = ({ form, location }) => {
  const { currency } = location.query;
  const _chain = location.query.chain;
  const [state, setState] = useReducer(reducer, initialState);
  const { assetItem, chains, chain } = state;
  const { getFieldProps, validateFields, getFieldsValue, getFieldError, isFieldTouched } = form;

  useEffect(() => {
    validateFields();
    getAssetInfo();
  }, []);

  const getAssetInfo = async e => {
    const res = await getNewAssetDetail(currency);

    if (res.code === 200) {
      const chains = res.data.chains.map(el => ({ value: el.chainName, label: el.chainName }));

      setState({
        assetItem: res.data,
        chains
      });

      if (_chain) {
        const _chainEl = res.data.chains.find(el => el.currency === _chain);

        setState({
          chain: [_chainEl.chainName]
        });
      } else {
        setState({
          chain: [chains[0].value]
        });
      }
    }
  };

  const switchSecureCheckModal = e => {
    setState({ visible: !state.visible });
  };

  const sendAddress = async data => {
    const values = getFieldsValue();
    const { address, memo, chain } = values;

    const params = {
      ...values,
      currency,
      chain: chain[0],
      address: memo ? `${address}:${memo}` : address,
      smsCode: data.smsCode || undefined,
      emailCode: data.emailCode || undefined,
      google_auth_code: data.googleAuthCode || undefined
    };

    const res = await addWithdrawAddress(params);

    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'assets.msg.address.add_success' }));
      router.push(`/uassets/withdraw-address?currency=${assetItem.currency}`);
    }
  };

  const submit = e => {
    validateFields(async (err, values) => {
      if (!err) {
        const emailParams = {
          type: 'WITHDRAW_ADDRESS_CHANGE'
        };
        const smsParams = {
          type: 'WITHDRAW_ADDRESS_CHANGE'
        };

        setState({ emailParams, smsParams });
        switchSecureCheckModal();
      }
    });
  };

  const addressError = getFieldError('address');
  const remarkError = getFieldError('remark');
  const memoError = getFieldError('memo');

  return (
    <>
      <TopBar>{formatMessage({ id: 'assets.add.address.title' }, { coin: assetItem.currency })}</TopBar>
      <div className={styles.wrap}>
        <div className={styles.item}>
          <Picker
            data={chains}
            cols={1}
            {...getFieldProps('chain', {
              initialValue: chain
            })}
          >
            <List.Item>{formatMessage({ id: 'mc_withdraw_address_chain' })}</List.Item>
          </Picker>
        </div>
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('address', {
              rules: [{ required: true, message: formatMessage({ id: 'assets.msg.address.address_require' }) }]
            })}
            placeholder={formatMessage({ id: 'assets.msg.address.address_require' })}
          ></InputItem>
          <p className={styles.error}>{addressError && isFieldTouched('code') ? addressError.join(',') : ''}</p>
        </div>
        <div className={styles.item}>
          <InputItem
            {...getFieldProps('remark', {
              rules: [{ required: true, message: formatMessage({ id: 'assets.msg.address.address_tag_require' }) }]
            })}
            placeholder={formatMessage({ id: 'assets.msg.address.address_tag_require' })}
          ></InputItem>
          <p className={styles.error}>{remarkError && isFieldTouched('remark') ? remarkError.join(',') : ''}</p>
        </div>
        {assetItem.supportMemo && (
          <div className={styles.item}>
            <InputItem
              {...getFieldProps('memo', {
                // rules: [{ required: true, message: formatMessage({ id: 'assets.title.address.ph_memo' }) }]
              })}
              placeholder={formatMessage({ id: 'assets.title.address.ph_memo' })}
            ></InputItem>
            <p className={styles.error}>{memoError && isFieldTouched('memo') ? memoError.join(',') : ''}</p>
          </div>
        )}
        <div className={styles.item}>
          {assetItem.supportMemo ? (
            <Button type="primary" disabled={addressError || remarkError || memoError} onClick={submit}>
              {formatMessage({ id: 'common.save' })}
            </Button>
          ) : (
            <Button type="primary" disabled={addressError || remarkError} onClick={submit}>
              {formatMessage({ id: 'common.save' })}
            </Button>
          )}
        </div>
      </div>
      <SecureCheck
        title={formatMessage({ id: 'securecheck' })}
        showSecureCheckModal={state.visible}
        handleHideSecureCheckModal={switchSecureCheckModal}
        handleSubmitAfter={sendAddress}
        emailParams={state.emailParams}
        smsParams={state.smsParams}
      />
    </>
  );
};

export default connect(({ assets, auth }) => ({
  list: assets.list,
  user: auth.user
}))(createForm()(WithdrawAddressNew));
