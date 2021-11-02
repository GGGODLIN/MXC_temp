import { Modal } from 'antd-mobile';
import { getLocale } from 'umi-plugin-locale';
import { useState, useEffect } from 'react';
import styles from './SecurityModal.less';
import securityBg from '@/assets/img/security-modal-bg.png';
import { formatMessage, FormattedHTMLMessage } from 'umi-plugin-locale';
import cn from 'classnames';
const locale = getLocale();
const SecurityModal = () => {
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  useEffect(() => {
    if (locale.startsWith('zh') && window.localStorage.getItem('mxc_security_modal_have_shown') !== '1') {
      setSecurityModalVisible(true);
      window.localStorage.setItem('mxc_security_modal_have_shown', '1');
    }
  }, []);
  const securityModalClose = () => {
    setSecurityModalVisible(false);
  };
  return (
    <>
      <Modal
        className={styles.securityModalContent}
        transparent
        visible={securityModalVisible}
        onClose={securityModalClose}
        title={null}
        footer={[{ text: formatMessage({ id: 'mc_launchpads_modal_know' }), onPress: securityModalClose }]}
      >
        <div>
          <img src={securityBg} />
          <p className={styles.tip1}>{formatMessage({ id: 'mc_common_security_modal_tip' })}</p>
          <p className={styles.tip2}>
            <FormattedHTMLMessage id={'mc_common_security_modal_tip_2'} />
          </p>
          <div
            className={styles.btn}
            onClick={() => {
              window.open(`${HC_PATH}/hc/zh-cn/articles/4403422957466`);
              securityModalClose();
            }}
          >
            {formatMessage({ id: 'mc_common_security_modal_go_to_official' })}
            <i className="iconfont icongo"></i>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default SecurityModal;
