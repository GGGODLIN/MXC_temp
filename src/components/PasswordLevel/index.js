import React from 'react';
import cn from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { passwordReg } from '@/utils/regExp';

import styles from './index.module.less';

const language = getLocale();

function Container({ value }) {
  let level;

  // 密码可输入字符
  if (passwordReg.base.test(value) && passwordReg.length.test(value)) {
    // 必须是数字字母组合
    if (passwordReg.strong.test(value)) {
      if (/[A-Z]/.test(value) && /[^A-Za-z\d]/.test(value)) {
        level = 'high';
      } else if (/[A-Z]/.test(value) || /[^A-Za-z\d]/.test(value)) {
        level = 'middle';
      } else {
        level = 'low';
      }
    } else {
      level = 'low';
    }
  } else {
    level = 'low';
  }

  return (
    value && (
      <div className={styles.wrapper}>
        <div
          className={cn(styles.passwordLevel, {
            [styles.low]: level === 'low',
            [styles.middle]: level === 'middle',
            [styles.high]: level === 'high'
          })}
        >
          <div className={styles.passwordLevelProgress}>
            <span />
            <span />
            <span />
          </div>

          <div>
            {formatMessage({ id: 'ucenter.change_password.level' })}
            {language.startsWith('zh-') ? '：' : ':'}
            {level === 'low' && (
              <span className={styles.passwordLevelTip}>{formatMessage({ id: 'ucenter.change_password.level.low' })}</span>
            )}
            {level === 'middle' && (
              <span className={styles.passwordLevelTip}>{formatMessage({ id: 'ucenter.change_password.level.middle' })}</span>
            )}
            {level === 'high' && (
              <span className={styles.passwordLevelTip}>{formatMessage({ id: 'ucenter.change_password.level.high' })}</span>
            )}
          </div>
        </div>
      </div>
    )
  );
}

export default Container;
