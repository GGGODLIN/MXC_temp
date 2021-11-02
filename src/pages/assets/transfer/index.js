import { useReducer, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';
import { Picker, Icon } from 'antd-mobile';

import Otc from './Otc';
import Margin from './Margin';
import Contract from './Contract';

import classNames from 'classnames';

import styles from './index.less';

const nameMaps = {
  otc: formatMessage({ id: 'assets.fiat_account' }),
  contract: formatMessage({ id: 'assets.swap_account' }),
  margin: formatMessage({ id: 'margin.title.account' })
};

const initialState = {
  accountVisible: false,
  transferType: '',
  defaultCurrency: '',
  amount: '',
  transferItem: {
    pair: {
      from: {},
      to: {}
    }
  },
  transferData: [],
  accountData: [
    { value: 'otc', label: nameMaps['otc'] },
    { value: 'contract', label: nameMaps['contract'] }
  ]
  //accountData: [{ value: 'otc', label: nameMaps['otc'] }, { value: 'contract', label: nameMaps['contract'] }]
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const getInitialTransferItem = type => {
  return {
    currency: '',
    id: 0,
    pair: {
      from: {
        key: 'MAIN',
        name: formatMessage({ id: 'assets.exchange_account' }),
        value: '',
        currency: '',
        balancesNode: ''
      },
      to: {
        key: '',
        name: nameMaps[type],
        value: '',
        currency: '',
        balancesNode: ''
      }
    }
  };
};

const Transfer = ({ location, isOpenMarginV2 }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { accountVisible, transferItem, transferData, transferType, defaultCurrency, amount, accountData } = state;

  useEffect(() => {
    const { type = 'otc', currency = 'USDT' } = location.query;
    const transferItem = getInitialTransferItem(type);

    setState({ transferItem, transferType: type, defaultCurrency: currency });
  }, []);

  useEffect(() => {
    if (isOpenMarginV2) {
      setState({ accountData: [...accountData, { value: 'margin', label: nameMaps['margin'] }] });
    }
  }, [isOpenMarginV2]);

  const changeAcct = e => {
    const { pair } = transferItem;

    const item = {
      ...transferItem,
      pair: {
        from: {
          ...pair.to
        },
        to: {
          ...pair.from
        }
      }
    };

    setState({
      transferItem: item,
      amount: ''
    });
  };

  const switchAccountVisible = e => {
    setState({
      accountVisible: !accountVisible
    });
  };

  const changeHandle = keys => {
    setState({
      transferType: keys[0]
    });
  };

  const accountProps = {
    amount,
    setState,
    transferItem,
    transferData,
    transferType,
    defaultCurrency
  };

  return (
    <>
      <TopBar
        extra={
          <span onClick={() => router.push(`/uassets/transfer-record?type=${transferType}`)} className="f-14 color-middle">
            {formatMessage({ id: 'assets.transfer.record' })}
          </span>
        }
      >
        {formatMessage({ id: 'assets.transfer' })}
      </TopBar>
      <div className={styles.assets}>
        <div className={styles.bar}>
          <div className={classNames(styles.from, { [styles.circleRed]: transferItem.pair.from.key !== 'MAIN' })}>
            <div onClick={transferItem.pair.from.key !== 'MAIN' ? switchAccountVisible : null}>
              <span className={styles.circle}></span>
              <label htmlFor="">{transferItem.pair.from.name}</label>
              {transferItem.pair.from.key !== 'MAIN' && <Icon type="down" />}
            </div>
            <div className={styles.balances}>
              <p>{transferItem.pair.from.balancesLabelNode}</p>
              <p className={styles.amount}>
                {transferItem.pair.from.value} {transferItem.pair.from.currency}
              </p>
            </div>
          </div>
          <div className={styles.btn} onClick={changeAcct}>
            <i className="iconfont iconzhanghuhuazhuan"></i>
          </div>
          <div className={classNames(styles.to, { [styles.circleRed]: transferItem.pair.to.key !== 'MAIN' })}>
            <div onClick={transferItem.pair.to.key !== 'MAIN' ? switchAccountVisible : null}>
              <span className={styles.circle}></span>
              <label htmlFor="">{transferItem.pair.to.name}</label>
              {transferItem.pair.to.key !== 'MAIN' && <Icon type="down" />}
            </div>
            <div className={styles.balances}>
              <p>{transferItem.pair.to.balancesLabelNode}</p>
              <p className={styles.amount}>
                {transferItem.pair.to.value} {transferItem.pair.to.currency}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Picker
        cols={1}
        data={accountData}
        value={[transferType]}
        onChange={changeHandle}
        visible={accountVisible}
        onVisibleChange={switchAccountVisible}
        okText={formatMessage({ id: 'common.sure' })}
        dismissText={formatMessage({ id: 'common.cancel' })}
      />

      {transferType === 'otc' && <Otc {...accountProps} />}
      {transferType === 'margin' && <Margin {...accountProps} />}
      {transferType === 'contract' && <Contract {...accountProps} />}
    </>
  );
};

export default connect(({ auth }) => ({
  isOpenMarginV2: auth.isOpenMarginV2
}))(Transfer);
