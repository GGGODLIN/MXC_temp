import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { getGameRechargeInfo } from '@/services/api';
import CountDown from './CountDown';
import { getLocale, formatMessage } from 'umi/locale';
import styles from './index.less';
import { Button } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import Link from 'umi/link';
import classNames from 'classnames';
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

const language = getLocale();

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
    getGameRechargeInfo().then(result => {
      // result = {"code":0,"rate":{"BOND":"0.3","NSURE":"0.7"},"startTime":1599667200000,"endTime":1601395200000};
      if (result && result.code === 0) {
        const data = {};
        const now = serverClientTimeDiff + Date.now();
        data.isVoting = result.startTime <= now && now <= result.endTime;
        data.isOver = now > result.endTime;
        data.isOnSchedual = now < result.startTime;
        data.startTime = result.startTime;
        data.endTime = result.endTime;
        result.rate.BOND = Number(result.rate.BOND);
        result.rate.NSURE = Number(result.rate.NSURE);
        data.rate = result.rate;

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

  return (
    <div className={styles.wrapper}>
      <TopBar
      // extra={
      //   <Link to="/uassets/record?tabKey=Recharge" className={styles.my}>
      //     {formatMessage({ id: 'votingRecharge.index.my' })}
      //   </Link>
      // }
      >
        {formatMessage({ id: 'votingRecharge.index.head' })}
      </TopBar>
      <div className={styles.top}>
        <h3
          className={classNames(styles.title, { [styles.en]: !language.startsWith('zh-') })}
          dangerouslySetInnerHTML={{ __html: formatMessage({ id: 'votingRecharge.index.title' }) }}
        />
        <p className={styles['desc-text']}>{formatMessage({ id: 'votingRecharge.index.desc' })}</p>

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
          {formatMessage({ id: 'voting.detail.phase' }, { number: language.startsWith('zh-') ? numberToChinese(2) : 2 })}
          <span></span>
        </div>

        <p className={styles.rule}>
          {language.startsWith('zh-')
            ? 'PK规则：充值PK期间，用户充值以上任意支持的币种到MEXC参与PK赛，充值人数首先达到300人的项目，则该项目在本期充值PK赛中胜出，MEXC将会在完成技术对接后第一时间上线该项目。'
            : 'Rules:Users can deposit any of the tokens above on MEXC during the contest period. The first project with the number of depositors reaching 300 wins the deposit for listing contest, and MEXC will list it as soon as the technical connection completes.'}
        </p>

        <p className={styles.note}>
          {language.startsWith('zh-')
            ? '活动须知：为保证活动公平，基于过去3日的收盘均价，价值超过5U的币种充值计算为有效充值。'
            : "Note:User's deposit amount will be converted into equivalent of USDT based on the average closing price of the token in the past 3 days. Only depositors with deposit amount of each order over 5 USDT will be counted as an eligible depositor."}
        </p>

        <div className={styles['coin-wrapper']}>
          <div className={styles.coin}>
            <div className={styles.icon} />

            <div>
              <p className={styles.name}>BOND</p>
              <p className={styles.thum}>BarnBridge</p>
            </div>
          </div>

          <div className={classNames(styles.coin, styles['coin-right'])}>
            <div className={styles.icon} />

            <div>
              <p className={styles.name}>NSURE</p>
              <p className={styles.thum}>Nsure Network</p>
            </div>
          </div>
        </div>

        <div className={styles.progress}>
          <div
            className={styles.left}
            style={{
              width:
                currentPhase && (currentPhase.rate.BOND !== 0 || currentPhase.rate.NSURE !== 0) ? currentPhase.rate.BOND * 100 + '%' : '50%'
            }}
          >
            <div className={styles['progress-bar']} />

            <div className={styles.num}>
              {currentPhase && currentPhase.rate.BOND ? Number((currentPhase.rate.BOND * 100).toFixed(2)) + '%' : '0%'}
            </div>

            <div className={styles.pk} />
          </div>

          <div className={styles.right}>
            <div className={styles['progress-bar']} />

            <div className={styles.num}>
              {currentPhase && currentPhase.rate.NSURE ? Number((currentPhase.rate.NSURE * 100).toFixed(2)) + '%' : '0%'}
            </div>
          </div>
        </div>

        <div className={styles['coin-info']}>
          <div className={styles['coin-item']}>
            <div className={styles.title}>
              <p className={styles.name}>BOND</p>
              <p className={styles.thum}>BarnBridge</p>
            </div>

            <p className={styles.desc}>
              {language.startsWith('zh-')
                ? 'BarnBridge是一个波动导数协议。$BOND令牌将是系统的管理令牌，使$BOND持有人有权对平台的更新进行投票。结合治理机制和激励持有人，它将作为使系统中不同利益相关者保持一致的一种手段。$BOND也将用作安全和策略管理介质。'
                : 'BarnBridge is a fluctuations derivatives protocol for hedging yield sensitivity and market price. It plans to create the first cross platform derivatives protocol for any and all fluctuations. To start, we will focus on yield sensitivity & market price. BOND is an ERC-20 token. It will be used to stake in the system, and as a governance token when the governance module is launched.'}
            </p>

            <div className={styles.recharge}>
              <Button
                type="ghost"
                disabled={!currentPhase || !currentPhase.isVoting}
                onClick={() => router.push('/uassets/deposit?currency=BOND')}
              >
                {formatMessage({ id: 'assets.balances.recharge' })}
              </Button>
            </div>
          </div>

          <div className={styles['coin-item']}>
            <div className={styles.title}>
              <p className={styles.name}>NSURE</p>
              <p className={styles.thum}>Nsure Network</p>
            </div>

            <p className={styles.desc}>
              {language.startsWith('zh-')
                ? 'Nsure是一个开放金融保险平台。该项目借鉴了伦敦劳合社的理念，提供一个交易保险风险市场，保费由动态定价模型决定。实现资本挖掘，以确保在任何时间点支持风险所需的资本。采用3个阶段的人群投票机制，以确保每一笔索赔都得到专业处理。'
                : 'Nsure is an open insurance platform for Open Finance. The project borrows the idea of Lloyd’s London, a market place to trade insurance risks, where premiums are determined by a Dynamic Pricing Model. Capital mining will be implemented to secure capital required to back the risks at any point of time. A 3-phase crowd voting mechanism is used to ensure every claim is handled professionally.'}
            </p>

            <div className={styles.recharge}>
              <Button
                type="ghost"
                disabled={!currentPhase || !currentPhase.isVoting}
                onClick={() => router.push('/uassets/deposit?currency=NSURE')}
              >
                {formatMessage({ id: 'assets.balances.recharge' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(List);
