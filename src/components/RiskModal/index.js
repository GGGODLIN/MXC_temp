import { useReducer } from 'react';
import { Modal, Checkbox } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import classNames from 'classnames';

const AgreeItem = Checkbox.AgreeItem;

const initialState = {
  checked: false,
  riskModalVisible: true
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const RiskModal = ({ children, title }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { riskModalVisible, checked } = state;

  const riskModalSwitch = e => {
    setState({ riskModalVisible: !riskModalVisible });
  };

  const riskConfirm = e => {
    if (checked) {
      riskModalSwitch();
      setState({ checked: false });
    }
  };

  return (
    <Modal
      visible={riskModalVisible}
      transparent
      maskClosable={false}
      title={title}
      footer={[
        {
          text: formatMessage({ id: 'common.cancel' }),
          onPress: () => {
            router.push('/uassets/overview');
          }
        },
        {
          text: <span className={classNames({ [styles.disabled]: !checked })}>{formatMessage({ id: 'common.sure' })}</span>,
          disabled: true,
          onPress: () => {
            riskConfirm();
          }
        }
      ]}
    >
      <div className={styles.riskBody}>
        {children}
        <div className={styles.checkbox}>
          <AgreeItem onChange={e => setState({ checked: e.target.checked })} checked={checked}>
            {formatMessage({ id: 'assets.recharge.risk.checked' })}
          </AgreeItem>
        </div>
      </div>
    </Modal>
  );
};

export default RiskModal;
