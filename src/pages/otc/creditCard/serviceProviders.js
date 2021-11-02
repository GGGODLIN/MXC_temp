import React from 'react';
import { connect } from 'dva';
import styles from './index.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
function QuickTrading({ serviceProvidersList, layerTypeBlock, checkedId, setState, layerServer, theme }) {
  const serverIcon = item => {
    let icon = '';
    if (item === 'moonpay') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmoonpay"></use>
        </svg>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmercuryo"></use>
        </svg>
      );
    }
    if (item === 'banxa') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconsanjiaoxing1"></use>
        </svg>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconmercuryo"></use>
        </svg>
      );
    }
    if (item === 'simplex') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconsimplex"></use>
        </svg>
      );
    }
    if (item === 'menapay') {
      icon = (
        <svg aria-hidden="true">
          <use xlinkHref="#iconMenapay"></use>
        </svg>
      );
    }
    return icon;
  };
  const serverSupportIcon = item => {
    let icon = '';
    if (item === 'moonpay') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconsamsung"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}

          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'banxa') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}

          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'mercuryo') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#icongoogle"></use>
            </svg>
          </div>
        </>
      );
    }
    if (item === 'simplex') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconapple"></use>
              </svg>
            </div>
          )}
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    if (item === 'menapay') {
      icon = (
        <>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconvisa1"></use>
            </svg>
          </div>
          <div className={styles.iconbg}>
            <svg aria-hidden="true">
              <use xlinkHref="#iconmaster"></use>
            </svg>
          </div>
          {theme === 'dark' ? (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard-copy"></use>
              </svg>
            </div>
          ) : (
            <div className={styles.iconbg}>
              <svg aria-hidden="true">
                <use xlinkHref="#iconBankcard"></use>
              </svg>
            </div>
          )}
        </>
      );
    }
    return icon;
  };

  const serverListFun = () => {
    return serviceProvidersList.map(item => {
      return (
        <div
          className={classNames([styles.serverList, checkedId === item && styles.serverActive])}
          key={item}
          onClick={() => {
            setState({
              checkedId: item,
              layerServer: 'none'
            });
          }}
        >
          {checkedId === item && (
            <div className={styles.activeIcon}>
              <i className="iconfont iconconfirm"></i>
            </div>
          )}

          <div className={styles.headerContent}>
            {serverIcon(item)}
            <div className={styles.serverName}>{item}</div>
            <div className={styles.serverSelectIcon}></div>
          </div>
          <div className={classNames([styles.serverIconList, styles.flexWrap])}>{serverSupportIcon(item)}</div>
        </div>
      );
    });
  };

  return (
    <div>
      <div style={{ display: layerServer }} className={styles.coinModel}>
        <div className={styles.layer}></div>
        <div className={styles.creditCardCoin}>
          <div className={styles.headerCoin}>
            <div className={styles.filterTitle}>{formatMessage({ id: 'mc_creditCard_server' })}</div>
            <div
              onClick={() => {
                setState({
                  layerServer: 'none'
                });
              }}
            >
              <i className="iconfont iconquxiao1"></i>
            </div>
          </div>
          <div className={styles.creditCoin}>
            <div className={styles.filterList}>
              <div className={styles.serverContent}>{serverListFun()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, otc }) => ({
  theme: setting.theme,
  otcuser: otc.otcuser
}))(QuickTrading);
