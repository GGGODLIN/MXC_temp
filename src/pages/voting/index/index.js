import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import StickyBar from '@/components/StickyBar';
import CountDown from '../CountDown';
import { getVoteList } from '@/services/api';
import { getLocale, formatMessage } from 'umi/locale';
import { Button, Modal, Picker } from 'antd-mobile';
import classNames from 'classnames';
import DetailModal from './detailModal';
import router from 'umi/router';
import numberToChinese from '../numberToChinese';
import Empty from '@/components/Empty';

import styles from './index.less';
const language = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Index({ serverClientTimeDiff }) {
  const [phaseList, setPhaseList] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);

  const getVoteListHandle = useCallback(() => {
    getVoteList().then(result => {
      if (result && result.code === 0 && result.data) {
        let phaseList = result.data;

        // 第6期是形象大使投票，将数据置为空
        if (phaseList[5]) {
          phaseList[5].projects = [];
        }
        // 降序排列
        phaseList.reverse();

        let now = serverClientTimeDiff + Date.now();

        phaseList.forEach(item => {
          item.phase.isVoting = item.phase.start <= now && now <= item.phase.end;
          item.phase.isOver = now > item.phase.end;
          item.phase.isOnSchedual = now < item.phase.start;
          item.phase.phaseTitle = language === 'zh-CN' ? `第${numberToChinese(item.phase.phase)}期 ` : `Phase ${item.phase.phase} `;
        });

        // 已经有选中的期数的话，代表是重新获取数据，要把选中设置为之前的选中期数
        let votingPhase = phaseList.find(item => {
          if (currentPhase) {
            return item.phase.phase === currentPhase.phase.phase;
          } else {
            return item.phase.isVoting;
          }
        });

        // 未开始
        let schedualPhase = phaseList.find(item => item.phase.isOnSchedual);

        let currentPhase = null;

        if (votingPhase) {
          currentPhase = votingPhase;
        } else if (schedualPhase) {
          currentPhase = schedualPhase;
        } else {
          currentPhase = phaseList[0];
        }

        setPhaseList(phaseList);
        setCurrentPhase(currentPhase);
      }
    });
  }, []);

  useEffect(() => {
    getVoteListHandle();
  }, []);

  // 规则弹窗
  const [ruleShow, setRuleShow] = useState(false);

  // 币种详情弹窗
  const [detailShow, setDetailShow] = useState(false);
  const [currentCoinId, setCurrentCoinId] = useState(null);
  const showDetailHandle = useCallback(coinId => {
    setDetailShow(true);
    setCurrentCoinId(coinId);
  });

  const phaseChange = useCallback(
    value => {
      const currentPhaseId = value[0];
      setCurrentPhase(phaseList.find(item => item.phase.phase === currentPhaseId));
    },
    [phaseList]
  );

  return (
    <div className={classNames(styles.wrapper, { [styles['app']]: isApp })}>
      {/*header背景有渐变，为了和内容背景无缝衔接，加了header-bg*/}
      {!isApp && (
        <div className={styles['header-bg']}>
          <StickyBar>{formatMessage({ id: 'voting.index.nav' })}</StickyBar>
        </div>
      )}

      <div className={styles.circle}></div>

      <h3 className={classNames(styles['banner-cn'], { [styles['banner-en']]: language !== 'zh-CN' })}></h3>

      {/*<h3 className={styles['title-en']}>Which project to be listed? Up to you!</h3>*/}
      <h3 className={styles['title-en']}>Winners can share trading fee proportionally</h3>

      <div className={styles['count-down']}>
        {currentPhase && <CountDown currentPhase={currentPhase} handleTimeOut={getVoteList} serverClientTimeDiff />}
      </div>

      <div className={styles.desc}>
        <span />
        {/*<p dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'voting.index.desc' }) }} />*/}
        {language.startsWith('zh') ? <p>投中即可免费瓜分交易手续费</p> : <p>Winners can share trading fee proportionally</p>}
      </div>

      <div className={styles.content}>
        {currentPhase && (
          <>
            <Picker
              data={phaseList.map(item => ({ label: item.phase.phaseTitle, value: item.phase.phase }))}
              cols={1}
              value={[currentPhase.phase.phase]}
              onChange={phaseChange}
              okText={formatMessage({ id: 'common.sure' })}
              dismissText={formatMessage({ id: 'common.cancel' })}
            >
              <h4>
                {currentPhase.phase.phaseTitle}
                {currentPhase.phase.isVoting && formatMessage({ id: 'voting.index.tabs.ing' })}
                {currentPhase.phase.isOnSchedual && formatMessage({ id: 'voting.index.tabs.begin' })}
                {currentPhase.phase.isOver && formatMessage({ id: 'labs.title.ended' })}
                <i className={`iconfont icondrop`}></i>
              </h4>
            </Picker>

            <div className={styles.list}>
              {currentPhase.projects &&
                currentPhase.projects.length > 0 &&
                currentPhase.projects.map((item, index) => {
                  return (
                    <div key={item.phaseProjectId} className={styles.item}>
                      <div className={styles.info}>
                        <div className={styles['ranking-name']}>
                          <span className={classNames(styles.ranking, styles[`ranking${index + 1}`])}></span>
                          <div onClick={() => showDetailHandle(item.phaseProjectId)}>
                            <h5>
                              {item.currency}
                              <span></span>
                            </h5>
                            <p>{item.fullName}</p>
                          </div>
                        </div>

                        <div className={styles.poll}>
                          <p>{formatMessage({ id: 'voting.coin_item.number' })}</p>
                          <p className={styles.num}>{item.voteNum.toLocaleString()}</p>
                        </div>

                        <div className={styles.handle}>
                          <Button type="primary" onClick={() => router.push(`/voting/vote/${item.phaseProjectId}`)}>
                            {formatMessage({ id: 'voting.index.timing_3' })}
                          </Button>
                        </div>
                      </div>

                      <div className={styles.incentive}>
                        <div className={styles.skew}></div>
                        <p>
                          <span>{formatMessage({ id: 'voting.coin_item.reward' })}</span>
                          {item.incite + item.currency}
                        </p>
                        <p>
                          <span>{formatMessage({ id: 'voting.coin_item.reward.pre' })}</span>
                          {item.everyIncite + item.currency}
                        </p>
                      </div>
                    </div>
                  );
                })}

              {currentPhase.projects && currentPhase.projects.length === 0 && (
                <div>
                  <Empty />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles['bottom-handle']}>
        <Button type="primary" onClick={() => router.push('/voting/my')} className={styles.my}>
          {formatMessage({ id: 'voting.index.mine_voting.btn' })}
        </Button>
        <Button onClick={() => setRuleShow(true)} type="ghost" className={styles.rule}>
          {formatMessage({ id: 'voting.index.rule' })}
        </Button>
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
                <p>1. 每个用户可投每个项目1-10000票，每个项目的MX总票数不设硬顶。</p>
                <p>
                  2.
                  本次投票的前3名优质项目将上线杠杆交易，投中该项目的用户，将按照个人票数占总票数的比例，瓜分该项目上线杠杆交易后的手续费，其中：
                  <br />
                  第一名：1个月手续费
                  <br />
                  第二名：3周手续费
                  <br />
                  第三名：2周手续费
                </p>
                <p>3. 投票结束之后，用于投票的MX将全部归还至账户。</p>
                <p>4. 平台将在总活动结束后（2019年12月11日）对为前3名项目投票的用户进行手续费空投。</p>
              </>
            ) : (
              <>
                <p>
                  1.Each user is able to cast 1 – 10000 votes (1 vote = 1 MX) for each project, and there is no hard cap for each project.
                  {' '}
                </p>
                <p>
                  2.The top 3 projects with largest number of votes will be added in Margin Trading. Voters of the winning projects are
                  able to share the trading fee of the winning project for a fixed period time based on the proportion between their
                  number of votes and the total number of votes. 
                  <br />
                  Voters of the 1st place project: 1 month of trading fee
                  <br />
                  Voters of the 2nd place project: 3 weeks of trading fee
                  <br />
                  Voters of the 3rd place project: 2 weeks of trading fee{' '}
                </p>
                <p>3.After the voting campaign, the MX used for voting will be unlocked. </p>
                <p>
                  4.The airdrop for the voters of the top 3 projects will be distributed on December 11, 2019 when the whole promotion
                  completes.{' '}
                </p>
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

      {/*币种详情弹窗*/}
      <DetailModal detailShow={detailShow} currentCoinId={currentCoinId} setDetailShow={setDetailShow} />
    </div>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(Index);
