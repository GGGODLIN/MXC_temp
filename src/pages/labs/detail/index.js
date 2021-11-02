import { useEffect, useState, useReducer } from 'react';
import { connect } from 'dva';
import { getLocale, formatMessage, formatHTMLMessage } from 'umi-plugin-locale';
import { Modal, PullToRefresh } from 'antd-mobile';
import { getSubSite } from '@/utils';
import { getLabsDetail } from '@/services/api';
import moment from 'moment';
import TopBar from '@/components/TopBar';
import styles from './index.less';
import TopInfo from './TopInfo';
import Qualified from './Qualified';
import DrawInfo from './DrawInfo';
import BiddingInfo from './BiddingInfo';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;

function reducer(state, payload) {
  return { ...state, ...payload };
}

const special = ['f303e6b2a7e941a8ac3741c995a4ca9e', '6f635bb90f014a68b11b62dbd941f1c3', '1afd46c5bd8147a290bbf70d82d49b7f'];

const Detail = ({ match, user, timeDiff }) => {
  const [info, setInfo] = useState({});
  const [status, setStatus] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [warnVisible, setWarnVisble] = useState(false);
  const [text, setText] = useReducer(reducer, {
    BIDDING: '',
    DRAW: '',
    NOW_DRAW: ''
  });
  const pid = match.params.id;
  const getDetail = () => {
    getLabsDetail(pid).then(res => {
      if (res && res.code === 0) {
        const { startTime, endTime, zone, expandInfo = {}, draws = [] } = res.data;
        const { drawTime } = expandInfo;
        const wonDraws = draws && draws.length ? draws.filter(i => i.won === 1) : [];

        const currentTime = new Date().getTime() + timeDiff;
        // status  0 未开始 1 进行中 2 已结束 3 已达成（已登记）
        let status = currentTime < startTime ? 0 : currentTime < endTime ? 1 : 2;
        const isDrawTime = currentTime > drawTime;

        setInfo({ ...res.data, timeDiff });
        setStatus(status);

        //未中奖
        if (user.id && zone === 'MDAY' && isDrawTime && draws && draws.length > 0 && wonDraws.length === 0) {
          setWarnVisble(true);
        }
      }
    });
  };

  useEffect(() => {
    if (info.pid) setModal(info);
  }, [info.pid, user.id, status]);

  const setModal = info => {
    const extend = info.expandInfo || {};
    const mount = info.boughtQuantities > info.purchaseNum ? info.boughtQuantities : info.purchaseNum;
    const buyNum = Math.ceil((info.purchaseNum * extend.quote) / mount);
    const draws = info.draws || [];
    let _text = {};
    if (info.zone === 'MDAY') {
      _text = {
        BIDDING: formatHTMLMessage(
          {
            id: 'labs.title.bidding_success'
          },
          {
            num: info.applyQuantity,
            curency: info.issueCurrency,
            price: buyNum,
            time: moment(extend.settleTime).format('YYYY-MM-DD HH:mm:ss'),
            settle: info.settleCurrency,
            CCC: (buyNum * info.price * info.applyQuantity).toFixed(8)
          }
        ),
        DRAW: formatHTMLMessage({ id: 'labs.lot.win' }),
        NOW_DRAW: formatHTMLMessage({ id: 'labs.lot.win' })
      };
    } else {
      _text = {
        BIDDING: formatHTMLMessage(
          {
            id: 'labs.title.bidding_success'
          },
          {
            num: info.applyQuantity,
            curency: info.issueCurrency,
            price: buyNum,
            time: moment(extend.settleTime).format('YYYY-MM-DD HH:mm:ss'),
            settle: info.settleCurrency,
            CCC: (buyNum * info.price * info.applyQuantity).toFixed(8)
          }
        ),
        DRAW: formatHTMLMessage(
          {
            id: 'labs.title.draw_success'
          },
          {
            time: moment(extend.settleTime).format('YYYY-MM-DD HH:mm:ss'),
            settle: info.settleCurrency,
            CCC: draws && (info.convertNumber * info.price * draws.filter(i => i.won === 1).length).toFixed(8)
          }
        ),
        NOW_DRAW: formatHTMLMessage(
          {
            id: 'labs.title.draw_success'
          },
          {
            time: moment(extend.settleTime).format('YYYY-MM-DD HH:mm:ss'),
            settle: info.settleCurrency,
            CCC: draws && (info.convertNumber * info.price * draws.filter(i => i.won === 1).length).toFixed(8)
          }
        )
      };
    }

    setText(_text);

    if (user.id && info.type === 'BIDDING' && status === 2 && info.applyQuantity > 0) {
      setShowModal(true);
    }
    if (
      user.id &&
      (info.type === 'DRAW' || info.type === 'NOW_DRAW') &&
      status === 2 &&
      draws &&
      draws.filter(i => i.won === 1).length > 0
    ) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  const isApp = window.localStorage.getItem('mxc.view.from') === 'app' ? 'app' : 'h5';

  return (
    <div className={styles.detail}>
      <TopBar>{getLocale().startsWith('zh') ? info.pname : info.pnameEn}</TopBar>
      {/* <PullToRefresh
        onRefresh={() => {
          getDetail();
        }}
        className={`${styles.scroll} ${styles[isApp]}`}
        damping={60}
        distanceToRefresh={50}
      > */}
      <div className={styles.boxWrap}>{info.pid && <TopInfo info={info}></TopInfo>}</div>
      {user.id && (
        <div className={styles.boxWrap}>
          <Qualified info={info} currency={info.settleCurrency} pid={info.pid}></Qualified>
        </div>
      )}
      <div className={styles.boxWrap}>
        {info.type === 'DRAW' && <DrawInfo info={info} state={status} getDetail={getDetail}></DrawInfo>}
        {info.type === 'NOW_DRAW' && <DrawInfo info={info} state={status} getDetail={getDetail}></DrawInfo>}
        {info.type === 'BIDDING' && <BiddingInfo info={info} state={status} getDetail={getDetail}></BiddingInfo>}
      </div>
      <div className={styles.boxWrap}>
        <img
          style={{ width: '100%' }}
          src={`${MAIN_SITE_API_PATH}/file/download/${getLocale().startsWith('zh') ? info.detailUrl : info.detailEnUrl}`}
          alt=""
        />
      </div>
      <Modal
        visible={showModal}
        transparent
        maskClosable={false}
        onClose={() => setShowModal(false)}
        title={formatMessage({ id: 'ucenter.api.info.reminder' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setShowModal(false) }]}
      >
        <div dangerouslySetInnerHTML={{ __html: text[info.type] }}></div>
      </Modal>
      <Modal
        visible={warnVisible}
        transparent
        maskClosable={false}
        onClose={() => setWarnVisble(false)}
        title={formatMessage({ id: 'ucenter.api.info.reminder' })}
        footer={[{ text: formatMessage({ id: 'layout.top.title.i_know' }), onPress: () => setWarnVisble(false) }]}
      >
        <div style={{ color: 'red' }}>
          {info.zone === 'MDAY' ? formatMessage({ id: 'labs.lot.not.win' }) : formatMessage({ id: 'labs.title.draws_state_0' })}
        </div>
      </Modal>
      {/* </PullToRefresh> */}
    </div>
  );
};

export default connect(({ auth, global }) => ({
  user: auth.user,
  timeDiff: global.serverClientTimeDiff
}))(Detail);
