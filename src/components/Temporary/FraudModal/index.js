import React, { useEffect, useState } from 'react';
import { Button, Modal, Checkbox } from 'antd-mobile';
import moment from 'moment';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { getSubSite } from '@/utils';

import styles from './index.less';

const lang = getLocale();

function Container() {
  const [visible, setVisible] = useState(false);
  const [noTip, setNoTip] = useState(true);

  useEffect(() => {
    if (lang.startsWith('zh-')) {
      const localExpiresTime = window.localStorage.getItem('mexc_fraud_modal_expires');
      const shouldShowVisible = !localExpiresTime || Number(localExpiresTime) < Date.now();
      setVisible(shouldShowVisible);
    }
  }, []);

  const noTipChangeHandle = e => {
    setNoTip(e.target.checked);
  };

  const confirmHandle = (paramNoTip = noTip) => {
    if (paramNoTip) {
      window.localStorage.setItem(
        'mexc_fraud_modal_expires',
        moment()
          .endOf('days')
          .format('x')
      );
    }

    setVisible(false);
  };

  const detailClickHandle = () => {
    // router.push('/official-verify')
    window.open(`${getSubSite('main')}/${lang}/official-verify`);
    confirmHandle(true);
  };

  return lang.startsWith('zh-') ? (
    <Modal transparent maskClosable={false} className={styles.wrapper} visible={visible}>
      <h4 className={styles.title}>{lang.startsWith('zh-CN') ? '关于谨防新型诈骗的提示' : '關於謹防新型詐騙的提示'}</h4>

      <div className={styles.content}>
        <p className={styles.text}>
          {lang.startsWith('zh-CN') ? (
            <>
              任何电话、短信通知用户涉及<span>黑币交易匿名转账</span>/<span>清退</span>/<span>账号异常</span>/<span>账号受限制</span>
              ，要求您提供任何验证码/共享屏幕/转账/提币至安全账号/“安全平台“等，均属于诈骗行为。
            </>
          ) : (
            <>
              任何電話、短信通知用戶涉及<span>黑幣交易匿名转账</span>/<span>清退</span>/<span>賬號異常</span>/<span>賬號受限制</span>
              ，要求您提供任何驗證碼/共享屏幕/轉賬/提幣至安全賬號/“安全平台“等，均屬於詐騙行為。
            </>
          )}
        </p>

        <p className={styles.text}>
          {lang.startsWith('zh-CN') ? '通过官方线上客服、验证通道等多方求证更安全' : '通過官方線上客服、驗證通道等多方求證更安全'}
        </p>
      </div>

      <div className={styles.handle}>
        <Button type="primary" className={styles.confirm} block={true} onClick={() => confirmHandle()}>
          {lang.startsWith('zh-CN') ? '我已知晓' : '我已知曉'}
        </Button>
        <Button type="ghost" inline className={styles.link} onClick={detailClickHandle}>
          {lang.startsWith('zh-CN') ? '查看详情' : '查看詳情'}
        </Button>
      </div>

      <div className={styles.checkbox}>
        <Checkbox checked={noTip} onChange={noTipChangeHandle}>
          {lang.startsWith('zh-CN') ? '今日不再提示' : '今日不再提示'}
        </Checkbox>
      </div>
    </Modal>
  ) : null;
}

export default Container;
