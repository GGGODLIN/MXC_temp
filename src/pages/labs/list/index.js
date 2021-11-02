import { useState, useEffect } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { getLabsList } from '@/services/api';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { Tabs, Modal, Checkbox, Button } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import { timeToString, getSubSite } from '@/utils';
import { PullToRefresh } from 'antd-mobile';
import moment from 'moment';

import styles from './index.less';
import Status from '../components/Status';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

const tab = [
  { title: formatMessage({ id: 'labs.title.tab-normal' }), sub: 'NORMAL', key: 'NORMAL' },
  { title: formatMessage({ id: 'labs.title.tab-5-discount' }), sub: 'DISCOUNT', key: 'DISCOUNT' }
];

const special = ['f303e6b2a7e941a8ac3741c995a4ca9e', '6f635bb90f014a68b11b62dbd941f1c3', '1afd46c5bd8147a290bbf70d82d49b7f'];

const locale = getLocale();

const amountText = {
  DRAW: 'labs.title.current_drawNum',
  NOW_DRAW: 'labs.title.current_drawNum',
  GRAB: 'labs.title.current_purchaseNum',
  BIDDING: 'labs.title.current_BiddingNum',
  APPLY: 'labs.title.current_BiddingNum',
  APPLY_SNAP: 'labs.title.current_BiddingNum'
};

const List = ({ timeDiff, theme }) => {
  const _tabKey = window.location.pathname.toLowerCase().includes('mday') ? 'MDAY' : 'SPACEM';
  const [list, setList] = useState([]);
  const [active, setActive] = useState('HALVE');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState(_tabKey);

  useEffect(() => {
    const _active = sessionStorage.getItem('mxc.labs.actice');
    getList(type);

    _active && setActive(_active);
  }, [type]);

  useEffect(() => {
    const tabKey = _tabKey || window.sessionStorage.getItem('mxc.activity.tabKey') || '';
    const timestamp = window.localStorage.getItem('labs.risk.timestamp');
    const day = moment(Number(timestamp)).get('date');

    if (!timestamp || day !== moment().get('date')) {
      setVisible(true);
    }
    setType(tabKey);
  }, []);

  const getList = zone => {
    const _zone = zone === 'SPACEM' ? '' : zone;

    getLabsList({ zone: _zone }).then(res => {
      if (res && res.code === 0) {
        const createList = res.data.sort((a, b) => b.createTime - a.createTime);
        createList.forEach(element => {
          if (!element.zone) element.zone = 'NORMAL';
        });
        const sortTemp = createList.filter(i => new Date().getTime() + timeDiff >= i.endTime);
        const _overdueList = sortTemp.filter(el => el.startTime === sortTemp[0].startTime);

        const _list = createList.filter(i => new Date().getTime() + timeDiff < i.endTime).concat(_overdueList);
        setList(_list);
      }
    });
  };

  const toDetail = item => {
    sessionStorage.setItem('mxc.labs.actice', active);
    router.push(`/halving/detail/${item.pid}/index`);
  };

  const filterList = () => {
    if (type === 'MDAY') {
      return list.filter(i => i.zone === type);
    } else {
      return list.filter(i => i.zone === active);
    }
  };

  const changeHandle = e => {
    const checked = e.target.checked;

    if (checked) {
      const timestamp = moment().format('x');

      window.localStorage.setItem('labs.risk.timestamp', timestamp);
    } else {
      window.localStorage.removeItem('labs.risk.timestamp');
    }
  };

  const tabChangeDandle = key => {
    setType(key);
    window.sessionStorage.setItem('mxc.activity.tabKey', key);
  };

  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';

  const waiting = (
    <div className={`${styles.listItem} ${styles.waiting} ${styles[theme]}`}>
      <p>{formatMessage({ id: 'home.title.swap_tip' })}</p>
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      <Checkbox onChange={changeHandle}>{formatMessage({ id: 'labs.risk.check_text' })}</Checkbox>
      <Button type="primary" onClick={() => setVisible(false)}>
        {formatMessage({ id: 'layout.top.title.i_know' })}
      </Button>
    </div>
  );

  return (
    <div className={styles.list}>
      <TopBar>{formatMessage({ id: 'home.activity.title' })}</TopBar>
      <div className={styles.title}>
        {/* <span className={classNames({ [styles.active]: type === 'SPACEM' })} onClick={() => tabChangeDandle('SPACEM')}>
          SpaceM
        </span> */}
        <span className={classNames({ [styles.active]: type === 'MDAY' })} onClick={() => tabChangeDandle('MDAY')}>
          M-Day
        </span>
      </div>
      {/* <Tabs
        tabs={tab}
        initialPage={active}
        page={active}
        onTabClick={tab => {
          setActive(tab.sub);
        }}
        tabBarBackgroundColor={'transparent'}
      ></Tabs> */}
      <div className={styles.listBox}>
        {active === 'HALVE' && (
          <PullToRefresh
            onRefresh={() => {
              getList(type);
            }}
            className={`${styles.listScroll} ${styles[isApp]}`}
            damping={100}
            distanceToRefresh={50}
          >
            {filterList().length > 0
              ? filterList().map(item => (
                  <div key={item.pid} className={styles.listItem} onClick={() => toDetail(item)}>
                    <div
                      className={styles.listImg}
                      style={{ backgroundImage: `url(${MAIN_SITE_API_PATH}/file/download/${item.projectUrl})` }}
                    ></div>
                    <div className={styles.bottom}>
                      <div className={styles.bottomText}>
                        <h4>{locale === 'zh-CN' ? item.pname : item.pnameEn}</h4>
                        <p>{locale === 'zh-CN' ? item.description : item.descriptionEn}</p>
                      </div>
                      <div>
                        {!special.some(i => i === item.pid) && (
                          <div className={styles.timeItem}>
                            <span>{formatMessage({ id: amountText[item.type] })} </span>
                            <b>
                              {item.purchaseNum} {item.type === 'BIDDING' ? formatMessage({ id: 'labs.title.share' }) : item.issueCurrency}
                            </b>
                          </div>
                        )}
                        <div className={styles.timeItem}>
                          <span>{formatMessage({ id: 'fin.common.start_time' })}</span>
                          <b>{timeToString(item.startTime)}</b>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemStatus}>
                      <Status info={{ timeDiff: timeDiff, ...item }}></Status>
                    </div>
                  </div>
                ))
              : waiting}
          </PullToRefresh>
        )}
        {/* {active === 'DISCOUNT' && (
          <PullToRefresh
            onRefresh={() => {
              getList();
            }}
            className={styles.listScroll}
            damping={100}
            distanceToRefresh={50}
          >
            {filterList().map(item => (
              <div key={item.pid} className={styles.listItem} onClick={() => toDetail(item)}>
                <div
                  className={styles.listImg}
                  style={{ backgroundImage: `url(${MAIN_SITE_API_PATH}/file/download/${item.projectUrl})` }}
                ></div>
                <div className={styles.bottom}>
                  <div className={styles.bottomText}>
                    <h4>{locale === 'zh-CN' ? item.pname : item.pnameEn}</h4>
                    <p>{locale === 'zh-CN' ? item.description : item.descriptionEn}</p>
                  </div>
                  <div>
                    <div className={styles.timeItem}>
                      <span>{formatMessage({ id: amountText[item.type] })} </span>
                      <b>
                        {item.purchaseNum} {item.type === 'BIDDING' ? formatMessage({ id: 'labs.title.share' }) : item.issueCurrency}
                      </b>
                    </div>
                    <div className={styles.timeItem}>
                      <span>{formatMessage({ id: 'fin.common.start_time' })}</span>
                      <b>{timeToString(item.startTime)}</b>
                    </div>
                  </div>
                </div>
                <div className={styles.itemStatus}>
                  <Status info={{ timeDiff: timeDiff, ...item }}></Status>
                </div>
              </div>
            ))}
          </PullToRefresh>
        )} */}
      </div>
      <Modal
        title={<div className={styles.title}>{formatMessage({ id: 'ucenter.api.info.reminder' })} </div>}
        visible={visible}
        closable={false}
        transparent
        footer={[]}
        className={styles.riskModal}
      >
        <div style={{ height: 360, overflowY: 'auto' }}>
          <p>{formatMessage({ id: 'labs.risk.tips1' })}</p>
          <p style={{ marginBottom: 0 }}>{formatMessage({ id: 'swap.submitEntrust.riskWarning' })}</p>
          <p>{formatMessage({ id: 'labs.risk.tips3' })}</p>
        </div>
        {footer}
      </Modal>
    </div>
  );
};

export default connect(({ auth, global, setting }) => ({
  user: auth.user,
  timeDiff: global.serverClientTimeDiff,
  theme: setting.theme
}))(List);
