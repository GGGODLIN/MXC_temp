import { useState } from 'react';
import router from 'umi/router';
import { Modal, Button, Popover, InputItem, Toast } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { saveWithdrawAddress } from '@/services/api';
import styles from './SuccessModal.less';

const PopoverOverlay = ({ withdrawId, visibleSwtich, setAddAddressVisible }) => {
  const [labelVal, setLabelVal] = useState('');

  const confirm = async e => {
    const params = {
      withdrawId,
      remark: labelVal
    };
    const res = await saveWithdrawAddress(params);

    if (res.code === 0) {
      visibleSwtich();
      setAddAddressVisible(true);
      Toast.success(formatMessage({ id: 'assets.msg.address.add_success' }));
    }
  };

  return (
    <div className={styles.popover}>
      <InputItem
        className="am-input-small"
        onChange={value => setLabelVal(value)}
        placeholder={formatMessage({ id: 'assets.msg.address.address_tag_optional' })}
      />
      <Button type="primary" size="small" onClick={confirm}>
        {formatMessage({ id: 'common.save' })}
      </Button>
    </div>
  );
};

const SuccessModal = ({ coin, withdrawId, address, memo, amount, addrList }) => {
  const [visible, setVisible] = useState(false);
  const addrVal = memo ? `${address}:${memo}` : address;
  const [addAddressVisible, setAddAddressVisible] = useState(addrList.some(item => item.address === addrVal));

  const visibleSwtich = e => {
    setVisible(!visible);
  };

  const onCancel = e => {
    router.push('/uassets/overview');
  };

  const toRecord = e => {
    router.push('/uassets/record?tabKey=withdraw');
  };

  const popoverOverlayProps = {
    withdrawId,
    visibleSwtich,
    setAddAddressVisible
  };

  return (
    <Modal
      closable
      transparent
      visible={true}
      onClose={onCancel}
      title={<span style={{ fontSize: 14 }}>{formatMessage({ id: 'assets.withdraw.success.tips' })}</span>}
    >
      <div className={styles.item}>
        <div className={styles.box}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'assets.coin' })}</label>
            <span>{coin}</span>
          </div>
        </div>
      </div>
      <div className={styles.item}>
        <div className={styles.box}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'assets.title.address.withdraw' })}</label>
          </div>
          {!addAddressVisible && (
            <div>
              {formatMessage({ id: 'assets.withdraw.tips.addr' })}
              <Popover visible={visible} placement="topRight" overlay={<PopoverOverlay {...popoverOverlayProps} />}>
                <a onClick={visibleSwtich}>{formatMessage({ id: 'assets.withdraw.save.addr' })}</a>
              </Popover>
            </div>
          )}
        </div>
        <p>{addrVal}</p>
      </div>
      <div className={styles.item}>
        <div className={styles.box}>
          <div>
            <label htmlFor="">{formatMessage({ id: 'assets.balances.cash.num' })}</label>
          </div>
          <span>{amount}</span>
        </div>
      </div>
      <Button type="primary" size="large" style={{ width: '100%', marginTop: 20 }} onClick={toRecord}>
        {formatMessage({ id: 'assets.withdraw.track.status' })}
      </Button>
    </Modal>
  );
};

export default SuccessModal;
