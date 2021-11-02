import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './addAilPayment.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { List, InputItem, ImagePicker, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import { putPaymentMethod, putPayInfo } from '@/services/api';
import { getSubSite, getCookie } from '@/utils';
import router from 'umi/router';
const Item = List.Item;
const Brief = Item.Brief;
function AddAilPayment(props) {
  const { user, otcuser } = props;
  console.log(props);
  let { id } = props.location.query;
  const { getFieldProps } = props.form;
  const [files, setFiles] = useState([]);
  const [account, setAccount] = useState('');
  const [imgfileId, setImgfileId] = useState('');
  console.log(id);
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
      let url = `${getSubSite('main')}/api/file/download/${res.data.qrCode}`;
      let data = [];
      data.push({
        url: url
      });
      console.log(data);
      setFiles(data);
    }
  };
  const imgOnChange = (files, type, index) => {
    console.log(files);
    setFiles(files);
    let apirul = `${getSubSite('otc')}/api/payment/upload_qrCode`;
    const filedata = new FormData();
    filedata.append('file', files[0].file);
    filedata.append('payMethodId', 2);
    let request = new Request(apirul, {
      method: 'POST',
      credentials: 'include',
      body: filedata
    });
    fetch(request)
      .then(response => {
        response.json().then(async data => {
          console.log('上传成功');
          console.log(data);
          setImgfileId(data);
        });
      })
      .then(result => {});
  };
  const addPaymentBtn = async () => {
    let params = {
      id: id,
      payMethod: 2,
      bankName: otcuser.realName,
      account: account,
      bankAddress: '',
      payee: '',
      qrCode: imgfileId
    };
    let requestWay = id ? 'PUT' : 'POST';
    const res = await putPaymentMethod(requestWay, params);
    console.log(res);
    if (res.code === 0) {
      id
        ? Toast.success(formatMessage({ id: 'ucenter.change_password.success' }), 1)
        : Toast.success(formatMessage({ id: 'Add.a.success' }), 1);
      router.goBack();
    }
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.order.addAilipay' })}</TopBar>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'ucenter.kyc.name' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('bankName')}
            value={otcuser.realName}
            disabled
            clear
            placeholder={formatMessage({ id: 'ucenter.kyc.name.require' })}
          ></InputItem>
        </div>
      </div>

      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'otcfiat.order.account' })}</span>
        <div className={styles.ListContent}>
          <InputItem
            {...getFieldProps('account')}
            value={account}
            onChange={e => {
              setAccount(e);
            }}
            clear
            placeholder={formatMessage({ id: 'otc.order.PleaseVal' })}
          ></InputItem>
        </div>
      </div>
      <div className={styles.paymentContent}>
        <span>{formatMessage({ id: 'otc.payment.qrcode' })}</span>
        <div className={styles.ListContent}>
          <ImagePicker
            files={files}
            onChange={imgOnChange}
            onImageClick={(index, fs) => console.log(index, fs)}
            selectable={files.length < 1}
          />
        </div>
      </div>
      <div className={styles.addBtn} onClick={() => addPaymentBtn()}>
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
