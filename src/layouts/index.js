import React, { Component } from 'react';
import { connect } from 'dva';
import TabBar from './TabBar';
import { mainSocketSend } from '@/services/main-socket';
import { tabBar, findRoute } from '@/utils/route';
import routes from '../../config/routes';
import { getCookie, setCookie, browserPlatform } from '@/utils';
import cs from 'classnames';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Helmet } from 'react-helmet';
import { Modal, Checkbox, Toast } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import { CopyToClipboard } from 'react-copy-to-clipboard';
// import AntiPhishing from '@/components/AntiPhishing';

import styles from './index.less';
import arrow from '@/assets/img/download/arrow-line.png';

const AgreeItem = Checkbox.AgreeItem;
const platform = browserPlatform();

const Wechat = () => {
  return (
    <div className={styles.wechatTip}>
      <img className={styles.arrow} src={arrow} alt="" />
      <h2>
        {formatMessage({ id: 'download.title.arrow-text-1' })} {formatMessage({ id: 'download.title.arrow-text-2' })}
      </h2>
      <h2 style={{ marginTop: 30 }}>{formatMessage({ id: 'download.title.arrow-text-3' })}</h2>
      <div className={styles.copy}>
        <p>{window.location.href}</p>
        <CopyToClipboard text={window.location.href} onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }), 1)}>
          <b>{formatMessage({ id: 'common.copy' })}</b>
        </CopyToClipboard>
      </div>
    </div>
  );
};

class BasicLayout extends Component {
  state = {
    checked: false
  };
  componentDidMount() {
    const { history, dispatch, location } = this.props;

    if (location.query.apptoken && !getCookie('u_id')) {
      setCookie('u_id', location.query.apptoken);
    }

    dispatch({
      type: 'auth/fetchCurrent'
    });

    dispatch({
      type: 'trading/getSymbols'
    });

    dispatch({
      type: 'global/saveInitialHistoryLength',
      payload: history.length
    });
    dispatch({
      type: 'global/getHomeConfig'
    });

    dispatch({
      type: 'global/getServerTimestamp'
    });

    mainSocketSend({
      channel: 'sub.overview',
      message: {}
    });

    mainSocketSend({
      channel: 'sub.cny',
      message: {}
    });

    dispatch({
      type: 'global/getCoinList'
    });

    dispatch({
      type: 'global/getCountryList'
    });

    dispatch({
      type: 'global/getMxStatistics'
    });

    dispatch({
      type: 'trading/getUserFavorites'
    });

    dispatch({
      type: 'trading/getMargins'
    });

    dispatch({
      type: 'etfIndex/getEtfSymbols'
    });

    if (getCookie('u_id') || this.props.user.id) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
      dispatch({
        type: 'otc/otcUserInfo'
      });
      dispatch({ type: 'auth/checkMarginAccountState' });
    }

    this.attachCSSVariables();

    window.addEventListener('beforeunload', () => {
      dispatch({
        type: 'trading/saveLocal'
      });
    });

    this.validateInterval = window.setInterval(() => {
      dispatch({
        type: 'auth/fetchCurrent'
      });
      if (this.props.user.id && /otc/.test(window.location.pathname)) {
        dispatch({
          type: 'otc/otcUserInfo'
        });
      }
    }, 1000 * 60);
  }

  componentDidUpdate(prevProps) {
    if (this.props.theme !== prevProps.theme) {
      this.attachCSSVariables();
    }
    if (this.props.user.id !== prevProps.user.id && this.props.user.id) {
      this.props.dispatch({
        type: 'trading/getUserFavorites'
      });
      mainSocketSend({
        channel: 'sub.margin.personal',
        message: {
          token: this.props.user.token
        }
      });
    }
  }

  componentWillUnmount() {
    if (this.validateInterval) {
      window.clearInterval(this.validateInterval);
      this.validateInterval = null;
    }
  }

  // checkCallApp() {
  //   if (localStorage.getItem('mxc.home.checkTip') === 'true') return;
  //   let check;
  //   Modal.alert(
  //     formatMessage({ id: 'ucenter.phishing.warning' }),
  //     <div className={styles.checkBox}>
  //       <p>{formatMessage({ id: 'layout.title.askJump' })}?</p>
  //       <AgreeItem onChange={e => (check = e.target.checked)}>{formatMessage({ id: 'layout.top.title.never_display' })}</AgreeItem>
  //     </div>,
  //     [
  //       { text: formatMessage({ id: 'common.cancel' }), onPress: () => localStorage.setItem('mxc.home.checkTip', check) },
  //       {
  //         text: formatMessage({ id: 'common.yes' }),
  //         onPress: () => {
  //           localStorage.setItem('mxc.home.checkTip', check);
  //           router.push('/mobileApp');
  //         }
  //       }
  //     ]
  //   );
  // }

  attachCSSVariables() {
    const classList = document.documentElement.classList;
    ['theme-dark', 'theme-light'].forEach(cn => {
      if (classList.contains(cn)) {
        classList.remove(cn);
      }
    });
    classList.add(`theme-${this.props.theme}`);
  }

  listenerScroll(e) {
    const { dispatch } = this.props;
    e.persist();

    if (e.target) {
      dispatch({
        type: 'global/saveTopBarIsStricky',
        payload: e.target.scrollTop > 1
      });
    }
  }

  render() {
    const { location, children } = this.props;
    const findTabBar = tabBar.find(r => {
      let isMatch = false;
      if (r.path instanceof Array) {
        isMatch = r.path.includes(location.pathname);
      } else {
        isMatch = r.path === location.pathname;
      }
      return isMatch;
    });
    const matchRoute = findRoute(routes[2].routes, location.pathname);
    const topBar = matchRoute ? matchRoute.topBar : null;
    const fixTheme = matchRoute ? matchRoute.theme : null;
    const fromBrowser = window.localStorage.getItem('mxc.view.from') !== 'app';
    // const fullscreenPath = ['/contract/rank'];

    return (
      <>
        {this.props.theme === 'light' && (
          <Helmet>
            <meta name="theme-color" content="#ffffff" />
          </Helmet>
        )}
        {/* <TransitionGroup component={null}>
          <CSSTransition key={location.pathname} classNames={'route-page-slide'} timeout={250}>
            <div
              style={{
                height: !fromBrowser && fullscreenPath.includes(location.pathname) && 'unset'
              }}
              className={cs(
                'route-page',
                !!topBar && fromBrowser && 'route-page-with-topbar',
                !!findTabBar && fromBrowser && 'route-page-with-tabbar'
              )}
            >
              <div className={'route-page-inner'}>{children}</div>
            </div>
          </CSSTransition>
        </TransitionGroup> */}
        <div
          className={cs(
            'route-page',
            topBar && fromBrowser && 'route-page-with-topbar',
            findTabBar && fromBrowser && 'route-page-with-tabbar',
            fixTheme && `theme-${fixTheme}`
          )}
        >
          {children}
          {!!findTabBar && fromBrowser && <TabBar />}
          {platform.isWechat && /mobileApp/.test(window.location.pathname) && <Wechat />}
        </div>
      </>
    );
  }
}

export default connect(({ setting, auth, otc }) => ({
  theme: setting.theme,
  user: auth.user,
  otcuser: otc.otcuser
}))(BasicLayout);
