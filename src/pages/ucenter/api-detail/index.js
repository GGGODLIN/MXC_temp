import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { Button, Flex, InputItem, Modal, WhiteSpace, WingBlank, Toast } from 'antd-mobile';
import { timeToString } from '@/utils';
import { createForm } from 'rc-form';
import { ipWhiteListReg } from '@/utils/regExp';
import { apiKeyHandle } from '@/services/api';
import router from 'umi/router';

import apiDetailBg from '@/assets/img/ucenter/api_detail_bg.png';
import styles from './index.less';
import commonStyles from '../common.less';

function renderStatus(status) {
  switch (status) {
    case 1:
      return formatMessage({ id: 'assets.recharge.status.normal' });
    case 2:
      return formatMessage({ id: 'assets.recharge.status.invalid' });
    default:
      return '--';
  }
}

function APIDetail({ apiKeyList, dispatch, match, form: { getFieldProps, isFieldTouched, getFieldError, validateFields } }) {
  useEffect(() => {
    if (!apiKeyList) {
      dispatch({ type: 'api/getApiKeyList' });
    }
  }, []);

  const currentApiKey = useMemo(() => {
    if (apiKeyList) {
      return apiKeyList.find(item => item.id === match.params.id);
    } else {
      return null;
    }
  }, [apiKeyList]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const handleEdit = useCallback(() => {
    validateFields(async (err, values) => {
      if (!err) {
        setSubmitLoading(true);

        let result = await apiKeyHandle(
          {
            apiKeyId: match.params.id,
            memo: values.remark.trim(),
            ipWhiteList: values.ipAddress
          },
          'update'
        );

        if (result && result.code === 0) {
          dispatch({ type: 'api/getApiKeyList' });

          Toast.success(formatMessage({ id: 'ucenter.api.table.edit.success' }), 2, () => {
            setSubmitLoading(false);
            setEditModalVisible(false);
          });
        } else {
          setSubmitLoading(false);
        }
      }
    });
  });

  return (
    <>
      <TopBar>{formatMessage({ id: 'ucenter.api.detail' })}</TopBar>
      {currentApiKey && (
        <>
          <WhiteSpace size="xl" />
          <Flex justify="between" className={styles['api-wrapper']}>
            <div className={styles.api}>
              <p>{formatMessage({ id: 'ucenter.api.table.key' })}</p>
              <h3>{currentApiKey.accessKey}</h3>
            </div>
            <div className={styles['api-bg']}>
              <img src={apiDetailBg} alt="apiDetailBg" />
            </div>
          </Flex>

          <section className={styles.content}>
            <Flex justify="between" className={styles.item}>
              <span className={styles.key}>{formatMessage({ id: 'ucenter.api.table.time' })}</span>
              <span className={styles.value}>{timeToString(currentApiKey.createTime)}</span>
            </Flex>
            <Flex justify="between" className={styles.item}>
              <span className={styles.key}>{formatMessage({ id: 'ucenter.api.memo' })}</span>
              <span className={styles.value}>{currentApiKey.memo}</span>
            </Flex>
            <Flex justify="between" className={styles.item}>
              <span className={styles.key}>{formatMessage({ id: 'ucenter.api.table.ip' })}</span>
              <span className={styles.value}>{currentApiKey.ipWhiteList || '--'}</span>
            </Flex>
            <Flex justify="between" className={styles.item}>
              <span className={styles.key}>{formatMessage({ id: 'assets.recharge.status' })}</span>
              <span className={styles.value}>{renderStatus(currentApiKey.state)}</span>
            </Flex>
          </section>

          <section className={commonStyles['bottom-btn']}>
            <WingBlank>
              <Button
                type="primary"
                onClick={() => {
                  router.push(`/ucenter/openapi-new?id=${currentApiKey.id}`);
                }}
              >
                {formatMessage({ id: 'ucenter.api.table.edit' })}
              </Button>
            </WingBlank>
          </section>

          <Modal
            popup
            animationType="slide-up"
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            afterClose={() => dispatch({ type: 'api/getApiKeyList' })}
          >
            <WingBlank className={styles.edit}>
              <section className={styles.item}>
                <p className={styles.label}>{formatMessage({ id: 'ucenter.api.memo' })}</p>
                <InputItem
                  {...getFieldProps('remark', {
                    initialValue: currentApiKey.memo,
                    rules: [{ required: true, whitespace: true, message: formatMessage({ id: 'ucenter.api.memo.require' }) }]
                  })}
                  placeholder={formatMessage({ id: 'ucenter.api.memo.require' })}
                />

                <p className={commonStyles.error}>
                  {getFieldError('remark') && isFieldTouched('remark') ? getFieldError('remark').join(',') : ''}
                </p>
              </section>
              <section className={styles.item}>
                <p className={styles.label}>{formatMessage({ id: 'ucenter.api.table.ip' })}</p>
                <InputItem
                  {...getFieldProps('ipAddress', {
                    initialValue: currentApiKey.ipWhiteList,
                    rules: [{ pattern: ipWhiteListReg, message: formatMessage({ id: 'ucenter.api.ip.error' }) }]
                  })}
                  placeholder={formatMessage({ id: 'ucenter.api.ip' })}
                />

                <p className={styles['ip-tip']}>{formatMessage({ id: 'ucenter.api.ip.tip' })}</p>
                <p className={commonStyles.error}>
                  {getFieldError('ipAddress') && isFieldTouched('ipAddress') ? getFieldError('ipAddress').join(',') : ''}
                </p>
              </section>

              <Button
                type="primary"
                disabled={getFieldError('remark') || getFieldError('ipAddress')}
                loading={submitLoading}
                onClick={handleEdit}
              >
                {formatMessage({ id: 'common.sure' })}
              </Button>
            </WingBlank>
          </Modal>
        </>
      )}
    </>
  );
}

export default connect(({ api }) => ({
  apiKeyList: api.apiKeyList
}))(createForm()(APIDetail));
