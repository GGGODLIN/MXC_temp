import React, { useState } from 'react';
import { Modal } from 'antd-mobile';
import cn from 'classnames';
import ThemeOnly from '@/components/ThemeOnly';
import styles from './tipModal.less';

function Container({ text }) {
  const [modalVisible, setModalVisible] = useState(false);
  const closeHandle = () => {
    setModalVisible(false);
  };

  return (
    <>
      <i onClick={() => setModalVisible(true)} className={cn('iconfont iconquestion-circle', styles.iconColor)}></i>
      <Modal className={styles.sunTipBg} transparent visible={modalVisible} animationType="fade" footer={[]} onClose={closeHandle}>
        <ThemeOnly theme="dark">
          <div className={styles.wrapper}>
            <p className={styles.tipsInner}>{text}</p>
          </div>
        </ThemeOnly>
      </Modal>
    </>
  );
}

export default Container;
