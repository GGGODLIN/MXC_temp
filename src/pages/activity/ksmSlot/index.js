import React, { useEffect, useState } from 'react';
import Link from 'umi/link';
import TopBar from '@/components/TopBar';
import ThemeOnly from '@/components/ThemeOnly';
import cn from 'classnames';
import Detail from './Detail';
import Vote from './Vote';
import { getVoteList } from '@/services/api';
import { connect } from 'dva';
import Empty from '@/components/Empty';
import { formatMessage } from 'umi/locale';
import { getSubSite } from '@/utils';

import styles from './index.less';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function Container({ serverClientTimeDiff }) {
  const [currentPhase, setCurrentPhase] = useState();
  const getDataList = () => {
    getVoteList({ voteType: 'KSM_SLOT' }).then(result => {
      if (result?.code === 0 && result.data) {
        const currentPhase = result.data.length ? result.data.slice(-1)[0] : null;

        if (currentPhase) {
          const now = serverClientTimeDiff + Date.now();
          currentPhase.phase.isVoting = currentPhase.phase.start <= now && now <= currentPhase.phase.end;
          currentPhase.phase.isOver = now > currentPhase.phase.end;
          currentPhase.phase.isOnSchedual = now < currentPhase.phase.start;
          currentPhase.phase.phaseNum = currentPhase.phase.title;
        }

        setCurrentPhase(currentPhase);
      }
    });
  };

  useEffect(() => {
    getDataList();
  }, []);

  return (
    <ThemeOnly theme="light">
      <div className={styles.wrapper}>
        <TopBar>{formatMessage({ id: 'mc_slot_head_banner_title' })}</TopBar>
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{formatMessage({ id: 'mc_slot_head_banner_title' })}</h3>
            <p className={styles.desc}>{formatMessage({ id: 'mc_slot_head_banner_desc' })}</p>
          </div>
        </section>
        <section className={styles.content}>
          <div className={styles.info}>
            <h4 className={styles.infoTitle}>{formatMessage({ id: 'mc_slot_head_title' })}</h4>
            <p className={styles.infoDesc}>{formatMessage({ id: 'mc_slot_head_content' })}</p>
            <p className={styles.infoTip}>{formatMessage({ id: 'mc_slot_bottom_desc' })}</p>
          </div>

          <div className={styles.list}>
            <div className={styles.listHeader}>
              <h4 className={styles.listPhase}>
                {formatMessage({ id: 'mc_slot_assessment_times' }, { time: currentPhase?.phase?.phaseNum ?? '--' })}
              </h4>
              <Link to="/activity/ksm-slot/record" className={styles.listMine}>
                {formatMessage({ id: 'voting.index.mine_voting.btn' })}
              </Link>
            </div>

            {currentPhase?.projects &&
              currentPhase.projects.length > 0 &&
              currentPhase.projects.map(item => (
                <div className={styles.listItem} key={item.currency}>
                  <div className={styles.itemHeader}>
                    <div className={styles.itemHeaderLeft}>
                      {item.icon && (
                        <img src={`${MAIN_SITE_API_PATH}/file/download/${item.icon}`} alt="icon" className={styles.currencyIcon} />
                      )}
                      <span className={styles.currencyName}>{item.currency}</span>
                      <Detail currentCoin={item} />
                    </div>
                    <Vote currentPhase={currentPhase} currentCoin={item} getDataList={getDataList} />
                  </div>

                  <div className={styles.itemInfo}>
                    <div className={styles.itemInfoGroup}>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item2' })}</span>
                        <span className={styles.itemValue}>{item.contractAdd}</span>
                      </div>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item5' })}</span>
                        <span className={styles.itemValue}>
                          {item.incite} {item.currency}
                        </span>
                      </div>
                    </div>
                    <div className={styles.itemInfoGroup}>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item3' })}</span>
                        <span className={styles.itemValue}>
                          {item.voteNum} {currentPhase?.phase?.voteCurrency}
                        </span>
                      </div>
                      <div className={styles.itemKeyValue}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'trans.title.cur_issue_am' })}</span>
                        <span className={styles.itemValue}>
                          {item.issueTotal ?? '--'} {item.currency}
                        </span>
                      </div>
                    </div>
                    <div className={styles.itemInfoGroup}>
                      <div className={cn(styles.itemKeyValue, styles.textRight)}>
                        <span className={styles.itemKey}>{formatMessage({ id: 'mc_slot_list_item4' })}</span>
                        <span className={styles.itemValue}>
                          {item.lockTimes}
                          {formatMessage({ id: 'common.day' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {currentPhase?.projects && currentPhase.projects.length === 0 && <Empty initialTheme="light" />}
          </div>

          <div className={styles.tip}>
            <h4 className={styles.tipTitle}>{formatMessage({ id: 'mc_slot_spe_modal' })}</h4>
            <p className={styles.tipDesc}>{formatMessage({ id: 'mc_slot_bottom_content' })}</p>
          </div>
        </section>
      </div>
    </ThemeOnly>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(Container);
