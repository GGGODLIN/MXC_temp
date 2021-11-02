import React, { Component } from 'react';
import cn from 'classnames';
import styles from './index.less';
import { formatMessage } from 'umi-plugin-locale';
import { connect } from 'dva';
class Empty extends Component {
  render() {
    const { style, className, initialTheme, theme, title } = this.props;
    return (
      <div style={style} className={cn(className, styles.wrapper)}>
        {(initialTheme || theme) === 'dark' ? (
          <svg aria-hidden="true">
            <use xlinkHref="#iconwushujutubiao-dark"></use>
          </svg>
        ) : (
          <svg aria-hidden="true">
            <use xlinkHref="#iconwushujutubiao-light"></use>
          </svg>
        )}

        <div>{title ? title : formatMessage({ id: 'common.nodata' })}</div>
      </div>
    );
  }
}

export default connect(({ setting }) => ({
  theme: setting.theme
}))(Empty);
