import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { getGameRankingInfo } from '@/services/api';
import CountDown from './CountDown';
import { getLocale, formatMessage } from 'umi/locale';
import { Button, Modal } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import classNames from 'classnames';
import tokenMap from './tokenMap';
import styles from './index.less';
// import ThemeOnly from '../../components/ThemeOnly';

const isApp = window.localStorage.getItem('mxc.view.from') === 'app';
const language = getLocale();
const isZh = language.startsWith('zh-');

const numberMap = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
  10: '十'
};

// 暂时只支持小于100期
function numberToChinese(number) {
  if (!number) {
    return '';
  }

  if (number <= 10) {
    return numberMap[number] || '';
  }

  let numberString = number.toString();
  let numberArray = numberString.split('');

  if (numberArray.length === 2) {
    return number < 20
      ? numberMap[10] + (numberMap[numberArray[1]] || '')
      : numberMap[numberArray[0]] + numberMap[10] + (numberMap[numberArray[1]] || '');
  }
}

function List({ serverClientTimeDiff }) {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [refreshMark, setRefreshMark] = useState(0);
  useEffect(() => {
    getGameRankingInfo().then(result => {
      // result = {
      //   "code":0,
      //   "rankList": [
      //     {
      //       currency: 'BOND',
      //       depositCount: 0
      //     },
      //     {
      //       currency: 'PTERIA',
      //       depositCount: 0
      //     },
      //     {
      //       currency: 'CFX',
      //       depositCount: 0
      //     },
      //     {
      //       currency: 'HEGIC',
      //       depositCount: 0
      //     }
      //   ],
      //   "startTime": Date.now(),
      //   "endTime": Date.now() + 300000
      // };

      if (result && result.code === 0) {
        const data = {};
        const now = serverClientTimeDiff + Date.now();
        data.isVoting = result.startTime <= now && now <= result.endTime;
        data.isOver = now > result.endTime;
        data.isOnSchedual = now < result.startTime;
        data.startTime = result.startTime;
        data.endTime = result.endTime;

        const list = result.rankList || [];
        // const totalPeople = list.reduce((previousValue, currentValue) => {
        //   return previousValue + currentValue.depositCount;
        // }, 0);

        const newList = list.map(item => {
          item.rate = Math.min((item.depositCount / 300) * 100, 100).toFixed(2);
          // item.rate = totalPeople > 0 ? (item.depositCount / totalPeople * 100).toFixed(2) : 0;

          return {
            ...item,
            ...tokenMap[item.currency]
          };
        });

        data.list = newList;

        setCurrentPhase(data);
      }
    });
  }, [refreshMark]);

  useEffect(() => {
    let count = 1;
    const timer = setInterval(() => {
      setRefreshMark(count);
      count++;
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const [introductionVisible, setIntroductionVisible] = useState(false);
  const [currentCoin, setCurrentCoin] = useState(null);
  const showIntroduction = useCallback(record => {
    setIntroductionVisible(true);
    setCurrentCoin(record || null);
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <TopBar
        // extra={
        //   <Link to="/uassets/record?tabKey=Recharge" className={styles.my}>
        //     {formatMessage({ id: 'votingRecharge.index.my' })}
        //   </Link>
        // }
        >
          {formatMessage({ id: 'votingRanking.header.title' })}
        </TopBar>
        <div className={styles.top}>
          {isZh ? <h3 className={styles.title} /> : <h3>{formatMessage({ id: 'votingRanking.index.title' })}</h3>}
          <p className={classNames(styles['desc-text'], { [styles.en]: !isZh })}>{formatMessage({ id: 'votingRanking.index.desc' })}</p>

          {currentPhase && (
            <CountDown
              currentPhase={currentPhase}
              serverClientTimeDiff={serverClientTimeDiff}
              handleTimeOut={() => setRefreshMark(refreshMark + 1)}
            />
          )}

          {/*{isApp && (*/}
          <div className={styles.side}>
            <div className={styles['side-button']} onClick={() => router.push('/uassets/record?tabKey=recharge')}>
              {formatMessage({ id: 'votingRecharge.index.my' })}
            </div>
          </div>
          {/*)}*/}
        </div>

        <div className={styles.content}>
          <div className={styles.phase}>
            {formatMessage({ id: 'voting.detail.phase' }, { number: language.startsWith('zh-') ? numberToChinese(1) : 1 })}
            <span></span>
          </div>

          <p className={styles.rule}>
            {language.startsWith('zh-')
              ? '活动规则：考核期间，用户充值以上任意考核币种到MEXC，充值人数不低于300人的项目，MEXC将会在完成技术对接后第一时间上线该项目。'
              : 'Rules:Users can deposit any of the tokens above on MEXC during the activity period. The projects with the number of depositors no less than 300 are eligible to be listed on MEXC after the technical connection completes.'}
          </p>

          <p className={styles.note}>
            {language.startsWith('zh-')
              ? '活动须知：为保证活动公平，基于过去3日的收盘均价，价值超过5U的币种充值计算为有效充值。'
              : "Note: User's deposit amount will be converted into equivalent of USDT based on the average closing price of the token in the past 3 days. Only depositors with deposit amount of each order over 5 USDT will be counted as an eligible depositor."}
          </p>

          <div className={styles.phase}>
            {/*{formatMessage({ id: 'voting.detail.phase' }, { number: isZh ? numberToChinese(1) : 1 })}*/}
          </div>

          <div className={styles['coin-list']}>
            {currentPhase &&
              currentPhase.list.map((item, index) => (
                <dl className={styles[`ranking${index + 1}`]} key={item.name}>
                  <dd className={styles['coin-top']}>
                    <div className={styles.left}>
                      <div className={styles.ranking}>{index + 1}</div>
                      <h4>{item.name}</h4>
                      <p>{item.fullName}</p>
                    </div>

                    <p className={styles.poll}>
                      {formatMessage({ id: 'votingRanking.recharge.num' })}
                      {isZh ? '：' : ':'}
                      <span>{item.depositCount}</span>
                    </p>
                  </dd>
                  <dd className={styles.progress}>
                    <div className={styles['progress-fill']} style={{ width: `${item.rate}%` }} />
                  </dd>

                  <dd className={styles.handle}>
                    <Button inline type="ghost" onClick={() => showIntroduction(item)}>
                      {formatMessage({ id: 'votingRanking.token.info' })}
                    </Button>
                    <Button
                      inline
                      disabled={!currentPhase || !currentPhase.isVoting}
                      type="primary"
                      onClick={() => router.push(`/uassets/deposit?currency=${item.name}`)}
                    >
                      {formatMessage({ id: 'assets.balances.recharge' })}
                    </Button>
                  </dd>
                </dl>
              ))}
          </div>
        </div>
      </div>

      <Modal
        transparent
        visible={introductionVisible}
        title={formatMessage({ id: 'votingRanking.token.info' })}
        className={styles['introduction-modal-wrapper']}
        afterClose={() => setCurrentCoin(null)}
        onClose={() => setIntroductionVisible(false)}
        footer={[{ text: formatMessage({ id: 'common.sure' }), onPress: () => setIntroductionVisible(false) }]}
      >
        {currentCoin && <>{isZh ? currentCoin.introduction : currentCoin.introductionEn}</>}
      </Modal>
    </>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(List);
