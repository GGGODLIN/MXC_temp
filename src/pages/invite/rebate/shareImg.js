import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import { getSubSite } from '@/utils';
import QRCode from 'qrcode.react';
import styles from './shareImg.less';
import { Checkbox, Toast } from 'antd-mobile';
import { browserPlatform } from '@/utils';
const AgreeItem = Checkbox.AgreeItem;
const locale = getLocale();

const imgOne = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_1.png';
const imgOneEn = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_1_en.png';
const imgTwo = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_2.png';
const imgTwoEn = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_2_en.png';
const imgThree = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_3.png';
const imgThreeEn = 'https://imagesmxc.oss-cn-shenzhen.aliyuncs.com/invite_poster_3_en.png';
const postList = [
  {
    url: locale.startsWith('zh') ? imgOne : imgOneEn,
    alt: '',
    value: 1
  },
  {
    url: locale.startsWith('zh') ? imgTwo : imgTwoEn,
    alt: '',
    value: 2
  },
  {
    url: locale.startsWith('zh') ? imgThree : imgThreeEn,
    alt: '',
    value: 3
  }
];

const posterWidth = 760;
const posterHeight = 1340;
const qrWidth = 150;
const sideMarginWidth = 50;
const sideMarginHeight = 30;

function ShareImg(props) {
  const [post, setPost] = useState(postList[0]);
  const [imgurl, setImgUrl] = useState();
  // const [downImgUrl, setDownImgUrl] = useState();
  const urlSuffix = locale.startsWith('zh') ? '' : '_en';
  const inviteCode = props.inviteCode;
  const inviteUrl = props.inviteUrl;
  const bgUrl = encodeURIComponent(`/invite_poster_${post.value}${urlSuffix}.jpg`);
  const qrUrl =
    NODE_ENV === 'production' && inviteUrl && /^(https?):\/\/.+$/.test(inviteUrl)
      ? inviteUrl
      : `${window.location.origin}/auth/signup?inviteCode=${inviteCode}`;
  const href = `${getSubSite('main')}/api/member/ucenter/gen_report?bgurl=${bgUrl}&qrurl=${qrUrl}`;
  const QRwidth = (100 * window.innerWidth) / 375;
  useEffect(() => {
    changeCanvasToPic();
  }, []);
  const changeCanvasToPic = () => {
    var Qr = document.getElementById('qrCode');
    let image = new Image();
    image.src = Qr.toDataURL('image/png');
    // console.log(image.src);
    setImgUrl(image.src);
  };
  const dowImg = () => {
    if (browserPlatform().isWechat)
      return Toast.info(`${formatMessage({ id: 'download.title.arrow-text-1' })},${formatMessage({ id: 'download.title.arrow-text-2' })}`);
    let canvas = document.createElement('canvas');
    canvas.width = posterWidth;
    canvas.height = posterHeight;
    let ctx = canvas.getContext('2d');
    ctx.rect(0, 0, posterWidth, posterHeight);
    ctx.fillStyle = '';
    ctx.fill();
    // 这里加上时间戳，防止加载浏览器缓存的图片，否则会报跨域错误
    loadImg([post.url + '?t=' + Date.now(), imgurl]).then(([img1, img2]) => {
      ctx.drawImage(img1, 0, 0, posterWidth, posterHeight);
      ctx.drawImage(img2, posterWidth - qrWidth - sideMarginWidth, posterHeight - qrWidth - sideMarginHeight, qrWidth, qrWidth);
      let imageURL = canvas.toDataURL('image/png');
      let img3 = new Image();
      img3.src = imageURL;
      const a_link = document.createElement('a');
      a_link.href = img3.src;
      a_link.download = `MXC_POSTER_${post.value}.png`;
      canvas.style.display = 'none';
      a_link.click();
    });
  };
  const loadImg = src => {
    const paths = Array.isArray(src) ? src : [src];
    const promise = [];
    paths.forEach(path => {
      promise.push(
        new Promise((resolve, reject) => {
          let img = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.src = path;
          img.onload = () => {
            resolve(img);
          };
          img.onerror = err => {
            console.log('图片加载失败');
          };
        })
      );
    });
    return Promise.all(promise);
  };

  return (
    <div className={styles.shareImgContent}>
      <div>
        <QRCode value={qrUrl} size={QRwidth} id="qrCode" className={styles.qrcode} />
        <img alt="qrcode" src={imgurl} id="qrcodeimg" className={styles.qrcode} />
      </div>
      <div className="box"></div>
      <div className={styles.shareImgList}>
        {postList.map((item, key) => {
          return (
            <div
              className={classNames(styles.post, item.value === post.value && styles.postActive)}
              key={item.value}
              onClick={() => setPost(item)}
            >
              <img alt={item.alt} src={item.url} />
              <AgreeItem key={item.value} checked={post.value === item.value} className={styles.checkBox}></AgreeItem>
            </div>
          );
        })}
      </div>

      <div className={styles.imgokBtn} onClick={() => dowImg()}>
        {formatMessage({ id: 'invite.posters.iphone' })}
      </div>
    </div>
  );
}
export default connect(({ auth }) => ({
  user: auth.user
}))(ShareImg);
