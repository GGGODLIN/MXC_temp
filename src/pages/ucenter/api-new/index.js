import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import TopBar from '@/components/TopBar';
import { createForm } from 'rc-form';
import { InputItem, Flex, Toast, WingBlank, WhiteSpace, Button, Modal, Checkbox } from 'antd-mobile';
import { apiKeyHandle, getAvailableSymbols, getApiKeyPermission } from '@/services/api';
import { ipWhiteListReg } from '@/utils/regExp';
import SecureCheck from '@/components/SecureCheck';
import classNames from 'classnames';

import styles from './index.less';
import commonStyles from '../common.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const permissionTitleMap = {
  COMMON: {
    text: formatMessage({ id: 'ucenter.api.type.base' }),
    sort: 1
  },
  SPOT: {
    text: formatMessage({ id: 'ucenter.api.type.normal' }),
    sort: 2
  },
  MARGIN: {
    text: formatMessage({ id: 'ucenter.api.type.margin' }),
    sort: 3
  },
  ISOLATED_MARGIN: {
    text: formatMessage({ id: 'ucenter.api.type.margin.step' }),
    sort: 4
  },
  CONTRACT: {
    text: formatMessage({ id: 'layout.title.tabbar.contract' }),
    sort: 5
  }
};

/**
 * 对原始数据进行分组，如不明白直接看返回值
 * @param permissions
 * @returns {SPOT: {ACCOUNT: {groupName: '帐号', list: [{permissionDesc: '读取现货帐号信息': value: 'SPOT_ACCOUNT_R'}]}, ...}, ...}
 */
function apiKeyPermissionGrouping(permissions) {
  const apiKeyPermissionGrouped = {};

  if (!Array.isArray(permissions)) {
    return apiKeyPermissionGrouped;
  }

  // 以apiCategory为key进行第一次分组
  const permissionsGroupedByCategory = {};
  permissions.forEach(permission => {
    const key = permission.apiCategory || 'COMMON';

    if (permissionsGroupedByCategory[key]) {
      permissionsGroupedByCategory[key].push(permission);
    } else {
      permissionsGroupedByCategory[key] = [permission];
    }
  });

  Object.keys(permissionsGroupedByCategory).forEach(apiCategory => {
    let permissionsGroupedByOptionCategory = {};

    // 每组数据中，再以optionCategory为key进行第二次分组
    permissionsGroupedByCategory[apiCategory].forEach(permission => {
      const optionCategory = permission.permissionCategory;

      const valueArray =
        apiCategory === 'COMMON'
          ? [permission.permissionCategory, permission.permissionAccessType]
          : [permission.apiCategory, permission.permissionCategory, permission.permissionAccessType];
      const value = valueArray.join(permission.permissionSplitFlag);

      const option = {
        label: permission.permissionDesc.permissionDesc,
        value
      };
      if (permissionsGroupedByOptionCategory[optionCategory]) {
        permissionsGroupedByOptionCategory[optionCategory].list.push(option);
      } else {
        permissionsGroupedByOptionCategory[optionCategory] = {
          groupName: permission.permissionDesc.groupName,
          list: [option]
        };
      }
    });

    apiKeyPermissionGrouped[apiCategory] = permissionsGroupedByOptionCategory;
  });

  return apiKeyPermissionGrouped;
}

function APINew({
  apiKeyList,
  dispatch,
  location,
  form: { getFieldProps, isFieldTouched, getFieldError, validateFields, setFieldsValue }
}) {
  const { id } = location.query;
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [apiKeyPermissionGrouped, setApiKeyPermissionGrouped] = useState({});
  useEffect(() => {
    validateFields();

    getAvailableSymbols().then(result => {
      if (result && result.code === 0) {
        setAvailableSymbols(result.data);
      }
    });

    getApiKeyPermission().then(result => {
      let apiKeyPermissions = result || [];
      // web-373临时解决方案，前端隐藏现货修改账户信息
      apiKeyPermissions = apiKeyPermissions.filter(
        permission => `${permission.apiCategory}_${permission.permissionCategory}_${permission.permissionAccessType}` !== 'SPOT_ACCOUNT_W'
      );

      setApiKeyPermissionGrouped(apiKeyPermissionGrouping(apiKeyPermissions));
    });

    if (!apiKeyList && id) {
      dispatch({ type: 'api/getApiKeyList' });
    }
  }, []);

  const [currentApiKey, setCurrentApiKey] = useState(null);
  const [currentPermissionGrouped, setCurrentPermissionGrouped] = useState({});
  useEffect(() => {
    if (apiKeyList && id) {
      const findedResult = apiKeyList.find(apiKey => id === apiKey.id);
      setCurrentApiKey(findedResult);
      setFieldsValue({
        remark: findedResult ? findedResult.memo : undefined,
        ipAddress: findedResult ? findedResult.ipWhiteList : undefined
      });
      setCurrentPermissionGrouped(
        apiKeyPermissionGrouping(findedResult && findedResult.permissions.filter(permission => permission.isValid === 1))
      );
    }
  }, [apiKeyList]);

  const [showSecureCheckModal, setShowSecureCheckModal] = useState(false);
  const handleSubmit = useCallback(() => {
    setShowSecureCheckModal(true);
  }, []);

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmitAfter = useCallback(
    params => {
      validateFields(async (err, values) => {
        if (!err) {
          setSubmitLoading(true);

          // 选择的权限
          const permissions = {};
          Object.keys(apiKeyPermissionGrouped).forEach(apiCategory => {
            const categoryObject = apiKeyPermissionGrouped[apiCategory];
            Object.keys(categoryObject).forEach(optionCategory => {
              const key = apiCategory + optionCategory;
              if (values[key]) {
                values[key].forEach((checked, index) => {
                  if (checked) {
                    permissions[apiKeyPermissionGrouped[apiCategory][optionCategory].list[index].value] = 1;
                  }
                });
              }
            });
          });

          const nextParams = {
            smsCode: params.smsCode || '',
            emailCode: params.emailCode || '',
            google_auth_code: params.googleAuthCode || '',
            memo: values.remark.trim(),
            permission: JSON.stringify(permissions),
            ipWhiteList: values.ipAddress || '',
            apiKeyType: 'SPOT'
          };

          if (currentApiKey) {
            nextParams.apiKeyId = id;
          }
          let result = await apiKeyHandle(nextParams, currentApiKey ? 'update' : 'add');

          if (result && result.code === 0) {
            if (currentApiKey) {
              Toast.success(formatMessage({ id: 'ucenter.api.table.edit.success' }));
              setShowSecureCheckModal(false);
            } else {
              setSuccessModalVisible(true);
              setSuccessData(result.data);
            }
            dispatch({ type: 'api/getApiKeyList' });
          }

          setSubmitLoading(false);
        }
      });
    },
    [apiKeyPermissionGrouped, currentApiKey]
  );

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const onCopy = useCallback((text, result) => {
    if (result) {
      Toast.success(formatMessage({ id: 'common.copy_success' }), 2);
    }
  }, []);

  const [applyModalVisible, setApplyModalVisible] = useState(false);

  return (
    <>
      <TopBar>{id ? formatMessage({ id: 'ucenter.api.edit' }) : formatMessage({ id: 'ucenter.api.submit' })}</TopBar>
      <WingBlank>
        <div className={styles.form}>
          <div className={styles['permission-wrapper']}>
            {Object.keys(apiKeyPermissionGrouped)
              .sort((a, b) => {
                if (permissionTitleMap[a] && permissionTitleMap[b]) {
                  return permissionTitleMap[a].sort - permissionTitleMap[b].sort;
                }

                return 0;
              })
              .map(key => {
                const categoryObject = apiKeyPermissionGrouped[key];

                return (
                  <section className={styles.item} key={key}>
                    <h3 className={styles.subtitle}>{permissionTitleMap[key] ? permissionTitleMap[key].text : '--'}</h3>
                    <div className={classNames(styles.content, styles['content-permission'])}>
                      {Object.keys(categoryObject).map(optionCategory => {
                        const { groupName, list } = categoryObject[optionCategory];

                        return (
                          list.length > 0 && (
                            <div className={styles.permission}>
                              <span className={styles.name}>{groupName}：</span>
                              {list.map((permission, index) => (
                                <Checkbox
                                  key={permission.value}
                                  {...getFieldProps(`${key}${optionCategory}[${index}]`, {
                                    valuePropName: 'checked',
                                    initialValue:
                                      currentApiKey && currentPermissionGrouped[key] && currentPermissionGrouped[key][optionCategory]
                                        ? currentPermissionGrouped[key][optionCategory].list.some(
                                            havePermission => permission.value === havePermission.value
                                          )
                                        : undefined
                                  })}
                                >
                                  {permission.label}
                                </Checkbox>
                              ))}
                            </div>
                          )
                        );
                      })}
                    </div>
                  </section>
                );
              })}
          </div>

          <section className={styles.item}>
            <InputItem
              {...getFieldProps('remark', {
                // initialValue: currentApiKey ? currentApiKey.memo : undefined,
                rules: [{ required: true, whitespace: true, message: formatMessage({ id: 'ucenter.api.memo.require' }) }]
              })}
              placeholder={formatMessage({ id: 'ucenter.api.memo.require' })}
            />

            <p className={commonStyles.error}>
              {getFieldError('remark') && isFieldTouched('remark') ? getFieldError('remark').join(',') : ''}
            </p>
          </section>
          <section className={styles.item}>
            <InputItem
              {...getFieldProps('ipAddress', {
                // initialValue: currentApiKey ? currentApiKey.ipWhiteList : undefined,
                rules: [{ pattern: ipWhiteListReg, message: formatMessage({ id: 'ucenter.api.ip.error' }) }]
              })}
              placeholder={formatMessage({ id: 'ucenter.api.ip' })}
            />

            <p className={styles['ip-tip']}>{formatMessage({ id: 'ucenter.api.ip.tip' })}</p>
            <p className={classNames(commonStyles.error, styles.error)}>
              {getFieldError('ipAddress') && isFieldTouched('ipAddress') ? getFieldError('ipAddress').join(',') : ''}
            </p>
          </section>
        </div>

        <Button
          type="primary"
          disabled={getFieldError('remark') || getFieldError('ipAddress')}
          loading={submitLoading}
          onClick={handleSubmit}
        >
          {formatMessage({ id: 'common.yes' })}
        </Button>

        <div className={styles.tip}>
          <h3>{formatMessage({ id: 'ucenter.api.info.reminder' })}</h3>
          <p>
            {formatMessage({ id: 'ucenter.api.notice.1.1' })}
            <a href="https://mxcdevelop.github.io/APIDoc/" className={classNames(styles.em, styles.apiLink)} rel="noopener noreferrer">
              {formatMessage({ id: 'ucenter.api.notice.1.2' })}
            </a>
            {formatMessage({ id: 'ucenter.api.notice.1.3' })}
          </p>
          <p>
            {formatMessage({ id: 'ucenter.api.notice.2.1' })}
            <span className={classNames(styles.em, styles.apiLink)} onClick={() => setApplyModalVisible(true)}>
              {formatMessage({ id: 'ucenter.api.notice.2.2' })}
            </span>
            <div>{formatMessage({ id: 'ucenter.api.notice.2.3' })}</div>
          </p>
          <p className={styles.warning}>{formatMessage({ id: 'ucenter.api.notice.3.1' })}</p>
          <p>{formatMessage({ id: 'ucenter.api.notice.3.2' })}</p>
        </div>

        <WhiteSpace size="xl" />
      </WingBlank>

      <SecureCheck
        emailParams={{ type: 'OPEN_API' }}
        smsParams={{ type: 'OPEN_API' }}
        showSecureCheckModal={showSecureCheckModal}
        handleHideSecureCheckModal={() => setShowSecureCheckModal(false)}
        handleSubmitAfter={handleSubmitAfter}
      />

      <Modal
        style={{ width: '90%' }}
        transparent
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        title={formatMessage({ id: 'ucenter.api.create.success' })}
        afterClose={() => router.push('/ucenter/openapi')}
        footer={[{ text: formatMessage({ id: 'common.sure' }), onPress: () => setSuccessModalVisible(false) }]}
      >
        <div className={styles.success}>
          <p>Access Key</p>
          <InputItem
            value={successData && successData.accessKey}
            extra={
              <CopyToClipboard text={successData && successData.accessKey} onCopy={onCopy}>
                <a className={styles.copy}>{formatMessage({ id: 'common.copy' })}</a>
              </CopyToClipboard>
            }
          />

          <p>Secret Key</p>
          <InputItem
            value={successData && successData.privateSecret}
            extra={
              <CopyToClipboard text={successData && successData.privateSecret} onCopy={onCopy}>
                <a className={styles.copy}>{formatMessage({ id: 'common.copy' })}</a>
              </CopyToClipboard>
            }
          />
          <p className={styles.warning}>{formatMessage({ id: 'ucenter.api.create.success.show' })}</p>

          <p>{formatMessage({ id: 'ucenter.api.table.ip' })}</p>
          <InputItem
            value={successData && successData.ipWhiteList}
            extra={
              <CopyToClipboard text={successData && successData.ipWhiteList} onCopy={onCopy}>
                <a className={styles.copy}>{formatMessage({ id: 'common.copy' })}</a>
              </CopyToClipboard>
            }
          />
        </div>
      </Modal>

      <Modal popup animationType="slide-up" visible={applyModalVisible} onClose={() => setApplyModalVisible(false)}>
        <div className={styles.applyWrapper}>
          <Flex justify="between" className={styles.applyHeader}>
            <h4 className={styles.applyTitle}>{formatMessage({ id: 'mc_api_apply_currency' })}</h4>
            <span className={styles.applyClose} onClick={() => setApplyModalVisible(false)}>
              {formatMessage({ id: 'mc_safety_close' })}
            </span>
          </Flex>
          <div className={styles.applyContent}>{availableSymbols.join('、')}</div>
          <Button className={styles.applySure} type="primary" onClick={() => setApplyModalVisible(false)}>
            {formatMessage({ id: 'common.yes' })}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default connect(({ auth, api }) => ({
  user: auth.user,
  apiKeyList: api.apiKeyList
}))(createForm()(APINew));
