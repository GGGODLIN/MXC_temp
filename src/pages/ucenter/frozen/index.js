import React, { useCallback, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import classNames from 'classnames';
import { getLocale, formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import SecureCheck from '@/components/SecureCheck';
import { frozenAccount, userLogout, userCenterLogout } from '@/services/api';
import { Flex, WingBlank, WhiteSpace, Button, TextareaItem, Modal, Checkbox, Toast } from 'antd-mobile';

import styles from './index.less';
import commonStyles from '../common.less';

function Frozen({ dispatch, form: { validateFields } }) {
  const [currentBtn, setCurrentBtn] = useState();
  const [currentReason, setCurrentReason] = useState();
  const [showCustom, setShowCustom] = useState(false);

  const submitHandle = useCallback(() => {
    if (currentReason) {
      setConfirmModal(true);
    }
  }, [currentReason]);

  const [confirmModal, setConfirmModal] = useState(false);
  const closeConfirmModal = useCallback(() => {
    setConfirmModal(false);
    setReasonAgree(false);
  }, []);

  const [reasonAgree, setReasonAgree] = useState(false);
  const [showSecureCheckModal, setShowSecureCheckModal] = useState(false);
  const confirmHandle = useCallback(() => {
    setShowSecureCheckModal(true);
  }, [currentReason]);

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

        let result = await frozenAccount({
          ...params,
          reason: currentReason,
          google_auth_code: params.googleAuthCode
        });

        if (result && result.code === 0) {
          Toast.success(formatMessage({ id: 'ucenter.frozen.reason.success.tip' }), 2, () => {
            setSubmitLoading(false);

            signOut();
            setSubmitLoading(false);
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  };

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.features.frozen' })}</TopBar>
      <WhiteSpace size="xl" />
      <WingBlank className={styles.content}>
        <h3>{formatMessage({ id: 'ucenter.frozen.reason.title' })}</h3>
        <Flex className={styles.reasons} justify="between" wrap="wrap">
          <Button
            type={currentBtn === 1 ? 'primary' : 'ghost'}
            inline
            size="small"
            onClick={() => {
              setCurrentBtn(1);
              setCurrentReason(formatMessage({ id: 'ucenter.frozen.reason.text1' }));
            }}
          >
            {formatMessage({ id: 'ucenter.frozen.reason.text1' })}
          </Button>
          <Button
            type={currentBtn === 2 ? 'primary' : 'ghost'}
            inline
            size="small"
            onClick={() => {
              setCurrentBtn(2);
              setCurrentReason(formatMessage({ id: 'ucenter.frozen.reason.text2' }));
            }}
          >
            {formatMessage({ id: 'ucenter.frozen.reason.text2' })}
          </Button>
          <Button
            type={currentBtn === 3 ? 'primary' : 'ghost'}
            inline
            size="small"
            onClick={() => {
              setCurrentBtn(3);
              setCurrentReason(formatMessage({ id: 'ucenter.frozen.reason.text3' }));
            }}
          >
            {formatMessage({ id: 'ucenter.frozen.reason.text3' })}
          </Button>
        </Flex>
        <Flex className={styles.reasons} justify="between" wrap="wrap">
          <Button
            type={currentBtn === 4 ? 'primary' : 'ghost'}
            inline
            size="small"
            onClick={() => {
              setCurrentBtn(4);
              setCurrentReason(formatMessage({ id: 'ucenter.frozen.reason.text4' }));
            }}
          >
            {formatMessage({ id: 'ucenter.frozen.reason.text4' })}
          </Button>
          <Button
            type={currentBtn === 5 ? 'primary' : 'ghost'}
            inline
            size="small"
            onClick={() => {
              setShowCustom(true);
              setCurrentBtn(5);
              setCurrentReason('');
            }}
          >
            {formatMessage({ id: 'ucenter.frozen.reason.other' })}
          </Button>
          <Button style={{ visibility: 'hidden' }} type="ghost" inline size="small"></Button>
        </Flex>

        {showCustom && (
          <TextareaItem
            autoHeight
            className={styles.custom}
            placeholder={formatMessage({ id: 'ucenter.frozen.reason.other.error' })}
            onChange={value => setCurrentReason(value)}
          />
        )}
      </WingBlank>

      <section className={commonStyles['bottom-btn']}>
        <WingBlank>
          <Button type="primary" disabled={!currentReason} loading={submitLoading} onClick={submitHandle}>
            {formatMessage({ id: 'ucenter.frozen.submit' })}
          </Button>
        </WingBlank>
      </section>

      <Modal popup animationType="slide-up" visible={confirmModal} onClose={closeConfirmModal}>
        <div className={styles.confirm}>
          <h3>{formatMessage({ id: 'ucenter.frozen.warning.title' })}</h3>

          <p>1.{formatMessage({ id: 'ucenter.frozen.warning.text1' })}</p>
          <p>2.{formatMessage({ id: 'ucenter.frozen.warning.text2' })}</p>
          <p>3.{formatMessage({ id: 'ucenter.frozen.warning.text3' })}</p>
          <p>4.{formatMessage({ id: 'ucenter.frozen.warning.text4' })}</p>

          <Flex className={styles.handle} justify="between">
            <Flex>
              <Checkbox onChange={e => setReasonAgree(e.target.checked)}>
                <span className={styles['checkbox-tip']}>{formatMessage({ id: 'ucenter.frozen.reason.affirm' })}</span>
              </Checkbox>
            </Flex>
            <Button
              type="warning"
              disabled={!reasonAgree}
              inline
              className={classNames('am-button-circle', styles['submit-btn'])}
              onClick={confirmHandle}
            >
              {formatMessage({ id: 'ucenter.frozen.confirm' })}
            </Button>
          </Flex>
        </div>
      </Modal>

      <SecureCheck
        emailParams={{ type: 'SELF_FROZEN' }}
        smsParams={{ type: 'SELF_FROZEN' }}
        showSecureCheckModal={showSecureCheckModal}
        handleHideSecureCheckModal={() => setShowSecureCheckModal(false)}
        handleSubmitAfter={handleSubmitAfter}
      />
    </>
  );
}

export default connect(({ auth }) => ({
  user: auth.user
}))(createForm()(Frozen));
