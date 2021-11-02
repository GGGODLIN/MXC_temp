import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { InputItem, Flex, Toast, WingBlank, WhiteSpace, Button } from 'antd-mobile';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import SecureCheck from '@/components/SecureCheck';
import { changePassword, userLogout, userCenterLogout } from '@/services/api';
import md5 from 'js-md5';
import { passwordReg } from '@/utils/regExp';
import PasswordLevel from '@/components/PasswordLevel';

import styles from './index.less';
import commonStyles from '../common.less';

const language = getLocale();

function ChangePassword({ loginMember, dispatch, form: { getFieldProps, getFieldError, getFieldValue, validateFields, isFieldTouched } }) {
  const [oldLook, setOldLook] = useState(false);
  const [newLook, setNewLook] = useState(false);
  const [confirmLook, setConfirmLook] = useState(false);

  useEffect(() => {
    if (!loginMember) {
      dispatch({ type: 'auth/getUcenterIndexInfo' });
    }
    validateFields();
  }, []);

  const signOut = useCallback(() => {
    userCenterLogout().then(res => {
      if (Number(res.code) !== 0) {
        return;
      }
      userLogout().then(result => {
        if (result.code === 0) {
          dispatch({
            type: 'auth/saveCurrentUser',
            payload: {}
          });
        }
      });
    });
  }, []);

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmitAfter = params => {
    validateFields(async (err, values) => {
      if (!err) {
        setSubmitLoading(true);

        let result = await changePassword({
          ...params,
          account: loginMember.account,
          oldPwd: md5(values.oldPassword),
          newPwd: md5(values.newPassword),
          google_auth_code: params.googleAuthCode,
          type: 'CHANGE_PASSWORD'
        });

        if (result && result.code === 0) {
          Toast.success(formatMessage({ id: 'ucenter.change_password.success' }), 2, () => {
            setSubmitLoading(false);

            signOut();
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  };

  const [showSecureCheckModal, setShowSecureCheckModal] = useState(false);
  const submitHandle = () => {
    setShowSecureCheckModal(true);
  };

  const newPasswordHandle = (rule, value, callback, source, options) => {
    const newPasswordConfirm = getFieldValue('confirmNewPassword');

    if (newPasswordConfirm) {
      validateFields(['confirmNewPassword']);
    }

    callback();
  };

  const confirmNewPasswordHandle = (rule, value, callback, source, options) => {
    if (value && value !== getFieldValue('newPassword')) {
      callback(formatMessage({ id: 'common.validate.pwd.no_match' }));
    }

    callback();
  };

  let oldErrors = getFieldError('oldPassword'),
    newErrors = getFieldError('newPassword'),
    confirmErrors = getFieldError('confirmNewPassword');

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.change_password.title' })}</TopBar>
      <section className={commonStyles['tip-wrapper']}>
        <p className={commonStyles.tip}>{formatMessage({ id: 'ucenter.change.password.tip' })}</p>
      </section>
      <WhiteSpace size="xl" />
      <WingBlank>
        <h3 className={styles.title}>{formatMessage({ id: 'ucenter.change_password.desc' })}</h3>

        <section className={styles.item}>
          <InputItem
            {...getFieldProps('oldPassword', {
              rules: [{ required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) }]
            })}
            placeholder={formatMessage({ id: 'ucenter.change_password.old' })}
            extra={
              <i className={classNames('iconfont', [oldLook ? 'iconkejian' : 'iconbukejian'])} onClick={() => setOldLook(!oldLook)}></i>
            }
            type={oldLook ? 'text' : 'password'}
          />

          <p className={commonStyles.error}>{oldErrors && isFieldTouched('oldPassword') ? oldErrors.join(',') : ''}</p>
        </section>

        <section className={styles.item}>
          <InputItem
            {...getFieldProps('newPassword', {
              rules: [
                { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
                { pattern: passwordReg.base, message: formatMessage({ id: 'mc_common_password_format' }) },
                {
                  validator: (rule, value, callback) => {
                    if (!passwordReg.length.test(value) || !passwordReg.strong.test(value) || !passwordReg.strong2.test(value)) {
                      callback(
                        [
                          formatMessage({ id: 'mc_common_password_length_tip' }),
                          formatMessage({ id: 'mc_common_password_strong_tip' }),
                          formatMessage({ id: 'mc_common_password_strong2_tip' })
                        ].join(language.startsWith('zh-') ? '，' : ',')
                      );
                    }

                    callback();
                  }
                },
                { validator: newPasswordHandle }
              ]
            })}
            placeholder={formatMessage({ id: 'ucenter.change_password.new' })}
            extra={
              <i className={classNames('iconfont', [newLook ? 'iconkejian' : 'iconbukejian'])} onClick={() => setNewLook(!newLook)}></i>
            }
            type={newLook ? 'text' : 'password'}
          />

          {isFieldTouched('newPassword') && <PasswordLevel value={getFieldValue('newPassword')} />}
          <p className={commonStyles.error}>{newErrors && isFieldTouched('newPassword') ? newErrors.join(',') : ''}</p>
        </section>

        <section className={styles.item}>
          <InputItem
            {...getFieldProps('confirmNewPassword', {
              rules: [
                { required: true, message: formatMessage({ id: 'common.validate.pwd.require' }) },
                { validator: confirmNewPasswordHandle }
              ]
            })}
            placeholder={formatMessage({ id: 'ucenter.change_password.new_confirm' })}
            extra={
              <i
                className={classNames('iconfont', [confirmLook ? 'iconkejian' : 'iconbukejian'])}
                onClick={() => setConfirmLook(!confirmLook)}
              />
            }
            type={confirmLook ? 'text' : 'password'}
          />

          <p className={commonStyles.error}>{confirmErrors && isFieldTouched('confirmNewPassword') ? confirmErrors.join(',') : ''}</p>
        </section>

        {/*<section className={styles.item}>*/}
        {/*  <p className={styles['change-tip']}>{formatMessage({ id: 'ucenter.change_password.warning' })}</p>*/}
        {/*</section>*/}
      </WingBlank>

      <section className={commonStyles['bottom-btn']}>
        <WingBlank>
          <Button type="primary" disabled={oldErrors || newErrors || confirmErrors} loading={submitLoading} onClick={submitHandle}>
            {formatMessage({ id: 'common.yes' })}
          </Button>
        </WingBlank>
      </section>

      <SecureCheck
        countdownTimeLimit={120}
        emailParams={{ type: 'CHANGE_PASSWORD' }}
        smsParams={{ type: 'CHANGE_PASSWORD' }}
        showSecureCheckModal={showSecureCheckModal}
        handleHideSecureCheckModal={() => setShowSecureCheckModal(false)}
        handleSubmitAfter={handleSubmitAfter}
      />
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user,
  loginMember: auth.loginMember
}))(createForm()(ChangePassword));
