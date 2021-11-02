import React, { useEffect, useState } from 'react';
import { Modal, Flex, Button } from 'antd-mobile';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import router from 'umi/router';

import styles from './index.less';

function Container({ visible, closeHandle, dispatch, loginMember }) {
  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, []);

  const modalCloseHandle = () => {
    if (typeof closeHandle === 'function') {
      closeHandle();
    }
  };

  const jumpHandle = url => {
    modalCloseHandle();
    router.push(url);
  };

  return (
    <>
      <Modal
        className={styles.modal}
        transparent
        visible={visible}
        onClose={modalCloseHandle}
        title={formatMessage({ id: 'swap.submitEntrust.riskWarning' })}
        footer={[{ text: formatMessage({ id: 'common.sure' }), onPress: modalCloseHandle }]}
      >
        <h4 className={styles.title}>{formatMessage({ id: 'mc_common_verification_warning_desc' })}</h4>
        {!loginMember?.mobile && (
          <Flex className={styles.item} justify="between">
            <Flex className={styles.left}>
              {/*<span className="iconfont icongoogle" />*/}
              {formatMessage({ id: 'securecheck.bind.phone' })}
            </Flex>
            <Button size="small" className={styles.button} type="ghost" inline onClick={() => jumpHandle('/ucenter/phone-bind')}>
              {formatMessage({ id: 'ucenter.index.features.mobile_bind' })}
            </Button>
          </Flex>
        )}

        {!loginMember?.email && (
          <Flex className={styles.item} justify="between">
            <Flex className={styles.left}>
              {/*<span className="iconfont iconic_email" />*/}
              {formatMessage({ id: 'securecheck.bind.email' })}
            </Flex>
            <Button size="small" className={styles.button} type="ghost" inline onClick={() => jumpHandle('/ucenter/email-bind')}>
              {formatMessage({ id: 'ucenter.index.features.mobile_bind' })}
            </Button>
          </Flex>
        )}

        {loginMember?.secondAuthType !== 2 && (
          <Flex className={styles.item} justify="between">
            <Flex className={styles.left}>
              {/*<span className="iconfont icongoogle" />*/}
              {formatMessage({ id: 'securecheck.bind.google_auth' })}
            </Flex>
            <Button size="small" className={styles.button} type="ghost" inline onClick={() => jumpHandle('/ucenter/google-auth-bind')}>
              {formatMessage({ id: 'ucenter.index.features.mobile_bind' })}
            </Button>
          </Flex>
        )}
      </Modal>
    </>
  );
}

export default connect(({ auth }) => ({
  loginMember: auth.loginMember
}))(Container);
