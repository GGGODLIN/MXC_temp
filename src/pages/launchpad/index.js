import React, { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
// import ThemeOnly from '@/components/ThemeOnly';
import { Button } from 'antd-mobile';
import router from 'umi/router';
import { getLabsList } from '@/services/api';
import { connect } from 'dva';
import { formatMessage, getLocale } from 'umi/locale';
import { getSubSite, timeToString } from '@/utils';
import styles from './index.less';
import TimeBox from './TimeBox';
import Status from './Status';
import RiskModal from './RiskModal';
import History from './History';

const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const locale = getLocale();

function Container({ serverClientTimeDiff, user }) {
  const [list, setList] = useState([]);
  const [overdueList, setOverdueList] = useState([]);

  useEffect(() => {
    getList();
  }, []);

  const getList = zone => {
    const params = {
      zone: 'LAUNCHPAD'
    };

    getLabsList(params).then(res => {
      if (res?.data && res.code === 0) {
        const activeList = res.data.filter(item => item.status !== 'FINISHED');
        const overdueList = res.data.filter(item => item.status === 'FINISHED');
        const _overdueList = overdueList.sort((a, b) => b.startTime - a.startTime);

        setList(activeList);
        setOverdueList(_overdueList);
      }
    });
  };

  const getStatus = item => {
    const { startTime, endTime } = item;
    const currentTime = Date.now() + serverClientTimeDiff;
    const s = currentTime < startTime ? 0 : currentTime < endTime ? 1 : 2;
    return s;
  };

  const getLink = info => {
    const { remark } = info;
    const hrefs = remark.includes('__') ? remark.split('__') : [];

    return locale.startsWith('zh') ? hrefs[0] || '' : hrefs[1] || '';
  };

  return (
    <>
      <div className={styles.wrapper}>
        <TopBar>Launchpad</TopBar>
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{formatMessage({ id: 'mc_launchpads_banner_title' })}</h3>
            <p className={styles.desc}>{formatMessage({ id: 'mc_launchpads_banner_desc' })}</p>
          </div>
        </section>
        <section className={styles.content}>
          <div className={styles.info}>
            <h4 className={styles.infoTitle}>{formatMessage({ id: 'mc_launchpads_top_title' })}</h4>
            <p className={styles.infoDesc}>{formatMessage({ id: 'mc_launchpads_top_desc' })}</p>
          </div>
        </section>
        <div className={styles.main}>
          {list.map(item => (
            <div className={styles.item} key={item.pid}>
              <div className={styles.pic}>
                <img src={`${MAIN_SITE_API_PATH}/file/download/${item.projectUrl}`} alt="" />
              </div>
              <div className={styles.desc}>
                <div className={styles.title}>
                  <h3>{locale === 'zh-CN' ? item.pname : item.pnameEn}</h3>
                  <Status info={item} status={getStatus(item)} />
                </div>
                <div className={styles.text}>{locale === 'zh-CN' ? item.description : item.descriptionEn}</div>
                <div className={styles.sku}>
                  <span>{formatMessage({ id: 'labs.title.issue_num' })}</span>
                  <span>
                    {item.issueNum ? item.issueNum : '--'} {item.issueCurrency}
                  </span>
                </div>
                <div className={styles.sku}>
                  <span>{formatMessage({ id: 'fin.common.start_time' })}</span>
                  <span>{timeToString(item.startTime)}</span>
                </div>
              </div>
              <TimeBox
                info={item}
                status={getStatus(item)}
                serverClientTimeDiff={serverClientTimeDiff}
                timeoutCallback={getList}
                size="small"
                type="home"
              />
              <div className={styles.btnWrap}>
                <Button type="primary" onClick={e => router.push(`/launchpad/detail/${item.pid}`)}>
                  {formatMessage({ id: 'mc_launchpads_feature_item1' })}
                </Button>
                {/* <Button type="ghost">{formatMessage({ id: 'mc_launchpads_feature_item2' })}</Button> */}
                {/* <Button type="ghost">{formatMessage({ id: 'mc_launchpads_feature_item3' })}</Button> */}
              </div>
              <div className={styles.link}>
                <a href={getLink(item)}>{formatMessage({ id: 'mc_launchpads_top_link' })}</a>
                <i></i>
              </div>
            </div>
          ))}
        </div>
        <History data={overdueList} />
      </div>
      <RiskModal />
    </>
  );
}
export default connect(({ global, auth }) => ({
  serverClientTimeDiff: global.serverClientTimeDiff,
  user: auth.user
}))(Container);
