import { useState } from 'react';
import { Modal, InputItem, Toast } from 'antd-mobile';
import classNames from 'classnames';
import { sutersConvert } from '@/services/api';
import { formatMessage } from 'umi-plugin-locale';

import styles from './SsuterModal.less';

const SsuterModal = ({ list, ssuterVisible, ssuterModalSwtich, dispatch }) => {
  const [amount, setAmount] = useState('');
  const ssuterBalances = list.find(item => item.vcoinNameEn === 'SSUTER').balanceAmount;
  const suterBalances = list.find(item => item.vcoinNameEn === 'SUTER').balanceAmount;

  const TransferExtra = e => {
    return (
      <div className={styles.extra}>
        <span onClick={handleSubmit}>{formatMessage({ id: 'assets.transfer' })}</span>
      </div>
    );
  };

  const handleSubmit = async e => {
    const reg = /^\+?(?!0+(\.00?)?$)\d+(\.\d\d?)?$/;
    const amountNum = Number(amount);

    if (amountNum <= 0) {
      Toast.fail(formatMessage({ id: 'assets.transfer.amount.zero' }));
      return false;
    } else if (amountNum > ssuterBalances) {
      Toast.fail(formatMessage({ id: 'assets.transfer.amount.max' }));
      return false;
    } else if (!reg.test(amountNum)) {
      Toast.fail(formatMessage({ id: 'assets.transfer.amount.requrie' }));
      return false;
    }
    const params = {
      amount
    };

    const res = await sutersConvert(params);

    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'assets.transfer.success' }));
      dispatch({ type: 'assets/getOverview' });
      ssuterModalSwtich();
    }
  };

  return (
    <Modal popup visible={ssuterVisible} animationType="slide-up">
      <div className={styles.content}>
        <div className={styles.head}>
          <h3>{formatMessage({ id: 'assets.transfer.title' })}</h3>
          <span onClick={ssuterModalSwtich}>{formatMessage({ id: 'common.cancel' })}</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.from}>
            <span className={styles.circle}></span>
            <label htmlFor="">SSUTER</label>
          </div>
          <div className={styles.btn}>
            <i className="iconfont iconzhanghuhuazhuan"></i>
          </div>
          <div className={styles.to}>
            <span className={styles.circle}></span>
            <label htmlFor="">SUTER</label>
          </div>
        </div>
        <div className={styles.price}>
          <p>
            {formatMessage({ id: 'common.balance' })}：{ssuterBalances} SSUTER
          </p>
          <p>
            {formatMessage({ id: 'common.balance' })}：{suterBalances} SUTER
          </p>
        </div>
        <div className={styles.transfer}>
          <InputItem
            placeholder={formatMessage({ id: 'assets.transfer.placeholder' })}
            value={amount}
            onChange={amount => setAmount(amount)}
            extra={<TransferExtra />}
          />
        </div>
        <div className={styles.tips} dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'assets.ssuter.tips' }) }}></div>
      </div>
    </Modal>
  );
};

export default SsuterModal;
