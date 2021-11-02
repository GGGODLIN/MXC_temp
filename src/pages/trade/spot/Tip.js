import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Toast, Modal } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { queryCurrencyTip } from '@/services/api';
import iconIeo from '@/assets/img/ieo.png';
import iconIouyou from '@/assets/img/iouyou.png';
import iconST from '@/assets/img/st.png';
import iconWarning from '@/assets/img/ic_warning.png';

import styles from './Tip.less';

const language = getLocale();

const EtfFAQ = language.startsWith('zh')
  ? `${HC_PATH}/hc/zh-cn/articles/360037800551`
  : `${HC_PATH}/hc/en-001/articles/360038484492-FAQ-for-Leveraged-ETF`;

function Container({ currentPair }) {
  const isIeo = currentPair?.presaleEnable === 1;
  const isST = currentPair?.status === 4;
  const isIou = !!currentPair?.iou;
  const { etf, etfMark } = currentPair || {};
  // 获取币种提示信息
  const [currencyMessage, setCurrencyMessage] = useState();
  useEffect(() => {
    queryCurrencyTip(currentPair?.currency).then(result => {
      if (result?.code === 0) {
        setCurrencyMessage(result?.data);
      }
    });
  }, [currentPair?.currency]);

  const [etfRiskyVisible, setEtfRiskyVisible] = useState(false);
  const riskyClickHandle = () => {
    if (etf) {
      setEtfRiskyVisible(true);
    } else {
      Toast.info(currencyMessage?.message);
    }
  };

  return (
    <>
      <span>
        {isIou && <img src={iconIouyou} />}
        {isIeo && <img src={iconIeo} />}
        {currencyMessage?.status === 1 && <img src={iconWarning} onClick={riskyClickHandle} />}
        {isST && (
          <img
            src={iconST}
            onClick={() => {
              Toast.info(formatMessage({ id: 'headline.trade_warning' }, { pair: `${currentPair?.currency}/${currentPair?.market}` }));
            }}
          />
        )}
      </span>
      <Modal
        wrapClassName={styles.etfModalWrapper}
        transparent
        title={formatMessage({ id: 'mc_exchange_etf_info' })}
        visible={etfRiskyVisible}
        footer={[
          {
            text: formatMessage({ id: 'common.sure' }),
            onPress: () => setEtfRiskyVisible(false)
          }
        ]}
      >
        <div className={styles.wrapper}>
          <p className={styles.warningTip}>{currencyMessage?.message}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_1' }, { mark: etfMark })}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_2' }, { mark: etfMark })}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_3' })}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_4' })}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_5' })}</p>
          <p>{formatMessage({ id: 'mc_exchange_etf_warning_6' })}</p>
          <p>
            <a className={styles.detail} href={EtfFAQ} target="_blank" rel="nofollow noopener noreferrer">
              {formatMessage({ id: 'mc_exchange_tip_more' })}
            </a>
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Container;
