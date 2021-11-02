import React, { useState } from 'react';
import { connect } from 'dva';
import cn from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { Toast } from 'antd-mobile';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import TopBar from '@/components/TopBar';

import styles from './index.less';

import wxQrcode from '@/assets/img/info/vip-contact-wx.png';
import equity1 from '@/assets/img/info/vip-equity-1.png';
import equity2 from '@/assets/img/info/vip-equity-2.png';
import equity3 from '@/assets/img/info/vip-equity-3.png';
import equity4 from '@/assets/img/info/vip-equity-4.png';
import equity5 from '@/assets/img/info/vip-equity-5.png';
import equity6 from '@/assets/img/info/vip-equity-6.png';
import equity7 from '@/assets/img/info/vip-equity-7.png';
import equity8 from '@/assets/img/info/vip-equity-8.png';
import equity9 from '@/assets/img/info/vip-equity-9.png';
import equity10 from '@/assets/img/info/vip-equity-10.png';
import equity11 from '@/assets/img/info/vip-equity-11.png';
import equity12 from '@/assets/img/info/vip-equity-12.png';
import equity13 from '@/assets/img/info/vip-equity-13.png';
import equity14 from '@/assets/img/info/vip-equity-14.png';
import equity15 from '@/assets/img/info/vip-equity-15.png';
import equity16 from '@/assets/img/info/vip-equity-16.png';
import equity17 from '@/assets/img/info/vip-equity-17.png';
import equity18 from '@/assets/img/info/vip-equity-18.png';

const language = getLocale();

function Vip() {
  const [currentTabKey, setCurrentTabKey] = useState('gold');
  return (
    <>
      <TopBar>{formatMessage({ id: 'info.title.vip.title' })}</TopBar>
      <div className={styles.wrapper}>
        <section className={styles.header}>
          <h3 className={styles.headerTitle}>{formatMessage({ id: 'mc_vip_title' })}</h3>
          <div className={styles.headerRound1} />
          <div className={styles.headerRound2} />
          <div className={styles.vipCard}>
            <span className={styles.vipCardDomain}>mexc.com</span>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.contentTabs}>
            <div
              className={cn(styles.contentTabPane, styles.contentTabPaneGold, currentTabKey === 'gold' && styles.active)}
              onClick={() => setCurrentTabKey('gold')}
            >
              {formatMessage({ id: 'mc_vip_gold' })}
            </div>
            <div
              className={cn(styles.contentTabPane, styles.contentTabPanePlatinum, currentTabKey === 'platinum' && styles.active)}
              onClick={() => setCurrentTabKey('platinum')}
            >
              {formatMessage({ id: 'mc_vip_platinum' })}
            </div>
          </div>

          {currentTabKey === 'gold' && (
            <div className={styles.contentItem}>
              <div className={cn(styles.commonItem, styles.contact)}>
                {language.startsWith('zh-CN') && (
                  <div className={styles.contactQrcode}>
                    <img src={wxQrcode} alt="wx" />
                  </div>
                )}
                <div>
                  <p className={styles.contactDesc}>
                    <span />
                    {formatMessage({ id: 'mc_vip_contact_email' })}
                  </p>
                  <p className={styles.contactDesc}>
                    <span />
                    {formatMessage({ id: 'mc_vip_contact_other' })}
                  </p>
                  <CopyToClipboard text="@mexc_global_vip" onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }))}>
                    <p className={styles.contactAccount}>
                      Telegram: @mexc_global_vip
                      <span className="iconfont iconcopy" />
                    </p>
                  </CopyToClipboard>
                </div>
              </div>

              <div className={styles.commonItem}>
                <h4 className={styles.equityTitle}>{formatMessage({ id: 'mc_vip_gold_standard' })}</h4>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_trade' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity1} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_1' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity2} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_2' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity3} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_3' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity4} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_4' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity5} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'info.vip.rights.14.title' })}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_zoology' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity10} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_10' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity11} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_11' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity12} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_12' })}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_gift' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity15} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_15' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity16} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_16' })}</p>
                    </div>
                    {language.startsWith('zh-CN') && (
                      <div className={styles.equityItem}>
                        <img className={styles.equityItemImg} src={equity17} alt="equity" />
                        <p className={styles.equityItemText}>{formatMessage({ id: 'info.vip.rights.7.title' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTabKey === 'platinum' && (
            <div className={styles.contentItem}>
              <div className={cn(styles.commonItem, styles.contact)}>
                {language.startsWith('zh-CN') && (
                  <div className={styles.contactQrcode}>
                    <img src={wxQrcode} alt="wx" />
                  </div>
                )}
                <div>
                  <p className={styles.contactDesc}>
                    <span />
                    {formatMessage({ id: 'mc_vip_contact_email' })}
                  </p>
                  <p className={styles.contactDesc}>
                    <span />
                    {formatMessage({ id: 'mc_vip_contact_other' })}
                  </p>

                  {language.startsWith('zh-CN') && (
                    <CopyToClipboard text="Jefferey_Hoon" onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }))}>
                      <p className={styles.contactAccount}>
                        Jefferey_Hoon
                        <span className="iconfont iconcopy" />
                      </p>
                    </CopyToClipboard>
                  )}

                  {!language.startsWith('zh-CN') && (
                    <CopyToClipboard text="@mexc_global_vip" onCopy={() => Toast.success(formatMessage({ id: 'common.copy_success' }))}>
                      <p className={styles.contactAccount}>
                        Telegram: @mexc_global_vip
                        <span className="iconfont iconcopy" />
                      </p>
                    </CopyToClipboard>
                  )}
                </div>
              </div>

              <div className={styles.commonItem}>
                <h4 className={styles.equityTitle}>{formatMessage({ id: 'mc_vip_platinum_standard' })}</h4>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_trade' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity1} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_1' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity2} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_2' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity3} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_3' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity4} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_4' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity5} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'info.vip.rights.14.title' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity6} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_6' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity7} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_7' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity8} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_8' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity9} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_9' })}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_zoology' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity10} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_10' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity11} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_11' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity12} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_12' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity13} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_13' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity14} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_14' })}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.equityContent}>
                  <h5 className={styles.equityContentTitle}>
                    <span className={styles.equityContentLineLeft} />
                    {formatMessage({ id: 'mc_vip_equity_gift' })}
                    <span className={styles.equityContentLineRight} />
                  </h5>

                  <div className={styles.equityList}>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity15} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_15' })}</p>
                    </div>
                    <div className={styles.equityItem}>
                      <img className={styles.equityItemImg} src={equity16} alt="equity" />
                      <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_16' })}</p>
                    </div>
                    {language.startsWith('zh-CN') && (
                      <>
                        <div className={styles.equityItem}>
                          <img className={styles.equityItemImg} src={equity17} alt="equity" />
                          <p className={styles.equityItemText}>{formatMessage({ id: 'mc_vip_equity_17' })}</p>
                        </div>
                        <div className={styles.equityItem}>
                          <img className={styles.equityItemImg} src={equity18} alt="equity" />
                          <p className={styles.equityItemText}>{formatMessage({ id: 'info.vip.rights.6.title' })}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Vip);
