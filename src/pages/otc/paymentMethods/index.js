import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { SwipeAction, List, Modal, Checkbox, Toast } from 'antd-mobile';
import { getMethodOfPayment, putPaySwitch, getPayList } from '@/services/api';
import PaymentConfig from './paymentConfig';
import router from 'umi/router';
import otc from '../../../models/otc';
import { getSubSite } from '@/utils';
const language = getLocale();
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
const Item = List.Item;
function PaymentMethods(props) {
  const { user, dispatch, allPaymentList } = props;
  const [methodOfPaymentList, setMethodOfPaymentList] = useState([]);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [supportPaymentList, setSupportPaymentList] = useState([]);
  useEffect(() => {
    getPayment();
    supportPayment();
    allBankList();
  }, []);

  const getPayment = async () => {
    const res = await getMethodOfPayment();
    if (res.code === 0) {
      setMethodOfPaymentList(res.data);
    }
  };
  const allBankList = async () => {
    const res = await getPayList();
    if (res.code === 0) {
      sessionStorage.setItem('mxc_allPayment', JSON.stringify(res.data));
      console.log(sessionStorage.getItem('mxc_allPayment'));
      dispatch({
        type: 'otc/changeAllPaymentList',
        payload: res.data
      });
    }
  };
  const paymentOpenSwitch = async (type, id, state) => {
    let stateType = '';
    if (state === 1) {
      stateType = 'DISABLE';
    } else {
      stateType = 'ENABLE';
    }
    let params = {
      id: id,
      state: stateType
    };
    const res = await putPaySwitch(params);
    if (res.code === 0) {
      getPayment();

      Toast.success(formatMessage({ id: 'ucenter.change_password.success' }), 1);
    }
  };
  const fiatPaymentType = pay => {
    let iconUrl = '';
    console.log(allPaymentList);
    let payIcon = allPaymentList.find(item => item.id == pay);
    if (payIcon) {
      iconUrl = (
        <>
          <img className={styles.paymentImg} src={`${getSubSite('main')}/api/file/download/${payIcon.icon}`} />
        </>
      );
    }
    return iconUrl;
  };
  const delectPayment = async id => {
    var params = new FormData();
    params.append('id', id);
    const res = await getMethodOfPayment('DELETE', params);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'ucenter.api.delete.success' }), 1);
      getPayment();
    }
  };
  const supportPayment = async () => {
    const res = await getPayList();
    if (res.code === 0) {
      setSupportPaymentList(res.data || []);
    }
  };
  const paymentListClick = info => {
    dispatch({
      type: 'otc/getPaymentConfig',
      payload: info
    });

    sessionStorage.setItem('mxc_payment', JSON.stringify(info));
    if (user.authLevel < 2) {
      Toast.info(formatMessage({ id: 'ucenter.setting.banks.tip' }), 2);
      router.push('/ucenter/id-auth');
    } else {
      router.push('/otc/addAilPayment');
    }
  };
  const amendPayment = item => {
    router.push(`/otc/paymentConfig?id=${item.id}&pid=${item.payMethod}`);
  };
  const PaymentList = () => {
    return supportPaymentList.map(item => {
      return (
        <List key={item.id} extra="" onClick={e => paymentListClick(item)}>
          <Item arrow="horizontal">
            <span className={styles.ListContentName}>{language.startsWith('zh') ? item.nameCn : item.nameEn}</span>
            {item.nameEn === 'Bank Account' ? (
              <>
                <div className={styles.triangle}></div>
                <span className={styles.recommended}>{formatMessage({ id: 'otc.order.recommend' })}</span>
              </>
            ) : (
              ''
            )}
          </Item>
        </List>
      );
    });
  };
  const paymentList = () => {
    return methodOfPaymentList.map(item => {
      return (
        <div className={styles.silderContent} key={item.id}>
          <SwipeAction
            autoClose
            right={[
              {
                text: formatMessage({ id: 'otc.order.lter' }),
                onPress: () => amendPayment(item),
                style: { backgroundColor: '#3A414D', color: 'white' }
              },
              {
                text: formatMessage({ id: 'ucenter.api.delete' }),
                onPress: () => {
                  delectPayment(item.id);
                  console.log('delete');
                },
                style: { backgroundColor: '#DF384E', color: 'white' }
              }
            ]}
            onOpen={() => console.log('global open')}
            onClose={() => console.log('global close')}
          >
            <div className={styles.paymentList}>
              <div className={styles.paymentTitle}>
                <div className={styles.paymentBank}>
                  <span>{fiatPaymentType(item.payMethod)}</span>
                  <span className={styles.paymentListName}>{item.bankName}</span>
                </div>
                <div className={styles.paymentType}>
                  <AgreeItem
                    data-seed="logId"
                    checked={item.state == 1 ? true : false}
                    onChange={e => {
                      paymentOpenSwitch(e.target.checked, item.id, item.state);
                      console.log('checkbox', e);
                      console.log('checkbox', e.target.checked);
                    }}
                    className={styles.paymentCheckout}
                  >
                    {item.state == 1 ? (
                      <span className={styles.activate}>{formatMessage({ id: 'otc.order.activated' })}</span>
                    ) : (
                      <span className={styles.noactivate}>{formatMessage({ id: 'otc.order.noactivated' })}</span>
                    )}
                  </AgreeItem>
                </div>
              </div>
              <div className={styles.paymentUserName}>{item.payee}</div>
              <div className={styles.paymentName}>{item.account}</div>
            </div>
          </SwipeAction>
        </div>
      );
    });
  };

  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.order.setPayment' })}</TopBar>
      <div className={styles.paymentContent}>{paymentList()}</div>
      <div className={styles.footerAddBtn} onClick={() => setModal3Visible(true)}>
        {formatMessage({ id: 'otc.order.addPayment' })}
      </div>
      <Modal popup animationType="slide-up" visible={modal3Visible} onClose={() => setModal3Visible(false)}>
        <div className={styles.modelContent}>
          <div className={styles.paymentModelTitle}>{formatMessage({ id: 'otc.order.selectPayment' })}</div>
          <div className={styles.paymentBankContent}>{PaymentList()}</div>
        </div>
      </Modal>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  allPaymentList: otc.allPaymentList,
  user: auth.user
}))(PaymentMethods);
