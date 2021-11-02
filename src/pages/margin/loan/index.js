import { useState, useEffect, useReducer } from 'react';
import router from 'umi/router';
import { InputItem, Button, WhiteSpace, WingBlank, Modal, Picker, Toast } from 'antd-mobile';
import { newmarginAvlBorrow, newMarginBorrow, newMarginStepLevel, newMarginCoinList } from '@/services/api';
import { createForm } from 'rc-form';
import { formatMessage } from 'umi-plugin-locale';
import { cutFloatDecimal, numberToString } from '@/utils';
import Link from 'umi/link';

import TopBar from '@/components/TopBar';
import styles from './index.less';

const initialState = {
  borrows: [],
  currency: 'USDT',
  number: '',
  borrowDetail: [],
  loading: false,
  amountErrors: [],
  unit: 0,
  level: 0,
  tipModal: false,
  tipType: '',
  enableGradually: 0
};

function reducer(state, payload) {
  return { ...state, ...payload };
}
const Loan = ({ form, location }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;
  const { symbol } = location.query;
  const [currency, market] = symbol.split('_');
  const borrowDetail = state.borrowDetail[state.currency] || {};

  useEffect(() => {
    setState({
      number: '',
      borrowDetail: {},
      loading: false,
      unit: 0,
      level: 0,
      enableGradually: 0
    });
    getBorrowDetail();
    getStepLevel();
    getMarginConfig();
  }, []);

  const selectCurrency = currency => {
    setState({
      currency
    });
  };
  const getStepLevel = async () => {
    const res = await newMarginStepLevel({ symbol: `${currency}_${market}` });

    if (res.code === 200) {
      const { level } = res.data;
      setState({
        level
      });
    }
  };

  const getMarginConfig = async () => {
    const res = await newMarginCoinList({ symbol: `${currency}_${market}` });
    if (res.code === 200) {
      const { enableGradually } = res.data[0];
      setState({
        enableGradually
      });
    }
  };

  const getBorrowDetail = async () => {
    const res = await newmarginAvlBorrow(symbol);
    if (res.code === 200) {
      const _currency = res.data.find(i => i.currency === currency);
      const _market = res.data.find(i => i.currency === market);
      setState({
        borrowDetail: {
          [currency]: _currency,
          [market]: _market
        }
      });
      setFieldsValue({
        number: null
      });
    }
  };

  const handleSubmit = () => {
    setState({ loading: true });

    validateFields((errors, value) => {
      if (!errors) {
        const number = getFieldValue('number');
        const { avlBorrow } = borrowDetail;
        const isAll = number === cutFloatDecimal(avlBorrow, state.unit) ? 1 : 0;

        newMarginBorrow({
          currency: state.currency,
          quantity: number,
          accountType: 'STEP',
          symbol: symbol,
          isBorrowAll: isAll
        }).then(res => {
          setState({ loading: false });
          if (res.code === 200) {
            getBorrowDetail();
          }
        });
      }
    });
  };

  const selectAll = () => {
    setFieldsValue({
      number: cutFloatDecimal(borrowDetail.avlBorrow, state.unit)
    });
  };

  useEffect(() => {
    const unit = state.unit;
    const reg = new RegExp(`^(0|[1-9][0-9]*)(\.[0-9]{0,${unit || 1}})?$`);
    const value = getFieldValue('number');
    if (reg.test(value) || value === '') {
      setFieldsValue({
        number: value
      });
    } else if (Number(value) > borrowDetail.avlBorrow) {
      setFieldsValue({ number: cutFloatDecimal(borrowDetail.avlBorrow, state.unit) });
    }
  }, [getFieldValue('number')]);

  return (
    <>
      <TopBar
        extra={
          <span className={styles.order} onClick={() => router.push('/margin/borrow-orders?type=loan')}>
            {formatMessage({ id: 'margin.title.record.loan' })}
          </span>
        }
      >
        {formatMessage({ id: 'margin.title.toLoan' })}
      </TopBar>
      <WingBlank>
        <div className={styles.loanBox}>
          <div>
            <WhiteSpace />
            <div className={styles.coinSelect}>
              <div className={market === state.currency ? styles.active : ''} onClick={() => selectCurrency(market)}>
                <b>{market}</b> <span>{formatMessage({ id: 'margin.title.to_long' })}</span>
              </div>
              <div className={currency === state.currency ? styles.active : ''} onClick={() => selectCurrency(currency)}>
                <b>{currency}</b> <span>{formatMessage({ id: 'margin.title.to_short' })}</span>
              </div>
            </div>
            <WhiteSpace />
            <div className={styles.itemInfo}>
              <p>
                <b>{formatMessage({ id: 'margin.title.trade.min_loan' })}</b>
                <span>
                  {borrowDetail.minBorrow} {state.currency}
                </span>
              </p>
              <p>
                <b>
                  {formatMessage({ id: 'margin.title.can_loan' })}{' '}
                  <i onClick={() => setState({ tipModal: true, tipType: 'canLoan' })} className="iconfont icontishi"></i>
                </b>
                <span>
                  ≈ {cutFloatDecimal(borrowDetail.avlBorrow ? numberToString(borrowDetail.avlBorrow) : 0, state.unit)} {state.currency}
                </span>
              </p>
              <p>
                <b>
                  {formatMessage({ id: 'margin.title.daily_ratio' })}{' '}
                  <i onClick={() => setState({ tipModal: true, tipType: 'IntrstRate' })} className="iconfont icontishi"></i>
                </b>
                <span>{cutFloatDecimal(borrowDetail.hourInterest * 100, 4)}%</span>
              </p>
            </div>
            <WhiteSpace />
            {state.enableGradually === 1 && Number(state.level) !== 0 && (
              <div className={styles.marginStep}>
                {formatMessage({ id: 'mc_margin_current_level' }, { level: state.level })}，
                <Link to={`/info/margin-step?symbol=${currency}_${market}`}>{formatMessage({ id: 'mc_margin_level_link' })}</Link>
              </div>
            )}
            <WhiteSpace />
            {getFieldDecorator('number', {
              rules: [{ required: true, message: formatMessage({ id: 'assets.transfer.amount.requrie' }) }]
            })(
              <InputItem
                extra={
                  <span onClick={selectAll} className={styles.selectAll}>
                    {formatMessage({ id: 'fin.common.all' })}
                  </span>
                }
                placeholder={formatMessage({ id: 'margin.title.loan_number' })}
              />
            )}
            <WhiteSpace />
          </div>
          <Button type="primary" onClick={handleSubmit}>
            {formatMessage({ id: 'margin.title.toLoan' })}
          </Button>
        </div>
      </WingBlank>
      <Modal
        visible={state.tipModal}
        transparent
        onClose={() => setState({ tipModal: false })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setState({ tipModal: false }) }]}
      >
        <div className={styles.tipText}>
          {state.tipType === 'IntrstRate'
            ? formatMessage({ id: 'margin.title.loan_tip2' })
            : formatMessage({ id: 'margin.title.loan_tip' })}
        </div>
      </Modal>
    </>
  );
};

export default createForm()(Loan);
