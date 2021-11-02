import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { List, Switch, Modal } from 'antd-mobile';
import { enableFeeDiscount } from '@/services/api';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';

import styles from './index.less';

import discountRate from '@/assets/img/ucenter/discount_rate.png';
import discountLevel from '@/assets/img/ucenter/discount_level.png';
import discountDesc from '@/assets/img/ucenter/discount_desc.png';

const Discount = ({ balances, dispatch }) => {
  const { discount } = balances;
  const [check, setCheck] = useState(false);

  useEffect(() => {
    dispatch({ type: 'assets/getOverview' });
  }, []);

  useEffect(() => {
    setCheck(discount.enable || false);
  }, [discount.enable]);

  const onChange = async check => {
    check ? handleOk() : handleCancel();
  };

  function handleOk() {
    Modal.alert(formatMessage({ id: 'assets.discount.open.title' }), '', [
      { text: formatMessage({ id: 'common.cancel' }) },
      { text: formatMessage({ id: 'common.yes' }), onPress: () => putDiscount() }
    ]);
  }

  function handleCancel() {
    Modal.alert(<span style={{ lineHeight: '30px' }}>{formatMessage({ id: 'assets.discount.close.title' })}</span>, '', [
      { text: formatMessage({ id: 'common.cancel' }) },
      { text: formatMessage({ id: 'common.yes' }), onPress: () => putDiscount() }
    ]);
  }

  const putDiscount = async e => {
    const params = {
      enable: check ? 0 : 1
    };
    const res = await enableFeeDiscount(params);

    if (res.code === 0) {
      setCheck(!check);
    }
  };

  return (
    <div className={styles.main}>
      <TopBar>{formatMessage({ id: 'assets.discount.setting' })}</TopBar>
      <List>
        <List.Item extra={<Switch checked={check} onChange={onChange} />}>
          {formatMessage({ id: 'assets.discount.mx.rate' }, { rate: discount.rate ? (discount.rate * 100).toFixed(0) : 0 })}
        </List.Item>
      </List>
      <div className={styles.card}>
        <div className={styles.head}>
          <img src={discountRate} alt="" />
          <span>{formatMessage({ id: 'assets.discount.title' })}</span>
        </div>
        <div className={styles.body}>
          <div className={styles.rate}>
            <div>
              {check ? (
                <p>{discount.maker ? (discount.maker * (1 - discount.rate) * 100).toFixed(3) : 0}%</p>
              ) : (
                <p>{discount.maker ? (discount.maker * 100).toFixed(3) : 0}%</p>
              )}
              <span>Maker</span>
            </div>
            <div>
              {check ? (
                <p>{discount.taker ? (discount.taker * (1 - discount.rate) * 100).toFixed(3) : 0}%</p>
              ) : (
                <p>{discount.taker ? (discount.taker * 100).toFixed(3) : 0}%</p>
              )}
              <span>Taker</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.head}>
          <img src={discountLevel} alt="" />
          <span>{formatMessage({ id: 'assets.discount.stage' })}</span>
        </div>
        <div className={styles.body}>
          <p>{formatMessage({ id: 'home.title.swap_tip' })}</p>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.head}>
          <img src={discountDesc} alt="" />
          <span>{formatMessage({ id: 'assets.discount.desc' })}</span>
        </div>
        <div className={styles.body}>
          <p>{formatMessage({ id: 'assets.discount.open.tips1' })}</p>
          <p>{formatMessage({ id: 'assets.discount.open.tips2' })}</p>
          <p>{formatMessage({ id: 'assets.discount.open.tips3' })}</p>
        </div>
      </div>
    </div>
  );
};

export default connect(({ assets }) => ({ balances: assets.balances }))(Discount);
