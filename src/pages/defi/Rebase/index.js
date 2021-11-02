import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import TopBar from '@/components/TopBar';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import styles from './index.less';
import PopularCurrency from '../rebaseCurrency';
import classNames from 'classnames';
const Deif = ({ rebaseCurrency }) => {
  const introduceRef = useRef(null);
  const [introduceType, setIntroduceType] = useState(false);
  return (
    <div className={styles.ecologyContent}>
      <TopBar>{formatMessage({ id: 'ecology.rebase.title' })}</TopBar>
      <div className={styles.headerBg}>
        <div className={styles.title}> {formatMessage({ id: 'ecology.rebase.title' })}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.infoContent}>
          <div className={styles.introduction}>
            <div className={styles.info} className={classNames(introduceType === true ? styles.infoOpen : styles.info)} ref={introduceRef}>
              <p
                dangerouslySetInnerHTML={{
                  __html: formatMessage({ id: 'ecology.rebase.introduce' })
                }}
              ></p>
              <div
                className={classNames(introduceType === true ? styles.closeBtn : styles.openBtn)}
                onClick={() => {
                  setIntroduceType(!introduceType);
                }}
              >
                {introduceType === true ? (
                  <div>
                    <span>
                      {' '}
                      {formatMessage({ id: 'ecology.function.PackUp' })}
                      <div className={styles.close}></div>
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className={styles.point}></span>
                    <span>
                      {formatMessage({ id: 'ecology.function.open' })}
                      <div className={styles.open}></div>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <PopularCurrency title={formatMessage({ id: 'ecology.etfZone.hot' })} type="rebase" list={rebaseCurrency} />
        <div className={styles.footerContent}>
          <div className={styles.footerIntroduce}>
            <div className={styles.footerTitle}>{formatMessage({ id: 'ecology.rebaseFooter.title' })}</div>
            <div className={styles.introduce}>{formatMessage({ id: 'ecology.rebaseFooter.introduce' })}</div>
          </div>
          <div className={styles.footerIntroduce}>
            <div className={styles.footerTitle}>{formatMessage({ id: 'ecology.rebaseFootertwo.title' })}</div>
            <div className={styles.introduce}>{formatMessage({ id: 'ecology.rebaseFootertwo.introduce' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(({ auth, trading, etfIndex, defi }) => ({
  user: auth.user,
  markets: trading.originMarkets,
  netValues: etfIndex.netValues,
  rebaseCurrency: defi.rebaseCurrency,
  coinList: etfIndex.coinList
}))(Deif);
