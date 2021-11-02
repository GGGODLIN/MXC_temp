import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getSubSite, getCookie } from '@/utils';
import TopBar from '@/components/TopBar';
import styles from './index.less';
function Chatroom() {
  const locale = getLocale();
  const lang = locale.startsWith('zh') ? 'zh' : 'en';
  // console.log(getSubSite('chat'));
  const chatUrl = `${getSubSite('chat')}/chatroom?id=89387666833409&orderid=999&type=0&theme=light&language=${lang}`;
  // const chatUrl = `${getSubSite('chat')}?theme=dark&language=${lang}`;
  // const chatUrl = 'https://chat.mxctest.com?theme=light&language=zh';
  return (
    <div>
      <TopBar gotoPath={'/'}>{formatMessage({ id: 'layout.service.title.chatroom' })}</TopBar>
      <iframe src={chatUrl} frameBorder={0} className={styles.chatContent}></iframe>
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(Chatroom);
