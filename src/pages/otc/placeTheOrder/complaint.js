import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './complaint.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Picker, List, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import { putOrderComplaintSelect, putOrderComplaint } from '@/services/api';
import { TextareaItem, Toast } from 'antd-mobile';
import router from 'umi/router';

function QuickTrading(props) {
  const { getFieldProps } = props.form;
  const [selectList, setSelectList] = useState([]);
  const [complaintActive, setComplaintActive] = useState([]);
  const [complaintVal, setComplaintVal] = useState('');
  const id = props.location.query.id;
  console.log(id);
  useEffect(() => {
    complaintSelect();
  }, []);
  let colorValue = 1;

  const complaintSelect = async () => {
    const res = await putOrderComplaintSelect();
    console.log('res', res);
    if (res.code === 0) {
      let dataList = [];
      res.data.forEach(element => {
        dataList.push({
          label: orderComplaint(element.name),
          value: element.name
        });
      });
      setSelectList(dataList);
    }
  };

  const userComplaint = async () => {
    let data = {
      complainReason: complaintVal,
      complainCategory: complaintActive[0],
      orderDealId: id
    };
    const res = await putOrderComplaint(data);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'otc.complaint.Success' }), 1);
      router.goBack();
    }
  };
  const orderComplaint = state => {
    let text = '';
    if (state === 'COMPLAIN_NO_RESPONSE') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_one' });
    } else if (state === 'COMPLAIN_PAID_BUT_CANCEL_TIMEOUT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_two' });
    } else if (state === 'COMPLAIN_UNRECEIVED_PAYMENT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_four' });
    } else {
      text = formatMessage({ id: 'mc_otc_trading_complaint_three' });
    }
    return text;
  };

  return (
    <div>
      <TopBar>{formatMessage({ id: 'otc.complaint.order' })}</TopBar>
      <div className={styles.complaintContent}>
        <div className={styles.title}>{formatMessage({ id: 'otc.complaint.Prompnt' })}</div>
        <div>
          <Picker
            data={selectList}
            value={complaintActive}
            onChange={v => {
              setComplaintActive(v);
            }}
            cols={1}
          >
            <List.Item arrow="horizontal">{formatMessage({ id: 'otc.complaint.type' })}</List.Item>
          </Picker>
        </div>
        <div>
          <List>
            <TextareaItem
              {...getFieldProps('count', {
                initialValue: ''
              })}
              rows={5}
              placeholder={formatMessage({ id: 'otc.complaint.placeVal' })}
              count={100}
              style={{ fontSize: '12px' }}
              value={complaintVal}
              onChange={e => {
                setComplaintVal(e);
              }}
            />
          </List>
        </div>
        <div className={styles.footerBtn}>
          <Button type="primary" onClick={() => userComplaint()}>
            {formatMessage({ id: 'common.sure' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(createForm()(QuickTrading));
