import { useEffect } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import classNames from 'classnames';

import styles from './index.less';

const lang = getLocale();

const symbolsPopup = ({ visible, onClose, symbols, dispatch, etfItem, user }) => {
  const changeEtfPiar = item => {
    const currency = item.symbol ? item.symbol.split('_')[0] : '';

    if (user.id) {
      dispatch({
        type: 'etfIndex/getEtfOrderList',
        payload: {
          tradeType: 'subscribe',
          pageSize: 10,
          pageNum: 1,
          currency
        }
      });
    }

    dispatch({
      type: 'etfIndex/save',
      payload: {
        etfItem: item,
        etfCurrency: item.symbol,
        orderType: 'subscribe'
      }
    });

    onClose();
    window.location.hash = item.symbol;
  };

  return (
    <Modal
      className="am-modal-popup-slide-right"
      transitionName="am-slide-right"
      popup
      visible={visible}
      onClose={onClose}
      style={{ width: '50%' }}
    >
      <ul className={styles.symbolsPopup}>
        {symbols.map(item => (
          <li key={item.symbol} onClick={e => changeEtfPiar(item)} className={classNames(item.symbol === etfItem.symbol && styles.active)}>
            {lang.startsWith('zh') ? item.name : item.nameEn}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default connect(({ etfIndex, auth }) => ({
  ...etfIndex,
  user: auth.user
}))(symbolsPopup);
