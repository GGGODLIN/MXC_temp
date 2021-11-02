import { useEffect, useReducer, useState } from 'react';
import { connect } from 'dva';
import { InputItem, Toast, Modal } from 'antd-mobile';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getDepositAddress, getNewAssetDetail } from '@/services/api';
import RiskModal from '@/components/RiskModal';
import Suspend from '../components/Suspend';
import QRCode from 'qrcode.react';
import TopBar from '@/components/TopBar';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import styles from './index.less';

const initialState = {
  tabKey: '',
  chainItem: {},
  address: '',
  forbidMsg: '',
  forbidModalVisible: false,
  riskVisible: false,
  currencyDetail: {}
};

const lang = getLocale();

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Deposit = ({ location }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const [riskVisible, setRiskVisible] = useState(false);
  const { tabKey, forbidModalVisible, forbidMsg, currencyDetail, chainItem } = state;
  const { chains } = currencyDetail;
  const { currency } = location.query;

  useEffect(() => {
    if (currency) {
      getAddr(currency);
    }
  }, []);

  useEffect(() => {
    if (chainItem) {
      if (Number(chainItem.depositFee) > 0 || chainItem.depositTipCn) {
        setRiskVisible(true);
      } else {
        setRiskVisible(false);
      }
    }
  }, [chainItem]);

  const getAddr = async () => {
    const res = await getNewAssetDetail(currency);
    if (res.code === 200) {
      setState({ currencyDetail: res.data });
    }
  };

  useEffect(() => {
    if (currencyDetail && chains) {
      switchTab(tabKey || chains[0].chainName);
    }
  }, [currencyDetail]);

  const createAddr = async () => {
    const { currency } = chainItem;
    const res = await getDepositAddress({ currency: currency });

    if (res.code === 0) {
      getAddr(currency);
    } else {
      Toast.info(res.msg);
    }
  };

  const switchTab = tabKey => {
    const chainItem = chains.find(i => i.chainName === tabKey);

    setState({ tabKey, chainItem });
  };

  const download = () => {
    const canvas = document.querySelector('canvas');
    const blob = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = blob;
    link.download = 'deposit-address';

    link.click();
  };

  const BasicAddressNode = ({ current }) => {
    //拆分memo地址
    const { supportMemo, address } = current;
    let addr = '';
    let memo = '';
    const QRwidth = (100 * window.innerWidth) / 375;

    if (supportMemo) {
      const addressSplit = address.split(':');
      addr = addressSplit[0];
      memo = addressSplit[1];
    } else {
      addr = address;
    }

    return (
      <div className={styles.main}>
        <div className={styles.QRcode} onClick={download}>
          {addr && <QRCode value={addr} size={QRwidth} />}
        </div>
        <p>{formatMessage({ id: 'common.save.album' })}</p>
        <div className={styles.address}>
          <p>
            {current.chainName}
            {formatMessage({ id: 'assets.balances.addr' })}
          </p>
          <InputItem
            value={addr}
            disabled
            extra={
              addr && (
                <CopyToClipboard
                  text={addr}
                  onCopy={() => {
                    Toast.success(formatMessage({ id: 'common.copy_success' }));
                  }}
                >
                  <span className={styles.extra}>{formatMessage({ id: 'common.copy' })}</span>
                </CopyToClipboard>
              )
            }
          ></InputItem>
          {memo && (
            <div style={{ marginTop: 10 }}>
              <InputItem
                value={memo}
                disabled
                className={styles.memo}
                extra={
                  <CopyToClipboard
                    text={memo}
                    onCopy={() => {
                      memo && Toast.success(formatMessage({ id: 'common.copy_success' }));
                    }}
                  >
                    <span className={styles.extra}>{formatMessage({ id: 'common.copy' })}</span>
                  </CopyToClipboard>
                }
              ></InputItem>
              <p style={{ color: 'red', padding: '5px 0', textAlign: 'left' }}>{formatMessage({ id: 'assets.tip.memo_deposit' })}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const EmptyAddressNode = () => {
    return (
      <div className={styles.emptyNode}>
        <span onClick={createAddr}>{formatMessage({ id: 'mc_assets_create_address' })}</span>
      </div>
    );
  };

  const filterChains = chains && chains.filter(item => item.currency.indexOf('LOOP') < 0);

  return (
    <div className={styles.wrap}>
      <TopBar>{formatMessage({ id: 'assets.balances.addr' })}</TopBar>
      <Link to="/uassets/search?type=recharge" className={styles.bar}>
        <span>{currency}</span>
        <span className={styles.select}>
          {formatMessage({ id: 'assets.selected.coin' })} <i className="iconfont iconjinru"></i>
        </span>
      </Link>
      <div className={styles.tabWrapper}>
        {filterChains && (
          <div className={styles.tab}>
            {filterChains.map(item => (
              <div
                className={classNames({
                  [styles.active]: tabKey === item.chainName,
                  [styles.disabled]: !item.enableDeposit && !chainItem.disableDepositReason
                })}
                onClick={() => switchTab(item.chainName)}
              >
                {item.chainName}
                <i className="iconfont icongouxuan"></i>
              </div>
            ))}
          </div>
        )}
      </div>
      {chainItem.currency &&
        (!chainItem.enableDeposit && chainItem.disableDepositReason ? (
          <Suspend spotChainsItem={chainItem} type="deposit" />
        ) : !!tabKey && chainItem.address ? (
          <BasicAddressNode current={chainItem} />
        ) : (
          <EmptyAddressNode />
        ))}
      <div className={styles.tips}>
        <p>•{formatMessage({ id: 'assets.balances.recharge.des1' })}</p>
        <p>•{formatMessage({ id: 'assets.balances.recharge.des3' })}</p>
        <p>•{formatMessage({ id: 'assets.balances.recharge.des4' })}</p>
        <p>•{formatMessage({ id: 'assets.balances.recharge.des5' })}</p>
        {tabKey === 'loop' && <p>•{formatMessage({ id: 'assets.cobo.recharge.tips' })}</p>}
      </div>
      {forbidModalVisible && (
        <Modal
          visible={forbidModalVisible}
          transparent
          maskClosable={false}
          title={formatMessage({ id: 'ucenter.api.info.reminder' })}
          footer={[
            {
              text: formatMessage({ id: 'common.yes' }),
              onPress: () => {
                router.push('/uassets/overview');
              }
            }
          ]}
        >
          {forbidMsg}
        </Modal>
      )}
      {riskVisible && (chainItem.depositTipEn || chainItem.depositTipCn || Number(chainItem.depositFee) !== 0) && (
        <RiskModal title={formatMessage({ id: 'assets.recharge.tips.title' })}>
          {Number(chainItem.depositFee) !== 0 && (
            <p>
              {formatMessage(
                { id: 'assets.recharge.fee.tips1' },
                {
                  coin1: chainItem.currency,
                  fee: Number(chainItem.depositFee),
                  coin2: chainItem.currency
                }
              )}
            </p>
          )}
          {chainItem.depositTipCn && (
            <div
              dangerouslySetInnerHTML={{
                __html: (lang.startsWith('zh') ? chainItem.depositTipCn : chainItem.depositTipEn).replace(/\n/g, '<br />')
              }}
            ></div>
          )}
        </RiskModal>
      )}
    </div>
  );
};

export default connect()(Deposit);
