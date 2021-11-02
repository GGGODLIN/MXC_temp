import React, { useState } from 'react';
import { Modal, Button } from 'antd-mobile';
import cn from 'classnames';
import ThemeOnly from '@/components/ThemeOnly';
import { getLocale, formatMessage } from 'umi/locale';
import { getSubSite } from '@/utils';

import styles from './Detail.less';

const lang = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function Container({ currentCoin }) {
  const [modalVisible, setModalVisible] = useState(false);
  const closeHandle = () => {
    setModalVisible(false);
  };

  return (
    <>
      <span className={cn('iconfont iconinfo-circle1', styles.currencyTip)} onClick={() => setModalVisible(true)} />
      <Modal popup animationType="slide-up" visible={modalVisible} onClose={closeHandle}>
        <ThemeOnly theme="light">
          <div className={styles.wrapper}>
            <div className={styles.header}>
              {currentCoin?.icon && (
                <img src={`${MAIN_SITE_API_PATH}/file/download/${currentCoin.icon}`} alt="icon" className={styles.currencyIcon} />
              )}
              <div>
                <h5 className={styles.currencyName}>
                  {currentCoin.fullName}({currentCoin.currency})
                </h5>
                <p className={styles.currencyInfo}>
                  <span>
                    {formatMessage({ id: 'voting.detail.rank' })}：{currentCoin.sort}
                  </span>
                  <span>
                    {formatMessage({ id: 'voting.coin_item.number' })}：{currentCoin.voteNum}
                  </span>
                </p>
              </div>

              <span className={cn('iconfont iconquxiao1', styles.closeModalIcon)} onClick={closeHandle} />
            </div>
            <div className={styles.content}>
              <div className={styles.item}>
                <h5 className={styles.itemTitle}>{formatMessage({ id: 'mc_slot_assessment_feature' })}：</h5>
                <p className={styles.itemDesc}>
                  {lang.startsWith('zh-') ? currentCoin?.descriptionCn?.split('__')[0] : currentCoin?.descriptionEn?.split('__')[0]}
                </p>
                {currentCoin.website && (
                  <p className={styles.itemDesc}>
                    <a href={currentCoin.website} className={styles.website} rel="nofollow noopener noreferrer">
                      {formatMessage({ id: 'voting.detail.website' })}
                    </a>
                  </p>
                )}
              </div>

              <div className={styles.item}>
                <h5 className={styles.itemTitle}>{formatMessage({ id: 'mc_slot_assessment_rules' })}：</h5>
                <p className={styles.itemDesc}>
                  {lang.startsWith('zh-') ? currentCoin?.descriptionCn?.split('__')[1] : currentCoin?.descriptionEn?.split('__')[1]}
                </p>
              </div>
            </div>
            <Button type="primary" className={styles.button} onClick={closeHandle}>
              {formatMessage({ id: 'layout.top.title.i_know' })}
            </Button>
          </div>
        </ThemeOnly>
      </Modal>
    </>
  );
}

export default Container;
