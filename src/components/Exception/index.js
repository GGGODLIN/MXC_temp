import React, { createElement } from 'react';
import classNames from 'classnames';
import { Button } from 'antd-mobile';
import config from './typeConfig';
import router from 'umi/router';

import styles from './index.less';

class Exception extends React.PureComponent {
  static defaultProps = {
    backText: 'back to home',
    redirect: '/'
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { className, backText, linkElement = 'a', type, title, desc, img, actions, redirect, ...rest } = this.props;
    const pageType = type in config ? type : '404';
    const clsString = classNames(styles.exception, className);
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock}>
          <div className={styles.imgEle} style={{ backgroundImage: `url(${img || config[pageType].img})` }} />
        </div>
        <div className={styles.content}>
          <h1>{title || config[pageType].title}</h1>
          <div className={styles.desc}>{desc || config[pageType].desc}</div>
          <div className={styles.actions}>
            {actions || (
              <Button type="primary" onClick={() => router.replace(redirect)}>
                {backText}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Exception;
