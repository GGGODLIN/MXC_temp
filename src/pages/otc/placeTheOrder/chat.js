import React, { useState, createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getSubSite, getCookie } from '@/utils';
import { getPlaceTheOrder } from '@/services/api';
import TopBar from '@/components/TopBar';
import phone from '@/assets/img/otc/phone.png';
import styles from './index.less';
function Chatroom(props) {
  const locale = getLocale();
  const lang = locale.startsWith('zh') ? 'zh' : 'en';
  const { match, location } = props;
  const [orderInfo, setOrderInfo] = useState('');
  const [chatUrl, setChatUrl] = useState('');
  let id = location.query.id;
  const userOrderInfo = async () => {
    const res = await getPlaceTheOrder(id);
    if (res.code === 0) {
      setChatUrl(
        `${getSubSite('chat')}/?apptoken=${getCookie('u_id')}&id=${res.data.merchantInfo.imId}&orderid=${
          res.data.id
        }&type=0&theme=light&lang=${lang}&imId=${res.data.merchantInfo.imId}`
      );
      setOrderInfo(res.data);
    }
  };

  useEffect(() => {
    if (id) {
      userOrderInfo();
    }
  }, [id]);

  return (
    <div>
      <TopBar>
        <div>
          <span>{orderInfo ? orderInfo.merchantInfo.nickName : ''}</span>
          <i className={classNames([styles.iconsVip, 'iconfont iconic_GreenDiamond'])}></i>
          {orderInfo && orderInfo.merchantInfo.mobile && (
            <a className={styles.telFlag} href={`tel:${orderInfo.merchantInfo.mobile}`}>
              <img className={styles.telImg} src={phone} />
            </a>
          )}
        </div>
      </TopBar>
      <iframe src={chatUrl} frameBorder={0} className={styles.chatContent}></iframe>
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(Chatroom);
