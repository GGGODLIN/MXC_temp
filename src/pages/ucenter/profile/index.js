import React, { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Flex, Switch, List, WingBlank } from 'antd-mobile';
import classNames from 'classnames';
import TopBar from '@/components/TopBar';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import langMap from '@/utils/lang';
import { gotoLogin, getCookie } from '@/utils';
import CustomerService from '@/pages/event/customer-service';

import styles from './index.less';
import logo from '@/assets/img/ucenter/profile_logo.png';
import iconNew from '@/assets/img/ucenter/icon_new.png';

const Item = List.Item;
const language = getLocale();
const isMock = localStorage.getItem('mxc.view.from') === 'mock';

function renderThumb(className, iconName, fillColor) {
  return (
    <div className={className}>
      <svg className={styles['feature-icon']} style={{ fill: fillColor }} aria-hidden="true">
        <use xlinkHref={`#${iconName}`}></use>
      </svg>
    </div>
  );
}

function Profile({ theme, dispatch, kycInfo, authStatus, loginMember, vipLevel, user }) {
  useEffect(() => {
    const cookieUid = getCookie('u_id');
    const uid = user.id;

    // 未登录时，不请求用户信息接口
    if (uid || cookieUid) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
  }, []);

  useEffect(() => {
    if (!user || !user.id) {
      dispatch({
        type: 'auth/resetUserInfo',
        payload: {
          kycInfo: {}, // 实名认证信息
          authStatus: {}, // 实名认证状态
          vipLevel: null, // vip提现额
          logList: null, // 登录历史
          loginMember: null, // 用户信息
          phishingCode: null // 防钓鱼码
        }
      });
    }
  }, [user]);

  const getAuthStatusText = useMemo(() => {
    const {
      juniorUnverified,
      juniorIng,
      juniorReject,
      juniorSuccess,
      seniorUnverified,
      seniorIng,
      seniorReject,
      seniorSuccess
    } = authStatus;

    if (juniorUnverified && seniorUnverified) {
      return formatMessage({ id: 'ucenter.index.un_verified' });
    }

    if (seniorSuccess || (juniorSuccess && seniorUnverified)) {
      return seniorSuccess ? formatMessage({ id: 'ucenter.kyc.senior.success' }) : formatMessage({ id: 'ucenter.kyc.junior.success' });
    }

    if (seniorReject || (juniorReject && seniorUnverified)) {
      return seniorReject ? formatMessage({ id: 'ucenter.kyc.senior.reject' }) : formatMessage({ id: 'ucenter.kyc.junior.reject' });
    }

    if (seniorIng || (juniorIng && seniorUnverified)) {
      return seniorIng ? formatMessage({ id: 'ucenter.kyc.senior.ing' }) : formatMessage({ id: 'ucenter.kyc.junior.ing' });
    }
  }, [authStatus]);

  const authGotoHandle = useCallback(() => {
    router.push('/ucenter/id-auth-result');
  }, [authStatus]);
  return (
    <div className={styles.wrapper}>
      <TopBar>{formatMessage({ id: 'layout.title.tabbar.my' })}</TopBar>
      <WingBlank>
        <Flex className={classNames(styles.info, { [styles.login]: !loginMember })} justify="between">
          <Flex.Item>
            <Flex justify="start">
              <div onClick={() => !loginMember && gotoLogin()}>
                <img className={styles.logo} src={logo} alt="logo" />
              </div>
              {loginMember && <p className={styles.account}>{loginMember.account}</p>}

              {!loginMember && <Flex.Item onClick={() => gotoLogin()}>{formatMessage({ id: 'ucenter.index.not_login' })}</Flex.Item>}
            </Flex>
          </Flex.Item>
          <Flex className={styles.theme}>
            <Flex.Item>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="f-12 color-middle m-r-5">{formatMessage({ id: 'ucenter.index.dark' })}</span>
                <Switch
                  style={{ marginRight: 16 }}
                  checked={theme === 'dark'}
                  name={'sss'}
                  onChange={val => {
                    dispatch({
                      type: 'setting/changeSetting',
                      payload: {
                        theme: val ? 'dark' : 'light'
                      }
                    });
                    window.setTimeout(() => {
                      window.location.reload(true);
                    }, 50);
                  }}
                />
              </div>
            </Flex.Item>
            <div className={styles.set}>
              <Link to="/ucenter/setting">
                <svg className={styles.icon} aria-hidden="true">
                  <use xlinkHref="#iconshezhi"></use>
                </svg>
              </Link>
            </div>
          </Flex>
        </Flex>

        {loginMember && (
          <Flex wrap="wrap" className={styles.auth}>
            {!authStatus.juniorSuccess && !authStatus.seniorSuccess && (
              <Flex className={styles['un-verified']}>
                <span className={styles['level-icon']}></span>
                {formatMessage({ id: 'ucenter.index.un_verified' })}
              </Flex>
            )}
            {authStatus.juniorSuccess && !authStatus.seniorSuccess && (
              <Flex className={classNames(styles.done)}>
                <span className={styles['level-icon']}></span>
                {formatMessage({ id: 'ucenter.index.level.low' })}
              </Flex>
            )}
            {authStatus.seniorSuccess && (
              <Flex className={classNames(styles.done)}>
                <span className={styles['level-icon']}></span>
                {formatMessage({ id: 'ucenter.index.level.high' })}
              </Flex>
            )}

            <Flex className={classNames(styles.vip, { [styles.vipLevel]: vipLevel })} onClick={() => router.push('/info/vip')}>
              <span className={styles.icon} />
              {formatMessage({ id: 'ucenter.index.level.vip' })}
            </Flex>

            {loginMember && loginMember.isInstCustomer && (
              <div className={classNames(styles.inst, { [styles['inst-none']]: !loginMember.isInstCustomer })}>
                <span className={styles.icon} />
                {formatMessage({ id: 'ucenter.index.level.inst' })}
              </div>
            )}
          </Flex>
        )}
      </WingBlank>

      <div className={styles.split}></div>

      <WingBlank className={styles.features}>
        <List>
          <Item
            thumb={renderThumb(styles['id-auth'], 'iconshenfenrenzheng-ansemoshix', 'var(--up-color)')}
            arrow="horizontal"
            extra={loginMember && getAuthStatusText}
            onClick={authGotoHandle}
          >
            {formatMessage({ id: 'ucenter.index.features.kyc' })}
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.safe, 'iconanquanzhongxin-ansemoshix', 'var(--up-color)')}
            arrow="horizontal"
            onClick={() => router.push('/ucenter/security')}
          >
            {formatMessage({ id: 'ucenter.index.features.security' })}
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.invite, 'iconyaoqing-ansemoshix', 'var(--up-color)')}
            arrow="horizontal"
            onClick={() => router.push('/invite/rebate')}
          >
            {formatMessage({ id: 'invite.rebate.title' })}
          </Item>
        </List>
        {language !== 'zh-CN' && (
          <List>
            <Item
              thumb={renderThumb(styles.invite, 'iconic_mypos', 'var(--up-color)')}
              arrow="horizontal"
              onClick={() => router.push('/pos/list')}
            >
              {formatMessage({ id: 'ucenter.index.pos' })}
            </Item>
          </List>
        )}
        <List>
          <Item
            thumb={renderThumb(styles.invite, 'iconic_tax', 'var(--up-color)')}
            arrow="horizontal"
            onClick={() => router.push('/ucenter/discount')}
          >
            {formatMessage({ id: 'assets.discount.setting' })}{' '}
            <img
              src={iconNew}
              style={{
                width: 30,
                height: 16,
                verticalAlign: 'sub',
                marginLeft: 3
              }}
              alt=""
            />
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.msg, 'iconmochakuaixunx', 'var(--main-text-2)')}
            arrow="horizontal"
            onClick={() => router.push('/event/activity')}
          >
            {formatMessage({ id: 'home.title.news' })}
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.order, 'icondingdanx', 'var(--main-text-2)')}
            arrow="horizontal"
            onClick={() => router.push('/ucenter/order')}
          >
            {formatMessage({ id: 'labs.title.my_record' })}
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.record, 'iconjilux', 'var(--main-text-2)')}
            arrow="horizontal"
            onClick={() => router.push('/uassets/record')}
          >
            {formatMessage({ id: 'assets.record.link' })}
          </Item>
        </List>
        <List>
          <Item
            thumb={renderThumb(styles.language, 'iconyuyanx', 'var(--main-text-2)')}
            arrow="horizontal"
            extra={langMap[language].label}
            onClick={() => router.push('/ucenter/setting-language')}
          >
            {formatMessage({ id: 'ucenter.index.features.language' })}
          </Item>
        </List>
        {!isMock && (
          <List>
            <Item
              thumb={renderThumb(styles.about, 'iconic_download', 'var(--main-text-2)')}
              arrow="horizontal"
              onClick={() => router.push('/mobileApp')}
            >
              {formatMessage({ id: 'download.title.page_title' })}
            </Item>
          </List>
        )}
      </WingBlank>

      <WingBlank className={styles['customer-services']}>
        <CustomerService />
      </WingBlank>
    </div>
  );
}

export default connect(({ auth, setting }) => ({
  theme: setting.theme,
  user: auth.user,
  kycInfo: auth.kycInfo, // 实名认证信息
  authStatus: auth.authStatus, // 实名认证状态
  loginMember: auth.loginMember, // 用户信息
  vipLevel: auth.vipLevel // vip提现额
}))(Profile);
