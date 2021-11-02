import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import CoinList from './CoinList';
import classNames from 'classnames';
import { getVoteList } from '@/services/api';
import CountDown from './CountDown';
import { getLocale, formatMessage } from 'umi/locale';
import numberToChinese from '../numberToChinese';
import TopBar from '@/components/TopBar';
import router from 'umi/router';

import styles from './index.less';
import { Button, Modal } from 'antd-mobile';

const language = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function List({ serverClientTimeDiff }) {
  const [phaseList, setPhaseList] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [refreshMark, setRefreshMark] = useState(0);
  useEffect(() => {
    getVoteList({ voteType: 'ASSESS' }).then(result => {
      if (result && result.code === 0 && result.data) {
        // 线上从11期开始投票续期
        const newPhaseList = result.data.slice(10);
        const currentPhase = newPhaseList.length ? newPhaseList.slice(-1)[0] : null;

        if (currentPhase) {
          const now = serverClientTimeDiff + Date.now();
          currentPhase.phase.isVoting = currentPhase.phase.start <= now && now <= currentPhase.phase.end;
          currentPhase.phase.isOver = now > currentPhase.phase.end;
          currentPhase.phase.isOnSchedual = now < currentPhase.phase.start;
          currentPhase.phase.phaseTitle =
            language === 'zh-CN' ? `第${numberToChinese(currentPhase.phase.title - 10)}期` : `Phase ${currentPhase.phase.title - 10} `;
        }

        setPhaseList(newPhaseList.length ? newPhaseList : null);
        setCurrentPhase(currentPhase);
      }
    });
  }, [refreshMark]);

  // 规则弹窗
  const [ruleShow, setRuleShow] = useState(false);
  return (
    <div className={styles.wrapper}>
      <TopBar
        extra={
          <Link to="/voting/my" className={styles.my}>
            {formatMessage({ id: 'voting.index.mine_voting.btn' })}
          </Link>
        }
      >
        {formatMessage({ id: 'voting.index.nav' })}
      </TopBar>
      <div className={styles.top}>
        <h3 className={classNames(styles.title, { [styles.en]: !language.startsWith('zh-') })}>
          {formatMessage({ id: 'votingNew.index.title' })}
        </h3>
        <div className={classNames(styles.desc, { [styles.en]: !language.startsWith('zh-') })}>
          <div className={styles['desc-bg-left']}></div>
          <div className={styles['desc-bg-repeat']}></div>
          <div className={styles['desc-bg-right']}></div>
          <div className={styles['desc-text']}>{formatMessage({ id: 'votingNew.index.desc' })}</div>
        </div>

        {currentPhase && (
          <CountDown
            currentPhase={currentPhase}
            serverClientTimeDiff={serverClientTimeDiff}
            handleTimeOut={() => setRefreshMark(refreshMark + 1)}
          />
        )}

        <div className={styles.side}>
          <div className={styles['side-button']} onClick={() => setRuleShow(true)}>
            {formatMessage({ id: 'voting.index.rule' })}
          </div>

          {isApp && (
            <div className={styles['side-button']} onClick={() => router.push('/voting/my')}>
              {formatMessage({ id: 'voting.index.mine_voting.btn' })}
            </div>
          )}
        </div>
      </div>

      {/*投票规则弹窗*/}
      <Modal popup animationType="slide-up" visible={ruleShow} onClose={() => setRuleShow(false)}>
        <div className={styles['rule-modal']}>
          <h3>{formatMessage({ id: 'voting.index.rule.title' })}</h3>
          <div className={styles['rule-list']}>
            {/*<p>{formatMessage({ id: 'voting.index.rule.1' })}</p>*/}
            {/*<p>{formatMessage({ id: 'voting.index.rule.2' })}</p>*/}
            {/*<p>{formatMessage({ id: 'voting.index.rule.3' })}</p>*/}
            {/*<p>{formatMessage({ id: 'voting.index.rule.4' })}</p>*/}
            {/*<p>{formatMessage({ id: 'voting.index.rule.5' })}</p>*/}
            {/*<p>{formatMessage({ id: 'voting.index.rule.6' })}</p>*/}
            {language.startsWith('zh') ? (
              <>
                <p>1、用户通过MX进行投票，投票期间用户可以多次进行投票，无投票数量限制。</p>
                <p>2、用于投票的MX将冻结至续期结束，冻结期间用户无法交易和转账，但可参与M-Day和SpaceM。</p>
                {/*<p>3. 投票期间用户可以多次进行投票</p>*/}
              </>
            ) : (
              <>
                <p>
                  1. Users can vote by MX token. During the voting period, users can vote as many times as you want and there's no voting
                  caps.
                </p>
                <p>
                  2. The MX token used for voting will be frozen until the end of the extended periods. During the frozen time, the MX can
                  not be traded and withdrawn but is eligible for Space-M and M-day.
                </p>
                {/*<p>3.During the voting period, users can vote multiple times.</p>*/}
              </>
            )}
          </div>
          <div className={styles['rule-handle']}>
            <p>{formatMessage({ id: 'voting.index.rule.7' })}</p>
            <Button type="primary" onClick={() => setRuleShow(false)}>
              {formatMessage({ id: 'voting.index.rule.btn' })}
            </Button>
          </div>
        </div>
      </Modal>
      {currentPhase && <CoinList currentPhase={currentPhase} getVoteList={() => setRefreshMark(refreshMark + 1)} />}
    </div>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(List);
