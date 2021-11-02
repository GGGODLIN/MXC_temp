import { useState, useEffect, useReducer } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { InputItem, Button, WhiteSpace, WingBlank, Modal, Picker, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import { formatMessage } from 'umi-plugin-locale';
import { newBorrowRecord, newMarginRepay } from '@/services/api';
import moment from 'moment';
import { cutFloatDecimal, numberToString, sub, add } from '@/utils';
import { throttle } from 'lodash';

import TopBar from '@/components/TopBar';
import styles from './index.less';
const initialState = {
  borrows: [],
  currency: '',
  number: '',
  borrowRecord: [],
  loading: false,
  borrowRecordNo: '',
  currentIntrst: '',
  marginDetail: {},
  amountErrors: []
};
function reducer(state, payload) {
  return { ...state, ...payload };
}

const Back = ({ form, Orders, location }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;
  const { symbol, recordNo } = location.query || {};

  const handleSubmit = () => {
    const number = getFieldValue('number');
    const { borrowRecordNo } = state;
    newMarginRepay({
      recordNo: numberToString(borrowRecordNo),
      quantity: numberToString(number),
      accountType: 'STEP',
      symbol: state.marginDetail.accountName.replace('/', '_'),
      repayType: number === add(state.marginDetail.remainAmount, state.marginDetail.remainInterest) ? 'REPAY_ALL' : 'REPAY_PARTIALLY'
    }).then(res => {
      if (res.code === 200) {
        getBorrow();
      }
    });
  };

  const getBorrow = async () => {
    const res = await newBorrowRecord({
      accountType: 'STEP',
      pageNum: 1,
      pageSize: 100,
      accountName: symbol,
      status: 'REPAID_PARTIALLY,WAIT_REPAY'
    });
    if (res.code === 200) {
      setState({
        borrows: res.data.resultList.map(i => {
          return {
            label: `${symbol} ${formatMessage({ id: 'margin.title.orderId' })}:${i.recordNo}`,
            value: i.recordNo
          };
        }),
        borrowRecord: res.data.resultList
      });
      if (recordNo) {
        setState({
          borrowRecordNo: recordNo
        });
      }
    }
  };

  useEffect(() => {
    const BorrowDetail = state.borrowRecord.find(i => i.recordNo === state.borrowRecordNo) || state.borrowRecord[0];
    if (BorrowDetail) {
      setState({
        marginDetail: { ...BorrowDetail }
      });
    } else {
      setState({
        marginDetail: {},
        borrowRecordNo: ''
      });
    }
  }, [state.borrowRecordNo]);

  const setAll = () => {
    if (!state.borrowRecordNo) {
      return Toast.error(formatMessage({ id: 'margin.title.pl_choose_order' }));
    }
    setFieldsValue({
      number: add(state.marginDetail.remainInterest, state.marginDetail.remainAmount)
    });
  };

  useEffect(() => {
    getBorrow();
  }, []);

  useEffect(() => {
    const order = getFieldValue('order') || [];
    if (order) {
      setState({
        borrowRecordNo: order[0]
      });
    }
  }, [getFieldValue('order')]);

  return (
    <>
      <TopBar
        extra={
          <span className={styles.order} onClick={() => router.push('/margin/borrow-orders?type=back')}>
            {formatMessage({ id: 'margin.title.record.back' })}
          </span>
        }
      >
        {formatMessage({ id: 'margin.title.toBack' })}
      </TopBar>
      <WingBlank>
        <div className={styles.loanBox}>
          <div>
            <h3>{formatMessage({ id: 'margin.title.step_account' })}</h3>
            <WhiteSpace />
            {getFieldDecorator('order', {
              rules: [{ required: true }]
            })(
              <Picker data={state.borrows} cols={1}>
                <div className={styles.selectItem}>
                  <span className={styles.orderId}>{state.borrowRecordNo || formatMessage({ id: 'margin.title.no_data' })}</span>
                  <b>
                    {formatMessage({ id: 'margin.title.pl_choose_order' })} <i className="iconfont icondrop"></i>
                  </b>
                </div>
              </Picker>
            )}
            <WhiteSpace />
            {state.marginDetail.recordNo && (
              <div className={styles.itemInfo}>
                <div className={styles.loanInfo}>
                  <p>
                    <b>{formatMessage({ id: 'margin.title.loan_time' })}</b>
                    <span>{moment(state.marginDetail.createTime).format('YYYY.MM.DD HH:mm:ss')}</span>
                  </p>
                  <p>
                    <b>{formatMessage({ id: 'margin.title.loan_number' })}</b>
                    <span>
                      {numberToString(state.marginDetail.borrowAmount)} {state.marginDetail.currency}
                    </span>
                  </p>
                </div>
                <p>
                  <b>{formatMessage({ id: 'margin.title.remain_num' })}</b>
                  <span>
                    {' '}
                    {numberToString(state.marginDetail.remainAmount)} {state.marginDetail.currency}
                  </span>
                </p>
                <p>
                  <b>{formatMessage({ id: 'margin.title.remain_intrst' })}</b>
                  <span>
                    {numberToString(state.marginDetail.remainInterest)} {state.marginDetail.currency}
                  </span>
                </p>
              </div>
            )}
            <WhiteSpace />
            {getFieldDecorator('number', {
              rules: [{ required: true }]
            })(
              <InputItem
                placeholder={formatMessage({ id: 'margin.title.back_number' })}
                extra={
                  <span onClick={setAll} className={styles.selectAll}>
                    {formatMessage({ id: 'fin.common.all' })}
                  </span>
                }
              />
            )}
            <WhiteSpace />
            <div className={`${styles.itemInfo} ${styles.backDeatil}`}>
              <div className={styles.inputInfo}>
                <p>
                  <b>{formatMessage({ id: 'assets.margin.capital.title' })}</b>
                  <span>
                    {getFieldValue('number') - state.marginDetail.remainInterest >= 0
                      ? numberToString(sub(getFieldValue('number'), state.marginDetail.remainInterest))
                      : 0}{' '}
                    {state.marginDetail.currency}
                  </span>
                </p>
                <p>
                  <b>{formatMessage({ id: 'margin.title.intrst' })}</b>
                  <span>
                    {getFieldValue('number') - state.marginDetail.remainInterest >= 0
                      ? state.marginDetail.remainInterest
                      : getFieldValue('number') || 0}{' '}
                    {state.marginDetail.currency}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <Button type="primary" disabled={!getFieldValue('number')} onClick={handleSubmit}>
            {formatMessage({ id: 'margin.title.toBack' })}
          </Button>
        </div>
      </WingBlank>
    </>
  );
};

export default connect(({ auth, margin }) => ({
  user: auth.user,
  safety: margin.safety
}))(createForm()(Back));
