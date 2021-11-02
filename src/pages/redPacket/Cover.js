import React, { useCallback, useState } from 'react';
import styles from './Cover.less';
import { Modal } from 'antd-mobile';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';

const language = getLocale();

function Container({ setPage, redPacketInfo }) {
  const visibleHandle = useCallback(() => {
    if (redPacketInfo) {
      if (redPacketInfo.expired) {
        Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'redPacket.qrcode.expired' }), [
          {
            text: formatMessage({ id: 'mc_launchpads_modal_know' }),
            onPress: () => {},
            style: { fontSize: 16, color: '#DF384E', fontWeight: 'bold' }
          }
        ]);
      } else {
        if (!redPacketInfo.hasRemainQuantity) {
          Modal.alert(formatMessage({ id: 'ucenter.api.info.reminder' }), formatMessage({ id: 'redPacket.qrcode.none' }), [
            {
              text: formatMessage({ id: 'mc_launchpads_modal_know' }),
              onPress: () => {},
              style: { fontSize: 16, color: '#DF384E', fontWeight: 'bold' }
            }
          ]);
        } else {
          setPage(1);
        }
      }
    }
  }, [redPacketInfo]);

  return (
    <div className={classNames(styles.wrapper, { [styles.en]: !language.startsWith('zh') })}>
      {/*<h3 className={styles.title}>{formatMessage({ id: 'redPacket.page.title' })}</h3>*/}
      <div className={styles.content}>
        <div className={styles.receive} onClick={visibleHandle}></div>
      </div>

      <div className={styles.logo}></div>
    </div>
  );
}

export default Container;
