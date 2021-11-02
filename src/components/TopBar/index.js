import React, { Component } from 'react';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import routes from '../../../config/routes';
import { findRoute } from '@/utils/route';
import { connect } from 'dva';

import styles from './index.less';

class TopBar extends Component {
  componentDidUpdate() {}

  render() {
    const { children, goback = true, extra, location, gotoPath, initialHistoryLength } = this.props;
    const matchRoute = findRoute(routes[2].routes, location.pathname);
    const bar = matchRoute ? matchRoute.topBar : null;
    const fromBrowser = window.localStorage.getItem('mxc.view.from') !== 'app';
    return bar && fromBrowser ? (
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          {goback && (
            <div
              className={styles.arrow}
              onClick={() => {
                // if (gotoPath) {
                //   router.push(gotoPath);
                // } else if (window.history.length >= 50 || window.history.length - initialHistoryLength > 0) {
                //   router.goBack();
                // } else {
                //   router.replace('/');
                // }
                if (window.history.length >= 50 || window.history.length - initialHistoryLength > 0) {
                  router.goBack();
                } else {
                  router.replace('/');
                }
              }}
            >
              <i className="iconfont iconfanhui"></i>
            </div>
          )}
          {children || bar.title}
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      </div>
    ) : null;
  }
}

export default withRouter(
  connect(({ global }) => ({
    initialHistoryLength: global.initialHistoryLength
  }))(TopBar)
);
