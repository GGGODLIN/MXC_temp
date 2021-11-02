import React, { useState, createContext, useCallback, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './creditCardModel.less';
import classNames from 'classnames';
import { List, InputItem, WhiteSpace, Button, Modal, Picker, SearchBar, Checkbox } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import { putCreditCardOrder } from '@/services/api';
const CheckboxItem = Checkbox.CheckboxItem;
function CreditCardModel({ promptMode, checkedId, placeTheOrder, setState }) {
  const [formElementValue, setFormElementValue] = useState({});
  const [checked, setChecked] = useState(false);

  const submitOrders = async () => {
    const res = await putCreditCardOrder(placeTheOrder);
    if (res.code === 0) {
      if (checkedId === 'simplex') {
        setFormElementValue(res.data);
        document.getElementById('payment_form').submit();
      } else {
        window.open(res.data.url, '_self');
      }
      setState({
        checkedId: '',
        promptMode: 'none'
      });
    }
  };

  return (
    <div className={styles.modelContent} style={{ display: promptMode }}>
      <div className={styles.layer}></div>
      <div className={styles.modelCentent}>
        <div className={styles.infoContent}>
          <div className={styles.headerTitle}>
            <div className={styles.title}>{formatMessage({ id: 'mc_creditCard_title' })}</div>
            <div
              className={styles.close}
              onClick={() => {
                setState({
                  promptMode: 'none'
                });
              }}
            >
              <i className="iconfont iconquxiao1"></i>
            </div>
          </div>
          <div className={styles.introduce}>
            <div className={styles.introduceTitle}>{formatMessage({ id: 'mc_creditCard_order_prompt' })}</div>
            <div className={styles.introduceInfo}>
              <p>
                <i className="iconfont iconguanyux"></i>
                <span>{formatMessage({ id: 'mc_creditCard_order_liability' })}</span>
              </p>
              <div>{formatMessage({ id: 'mc_creditCard_order_introduce' }, { name: checkedId })}</div>
            </div>
            <div className={styles.check}>
              <CheckboxItem
                data-seed="logId"
                onChange={e => {
                  setChecked(e.target.checked);
                }}
              >
                {formatMessage({ id: 'mc_creditCard_order_agree' })}
              </CheckboxItem>
            </div>
          </div>
          <div className={classNames([styles.footer])}>
            <div
              className={classNames([styles.commonBtn, styles.cancel])}
              onClick={() => {
                setState({
                  promptMode: 'none'
                });
              }}
            >
              {formatMessage({ id: 'common.cancel' })}
            </div>
            <div
              className={classNames([styles.commonBtn, styles.ok, checked === false && styles.nosellBtn])}
              onClick={() => submitOrders()}
            >
              {formatMessage({ id: 'common.sure' })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <form id="payment_form" action={formElementValue.payment_post_url} method="POST" target="_blank">
          <input type="hidden" name="version" value={formElementValue.api_version} />
          <input type="hidden" name="partner" value={formElementValue.partner_name} />
          <input type="hidden" name="payment_flow_type" value="wallet" />
          <input type="hidden" name="return_url_success" value={formElementValue.return_url} />
          <input type="hidden" name="return_url_fail" value={formElementValue.return_url} />
          <input type="hidden" name="quote_id" value={formElementValue.quote_id} />
          <input type="hidden" name="payment_id" value={formElementValue.payment_id} />
          <input type="hidden" name="user_id" value={formElementValue.user_id} />
          <input type="hidden" name="destination_wallet[address]" value={formElementValue.address} />
          <input type="hidden" name="destination_wallet[currency]" value={formElementValue.coin_name} />
          <input type="hidden" name="fiat_total_amount[amount]" value={formElementValue.amount} />
          <input type="hidden" name="fiat_total_amount[currency]" value={formElementValue.currency} />
          <input type="hidden" name="digital_total_amount[amount]" value={formElementValue.quantity} />
          <input type="hidden" name="digital_total_amount[currency]" value={formElementValue.coin_name} />
        </form>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  otcuser: otc.otcuser
}))(CreditCardModel);
