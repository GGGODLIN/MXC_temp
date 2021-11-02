import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd-mobile';
import { getLocale, formatMessage } from 'umi/locale';
import { getVoteDetail } from '@/services/api';
import numberToChinese from '../numberToChinese';

import styles from './detailModal.less';

const language = getLocale();

function Index({ detailShow, setDetailShow, currentCoinId }) {
  const [detailData, setDetailData] = useState({});
  useEffect(() => {
    if (currentCoinId) {
      getVoteDetail(currentCoinId).then(result => {
        if (result && result.code === 0) {
          setDetailData(result.data);
        }
      });
    }
  }, [currentCoinId]);

  return (
    <Modal visible={detailShow} transparent={true} onClose={() => setDetailShow(false)} wrapClassName={styles.wrapper}>
      <div className={styles.content}>
        <span className={styles.triangle}></span>
        <h3 className={styles.title}>{formatMessage({ id: 'common.title.project_detail' })}</h3>
        <div className={styles.logo}>{detailData.icon && <img src={detailData.icon} />}</div>
        <h4 className={styles.name}>
          {detailData.currency}{' '}
          <span>
            {detailData.fullName}(
            {language === 'zh-CN' ? `第${numberToChinese(detailData.phase - 10)}期` : `Phase ${detailData.phase - 10}`})
          </span>
        </h4>

        <div className={styles.table}>
          <p>
            <span>{formatMessage({ id: 'voting.detail.rank' })}</span>
            <span>{formatMessage({ id: 'voting.coin_item.number' })}</span>
          </p>
          <p className={styles['table-body']}>
            <span>
              <b>{detailData.sort || '--'}</b>
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatMessage(
                  { id: 'voting.coin_item.number_html' },
                  { num: ['ING', 'END'].includes(detailData.phaseStatus) ? detailData.voteNum : '--' }
                )
              }}
            />
          </p>
          {/*<p>*/}
          {/*  <span>{formatMessage({ id: 'voting.coin_item.reward' })}</span>*/}
          {/*  <span>{formatMessage({ id: 'voting.coin_item.reward.pre' })}</span>*/}
          {/*</p>*/}
          {/*<p>*/}
          {/*  <span>*/}
          {/*    <b>{detailData.incite || '--'}</b> {detailData.currency}*/}
          {/*  </span>*/}
          {/*  <span>*/}
          {/*    <b>{detailData.everyIncite || '--'}</b> {detailData.currency}*/}
          {/*  </span>*/}
          {/*</p>*/}
        </div>

        <div className={styles.link}>
          <a className={styles.website} href={detailData.website} target="_blank" rel="noopener noreferrer">
            <i></i>
            {formatMessage({ id: 'voting.detail.website' })}
          </a>
          <a className={styles.browser} href={detailData.browser} target="_blank" rel="noopener noreferrer">
            <i></i>
            {formatMessage({ id: 'assets.blockchain.browser' })}
          </a>
        </div>

        <div className={styles.info}>
          <p>{language === 'zh-CN' ? detailData.descriptionCn : detailData.descriptionEn}</p>
        </div>

        <div className={styles.handle}>
          <Button onClick={() => setDetailShow(false)} type="ghost" inline className={styles.confirm}>
            {formatMessage({ id: 'voting.index.rule.btn' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default Index;
