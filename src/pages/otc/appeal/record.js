import React, { useRef, useEffect, useState } from 'react';
// import ThemeOnly from '@/components/ThemeOnly';
import { formatMessage } from 'umi/locale';
import { getAppealInfo, putAppealArbitrate } from '@/services/api';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import CountDown from '@/components/CountDown';
import { Button, Toast, Modal } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import styles from './record.less';
import QrcodeModel from './qrcode';
import { timeToString, getSubSite } from '@/utils';
const MAIN_SITE_API_PATH = NODE_ENV === 'production' ? `${getSubSite('main')}/api` : API_PATH;
const alert = Modal.alert;
function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function Container({ form, orderState, id, setRecordVisible }) {
  const [finished, setFinished] = useState([]);
  const [opening, setOpening] = useState({});
  const [openingObserve, setOpeningObserve] = useState([]);
  const [responseTime, setResponseTime] = useState('');
  const [countDown, setCountDown] = useState('');
  const [orderFinished, setOrderFinished] = useState([]);
  const [serverTime, setServerTime] = useState('');
  const [complainId, setComplainId] = useState();
  const [imgQrcodeVisble, setImgQrcodeVisble] = useState('none');
  const [imgQrcode, setImgQrcode] = useState('');
  const [number, setNumber] = useState(0);
  let appealId = id;
  useEffect(() => {
    if (id) {
      getAppeal(id);
    }
  }, []);

  useEffect(() => {
    if (number === 1) {
      getAppeal(id);
    }
  }, [number]);
  useInterval(() => {
    if (id) {
      getAppeal(id);
    }
  }, 60000);
  const getAppeal = async id => {
    let data = {
      orderDealId: id
    };
    const res = await getAppealInfo(data);

    if (res.code === 0) {
      setFinished(res.data.finished ? res.data.finished : []);
      setOpening(res.data.opening ? res.data.opening : {});
      setOpeningObserve(res.data.openingObserve ? res.data.openingObserve : []);
      setResponseTime(res.responseTime);
      setCountDown(res.data.countDown);
      let timestamp = Date.parse(new Date());
      setResponseTime(res.responseTime - timestamp);
      const now = new Date().getTime() + (res.responseTime - timestamp);
      setServerTime(now);
      setComplainId(res.data.opening ? res.data.opening.id : '');
      let list = [];
      if (res.data.finished && res.data.finishedObserve) {
        res.data.finished.forEach((r, index) => {
          res.data.finishedObserve.forEach((d, index) => {
            if (r.id === d[0].complainId) {
              list.unshift({
                finished: r,
                finishedObserve: d
              });
            } else {
              list.push({
                finished: r
              });
            }
          });
        });
      }
      if (res.data.finished && !res.data.finishedObserve) {
        res.data.finished.forEach((r, index) => {
          list.push({
            finished: r
          });
        });
      }
      let obj = {};
      let peon = list.reduce((cur, next) => {
        // eslint-disable-next-line no-unused-expressions
        obj[next.finished.id] ? '' : (obj[next.finished.id] = true && cur.push(next));
        return cur;
      }, []);
      setOrderFinished(peon.reverse());
    }
  };
  const putArbitrate = async id => {
    const res = await putAppealArbitrate(id);
    if (res.code === 0) {
      Toast.success(formatMessage({ id: 'mc_otc_appeal_arbitration_msg' }), 3);
      getAppeal(appealId);
      setNumber(0);
    }
  };
  const orderComplaint = state => {
    let text = '';
    if (state === 'COMPLAIN_NO_RESPONSE') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_one' });
    } else if (state === 'COMPLAIN_PAID_BUT_CANCEL_TIMEOUT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_two' });
    } else if (state === 'COMPLAIN_UNRECEIVED_PAYMENT') {
      text = formatMessage({ id: 'mc_otc_trading_complaint_four' });
    } else {
      text = formatMessage({ id: 'mc_otc_trading_complaint_three' });
    }
    return text;
  };
  // COMPLAIN_UNRECEIVED_PAYMENT
  // COMPLAIN_PAID_BUT_CANCEL_TIMEOUT
  const orderAppealOperate = state => {
    let text = '';
    if (state === 0) {
      text = formatMessage({ id: 'mc_otc_appeal_Administrator_release' });
    } else if (state === 1) {
      text = formatMessage({ id: 'mc_otc_appeal_Administrator_cancel' });
    } else if (state === 2) {
      text = formatMessage({ id: 'mc_otc_appeal_Seller_release' });
    } else if (state === 3) {
      text = formatMessage({ id: 'mc_otc_appeal_Buyer_cancel' });
    } else if (state === 4) {
      text = formatMessage({ id: 'mc_otc_appeal_Buyer_Refund' });
    }
    return text;
  };

  const openingAppeal = () => {
    if (!opening.createTime) {
      return;
    }
    return (
      <div>
        <div className={styles.userTime}>{timeToString(opening.createTime)}</div>
        <div className={styles.appealInfo}>
          {opening.nickname === 'ADMIN' ? (
            <div className={styles.customerService}>{formatMessage({ id: 'mc_otc_appeal_server' })}</div>
          ) : (
            <div className={styles.infoTitle}>{formatMessage({ id: 'mc_otc_appeal_user_info' }, { name: opening.nickname })}</div>
          )}
          <div className={styles.appealContent}>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}> {formatMessage({ id: 'mc_otc_appeal_user_cause' })}</p>
              <div className={styles.description}>{orderComplaint(opening.complainCategory)}</div>
            </div>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}>{formatMessage({ id: 'mc_otc_appeal_bewrite' })}</p>
              <div className={styles.description}>{opening.complainReason ? opening.complainReason : '--'}</div>
            </div>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}>{formatMessage({ id: 'container.The.phone' })}</p>
              <div className={styles.description}>
                <a href={`tel:${opening.phoneNum}`}>{opening.phoneNum ? opening.phoneNum : '--'}</a>
              </div>
            </div>
            <div>{opening.annex && appealImg(opening.annex)}</div>
          </div>
        </div>
      </div>
    );
  };
  const openingObserveAppeal = () => {
    return openingObserve.map(item => {
      return (
        <div key={item.id}>
          <div className={styles.userTime}>{timeToString(item.createTime)}</div>
          <div className={styles.appealInfo}>
            {item.nickname === 'ADMIN' ? (
              <div className={styles.infoTitle}>
                <div className={styles.customerService}>{formatMessage({ id: 'mc_otc_appeal_server' })}</div>
              </div>
            ) : (
              <div className={styles.infoTitle}>{formatMessage({ id: 'mc_otc_appeal_user_info' }, { name: item.nickname })}</div>
            )}
            <div className={styles.appealContent}>
              {item.complainCategory && (
                <div className={styles.appealInfoList}>
                  <p className={styles.appealTitle}>{formatMessage({ id: 'mc_otc_appeal_user_cause' })}</p>
                  <div className={styles.description}>{orderComplaint(item.complainCategory)}</div>
                </div>
              )}
              <div className={styles.appealInfoList}>
                <p className={styles.appealTitle}> {formatMessage({ id: 'mc_otc_appeal_bewrite' })}</p>
                <div className={styles.description}>{item.content ? item.content : '--'}</div>
              </div>
              <div className={styles.appealInfoList}>
                <p className={styles.appealTitle}>{formatMessage({ id: 'container.The.phone' })}</p>
                <div className={styles.description}>
                  <a href={`tel:${item.phoneNum}`}>{item.phoneNum ? item.phoneNum : '--'}</a>
                </div>
              </div>
              <div>{item.annex && appealImg(item.annex)}</div>
            </div>
          </div>
        </div>
      );
    });
  };
  const appealImg = annex => {
    const appImg = annex && JSON.parse(annex);
    return appImg.map(item => {
      return (
        <>
          <img
            key={item}
            onClick={() => {
              setImgQrcode(item);
              setImgQrcodeVisble('block');
            }}
            src={`${MAIN_SITE_API_PATH}/file/download/${item}`}
            className={styles.appealImg}
          />
        </>
      );
    });
  };

  const appealState = val => {
    const orderTypeMaps = {
      0: formatMessage({ id: 'mc_otc_appeal_result_four' }),
      1: formatMessage({ id: 'mc_otc_appeal_Merchant_wins' }),
      2: formatMessage({ id: 'mc_otc_appeal_user_wins' }),
      3: formatMessage({ id: 'mc_otc_appeal_negotiated' }),
      4: formatMessage({ id: 'mc_otc_appeal_result_four' }),
      5: formatMessage({ id: 'mc_otc_appeal_result_five' })
    };
    return orderTypeMaps[val];
  };
  const adminOperate = val => {
    const orderTypeMaps = {
      0: formatMessage({ id: 'mc_otc_appeal_Administrator_release' }),
      1: formatMessage({ id: 'mc_otc_appeal_Administrator_cancel' }),
      2: formatMessage({ id: 'mc_otc_appeal_Seller_release' }),
      4: formatMessage({ id: 'mc_otc_appeal_Buyer_Refund' })
    };
    return orderTypeMaps[val];
  };
  const orderFinishedFun = () => {
    return orderFinished.map((item, index) => {
      return (
        <div key={index}>
          {orderFinishedList(item.finished)}
          {item.finishedObserve && orderFinishedObserveList(item.finishedObserve)}
        </div>
      );
    });
  };
  const orderFinishedList = item => {
    return (
      <>
        {
          <div>
            <h2>{appealState(item.state)}</h2>
            {item.adminOperate === 0 || item.adminOperate ? (
              <div className={styles.appealResul}>
                <p className={styles.appealTitle}>{formatMessage({ id: 'mc_otc_appeal_result' })}</p>
                <div className={styles.description}>{orderAppealOperate(item.adminOperate)}</div>
              </div>
            ) : (
              ''
            )}
          </div>
        }
        <div className={styles.userTime}>{timeToString(item.createTime)}</div>
        <div className={styles.appealInfo}>
          {item.nickname === 'ADMIN' ? (
            <div className={styles.infoTitle}>
              <div className={styles.customerService}>{formatMessage({ id: 'mc_otc_appeal_server' })}</div>
            </div>
          ) : (
            <div className={styles.infoTitle}>{formatMessage({ id: 'mc_otc_appeal_user_info' }, { name: item.nickname })}</div>
          )}

          <div className={styles.appealContent}>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}> {formatMessage({ id: 'mc_otc_appeal_user_cause' })}</p>
              <div className={styles.description}>{orderComplaint(item.complainCategory)}</div>
            </div>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}> {formatMessage({ id: 'mc_otc_appeal_bewrite' })}</p>
              <div className={styles.description}>
                {item.content}
                {item.complainReason}
              </div>
            </div>
            <div className={styles.appealInfoList}>
              <p className={styles.appealTitle}>{formatMessage({ id: 'container.The.phone' })}</p>
              <div className={styles.description}>
                <a href={`tel:${item.phoneNum}`}>{item.phoneNum ? item.phoneNum : '--'}</a>
              </div>
            </div>

            <div>{item.annex && appealImg(item.annex)}</div>
          </div>
        </div>
      </>
    );
  };
  // console.log('finished', finished);
  // console.log('当前订单状态：', finished && (orderState !== 5 || orderState !== 8));
  const orderFinishedObserveList = data => {
    return data.map(item => {
      return (
        <div key={item.id}>
          <div className={styles.userTime}>{timeToString(item.createTime)}</div>
          <div className={styles.appealInfo}>
            {item.nickname === 'ADMIN' ? (
              <div className={styles.customerService}>{formatMessage({ id: 'mc_otc_appeal_server' })}</div>
            ) : (
              <div className={styles.infoTitle}>{formatMessage({ id: 'mc_otc_appeal_user_info' }, { name: item.nickname })}</div>
            )}
            <div className={styles.appealContent}>
              {item.complainCategory && (
                <div className={styles.appealInfoList}>
                  <p className={styles.appealTitle}>{formatMessage({ id: 'mc_otc_appeal_user_cause' })}</p>
                  <div className={styles.description}>{orderComplaint(item.complainCategory)}</div>
                </div>
              )}
              <div className={styles.appealInfoList}>
                <p className={styles.appealTitle}> {formatMessage({ id: 'mc_otc_appeal_bewrite' })}</p>
                <div className={styles.description}>{item.content}</div>
              </div>
              <div className={styles.appealInfoList}>
                <p className={styles.appealTitle}>{formatMessage({ id: 'container.The.phone' })}</p>
                <div className={styles.description}>
                  <a href={`tel:${item.phoneNum}`}>{item.phoneNum ? item.phoneNum : '--'}</a>
                </div>
              </div>
              <div>{item.annex && appealImg(item.annex)}</div>
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <>
      <TopBar>{formatMessage({ id: 'otc.complaint.order' })}</TopBar>
      <div className={styles.appealRecord}>
        {countDown ? (
          <div className={styles.headerPrompt}>
            <i className="iconfont    iconinfo-circle1" style={{ marginRight: 5 }}></i>

            {formatMessage({ id: 'mc_otc_appeal_user_reminder' })}
          </div>
        ) : (
          ''
        )}

        <div className={styles.recordContent}>
          {countDown ? <h2>{appealState(opening.state)}</h2> : <></>}
          {opening.adminOperate === 0 || opening.adminOperate ? (
            <div className={styles.appealResul}>
              <p className={styles.appealTitle}>{formatMessage({ id: 'mc_otc_appeal_result' })}</p>
              <div className={styles.description}>{orderAppealOperate(opening.adminOperate)}</div>
            </div>
          ) : (
            ''
          )}
          <div className={styles.recordTime}>
            {countDown && (
              <>
                <span className={styles.negotiation}>{formatMessage({ id: 'mc_otc_appeal_time_left' })}</span>
                <div className={styles.timeContent}>
                  <div className={styles.timeColor}>
                    <CountDown
                      timeDiff={responseTime}
                      stateText={''}
                      endTime={countDown}
                      callBack={() => {
                        setNumber(1);
                      }}
                    />
                  </div>

                  <Button
                    disabled={serverTime > countDown ? false : true}
                    type="primary"
                    className={styles.arbitration}
                    onClick={() =>
                      alert(formatMessage({ id: 'mc_otc_appeal_request_prompnt' }), '', [
                        { text: formatMessage({ id: 'common.cancel' }), onPress: () => console.log('cancel') },
                        {
                          text: formatMessage({ id: 'common.sure' }),
                          onPress: () => putArbitrate(complainId)
                        }
                      ])
                    }
                  >
                    {formatMessage({ id: 'mc_otc_appeal_request_arbitration' })}
                  </Button>
                </div>
              </>
            )}

            {openingObserveAppeal()}
            {openingAppeal()}
            {orderFinishedFun()}
          </div>
          <div className={styles.nodata}>{formatMessage({ id: 'mc_otc_appeal_nodata' })}</div>
        </div>
        <div className={styles.footerContent}></div>
        {finished && finished.length > 0 && orderState !== 5 && orderState !== 6 && orderState !== 7 && orderState !== 8 ? (
          ''
        ) : (
          <div
            className={styles.footerBtn}
            onClick={() => {
              setRecordVisible(false);
            }}
          >
            {formatMessage({ id: 'common.submit' })}
            <div className={styles.goIcon}>
              <i className="iconfont   iconic_back"></i>
            </div>
          </div>
        )}
      </div>
      <QrcodeModel imgQrcodeVisble={imgQrcodeVisble} setImgQrcodeVisble={setImgQrcodeVisble} imgQrcode={imgQrcode} />
    </>
  );
}

function mapStateToProps({ trading, auth }) {
  return {
    markets: trading.markets,
    user: auth.user
  };
}

export default connect(mapStateToProps)(createForm()(Container));
