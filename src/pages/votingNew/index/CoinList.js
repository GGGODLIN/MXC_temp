import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import router from 'umi/router';
import { connect } from 'dva';
import { getLocale, formatMessage } from 'umi/locale';
import cs from 'classnames';
import { InputItem, Button } from 'antd-mobile';
import Empty from '@/components/Empty';
import DetailModal from './detailModal';

import styles from './CoinList.less';

const language = getLocale();

function CoinList({ user, currentPhase, getVoteList }) {
  const [projectList, setProjectList] = useState(currentPhase.projects || []);

  useEffect(() => {
    setProjectList(currentPhase.projects || []);
  }, [currentPhase]);

  const [searchValue, setSearchValue] = useState(null);
  const handleSearch = useCallback(value => {
    setSearchValue(value);
  }, []);

  const renderList = useMemo(() => {
    if (searchValue) {
      const renderList = projectList.filter(
        item =>
          item.currency.toLowerCase().includes(searchValue.toLowerCase()) ||
          (item.fullName && item.fullName.toLowerCase().includes(searchValue.toLowerCase()))
      );

      return renderList;
    }

    return projectList;
  }, [searchValue, projectList]);

  // 币种详情弹窗
  const [detailShow, setDetailShow] = useState(false);
  const [currentCoinId, setCurrentCoinId] = useState(null);
  const showDetailHandle = useCallback(coinId => {
    setDetailShow(true);
    setCurrentCoinId(coinId);
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.top}>
          <h3>{currentPhase.phase.phaseTitle}</h3>
          <div className={styles.search}>
            <InputItem onChange={handleSearch} className="am-search-input" size="small" placeholder="search">
              <i className={cs('iconfont', 'iconsousuo')}></i>
            </InputItem>
          </div>
        </div>

        <div className={styles.list}>
          {renderList.length > 0 &&
            renderList.map((coin, index) => {
              return (
                <div className={styles.item} key={coin.phaseProjectId}>
                  <div className={styles['item-top']}>
                    <div className={styles.left}>
                      <div
                        className={classNames(styles.raking, {
                          [styles[`raking${index + 1}`]]: index < 3 && !currentPhase.phase.isOnSchedual
                        })}
                      >
                        {!currentPhase.phase.isOnSchedual ? (index >= 3 ? index + 1 : '') : index + 1}
                      </div>
                      <p className={styles.name}>{coin.currency}</p>
                      <p className={styles.fullName}>{coin.fullName}</p>
                    </div>

                    <div className={styles.right}>
                      <p
                        className={styles.num}
                        dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'voting.coin_item.number_html' }, { num: coin.voteNum }) }}
                      ></p>
                    </div>
                  </div>

                  <div className={styles.handle}>
                    <Button type="ghost" inline size="small" onClick={() => showDetailHandle(coin.phaseProjectId)}>
                      {formatMessage({ id: 'votingNew.more' })}
                    </Button>

                    {(currentPhase.phase.isVoting || currentPhase.phase.isOnSchedual) && (
                      <Button type="ghost" inline size="small" onClick={() => router.push(`/voting/invite/${coin.phaseProjectId}`)}>
                        {formatMessage({ id: 'voting.call.title.sub' })}
                      </Button>
                    )}

                    {currentPhase.phase.isVoting && (
                      <Button type="primary" inline size="small" onClick={() => router.push(`/voting/vote/${coin.phaseProjectId}`)}>
                        {formatMessage({ id: 'voting.index.timing_3' })}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

          {renderList.length === 0 && <Empty />}
        </div>
      </div>

      <DetailModal detailShow={detailShow} currentCoinId={currentCoinId} setDetailShow={setDetailShow} />
    </div>
  );
}

export default connect(({ auth }) => ({ user: auth.user }))(CoinList);
