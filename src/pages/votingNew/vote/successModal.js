import React from 'react';
import { Modal } from 'antd-mobile';
import Link from 'umi/link';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi/locale';

import styles from './successModal.less';

function SuccessModal({ showSuccessModal, setShowSuccessModal, id }) {
  return (
    <Modal visible={showSuccessModal} transparent={true} onClose={() => setShowSuccessModal(false)} className={styles.content}>
      <div className={styles.head}></div>
      {/*<p>{formatMessage({ id: 'voting.support.success.text1' })}</p>*/}
      <p>
        {formatMessage({ id: 'voting.support.success.text2' })}
        <Link to="/voting/my">{formatMessage({ id: 'voting.index.mine_voting.btn' })}</Link>
        {formatMessage({ id: 'voting.support.success.text3' })}
      </p>
      <div className={styles.handle}>
        <span onClick={() => router.push('/voting/index')}>{formatMessage({ id: 'invite.ucenter.back' })}</span>
        <Link to={`/voting/invite/${id}`}>{formatMessage({ id: 'voting.call.title.sub' })}</Link>
      </div>
    </Modal>
  );
}

export default SuccessModal;
