import { connect } from 'dva';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
// import ThemeOnly from '@/components/ThemeOnly';
import cn from 'classnames';
import { Modal } from 'antd-mobile';
import { getSubSite, timeToString } from '@/utils';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getLabsDetail } from '@/services/api';
import Status from '../Status';
import Ticket from './Ticket';
import LotInfo from './LotInfo';
import Icon1 from '@/assets/img/launchpad/icon1.png';
import Icon2 from '@/assets/img/launchpad/icon2.png';
import Icon3 from '@/assets/img/launchpad/icon3.png';
import Icon4 from '@/assets/img/launchpad/icon4.png';

import styles from './index.less';

const locale = getLocale();
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function Container({ timeDiff, user, match }) {
  const [info, setInfo] = useState({});
  const [status, setStatus] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [wonType, setWonType] = useState(0);
  const pid = match.params.id;

  useEffect(() => {
    getDetail();
  }, []);

  useEffect(() => {
    if (info.pid && status) {
      showResult();
    }
  }, [info, status]);

  const getDetail = async e => {
    const res = await getLabsDetail(pid);

    if (res && res.code === 0) {
      const { startTime, endTime } = res.data;
      const currentTime = new Date().getTime() + timeDiff;

      // status  0 未开始 1 进行中 2 已结束 3 已达成（已登记）
      const status = currentTime < startTime ? 0 : currentTime < endTime ? 1 : 2;

      setInfo(res.data);
      setStatus(status);
    }
  };

  const showResult = e => {
    const { expandInfo = {}, draws = [] } = info;
    const { drawTime } = expandInfo;
    const hasWon = draws?.length ? draws.some(i => i.won === 1) : false;
    const currentTime = new Date().getTime() + timeDiff;
    const isDrawTime = currentTime > drawTime;

    //已中奖
    if (draws && hasWon) {
      setWonType(1);
      setShowModal(true);
    }

    //未中奖
    if (isDrawTime && draws && draws.length > 0 && !hasWon) {
      setWonType(0);
      setShowModal(true);
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <TopBar>Launchpad</TopBar>
        <div className={styles.top}>
          <div className={styles.pic}>
            <img src={`${MAIN_SITE_API_PATH}/file/download/${info.logoUrl}`} alt="icon" className={styles.currencyIcon} />
          </div>
          <div>
            <h3>{locale.startsWith('zh') ? info.pname : info.pnameEn}</h3>
            <Status status={status} />
          </div>
        </div>
        <div className={styles.tabs}>
          <div className={cn(styles.tab, styles.active)}>{formatMessage({ id: 'mc_launchpads_feature_item1' })}</div>
          {/* <div className={styles.tab}>{formatMessage({ id: 'mc_launchpads_feature_item2' })}</div> */}
          {/* <div className={styles.tab}>{formatMessage({ id: 'mc_launchpads_feature_item3' })}</div> */}
        </div>
        <div className={styles.tabContent}>
          <a href={`${getSubSite('main')}/${locale}/mx`} className={styles.mxHref}>
            <span>{formatMessage({ id: 'mc_launchpads_mx_text' })}</span>
            <i className="iconfont icondrop"></i>
          </a>
          <div className={styles.sku}>
            <div className={styles.item}>
              <div>
                <img src={Icon1} alt="" />
                <p>{formatMessage({ id: 'labs.title.exchange_price' })}</p>
                <span>{info.price ? `${info.price} ${info.settleCurrency}` : formatMessage({ id: 'labs.title.to_wait' })}</span>
              </div>
              <div>
                <img src={Icon2} alt="" />
                <p>{formatMessage({ id: 'labs.title.regist_time' })}</p>
                <span>
                  {timeToString(info.startTime)} - {timeToString(info.endTime)}
                </span>
              </div>
            </div>
            <div className={styles.item}>
              <div>
                <img src={Icon3} alt="" />
                <p>{formatMessage({ id: 'labs.title.issue_num' })}</p>
                <span>
                  {info.issueNum ? info.issueNum : '--'} {info.issueCurrency}
                </span>
              </div>
              <div>
                <img src={Icon4} alt="" />
                <p>{formatMessage({ id: 'labs.title.current_drawNum' })}</p>
                <span>
                  {info.purchaseNum ? info.purchaseNum : '--'} {info.issueCurrency}
                </span>
              </div>
            </div>
          </div>
          <LotInfo info={info} timeDiff={timeDiff} getDetail={getDetail} user={user} status={status} />
          <Ticket info={info} />
          <div className={styles.content}>
            <div className={styles.head}>{formatMessage({ id: 'mc_slot_assessment_feature' })}</div>
            <p>{locale.startsWith('zh') ? info.description : info.descriptionEn}</p>
            <img src={`${MAIN_SITE_API_PATH}/file/download/${locale.startsWith('zh') ? info.detailUrl : info.detailEnUrl}`} alt="" />
          </div>
        </div>
      </div>
      <Modal
        visible={showModal}
        transparent
        maskClosable={false}
        onClose={() => setShowModal(false)}
        title={formatMessage({ id: 'ucenter.api.info.reminder' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setShowModal(false) }]}
      >
        {wonType === 1 ? (
          <div>{formatMessage({ id: 'mc_launchpads_modal_succeed' })}</div>
        ) : (
          <div style={{ color: 'red' }}>{formatMessage({ id: 'mc_launchpads_modal_fail' })}</div>
        )}
      </Modal>
    </>
  );
}
export default connect(({ global, auth }) => ({
  timeDiff: global.serverClientTimeDiff,
  user: auth.user
}))(Container);
