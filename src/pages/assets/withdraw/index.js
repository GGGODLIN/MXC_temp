import { useEffect, useState } from 'react';
import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import classNames from 'classnames';
import { numberToString } from '@/utils';
import { formatMessage } from 'umi-plugin-locale';
import { getNewAssetDetail } from '@/services/api';
import Form from './Form';
import Suspend from '../components/Suspend';

import styles from './index.less';

const Withdraw = ({ location, dispatch, user, withdrawFormValues }) => {
  const { currency, chain } = location.query;
  const [detail, setDetail] = useState({});
  const [tabKey, setTabKey] = useState('');
  const [chainItem, setChainItem] = useState({});
  const { chains } = detail;
  const filterChains = chains && chains.filter(item => item.currency.indexOf('LOOP') < 0);

  const getDetail = async () => {
    const res = await getNewAssetDetail(currency);
    if (res.code === 200) {
      setDetail(res.data);
    }
  };

  useEffect(() => {
    if (currency) {
      getDetail();
    }
  }, [currency]);

  useEffect(() => {
    if (chains) {
      if (chain) {
        const _chain = filterChains.find(el => el.currency === chain);
        switchTab(_chain.chainName);
      } else {
        switchTab(filterChains[0].chainName);
      }
    }
  }, [chains]);

  const switchTab = tabKey => {
    const item = filterChains.find(i => i.chainName === tabKey);

    setChainItem(item);
    setTabKey(tabKey);
  };

  const tabOnChange = tabKey => {
    switchTab(tabKey);
    dispatch({
      type: 'assets/save',
      payload: {
        withdrawFormValues: {}
      }
    });
  };

  const formProps = {
    user,
    dispatch,
    detail,
    chainItem,
    withdrawFormValues,
    key: chainItem.currency
  };

  return (
    <>
      <TopBar>
        <div className={styles.title}>
          {detail.currency}
          {formatMessage({ id: 'assets.balances.cash' })}
        </div>
      </TopBar>
      <div className={styles.main}>
        <div className={styles.coin}>
          {/* <i className={styles.icon} style={{ backgroundImage: `url(${MAIN_SITE_API_PATH}/file/download/${detail.icon})` }}></i> */}
          <span>
            {detail.currency}
            <label htmlFor="">-{detail.currencyFullName}</label>
          </span>
        </div>
        <div className={styles.balances}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'trade.spot.action.available' })}</label>
            <p>
              {numberToString(Number(detail.available))} {detail.currency}
            </p>
          </div>
          <div className={styles.split}></div>
          <div>
            <label htmlFor="">{formatMessage({ id: 'container.freeze' })}</label>
            <p>
              {numberToString(Number(detail.frozen))} {detail.currency}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.tabWrapper}>
        {filterChains && (
          <div className={styles.tab}>
            {filterChains.map(item => (
              <div
                className={classNames({
                  [styles.active]: tabKey === item.chainName,
                  [styles.disabled]: !chainItem.enableWithdraw && !chainItem.disableWithdrawReason
                })}
                onClick={() => tabOnChange(item.chainName)}
              >
                {item.chainName}
                <i className="iconfont icongouxuan"></i>
              </div>
            ))}
          </div>
        )}
      </div>
      {chainItem.currency &&
        (!chainItem.enableDeposit && chainItem.disableWithdrawReason ? (
          <div style={{ padding: '0 10px' }}>
            <Suspend spotChainsItem={chainItem} type="withdraw" />
          </div>
        ) : (
          <Form {...formProps} />
        ))}
      {/* {assetItem.withdrawTips && (
        <RiskModal title={formatMessage({ id: 'assets.withdraw.tips.title' })}>
          {<div dangerouslySetInnerHTML={{ __html: assetItem.withdrawTips.replace(/\n/g, '<br />') }}></div>}
        </RiskModal>
      )} */}
    </>
  );
};

export default connect(({ assets, auth }) => ({
  list: assets.list,
  USDTETH: assets.USDTETH,
  USDTTRX: assets.USDTTRX,
  withdrawFormValues: assets.withdrawFormValues,
  user: auth.user
}))(Withdraw);
