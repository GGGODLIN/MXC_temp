import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import { getInviteRebateInfo } from '@/services/api';
import styles from './shareImg.less';
import header from '@/assets/img/etfRank/header.png';
import footer from '@/assets/img/etfRank/footer.png';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';

const ShareImg = ({ visible, setVisible, info = {} }) => {
  const [inviteCode, setinviteCode] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const ref = useRef(null);
  const download = e => {
    e.preventDefault();
    html2canvas(ref.current).then(canvas => {
      let imageURL = canvas.toDataURL('image/png');
      let img = new Image();
      img.setAttribute('crossOrigin', 'Anonymous');
      img.src = imageURL;
      const a_link = document.createElement('a');
      a_link.href = img.src;
      a_link.download = `MXC_ETFRANK.png`;
      canvas.style.display = 'none';
      a_link.click();
    });
  };
  const userRecord = async () => {
    const res = await getInviteRebateInfo();

    if (res.code === 0) {
      setinviteCode(res.inviteCode);
      setInviteUrl(res.url);
    }
  };

  useEffect(() => {
    userRecord();
  }, []);
  const qrUrl =
    NODE_ENV === 'production' && inviteUrl && /^(https?):\/\/.+$/.test(inviteUrl)
      ? inviteUrl
      : `${window.location.origin}/auth/signup?inviteCode=${inviteCode}`;

  return (
    <>
      {visible && (
        <div className={styles.container}>
          <div className={styles.shareWrapper}>
            <div className={styles.shareInfo} ref={ref} id="shareEtfRank">
              <img className={styles.header} src={header} alt={''} />
              <div className={styles.middle}>
                <div className={styles.slogen}>
                  <h3>{formatMessage({ id: 'etf.rank.title' })}</h3>
                  <p>{formatMessage({ id: 'etf.rank.introduce' })}</p>
                </div>
                <div className={styles.profitRate}>
                  <h2>
                    {info.incomeRate > 0 ? '+' : info.incomeRate < 0 ? '-' : ''}
                    {info.incomeRate || 0}
                  </h2>
                  <p>{formatMessage({ id: 'etf.rank.today_rate' })}</p>
                </div>
                <div className={styles.rank}>
                  <div className={styles.first}>
                    <span>{formatMessage({ id: 'etf.rank.today_amount' })}</span>
                    <b>{info.rank > 500 ? '500+' : info.rank}</b>
                  </div>
                  <div>
                    <span>{formatMessage({ id: 'etf.rank.highest_currency' })}</span>
                    <b>{info.currency || 'USDT'} </b>
                  </div>
                </div>
              </div>
              <div className={styles.footer}>
                <QRCode value={qrUrl} includeMargin={true} size={68} id="qrCode" className={styles.qr} />
                <img className={styles.footerBg} src={footer} alt={''} />
              </div>
            </div>
            <div className={styles.btns}>
              <div className={styles.download} onClick={download}>
                {formatMessage({ id: 'etf.rank.confirm_share' })}
              </div>
              <div className={styles.cancel} onClick={() => setVisible(false)}>
                {formatMessage({ id: 'common.cancel' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default connect(({ auth }) => ({
  user: auth.user
}))(ShareImg);
