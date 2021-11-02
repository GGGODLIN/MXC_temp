import React, { useEffect, useState } from 'react';
import { Modal, Button, InputItem, Toast } from 'antd-mobile';
import cn from 'classnames';
import { Link } from 'umi';
import { doCoinVote, getAssetBalance, getCoinRemainVotes } from '@/services/api';
import ThemeOnly from '@/components/ThemeOnly';
import { numberToString, redirectToLogin } from '@/utils';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';

import styles from './Vote.less';

const reg = new RegExp(`^\\d+\\.?\\d{0,8}$`);

function Container({ currentPhase, currentCoin, user, getDataList }) {
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const tipCloseHandle = () => {
    setTipModalVisible(false);
  };

  const [voteModalVisible, setVoteModalVisible] = useState(false);
  const voteCloseHandle = () => {
    setVoteModalVisible(false);
  };

  const [balances, setBalances] = useState(0);
  const [remainVote, setRemainVote] = useState(0);
  // 登录后获取余额
  useEffect(() => {
    if (user && user.id && currentPhase && tipModalVisible) {
      getBalanceHandle();
      getRemainVote();
    }
  }, [user, currentPhase, tipModalVisible]);

  const getRemainVote = () => {
    getCoinRemainVotes(currentCoin.phaseProjectId).then(result => {
      if (result?.code === 0) {
        setRemainVote(result.remains);
      }
    });
  };

  const getBalanceHandle = () => {
    getAssetBalance({ currency: currentPhase?.phase?.voteCurrency }).then(result => {
      if (result && result.code === 0) {
        // result.balances.ETH.available = 0.00000001;
        // result.balances.BETH.available = 0.00000001;
        setBalances(result.balances[currentPhase?.phase?.voteCurrency]?.available || 0);
      }
    });
  };

  const [inputNum, setInputNum] = useState();
  // 手动输入
  const numInputChange = value => {
    // currentCoin.limitMin = 1.1;
    if (value) {
      const valueNum = Number(value);
      if (reg.test(value)) {
        setInputNum(valueNum < balances ? value : numberToString(balances));
      } else {
        setInputNum(inputNum);
      }
    } else {
      setInputNum(undefined);
    }
  };

  const allInputChange = () => {
    setInputNum(numberToString(balances));
  };

  const voteClickHandle = () => {
    if (user && user.id) {
      setTipModalVisible(true);
    } else {
      redirectToLogin();
    }
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const submitHandle = () => {
    const valueNum = Number(inputNum);

    if (valueNum < currentCoin.limitMin) {
      Toast.fail(formatMessage({ id: 'mc_slot_vote_min_limit_placeholder' }));
      return;
    }

    if (valueNum) {
      setSubmitLoading(true);
      doCoinVote({
        phaseProjectId: currentCoin.phaseProjectId,
        voteNum: valueNum
      }).then(result => {
        if (result && result.code === 0) {
          getDataList();
          getRemainVote();
          getBalanceHandle();
          Toast.success(formatMessage({ id: 'mc_slot_assessment_do_success' }), 1.5, () => {
            setSubmitLoading(false);
            voteCloseHandle();
          });
        }
      });
    }
  };

  return (
    <>
      <Button
        disabled={!currentPhase?.phase?.isVoting || currentCoin?.voteEnabled !== 1}
        type="primary"
        className={styles.itemHeaderVote}
        onClick={voteClickHandle}
      >
        {currentPhase?.phase?.isVoting ? formatMessage({ id: 'mc_slot_list_item_start' }) : ''}
        {currentPhase?.phase?.isOnSchedual ? formatMessage({ id: 'voting.index.tabs.begin' }) : ''}
        {currentPhase?.phase?.isOver ? formatMessage({ id: 'labs.title.ended' }) : ''}
      </Button>
      <Modal popup animationType="slide-up" visible={tipModalVisible} onClose={tipCloseHandle}>
        <ThemeOnly theme="light">
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <h4 className={styles.title}>{formatMessage({ id: 'mc_slot_spe_modal' })}</h4>
              <span className={cn('iconfont iconquxiao1', styles.closeModalIcon)} onClick={tipCloseHandle} />
            </div>

            <div className={styles.item}>
              <p className={styles.itemDesc}>{formatMessage({ id: 'mc_slot_assessment_tips_item1' })}</p>
              <p className={styles.itemDesc}>{formatMessage({ id: 'mc_slot_assessment_tips_item2' })}</p>
              <p className={styles.itemDesc}>{formatMessage({ id: 'mc_slot_assessment_tips_item3' })}</p>
              <p className={styles.itemDesc}>{formatMessage({ id: 'mc_slot_assessment_tips_item4' })}</p>
            </div>

            <Button
              type="primary"
              className={styles.button}
              onClick={() => {
                setVoteModalVisible(true);
                tipCloseHandle();
              }}
            >
              {formatMessage({ id: 'layout.top.title.i_know' })}
            </Button>
          </div>
        </ThemeOnly>
      </Modal>

      <Modal popup animationType="slide-up" visible={voteModalVisible} onClose={voteCloseHandle}>
        <ThemeOnly theme="light">
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <h4 className={styles.title}>{formatMessage({ id: 'mc_slot_head_banner_title' })}</h4>
              <span className={cn('iconfont iconquxiao1', styles.closeModalIcon)} onClick={voteCloseHandle} />
            </div>

            <div className={styles.itemInfo}>
              <div className={styles.itemInfoGroup}>
                <div>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item1' })}</span>
                  <span className={styles.itemValue}>{currentCoin?.fullName}</span>
                </div>
              </div>
              <div className={styles.itemInfoGroup}>
                <div>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item4' })}</span>
                  <span className={styles.itemValue}>
                    {currentCoin?.lockTimes}
                    {formatMessage({ id: 'common.day' })}
                  </span>
                </div>
              </div>
              <div className={styles.itemInfoGroup}>
                <div className={styles.textRight}>
                  <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_modal_getcoin' })}</span>
                  <span className={styles.itemValue}>{currentCoin?.currency}</span>
                </div>
              </div>
            </div>

            <div className={styles.vote}>
              <div className={styles.voteLabel}>
                <p className={styles.voteTitle}>
                  {formatMessage({ id: 'mc_slot_modal_vote' }, { coinname: currentPhase?.phase?.voteCurrency })}
                </p>
                <p className={styles.voteTitle}>
                  {formatMessage({ id: 'mc_slot_vote_min_limit' })}：{currentCoin?.limitMin}
                  {currentPhase?.phase?.voteCurrency}
                </p>
              </div>
              <InputItem
                className={styles.voteInput}
                value={inputNum}
                placeholder={formatMessage({ id: 'mc_slot_vote_min_limit_placeholder' })}
                onChange={numInputChange}
                extra={
                  <span className={styles.voteAll} onClick={allInputChange}>
                    {formatMessage({ id: 'order.table.status.all' })}
                  </span>
                }
              />
              <p className={styles.balance}>
                {formatMessage({ id: 'mc_slot_modal_vote_number' })}：{balances}
                {currentPhase?.phase?.voteCurrency}
                <Link to={`/uassets/deposit?currency=${currentPhase?.phase?.voteCurrency}`}>
                  {formatMessage({ id: 'assets.balances.recharge' })}
                </Link>
              </p>
            </div>

            <Button loading={submitLoading} type="primary" className={styles.button} onClick={submitHandle}>
              {formatMessage({ id: 'mc_slot_list_item_start' })}
            </Button>
          </div>
        </ThemeOnly>
      </Modal>
    </>
  );
}

function mapStateToProps({ auth }) {
  return {
    user: auth.user
  };
}

export default connect(mapStateToProps)(Container);
