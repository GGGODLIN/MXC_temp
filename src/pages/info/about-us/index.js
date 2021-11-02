import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Flex, Switch, List, WingBlank, WhiteSpace } from 'antd-mobile';
import logoDark from '@/assets/img/info/logo_dark.png';
import logoLight from '@/assets/img/info/logo_light.png';
import telegramEn from '@/assets/img/info/telegram_en.png';
import telegramCn from '@/assets/img/info/telegram_cn.png';
import weibo from '@/assets/img/info/weibo.png';
import linkedin from '@/assets/img/info/linkedin.png';
import facebook from '@/assets/img/info/facebook.png';
import medium from '@/assets/img/info/medium.png';
import discord from '@/assets/img/info/discord.png';
import reddit from '@/assets/img/info/reddit.png';
import twitterLogo from '@/assets/img/info/twitter.png';

import styles from './index.less';

const { Item } = List;
const language = getLocale();
const twitter = language === 'ja-JP' ? 'https://twitter.com/MEXC_Japan' : 'https://twitter.com/MEXC_Exchange';

function AboutUs({ theme }) {
  return (
    <>
      <TopBar> {formatMessage({ id: 'footer.about' })}</TopBar>
      <div className={styles.logo}>
        {theme === 'dark' && <img src={logoDark} alt="logo" />}
        {theme === 'light' && <img src={logoLight} alt="logo" />}
      </div>

      <List>
        <Item arrow="horizontal" onClick={() => router.push('/info/about-us/detail')}>
          {formatMessage({ id: 'info.about.title' })}
        </Item>
      </List>

      <WingBlank className={styles.contact}>
        <h3>{formatMessage({ id: 'info.about.welcome' })}</h3>
        <Flex className={styles['contact-list']} wrap="wrap">
          <a href="https://t.me/MEXCEnglish" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={telegramEn} alt="logo" />
          </a>
          <a href="https://t.me/MEXCtelegram" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={telegramCn} alt="logo" />
          </a>
          <a href="https://m.weibo.cn/u/6605413404" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={weibo} alt="logo" />
          </a>
          <a href="https://www.linkedin.com/company/mxc-exchange" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={linkedin} alt="logo" />
          </a>
          <a href="https://www.facebook.com/mxcexchangeofficial/" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={facebook} alt="logo" />
          </a>
          <a href="https://medium.com/@mexc.com" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={medium} alt="logo" />
          </a>
          <a href="https://discord.gg/yAsgjfv" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={discord} alt="logo" />
          </a>
          <a href="https://www.reddit.com/user/MEXC_Exchange" rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={reddit} alt="logo" />
          </a>
          <a href={twitter} rel="noopener noreferrer" target="_blank">
            <img className={styles.icon} src={twitterLogo} alt="logo" />
          </a>
        </Flex>
      </WingBlank>
    </>
  );
}

export default connect(({ auth, setting }) => ({
  theme: setting.theme,
  user: auth.user
}))(AboutUs);
