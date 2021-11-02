import React, { useCallback, useEffect, useState } from 'react';
import ThemeOnly from '@/components/ThemeOnly';
import { Link } from 'umi';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi/locale';
import { getAssetBalance, forkConversion, forkConversionReverse } from '@/services/api';
import { connect } from 'dva';
import { gotoLogin, numberToString } from '@/utils';
import { InputItem, Tabs, Button, Toast } from 'antd-mobile';
import TopBar from '@/components/TopBar';

import styles from './index.less';

const reg = new RegExp(`^\\d+\\.?\\d{0,8}$`);
const language = getLocale();

function Container({ markets, user }) {
  const [balances, setBalances] = useState(null);
  const [refreshBalances, setRefreshBalances] = useState(false);
  // 登录后获取余额
  useEffect(() => {
    if (user && user.id) {
      getAssetBalance({ currency: 'BCH,BCHA,BCHN' }).then(result => {
        if (result && result.code === 0) {
          // result.balances.BCH.available = 0.00000001;
          // result.balances.BCHA.available = 0.00000001;
          // result.balances.BCHN.available = 0.00000001;
          setBalances(result.balances || {});
        }
      });
    }
  }, [refreshBalances, user]);

  const [trades, setTrades] = useState(null);
  useEffect(() => {
    if (markets) {
      const allTradeList = [];

      for (const i in markets) {
        const marketTradeList = markets[i] && markets[i].list ? markets[i].list : [];

        allTradeList.push(...marketTradeList);
      }

      setTrades({
        BCH: allTradeList.find(trade => trade.currency === 'BCH' && trade.market === 'USDT'),
        BCHA: allTradeList.find(trade => trade.currency === 'BCHA' && trade.market === 'USDT'),
        BCHN: allTradeList.find(trade => trade.currency === 'BCHN' && trade.market === 'USDT')
      });
    }
  }, [markets]);

  // BCH兑换BCHA、BCHN输入
  const [conversionValue, setConversionValue] = useState(undefined);
  const conversionValueChangeHandle = useCallback(
    value => {
      if (value) {
        const valueNum = Number(value);
        if (reg.test(value)) {
          if (balances && balances.BCH) {
            setConversionValue(valueNum <= balances.BCH.available ? value : numberToString(balances.BCH.available));
          }
        }
      } else {
        setConversionValue(undefined);
      }
    },
    [balances]
  );

  // BCHA、BCHN兑换BCH输入
  const [conversionReverseValue, setConversionReverseValue] = useState(undefined);
  const conversionReverseValueChangeHandle = useCallback(
    value => {
      if (value) {
        const valueNum = Number(value);
        if (reg.test(value)) {
          if (balances && balances.BCHA && balances.BCHN) {
            const maxNum = Math.min(balances.BCHA.available, balances.BCHN.available);
            setConversionReverseValue(valueNum <= maxNum ? value : numberToString(maxNum));
          }
        }
      } else {
        setConversionReverseValue(undefined);
      }
    },
    [balances]
  );

  // 兑换方法
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionReverseLoading, setConversionReverseLoading] = useState(false);
  const conversionHandle = useCallback(
    (type = 'forward') => {
      if (user && user.id) {
        if (type === 'forward') {
          setConversionLoading(true);
          forkConversion({ amount: conversionValue }).then(result => {
            if (result && result.code === 0) {
              setRefreshBalances(!refreshBalances);
              setConversionValue(undefined);
              Toast.success(formatMessage({ id: 'fork.conversion.success' }));
            }

            setConversionLoading(false);
          });
        }

        if (type === 'reverse') {
          setConversionReverseLoading(true);
          forkConversionReverse({ amount: conversionReverseValue }).then(result => {
            if (result && result.code === 0) {
              setRefreshBalances(!refreshBalances);
              setConversionReverseValue(undefined);
              Toast.success(formatMessage({ id: 'fork.conversion.success' }));
            }

            setConversionReverseLoading(false);
          });
        }
      } else {
        gotoLogin();
      }
    },
    [user, refreshBalances, conversionValue, conversionReverseValue]
  );

  const [currentTab, setCurrentTab] = useState(0);

  return (
    <ThemeOnly theme="light">
      <TopBar>{formatMessage({ id: 'fork.conversion.header' })}</TopBar>

      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3 className={styles.title}>{formatMessage({ id: 'fork.conversion.title' })}</h3>
          <p className={styles.tip}>{formatMessage({ id: 'fork.conversion.tip' })}</p>
          <a
            className={styles.rule}
            href={language.startsWith('zh-') ? `${HC_PATH}/hc/zh-cn/articles/360051740751` : `${HC_PATH}/hc/en-001/articles/360051740791`}
          >
            {formatMessage({ id: 'fork.conversion.info.btn' })}
            <i className="iconfont iconjinru" />
          </a>
        </div>

        <div className={styles.content}>
          <Tabs
            swipeable={false}
            tabs={[
              { title: formatMessage({ id: 'fork.conversion.title2' }) },
              { title: formatMessage({ id: 'swap.information.problem' }) }
            ]}
            page={currentTab}
            renderTabBar={props => {
              return (
                <div className={styles['custom-tab-bar']}>
                  {props.tabs.map((tab, index) => {
                    return (
                      <div
                        className={classNames(styles['custom-tab'], { [styles.active]: index === currentTab })}
                        onClick={() => setCurrentTab(index)}
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
                <div className={styles['conversion-title']}>
                  <h4>{formatMessage({ id: 'header.asset' })}</h4>
                  <Link to="/activity/fork-conversion/record">{formatMessage({ id: 'fork.conversion.record.link' })}>></Link>
                </div>

                <div className={styles['balance-wrapper']}>
                  <div className={styles.balance}>
                    <div className={styles.title}>{formatMessage({ id: 'assets.coin' })}</div>
                    <div className={styles.value}>BCH</div>
                    <div className={styles.value}>BCHA</div>
                    <div className={styles.value}>BCHN</div>
                  </div>

                  <div className={styles.balance}>
                    <div className={styles.title}>{formatMessage({ id: 'assets.balances.Useable' })}</div>

                    <div className={styles.value}>{balances && balances.BCH ? numberToString(balances.BCH.available) : '--'}</div>

                    <div className={styles.value}>{balances && balances.BCHA ? numberToString(balances.BCHA.available) : '--'}</div>

                    <div className={styles.value}>{balances && balances.BCHN ? numberToString(balances.BCHN.available) : '--'}</div>
                  </div>

                  <div className={styles.balance}>
                    <div className={styles.title}>{formatMessage({ id: 'fork.conversion.price.now' })}</div>
                    <div className={styles.value}>{trades && trades.BCH ? trades.BCH.c : '--'}</div>

                    <div className={styles.value}>{trades && trades.BCHA ? trades.BCHA.c : '--'}</div>

                    <div className={styles.value}>{trades && trades.BCHN ? trades.BCHN.c : '--'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles['conversion-wrapper']}>
                  <div className={styles.conversion}>
                    <h4 className={styles.title}>{formatMessage({ id: 'fork.conversion.btn.submit' })}</h4>

                    <div className={styles.input}>
                      <span className={styles.label}>{formatMessage({ id: 'fork.conversion.input.use' })}</span>
                      <InputItem value={conversionValue} onChange={conversionValueChangeHandle} placeholder={0} extra="BCH">
                        <>
                          {formatMessage({ id: 'assets.treaty.history.number' })}
                          <span className={styles.divide}></span>
                        </>
                      </InputItem>
                    </div>

                    <p className={styles['input-balance']}>
                      {formatMessage({ id: 'fork.conversion.bch.balance' })}
                      <span>{balances && balances.BCH ? numberToString(balances.BCH.available) : '--'}</span>
                    </p>

                    <p
                      className={styles.ratio}
                      dangerouslySetInnerHTML={{
                        __html: formatMessage({ id: 'fork.conversion.ratio' }, { num1: conversionValue || 0, num2: conversionValue || 0 })
                      }}
                    />

                    <div className={styles.handle}>
                      <Button
                        type="primary"
                        block={true}
                        disabled={!conversionValue && user && user.id}
                        loading={conversionLoading}
                        onClick={() => conversionHandle('forward')}
                      >
                        {user && user.id ? formatMessage({ id: 'fork.conversion.btn.submit' }) : formatMessage({ id: 'auth.signIn' })}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles['conversion-wrapper']}>
                  <div className={styles.conversion}>
                    <h4 className={styles.title}>{formatMessage({ id: 'fork.conversion.btn.submit.reverse' })}</h4>

                    <div className={styles.input}>
                      <span className={styles.label}>{formatMessage({ id: 'fork.conversion.label' })}</span>
                      <InputItem value={conversionReverseValue} onChange={conversionReverseValueChangeHandle} placeholder={0} extra="BCH">
                        <>
                          {formatMessage({ id: 'assets.treaty.history.number' })}
                          <span className={styles.divide}></span>
                        </>
                      </InputItem>
                    </div>

                    <p className={styles['input-balance']}>
                      {formatMessage({ id: 'fork.conversion.bch' })}
                      <span>
                        {balances && balances.BCHA && balances.BCHN
                          ? numberToString(Math.min(balances.BCHA.available, balances.BCHN.available))
                          : '--'}
                      </span>
                    </p>

                    <p
                      className={styles.ratio}
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(
                          { id: 'fork.conversion.ratio.reverse' },
                          { num1: conversionReverseValue || 0, num2: conversionReverseValue || 0 }
                        )
                      }}
                    />

                    <div className={styles.handle}>
                      <Button
                        type="primary"
                        block={true}
                        disabled={!conversionReverseValue && user && user.id}
                        loading={conversionReverseLoading}
                        onClick={() => conversionHandle('reverse')}
                      >
                        {user && user.id
                          ? formatMessage({ id: 'fork.conversion.btn.submit.reverse' })
                          : formatMessage({ id: 'auth.signIn' })}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={classNames(styles['step-wrapper'], styles.item)}>
                <div className={classNames(styles.step, styles.step1)}>
                  <h5 className={styles.title}>
                    <span className={styles.icon} />
                    {formatMessage({ id: 'fork.conversion.step.1.title' })}
                  </h5>
                  <p className={styles.desc}>{formatMessage({ id: 'fork.conversion.step.1.desc' })}</p>
                </div>

                <div className={classNames(styles.step, styles.step2)}>
                  <h5 className={styles.title}>
                    <span className={styles.icon} />
                    {formatMessage({ id: 'fork.conversion.step.2.title' })}
                  </h5>
                  <p className={styles.desc}>{formatMessage({ id: 'fork.conversion.step.2.desc' })}</p>
                </div>

                <div className={classNames(styles.step, styles.step3)}>
                  <h5 className={styles.title}>
                    <span className={styles.icon} />
                    {formatMessage({ id: 'fork.conversion.step.3.title' })}
                  </h5>
                  <p className={styles.desc}>{formatMessage({ id: 'fork.conversion.step.3.desc' })}</p>
                </div>

                <div className={classNames(styles.step, styles.step4)}>
                  <h5 className={styles.title}>
                    <span className={styles.icon} />
                    {formatMessage({ id: 'fork.conversion.step.4.title' })}
                  </h5>
                  <p className={styles.desc}>{formatMessage({ id: 'fork.conversion.step.4.desc' })}</p>
                </div>
              </div>

              <div className={classNames(styles.item, styles['question-wrapper'])}>
                <h4 className={styles.title}>{formatMessage({ id: 'swap.information.problem' })}</h4>

                <div className={styles.section}>
                  <h5 className={styles.question}>{formatMessage({ id: 'fork.conversion.question.1' })}</h5>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.1' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.1.2' })}</p>
                </div>

                <div className={styles.section}>
                  <h5 className={styles.question}>{formatMessage({ id: 'fork.conversion.question.2' })}</h5>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.2' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.2.2' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.2.3' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.2.4' })}</p>
                </div>

                <div className={styles.section}>
                  <h5 className={styles.question}>{formatMessage({ id: 'fork.conversion.question.3' })}</h5>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.3.1' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.3.2' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.3.3' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.3.4' })}</p>
                  <p className={styles.answer}>{formatMessage({ id: 'fork.conversion.answer.3.5' })}</p>
                </div>
              </div>
            </div>
          </Tabs>
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
