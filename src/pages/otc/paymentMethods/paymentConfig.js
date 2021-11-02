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
function compare(prop) {
  return function(obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop];
    return val1 - val2;
  };
}
function AddAilPayment(props) {
  const { user, otcuser, paymentConfig, dispatch, allPaymentList } = props;
  let { id, pid } = props.location.query;
  const { getFieldProps, setFieldsValue, validateFields } = props.form;
  const [sortPaymentVal, setSortPaymentVal] = useState([]);
  const [files, setFiles] = useState([]);
  const [account, setAccount] = useState('');
  const [imgfileId, setImgfileId] = useState('');

  useEffect(() => {
    if (paymentConfig.config) {
      setSortPaymentVal(paymentConfig.config.sort(compare('sort')));
      let categoryVal = paymentConfig.config.find(item => item.category == 0);
      if (categoryVal) {
        setTimeout(() => {
          let keyname = categoryVal.key;
          setFieldsValue({ [keyname]: otcuser[keyname] });
        }, 200);
      }
    }
  }, [paymentConfig, otcuser]);
  useEffect(() => {
    if (id && allPaymentList.length > 0) {
      let activePaymentInfo = allPaymentList.find(c => c.id == pid);
      setSortPaymentVal(activePaymentInfo.config.sort(compare('sort')));
      getPaymentInfo();
    }
  }, [id, pid, allPaymentList]);

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
      if (res.data.extend) {
        let obj = JSON.parse(res.data.extend);
        Object.keys(obj).forEach(key => {
          setFieldsValue({ [key]: obj[key] });
        });
      }
      Object.keys(res.data).forEach(key => {
        setFieldsValue({ [key]: res.data[key] });
      });
    }
  };

  const imgOnChange = (files, type, index, key) => {
    console.log(files);
    setFiles(files);
    let apirul = `${getSubSite('otc')}/api/payment/upload_qrCode`;
    const filedata = new FormData();
    filedata.append('file', files[0].file);
    filedata.append('payMethodId', paymentConfig.id);
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
          setFieldsValue({ [key]: data.data });
        });
      })
      .then(result => {});
  };
  const formInputMap = item => {
    let container = '';
    if (item.type === 1 || item.type === 2) {
      if (item.key === 'payee') {
        if (item.merchantField === true && otcuser.merchant === true && item.key === 'payee') {
          container = (
            <InputItem
              {...getFieldProps(item.key)}
              clear
              placeholder={item.placeholder}
              maxLength={item.length ? item.length : 20}
            ></InputItem>
          );
        } else {
          container = (
            <InputItem
              {...getFieldProps(item.key)}
              clear
              style={{ display: 'none' }}
              placeholder={item.placeholder}
              maxLength={item.length ? item.length : 20}
            ></InputItem>
          );
        }
      } else {
        container = (
          <InputItem
            {...getFieldProps(item.key)}
            clear
            className={styles.accountValbg}
            placeholder={item.placeholder}
            maxLength={item.length ? item.length : 20}
          ></InputItem>
        );
      }
    }
    if (item.category == 0) {
      container = (
        <InputItem {...getFieldProps(item.key)} clear placeholder={item.placeholder} maxLength={item.length ? item.length : 20}></InputItem>
      );
    }
    if (item.type === 0) {
      container = (
        <ImagePicker
          {...getFieldProps(item.key)}
          files={files}
          onChange={(files, type, index) => imgOnChange(files, type, index, item.key)}
          onImageClick={(index, fs) => console.log(index, fs)}
          selectable={files.length < 1}
        />
      );
    }
    return container;
  };
  const fromVisible = item => {
    let text = item.key === 'payee' ? (otcuser.merchant === true && item.merchantField === true ? 'block' : 'none') : 'block';
    return text;
  };
  const fromRequired = item => {
    let text = item.display === false ? false : item.required;
    return text;
  };
  const paymentList = () => {
    return sortPaymentVal.map(item => {
      return (
        <div className={styles.paymentContent} key={item.key}>
          <div style={{ display: fromVisible(item) }}>
            <span>{item.title}</span>
            <div className={styles.ListContent}>{formInputMap(item)}</div>
          </div>
        </div>
      );
    });
  };
  const addPaymentBtn = () => {
    validateFields(async (err, values) => {
      if (!err) {
        let objData = { payMethod: paymentConfig.id, id: id, realName: undefined };
        let categoryVal = paymentConfig.config.filter(item => item.category === 2);
        if (categoryVal) {
          let extendString = {};
          let dataKey = Object.keys(values).forEach(key => {
            categoryVal.forEach(item => {
              if (item.category === 2 && item.key === key) {
                dataKey = item.key;
                let name = values[key];
                delete values[dataKey];
                extendString[item.key] = name;
              }
            });
          });
          let dataString = JSON.stringify(extendString);
          objData = { ...values, ...objData, extend: dataString };
        }
        let requestWay = id ? 'PUT' : 'POST';
        const res = await putPaymentMethod(requestWay, objData);
        console.log(values);
        console.log(objData);
        console.log(res);
        if (res.code === 0) {
          id
            ? Toast.success(formatMessage({ id: 'ucenter.change_password.success' }), 1)
            : Toast.success(formatMessage({ id: 'Add.a.success' }), 1);
          router.goBack();
        }
      }
    });
  };
  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.order.setPayment' })}</TopBar>
      {paymentList()}
      <div className={styles.addBtn} onClick={() => addPaymentBtn()}>
        {id ? formatMessage({ id: 'otc.payment.alter' }) : formatMessage({ id: 'otc.payment.add' })}
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  paymentConfig: otc.paymentConfig,
  user: auth.user,
  allPaymentList: otc.allPaymentList,
  otcuser: otc.otcuser
}))(createForm()(AddAilPayment));
