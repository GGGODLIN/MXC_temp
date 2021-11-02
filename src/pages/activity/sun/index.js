import React, { useEffect, useState } from 'react';
import Link from 'umi/link';
import TopBar from '@/components/TopBar';
import ThemeOnly from '@/components/ThemeOnly';
import cn from 'classnames';
import { Button } from 'antd-mobile';
import { sunshineList } from '@/services/api';
import { connect } from 'dva';
import Empty from '@/components/Empty';
import { formatMessage, getLocale } from 'umi/locale';
import { getSubSite, timeToString, getPercent, gotoLogin } from '@/utils';
import styles from './index.less';
import router from 'umi/router';
import TipModal from './tipModal';
const language = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function Container({ serverClientTimeDiff, user }) {
  const [currentPhase, setCurrentPhase] = useState([]);
  const getDataList = () => {
    sunshineList().then(result => {
      if (result?.code === 0 && result.data) {
        const currentPhase = result.data;
        if (currentPhase) {
          const now = serverClientTimeDiff + Date.now();
          currentPhase.forEach((element, idnex) => {
            element.ended = now > element.endTime;
            element.started = element.startTime <= now && now <= element.endTime;
          });
        }
        setCurrentPhase(currentPhase);
      }
    });
  };

  useEffect(() => {
    getDataList();
  }, []);

  const jumpHref = language.startsWith('zh') ? `${HC_PATH}/hc/zh-cn/articles/4404916154521` : `${HC_PATH}/hc/en-001/articles/4404916192281`;

  const handleHref = id => {
    if (!user) {
      gotoLogin();
    } else {
      router.push(`/activity/sun/detail/${id}`);
    }
  };
  const handleRecord = () => {
    router.push('/activity/sun/record');
  };
  return (
    <ThemeOnly theme="light">
      <div className={styles.wrapper}>
        <TopBar>{formatMessage({ id: 'mc_sun_head_title' })}</TopBar>
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{formatMessage({ id: 'mc_sun_head_banner_title' })}</h3>
            <p className={styles.desc}>{formatMessage({ id: 'mc_sun_head_banner_desc' })}</p>
          </div>
        </section>
        <section className={styles.content}>
          <div className={styles.info}>
            <h4 className={styles.infoTitle}>{formatMessage({ id: 'mc_sun_top_title' })}</h4>
            <p className={styles.infoDesc}>{formatMessage({ id: 'mc_sun_top_desc' })}</p>
            <a href={jumpHref} rel="nofollow noopener noreferrer" target="_blank" className={styles.infoTip}>
              {formatMessage({ id: 'mc_sun_top_link' })}
            </a>
          </div>

          <div className={styles.list}>
            <div className={styles.listHeader}>
              <h4 className={styles.listPhase}>{formatMessage({ id: 'mc_sun_list_title' })}</h4>
              <span onClick={() => (user && user.id ? handleRecord() : gotoLogin())} className={styles.listMine}>
                {formatMessage({ id: 'act.Commission.record' })}
              </span>
            </div>

            {currentPhase &&
              currentPhase.length > 0 &&
              currentPhase.map(item => (
                <div className={styles.listItem} key={item.id}>
                  <div className={cn(styles.itemHeader, styles.fontBlack)}>
                    <div className={styles.itemHeaderLeft}>
                      {item.profitCurrencyIcon && (
                        <img
                          src={`${MAIN_SITE_API_PATH}/file/download/${item.profitCurrencyIcon}`}
                          alt="icon"
                          className={styles.currencyIcon}
                        />
                      )}
                      <div>
                        <span className={styles.currencyName}>{item.profitCurrency}</span>
                        <p className={styles.normalSize}>{item.profitCurrencyFullName}</p>
                      </div>
                    </div>
                    <div className={styles.itemHeaderRight}>
                      <span className={styles.totalSize}>{item.totalSupply}</span>
                      <p className={cn(styles.normalSize, styles.rightAlign)}>
                        {formatMessage({ id: 'mc_sun_list_total' }, { coin: item.profitCurrency })}
                      </p>
                    </div>
                  </div>
                  <div className={cn(styles.itemInfo, styles.fontBlack)}>
                    <div className={styles.flexBetween}>
                      <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_number_total' })}</span>
                      <span>
                        {item.currentVoteQuantity} {item.currency}
                      </span>
                    </div>
                    <div className={styles.flexBetween}>
                      <div>
                        <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_target' })}</span>
                        <TipModal text={formatMessage({ id: 'mc_sun_list_target_tip' })} />
                      </div>
                      <span>{getPercent(item.targetVote, false) || '--'}</span>
                    </div>
                    <div className={styles.flexBetween}>
                      <div>
                        <span className={styles.descLabel}>{formatMessage({ id: 'mc_sun_list_current' })}</span>
                        <TipModal text={formatMessage({ id: 'mc_sun_list_current_tip' })} />
                      </div>
                      <span className={styles.currentNum}>{getPercent(item.currentVote, false) || '--'}</span>
                    </div>
                  </div>
                  <div>
                    {Object.keys(user).length === 0 && (
                      <Button size="large" className={styles.btnJoin} type="primary" onClick={() => gotoLogin()}>
                        {formatMessage({ id: 'auth.signIn' })}
                      </Button>
                    )}
                    {user && user.id && item.started && (
                      <Button className={styles.btnJoin} onClick={() => handleHref(item.id)} type="primary">
                        {formatMessage({ id: 'mc_sun_list_join' })}
                      </Button>
                    )}
                    {user && user.id && item.ended && (
                      <Button size="large" className={styles.btnJoin} type="primary" disabled>
                        {formatMessage({ id: 'labs.title.ended' })}
                      </Button>
                    )}
                    <div className={styles.bottomTime}>
                      <i className={cn('iconfont iconic_time', styles.iconTime)}></i>
                      {timeToString(item.startTime, 'MM-DD HH:mm')} - {timeToString(item.endTime, 'MM-DD HH:mm')}
                    </div>
                  </div>
                </div>
              ))}

            {currentPhase && currentPhase.length === 0 && (
              <Empty className={styles.speBgColor} title={formatMessage({ id: 'home.title.swap_tip' })} initialTheme="light" />
            )}
          </div>
        </section>
      </div>
    </ThemeOnly>
  );
}
export default connect(({ global, auth }) => ({
  serverClientTimeDiff: global.serverClientTimeDiff,
  user: auth.user
}))(Container);
