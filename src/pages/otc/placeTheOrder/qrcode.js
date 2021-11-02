import React, { useState, createContext, useContext, useReducer, useEffect } from 'react';
import { connect } from 'dva';
import styles from './qrcode.less';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { getSubSite } from '@/utils';

function downImg(url) {
  var Img = new Image(),
    dataURL = '';
  Img.src = url + '?v=' + Math.random();
  Img.setAttribute('crossOrigin', 'Anonymous');
  Img.onload = function() {
    var canvas = document.createElement('canvas'),
      width = Img.width,
      height = Img.height;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(Img, 0, 0, width, height);
    dataURL = canvas.toDataURL('image/png');
    const a_link = document.createElement('a');
    a_link.href = dataURL;
    a_link.download = `MEXC_Order.png`;
    a_link.click();
  };
}
function QuickTrading(props) {
  const { imgQrcodeVisble, setImgQrcodeVisble, imgQrcode } = props;
  useEffect(() => {}, []);
  let imgUrl = `${getSubSite('main')}/api/file/download/${imgQrcode}`;
  return (
    <div className={styles.qrcodeContent} style={{ display: imgQrcodeVisble }}>
      <div className={styles.imgContent}>
        <img src={`${getSubSite('main')}/api/file/download/${imgQrcode}`} />
        <div
          className={styles.saveImg}
          onClick={() => {
            downImg(imgUrl);
          }}
        >
          <i className="iconfont iconic_download"></i>
          {formatMessage({ id: 'otc.complaint.save' })}
        </div>
        <div className={styles.closeConten} onClick={() => setImgQrcodeVisble('none')}>
          <i className="iconfont iconquxiao1"></i>
        </div>
      </div>
    </div>
  );
}
export default connect(({ setting, assets, auth, global }) => ({
  theme: setting.theme,
  user: auth.user
}))(QuickTrading);
