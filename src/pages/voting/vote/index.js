import React, { useCallback, useEffect, useState } from 'react';
import StickyBar from '@/components/StickyBar';
import CountDown from '../CountDown';
import { getVoteDetail, getVoteList, getCoinRemainVotes, getAssetBalance, doCoinVote } from '@/services/api';
import { getLocale, formatMessage } from 'umi/locale';
import { connect } from 'dva';
import Link from 'umi/link';
import { InputItem, Button } from 'antd-mobile';
import Slider from 'rc-slider';
import { positiveIntegerReg } from '@/utils/regExp';
import SuccessModal from './successModal';
import classNames from 'classnames';
import { gotoCrossPlatformUrl } from '@/utils';

import styles from './index.less';

const RcSlider = Slider.createSliderWithTooltip(Slider);
const language = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Index({ match, serverClientTimeDiff }) {
  const [detailData, setDetailData] = useState({});
  const [remain, setRemain] = useState(0);
  const [mxAvailable, setMxAvailable] = useState(0);
  const initData = useCallback(() => {
    const id = match.params.id;

    if (id) {
      getVoteDetail(id).then(result => {
        if (result && result.code === 0) {
          setDetailData(result.data);
        }
      });

      getCoinRemainVotes(id).then(result => {
        if (result && result.code === 0) {
          setRemain(result.remains);
        }
      });

      getAssetBalance({ currency: 'MX' }).then(result => {
        if (result && result.code === 0 && result.balances && result.balances.MX) {
          setMxAvailable(result.balances.MX.available || 0);
        }
      });
    }
  }, []);
  // 获取项目详情,可投票数,可用MX
  useEffect(() => {
    initData();
  }, []);

  // 获取项目所在期数
  const [currentPhase, setCurrentPhase] = useState(null);
  const [refreshMark, setRefreshMark] = useState(0);
  useEffect(() => {
    if (detailData.phase) {
      getVoteList().then(result => {
        if (result && result.code === 0) {
          let filterResult = result.data.filter(item => item.phase.phase === detailData.phase)[0];
          let now = serverClientTimeDiff + Date.now();
          filterResult.phase.isVoting = filterResult.phase.start <= now && now <= filterResult.phase.end;
          filterResult.phase.isOver = now > filterResult.phase.end;
          filterResult.phase.isOnSchedual = now < filterResult.phase.start;

          setCurrentPhase(filterResult);
        }
      });
    }
  }, [detailData, refreshMark]);

  // 滑动输入
  const [inputNum, setInputNum] = useState(undefined);
  const [sliderValue, setSliderValue] = useState(0);
  const sliderValueChange = useCallback(
    num => {
      setSliderValue(num);
      setInputNum(Math.ceil(remain * (num / 100)) || '');
    },
    [remain]
  );

  // 手动输入
  const numInputChange = useCallback(
    value => {
      if (remain === 0) {
        setInputNum(0);
        setSliderValue(0);
        return;
      }

      if (value) {
        setInputNum(Math.min(value, remain));
        setSliderValue(Math.floor((value / remain) * 100));
      } else {
        setInputNum('');
        setSliderValue(0);
      }
    },
    [remain]
  );

  // 选择全部
  const selectAll = useCallback(() => {
    setInputNum(Math.floor(Math.min(mxAvailable, remain)));
    setSliderValue(Math.floor((Math.floor(Math.min(mxAvailable, remain)) / remain) * 100));
  }, [mxAvailable, remain]);

  // 错误提示
  const [errorTip, setErrorTip] = useState(null);
  useEffect(() => {
    if (inputNum !== undefined && remain > 0) {
      if (!positiveIntegerReg.test(inputNum)) {
        setErrorTip(formatMessage({ id: 'voting.support.num.require' }));
      } else {
        setErrorTip(null);
      }
    }
  }, [inputNum, remain]);

  // 投票提交
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const submitHandle = useCallback(() => {
    doCoinVote({
      phaseProjectId: match.params.id,
      voteNum: inputNum
    }).then(result => {
      if (result && result.code === 0) {
        initData();
        setInputNum(undefined);
        setShowSuccessModal(true);
      }
    });
  }, [inputNum]);

  return (
    <>
      <div className={classNames(styles.wrapper, { [styles['app']]: isApp })}>
        <StickyBar>{formatMessage({ id: 'voting.support.title' }, { coin: detailData.currency })}</StickyBar>

        <div className={styles['count-down']}>
          {currentPhase && (
            <CountDown
              currentPhase={currentPhase}
              serverClientTimeDiff={serverClientTimeDiff}
              handleTimeOut={() => setRefreshMark(refreshMark + 1)}
            />
          )}
        </div>

        <h3 className={styles.title}>{formatMessage({ id: 'voting.support.title.2' }, { coin: detailData.currency })}</h3>
        {/*<p className={styles.tip}>{formatMessage({ id: 'voting.support.info' })}</p>*/}
        {language.startsWith('zh') ? (
          <p className={styles.tip}>
            成功投中该项目的用户，将按照投票比例免费瓜分该项目上线杠杆交易后的手续费，同时投票后的MX将全额返还，不做销毁。
          </p>
        ) : (
          <p className={styles.tip}>
            Voters of the winning projects are able to share the project's trading fees repectively based on the proportion of their
            votes. The voted MX token will be unlocked after the voting campaign completes, and will not be burnt.
          </p>
        )}

        <div className={styles.info}>
          <div className={styles.item}>
            <p>
              {formatMessage({ id: 'common.balance' })}
              <span>{mxAvailable} MX</span>
              {/* <Link to="/uassets/balances">{formatMessage({ id: 'assets.balances.recharge' })}</Link> */}
              <a onClick={() => gotoCrossPlatformUrl('assetspage', '/uassets/balances')}>
                {formatMessage({ id: 'assets.balances.recharge' })}
              </a>
            </p>
            <p className={styles.scale}>
              1MX ={' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: formatMessage({ id: 'voting.coin_item.number_html' }, { num: 1 })
                }}
              />
            </p>
          </div>
          <div className={styles.item}>
            <p>
              {formatMessage({ id: 'voting.support.num.remain' })}
              <span>{remain}</span>
            </p>
            {/*<p>{formatMessage({ id: 'voting.support.num.available' })}<span>11222</span></p>*/}
          </div>

          <div className={styles.voting}>
            <InputItem
              type="number"
              value={inputNum}
              placeholder={formatMessage({ id: 'voting.support.num.placeholder' })}
              onChange={numInputChange}
              extra={
                <span className={styles.all} onClick={selectAll}>
                  {formatMessage({ id: 'fin.common.all' })}
                </span>
              }
            />
            <div className={styles.slider}>
              <RcSlider
                value={sliderValue}
                marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                onChange={sliderValueChange}
              />
            </div>
            <p className={styles.error}>{errorTip}</p>
          </div>
        </div>

        <div className={styles.submit}>
          <Button type="primary" disabled={!inputNum || (currentPhase && !currentPhase.phase.isVoting)} onClick={submitHandle}>
            <span>{currentPhase && currentPhase.phase.isVoting && formatMessage({ id: 'common.sure' })}</span>
            <span>{currentPhase && currentPhase.phase.isOnSchedual && formatMessage({ id: 'voting.index.tabs.begin' })}</span>
            <span>{currentPhase && currentPhase.phase.isOver && formatMessage({ id: 'labs.title.ended' })}</span>
          </Button>
        </div>
      </div>

      <SuccessModal showSuccessModal={showSuccessModal} setShowSuccessModal={setShowSuccessModal} id={match.params.id} />
    </>
  );
}

export default connect(({ global }) => ({ serverClientTimeDiff: global.serverClientTimeDiff }))(Index);
