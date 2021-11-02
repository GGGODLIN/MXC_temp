import React, { useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import { formatMessage } from 'umi-plugin-locale';
import Recharge from './Recharge';
import Other from './Other';
import Withdraw from './Withdraw';
import styles from './index.less';
import { Flex, Button, Modal, Tabs, InputItem } from 'antd-mobile';

const Record = ({ dispatch, location }) => {
  const [type, setType] = useState(location.query.tabKey || 'recharge');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState(4);

  return (
    <>
      <TopBar extra={type === 'other' ? <i className="iconfont iconshaixuan" onClick={() => setFilterOpen(true)}></i> : <></>}>
        <div className={styles.title}>
          <span className={classNames({ [styles.active]: type === 'recharge' })} onClick={() => setType('recharge')}>
            {formatMessage({ id: 'assets.recharge.title' })}
          </span>
          <span className={classNames({ [styles.active]: type === 'withdraw' })} onClick={() => setType('withdraw')}>
            {formatMessage({ id: 'assets.cash.title' })}
          </span>
          <span className={classNames({ [styles.active]: type === 'other' })} onClick={() => setType('other')}>
            {formatMessage({ id: 'assets.other.record' })}
          </span>
        </div>
      </TopBar>
      {type === 'recharge' && <Recharge dispatch={dispatch} type={type} />}
      {type === 'withdraw' && <Withdraw dispatch={dispatch} type={type} />}
      {type === 'other' && <Other filterType={filterType} dispatch={dispatch} type={type} />}
      <Modal
        className="am-modal-popup-slide-left"
        transitionName="am-slide-left"
        popup
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <div className={styles.filter}>
          <div>
            <div className={styles['filter-section']}>
              <h4>{formatMessage({ id: 'otcfiat.Order.type' })}</h4>
              <Flex justify="between">
                <span onClick={() => setFilterType(4)} className={classNames(styles['filter-btn'], { [styles.current]: filterType === 4 })}>
                  {formatMessage({ id: 'fin.common.all' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span onClick={() => setFilterType(0)} className={classNames(styles['filter-btn'], { [styles.current]: filterType === 0 })}>
                  {formatMessage({ id: 'assets.title.airdrop.record' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
              </Flex>
              <Flex justify="between">
                <span onClick={() => setFilterType(1)} className={classNames(styles['filter-btn'], { [styles.current]: filterType === 1 })}>
                  {formatMessage({ id: 'assets.title.rebase' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
                <span onClick={() => setFilterType(2)} className={classNames(styles['filter-btn'], { [styles.current]: filterType === 2 })}>
                  {formatMessage({ id: 'assets.other.record' })}
                  <svg aria-hidden="true">
                    <use xlinkHref="#icongouxuan"></use>
                  </svg>
                </span>
              </Flex>
            </div>
          </div>

          <div className={styles['filter-handle']}>
            <Button inline type="ghost" onClick={() => setFilterType(4)}>
              {formatMessage({ id: 'otcfiat.Its.reset' })}
            </Button>
            <Button inline type="primary" onClick={() => setFilterOpen(false)}>
              {formatMessage({ id: 'common.sure' })}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default connect(({ auth }) => ({
  user: auth.user
}))(Record);
