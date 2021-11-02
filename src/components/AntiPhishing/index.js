import { useEffect, useState } from 'react';
import { Modal, Checkbox, Button } from 'antd-mobile';
import { getWebsitePing } from '@/services/api';
import { formatMessage } from 'umi/locale';

import styles from './index.less';
import bulb from '@/assets/img/anti-phishing-bulb.png';
import Signal from '@/components/Signal';

const PING_ERROR_TIME = 9999;
const MALength = 3;
let cacheSites = [];
const AntiPhishing = () => {
  const [siteDetails, setSiteDetails] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    if (window.SITESDATA) {
      const { host } = window.location;
      const _sites = [...window.SITESDATA.sites].map(site => site.replace('www', 'm'));
      if (!_sites.some(site => site === host)) {
        setVisible(true);
        cacheSites = _sites.map((site, idx) => ({
          site,
          pingStack: []
        }));
        getSitesPing(_sites);
      }
    }
  }, [window.SITESDATA]);

  const closeHandle = () => {
    setVisible(false);
  };

  const getSitesPing = sites => {
    sites.forEach((site, idx) => {
      setTimeout(() => {
        if (site) {
          let startTime = new Date().getTime();
          getWebsitePing(`//www.${site.slice(2)}`).then(res => {
            let endTime = new Date().getTime();
            let readablePing = res.code === 0 ? endTime - startTime : PING_ERROR_TIME;
            const detail = cacheSites[idx];
            detail.pingLatest = readablePing;
            detail.pingStack.push(readablePing);
            if (detail.pingStack.length > MALength) {
              detail.pingStack = detail.pingStack.slice(-1 * MALength);
            }
            detail.pingMA = detail.pingStack.reduce((a, c) => a + c, 0) / detail.pingStack.length;
            const newSites = [...cacheSites];
            setSiteDetails(newSites);
          });
        }
      }, idx * 200);
    });
  };

  return (
    <div>
      <Modal
        width={295}
        wrapClassName={styles.modal}
        keyboard={false}
        maskClosable={false}
        closable={false}
        title={null}
        footer={[]}
        visible={visible}
        onCancel={closeHandle}
      >
        <div className={styles.banner}>
          <img src={bulb} alt="MEXC交易所" />
          <h2>{formatMessage({ id: 'antiphishing.tip.title' })}</h2>
        </div>
        <div className={styles.content}>
          <p className={styles.tip}>
            <i className="iconfont icontips"></i> {formatMessage({ id: 'antiphishing.tip.title2' })}
          </p>
          {siteDetails.map(item => (
            <a className={styles.site} rel="nofollow noopener noreferrer" target="_blank" href={`https://${item.site}`}>
              <i className="iconfont iconic_safe"></i> <span>{item.site}</span> <Signal strength={item.pingMA} />
            </a>
          ))}
          <p className={styles.checkbox}>
            <Checkbox
              checked={isRead}
              onChange={e => {
                setIsRead(e.target.checked);
              }}
            >
              {formatMessage({ id: 'antiphishing.tip.i-know' })}
            </Checkbox>
          </p>
        </div>
        <div className={styles.btn}>
          <Button type="primary" inline disabled={!isRead} onClick={closeHandle}>
            {formatMessage({ id: 'common.sure' })}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AntiPhishing;
