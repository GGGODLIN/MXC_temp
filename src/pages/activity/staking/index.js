import React, { useCallback, useEffect, useState } from 'react';
import ThemeOnly from '@/components/ThemeOnly';
import { Link, router } from 'umi';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi/locale';
import { getAssetBalance, stakingConversion } from '@/services/api';
import { connect } from 'dva';
import { numberToString, gotoAppPlatformUrl, delQueStr } from '@/utils';
import { InputItem, Tabs, Button, Toast } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import { Base64 } from 'js-base64';
import questionExampleImg from '@/assets/img/activity/staking/question-example.png';
import styles from './index.less';

const reg = new RegExp(`^\\d+\\.?\\d{0,8}$`);
const language = getLocale();
const isApp = window.localStorage.getItem('mxc.view.from') === 'app';

function Container({ markets, user }) {
  const [balances, setBalances] = useState(null);
  const [refreshBalances, setRefreshBalances] = useState(false);
  // 登录后获取余额
  useEffect(() => {
    if (user && user.id) {
      getAssetBalance({ currency: 'ETH,BETH' }).then(result => {
        if (result && result.code === 0) {
          // result.balances.ETH.available = 0.00000001;
          // result.balances.BETH.available = 0.00000001;
          setBalances(result.balances || {});
        }
      });
    }
  }, [refreshBalances, user]);

  // const [trades, setTrades] = useState(null);
  // useEffect(() => {
  //   if (markets) {
  //     const allTradeList = [];
  //
  //     for (const i in markets) {
  //       const marketTradeList = markets[i] && markets[i].list ? markets[i].list : [];
  //
  //       allTradeList.push(...marketTradeList);
  //     }
  //
  //     setTrades({
  //       ETH: allTradeList.find(trade => trade.currency === 'ETH' && trade.market === 'USDT'),
  //       BETH: allTradeList.find(trade => trade.currency === 'BETH' && trade.market === 'USDT'),
  //     });
  //   }
  // }, [markets]);

  // ETH兑换BETH输入
  const [conversionValue, setConversionValue] = useState(undefined);
  const conversionValueChangeHandle = useCallback(
    value => {
      if (value) {
        const valueNum = Number(value);
        if (reg.test(value)) {
          if (balances && balances.ETH) {
            setConversionValue(valueNum <= balances.ETH.available ? value : numberToString(balances.ETH.available));
          }
        }
      } else {
        setConversionValue(undefined);
      }
    },
    [balances]
  );

  // 全部输入
  const conversionValueAllHandle = useCallback(() => {
    if (balances && balances.ETH) {
      setConversionValue(numberToString(balances.ETH.available));
    }
  }, [balances]);

  // 兑换方法
  const [conversionLoading, setConversionLoading] = useState(false);
  const conversionHandle = useCallback(() => {
    if (user && user.id) {
      setConversionLoading(true);
      stakingConversion({ from: 'ETH', to: 'BETH', amount: conversionValue }).then(result => {
        if (result && result.code === 0) {
          setRefreshBalances(!refreshBalances);
          setConversionValue(undefined);
          Toast.success(formatMessage({ id: 'fork.conversion.success' }));
        }

        setConversionLoading(false);
      });
    } else {
      const { href } = window.location;
      let newUrl = delQueStr(href, 'apptoken');
      gotoAppPlatformUrl(Base64.encode(newUrl), formatMessage({ id: 'staking.title' }));
    }
  }, [user, refreshBalances, conversionValue]);

  const [currentTab, setCurrentTab] = useState(0);

  const posHandle = useCallback(() => {
    if (isApp) {
      // window.location.href = 'mxcappscheme://pospool?postType=HOLD&poolId=e6e4fa95a47c4da4bb5a8e9e152aafbb';
      router.push(`/pos/detail/e6e4fa95a47c4da4bb5a8e9e152aafbb`);
    } else {
      router.push(`/pos/list`);
    }
  }, []);

  const tradeHandle = useCallback(() => {
    if (isApp) {
      window.location.href = 'mxcappscheme://polka?trade_pair=BETH_USDT';
    } else {
      router.push(`/trade/spot#BETH_USDT`);
    }
  }, []);

  return (
    <ThemeOnly theme="light">
      <TopBar>{formatMessage({ id: 'staking.title' })}</TopBar>

      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3 className={classNames(styles.title, { [styles['en']]: !language.startsWith('zh-') })}>
            {formatMessage({ id: 'staking.title' })}
          </h3>
          <p className={styles.tip}>
            {formatMessage({ id: 'staking.tip' })}
            <Link to="/activity/eth-staking/record">{formatMessage({ id: 'staking.staking.record' })}></Link>
          </p>

          <div className={styles.rule}>
            <p className={styles['rule-title']}>{formatMessage({ id: 'staking.rule.title' })}</p>
            <p className={styles['rule-text']}>{formatMessage({ id: 'staking.rule.text.1' })}</p>
            <p className={styles['rule-text']}>{formatMessage({ id: 'staking.rule.text.2' })}</p>
            <p className={styles['rule-text']}>{formatMessage({ id: 'staking.rule.text.3' })}</p>
          </div>
        </div>

        <div className={styles.balance}>
          <div className={styles['balance-item']}>
            <p className={styles['balance-key']}>{formatMessage({ id: 'staking.balance.eth.available' })}</p>
            <p className={styles['balance-value']}>{balances && balances.ETH ? numberToString(balances.ETH.available) : '--'} ETH</p>
          </div>
          <div className={styles['balance-item']}>
            <p className={styles['balance-key']}>{formatMessage({ id: 'staking.balance.beth.available' })}</p>
            <p className={styles['balance-value']}>{balances && balances.BETH ? numberToString(balances.BETH.available) : '--'} BETH</p>
          </div>
        </div>

        <div className={styles.content}>
          <Tabs
            animated={false}
            swipeable={false}
            tabs={[{ title: formatMessage({ id: 'staking.staking.title' }) }, { title: formatMessage({ id: 'staking.step.title' }) }]}
            page={currentTab}
            renderTabBar={props => {
              return (
                <div className={styles['custom-tab-bar']}>
                  {props.tabs.map((tab, index) => {
                    return (
                      <div
                        className={classNames(styles['custom-tab'], { [styles.active]: index === currentTab })}
                        onClick={() => setCurrentTab(index)}
                        key={index}
                      >
                        {tab.title}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          >
            <div>
              <div className={styles.item}>
                <h4 className={styles.title}>{formatMessage({ id: 'staking.staking.title' })}</h4>

                <div className={styles.input}>
                  <InputItem
                    extra={
                      <>
                        ETH
                        <span className={styles.all} onClick={conversionValueAllHandle}>
                          {formatMessage({ id: 'fin.common.all' })}
                        </span>
                      </>
                    }
                    value={conversionValue}
                    onChange={conversionValueChangeHandle}
                    placeholder={formatMessage({ id: 'assets.treaty.history.number' })}
                  />
                </div>

                <p className={styles['input-balance']}>
                  {formatMessage({ id: 'staking.balance.eth.available' })}
                  <span>{balances && balances.ETH ? numberToString(balances.ETH.available) : '--'}</span>
                  ETH
                </p>

                <div className={styles['conversion']}>
                  <div className={styles.num}>
                    {formatMessage({ id: 'staking.staking.beth' })}:<span>{numberToString(conversionValue || 0)} BETH</span>
                  </div>

                  <div className={styles.rate}>
                    {formatMessage({ id: 'staking.staking.rate' })}:<span>1:1</span>
                  </div>
                </div>

                <div className={styles.handle}>
                  <Button
                    size="large"
                    type="primary"
                    disabled={(!conversionValue || conversionValue < 0.1) && user && user.id}
                    loading={conversionLoading}
                    onClick={() => conversionHandle()}
                  >
                    {user && user.id ? formatMessage({ id: 'staking.staking.btn' }) : formatMessage({ id: 'auth.signIn' })}
                  </Button>
                </div>

                <p className={styles.warning}>{formatMessage({ id: 'staking.staking.warning' })}</p>
              </div>
            </div>

            <div>
              <div className={styles['step-wrapper']}>
                <div className={classNames(styles.step, styles.step1)}>
                  <h4 className={styles.title}>
                    <span className={styles.icon} />
                    {formatMessage({ id: 'staking.step.title.1' })}
                  </h4>

                  <p className={styles.desc}>{formatMessage({ id: 'staking.step.desc.1' })}</p>
                </div>

                <div className={classNames(styles.step, styles.step2)}>
                  <div className={styles['top-wrapper']}>
                    <h4 className={styles.title}>
                      <span className={styles.icon} />
                      {formatMessage({ id: 'staking.step.title.2' })}
                    </h4>

                    <Button type="primary" inline className={'am-button-circle'} onClick={tradeHandle}>
                      {formatMessage({ id: 'assets.trans.goTrade' })}
                      <span className={styles.circle} />
                    </Button>
                  </div>

                  <p className={styles.desc}>{formatMessage({ id: 'staking.step.desc.2' })}</p>
                </div>

                <div className={classNames(styles.step, styles.step3)}>
                  <div className={styles['top-wrapper']}>
                    <h4 className={styles.title}>
                      <span className={styles.icon} />
                      {formatMessage({ id: 'staking.step.title.3' })}
                    </h4>

                    <Button type="primary" inline className={'am-button-circle'} onClick={posHandle}>
                      {formatMessage({ id: 'staking.step.go.3' })}
                      <span className={styles.circle} />
                    </Button>
                  </div>

                  <p className={styles.desc}>{formatMessage({ id: 'staking.step.desc.3' })}</p>
                </div>
              </div>
            </div>
          </Tabs>

          <div className={styles['question-wrapper']}>
            <h4 className={styles.title}>{formatMessage({ id: 'swap.information.problem' })}</h4>
            <div className={styles.section}>
              <h5 className={styles.question}>{formatMessage({ id: 'staking.faq.question.1' })}</h5>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.1' })}</p>
            </div>

            <div className={styles.section}>
              <h5 className={styles.question}>{formatMessage({ id: 'staking.faq.question.2' })}</h5>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.1' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.2' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.3' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.4' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.5' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.6' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.7' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.8' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.9' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.10' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.11' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.12' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.13' })}</p>
              <div className={styles['question-example']}>
                <img src={questionExampleImg} />
              </div>
              <p className={classNames(styles.answer, styles['question-example-tip'])}>
                {formatMessage({ id: 'staking.faq.answer.2.14' })}
              </p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.2.15' })}</p>
            </div>

            <div className={styles.section}>
              <h5 className={styles.question}>{formatMessage({ id: 'staking.faq.question.3' })}</h5>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.3.1' })}</p>
              <p className={styles.answer}>{formatMessage({ id: 'staking.faq.answer.3.2' })}</p>
            </div>
          </div>
        </div>
      </div>
    </ThemeOnly>
  );
}

function mapStateToProps({ trading, auth }) {
  return {
    markets: trading.markets,
    user: auth.user
  };
}

export default connect(mapStateToProps)(Container);
