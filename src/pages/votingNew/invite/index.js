import React, { useCallback } from 'react';
import StickyBar from '@/components/StickyBar';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { InputItem, Toast } from 'antd-mobile';
import { formatMessage } from 'umi/locale';
import classNames from 'classnames';

import styles from './index.less';
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Invite({ match }) {
  const urlOrigin = window.location.origin,
    inviteUrl = urlOrigin + `/voting/vote/${match.params.id}`;

  const onCopy = useCallback((text, result) => {
    if (result) {
      Toast.success(formatMessage({ id: 'common.copy_success' }), 2);
    }
  }, []);

  return (
    <div className={classNames(styles.wrapper, { [styles['app']]: isApp })}>
      <StickyBar>{formatMessage({ id: 'voting.call.title.title' })}</StickyBar>

      <div className={styles.content}>
        <div className={styles.head}>
          <p className={styles.website}>www.mexc.io</p>
          <div className={styles.qrcode}>
            <img src="https://email-images.oss-cn-qingdao.aliyuncs.com/download.png" alt="MEXC交易所" />
          </div>
        </div>

        <div className={styles.link}>
          <InputItem
            value={inviteUrl}
            extra={
              <CopyToClipboard text={inviteUrl} onCopy={onCopy}>
                <a className={styles.copy}>{formatMessage({ id: 'common.copy' })}</a>
              </CopyToClipboard>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Invite;
