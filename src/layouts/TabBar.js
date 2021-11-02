import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import cs from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { tabBar } from '@/utils/route';

import styles from './TabBar.less';

class TabBar extends Component {
  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    const { location } = this.props;
    const { pathname } = location;
    return (
      <div className={cs(styles.wrapper)}>
        <div className={styles.inner}>
          {tabBar.map(r => {
            // const isActive = r.path === pathname;
            let isActive = false;
            if (r.path instanceof Array) {
              isActive = r.path.includes(pathname);
            } else {
              isActive = r.path === pathname;
            }
            const _path = r.path instanceof Array ? r.path[0] : r.path;
            return (
              <div key={_path} className={cs(styles.item, isActive && styles.active)} onClick={() => router.push(_path)}>
                <div className={cs(styles.imgContainer)}>
                  <img src={isActive ? r.iconActive : r.icon} alt={r.title} className={cs(isActive && styles.bounding)} />
                </div>
                <div>{r.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withRouter(TabBar);
