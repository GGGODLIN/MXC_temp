import router from 'umi/router';
import styles from './index.less';
import { connect } from 'dva';

const StickyBar = ({ children, goback = true, extra, location, isSticky = false, gotoPath, initialHistoryLength, transparent = false }) => {
  const fromBrowser = window.localStorage.getItem('mxc.view.from') !== 'app';
  return fromBrowser ? (
    <div className={`${styles.wrapper} ${transparent ? '' : isSticky ? styles.isSticky : ''}`}>
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
      <div>{children}</div>
      {extra && <div className={styles.extra}>{extra}</div>}
    </div>
  ) : null;
};

export default connect(({ global }) => ({
  isSticky: global.topBarIsStricky,
  initialHistoryLength: global.initialHistoryLength
}))(StickyBar);
