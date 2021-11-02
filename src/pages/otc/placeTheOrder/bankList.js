import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './bankList.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { List, Toast, InputItem } from 'antd-mobile';
import certification from '@/assets/img/otc/certification.png';
import copy from '@/assets/img/otc/copy.png';
import Qrcode from '@/assets/img/otc/qrcode.png';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QrcodeModel from './qrcode';
const Item = List.Item;
const Brief = Item.Brief;
function compare(prop) {
  return function(obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop];
    return val1 - val2;
  };
}
function BankList(props) {
  const { orderInfo, paymentInfo, allPaymentList, otcuser } = props;
  const { getFieldProps, setFieldsValue, validateFields } = props.form;
  const [bankVisible, setBankVisible] = useState(true);
  const [imgQrcodeVisble, setImgQrcodeVisble] = useState('none');
  const [imgQrcode, setImgQrcode] = useState('');
  const [sortPaymentVal, setSortPaymentVal] = useState([]);

  const imgClick = qrcode => {
    setImgQrcode(qrcode);
    setImgQrcodeVisble('block');
  };
  const paymentList = val => {
    let text = '';
    switch (val) {
      case 1:
        text = (
          <>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.bankAccount' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.account}</span>
                <CopyToClipboard
                  text={`${paymentInfo.account}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'container.Where.it.is' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.bankName}</span>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.branch' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.bankAddress}</span>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.payee' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}</span>
                <CopyToClipboard
                  text={`${paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
          </>
        );
        break;
      case 2:
        text = (
          <>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.AlipayAccount' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.account}</span>
                <CopyToClipboard
                  text={`${paymentInfo.account}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.qrcode' })}</div>
              <div className={styles.listRight} onClick={() => imgClick(paymentInfo.qrCode)}>
                <img src={Qrcode} className={styles.copyImg} />
                <span className={styles.qrcodeName}>{formatMessage({ id: 'otc.order.qrcodeimg' })}</span>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.payee' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}</span>
                <CopyToClipboard
                  text={`${paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
          </>
        );
        break;
      case 3:
        text = (
          <>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.payment.wechat' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.account}</span>
                <CopyToClipboard
                  text={`${paymentInfo.account}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.qrcode' })}</div>
              <div className={styles.listRight} onClick={() => imgClick(paymentInfo.qrCode)}>
                <img src={Qrcode} className={styles.copyImg} />
                <span className={styles.qrcodeName}>{formatMessage({ id: 'otc.order.qrcodeimg' })}</span>
              </div>
            </div>
            <div className={styles.listContent}>
              <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.payee' })}</div>
              <div className={styles.listRight}>
                <span className={styles.merchantName}>{paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}</span>
                <CopyToClipboard
                  text={`${paymentInfo.payee ? paymentInfo.payee : orderInfo.merchantInfo.realName}`}
                  onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}
                >
                  <img src={copy} className={styles.copyImg} />
                </CopyToClipboard>
              </div>
            </div>
          </>
        );
        break;
      default:
        text = '';
    }
    return text;
  };
  useEffect(() => {
    if (allPaymentList.length > 0 && paymentInfo.payMethod) {
      let activePaymentInfo = allPaymentList.find(c => c.id === paymentInfo.payMethod);
      setSortPaymentVal(activePaymentInfo.config.sort(compare('sort')));
      let categoryVal = activePaymentInfo.config.find(item => item.category == 0);
      if (categoryVal) {
        setTimeout(() => {
          let keyname = categoryVal.key;
          setFieldsValue({ [keyname]: orderInfo?.merchantInfo[keyname] });
        }, 200);
      }

      if (paymentInfo.extend) {
        let obj = JSON.parse(paymentInfo.extend);
        Object.keys(obj).forEach(key => {
          setFieldsValue({ [key]: obj[key] });
        });
      }
    }
  }, [allPaymentList, paymentInfo]);
  useEffect(() => {
    if (paymentInfo.extend) {
      let obj = JSON.parse(paymentInfo.extend);
      Object.keys(obj).forEach(key => {
        setFieldsValue({ [key]: obj[key] });
      });
    }
  }, [paymentInfo, sortPaymentVal]);
  const paymentExtend = item => {
    let text = '';

    if (item.category == 0) {
      text = (
        <InputItem className={styles.merchantName} {...getFieldProps(item.key)} editable={false} placeholder={item.placeholder}></InputItem>
      );
    } else if (item.type === 0 && item.category !== 0) {
      text = (
        <div className={styles.listContent}>
          <div className={styles.listRight} onClick={() => imgClick(paymentInfo.qrCode)}>
            <img src={Qrcode} className={styles.copyImg} />
            <span className={styles.qrcodeName}>{formatMessage({ id: 'otc.order.qrcodeimg' })}</span>
          </div>
        </div>
      );
    } else if (item.category === 2) {
      text = <InputItem editable={false} {...getFieldProps(item.key)}></InputItem>;
    } else {
      text = <InputItem editable={false} {...getFieldProps(item.key)} value={paymentInfo[item.key]}></InputItem>;
    }
    return text;
  };

  const paymentInfoList = () => {
    return sortPaymentVal.map(item => {
      console.log(item);
      return (
        <>
          <div className={styles.listContent}>
            <div className={styles.listLeft}>{item.title}</div>
            <div className={styles.listRight}>{paymentExtend(item)}</div>
          </div>
        </>
      );
    });
  };

  return (
    <div>
      <div className={styles.listContent}>
        <div className={classNames([styles.listLeft, styles.listLeftName])}>{formatMessage({ id: 'container.Business.information' })}</div>
        <div className={styles.listRight}>
          <span className={styles.userColor}>{orderInfo.merchantInfo ? orderInfo.merchantInfo.nickName.charAt(0) : ''}</span>
          <span className={styles.merchantName}>{orderInfo.merchantInfo ? orderInfo.merchantInfo.nickName : ''}</span>
          <img src={certification} className={styles.merchantImg} />
        </div>
      </div>
      {paymentInfoList()}
      <div className={styles.listContent}>
        <div className={styles.listLeft}>{formatMessage({ id: 'otc.order.orderid' })}</div>
        <div className={styles.listRight}>
          <span className={classNames([styles.merchantName, styles.orderColor])}>{orderInfo.id}</span>

          <CopyToClipboard text={`${orderInfo.id}`} onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}>
            <img src={copy} className={styles.copyImg} />
          </CopyToClipboard>
        </div>
      </div>
      {/* <div className={styles.footerContent}>
        <p>{formatMessage({ id: 'ucenter.api.info.reminder' })}</p>
        <p>{formatMessage({ id: 'otc.orderPrompnt.one' })}</p>
        <p>{formatMessage({ id: 'otc.orderPrompnt.two' })}</p>
      </div> */}
      <div className={styles.footerHight}></div>
      <QrcodeModel imgQrcodeVisble={imgQrcodeVisble} setImgQrcodeVisble={setImgQrcodeVisble} imgQrcode={imgQrcode} />
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  allPaymentList: otc.allPaymentList,
  otcuser: otc.otcuser,
  user: auth.user
}))(createForm()(BankList));
