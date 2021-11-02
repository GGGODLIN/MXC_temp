import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { getVotingGovernList, getVotingGovernDetail, getAssetBalance, doVoteGovern, getMyVoteGovern } from '@/services/api';
import CountDown from './CountDown';
import { getLocale, formatMessage } from 'umi/locale';
import { Tabs, InputItem, Button, Toast } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import { gotoLogin, timeToString } from '@/utils';
import languages from './languages';

import styles from './index.less';

const language = getLocale();
let lang = ['zh-CN', 'zh-TW', 'en-US'].includes(language) ? language : 'en-US';

function List({ serverClientTimeDiff, user }) {
  const [refreshMark, setRefreshMark] = useState(0);

  const [currentPhaseId, setCurrentPhaseId] = useState(null);
  // 先获取活动id
  useEffect(() => {
    getVotingGovernList().then(result => {
      if (result && result.code === 0 && result.data.length) {
        setCurrentPhaseId(result.data[0].code);
      }
    });
  }, []);

  const [currentPhase, setCurrentPhase] = useState({});
  const [myVoteInfo, setMyVoteInfo] = useState([]);
  const [balances, setBalances] = useState({});
  // 再获取活动详情
  useEffect(() => {
    if (currentPhaseId) {
      getVotingGovernDetail(currentPhaseId).then(result => {
        if (result && result.code === 0) {
          const data = result.data;

          if (data) {
            const now = serverClientTimeDiff + Date.now();
            data.isVoting = data.startTime <= now && now <= data.endTime;
            data.isOver = now > data.endTime;
            data.isOnSchedual = now < data.startTime;

            if (data.targetInfos) {
              data.targetInfos.forEach(item => {
                if (item.new !== undefined) {
                  data.newVotes = item.new;
                }

                if (item.old !== undefined) {
                  data.oldVotes = item.old;
                }
              });
            }
          }

          setCurrentPhase(result.data);
        }
      });

      // 登录后获取用户投票信息和资产余额
      if (user && user.id) {
        getMyVoteGovern(currentPhaseId).then(result => {
          if (result && result.code === 0) {
            setMyVoteInfo(result.data && result.data.length ? result.data.sort((a, b) => a.updateTime - b.updateTime) : []);
          }
        });

        getAssetBalance({ currency: 'MX,Road' }).then(result => {
          if (result && result.code === 0) {
            setBalances(result.balances || {});
          }
        });
      }
    }
  }, [currentPhaseId, user, refreshMark]);

  const voteDisable = useMemo(() => {
    if (balances.MX === 0 && balances.ROAD === 0) {
      return true;
    }

    if (
      myVoteInfo.some(item => item.currency === 'MX' && item.voteNum >= currentPhase.maxVoteNum) &&
      myVoteInfo.some(item => item.currency === 'ROAD' && item.voteNum >= currentPhase.maxVoteNum)
    ) {
      return true;
    }

    if (!currentPhase.isVoting) {
      return true;
    }

    return false;
  }, [balances, myVoteInfo, currentPhase]);

  // 币种是否已经投过票
  const coinDisable = useCallback(
    coin => {
      return myVoteInfo.some(item => item.currency === coin && item.voteNum >= currentPhase.maxVoteNum);
    },
    [myVoteInfo, currentPhase]
  );

  const [newParams, setNewParams] = useState({});
  const [oldParams, setOldParams] = useState({});
  const setParams = useCallback(
    (type, fieldName, fieldValue) => {
      if (type === 'new') {
        setNewParams({
          ...newParams,
          [fieldName]: fieldValue
        });
      }

      if (type === 'old') {
        setOldParams({
          ...oldParams,
          [fieldName]: fieldValue
        });
      }
    },
    [newParams, oldParams]
  );

  // 投票方法
  const doVote = useCallback(
    type => {
      const params = {
        code: currentPhase.code
      };

      if (type === 'new') {
        params.voteTarget = 'new';
        params.voteQuota = newParams.voteNum;
        params.currency = newParams.voteCurrency;
      }

      if (type === 'old') {
        params.voteTarget = 'old';
        params.voteQuota = oldParams.voteNum;
        params.currency = oldParams.voteCurrency;
      }

      if (!params.currency) {
        Toast.fail(languages[lang].votePleaseChoose);
        return;
      }

      if (!params.voteQuota) {
        Toast.fail(languages[lang].votePlaceholder);
        return;
      }

      if (!/^[1-9]+\d*$/.test(params.voteQuota)) {
        Toast.fail(languages[lang].votePleaseInputCorrect);
        return;
      }

      if (params.voteQuota > balances[params.currency].available) {
        Toast.fail(languages[lang].voteNumExceedBalance);
        return;
      }

      doVoteGovern(params).then(result => {
        if (result && result.code === 0) {
          Toast.success(languages[lang].voteSuccess);
          setRefreshMark(refreshMark + 1);
          if (type === 'new') {
            setNewParams({});
          }

          if (type === 'old') {
            setOldParams({});
          }
        }
      });
    },
    [currentPhase, refreshMark, newParams, oldParams]
  );

  // 投票记录
  const voteTipText = useMemo(() => {
    if (myVoteInfo && myVoteInfo.length) {
      const lastVoteInfo = myVoteInfo.slice(-1)[0];
      const voteTarget = lastVoteInfo.voteTarget === 'new' ? languages[lang].newName : languages[lang].oldName;

      return languages[lang].voteTip
        .replace('{time}', timeToString(lastVoteInfo.updateTime))
        .replace('{type}', voteTarget)
        .replace('{num}', lastVoteInfo.voteQuota)
        .replace('{currency}', lastVoteInfo.currency);
    }

    return '';
  }, [myVoteInfo]);

  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div className={styles.wrapper}>
      <TopBar>{languages[lang].pageTitle}</TopBar>
      <div className={classNames(styles.top, styles[lang])}>
        <h3 className={styles.title} dangerouslySetInnerHTML={{ __html: languages[lang].title }} />

        <CountDown
          currentPhase={currentPhase}
          serverClientTimeDiff={serverClientTimeDiff}
          handleTimeOut={() => setRefreshMark(refreshMark + 1)}
        />

        <p className={styles.detail}>{languages[lang].desc}</p>
        {myVoteInfo && !!myVoteInfo.length && <p className={styles['vote-tip']}>{voteTipText}</p>}
      </div>

      <div className={styles.content}>
        <div className={classNames(styles.votes, styles[lang])}>
          <span className={styles.new}>{languages[lang].newName}</span>
          <span className={styles.vs}></span>
          <span className={styles.old}>{languages[lang].oldName}</span>
        </div>

        <div className={styles.progress}>
          <div className={styles.new}>
            {languages[lang].newVotes.replace('{num}', currentPhase && currentPhase.newVotes ? currentPhase.newVotes : 0)}
          </div>
          <div
            className={styles['new-bar']}
            style={{
              width: currentPhase ? (currentPhase.newVotes / (currentPhase.newVotes + currentPhase.oldVotes)) * 100 + '%' : '50%'
            }}
          />
          <div className={styles['old-bar']} />
          <div className={styles.old}>
            {languages[lang].oldVotes.replace('{num}', currentPhase && currentPhase.oldVotes ? currentPhase.oldVotes : 0)}
          </div>
        </div>

        <div className={classNames(styles.project, { [styles['project-old']]: currentTab === 1 })}>
          <Tabs
            tabs={[{ title: languages[lang].newName }, { title: languages[lang].oldName }]}
            initialPage={0}
            onTabClick={(tab, index) => setCurrentTab(index)}
          >
            <div className={styles.new}>
              <div className={classNames(styles.info, styles[lang])}>
                {languages[lang].lockedPosition}
                <span className={styles.strong}>{languages[lang].lockedPositionNum}</span>
                <span className={styles.break}></span>
                {languages[lang].initialPosition}
                <span className={styles.strong}>{languages[lang].initialPositionNum}</span>
                <span className={styles.break}></span>
                {languages[lang].teamPosition}
                <span className={styles.strong}>{languages[lang].teamPositionNumNew}</span>
              </div>

              <div className={classNames(styles.info, styles[lang])}>
                {languages[lang].communityPosition}
                <span className={styles.strong}>{languages[lang].communityPositionNumNew}</span>
                <span className={styles.tip}>{languages[lang].communityPositionTipNew}</span>
              </div>

              <div className={styles['choose-coin']}>
                {languages[lang].voteUse}
                <Button
                  type="ghost"
                  disabled={coinDisable('ROAD')}
                  className={classNames(styles.coin, { [styles.active]: newParams.voteCurrency === 'ROAD' && !coinDisable('ROAD') })}
                  onClick={() => setParams('new', 'voteCurrency', 'ROAD')}
                >
                  ROAD
                </Button>
                <Button
                  type="ghost"
                  disabled={coinDisable('MX')}
                  className={classNames(styles.coin, { [styles.active]: newParams.voteCurrency === 'MX' && !coinDisable('MX') })}
                  onClick={() => setParams('new', 'voteCurrency', 'MX')}
                >
                  MX
                </Button>
                {languages[lang].voteName}
              </div>

              <div className={styles.handle}>
                <InputItem
                  placeholder={languages[lang].votePlaceholder}
                  extra={newParams.voteCurrency || '--'}
                  value={newParams.voteNum}
                  onChange={value => setParams('new', 'voteNum', value)}
                />
                <Button type="primary" disabled={voteDisable} onClick={() => (user && user.id ? doVote('new') : gotoLogin())}>
                  {user && user.id ? languages[lang].voteName : formatMessage({ id: 'auth.signIn' })}
                </Button>
              </div>
              <p className={styles.balance}>
                {languages[lang].balanceAvailable}
                {newParams.voteCurrency && balances[newParams.voteCurrency] ? balances[newParams.voteCurrency].available : '--'}{' '}
                {newParams.voteCurrency || '--'}
              </p>
            </div>

            <div className={styles.old}>
              <div className={styles.info}>
                {languages[lang].fundPosition}
                <span className={styles.strong}>{languages[lang].initialPositionNum}</span>
                <span className={styles.break}></span>
                {languages[lang].initialPosition}
                <span className={styles.strong}>{languages[lang].initialPositionNum}</span>
                <span className={styles.break}></span>
                {languages[lang].teamPosition}
                <span className={styles.strong}>{languages[lang].initialPositionNum}</span>
              </div>

              <div className={styles.info}>
                {languages[lang].communityPosition}
                <span className={styles.strong}>{languages[lang].communityPositionNumOld}</span>
                <span className={styles.tip}>{languages[lang].communityPositionTipOld}</span>
              </div>

              <div className={styles['choose-coin']}>
                {languages[lang].voteUse}
                <Button
                  type="ghost"
                  disabled={coinDisable('ROAD')}
                  className={classNames(styles.coin, { [styles.active]: oldParams.voteCurrency === 'ROAD' && !coinDisable('ROAD') })}
                  onClick={() => setParams('old', 'voteCurrency', 'ROAD')}
                >
                  ROAD
                </Button>
                <Button
                  type="ghost"
                  disabled={coinDisable('MX')}
                  className={classNames(styles.coin, { [styles.active]: oldParams.voteCurrency === 'MX' && !coinDisable('MX') })}
                  onClick={() => setParams('old', 'voteCurrency', 'MX')}
                >
                  MX
                </Button>
                {languages[lang].voteName}
              </div>

              <div className={styles.handle}>
                <InputItem
                  placeholder={languages[lang].votePlaceholder}
                  extra={oldParams.voteCurrency || '--'}
                  value={oldParams.voteNum}
                  onChange={value => setParams('old', 'voteNum', value)}
                />
                <Button type="primary" disabled={voteDisable} onClick={() => (user && user.id ? doVote('old') : gotoLogin())}>
                  {user && user.id ? languages[lang].voteName : formatMessage({ id: 'auth.signIn' })}
                </Button>
              </div>

              <p className={styles.balance}>
                {languages[lang].balanceAvailable}
                {oldParams.voteCurrency && balances[oldParams.voteCurrency] ? balances[oldParams.voteCurrency].available : '--'}{' '}
                {oldParams.voteCurrency || '--'}
              </p>
            </div>
          </Tabs>
        </div>

        <div className={styles.rule}>
          <h3 className={styles.title}>
            <span className={styles['left-arrow']}></span>
            <div dangerouslySetInnerHTML={{ __html: languages[lang].ruleExplain }} />
            <span className={styles['right-arrow']}></span>
          </h3>

          <p className={styles['detail-text']}>{languages[lang].ruleInfo1}</p>
          <p className={styles['detail-text']}>{languages[lang].ruleInfo2}</p>
          <p className={styles['detail-text']}>{languages[lang].ruleInfo3}</p>
          <p className={styles['detail-text']}>{languages[lang].ruleInfo4}</p>
        </div>

        <div className={styles.detail}>
          <h3 className={styles.title}>
            <span className={styles['left-arrow']}></span>
            <div dangerouslySetInnerHTML={{ __html: languages[lang].projectExplain }} />
            <span className={styles['right-arrow']}></span>
          </h3>

          <h4 className={styles['sub-title']}>
            <span></span>
            {languages[lang].projectExplainText}
          </h4>
          <p className={styles['detail-text']}>{languages[lang].projectExplainInfo}</p>

          <h4 className={styles['sub-title']}>
            <span></span>
            {languages[lang].projectPlan}
          </h4>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo1}</p>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo2}</p>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo3}</p>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo4}</p>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo5}</p>
          <p className={styles['detail-text']}>{languages[lang].projectPlanInfo6}</p>

          <h4 className={styles['sub-title']}>
            <span></span>
            {languages[lang].projectLightSpot}
          </h4>
          <p className={styles['detail-text']}>{languages[lang].projectLightSpotInfo}</p>

          <h4 className={styles['sub-title']}>
            <span></span>
            {languages[lang].projectProgress}
          </h4>
          <p className={styles['detail-text']}>{languages[lang].projectProgressInfo}</p>

          <h4 className={styles['sub-title']}>
            <span></span>
            {languages[lang].projectUse}
          </h4>
          <p className={styles['detail-text']}>{languages[lang].projectUseInfo}</p>
        </div>
      </div>
    </div>
  );
}

export default connect(({ global, auth }) => ({
  serverClientTimeDiff: global.serverClientTimeDiff,
  user: auth.user
}))(List);
